import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isPlaceholderAddress, isPlaceholderPrivateKey, parseOrmbEnvironment } from "../../src/lib/config/env.js";

const ZERO_PRIVATE_KEY = "0x0000000000000000000000000000000000000000000000000000000000000000";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const VALID_DEPLOYER_KEY = "0x1111111111111111111111111111111111111111111111111111111111111111";
const VALID_MINTER_KEY = "0x2222222222222222222222222222222222222222222222222222222222222222";
const VALID_BURNER_KEY = "0x3333333333333333333333333333333333333333333333333333333333333333";
const VALID_ORMB_ADDRESS = "0x1111111111111111111111111111111111111111";

function privateStagingEnv(overrides: Record<string, string | undefined> = {}) {
  return {
    ORMB_ENV_MODE: "private-staging",
    BASE_SEPOLIA_RPC_URL: "https://base-sepolia.example.test/rpc",
    BASE_SEPOLIA_CHAIN_ID: "84532",
    ORMB_CONTRACT_ADDRESS: VALID_ORMB_ADDRESS,
    STAGING_BASIC_AUTH_USERNAME: "owner",
    STAGING_BASIC_AUTH_PASSWORD: "owner-private-staging-password",
    BASE_SEPOLIA_MINTER_PRIVATE_KEY: VALID_MINTER_KEY,
    BASE_SEPOLIA_BURNER_PRIVATE_KEY: VALID_BURNER_KEY,
    ...overrides,
  };
}

