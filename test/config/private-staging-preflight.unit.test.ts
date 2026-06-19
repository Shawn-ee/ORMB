import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  formatPrivateStagingPreflightReport,
  runPrivateStagingPreflight,
} from "../../src/lib/config/private-staging-preflight.js";

const VALID_MINTER_KEY = "0x2222222222222222222222222222222222222222222222222222222222222222";
const VALID_BURNER_KEY = "0x3333333333333333333333333333333333333333333333333333333333333333";
const VALID_ORMB_ADDRESS = "0x1111111111111111111111111111111111111111";
const VALID_MOCK_USDT_ADDRESS = "0x2222222222222222222222222222222222222222";

function safeEnv(overrides: Record<string, string | undefined> = {}) {
  return {
    ORMB_ENV_MODE: "private-staging",
    PRIVATE_STAGING_MODE: "true",
    ORMB_READ_ONLY_DEMO_MODE: "false",
    HOSTED_DEMO_MODE: "false",
    MUTATIONS_DISABLED: "false",
    WORKERS_DISABLED: "true",
    DATABASE_URL: "postgresql://ormb_user:local-only-password@localhost:5432/ormb?schema=public",
    BASE_SEPOLIA_RPC_URL: "https://base-sepolia.example.test/rpc",
    BASE_SEPOLIA_CHAIN_ID: "84532",
    ORMB_CONTRACT_ADDRESS: VALID_ORMB_ADDRESS,
    MOCK_USDT_CONTRACT_ADDRESS: VALID_MOCK_USDT_ADDRESS,
    BASE_SEPOLIA_MINTER_PRIVATE_KEY: VALID_MINTER_KEY,
    BASE_SEPOLIA_BURNER_PRIVATE_KEY: VALID_BURNER_KEY,
    STAGING_BASIC_AUTH_USERNAME: "owner",
    STAGING_BASIC_AUTH_PASSWORD: "owner-private-staging-password",
    ...overrides,
  };
}

describe("runPrivateStagingPreflight", () => {
  it("passes with safe Base Sepolia private staging config", () => {
    const report = runPrivateStagingPreflight(safeEnv());

    assert.equal(report.ok, true);
    assert.equal(report.mode, "interactive-private-staging");
    assert.equal(report.safeSummary.chainId, "84532");
    assert.equal(report.safeSummary.minterPrivateKey, "present-redacted");
  });

  it("passes with contracts explicitly marked not yet deployed", () => {
    const report = runPrivateStagingPreflight(
      safeEnv({
        STAGING_CONTRACTS_NOT_YET_DEPLOYED: "true",
        ORMB_CONTRACT_ADDRESS: undefined,
        MOCK_USDT_CONTRACT_ADDRESS: undefined,
      }),
    );

    assert.equal(report.ok, true);
    assert.equal(report.safeSummary.ormbContractAddress, "not-yet-deployed");
    assert.match(formatPrivateStagingPreflightReport(report), /CONTRACTS_NOT_YET_DEPLOYED/);
  });

  it("fails on mainnet chain IDs", () => {
    const ethereumMainnet = runPrivateStagingPreflight(safeEnv({ BASE_SEPOLIA_CHAIN_ID: "1" }));
    const baseMainnet = runPrivateStagingPreflight(safeEnv({ BASE_SEPOLIA_CHAIN_ID: "8453" }));

    assert.equal(ethereumMainnet.ok, false);
    assert.equal(baseMainnet.ok, false);
    assert(ethereumMainnet.checks.some((check) => check.code === "MAINNET_CHAIN_ID"));
    assert(baseMainnet.checks.some((check) => check.code === "MAINNET_CHAIN_ID"));
  });

  it("fails on missing admin guard", () => {
    const report = runPrivateStagingPreflight(safeEnv({ STAGING_BASIC_AUTH_PASSWORD: undefined }));

    assert.equal(report.ok, false);
    assert(report.checks.some((check) => check.code === "ADMIN_GUARD_MISSING"));
  });

  it("fails on missing database URL", () => {
    const report = runPrivateStagingPreflight(safeEnv({ DATABASE_URL: undefined }));

    assert.equal(report.ok, false);
    assert(report.checks.some((check) => check.code === "DATABASE_URL_MISSING"));
  });

  it("fails on hosted demo mode combined with interactive staging", () => {
    const report = runPrivateStagingPreflight(safeEnv({ HOSTED_DEMO_MODE: "true" }));

    assert.equal(report.ok, false);
    assert(report.checks.some((check) => check.code === "HOSTED_DEMO_MODE_CONFLICT"));
  });

  it("does not print secret values", () => {
    const report = runPrivateStagingPreflight(safeEnv());
    const formatted = formatPrivateStagingPreflightReport(report);

    assert.doesNotMatch(formatted, new RegExp(VALID_MINTER_KEY));
    assert.doesNotMatch(formatted, /owner-private-staging-password/);
    assert.doesNotMatch(formatted, /local-only-password/);
    assert.match(formatted, /present-redacted/);
  });
});
