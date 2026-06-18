import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  type DemoLedgerSnapshot,
  evaluateDemoLedgerInvariants,
} from "../../workers/ledger-invariants.js";

describe("evaluateDemoLedgerInvariants", () => {
  it("reconciles confirmed demo mints, verified burns, and on-chain supply", () => {
    const result = evaluateDemoLedgerInvariants(validSnapshot());

    assert.equal(result.valid, true);
    assert.deepEqual(result.failures, []);
    assert.equal(result.totals.confirmedMintedOrmB, "5403.6");
    assert.equal(result.totals.verifiedBurnedOrmB, "900");
    assert.equal(result.totals.expectedOnChainSupply, "4503.6");
  });

  it("rejects duplicate mint requests for one deposit", () => {
    const result = evaluateDemoLedgerInvariants({
      ...validSnapshot(),
      mintRequests: [
        ...validSnapshot().mintRequests,
        {
          id: "mint_request_duplicate",
          depositId: "deposit_811",
          status: "PENDING_APPROVAL",
          ormbAmount: "3600",
        },
      ],
    });

    assert.equal(result.valid, false);
    assert.equal(result.failures.some((failure) => failure.code === "DUPLICATE_MINT_REQUEST_FOR_DEPOSIT"), true);
  });

  it("rejects confirmed mints that do not match request amounts", () => {
    const snapshot = validSnapshot();
    snapshot.mints[0] = { ...snapshot.mints[0], amount: "3599.99" };

    const result = evaluateDemoLedgerInvariants(snapshot);

    assert.equal(result.valid, false);
    assert.equal(result.failures.some((failure) => failure.code === "MINT_AMOUNT_MISMATCH"), true);
    assert.equal(result.failures.some((failure) => failure.code === "MINT_REQUEST_AMOUNT_MISMATCH"), true);
  });

  it("rejects duplicate confirmed mints for one mint request", () => {
    const snapshot = validSnapshot();
    snapshot.mints.push({
      id: "mint_duplicate",
      mintRequestId: "mint_request_1042",
      status: "CONFIRMED",
      amount: "3600",
    });

    const result = evaluateDemoLedgerInvariants(snapshot);

    assert.equal(result.valid, false);
    assert.equal(result.failures.some((failure) => failure.code === "DUPLICATE_MINT_FOR_MINT_REQUEST"), true);
  });

  it("rejects minted requests without a confirmed mint record", () => {
    const snapshot = validSnapshot();
    snapshot.mints = snapshot.mints.filter((mint) => mint.mintRequestId !== "mint_request_1042");

    const result = evaluateDemoLedgerInvariants(snapshot);

    assert.equal(result.valid, false);
    assert.equal(
      result.failures.some((failure) => failure.code === "MINT_REQUEST_MARKED_MINTED_WITHOUT_CONFIRMED_MINT"),
      true,
    );
  });

  it("rejects duplicate verified burn events", () => {
    const snapshot = validSnapshot();
    snapshot.redemptions.push({
      id: "redemption_duplicate",
      status: "BURN_VERIFIED",
      amount: "100",
      burnChainId: 84532,
      burnTxHash: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      burnLogIndex: 7,
    });

    const result = evaluateDemoLedgerInvariants(snapshot);

    assert.equal(result.valid, false);
    assert.equal(result.failures.some((failure) => failure.code === "DUPLICATE_BURN_EVENT"), true);
  });

  it("rejects supply mismatch against supplied on-chain supply", () => {
    const result = evaluateDemoLedgerInvariants({
      ...validSnapshot(),
      onChainSupply: "4500",
    });

    assert.equal(result.valid, false);
    assert.equal(result.failures.some((failure) => failure.code === "ON_CHAIN_SUPPLY_MISMATCH"), true);
  });

  it("does not count rejected deposits, failed mints, or rejected redemptions", () => {
    const snapshot = validSnapshot();
    snapshot.deposits.push({ id: "deposit_unknown_wallet", status: "REJECTED", amount: "999" });
    snapshot.mints.push({
      id: "mint_failed",
      mintRequestId: "mint_request_1042",
      status: "FAILED",
      amount: "3600",
    });
    snapshot.mints.push({
      id: "mint_pending",
      mintRequestId: "mint_request_1042",
      status: "PENDING",
      amount: "3600",
    });
    snapshot.mints.push({
      id: "mint_submitted",
      mintRequestId: "mint_request_1042",
      status: "SUBMITTED",
      amount: "3600",
    });
    snapshot.redemptions.push({ id: "redemption_rejected", status: "REJECTED", amount: "999" });
    snapshot.redemptions.push({
      id: "redemption_failed",
      status: "FAILED",
      amount: "999",
      burnChainId: 84532,
      burnTxHash: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      burnLogIndex: 7,
    });

    const result = evaluateDemoLedgerInvariants(snapshot);

    assert.equal(result.valid, true);
    assert.equal(result.totals.expectedOnChainSupply, "4503.6");
  });
});

function validSnapshot(): DemoLedgerSnapshot {
  return {
    deposits: [
      { id: "deposit_811", status: "MINT_REQUESTED", amount: "500" },
      { id: "deposit_812", status: "MINT_REQUESTED", amount: "250.5" },
    ],
    mintRequests: [
      {
        id: "mint_request_1042",
        depositId: "deposit_811",
        status: "MINTED",
        ormbAmount: "3600",
      },
      {
        id: "mint_request_1043",
        depositId: "deposit_812",
        status: "MINTED",
        ormbAmount: "1803.6",
      },
    ],
    mints: [
      {
        id: "mint_1042",
        mintRequestId: "mint_request_1042",
        status: "CONFIRMED",
        amount: "3600",
      },
      {
        id: "mint_1043",
        mintRequestId: "mint_request_1043",
        status: "CONFIRMED",
        amount: "1803.6",
      },
    ],
    redemptions: [
      {
        id: "redemption_2017",
        status: "COMPLETED",
        amount: "900",
        burnChainId: 84532,
        burnTxHash: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        burnLogIndex: 7,
      },
    ],
    onChainSupply: "4503.6",
  };
}