describe("parseOrmbEnvironment", () => {
  it("defaults to local mode without requiring secrets", () => {
    const config = parseOrmbEnvironment({});

    assert.equal(config.mode, "local");
    assert.equal(config.confirmTestnetDeploy, false);
    assert.equal(config.readOnlyDemoMode, false);
  });

  it("accepts hosted demo mode only when read-only and without deploy keys", () => {
    const config = parseOrmbEnvironment({
      ORMB_ENV_MODE: "hosted-demo",
      ORMB_READ_ONLY_DEMO_MODE: "true",
      BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY: ZERO_PRIVATE_KEY,
    });

    assert.equal(config.mode, "hosted-demo");
    assert.equal(config.readOnlyDemoMode, true);
  });

  it("accepts private staging mode with strict Base Sepolia staging values", () => {
    const config = parseOrmbEnvironment(privateStagingEnv());

    assert.equal(config.mode, "private-staging");
    assert.equal(config.baseSepoliaChainId, 84532);
    assert.equal(config.ormbContractAddress, VALID_ORMB_ADDRESS);
    assert.equal(config.baseSepoliaMinterPrivateKey, VALID_MINTER_KEY);
    assert.equal(config.baseSepoliaBurnerPrivateKey, VALID_BURNER_KEY);
    assert.equal(config.stagingBasicAuthUsername, "owner");
    assert.equal(config.stagingBasicAuthPassword, "owner-private-staging-password");
  });

  it("rejects hosted demo mode when testnet deploy confirmation is enabled", () => {
    assert.throws(
      () =>
        parseOrmbEnvironment({
          ORMB_ENV_MODE: "hosted-demo",
          ORMB_READ_ONLY_DEMO_MODE: "true",
          ORMB_CONFIRM_TESTNET_DEPLOY: "YES",
        }),
      /must not enable ORMB_CONFIRM_TESTNET_DEPLOY/,
    );
  });

  it("rejects hosted demo mode with minter or burner keys", () => {
    assert.throws(
      () =>
        parseOrmbEnvironment({
          ORMB_ENV_MODE: "hosted-demo",
          ORMB_READ_ONLY_DEMO_MODE: "true",
          BASE_SEPOLIA_MINTER_PRIVATE_KEY: VALID_MINTER_KEY,
        }),
      /must not configure a minter private key/,
    );

    assert.throws(
      () =>
        parseOrmbEnvironment({
          ORMB_ENV_MODE: "hosted-demo",
          ORMB_READ_ONLY_DEMO_MODE: "true",
          BASE_SEPOLIA_BURNER_PRIVATE_KEY: VALID_BURNER_KEY,
        }),
      /must not configure a burner private key/,
    );
  });

  it("rejects invalid deployer key format", () => {
    assert.throws(
      () =>
        parseOrmbEnvironment({
          ORMB_ENV_MODE: "hosted-demo",
          ORMB_READ_ONLY_DEMO_MODE: "true",
          BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY: "not-a-key",
        }),
      /must be a 32-byte 0x private key placeholder or testnet key/,
    );
  });

  it("keeps testnet script mode compatible with deployer-key script behavior", () => {
    const config = parseOrmbEnvironment({
      ORMB_ENV_MODE: "testnet-script",
      ORMB_CONFIRM_TESTNET_DEPLOY: "YES",
      BASE_SEPOLIA_RPC_URL: "https://base-sepolia.example.test/rpc",
      BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY: VALID_DEPLOYER_KEY,
    });

    assert.equal(config.mode, "testnet-script");
    assert.equal(config.baseSepoliaDeployerPrivateKey, VALID_DEPLOYER_KEY);
  });

  it("rejects testnet script mode with placeholder RPC or key", () => {
    assert.throws(
      () =>
        parseOrmbEnvironment({
          ORMB_ENV_MODE: "testnet-script",
          ORMB_CONFIRM_TESTNET_DEPLOY: "YES",
          BASE_SEPOLIA_RPC_URL: "https://base-sepolia.example.invalid",
          BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY: ZERO_PRIVATE_KEY,
        }),
      /non-placeholder BASE_SEPOLIA_RPC_URL/,
    );
  });

  it("rejects private staging mode with hosted read-only mode enabled", () => {
    assert.throws(
      () => parseOrmbEnvironment(privateStagingEnv({ ORMB_READ_ONLY_DEMO_MODE: "true" })),
      /must not enable hosted read-only demo mode/,
    );
  });

  it("rejects private staging mode with placeholder RPC", () => {
    assert.throws(
      () => parseOrmbEnvironment(privateStagingEnv({ BASE_SEPOLIA_RPC_URL: "https://base-sepolia.example.invalid" })),
      /non-placeholder BASE_SEPOLIA_RPC_URL/,
    );
  });

  it("rejects private staging mode with missing or invalid chain ID", () => {
    assert.throws(
      () => parseOrmbEnvironment(privateStagingEnv({ BASE_SEPOLIA_CHAIN_ID: undefined })),
      /BASE_SEPOLIA_CHAIN_ID=84532/,
    );

    assert.throws(
      () => parseOrmbEnvironment(privateStagingEnv({ BASE_SEPOLIA_CHAIN_ID: "base-sepolia" })),
      /must be a positive integer/,
    );

    assert.throws(
      () => parseOrmbEnvironment(privateStagingEnv({ BASE_SEPOLIA_CHAIN_ID: "11155111" })),
      /BASE_SEPOLIA_CHAIN_ID=84532/,
    );
  });

  it("rejects private staging mode with mainnet-like chain IDs", () => {
    assert.throws(
      () => parseOrmbEnvironment(privateStagingEnv({ BASE_SEPOLIA_CHAIN_ID: "1" })),
      /mainnet-like chain IDs/,
    );

    assert.throws(
      () => parseOrmbEnvironment(privateStagingEnv({ BASE_SEPOLIA_CHAIN_ID: "8453" })),
      /mainnet-like chain IDs/,
    );
  });

  it("rejects private staging mode without a non-placeholder ORMB contract address", () => {
    assert.throws(
      () => parseOrmbEnvironment(privateStagingEnv({ ORMB_CONTRACT_ADDRESS: undefined })),
      /non-placeholder ORMB_CONTRACT_ADDRESS/,
    );

    assert.throws(
      () => parseOrmbEnvironment(privateStagingEnv({ ORMB_CONTRACT_ADDRESS: ZERO_ADDRESS })),
      /non-placeholder ORMB_CONTRACT_ADDRESS/,
    );
  });

  it("rejects private staging mode without Basic Auth credentials", () => {
    assert.throws(
      () => parseOrmbEnvironment(privateStagingEnv({ STAGING_BASIC_AUTH_USERNAME: undefined })),
      /STAGING_BASIC_AUTH_USERNAME/,
    );

    assert.throws(
      () => parseOrmbEnvironment(privateStagingEnv({ STAGING_BASIC_AUTH_PASSWORD: undefined })),
      /STAGING_BASIC_AUTH_PASSWORD/,
    );
  });

  it("rejects private staging mode with placeholder minter or burner keys", () => {
    assert.throws(
      () => parseOrmbEnvironment(privateStagingEnv({ BASE_SEPOLIA_MINTER_PRIVATE_KEY: ZERO_PRIVATE_KEY })),
      /non-placeholder Base Sepolia minter key/,
    );

    assert.throws(
      () => parseOrmbEnvironment(privateStagingEnv({ BASE_SEPOLIA_BURNER_PRIVATE_KEY: ZERO_PRIVATE_KEY })),
      /non-placeholder Base Sepolia burner key/,
    );
  });

  it("rejects invalid mode values", () => {
    assert.throws(() => parseOrmbEnvironment({ ORMB_ENV_MODE: "production" }), /ORMB_ENV_MODE/);
  });
});

describe("isPlaceholderPrivateKey", () => {
  it("treats missing, blank, and zero keys as placeholders", () => {
    assert.equal(isPlaceholderPrivateKey(undefined), true);
    assert.equal(isPlaceholderPrivateKey(""), true);
    assert.equal(isPlaceholderPrivateKey(ZERO_PRIVATE_KEY), true);
  });
});

describe("isPlaceholderAddress", () => {
  it("treats missing, blank, and zero addresses as placeholders", () => {
    assert.equal(isPlaceholderAddress(undefined), true);
    assert.equal(isPlaceholderAddress(""), true);
    assert.equal(isPlaceholderAddress(ZERO_ADDRESS), true);
  });
});
