export type DeployReadinessSeverity = "error" | "warning" | "info";

export type DeployReadinessCheck = {
  severity: DeployReadinessSeverity;
  code: string;
  message: string;
};

export type BaseSepoliaDeployReadinessReport = {
  ok: boolean;
  checks: DeployReadinessCheck[];
  safeSummary: Record<string, string>;
};

export type EnvSource = Record<string, string | undefined>;

const BASE_SEPOLIA_CHAIN_ID = "84532";
const ZERO_PRIVATE_KEY = `0x${"0".repeat(64)}`;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const MAINNET_LIKE_CHAIN_IDS = new Set(["1", "10", "56", "137", "8453", "42161", "43114", "59144"]);

export function runBaseSepoliaDeployReadiness(env: EnvSource): BaseSepoliaDeployReadinessReport {
  const checks: DeployReadinessCheck[] = [];
  const rpcUrl = env.BASE_SEPOLIA_RPC_URL;
  const chainId = env.BASE_SEPOLIA_CHAIN_ID;
  const deployerKey = env.BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY;
  const confirmDeploy = env.ORMB_CONFIRM_TESTNET_DEPLOY;
  const ormbAddress = env.ORMB_CONTRACT_ADDRESS;
  const mockUsdtAddress = env.MOCK_USDT_CONTRACT_ADDRESS;
  const contractsNotYetDeployed = readBoolean(env.STAGING_CONTRACTS_NOT_YET_DEPLOYED);

  if (confirmDeploy !== "YES") {
    checks.push(error("DEPLOY_CONFIRMATION_MISSING", "Set ORMB_CONFIRM_TESTNET_DEPLOY=YES immediately before running deploy scripts."));
  } else {
    checks.push(info("DEPLOY_CONFIRMATION_PRESENT", "Testnet deployment confirmation is present."));
  }

  if (chainId === undefined || chainId.trim() === "") {
    checks.push(error("CHAIN_ID_MISSING", "Set BASE_SEPOLIA_CHAIN_ID=84532."));
  } else if (MAINNET_LIKE_CHAIN_IDS.has(chainId)) {
    checks.push(error("MAINNET_CHAIN_ID", `Dangerous mainnet-like chain ID ${chainId} is not allowed.`));
  } else if (chainId !== BASE_SEPOLIA_CHAIN_ID) {
    checks.push(error("CHAIN_ID_NOT_BASE_SEPOLIA", "Contract deployment must target Base Sepolia chain ID 84532 only."));
  } else {
    checks.push(info("CHAIN_ID_OK", "Base Sepolia chain ID 84532 is configured."));
  }

  if (rpcUrl === undefined || rpcUrl.trim() === "") {
    checks.push(error("RPC_URL_MISSING", "Set BASE_SEPOLIA_RPC_URL to a Base Sepolia endpoint."));
  } else if (isPlaceholder(rpcUrl)) {
    checks.push(error("RPC_URL_PLACEHOLDER", "BASE_SEPOLIA_RPC_URL must be a non-placeholder Base Sepolia endpoint."));
  } else if (looksLikeMainnetRpc(rpcUrl)) {
    checks.push(error("RPC_URL_MAINNET_LIKE", "BASE_SEPOLIA_RPC_URL appears to target mainnet or production network naming."));
  } else {
    checks.push(info("RPC_URL_PRESENT", "BASE_SEPOLIA_RPC_URL is present and not printed."));
  }

  if (deployerKey === undefined || deployerKey.trim() === "" || deployerKey === ZERO_PRIVATE_KEY) {
    checks.push(error("DEPLOYER_KEY_MISSING", "Set BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY to a local-only testnet key."));
  } else if (!/^0x[0-9a-fA-F]{64}$/.test(deployerKey)) {
    checks.push(error("DEPLOYER_KEY_INVALID", "BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY must be a 32-byte 0x private key."));
  } else {
    checks.push(info("DEPLOYER_KEY_PRESENT", "BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY is present and not printed."));
  }

  if (contractsNotYetDeployed !== true) {
    checks.push(warning("CONTRACTS_NOT_MARKED_PENDING", "Set STAGING_CONTRACTS_NOT_YET_DEPLOYED=true before first deployment."));
  } else {
    checks.push(info("CONTRACTS_MARKED_PENDING", "Contracts are marked not yet deployed."));
  }

  if (isNonZeroAddress(ormbAddress) || isNonZeroAddress(mockUsdtAddress)) {
    checks.push(warning("CONTRACT_ADDRESSES_ALREADY_SET", "Contract addresses are already configured; confirm this is not a redeploy attempt."));
  }

  const ok = checks.every((check) => check.severity !== "error");
  return {
    ok,
    checks,
    safeSummary: {
      chainId: chainId ?? "missing",
      rpcUrl: rpcUrl === undefined || rpcUrl.trim() === "" ? "missing" : "present-redacted",
      deployerPrivateKey: deployerKey === undefined || deployerKey.trim() === "" ? "missing" : "present-redacted",
      deployConfirmation: confirmDeploy === "YES" ? "YES" : "missing",
      stagingContractsNotYetDeployed: contractsNotYetDeployed === true ? "true" : "not true",
      ormbContractAddress: summarizeAddress(ormbAddress),
      mockUsdtContractAddress: summarizeAddress(mockUsdtAddress),
    },
  };
}

export function formatBaseSepoliaDeployReadinessReport(report: BaseSepoliaDeployReadinessReport): string {
  return [
    `Base Sepolia deploy readiness: ${report.ok ? "PASS" : "FAIL"}`,
    "Safe summary:",
    ...Object.entries(report.safeSummary).map(([key, value]) => `- ${key}: ${value}`),
    "Checks:",
    ...report.checks.map((check) => `- ${check.severity.toUpperCase()} ${check.code}: ${redact(check.message)}`),
  ].join("\n");
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

function isPlaceholder(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return normalized === "" || normalized.includes("example.invalid") || normalized.includes("placeholder") || normalized.includes("change-me");
}

function looksLikeMainnetRpc(value: string): boolean {
  const normalized = value.toLowerCase();
  return normalized.includes("mainnet") || normalized.includes("chainid=1") || normalized.includes("chainid=8453");
}

function isNonZeroAddress(value: string | undefined): boolean {
  return value !== undefined && /^0x[0-9a-fA-F]{40}$/.test(value) && value !== ZERO_ADDRESS;
}

function summarizeAddress(value: string | undefined): string {
  if (value === undefined || value.trim() === "" || value === ZERO_ADDRESS) {
    return "not configured";
  }

  if (!/^0x[0-9a-fA-F]{40}$/.test(value)) {
    return "invalid-format";
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function redact(value: string): string {
  return value.replaceAll(/0x[0-9a-fA-F]{64}/g, "<redacted-private-key>");
}

function error(code: string, message: string): DeployReadinessCheck {
  return { severity: "error", code, message };
}

function warning(code: string, message: string): DeployReadinessCheck {
  return { severity: "warning", code, message };
}

function info(code: string, message: string): DeployReadinessCheck {
  return { severity: "info", code, message };
}
