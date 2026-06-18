import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { summarizeStagingReconciliation } from "../../workers/staging-reconciliation.js";

describe("summarizeStagingReconciliation", () => {
  it("summarizes balanced private staging reconciliation inputs", () => {
    const summary = summarizeStagingReconciliation({
      manualDeposits: "750.5",
      mintedOrmB: "5403.6",
      burnedOrmB: "900",
      onChainSupply: "4503.6",
      simulatedReserve: "750.5",
    });

    assert.equal(summary.expectedSupply, "4503.6");
    assert.equal(summary.readyForOperatorReview, true);
    assert.deepEqual(summary.warnings, []);
  });

  it("flags supply and reserve mismatches", () => {
    const summary = summarizeStagingReconciliation({
      manualDeposits: "750.5",
      mintedOrmB: "5403.6",
      burnedOrmB: "900",
      onChainSupply: "4500",
      simulatedReserve: "700",
    });

    assert.equal(summary.readyForOperatorReview, false);
    assert.deepEqual(summary.warnings, ["SUPPLY_MISMATCH", "RESERVE_MISMATCH"]);
  });

  it("flags burns that exceed mints", () => {
    const summary = summarizeStagingReconciliation({
      manualDeposits: "1",
      mintedOrmB: "10",
      burnedOrmB: "11",
      onChainSupply: "0",
      simulatedReserve: "1",
    });

    assert.equal(summary.expectedSupply, "-1");
    assert.equal(summary.warnings.includes("BURNS_EXCEED_MINTS"), true);
  });

  it("rejects invalid decimal inputs", () => {
    assert.throws(
      () =>
        summarizeStagingReconciliation({
          manualDeposits: "1.0000001",
          mintedOrmB: "1",
          burnedOrmB: "0",
          onChainSupply: "1",
          simulatedReserve: "1",
        }),
      /up to 6 fractional digits/,
    );
  });
});
