import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  formatLiveMintBurnDryRunReport,
  runLiveMintBurnDryRun,
} from "../../src/lib/config/live-mint-burn-dry-run.js";

const PRIVATE_KEY = "0x1111111111111111111111111111111111111111111111111111111111111111";
const TX_HASH = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

function stagingEnv(overrides: Record<string, string | undefined> = {}) {
  return {
    ORMB_ENV_MODE: "private-staging",
    ORMB_READ_ONLY_DEMO_MODE: "false",
    STAGING_DRY_RUN_ONLY: "true",
    STAGING_DRY_RUN_FLOW: "mint-and-burn",
    BASE_SEPOLIA_CHAIN_ID: "84532",
    BASE_SEPOLIA_RPC_URL: "https://base-sepolia.example.test/rpc",
    ORMB_CONTRACT_ADDRESS: "0x1000000000000000000000000000000000000001",
    MINT_TO_ADDRESS: "0x2000000000000000000000000000000000000002",
    MINTER_ROLE_ADDRESS: "0x3000000000000000000000000000000000000003",
    BASE_SEPOLIA_MINTER_PRIVATE_KEY: PRIVATE_KEY,
    MINT_AMOUNT_ORMB: "25.5",
    BURN_FROM_ADDRESS: "0x2000000000000000000000000000000000000002",
    BASE_SEPOLIA_BURNER_PRIVATE_KEY: PRIVATE_KEY,
    BURN_AMOUNT_ORMB: "25.5",
    BURN_EVIDENCE_TX_HASH: TX_HASH,
    BURN_EVIDENCE_LOG_INDEX: "2",
    ...overrides,
  };
}

describe("runLiveMintBurnDryRun", () => {
  it("passes for safe Base Sepolia mint and burn dry-run intent", () => {
    const report = runLiveMintBurnDryRun(stagingEnv());

    assert.equal(report.ok, true);
    assert.equal(report.flow, "mint-and-burn");
    assert.equal(report.safeSummary.chainId, "84532");
    assert.equal(report.safeSummary.minterPrivateKey, "present-redacted");
    assert.equal(report.safeSummary.burnerPrivateKey, "present-redacted");
  });

  it("supports mint-only dry-run checks", () => {
    const report = runLiveMintBurnDryRun(
      stagingEnv({
        STAGING_DRY_RUN_FLOW: "mint",
        BURN_FROM_ADDRESS: undefined,
        BASE_SEPOLIA_BURNER_PRIVATE_KEY: undefined,
        BURN_AMOUNT_ORMB: undefined,
      }),
    );

    assert.equal(report.ok, true);
    assert.equal(report.flow, "mint");
  });

  it("fails closed for mainnet-like chain IDs", () => {
    const report = runLiveMintBurnDryRun(stagingEnv({ BASE_SEPOLIA_CHAIN_ID: "8453" }));

    assert.equal(report.ok, false);
    assert(report.checks.some((check) => check.code === "MAINNET_CHAIN_ID"));
  });

  it("fails closed without explicit dry-run-only mode", () => {
    const report = runLiveMintBurnDryRun(stagingEnv({ STAGING_DRY_RUN_ONLY: undefined }));

    assert.equal(report.ok, false);
    assert(report.checks.some((check) => check.code === "DRY_RUN_ONLY_REQUIRED"));
  });

  it("fails closed for malformed mint and burn inputs", () => {
    const report = runLiveMintBurnDryRun(
      stagingEnv({
        MINT_TO_ADDRESS: "0xabc",
        MINT_AMOUNT_ORMB: "0",
        BURN_AMOUNT_ORMB: "10.1234567",
        BURN_EVIDENCE_LOG_INDEX: "-1",
      }),
    );

    assert.equal(report.ok, false);
    assert(report.checks.some((check) => check.code === "MINT_TO_ADDRESS_INVALID"));
    assert(report.checks.some((check) => check.code === "MINT_AMOUNT_ORMB_ZERO"));
    assert(report.checks.some((check) => check.code === "BURN_AMOUNT_ORMB_INVALID"));
    assert(report.checks.some((check) => check.code === "BURN_EVIDENCE_LOG_INDEX_INVALID"));
  });

  it("does not print private keys or full transaction hashes", () => {
    const formatted = formatLiveMintBurnDryRunReport(runLiveMintBurnDryRun(stagingEnv()));

    assert.doesNotMatch(formatted, new RegExp(PRIVATE_KEY));
    assert.doesNotMatch(formatted, new RegExp(TX_HASH));
    assert.match(formatted, /present-redacted/);
  });
});
