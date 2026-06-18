import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { parseUnits } from "viem";

import {
  type CreateAuditLogInput,
  type CreateDepositInput,
  type DepositListenerRepository,
  type KnownCompanyWallet,
  type MockUsdtTransferLog,
  processMockUsdtTransferLogs,
} from "../../workers/deposit-listener.js";

const CHAIN_ID = 84532;
const TREASURY = "0x3000000000000000000000000000000000000003";
const MOCK_USDT = "0x4000000000000000000000000000000000000004";
const COMPANY_WALLET = "0x1000000000000000000000000000000000000001";
const UNKNOWN_WALLET = "0x9000000000000000000000000000000000000009";
const OTHER_TREASURY = "0x5000000000000000000000000000000000000005";

class InMemoryDepositRepository implements DepositListenerRepository {
  wallets: KnownCompanyWallet[] = [
    {
      id: "wallet_1",
      companyId: "company_1",
      chainId: CHAIN_ID,
      address: COMPANY_WALLET,
      isActive: true,
    },
  ];

  deposits: CreateDepositInput[] = [];
  auditLogs: CreateAuditLogInput[] = [];
  latestBlockNumber?: bigint;

  async findActiveCompanyWalletByAddress(chainId: number, address: `0x${string}`) {
    return (
      this.wallets.find(
        (wallet) =>
          wallet.chainId === chainId &&
          wallet.isActive &&
          wallet.address.toLowerCase() === address.toLowerCase(),
      ) ?? null
    );
  }

  async depositExists(chainId: number, txHash: `0x${string}`, logIndex: number) {
    return this.deposits.some(
      (deposit) =>
        deposit.chainId === chainId &&
        deposit.txHash.toLowerCase() === txHash.toLowerCase() &&
        deposit.logIndex === logIndex,
    );
  }

  async createDeposit(input: CreateDepositInput) {
    this.deposits.push(input);
    return { id: `deposit_${this.deposits.length}` };
  }

  async createAuditLog(input: CreateAuditLogInput) {
    this.auditLogs.push(input);
  }

  async updateJobState(_name: string, latestBlockNumber: bigint) {
    this.latestBlockNumber = latestBlockNumber;
  }
}

