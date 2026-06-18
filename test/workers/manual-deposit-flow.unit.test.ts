import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";

import {
  type CreateFxQuoteInput,
  type CreateMintRequestInput,
  type MintFlowAuditLogInput,
  type MintRequestRecord,
} from "../../workers/mint-request-flow.js";
import {
  type CreateManualConfirmedDepositInput,
  type ManualDepositAuditLogInput,
  type ManualDepositRecord,
  type ManualDepositRepository,
  confirmManualDepositAndCreateMintRequest,
} from "../../workers/manual-deposit-flow.js";
import type { RiskAuditLogInput, RiskEventInput } from "../../workers/risk-engine.js";

class InMemoryManualDepositRepository implements ManualDepositRepository {
  dailyMintedUsdtAmount = "0";
  deposits: ManualDepositRecord[] = [];
  fxQuotes: CreateFxQuoteInput[] = [];
  mintRequests: MintRequestRecord[] = [];
  riskEvents: RiskEventInput[] = [];
  riskAuditLogs: RiskAuditLogInput[] = [];
  manualAuditLogs: ManualDepositAuditLogInput[] = [];
  mintAuditLogs: MintFlowAuditLogInput[] = [];

  constructor(private readonly walletWhitelisted = true) {}

  async getDailyMintedUsdtAmount() {
    return this.dailyMintedUsdtAmount;
  }

  async createRiskEvent(input: RiskEventInput) {
    this.riskEvents.push(input);
  }

  async createAuditLog(input: RiskAuditLogInput) {
    this.riskAuditLogs.push(input);
  }

  async findManualDepositByReference(manualReference: string) {
    return this.deposits.find((deposit) => deposit.manualReference === manualReference) ?? null;
  }

  async createManualConfirmedDeposit(input: CreateManualConfirmedDepositInput) {
    const deposit: ManualDepositRecord = {
      id: `manual_deposit_${this.deposits.length + 1}`,
      companyId: input.companyId,
      companyWalletId: input.companyWalletId,
      receivingAddress: "0x1000000000000000000000000000000000000001",
      manualReference: input.manualReference,
      company: {
        id: input.companyId,
        kybStatus: "APPROVED",
        status: "ACTIVE",
      },
      sourceWallet: {
        id: input.companyWalletId,
        companyId: input.companyId,
        isActive: true,
        whitelistStatus: this.walletWhitelisted ? "WHITELISTED" : "PENDING",
      },
      receivingWallet: {
        id: input.companyWalletId,
        companyId: input.companyId,
        isActive: true,
        whitelistStatus: this.walletWhitelisted ? "WHITELISTED" : "PENDING",
      },
      amount: input.amount,
      status: "CONFIRMED",
      hasMintRequest: false,
      hasMint: false,
    };
    this.deposits.push(deposit);
    return deposit;
  }

  async createManualDepositAuditLog(input: ManualDepositAuditLogInput) {
    this.manualAuditLogs.push(input);
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

  async markDepositMintRequested(depositId: string) {
    const deposit = this.deposits.find((item) => item.id === depositId);
    if (deposit !== undefined) {
      deposit.hasMintRequest = true;
      deposit.status = "MINT_REQUESTED";
    }
  }

  async approveMintRequest(): Promise<MintRequestRecord> {
    throw new Error("approveMintRequest is not used by manual deposit tests.");
  }

  async getMintRequest(): Promise<MintRequestRecord | null> {
    throw new Error("getMintRequest is not used by manual deposit tests.");
  }

  async markMinting() {
    throw new Error("markMinting is not used by manual deposit tests.");
  }

  async recordMintSubmitted() {
    throw new Error("recordMintSubmitted is not used by manual deposit tests.");
  }

  async recordMintFailure() {
    throw new Error("recordMintFailure is not used by manual deposit tests.");
  }

  async createMintAuditLog(input: MintFlowAuditLogInput) {
    this.mintAuditLogs.push(input);
  }
}

describe("confirmManualDepositAndCreateMintRequest", () => {
  let repository: InMemoryManualDepositRepository;

  beforeEach(() => {
    repository = new InMemoryManualDepositRepository();
  });

  it("creates a simulated confirmed deposit and pending mint request", async () => {
    const result = await confirmManualDepositAndCreateMintRequest({
      companyId: "company_1",
      companyWalletId: "wallet_1",
      manualReference: "SIM-DEP-001",
      amount: "500.000000",
      confirmedBy: "owner",
      fixedFxRate: "7.20000000",
      repository,
      now: new Date("2026-06-18T12:00:00.000Z"),
    });

    assert.equal(result.duplicate, false);
    assert.equal(result.deposit.status, "MINT_REQUESTED");
    assert.equal(result.mintRequestResult.created, true);
    assert.equal(repository.manualAuditLogs[0].action, "manual_deposit.confirmed");
    assert.equal(repository.manualAuditLogs[0].metadata?.simulatedOnly, true);
    assert.equal(repository.fxQuotes[0].rate, "7.20000000");
    assert.equal(repository.mintRequests[0].ormbAmount, "3600");
    assert.equal(repository.mintAuditLogs.at(-1)?.action, "mint_request.created");
  });

  it("is idempotent by manual reference", async () => {
    await confirmManualDepositAndCreateMintRequest(baseInput(repository));
    const second = await confirmManualDepositAndCreateMintRequest(baseInput(repository));

    assert.equal(second.duplicate, true);
    assert.equal(repository.deposits.length, 1);
    assert.equal(repository.mintRequests.length, 1);
    assert.equal(repository.manualAuditLogs.at(-1)?.action, "manual_deposit.skipped_existing");
    assert.equal(second.mintRequestResult.created, false);
    assert.equal(second.mintRequestResult.reason, "EXISTING_MINT_REQUEST");
  });

  it("rejects invalid manual amount values before creating records", async () => {
    await assert.rejects(
      () => confirmManualDepositAndCreateMintRequest(baseInput(repository, { amount: "0" })),
      /greater than zero/,
    );
    await assert.rejects(
      () => confirmManualDepositAndCreateMintRequest(baseInput(repository, { amount: "1.0000001" })),
      /up to 6 fractional digits/,
    );

    assert.equal(repository.deposits.length, 0);
  });

  it("records risk rejection without mint request when wallet is not whitelisted", async () => {
    repository = new InMemoryManualDepositRepository(false);

    const result = await confirmManualDepositAndCreateMintRequest(baseInput(repository));

    assert.equal(result.mintRequestResult.created, false);
    assert.equal(result.mintRequestResult.reason, "RISK_REJECTED");
    assert.deepEqual(result.mintRequestResult.failures, [
      "RECEIVING_WALLET_NOT_WHITELISTED",
    ]);
    assert.equal(repository.mintRequests.length, 0);
    assert.equal(repository.riskEvents.some((event) => event.code === "RECEIVING_WALLET_NOT_WHITELISTED"), true);
    assert.equal(repository.mintAuditLogs.at(-1)?.action, "mint_request.risk_rejected");
  });
});

function baseInput(
  repository: ManualDepositRepository,
  overrides: Partial<Parameters<typeof confirmManualDepositAndCreateMintRequest>[0]> = {},
): Parameters<typeof confirmManualDepositAndCreateMintRequest>[0] {
  return {
    companyId: "company_1",
    companyWalletId: "wallet_1",
    manualReference: "SIM-DEP-001",
    amount: "500",
    confirmedBy: "owner",
    fixedFxRate: "7.20000000",
    repository,
    now: new Date("2026-06-18T12:00:00.000Z"),
    ...overrides,
  };
}
