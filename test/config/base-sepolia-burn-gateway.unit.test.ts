import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { validateBaseSepoliaBurnEvidence } from "../../src/lib/staging/base-sepolia-burn-gateway.js";
import { BASE_SEPOLIA_CHAIN_ID } from "../../src/lib/staging/base-sepolia-mint-gateway.js";
import type { BurnEvent, RedemptionWallet } from "../../workers/redemption-burn-flow.js";

const WALLET_ADDRESS = "0x1000000000000000000000000000000000000001";
const TX_HASH = "0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB";

describe("validateBaseSepoliaBurnEvidence", () => {
  it("normalizes valid Base Sepolia burn evidence", () => {
    const burnEvent = validateBaseSepoliaBurnEvidence({
      burnEvent: event(),
      expectedWallet: wallet(),
      expectedAmount: "250.500000",
    });

    assert.equal(burnEvent.chainId, BASE_SEPOLIA_CHAIN_ID);
    assert.equal(burnEvent.txHash, TX_HASH.toLowerCase());
    assert.equal(burnEvent.fromAddress, WALLET_ADDRESS.toLowerCase());
    assert.equal(burnEvent.amount, "250.5");
  });

  it("rejects non-Base-Sepolia burn evidence", () => {
    assert.throws(
      () =>
        validateBaseSepoliaBurnEvidence({
          burnEvent: event({ chainId: 8453 }),
          expectedWallet: wallet(),
          expectedAmount: "250.5",
        }),
      /Base Sepolia chain 84532/,
    );
  });

  it("rejects wallet mismatches", () => {
    assert.throws(
      () =>
        validateBaseSepoliaBurnEvidence({
          burnEvent: event({ fromAddress: "0x2000000000000000000000000000000000000002" }),
          expectedWallet: wallet(),
          expectedAmount: "250.5",
        }),
      /source wallet does not match/,
    );
  });

  it("rejects amount mismatches and invalid amount formats", () => {
    assert.throws(
      () =>
        validateBaseSepoliaBurnEvidence({
          burnEvent: event({ amount: "249.5" }),
          expectedWallet: wallet(),
          expectedAmount: "250.5",
        }),
      /amount does not match/,
    );

    assert.throws(
      () =>
        validateBaseSepoliaBurnEvidence({
          burnEvent: event({ amount: "250.1234567" }),
          expectedWallet: wallet(),
          expectedAmount: "250.5",
        }),
      /up to 6 fractional digits/,
    );
  });

  it("rejects malformed event identity", () => {
    assert.throws(
      () =>
        validateBaseSepoliaBurnEvidence({
          burnEvent: event({ txHash: "0xabc" as `0x${string}` }),
          expectedWallet: wallet(),
          expectedAmount: "250.5",
        }),
      /32-byte 0x hash/,
    );

    assert.throws(
      () =>
        validateBaseSepoliaBurnEvidence({
          burnEvent: event({ logIndex: -1 }),
          expectedWallet: wallet(),
          expectedAmount: "250.5",
        }),
      /non-negative safe integer/,
    );
  });
});

function wallet(overrides: Partial<RedemptionWallet> = {}): RedemptionWallet {
  return {
    id: "wallet_1",
    companyId: "company_1",
    chainId: BASE_SEPOLIA_CHAIN_ID,
    address: WALLET_ADDRESS,
    isActive: true,
    whitelistStatus: "WHITELISTED",
    ...overrides,
  };
}

function event(overrides: Partial<BurnEvent> = {}): BurnEvent {
  return {
    chainId: BASE_SEPOLIA_CHAIN_ID,
    txHash: TX_HASH,
    logIndex: 4,
    fromAddress: WALLET_ADDRESS,
    amount: "250.5",
    ...overrides,
  };
}
