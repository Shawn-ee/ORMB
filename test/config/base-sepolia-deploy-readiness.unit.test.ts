import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  formatBaseSepoliaDeployReadinessReport,
  runBaseSepoliaDeployReadiness,
} from "../../src/lib/config/base-sepolia-deploy-readiness.js";

const DEPLOYER_KEY = "0x1111111111111111111111111111111111111111111111111111111111111111";

function deployEnv(overrides: Record<string, string | undefined> = {}) {
  return {
    BASE_SEPOLIA_CHAIN_ID: "84532",
    BASE_SEPOLIA_RPC_URL: "https://base-sepolia.example.test/rpc",
    BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY: DEPLOYER_KEY,
    ORMB_CONFIRM_TESTNET_DEPLOY: "YES",
    STAGING_CONTRACTS_NOT_YET_DEPLOYED: "true",
    ORMB_CONTRACT_ADDRESS: "0x0000000000000000000000000000000000000000",
    MOCK_USDT_CONTRACT_ADDRESS: "0x0000000000000000000000000000000000000000",
    ...overrides,
  };
}

describe("runBaseSepoliaDeployReadiness", () => {
  it("passes for a Base Sepolia testnet deployment posture", () => {
    const report = runBaseSepoliaDeployReadiness(deployEnv());

    assert.equal(report.ok, true);
    assert.equal(report.safeSummary.chainId, "84532");
    assert.equal(report.safeSummary.rpcUrl, "present-redacted");
    assert.equal(report.safeSummary.deployerPrivateKey, "present-redacted");
  });

  it("fails closed for mainnet-like chain IDs", () => {
    const report = runBaseSepoliaDeployReadiness(deployEnv({ BASE_SEPOLIA_CHAIN_ID: "8453" }));

    assert.equal(report.ok, false);
    assert(report.checks.some((check) => check.code === "MAINNET_CHAIN_ID"));
  });

  it("fails closed without deploy confirmation", () => {
    const report = runBaseSepoliaDeployReadiness(deployEnv({ ORMB_CONFIRM_TESTNET_DEPLOY: "NO" }));

    assert.equal(report.ok, false);
    assert(report.checks.some((check) => check.code === "DEPLOY_CONFIRMATION_MISSING"));
  });

  it("fails closed for missing deployer key", () => {
    const report = runBaseSepoliaDeployReadiness(deployEnv({ BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY: undefined }));

    assert.equal(report.ok, false);
    assert(report.checks.some((check) => check.code === "DEPLOYER_KEY_MISSING"));
  });

  it("does not print deployer private key", () => {
    const formatted = formatBaseSepoliaDeployReadinessReport(runBaseSepoliaDeployReadiness(deployEnv()));

    assert.doesNotMatch(formatted, new RegExp(DEPLOYER_KEY));
    assert.match(formatted, /present-redacted/);
  });
});
