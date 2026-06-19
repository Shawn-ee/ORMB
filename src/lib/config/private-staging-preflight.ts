export type PreflightSeverity = "error" | "warning" | "info";

export type PreflightCheck = {
  severity: PreflightSeverity;
  code: string;
  message: string;
};

export type PrivateStagingPreflightReport = {
  ok: boolean;
  mode: "interactive-private-staging" | "not-private-staging";
  checks: PreflightCheck[];
  safeSummary: Record<string, string>;
};

export type EnvSource = Record<string, string | undefined>;

const BASE_SEPOLIA_CHAIN_ID = "84532";
const MAINNET_LIKE_CHAIN_IDS = new Set(["1", "10", "56", "137", "8453", "42161", "43114", "59144"]);
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const ZERO_PRIVATE_KEY = `0x${"0".repeat(64)}`;
const SECRET_KEYS = [
  "DATABASE_URL",
  "BASE_SEPOLIA_RPC_URL",
  "RPC_URL",
  "BASE_SEPOLIA_MINTER_PRIVATE_KEY",
  "MINTER_PRIVATE_KEY",
  "BASE_SEPOLIA_BURNER_PRIVATE_KEY",
  "STAGING_BASIC_AUTH_PASSWORD",
  "ADMIN_PASSWORD",
];

