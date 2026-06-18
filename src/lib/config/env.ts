export type OrmbEnvironmentMode = "local" | "testnet-script" | "hosted-demo";

export type OrmbEnvironmentConfig = {
  mode: OrmbEnvironmentMode;
  databaseUrl?: string;
  baseSepoliaRpcUrl?: string;
  baseSepoliaDeployerPrivateKey?: `0x${string}`;
  confirmTestnetDeploy: boolean;
  readOnlyDemoMode: boolean;
};

export type EnvSource = Record<string, string | undefined>;

const ZERO_PRIVATE_KEY = `0x${"0".repeat(64)}` as const;

export function parseOrmbEnvironment(env: EnvSource = process.env): OrmbEnvironmentConfig {
  const mode = parseMode(env.ORMB_ENV_MODE);
  const config: OrmbEnvironmentConfig = {
    mode,
    databaseUrl: optionalNonEmpty(env.DATABASE_URL),
    baseSepoliaRpcUrl: optionalNonEmpty(env.BASE_SEPOLIA_RPC_URL),
    baseSepoliaDeployerPrivateKey: parseOptionalPrivateKey(env.BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY),
    confirmTestnetDeploy: env.ORMB_CONFIRM_TESTNET_DEPLOY === "YES",
    readOnlyDemoMode: env.ORMB_READ_ONLY_DEMO_MODE === "true",
  };

  validateMode(config);

  return config;
}

export function isPlaceholderPrivateKey(value: string | undefined): boolean {
  return value === undefined || value.trim() === "" || value === ZERO_PRIVATE_KEY;
}

function parseMode(value: string | undefined): OrmbEnvironmentMode {
  if (value === undefined || value.trim() === "") {
    return "local";
  }

  if (value === "local" || value === "testnet-script" || value === "hosted-demo") {
    return value;
  }

  throw new Error("ORMB_ENV_MODE must be one of: local, testnet-script, hosted-demo.");
}

function optionalNonEmpty(value: string | undefined): string | undefined {
  if (value === undefined || value.trim() === "") {
    return undefined;
  }

  return value;
}

function parseOptionalPrivateKey(value: string | undefined): `0x${string}` | undefined {
  if (value === undefined || value.trim() === "") {
    return undefined;
  }

  if (!/^0x[0-9a-fA-F]{64}$/.test(value)) {
    throw new Error("BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY must be a 32-byte 0x private key placeholder or testnet key.");
  }

  return value as `0x${string}`;
}

function validateMode(config: OrmbEnvironmentConfig) {
  if (config.mode === "local") {
    return;
  }

  if (config.mode === "hosted-demo") {
    if (!config.readOnlyDemoMode) {
      throw new Error("Hosted demo mode requires ORMB_READ_ONLY_DEMO_MODE=true.");
    }

    if (config.confirmTestnetDeploy) {
      throw new Error("Hosted demo mode must not enable ORMB_CONFIRM_TESTNET_DEPLOY=YES.");
    }

    if (!isPlaceholderPrivateKey(config.baseSepoliaDeployerPrivateKey)) {
      throw new Error("Hosted demo mode must not configure a deployer private key.");
    }

    return;
  }

  if (config.mode === "testnet-script") {
    if (config.baseSepoliaRpcUrl === undefined || config.baseSepoliaRpcUrl.includes("example.invalid")) {
      throw new Error("Testnet script mode requires a non-placeholder BASE_SEPOLIA_RPC_URL.");
    }

    if (isPlaceholderPrivateKey(config.baseSepoliaDeployerPrivateKey)) {
      throw new Error("Testnet script mode requires a non-placeholder Base Sepolia deployer key.");
    }

    if (!config.confirmTestnetDeploy) {
      throw new Error("Testnet script mode requires ORMB_CONFIRM_TESTNET_DEPLOY=YES.");
    }
  }
}
