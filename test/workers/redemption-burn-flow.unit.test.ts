import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";

import {
  type BurnEvent,
  type CreateRedemptionRequestInput,
  type RedemptionAuditLogInput,
  type RedemptionCompany,
  type RedemptionRecord,
  type RedemptionRepository,
  type RedemptionWallet,
  approveRedemptionRequest,
  createRedemptionRequest,
  simulateRedemptionPayout,
  verifyRedemptionBurn,
} from "../../workers/redemption-burn-flow.js";

const CHAIN_ID = 84532;
const COMPANY_ID = "company_1";
const WALLET_ID = "wallet_1";
const WALLET_ADDRESS = "0x1000000000000000000000000000000000000001";
const TX_HASH = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";

class InMemoryRedemptionRepository implements RedemptionRepository {
  redemptions: RedemptionRecord[] = [];
  auditLogs: RedemptionAuditLogInput[] = [];
  rejectionReasons: string[] = [];
  failureReasons: string[] = [];

  async createRedemptionRequest(input: CreateRedemptionRequestInput) {
    const redemption: RedemptionRecord = {
      id: `redemption_${this.redemptions.length + 1}`,
      companyId: input.company.id,
      companyWalletId: input.companyWallet.id,
      amount: input.amount,
      status: "REQUESTED",
    };
    this.redemptions.push(redemption);
    return redemption;
  }

  async rejectRedemptionRequest(input: {
    companyId: string;
    companyWalletId: string;
    amount: string;
    requestedBy: string;
    reason: string;
  }) {
    const redemption: RedemptionRecord = {
      id: `redemption_${this.redemptions.length + 1}`,
      companyId: input.companyId,
      companyWalletId: input.companyWalletId,
      amount: input.amount,
      status: "REJECTED",
    };
    this.rejectionReasons.push(input.reason);
    this.redemptions.push(redemption);
    return redemption;
  }

  async approveRedemptionRequest(id: string) {
    const redemption = this.requireRedemption(id);
    redemption.status = "BURN_PENDING";
    return redemption;
  }

  async getRedemption(id: string) {
    return this.redemptions.find((redemption) => redemption.id === id) ?? null;
  }

  async findRedemptionByBurnEvent(chainId: number, txHash: `0x${string}`, logIndex: number) {
    return (
      this.redemptions.find(
        (redemption) =>
          redemption.burnChainId === chainId &&
          redemption.burnTxHash === txHash &&
          redemption.burnLogIndex === logIndex,
      ) ?? null
    );
  }

  async markBurnVerified(input: {
    redemptionId: string;
    chainId: number;
    txHash: `0x${string}`;
    logIndex: number;
    verifiedAt: Date;
  }) {
    const redemption = this.requireRedemption(input.redemptionId);
    redemption.status = "BURN_VERIFIED";
    redemption.burnChainId = input.chainId;
    redemption.burnTxHash = input.txHash;
    redemption.burnLogIndex = input.logIndex;
    redemption.burnVerifiedAt = input.verifiedAt;
    return redemption;
  }

  async markBurnVerificationFailed(id: string, reason: string) {
    const redemption = this.requireRedemption(id);
    redemption.status = "FAILED";
    this.failureReasons.push(reason);
    return redemption;
  }

  async markPayoutSimulated(id: string, simulatedAt: Date) {
    const redemption = this.requireRedemption(id);
    redemption.status = "PAYOUT_SIMULATED";
    redemption.payoutSimulatedAt = simulatedAt;
    return redemption;
  }

  async completeRedemption(id: string) {
    const redemption = this.requireRedemption(id);
    redemption.status = "COMPLETED";
    return redemption;
  }

  async createRedemptionAuditLog(input: RedemptionAuditLogInput) {
    this.auditLogs.push(input);
  }

  private requireRedemption(id: string) {
    const redemption = this.redemptions.find((item) => item.id === id);

    if (redemption === undefined) {
      throw new Error(`Missing redemption ${id}`);
    }

    return redemption;
  }
}

