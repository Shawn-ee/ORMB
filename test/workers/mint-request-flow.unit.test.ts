import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";

import {
  type CreateFxQuoteInput,
  type CreateMintRequestInput,
  type MintFlowAuditLogInput,
  type MintGateway,
  type MintRequestRecord,
  type MintRequestRepository,
  approveMintRequest,
  createMintRequestForDeposit,
  multiplyDecimal6ByRate,
  submitApprovedMintRequest,
} from "../../workers/mint-request-flow.js";
import { type RiskAuditLogInput, type RiskDeposit, type RiskEventInput } from "../../workers/risk-engine.js";

const CHAIN_ID = 84532;
const TX_HASH = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

class InMemoryMintRepository implements MintRequestRepository {
  dailyMintedUsdtAmount = "0";
  fxQuotes: CreateFxQuoteInput[] = [];
  mintRequests: MintRequestRecord[] = [];
  riskEvents: RiskEventInput[] = [];
  riskAuditLogs: RiskAuditLogInput[] = [];
  auditLogs: MintFlowAuditLogInput[] = [];
  mintFailures: string[] = [];
  depositMintRequested = false;

  async getDailyMintedUsdtAmount() {
    return this.dailyMintedUsdtAmount;
  }

  async createRiskEvent(input: RiskEventInput) {
    this.riskEvents.push(input);
  }

  async createAuditLog(input: RiskAuditLogInput) {
    this.riskAuditLogs.push(input);
  }

  async findMintRequestByDepositId(depositId: string) {
    return this.mintRequests.find((request) => request.depositId === depositId) ?? null;
  }

  async createFxQuote(input: CreateFxQuoteInput) {
    this.fxQuotes.push(input);
    return { id: `fx_${this.fxQuotes.length}` };
  }

  async createMintRequest(input: CreateMintRequestInput) {
    const mintRequest: MintRequestRecord = {
      id: `mint_request_${this.mintRequests.length + 1}`,
      companyId: input.companyId,
      companyWalletId: input.companyWalletId,
      depositId: input.depositId,
      status: "PENDING_APPROVAL",
      ormbAmount: input.ormbAmount,
      toAddress: "0x1000000000000000000000000000000000000001",
    };
    this.mintRequests.push(mintRequest);
    return mintRequest;
  }

  async markDepositMintRequested() {
    this.depositMintRequested = true;
  }

  async approveMintRequest(id: string) {
    const mintRequest = this.requireMintRequest(id);
    mintRequest.status = "APPROVED";
    return mintRequest;
  }

  async getMintRequest(id: string) {
    return this.mintRequests.find((request) => request.id === id) ?? null;
  }

  async markMinting(id: string) {
    this.requireMintRequest(id).status = "MINTING";
  }

  async recordMintSubmitted(input: {
    mintRequestId: string;
    chainId: number;
    txHash: `0x${string}`;
    toAddress: `0x${string}`;
    amount: string;
    submittedAt: Date;
  }) {
    const mintRequest = this.requireMintRequest(input.mintRequestId);
    mintRequest.status = "MINTED";
    mintRequest.mint = {
      id: `mint_${input.mintRequestId}`,
      txHash: input.txHash,
      status: "SUBMITTED",
    };
  }

  async recordMintFailure(id: string, errorMessage: string) {
    this.requireMintRequest(id).status = "FAILED";
    this.mintFailures.push(errorMessage);
  }

  async createMintAuditLog(input: MintFlowAuditLogInput) {
    this.auditLogs.push(input);
  }

  private requireMintRequest(id: string) {
    const mintRequest = this.mintRequests.find((request) => request.id === id);

    if (mintRequest === undefined) {
      throw new Error(`Missing mint request ${id}`);
    }

    return mintRequest;
  }
}

describe("multiplyDecimal6ByRate", () => {
  it("converts USDT amount to ORMB amount using fixed FX rate", () => {
    assert.equal(multiplyDecimal6ByRate("100.5", "7.20000000"), "723.6");
  });
});

