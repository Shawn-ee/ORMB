export type OrmbEnvironmentMode = "local" | "testnet-script" | "hosted-demo" | "private-staging";

export type OrmbEnvironmentConfig = {
  mode: OrmbEnvironmentMode;
  databaseUrl?: string;
  baseSepoliaRpcUrl?: string;
  baseSepoliaChainId?: number;
  ormbContractAddress?: `0x${string}`;
  baseSepoliaDeployerPrivateKey?: `0x${string}`;
  baseSepoliaMinterPrivateKey?: `0x${string}`;
  baseSepoliaBurnerPrivateKey?: `0x${string}`;
  stagingBasicAuthUsername?: string;
  stagingBasicAuthPassword?: string;
  confirmTestnetDeploy: boolean;
  readOnlyDemoMode: boolean;
};

export type EnvSource = Record<string, string | undefined>;

const BASE_SEPOLIA_CHAIN_ID = 84532;
const ZERO_PRIVATE_KEY = `0x${"0".repeat(64)}` as const;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const MAINNET_LIKE_CHAIN_IDS = new Set([1, 10, 56, 137, 8453, 42161, 43114, 59144]);

export function parseOrmbEnvironment(env: EnvSource = process.env): OrmbEnvironmentConfig {
  const mode = parseMode(env.ORMB_ENV_MODE);
  const config: OrmbEnvironmentConfig = {
    mode,
    databaseUrl: optionalNonEmpty(env.DATABASE_URL),
    baseSepoliaRpcUrl: optionalNonEmpty(env.BASE_SEPOLIA_RPC_URL),
    baseSepoliaChainId: parseOptionalChainId(env.BASE_SEPOLIA_CHAIN_ID),
    ormbContractAddress: parseOptionalAddress(env.ORMB_CONTRACT_ADDRESS, "ORMB_CONTRACT_ADDRESS"),
    baseSepoliaDeployerPrivateKey: parseOptionalPrivateKey(
      env.BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY,
      "BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY",
    ),
    baseSepoliaMinterPrivateKey: parseOptionalPrivateKey(
      env.BASE_SEPOLIA_MINTER_PRIVATE_KEY,
      "BASE_SEPOLIA_MINTER_PRIVATE_KEY",
    ),
    baseSepoliaBurnerPrivateKey: parseOptionalPrivateKey(
      env.BASE_SEPOLIA_BURNER_PRIVATE_KEY,
      "BASE_SEPOLIA_BURNER_PRIVATE_KEY",
    ),
    stagingBasicAuthUsername: optionalNonEmpty(env.STAGING_BASIC_AUTH_USERNAME),
    stagingBasicAuthPassword: optionalNonEmpty(env.STAGING_BASIC_AUTH_PASSWORD),
    confirmTestnetDeploy: env.ORMB_CONFIRM_TESTNET_DEPLOY === "YES",
    readOnlyDemoMode: env.ORMB_READ_ONLY_DEMO_MODE === "true",
  };

  validateMode(config);

  return config;
}

export function isPlaceholderPrivateKey(value: string | undefined): boolean {
  return value === undefined || value.trim() === "" || value === ZERO_PRIVATE_KEY;
}

export function isPlaceholderAddress(value: string | undefined): boolean {
  return value === undefined || value.trim() === "" || value === ZERO_ADDRESS;
}

function parseMode(value: string | undefined): OrmbEnvironmentMode {
  if (value === undefined || value.trim() === "") {
    return "local";
  }

  if (value === "local" || value === "testnet-script" || value === "hosted-demo" || value === "private-staging") {
    return value;
  }

  throw new Error("ORMB_ENV_MODE must be one of: local, testnet-script, hosted-demo, private-staging.");
}

function optionalNonEmpty(value: string | undefined): string | undefined {
  if (value === undefined || value.trim() === "") {
    return undefined;
  }

  return value;
}

function parseOptionalChainId(value: string | undefined): number | undefined {
  if (value === undefined || value.trim() === "") {
    return undefined;
  }

  if (!/^\d+$/.test(value)) {
    throw new Error("BASE_SEPOLIA_CHAIN_ID must be a positive integer.");
  }

  return Number(value);
}