describe("redemption burn flow", () => {
  let repository: InMemoryRedemptionRepository;

  beforeEach(() => {
    repository = new InMemoryRedemptionRepository();
  });

  it("creates a redemption request for an approved company and whitelisted wallet", async () => {
    const result = await createRedemptionRequest({
      company: company(),
      companyWallet: wallet(),
      amount: "250.5",
      requestedBy: "company-user@example.com",
      repository,
    });

    assert.equal(result.created, true);
    assert.equal(repository.redemptions[0].status, "REQUESTED");
    assert.equal(repository.redemptions[0].amount, "250.5");
    assert.equal(repository.auditLogs.at(-1)?.action, "redemption.requested");
  });

  it("rejects a redemption request for a non-whitelisted wallet", async () => {
    const result = await createRedemptionRequest({
      company: company(),
      companyWallet: wallet({ whitelistStatus: "REMOVED" }),
      amount: "250.5",
      requestedBy: "company-user@example.com",
      repository,
    });

    assert.equal(result.created, false);
    assert.equal(result.reason, "WALLET_NOT_WHITELISTED");
    assert.equal(repository.redemptions[0].status, "REJECTED");
    assert.equal(repository.rejectionReasons[0], "WALLET_NOT_WHITELISTED");
    assert.equal(repository.auditLogs.at(-1)?.action, "redemption.rejected");
  });

  it("requires manual approval before burn verification", async () => {
    const created = await createValidRedemption(repository);

    const result = await verifyRedemptionBurn({
      redemptionId: created.id,
      burnEvent: burnEvent(),
      expectedWallet: wallet(),
      repository,
    });

    assert.equal(result.verified, false);
    assert.equal(result.reason, "REDEMPTION_NOT_BURN_PENDING");
    assert.equal(repository.redemptions[0].status, "FAILED");
    assert.equal(repository.failureReasons[0], "REDEMPTION_NOT_BURN_PENDING");
  });

  it("approves a redemption request into burn-pending status", async () => {
    const created = await createValidRedemption(repository);
    const approved = await approveRedemptionRequest({
      redemptionId: created.id,
      approvedBy: "admin@example.com",
      repository,
    });

    assert.equal(approved.status, "BURN_PENDING");
    assert.equal(repository.auditLogs.at(-1)?.action, "redemption.approved");
  });

  it("verifies a matching burn event", async () => {
    const created = await createValidRedemption(repository);
    await approveRedemptionRequest({
      redemptionId: created.id,
      approvedBy: "admin@example.com",
      repository,
    });

    const result = await verifyRedemptionBurn({
      redemptionId: created.id,
      burnEvent: burnEvent(),
      expectedWallet: wallet(),
      repository,
    });

    assert.equal(result.verified, true);
    assert.equal(result.redemption.status, "BURN_VERIFIED");
    assert.equal(result.redemption.burnTxHash, TX_HASH);
    assert.equal(repository.auditLogs.at(-1)?.action, "redemption.burn_verified");
  });

  it("does not process a duplicate burn twice", async () => {
    const created = await createValidRedemption(repository);
    await approveRedemptionRequest({
      redemptionId: created.id,
      approvedBy: "admin@example.com",
      repository,
    });
    await verifyRedemptionBurn({
      redemptionId: created.id,
      burnEvent: burnEvent(),
      expectedWallet: wallet(),
      repository,
    });

    const duplicate = await verifyRedemptionBurn({
      redemptionId: created.id,
      burnEvent: burnEvent(),
      expectedWallet: wallet(),
      repository,
    });

    assert.equal(duplicate.verified, false);
    assert.equal(duplicate.reason, "BURN_ALREADY_VERIFIED");
    assert.equal(repository.auditLogs.at(-1)?.action, "redemption.burn_duplicate_skipped");
  });

  it("fails burn verification when amount does not match", async () => {
    const created = await createValidRedemption(repository);
    await approveRedemptionRequest({
      redemptionId: created.id,
      approvedBy: "admin@example.com",
      repository,
    });

    const result = await verifyRedemptionBurn({
      redemptionId: created.id,
      burnEvent: burnEvent({ amount: "249.5" }),
      expectedWallet: wallet(),
      repository,
    });

    assert.equal(result.verified, false);
    assert.equal(result.reason, "BURN_AMOUNT_MISMATCH");
    assert.equal(result.redemption.status, "FAILED");
    assert.equal(repository.auditLogs.at(-1)?.action, "redemption.burn_verification_failed");
  });

  it("simulates payout and completes only after burn verification", async () => {
    const created = await createValidRedemption(repository);
    const early = await simulateRedemptionPayout({
      redemptionId: created.id,
      repository,
    });
    assert.equal(early.simulated, false);
    assert.equal(early.reason, "BURN_NOT_VERIFIED");

    await approveRedemptionRequest({
      redemptionId: created.id,
      approvedBy: "admin@example.com",
      repository,
    });
    await verifyRedemptionBurn({
      redemptionId: created.id,
      burnEvent: burnEvent(),
      expectedWallet: wallet(),
      repository,
    });

    const completed = await simulateRedemptionPayout({
      redemptionId: created.id,
      repository,
    });

    assert.equal(completed.simulated, true);
    assert.equal(completed.redemption.status, "COMPLETED");
    assert.equal(repository.auditLogs.at(-1)?.action, "redemption.completed");
  });
});

async function createValidRedemption(repository: InMemoryRedemptionRepository) {
  const result = await createRedemptionRequest({
    company: company(),
    companyWallet: wallet(),
    amount: "250.5",
    requestedBy: "company-user@example.com",
    repository,
  });

  assert.equal(result.created, true);
  return result.redemption;
}

function company(overrides: Partial<RedemptionCompany> = {}): RedemptionCompany {
  return {
    id: COMPANY_ID,
    kybStatus: "APPROVED",
    status: "ACTIVE",
    ...overrides,
  };
}

function wallet(overrides: Partial<RedemptionWallet> = {}): RedemptionWallet {
  return {
    id: WALLET_ID,
    companyId: COMPANY_ID,
    chainId: CHAIN_ID,
    address: WALLET_ADDRESS,
    isActive: true,
    whitelistStatus: "WHITELISTED",
    ...overrides,
  };
}

function burnEvent(overrides: Partial<BurnEvent> = {}): BurnEvent {
  return {
    chainId: CHAIN_ID,
    txHash: TX_HASH,
    logIndex: 3,
    fromAddress: WALLET_ADDRESS,
    amount: "250.5",
    ...overrides,
  };
}