describe("mint request flow", () => {
  let repository: InMemoryMintRepository;

  beforeEach(() => {
    repository = new InMemoryMintRepository();
  });

  it("creates a pending mint request from a risk-passing confirmed deposit", async () => {
    const result = await createMintRequestForDeposit({
      deposit: validDeposit(),
      fixedFxRate: "7.20000000",
      autoMintLimitUsdt: "1000",
      dailyMintLimitUsdt: "5000",
      repository,
    });

    assert.equal(result.created, true);
    assert.equal(repository.fxQuotes[0].rate, "7.20000000");
    assert.equal(repository.mintRequests[0].status, "PENDING_APPROVAL");
    assert.equal(repository.mintRequests[0].ormbAmount, "3600");
    assert.equal(repository.depositMintRequested, true);
    assert.equal(repository.auditLogs.at(-1)?.action, "mint_request.created");
  });

  it("does not create a duplicate mint request for the same deposit", async () => {
    await createMintRequestForDeposit({
      deposit: validDeposit(),
      fixedFxRate: "7.20000000",
      repository,
    });
    const result = await createMintRequestForDeposit({
      deposit: validDeposit(),
      fixedFxRate: "7.20000000",
      repository,
    });

    assert.equal(result.created, false);
    assert.equal(repository.mintRequests.length, 1);
    assert.equal(repository.auditLogs.at(-1)?.action, "mint.skipped_existing");
  });

  it("does not create a mint request when risk checks fail", async () => {
    const result = await createMintRequestForDeposit({
      deposit: validDeposit({ status: "CONFIRMING" }),
      fixedFxRate: "7.20000000",
      repository,
    });

    assert.equal(result.created, false);
    assert.equal(repository.mintRequests.length, 0);
    assert.equal(repository.riskEvents[0].code, "DEPOSIT_NOT_CONFIRMED");
    assert.equal(repository.auditLogs.at(-1)?.action, "mint_request.risk_rejected");
  });

  it("does not submit contract mint before manual approval", async () => {
    const created = await createMintRequestForDeposit({
      deposit: validDeposit(),
      fixedFxRate: "7.20000000",
      repository,
    });
    assert.equal(created.created, true);

    const gateway = mintGateway();
    const result = await submitApprovedMintRequest({
      mintRequestId: created.mintRequest.id,
      chainId: CHAIN_ID,
      repository,
      gateway,
    });

    assert.equal(result.submitted, false);
    assert.equal(result.reason, "NOT_APPROVED");
    assert.equal(gateway.calls, 0);
  });

  it("submits an approved mint request once", async () => {
    const created = await createMintRequestForDeposit({
      deposit: validDeposit(),
      fixedFxRate: "7.20000000",
      repository,
    });
    assert.equal(created.created, true);
    await approveMintRequest({
      mintRequestId: created.mintRequest.id,
      approvedBy: "admin@example.com",
      repository,
    });

    const gateway = mintGateway();
    const first = await submitApprovedMintRequest({
      mintRequestId: created.mintRequest.id,
      chainId: CHAIN_ID,
      repository,
      gateway,
    });
    const second = await submitApprovedMintRequest({
      mintRequestId: created.mintRequest.id,
      chainId: CHAIN_ID,
      repository,
      gateway,
    });

    assert.equal(first.submitted, true);
    assert.equal(first.txHash, TX_HASH);
    assert.equal(second.submitted, false);
    assert.equal(second.reason, "ALREADY_SUBMITTED");
    assert.equal(gateway.calls, 1);
  });

  it("records failed mint submission safely", async () => {
    const created = await createMintRequestForDeposit({
      deposit: validDeposit(),
      fixedFxRate: "7.20000000",
      repository,
    });
    assert.equal(created.created, true);
    await approveMintRequest({
      mintRequestId: created.mintRequest.id,
      approvedBy: "admin@example.com",
      repository,
    });

    const result = await submitApprovedMintRequest({
      mintRequestId: created.mintRequest.id,
      chainId: CHAIN_ID,
      repository,
      gateway: mintGateway(new Error("test mint failure")),
    });

    assert.equal(result.submitted, false);
    assert.equal(result.reason, "MINT_FAILED");
    assert.equal(repository.mintRequests[0].status, "FAILED");
    assert.equal(repository.mintFailures[0], "test mint failure");
    assert.equal(repository.auditLogs.at(-1)?.action, "mint.failed");
  });
});

function validDeposit(overrides: Partial<RiskDeposit> = {}): RiskDeposit & {
  companyId: string;
  companyWalletId: string;
  receivingAddress: `0x${string}`;
} {
  return {
    id: "deposit_1",
    companyId: "company_1",
    companyWalletId: "wallet_1",
    receivingAddress: "0x1000000000000000000000000000000000000001",
    company: {
      id: "company_1",
      kybStatus: "APPROVED",
      status: "ACTIVE",
    },
    sourceWallet: {
      id: "wallet_1",
      companyId: "company_1",
      isActive: true,
      whitelistStatus: "WHITELISTED",
    },
    receivingWallet: {
      id: "wallet_1",
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

function mintGateway(error?: Error): MintGateway & { calls: number } {
  return {
    calls: 0,
    async mint() {
      this.calls += 1;
      if (error !== undefined) {
        throw error;
      }
      return { txHash: TX_HASH };
    },
  };
}
