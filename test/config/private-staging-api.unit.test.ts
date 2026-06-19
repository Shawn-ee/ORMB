import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { ApiError, requirePrivateStagingApi } from "../../src/lib/api/private-staging-api.js";

const ORIGINAL_ENV = { ...process.env };
const VALID_MINTER_KEY = "0x2222222222222222222222222222222222222222222222222222222222222222";
const VALID_BURNER_KEY = "0x3333333333333333333333333333333333333333333333333333333333333333";

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

function setPrivateStagingEnv(overrides: Record<string, string | undefined> = {}) {
  process.env = {
    ...ORIGINAL_ENV,
    ORMB_ENV_MODE: "private-staging",
    ORMB_READ_ONLY_DEMO_MODE: "false",
    BASE_SEPOLIA_RPC_URL: "https://base-sepolia.example.test/rpc",
    BASE_SEPOLIA_CHAIN_ID: "84532",
    ORMB_CONTRACT_ADDRESS: "0x1111111111111111111111111111111111111111",
    STAGING_BASIC_AUTH_USERNAME: "owner",
    STAGING_BASIC_AUTH_PASSWORD: "owner-private-staging-password",
    BASE_SEPOLIA_MINTER_PRIVATE_KEY: VALID_MINTER_KEY,
    BASE_SEPOLIA_BURNER_PRIVATE_KEY: VALID_BURNER_KEY,
    ...overrides,
  };
}

describe("requirePrivateStagingApi", () => {
  it("allows private staging mutation mode", () => {
    setPrivateStagingEnv();

    assert.doesNotThrow(() => requirePrivateStagingApi());
  });

  it("rejects non-private-staging modes", () => {
    process.env = { ...ORIGINAL_ENV, ORMB_ENV_MODE: "local" };

    assert.throws(() => requirePrivateStagingApi(), (error) => {
      assert(error instanceof ApiError);
      assert.equal(error.status, 403);
      assert.match(error.message, /disabled unless ORMB_ENV_MODE=private-staging/);
      return true;
    });
  });

  it("rejects read-only demo mode", () => {
    setPrivateStagingEnv({ ORMB_READ_ONLY_DEMO_MODE: "true" });

    assert.throws(() => requirePrivateStagingApi(), /read-only demo mode/);
  });
});
