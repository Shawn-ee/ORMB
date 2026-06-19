export type LiveDryRunFlow = "mint" | "burn" | "mint-and-burn";
export type LiveDryRunSeverity = "error" | "warning" | "info";

export type LiveDryRunCheck = {
  severity: LiveDryRunSeverity;
  code: string;
  message: string;
};

export type LiveMintBurnDryRunReport = {
  ok: boolean;
  flow: LiveDryRunFlow;
  checks: LiveDryRunCheck[];
  safeSummary: Record<string, string>;
};

export type EnvSource = Record<string, string | undefined>;

const BASE_SEPOLIA_CHAIN_ID = "84532";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const ZERO_PRIVATE_KEY = `0x${"0".repeat(64)}`;
const MAINNET_LIKE_CHAIN_IDS = new Set(["1", "10", "56", "137", "8453", "42161", "43114", "59144"]);

export function runLiveMintBurnDryRun(env: EnvSource): LiveMintBurnDryRunReport {
  const checks: LiveDryRunCheck[] = [];
  const flow = parseFlow(env.STAGING_DRY_RUN_FLOW, checks);
  const chainId = firstNonEmpty(env.BASE_SEPOLIA_CHAIN_ID, env.CHAIN_ID);
  const rpcUrl = firstNonEmpty(env.BASE_SEPOLIA_RPC_URL, env.RPC_URL);
  const privateStaging = env.ORMB_ENV_MODE === "private-staging" || readBoolean(env.PRIVATE_STAGING_MODE) === true;
  const hostedDemo = env.ORMB_READ_ONLY_DEMO_MODE === "true" || readBoolean(env.HOSTED_DEMO_MODE) === true;
  const dryRunOnly = readBoolean(env.STAGING_DRY_RUN_ONLY);
  const ormbAddress = env.ORMB_CONTRACT_ADDRESS;
  const mintToAddress = env.MINT_TO_ADDRESS;
  const mintAmount = env.MINT_AMOUNT_ORMB;
  const minterAddress = firstNonEmpty(env.MINTER_ROLE_ADDRESS, env.MINT_TO_ADDRESS);
  const minterPrivateKey = firstNonEmpty(env.BASE_SEPOLIA_MINTER_PRIVATE_KEY, env.MINTER_PRIVATE_KEY);
  const burnFromAddress = firstNonEmpty(env.BURN_FROM_ADDRESS, env.BURN_WALLET_ADDRESS);
  const burnAmount = firstNonEmpty(env.BURN_AMOUNT_ORMB, env.REDEMPTION_AMOUNT_ORMB);
  const burnerPrivateKey = env.BASE_SEPOLIA_BURNER_PRIVATE_KEY;
  const burnEvidenceTxHash = env.BURN_EVIDENCE_TX_HASH;
  const burnEvidenceLogIndex = env.BURN_EVIDENCE_LOG_INDEX;

  if (!privateStaging) {
    checks.push(error("PRIVATE_STAGING_REQUIRED", "Set ORMB_ENV_MODE=private-staging before live staging dry-run checks."));
  } else {
    checks.push(info("PRIVATE_STAGING_OK", "Private staging mode is configured."));
  }

  if (hostedDemo) {
    checks.push(error("HOSTED_DEMO_CONFLICT", "Hosted/read-only demo mode must not be enabled for live staging dry-run checks."));
  }

  if (dryRunOnly !== true) {
    checks.push(error("DRY_RUN_ONLY_REQUIRED", "Set STAGING_DRY_RUN_ONLY=true to confirm this command must not send transactions."));
  } else {
    checks.push(info("DRY_RUN_ONLY_OK", "Dry-run-only mode is explicitly enabled."));
  }

  validateChainAndRpc(checks, chainId, rpcUrl);
  requireAddress(checks, "ORMB_CONTRACT_ADDRESS", ormbAddress);

  if (flow === "mint" || flow === "mint-and-burn") {
    requireAddress(checks, "MINT_TO_ADDRESS", mintToAddress);
    requireAddress(checks, "MINTER_ROLE_ADDRESS", minterAddress);
    requirePrivateKey(checks, "BASE_SEPOLIA_MINTER_PRIVATE_KEY", minterPrivateKey);
    requireDecimal6(checks, "MINT_AMOUNT_ORMB", mintAmount);
  }

  if (flow === "burn" || flow === "mint-and-burn") {
    requireAddress(checks, "BURN_FROM_ADDRESS", burnFromAddress);
    requirePrivateKey(checks, "BASE_SEPOLIA_BURNER_PRIVATE_KEY", burnerPrivateKey);
    requireDecimal6(checks, "BURN_AMOUNT_ORMB", burnAmount);
    validateOptionalBurnEvidence(checks, burnEvidenceTxHash, burnEvidenceLogIndex);
    checks.push(warning("BURN_EXECUTION_SCRIPT_MISSING", "No dedicated live burn execution script exists yet; this is readiness validation only."));
  }

  if (env.ORMB_CONFIRM_TESTNET_DEPLOY === "YES") {
    checks.push(warning("LIVE_CONFIRMATION_PRESENT", "ORMB_CONFIRM_TESTNET_DEPLOY=YES is not required for dry-run-only checks."));
  }

  const ok = checks.every((check) => check.severity !== "error");
  return {
    ok,
    flow,
    checks,
    safeSummary: {
      flow,
      privateStaging: privateStaging ? "enabled" : "disabled",
      hostedDemo: hostedDemo ? "enabled" : "disabled",
      dryRunOnly: dryRunOnly === true ? "true" : "missing",
      chainId: chainId ?? "missing",
      rpcUrl: summarizeSecret(rpcUrl),
      ormbContractAddress: summarizeAddress(ormbAddress),
      mintToAddress: summarizeAddress(mintToAddress),
      mintAmount: summarizeAmount(mintAmount),
      minterRoleAddress: summarizeAddress(minterAddress),
      minterPrivateKey: summarizeSecret(minterPrivateKey),
      burnFromAddress: summarizeAddress(burnFromAddress),
      burnAmount: summarizeAmount(burnAmount),
      burnerPrivateKey: summarizeSecret(burnerPrivateKey),
      burnEvidenceTxHash: summarizeTxHash(burnEvidenceTxHash),
      burnEvidenceLogIndex: burnEvidenceLogIndex ?? "not-provided",
    },
  };
}