function parseOptionalAddress(value: string | undefined, name: string): `0x${string}` | undefined {
  if (value === undefined || value.trim() === "") {
    return undefined;
  }

  if (!/^0x[0-9a-fA-F]{40}$/.test(value)) {
    throw new Error(`${name} must be a valid 20-byte 0x address.`);
  }

  return value as `0x${string}`;
}

function parseOptionalPrivateKey(value: string | undefined, name: string): `0x${string}` | undefined {
  if (value === undefined || value.trim() === "") {
    return undefined;
  }

  if (!/^0x[0-9a-fA-F]{64}$/.test(value)) {
    throw new Error(`${name} must be a 32-byte 0x private key placeholder or testnet key.`);
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

    if (!isPlaceholderPrivateKey(config.baseSepoliaMinterPrivateKey)) {
      throw new Error("Hosted demo mode must not configure a minter private key.");
    }

    if (!isPlaceholderPrivateKey(config.baseSepoliaBurnerPrivateKey)) {
      throw new Error("Hosted demo mode must not configure a burner private key.");
    }

    return;
  }

  if (config.mode === "testnet-script") {
    if (isPlaceholderRpcUrl(config.baseSepoliaRpcUrl)) {
      throw new Error("Testnet script mode requires a non-placeholder BASE_SEPOLIA_RPC_URL.");
    }

    if (isPlaceholderPrivateKey(config.baseSepoliaDeployerPrivateKey)) {
      throw new Error("Testnet script mode requires a non-placeholder Base Sepolia deployer key.");
    }

    if (!config.confirmTestnetDeploy) {
      throw new Error("Testnet script mode requires ORMB_CONFIRM_TESTNET_DEPLOY=YES.");
    }
  }

  if (config.mode === "private-staging") {
    if (config.readOnlyDemoMode) {
      throw new Error("Private staging mode must not enable hosted read-only demo mode.");
    }

    if (isPlaceholderRpcUrl(config.baseSepoliaRpcUrl)) {
      throw new Error("Private staging mode requires a non-placeholder BASE_SEPOLIA_RPC_URL.");
    }

    if (config.baseSepoliaChainId === undefined) {
      throw new Error("Private staging mode requires BASE_SEPOLIA_CHAIN_ID=84532.");
    }

    if (MAINNET_LIKE_CHAIN_IDS.has(config.baseSepoliaChainId)) {
      throw new Error("Private staging mode rejects mainnet-like chain IDs; use Base Sepolia chain 84532 only.");
    }

    if (config.baseSepoliaChainId !== BASE_SEPOLIA_CHAIN_ID) {
      throw new Error("Private staging mode requires BASE_SEPOLIA_CHAIN_ID=84532.");
    }

    if (isPlaceholderAddress(config.ormbContractAddress)) {
      throw new Error("Private staging mode requires a non-placeholder ORMB_CONTRACT_ADDRESS.");
    }

    if (isPlaceholderCredential(config.stagingBasicAuthUsername)) {
      throw new Error("Private staging mode requires STAGING_BASIC_AUTH_USERNAME.");
    }

    if (isPlaceholderCredential(config.stagingBasicAuthPassword)) {
      throw new Error("Private staging mode requires STAGING_BASIC_AUTH_PASSWORD.");
    }

    if (isPlaceholderPrivateKey(config.baseSepoliaMinterPrivateKey)) {
      throw new Error("Private staging mode requires a non-placeholder Base Sepolia minter key.");
    }

    if (isPlaceholderPrivateKey(config.baseSepoliaBurnerPrivateKey)) {
      throw new Error("Private staging mode requires a non-placeholder Base Sepolia burner key.");
    }
  }
}

function isPlaceholderRpcUrl(value: string | undefined): boolean {
  return value === undefined || value.trim() === "" || value.includes("example.invalid");
}

function isPlaceholderCredential(value: string | undefined): boolean {
  if (value === undefined || value.trim() === "") {
    return true;
  }

  const normalized = value.trim().toLowerCase();
  return normalized.includes("change-me") || normalized.includes("placeholder") || normalized.includes("example");
}