export function runPrivateStagingPreflight(env: EnvSource): PrivateStagingPreflightReport {
  const checks: PreflightCheck[] = [];
  const privateStagingMode = readBooleanAlias(env.PRIVATE_STAGING_MODE);
  const mode = env.ORMB_ENV_MODE;
  const interactive =
    privateStagingMode === true || mode === "private-staging"
      ? "interactive-private-staging"
      : "not-private-staging";
  const hostedDemoMode = readBooleanAlias(env.HOSTED_DEMO_MODE) ?? env.ORMB_READ_ONLY_DEMO_MODE === "true";
  const mutationsDisabled = readBooleanAlias(env.MUTATIONS_DISABLED);
  const workersDisabled = readBooleanAlias(env.WORKERS_DISABLED);
  const chainId = firstNonEmpty(env.CHAIN_ID, env.BASE_SEPOLIA_CHAIN_ID);
  const rpcUrl = firstNonEmpty(env.RPC_URL, env.BASE_SEPOLIA_RPC_URL);
  const databaseUrl = firstNonEmpty(env.DATABASE_URL);
  const ormbAddress = firstNonEmpty(env.ORMB_CONTRACT_ADDRESS);
  const mockUsdtAddress = firstNonEmpty(env.MOCK_USDT_CONTRACT_ADDRESS);
  const contractsNotYetDeployed = readBooleanAlias(env.STAGING_CONTRACTS_NOT_YET_DEPLOYED) === true;
  const minterPrivateKey = firstNonEmpty(env.MINTER_PRIVATE_KEY, env.BASE_SEPOLIA_MINTER_PRIVATE_KEY);
  const minterAddress = firstConfiguredAddress(env.BASE_SEPOLIA_MINTER_ADDRESS, env.MINTER_ROLE_ADDRESS);
  const adminPassword = firstNonEmpty(env.ADMIN_PASSWORD, env.STAGING_BASIC_AUTH_PASSWORD);
  const adminUsername = firstNonEmpty(env.STAGING_BASIC_AUTH_USERNAME);

  if (interactive === "not-private-staging") {
    checks.push(error("PRIVATE_STAGING_MODE_REQUIRED", "Set ORMB_ENV_MODE=private-staging or PRIVATE_STAGING_MODE=true."));
  } else {
    checks.push(info("PRIVATE_STAGING_MODE_OK", "Private staging mode is enabled."));
  }

  if (hostedDemoMode) {
    checks.push(error("HOSTED_DEMO_MODE_CONFLICT", "Hosted/read-only demo mode must not be enabled for interactive staging."));
  }

  if (mutationsDisabled === true) {
    checks.push(error("MUTATIONS_DISABLED_CONFLICT", "Interactive staging requires mutation actions; MUTATIONS_DISABLED must not be true."));
  } else if (mutationsDisabled === undefined) {
    checks.push(warning("MUTATIONS_FLAG_ABSENT", "MUTATIONS_DISABLED is not implemented by the app; preflight only reports this flag."));
  }

  if (workersDisabled === undefined) {
    checks.push(warning("WORKERS_FLAG_ABSENT", "WORKERS_DISABLED is not implemented by the app; live worker runners are not enabled yet."));
  } else if (workersDisabled === false) {
    checks.push(warning("WORKERS_ENABLED_UNSUPPORTED", "WORKERS_DISABLED=false was provided, but live worker runners are not enabled yet."));
  } else {
    checks.push(info("WORKERS_DISABLED_REPORTED", "WORKERS_DISABLED=true was provided; current staging still uses manual/scripted paths."));
  }

  if (chainId === undefined) {
    checks.push(error("CHAIN_ID_MISSING", "Set BASE_SEPOLIA_CHAIN_ID=84532 or CHAIN_ID=84532."));
  } else if (MAINNET_LIKE_CHAIN_IDS.has(chainId)) {
    checks.push(error("MAINNET_CHAIN_ID", `Dangerous mainnet-like chain ID ${chainId} is not allowed.`));
  } else if (chainId !== BASE_SEPOLIA_CHAIN_ID) {
    checks.push(error("CHAIN_ID_NOT_BASE_SEPOLIA", "Private staging must use Base Sepolia chain ID 84532 only."));
  } else {
    checks.push(info("CHAIN_ID_OK", "Base Sepolia chain ID 84532 is configured."));
  }

  if (rpcUrl === undefined) {
    checks.push(error("RPC_URL_MISSING", "Set BASE_SEPOLIA_RPC_URL or RPC_URL."));
  } else if (looksLikeMainnetRpc(rpcUrl)) {
    checks.push(error("RPC_URL_MAINNET_LIKE", "RPC URL appears to target mainnet or production network naming."));
  } else if (isPlaceholder(rpcUrl)) {
    checks.push(error("RPC_URL_PLACEHOLDER", "RPC URL must be a non-placeholder Base Sepolia endpoint before live staging."));
  } else {
    checks.push(info("RPC_URL_PRESENT", "RPC URL is present and not printed."));
  }

  if (databaseUrl === undefined) {
    checks.push(error("DATABASE_URL_MISSING", "DATABASE_URL is required for private staging."));
  } else if (isPlaceholder(databaseUrl)) {
    checks.push(error("DATABASE_URL_PLACEHOLDER", "DATABASE_URL must be a non-placeholder local or private staging database URL."));
  } else {
    checks.push(info("DATABASE_URL_PRESENT", "DATABASE_URL is present and not printed."));
  }

  if (contractsNotYetDeployed) {
    checks.push(warning("CONTRACTS_NOT_YET_DEPLOYED", "Contracts are explicitly marked not yet deployed; do not run live mint/burn."));
  } else {
    requireAddress(checks, "ORMB_CONTRACT_ADDRESS", ormbAddress, true);
    requireAddress(checks, "MOCK_USDT_CONTRACT_ADDRESS", mockUsdtAddress, false);
  }

  requirePrivateKey(checks, "MINTER_PRIVATE_KEY", minterPrivateKey);
  requireAddress(checks, "BASE_SEPOLIA_MINTER_ADDRESS", minterAddress, true);

  if (adminUsername === undefined) {
    checks.push(warning("ADMIN_USERNAME_MISSING", "STAGING_BASIC_AUTH_USERNAME is not set; password guard still must be configured."));
  }

  if (adminPassword === undefined || isPlaceholder(adminPassword)) {
    checks.push(error("ADMIN_GUARD_MISSING", "Set STAGING_BASIC_AUTH_PASSWORD or ADMIN_PASSWORD to a non-placeholder local secret."));
  } else {
    checks.push(info("ADMIN_GUARD_PRESENT", "Admin guard secret is present and not printed."));
  }

  const ok = checks.every((check) => check.severity !== "error");
  return {
    ok,
    mode: interactive,
    checks,
    safeSummary: {
      privateStaging: interactive === "interactive-private-staging" ? "enabled" : "disabled",
      hostedDemoMode: hostedDemoMode ? "enabled" : "disabled",
      mutationsDisabled: summarizeBoolean(mutationsDisabled),
      workersDisabled: summarizeBoolean(workersDisabled),
      chainId: chainId ?? "missing",
      rpcUrl: summarizeSecret(rpcUrl),
      databaseUrl: summarizeSecret(databaseUrl),
      ormbContractAddress: summarizeAddress(ormbAddress, contractsNotYetDeployed),
      mockUsdtContractAddress: summarizeAddress(mockUsdtAddress, contractsNotYetDeployed),
      baseSepoliaMinterAddress: summarizeAddress(minterAddress, false),
      minterPrivateKey: summarizeSecret(minterPrivateKey),
      adminGuardSecret: summarizeSecret(adminPassword),
    },
  };
}