export function formatLiveMintBurnDryRunReport(report: LiveMintBurnDryRunReport): string {
  return redact(
    [
      `Live mint/burn dry-run: ${report.ok ? "PASS" : "FAIL"}`,
      `Flow: ${report.flow}`,
      "Safe summary:",
      ...Object.entries(report.safeSummary).map(([key, value]) => `- ${key}: ${value}`),
      "Checks:",
      ...report.checks.map((check) => `- ${check.severity.toUpperCase()} ${check.code}: ${check.message}`),
    ].join("\n"),
  );
}

function parseFlow(value: string | undefined, checks: LiveDryRunCheck[]): LiveDryRunFlow {
  if (value === undefined || value.trim() === "") {
    checks.push(info("FLOW_DEFAULTED", "STAGING_DRY_RUN_FLOW not set; checking mint-and-burn readiness."));
    return "mint-and-burn";
  }

  if (value === "mint" || value === "burn" || value === "mint-and-burn") {
    checks.push(info("FLOW_OK", `Dry-run flow is ${value}.`));
    return value;
  }

  checks.push(error("FLOW_INVALID", "Set STAGING_DRY_RUN_FLOW to mint, burn, or mint-and-burn."));
  return "mint-and-burn";
}

function validateChainAndRpc(checks: LiveDryRunCheck[], chainId: string | undefined, rpcUrl: string | undefined) {
  if (chainId === undefined || chainId.trim() === "") {
    checks.push(error("CHAIN_ID_MISSING", "Set BASE_SEPOLIA_CHAIN_ID=84532."));
  } else if (MAINNET_LIKE_CHAIN_IDS.has(chainId)) {
    checks.push(error("MAINNET_CHAIN_ID", `Dangerous mainnet-like chain ID ${chainId} is not allowed.`));
  } else if (chainId !== BASE_SEPOLIA_CHAIN_ID) {
    checks.push(error("CHAIN_ID_NOT_BASE_SEPOLIA", "Live staging dry-run checks must target Base Sepolia chain ID 84532 only."));
  } else {
    checks.push(info("CHAIN_ID_OK", "Base Sepolia chain ID 84532 is configured."));
  }

  if (rpcUrl === undefined || rpcUrl.trim() === "") {
    checks.push(error("RPC_URL_MISSING", "Set BASE_SEPOLIA_RPC_URL to a Base Sepolia endpoint."));
  } else if (isPlaceholder(rpcUrl)) {
    checks.push(error("RPC_URL_PLACEHOLDER", "BASE_SEPOLIA_RPC_URL must be non-placeholder."));
  } else if (looksLikeMainnetRpc(rpcUrl)) {
    checks.push(error("RPC_URL_MAINNET_LIKE", "RPC URL appears to target mainnet or production network naming."));
  } else {
    checks.push(info("RPC_URL_PRESENT", "RPC URL is present and not printed."));
  }
}

function requireAddress(checks: LiveDryRunCheck[], name: string, value: string | undefined) {
  if (value === undefined || value.trim() === "" || value === ZERO_ADDRESS || isPlaceholder(value)) {
    checks.push(error(`${name}_MISSING`, `${name} must be a non-placeholder 20-byte 0x address.`));
    return;
  }

  if (!/^0x[0-9a-fA-F]{40}$/.test(value)) {
    checks.push(error(`${name}_INVALID`, `${name} must be a 20-byte 0x address.`));
    return;
  }

  checks.push(info(`${name}_PRESENT`, `${name} is present.`));
}

