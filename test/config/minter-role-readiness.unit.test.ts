import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  formatMinterRoleReadinessReport,
  runMinterRoleReadiness,
} from "../../src/lib/config/minter-role-readiness.js";

const ADMIN_KEY = "0x1111111111111111111111111111111111111111111111111111111111111111";

function roleEnv(overrides: Record<string, string | undefined> = {}) {
  return {
    MINTER_ROLE_ACTION: "verify",
    BASE_SEPOLIA_CHAIN_ID: "84532",
    BASE_SEPOLIA_RPC_URL: "https://base-sepolia.example.test/rpc",
    BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY: ADMIN_KEY,
    ORMB_CONTRACT_ADDRESS: "0x1111111111111111111111111111111111111111",
    MINTER_ROLE_ADDRESS: "0x2222222222222222222222222222222222222222",
    ...overrides,
  };
}

describe("runMinterRoleReadiness", () => {
  it("passes for verify-only Base Sepolia role checks", () => {
    const report = runMinterRoleReadiness(roleEnv());

    assert.equal(report.ok, true);
    assert.equal(report.action, "verify");
    assert.equal(report.safeSummary.adminPrivateKey, "present-redacted");
  });

  it("requires confirmation for grant and revoke actions", () => {
    const grant = runMinterRoleReadiness(roleEnv({ MINTER_ROLE_ACTION: "grant" }));
    const revoke = runMinterRoleReadiness(roleEnv({ MINTER_ROLE_ACTION: "revoke" }));

    assert.equal(grant.ok, false);
    assert.equal(revoke.ok, false);
    assert(grant.checks.some((check) => check.code === "ROLE_CHANGE_CONFIRMATION_MISSING"));
    assert(revoke.checks.some((check) => check.code === "ROLE_CHANGE_CONFIRMATION_MISSING"));
  });

  it("passes grant when explicit testnet confirmation is present", () => {
    const report = runMinterRoleReadiness(
      roleEnv({ MINTER_ROLE_ACTION: "grant", ORMB_CONFIRM_TESTNET_DEPLOY: "YES" }),
    );

    assert.equal(report.ok, true);
  });

  it("fails closed for mainnet-like chain IDs", () => {
    const report = runMinterRoleReadiness(roleEnv({ BASE_SEPOLIA_CHAIN_ID: "1" }));

    assert.equal(report.ok, false);
    assert(report.checks.some((check) => check.code === "MAINNET_CHAIN_ID"));
  });

  it("fails when role addresses are missing", () => {
    const report = runMinterRoleReadiness(roleEnv({ MINTER_ROLE_ADDRESS: undefined }));

    assert.equal(report.ok, false);
    assert(report.checks.some((check) => check.code === "MINTER_ROLE_ADDRESS_MISSING"));
  });

  it("does not print admin private key", () => {
    const formatted = formatMinterRoleReadinessReport(runMinterRoleReadiness(roleEnv()));

    assert.doesNotMatch(formatted, new RegExp(ADMIN_KEY));
    assert.match(formatted, /present-redacted/);
  });
});
