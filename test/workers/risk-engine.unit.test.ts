import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";

import {
  type RiskAuditLogInput,
  type RiskDeposit,
  type RiskEngineRepository,
  type RiskEventInput,
  evaluateMintRisk,
} from "../../workers/risk-engine.js";

class InMemoryRiskRepository implements RiskEngineRepository {
  dailyMintedUsdtAmount = "0";
  riskEvents: RiskEventInput[] = [];
  auditLogs: RiskAuditLogInput[] = [];

  async getDailyMintedUsdtAmount() {
    return this.dailyMintedUsdtAmount;
  }

  async createRiskEvent(input: RiskEventInput) {
    this.riskEvents.push(input);
  }

  async createAuditLog(input: RiskAuditLogInput) {
    this.auditLogs.push(input);
  }
}

describe("evaluateMintRisk", () => {
  let repository: InMemoryRiskRepository;

  beforeEach(() => {
    repository = new InMemoryRiskRepository();
  });

  it("passes when company, wallets, deposit state, duplicate, and limits are valid", async () => {
    const decision = await evaluateMintRisk({
      deposit: validDeposit(),
      autoMintLimitUsdt: "1000",
      dailyMintLimitUsdt: "5000",
      repository,
      now: new Date("2026-06-18T12:00:00.000Z"),
    });

    assert.equal(decision.eligible, true);
    assert.deepEqual(decision.failures, []);
    assert.equal(repository.riskEvents.length, 0);
    assert.equal(repository.auditLogs[0].action, "risk.mint_eligibility.passed");
  });

  it("fails when company KYB is not approved", async () => {
    const decision = await evaluateMintRisk({
      deposit: validDeposit({ company: { id: "company_1", kybStatus: "PENDING", status: "ACTIVE" } }),
      repository,
    });

    assert.equal(decision.eligible, false);
    assert.deepEqual(codes(decision), ["COMPANY_KYB_NOT_APPROVED"]);
    assert.equal(repository.riskEvents[0].code, "COMPANY_KYB_NOT_APPROVED");
  });

  it("fails when the source wallet is unknown", async () => {
    const decision = await evaluateMintRisk({
      deposit: validDeposit({ companyId: undefined, company: undefined, sourceWallet: undefined }),
      repository,
    });

    assert.equal(decision.eligible, false);
    assert.ok(codes(decision).includes("SOURCE_WALLET_UNKNOWN"));
    assert.ok(codes(decision).includes("COMPANY_MISSING"));
    assert.equal(repository.riskEvents.find((event) => event.code === "SOURCE_WALLET_UNKNOWN")?.severity, "HIGH");
  });

  it("fails when the source wallet is inactive or belongs to a different company", async () => {
    const decision = await evaluateMintRisk({
      deposit: validDeposit({
        sourceWallet: {
          id: "wallet_source",
          companyId: "other_company",
          isActive: false,
          whitelistStatus: "WHITELISTED",
        },
      }),
      repository,
    });

    assert.deepEqual(codes(decision), ["SOURCE_WALLET_INACTIVE", "SOURCE_WALLET_COMPANY_MISMATCH"]);
  });

  it("fails when the receiving wallet is inactive, not whitelisted, or mismatched", async () => {
    const decision = await evaluateMintRisk({
      deposit: validDeposit({
        receivingWallet: {
          id: "wallet_receive",
          companyId: "other_company",
          isActive: false,
          whitelistStatus: "PENDING",
        },
      }),
      repository,
    });

    assert.deepEqual(codes(decision), [
      "RECEIVING_WALLET_INACTIVE",
      "RECEIVING_WALLET_NOT_WHITELISTED",
      "RECEIVING_WALLET_COMPANY_MISMATCH",
    ]);
  });

  it("fails when the deposit is not confirmed", async () => {
    const decision = await evaluateMintRisk({
      deposit: validDeposit({ status: "CONFIRMING" }),
      repository,
    });

    assert.deepEqual(codes(decision), ["DEPOSIT_NOT_CONFIRMED"]);
  });

  it("fails when a mint request or mint already exists", async () => {
    const decision = await evaluateMintRisk({
      deposit: validDeposit({ hasMintRequest: true, hasMint: true }),
      repository,
    });

    assert.deepEqual(codes(decision), ["DEPOSIT_ALREADY_HAS_MINT_REQUEST", "DEPOSIT_ALREADY_MINTED"]);
  });

  it("fails when the deposit exceeds the automatic mint limit", async () => {
    const decision = await evaluateMintRisk({
      deposit: validDeposit({ amount: "1000.000001" }),
      autoMintLimitUsdt: "1000",
      repository,
    });

    assert.deepEqual(codes(decision), ["DEPOSIT_EXCEEDS_AUTO_MINT_LIMIT"]);
  });

  it("allows an amount equal to the automatic mint limit", async () => {
    const decision = await evaluateMintRisk({
      deposit: validDeposit({ amount: "1000" }),
      autoMintLimitUsdt: "1000",
      repository,
    });

    assert.equal(decision.eligible, true);
  });

  it("fails when projected daily mint volume exceeds the configured limit", async () => {
    repository.dailyMintedUsdtAmount = "4500.25";

    const decision = await evaluateMintRisk({
      deposit: validDeposit({ amount: "500" }),
      dailyMintLimitUsdt: "5000",
      repository,
      now: new Date("2026-06-18T23:59:59.000Z"),
    });

    assert.deepEqual(codes(decision), ["DAILY_MINT_LIMIT_EXCEEDED"]);
    assert.equal(repository.auditLogs[0].action, "risk.mint_eligibility.failed");
  });
});

function validDeposit(overrides: Partial<RiskDeposit> = {}): RiskDeposit {
  return {
    id: "deposit_1",
    companyId: "company_1",
    company: {
      id: "company_1",
      kybStatus: "APPROVED",
      status: "ACTIVE",
    },
    sourceWallet: {
      id: "wallet_source",
      companyId: "company_1",
      isActive: true,
      whitelistStatus: "WHITELISTED",
    },
    receivingWallet: {
      id: "wallet_receive",
      companyId: "company_1",
      isActive: true,
      whitelistStatus: "WHITELISTED",
    },
    amount: "500",
    status: "CONFIRMED",
    hasMintRequest: false,
    hasMint: false,
    ...overrides,
  };
}

function codes(decision: Awaited<ReturnType<typeof evaluateMintRisk>>) {
  return decision.failures.map((failure) => failure.code);
}