export function formatPrivateStagingPreflightReport(report: PrivateStagingPreflightReport): string {
  const lines = [
    `Private staging preflight: ${report.ok ? "PASS" : "FAIL"}`,
    `Mode: ${report.mode}`,
    "Safe summary:",
    ...Object.entries(report.safeSummary).map(([key, value]) => `- ${key}: ${value}`),
    "Checks:",
    ...report.checks.map((check) => `- ${check.severity.toUpperCase()} ${check.code}: ${redact(check.message)}`),
  ];

  return redact(lines.join("\n"));
}

function requireAddress(checks: PreflightCheck[], name: string, value: string | undefined, required: boolean) {
  if (value === undefined || value === ZERO_ADDRESS) {
    checks.push(
      required
        ? error(`${name}_MISSING`, `${name} is required unless STAGING_CONTRACTS_NOT_YET_DEPLOYED=true.`)
        : warning(`${name}_MISSING`, `${name} is missing; required only for flows that inspect MockUSDT.`),
    );
    return;
  }

  if (!/^0x[0-9a-fA-F]{40}$/.test(value)) {
    checks.push(error(`${name}_INVALID`, `${name} must be a 20-byte 0x address.`));
    return;
  }

  checks.push(info(`${name}_PRESENT`, `${name} is present.`));
}

function requirePrivateKey(checks: PreflightCheck[], name: string, value: string | undefined) {
  if (value === undefined || value === ZERO_PRIVATE_KEY || isPlaceholder(value)) {
    checks.push(error(`${name}_MISSING`, `${name} is required as a local-only testnet key and will not be printed.`));
    return;
  }

  if (!/^0x[0-9a-fA-F]{64}$/.test(value)) {
    checks.push(error(`${name}_INVALID`, `${name} must be a 32-byte 0x private key.`));
    return;
  }

  checks.push(info(`${name}_PRESENT`, `${name} is present and not printed.`));
}

function readBooleanAlias(value: string | undefined): boolean | undefined {
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

function firstConfiguredAddress(...values: Array<string | undefined>): string | undefined {
  return values.find((value) => value !== undefined && value.trim() !== "" && value !== ZERO_ADDRESS && !isPlaceholder(value));
}

function looksLikeMainnetRpc(value: string): boolean {
  const normalized = value.toLowerCase();
  return (
    normalized.includes("mainnet") ||
    normalized.includes("base-mainnet") ||
    normalized.includes("ethereum-mainnet") ||
    normalized.includes("chainid=1") ||
    normalized.includes("chainid=8453")
  );
}

function isPlaceholder(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return (
    normalized === "" ||
    normalized.includes("example.invalid") ||
    normalized.includes("change-me") ||
    normalized.includes("placeholder") ||
    normalized === ZERO_PRIVATE_KEY ||
    normalized === ZERO_ADDRESS
  );
}

function summarizeBoolean(value: boolean | undefined): string {
  if (value === undefined) {
    return "not configured";
  }

  return value ? "true" : "false";
}

function summarizeSecret(value: string | undefined): string {
  return value === undefined ? "missing" : "present-redacted";
}

function summarizeAddress(value: string | undefined, contractsNotYetDeployed: boolean): string {
  if (contractsNotYetDeployed) {
    return "not-yet-deployed";
  }

  if (value === undefined || value === ZERO_ADDRESS) {
    return "missing";
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function redact(value: string): string {
  let redacted = value;
  for (const key of SECRET_KEYS) {
    redacted = redacted.replaceAll(new RegExp(`${key}=\\S+`, "g"), `${key}=<redacted>`);
  }

  redacted = redacted.replaceAll(/0x[0-9a-fA-F]{64}/g, "<redacted-private-key>");
  return redacted;
}

function error(code: string, message: string): PreflightCheck {
  return { severity: "error", code, message };
}

function warning(code: string, message: string): PreflightCheck {
  return { severity: "warning", code, message };
}

function info(code: string, message: string): PreflightCheck {
  return { severity: "info", code, message };
}