describe("processMockUsdtTransferLogs", () => {
  let repository: InMemoryDepositRepository;

  beforeEach(() => {
    repository = new InMemoryDepositRepository();
  });

  it("saves matching deposits for known active company wallets", async () => {
    const result = await processMockUsdtTransferLogs({
      chainId: CHAIN_ID,
      treasuryAddress: TREASURY,
      mockUsdtAddress: MOCK_USDT,
      logs: [transferLog({ fromAddress: COMPANY_WALLET, amount: parseUnits("125.5", 6) })],
      repository,
    });

    assert.deepEqual(result, {
      detected: 1,
      rejectedUnknownWallet: 0,
      duplicates: 0,
      ignored: 0,
      latestBlockNumber: 100n,
    });
    assert.equal(repository.deposits.length, 1);
    assert.equal(repository.deposits[0].companyId, "company_1");
    assert.equal(repository.deposits[0].companyWalletId, "wallet_1");
    assert.equal(repository.deposits[0].amount, "125.5");
    assert.equal(
      repository.deposits[0].blockHash,
      "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    );
    assert.equal(repository.deposits[0].status, "DETECTED");
    assert.equal(repository.auditLogs[0].action, "deposit.detected");
    assert.equal(
      repository.auditLogs[0].metadata?.blockHash,
      "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    );
    assert.equal(repository.latestBlockNumber, 100n);
  });

  it("does not save duplicate logs twice", async () => {
    const log = transferLog({ fromAddress: COMPANY_WALLET });

    await processMockUsdtTransferLogs({
      chainId: CHAIN_ID,
      treasuryAddress: TREASURY,
      mockUsdtAddress: MOCK_USDT,
      logs: [log],
      repository,
    });
    const result = await processMockUsdtTransferLogs({
      chainId: CHAIN_ID,
      treasuryAddress: TREASURY,
      mockUsdtAddress: MOCK_USDT,
      logs: [log],
      repository,
    });

    assert.equal(result.duplicates, 1);
    assert.equal(repository.deposits.length, 1);
    assert.equal(repository.auditLogs.length, 1);
  });

  it("records duplicate logs when verbose audit policy is enabled", async () => {
    const log = transferLog({ fromAddress: COMPANY_WALLET });

    await processMockUsdtTransferLogs({
      chainId: CHAIN_ID,
      treasuryAddress: TREASURY,
      mockUsdtAddress: MOCK_USDT,
      logs: [log],
      repository,
    });
    const result = await processMockUsdtTransferLogs({
      chainId: CHAIN_ID,
      treasuryAddress: TREASURY,
      mockUsdtAddress: MOCK_USDT,
      logs: [log],
      repository,
      auditPolicy: "verbose",
    });

    assert.equal(result.duplicates, 1);
    assert.equal(repository.deposits.length, 1);
    assert.equal(repository.auditLogs[1].action, "deposit.duplicate_skipped");
    assert.equal(repository.auditLogs[1].entityId, `${CHAIN_ID}:${log.txHash}:0`);
    assert.equal(repository.auditLogs[1].metadata?.reason, "existing_deposit_event_key");
  });

  it("rejects unknown wallet deposits without assigning a company", async () => {
    const result = await processMockUsdtTransferLogs({
      chainId: CHAIN_ID,
      treasuryAddress: TREASURY,
      mockUsdtAddress: MOCK_USDT,
      logs: [transferLog({ fromAddress: UNKNOWN_WALLET })],
      repository,
    });

    assert.equal(result.rejectedUnknownWallet, 1);
    assert.equal(repository.deposits[0].companyId, undefined);
    assert.equal(repository.deposits[0].companyWalletId, undefined);
    assert.equal(
      repository.deposits[0].blockHash,
      "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    );
    assert.equal(repository.deposits[0].status, "REJECTED");
    assert.equal(repository.auditLogs[0].action, "deposit.rejected.unknown_wallet");
  });

  it("ignores transfers to the wrong treasury", async () => {
    const result = await processMockUsdtTransferLogs({
      chainId: CHAIN_ID,
      treasuryAddress: TREASURY,
      mockUsdtAddress: MOCK_USDT,
      logs: [transferLog({ fromAddress: COMPANY_WALLET, toAddress: OTHER_TREASURY })],
      repository,
    });

    assert.equal(result.ignored, 1);
    assert.equal(repository.deposits.length, 0);
    assert.equal(repository.auditLogs.length, 0);
    assert.equal(repository.latestBlockNumber, undefined);
  });

  it("records ignored logs when verbose audit policy is enabled", async () => {
    const result = await processMockUsdtTransferLogs({
      chainId: CHAIN_ID,
      treasuryAddress: TREASURY,
      mockUsdtAddress: MOCK_USDT,
      logs: [transferLog({ fromAddress: COMPANY_WALLET, toAddress: OTHER_TREASURY })],
      repository,
      auditPolicy: "verbose",
    });

    assert.equal(result.ignored, 1);
    assert.equal(repository.deposits.length, 0);
    assert.equal(repository.auditLogs[0].action, "deposit.ignored");
    assert.equal(repository.auditLogs[0].entityType, "SystemJobState");
    assert.equal(repository.auditLogs[0].metadata?.reason, "outside_filter");
    assert.equal(repository.latestBlockNumber, undefined);
  });

  it("checkpoints an explicitly scanned range with no logs", async () => {
    const result = await processMockUsdtTransferLogs({
      chainId: CHAIN_ID,
      treasuryAddress: TREASURY,
      mockUsdtAddress: MOCK_USDT,
      logs: [],
      scannedToBlock: 150n,
      repository,
    });

    assert.deepEqual(result, {
      detected: 0,
      rejectedUnknownWallet: 0,
      duplicates: 0,
      ignored: 0,
      latestBlockNumber: 150n,
    });
    assert.equal(repository.latestBlockNumber, 150n);
  });

  it("checkpoints an explicitly scanned range even when all logs are ignored", async () => {
    const result = await processMockUsdtTransferLogs({
      chainId: CHAIN_ID,
      treasuryAddress: TREASURY,
      mockUsdtAddress: MOCK_USDT,
      logs: [transferLog({ fromAddress: COMPANY_WALLET, toAddress: OTHER_TREASURY })],
      scannedToBlock: 155n,
      repository,
    });

    assert.equal(result.ignored, 1);
    assert.equal(result.latestBlockNumber, 155n);
    assert.equal(repository.deposits.length, 0);
    assert.equal(repository.latestBlockNumber, 155n);
  });

  it("rejects invalid scanned checkpoint blocks", async () => {
    await assert.rejects(
      processMockUsdtTransferLogs({
        chainId: CHAIN_ID,
        treasuryAddress: TREASURY,
        mockUsdtAddress: MOCK_USDT,
        logs: [],
        scannedToBlock: -1n,
        repository,
      }),
    );
  });
});

function transferLog(overrides: Partial<MockUsdtTransferLog>): MockUsdtTransferLog {
  return {
    chainId: CHAIN_ID,
    txHash: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    logIndex: 0,
    blockNumber: 100n,
    blockHash: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    fromAddress: COMPANY_WALLET,
    toAddress: TREASURY,
    tokenAddress: MOCK_USDT,
    amount: parseUnits("100", 6),
    ...overrides,
  };
}
