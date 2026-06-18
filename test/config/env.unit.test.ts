import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isPlaceholderPrivateKey, parseOrmbEnvironment } from "../../src/lib/config/env.js";

const ZERO_PRIVATE_KEY = "0x0000000000000000000000000000000000000000000000000000000000000000";

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
