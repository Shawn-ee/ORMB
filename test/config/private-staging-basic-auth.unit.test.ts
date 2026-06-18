import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { authorizePrivateStagingRequest } from "../../src/lib/auth/private-staging-basic-auth.js";

const ZERO_PRIVATE_KEY = "0x0000000000000000000000000000000000000000000000000000000000000000";
const VALID_MINTER_KEY = "0x2222222222222222222222222222222222222222222222222222222222222222";
const VALID_BURNER_KEY = "0x3333333333333333333333333333333333333333333333333333333333333333";
const VALID_ORMB_ADDRESS = "0x1111111111111111111111111111111111111111";

function headers(authorization?: string) {
  return {
    get(name: string) {
      return name.toLowerCase() === "authorization" ? authorization ?? null : null;
    },
  };
}

function basic(username: string, password: string) {
  return `Basic ${Buffer.from(`${username}:${password}`, "utf8").toString("base64")}`;
}

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

describe("authorizePrivateStagingRequest", () => {
  it("allows local mode without Basic Auth", () => {
    const result = authorizePrivateStagingRequest(headers(), {});

    assert.equal(result.allowed, true);
    assert.equal(result.privateStaging, false);
  });

  it("allows hosted demo mode without staging credentials", () => {
    const result = authorizePrivateStagingRequest(headers(), {
      ORMB_ENV_MODE: "hosted-demo",
      ORMB_READ_ONLY_DEMO_MODE: "true",
      BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY: ZERO_PRIVATE_KEY,
    });

    assert.equal(result.allowed, true);
    assert.equal(result.privateStaging, false);
  });

  it("requires Basic Auth in private staging mode", () => {
    const result = authorizePrivateStagingRequest(headers(), privateStagingEnv());

    assert.equal(result.allowed, false);
    assert.equal(result.privateStaging, true);
    assert.equal(result.status, 401);
  });

  it("rejects invalid private staging credentials", () => {
    const result = authorizePrivateStagingRequest(
      headers(basic("owner", "wrong-password")),
      privateStagingEnv(),
    );

    assert.equal(result.allowed, false);
    assert.equal(result.status, 401);
  });

  it("allows valid private staging credentials", () => {
    const result = authorizePrivateStagingRequest(
      headers(basic("owner", "owner-private-staging-password")),
      privateStagingEnv(),
    );

    assert.equal(result.allowed, true);
    assert.equal(result.privateStaging, true);
  });

  it("fails closed when private staging env validation fails", () => {
    assert.throws(
      () =>
        authorizePrivateStagingRequest(
          headers(basic("owner", "owner-private-staging-password")),
          privateStagingEnv({ BASE_SEPOLIA_CHAIN_ID: "8453" }),
        ),
      /mainnet-like chain IDs/,
    );
  });
});
