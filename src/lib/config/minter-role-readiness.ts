export type MinterRoleAction = "verify" | "grant" | "revoke";
export type MinterRoleSeverity = "error" | "warning" | "info";

export type MinterRoleCheck = {
  severity: MinterRoleSeverity;
  code: string;
  message: string;
};

export type MinterRoleReadinessReport = {
  ok: boolean;
  action?: MinterRoleAction;
  checks: MinterRoleCheck[];
  safeSummary: Record<string, string>;
};

export type EnvSource = Record<string, string | undefined>;

const BASE_SEPOLIA_CHAIN_ID = "84532";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const ZERO_PRIVATE_KEY = `0x${"0".repeat(64)}`;
const MAINNET_LIKE_CHAIN_IDS = new Set(["1", "10", "56", "137", "8453", "42161", "43114", "59144"]);

export function runMinterRoleReadiness(env: EnvSource): MinterRoleReadinessReport {
  const checks: MinterRoleCheck[] = [];
  const action = parseAction(env.MINTER_ROLE_ACTION, checks);
  const chainId = env.BASE_SEPOLIA_CHAIN_ID;
  const rpcUrl = env.BASE_SEPOLIA_RPC_URL;
  const adminKey = env.BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY;
  const ormbAddress = env.ORMB_CONTRACT_ADDRESS;
  const minterAddress = env.MINTER_ROLE_ADDRESS;
  const confirmation = env.ORMB_CONFIRM_TESTNET_DEPLOY;

  if (chainId === undefined || chainId.trim() === "") {
    checks.push(error("CHAIN_ID_MISSING", "Set BASE_SEPOLIA_CHAIN_ID=84532."));
  } else if (MAINNET_LIKE_CHAIN_IDS.has(chainId)) {
    checks.push(error("MAINNET_CHAIN_ID", `Dangerous mainnet-like chain ID ${chainId} is not allowed.`));
  } else if (chainId !== BASE_SEPOLIA_CHAIN_ID) {
    checks.push(error("CHAIN_ID_NOT_BASE_SEPOLIA", "Minter role tooling must target Base Sepolia chain ID 84532 only."));
  } else {
    checks.push(info("CHAIN_ID_OK", "Base Sepolia chain ID 84532 is configured."));
  }

  if (rpcUrl === undefined || rpcUrl.trim() === "") {
    checks.push(error("RPC_URL_MISSING", "Set BASE_SEPOLIA_RPC_URL to a Base Sepolia endpoint."));
  } else if (isPlaceholder(rpcUrl)) {
    checks.push(error("RPC_URL_PLACEHOLDER", "BASE_SEPOLIA_RPC_URL must be non-placeholder."));
  } else if (looksLikeMainnetRpc(rpcUrl)) {
    checks.push(error("RPC_URL_MAINNET_LIKE", "BASE_SEPOLIA_RPC_URL appears to target mainnet or production network naming."));
  } else {
    checks.push(info("RPC_URL_PRESENT", "BASE_SEPOLIA_RPC_URL is present and not printed."));
  }

  requirePrivateKey(checks, "BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY", adminKey);
  requireAddress(checks, "ORMB_CONTRACT_ADDRESS", ormbAddress);
  requireAddress(checks, "MINTER_ROLE_ADDRESS", minterAddress);

  if (action === "grant" || action === "revoke") {
    if (confirmation !== "YES") {
      checks.push(error("ROLE_CHANGE_CONFIRMATION_MISSING", "Set ORMB_CONFIRM_TESTNET_DEPLOY=YES immediately before grant/revoke."));
    } else {
      checks.push(info("ROLE_CHANGE_CONFIRMATION_PRESENT", "Explicit testnet role-change confirmation is present."));
    }
  } else if (confirmation === "YES") {
    checks.push(warning("VERIFY_WITH_CONFIRMATION", "ORMB_CONFIRM_TESTNET_DEPLOY=YES is not required for verify-only mode."));
  }

  const ok = checks.every((check) => check.severity !== "error");
  return {
    ok,
    action,
    checks,
    safeSummary: {
      action: action ?? "invalid",
      chainId: chainId ?? "missing",
      rpcUrl: summarizeSecret(rpcUrl),
      adminPrivateKey: summarizeSecret(adminKey),
      ormbContractAddress: summarizeAddress(ormbAddress),
      minterRoleAddress: summarizeAddress(minterAddress),
      confirmation: confirmation === "YES" ? "YES" : "missing",
    },
  };
}

