import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";

import {
  type ConfirmableDeposit,
  type ConfirmationAuditLogInput,
  type ConfirmationWorkerRepository,
  type UpdateDepositConfirmationInput,
  calculateConfirmations,
  processDepositConfirmations,
} from "../../workers/confirmation-worker.js";

const CHAIN_ID = 84532;

class InMemoryConfirmationRepository implements ConfirmationWorkerRepository {
  deposits: ConfirmableDeposit[] = [];
  updates: UpdateDepositConfirmationInput[] = [];
  auditLogs: ConfirmationAuditLogInput[] = [];

  async findDepositsNeedingConfirmation(chainId: number) {
    return this.deposits.filter(
      (deposit) => deposit.chainId === chainId && deposit.status !== "CONFIRMED",
    );
  }

  async updateDepositConfirmation(input: UpdateDepositConfirmationInput) {
    this.updates.push(input);
    const deposit = this.deposits.find((item) => item.id === input.id);

    if (deposit !== undefined) {
      deposit.confirmations = input.confirmations;
      deposit.status = input.status;
    }
  }

  async createAuditLog(input: ConfirmationAuditLogInput) {
    this.auditLogs.push(input);
  }
}

describe("calculateConfirmations", () => {
  it("counts the deposit block as the first confirmation", () => {
    assert.equal(calculateConfirmations(100n, 100n), 1);
    assert.equal(calculateConfirmations(109n, 100n), 10);
  });

  it("returns zero if the current block is before the deposit block", () => {
    assert.equal(calculateConfirmations(99n, 100n), 0);
  });
});

describe("processDepositConfirmations", () => {
  let repository: InMemoryConfirmationRepository;

  beforeEach(() => {
    repository = new InMemoryConfirmationRepository();
  });

  it("moves detected deposits to confirming before the threshold", async () => {
    repository.deposits.push(deposit({ status: "DETECTED", confirmations: 0 }));

    const result = await processDepositConfirmations({
      chainId: CHAIN_ID,
      currentBlockNumber: 104n,
      requiredConfirmations: 10,
      repository,
    });

    assert.equal(result.movedToConfirming, 1);
    assert.equal(repository.updates[0].status, "CONFIRMING");
    assert.equal(repository.updates[0].confirmations, 5);
    assert.equal(repository.auditLogs[0].action, "deposit.confirming");
  });

  it("confirms deposits when the threshold is reached", async () => {
    const now = new Date("2026-06-18T00:00:00.000Z");
    repository.deposits.push(deposit({ status: "CONFIRMING", confirmations: 9 }));

    const result = await processDepositConfirmations({
      chainId: CHAIN_ID,
      currentBlockNumber: 109n,
      requiredConfirmations: 10,
      repository,
      now,
    });

    assert.equal(result.confirmed, 1);
    assert.equal(repository.updates[0].status, "CONFIRMED");
    assert.equal(repository.updates[0].confirmations, 10);
    assert.equal(repository.updates[0].confirmedAt, now);
    assert.equal(repository.auditLogs[0].action, "deposit.confirmed");
  });

  it("does not rewrite unchanged confirmation records", async () => {
    repository.deposits.push(deposit({ status: "CONFIRMING", confirmations: 5 }));

    const result = await processDepositConfirmations({
      chainId: CHAIN_ID,
      currentBlockNumber: 104n,
      requiredConfirmations: 10,
      repository,
    });

    assert.equal(result.unchanged, 1);
    assert.equal(repository.updates.length, 0);
    assert.equal(repository.auditLogs.length, 0);
  });

  it("rejects invalid confirmation thresholds", async () => {
    await assert.rejects(
      processDepositConfirmations({
        chainId: CHAIN_ID,
        currentBlockNumber: 104n,
        requiredConfirmations: 0,
        repository,
      }),
    );
  });
});

function deposit(overrides: Partial<ConfirmableDeposit>): ConfirmableDeposit {
  return {
    id: "deposit_1",
    companyId: "company_1",
    chainId: CHAIN_ID,
    txHash: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    logIndex: 0,
    blockNumber: 100n,
    confirmations: 0,
    status: "DETECTED",
    ...overrides,
  };
}