function requirePrivateKey(checks: LiveDryRunCheck[], name: string, value: string | undefined) {
  if (value === undefined || value.trim() === "" || value === ZERO_PRIVATE_KEY || isPlaceholder(value)) {
    checks.push(error(`${name}_MISSING`, `${name} must be a local-only Base Sepolia key and will not be printed.`));
    return;
  }

  if (!/^0x[0-9a-fA-F]{64}$/.test(value)) {
    checks.push(error(`${name}_INVALID`, `${name} must be a 32-byte 0x private key.`));
    return;
  }

  checks.push(info(`${name}_PRESENT`, `${name} is present and not printed.`));
}

function requireDecimal6(checks: LiveDryRunCheck[], name: string, value: string | undefined) {
  if (value === undefined || value.trim() === "") {
    checks.push(error(`${name}_MISSING`, `${name} is required.`));
    return;
  }

  if (!/^\d+(\.\d{1,6})?$/.test(value)) {
    checks.push(error(`${name}_INVALID`, `${name} must be a positive decimal with up to 6 fractional digits.`));
    return;
  }

  const [whole, fractional = ""] = value.split(".");
  const parsed = BigInt(whole) * 1_000_000n + BigInt(fractional.padEnd(6, "0"));
  if (parsed <= 0n) {
    checks.push(error(`${name}_ZERO`, `${name} must be greater than zero.`));
    return;
  }

  checks.push(info(`${name}_OK`, `${name} is a valid 6-decimal amount.`));
}

function validateOptionalBurnEvidence(checks: LiveDryRunCheck[], txHash: string | undefined, logIndex: string | undefined) {
  if ((txHash === undefined || txHash.trim() === "") && (logIndex === undefined || logIndex.trim() === "")) {
    checks.push(info("BURN_EVIDENCE_NOT_PROVIDED", "Burn evidence can be validated after a testnet burn exists."));
    return;
  }

  if (txHash === undefined || !/^0x[0-9a-fA-F]{64}$/.test(txHash)) {
    checks.push(error("BURN_EVIDENCE_TX_HASH_INVALID", "BURN_EVIDENCE_TX_HASH must be a 32-byte 0x hash when provided."));
  } else {
    checks.push(info("BURN_EVIDENCE_TX_HASH_OK", "Burn evidence transaction hash format is valid."));
  }

  if (logIndex === undefined || !/^\d+$/.test(logIndex) || !Number.isSafeInteger(Number(logIndex))) {
    checks.push(error("BURN_EVIDENCE_LOG_INDEX_INVALID", "BURN_EVIDENCE_LOG_INDEX must be a non-negative safe integer when provided."));
  } else {
    checks.push(info("BURN_EVIDENCE_LOG_INDEX_OK", "Burn evidence log index format is valid."));
  }
}

function readBoolean(value: string | undefined): boolean | undefined {
  if (value === undefined || value.trim() === "") {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "true" || normalized === "1" || normalized === "yes") {
    return true;
  }

  if (normalized === "false" || normalized === "0" || normalized === "no") {
    return false;
  }

  return undefined;
}

function firstNonEmpty(...values: Array<string | undefined>): string | undefined {
  return values.find((value) => value !== undefined && value.trim() !== "");
}

function looksLikeMainnetRpc(value: string): boolean {
  const normalized = value.toLowerCase();
  return normalized.includes("mainnet") || normalized.includes("base-mainnet") || normalized.includes("chainid=1") || normalized.includes("chainid=8453");
}

function isPlaceholder(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return normalized.includes("example.invalid") || normalized.includes("placeholder") || normalized.includes("change-me");
}

function summarizeSecret(value: string | undefined): string {
  return value === undefined || value.trim() === "" || isPlaceholder(value) ? "missing-or-placeholder" : "present-redacted";
}

function summarizeAddress(value: string | undefined): string {
  if (value === undefined || value.trim() === "" || value === ZERO_ADDRESS || isPlaceholder(value)) {
    return "missing";
  }

  if (!/^0x[0-9a-fA-F]{40}$/.test(value)) {
    return "invalid-format";
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function summarizeAmount(value: string | undefined): string {
  return value === undefined || value.trim() === "" ? "missing" : value;
}

function summarizeTxHash(value: string | undefined): string {
  if (value === undefined || value.trim() === "") {
    return "not-provided";
  }

  if (!/^0x[0-9a-fA-F]{64}$/.test(value)) {
    return "invalid-format";
  }

  return `${value.slice(0, 10)}...${value.slice(-6)}`;
}

function redact(value: string): string {
  return value.replaceAll(/0x[0-9a-fA-F]{64}/g, "<redacted-private-key-or-hash>");
}

function error(code: string, message: string): LiveDryRunCheck {
  return { severity: "error", code, message };
}

function warning(code: string, message: string): LiveDryRunCheck {
  return { severity: "warning", code, message };
}

function info(code: string, message: string): LiveDryRunCheck {
  return { severity: "info", code, message };
}