export function formatMinterRoleReadinessReport(report: MinterRoleReadinessReport): string {
  return [
    `Minter role readiness: ${report.ok ? "PASS" : "FAIL"}`,
    "Safe summary:",
    ...Object.entries(report.safeSummary).map(([key, value]) => `- ${key}: ${value}`),
    "Checks:",
    ...report.checks.map((check) => `- ${check.severity.toUpperCase()} ${check.code}: ${redact(check.message)}`),
  ].join("\n");
}

function parseAction(value: string | undefined, checks: MinterRoleCheck[]): MinterRoleAction | undefined {
  if (value === "verify" || value === "grant" || value === "revoke") {
    checks.push(info("ACTION_OK", `Minter role action is ${value}.`));
    return value;
  }

  checks.push(error("ACTION_INVALID", "Set MINTER_ROLE_ACTION to verify, grant, or revoke."));
  return undefined;
}

function requireAddress(checks: MinterRoleCheck[], name: string, value: string | undefined) {
  if (value === undefined || value.trim() === "" || value === ZERO_ADDRESS) {
    checks.push(error(`${name}_MISSING`, `${name} must be a non-zero 20-byte 0x address.`));
    return;
  }

  if (!/^0x[0-9a-fA-F]{40}$/.test(value)) {
    checks.push(error(`${name}_INVALID`, `${name} must be a valid 20-byte 0x address.`));
    return;
  }

  checks.push(info(`${name}_PRESENT`, `${name} is present.`));
}

function requirePrivateKey(checks: MinterRoleCheck[], name: string, value: string | undefined) {
  if (value === undefined || value.trim() === "" || value === ZERO_PRIVATE_KEY || isPlaceholder(value)) {
    checks.push(error(`${name}_MISSING`, `${name} must be a local-only testnet admin key and will not be printed.`));
    return;
  }

  if (!/^0x[0-9a-fA-F]{64}$/.test(value)) {
    checks.push(error(`${name}_INVALID`, `${name} must be a 32-byte 0x private key.`));
    return;
  }

  checks.push(info(`${name}_PRESENT`, `${name} is present and not printed.`));
}

function looksLikeMainnetRpc(value: string): boolean {
  const normalized = value.toLowerCase();
  return normalized.includes("mainnet") || normalized.includes("chainid=1") || normalized.includes("chainid=8453");
}

function isPlaceholder(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return normalized === "" || normalized.includes("example.invalid") || normalized.includes("placeholder") || normalized.includes("change-me") || normalized === ZERO_PRIVATE_KEY;
}

function summarizeSecret(value: string | undefined): string {
  return value === undefined || value.trim() === "" ? "missing" : "present-redacted";
}

function summarizeAddress(value: string | undefined): string {
  if (value === undefined || value.trim() === "" || value === ZERO_ADDRESS) {
    return "missing";
  }

  if (!/^0x[0-9a-fA-F]{40}$/.test(value)) {
    return "invalid-format";
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function redact(value: string): string {
  return value.replaceAll(/0x[0-9a-fA-F]{64}/g, "<redacted-private-key>");
}

function error(code: string, message: string): MinterRoleCheck {
  return { severity: "error", code, message };
}

function warning(code: string, message: string): MinterRoleCheck {
  return { severity: "warning", code, message };
}

function info(code: string, message: string): MinterRoleCheck {
  return { severity: "info", code, message };
}
