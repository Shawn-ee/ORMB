import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { parseUnits } from "viem";

import {
  type DryRunBackfillRepository,
  type DryRunKnownCompanyWallet,
  type DryRunTransferLog,
  dryRunMockUsdtBackfill,
} from "../../workers/listener-dry-run-backfill.js";

const CHAIN_ID = 84532;
const TREASURY = "0x3000000000000000000000000000000000000003";
const MOCK_USDT = "0x4000000000000000000000000000000000000004";
const COMPANY_WALLET = "0x1000000000000000000000000000000000000001";
const UNKNOWN_WALLET = "0x9000000000000000000000000000000000000009";
const OTHER_TREASURY = "0x5000000000000000000000000000000000000005";

class InMemoryDryRunRepository implements DryRunBackfillRepository {
  wallets: DryRunKnownCompanyWallet[] = [
    {
      id: "wallet_1",
      companyId: "company_1",
      chainId: CHAIN_ID,
      address: COMPANY_WALLET,
      isActive: true,
    },
  ];

  existingDeposits = new Set<string>();
  writes = 0;

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
    return this.existingDeposits.has(`${chainId}:${txHash.toLowerCase()}:${logIndex}`);
  }
}

describe("dryRunMockUsdtBackfill", () => {
  let repository: InMemoryDryRunRepository;

  beforeEach(() => {
    repository = new InMemoryDryRunRepository();
  });

  it("finds matching events without persisting deposits", async () => {
    const report = await dryRunMockUsdtBackfill({
      chainId: CHAIN_ID,
      treasuryAddress: TREASURY,
      mockUsdtAddress: MOCK_USDT,
      fromBlock: 100n,
      toBlock: 110n,
      batchSize: 5n,
      maxBlocks: 25n,
      logs: [transferLog({ fromAddress: COMPANY_WALLET, amount: parseUnits("125.5", 6) })],
      repository,
    });

    assert.equal(report.mode, "dry-run");
    assert.deepEqual(report.blockRangeScanned, { fromBlock: "100", toBlock: "110" });
    assert.equal(report.eventsFound, 1);
    assert.equal(report.matchingTreasuryDeposits, 1);
    assert.equal(report.knownCompanyWalletMatches, 1);
    assert.equal(report.unknownWalletEvents, 0);
    assert.equal(report.duplicatesAlreadyPresent, 0);
    assert.equal(report.ignoredEvents, 0);
    assert.equal(report.potentialActions[0].type, "would_create_detected_deposit");
    assert.equal(repository.writes, 0);
  });

  it("reports duplicates already present in the database", async () => {
    const log = transferLog({ fromAddress: COMPANY_WALLET });
    repository.existingDeposits.add(`${CHAIN_ID}:${log.txHash.toLowerCase()}:${log.logIndex}`);

    const report = await dryRunMockUsdtBackfill({
      chainId: CHAIN_ID,
      treasuryAddress: TREASURY,
      mockUsdtAddress: MOCK_USDT,
      fromBlock: 100n,
      toBlock: 110n,
      batchSize: 5n,
      maxBlocks: 25n,
      logs: [log],
      repository,
    });

    assert.equal(report.matchingTreasuryDeposits, 1);
    assert.equal(report.duplicatesAlreadyPresent, 1);
    assert.equal(report.knownCompanyWalletMatches, 0);
    assert.equal(report.potentialActions[0].type, "would_skip_duplicate");
    assert.equal(repository.writes, 0);
  });

  it("reports unknown wallet events as rejected-deposit candidates", async () => {
    const report = await dryRunMockUsdtBackfill({
      chainId: CHAIN_ID,
      treasuryAddress: TREASURY,
      mockUsdtAddress: MOCK_USDT,
      fromBlock: 100n,
      toBlock: 110n,
      batchSize: 5n,
      maxBlocks: 25n,
      logs: [transferLog({ fromAddress: UNKNOWN_WALLET })],
      repository,
    });

    assert.equal(report.matchingTreasuryDeposits, 1);
    assert.equal(report.unknownWalletEvents, 1);
    assert.equal(report.knownCompanyWalletMatches, 0);
    assert.equal(report.potentialActions[0].type, "would_create_rejected_unknown_wallet_deposit");
    assert.equal(repository.writes, 0);
  });

  it("reports ignored events separately", async () => {
    const report = await dryRunMockUsdtBackfill({
      chainId: CHAIN_ID,
      treasuryAddress: TREASURY,
      mockUsdtAddress: MOCK_USDT,
      fromBlock: 100n,
      toBlock: 110n,
      batchSize: 5n,
      maxBlocks: 25n,
      logs: [transferLog({ fromAddress: COMPANY_WALLET, toAddress: OTHER_TREASURY })],
      repository,
    });

    assert.equal(report.eventsFound, 1);
    assert.equal(report.matchingTreasuryDeposits, 0);
    assert.equal(report.ignoredEvents, 1);
    assert.equal(report.potentialActions[0].type, "would_ignore_event");
    assert.equal(repository.writes, 0);
  });

  it("handles empty ranges without potential actions", async () => {
    const report = await dryRunMockUsdtBackfill({
      chainId: CHAIN_ID,
      treasuryAddress: TREASURY,
      mockUsdtAddress: MOCK_USDT,
      fromBlock: 100n,
      toBlock: 110n,
      batchSize: 5n,
      maxBlocks: 25n,
      logs: [],
      repository,
    });

    assert.equal(report.eventsFound, 0);
    assert.equal(report.potentialActions.length, 0);
    assert.deepEqual(report.batches, [
      { fromBlock: 100n, toBlock: 104n },
      { fromBlock: 105n, toBlock: 109n },
      { fromBlock: 110n, toBlock: 110n },
    ]);
  });

  it("fails safely for invalid block ranges", async () => {
    await assert.rejects(
      dryRunMockUsdtBackfill({
        chainId: CHAIN_ID,
        treasuryAddress: TREASURY,
        mockUsdtAddress: MOCK_USDT,
        fromBlock: 120n,
        toBlock: 110n,
        batchSize: 5n,
        maxBlocks: 25n,
        logs: [],
        repository,
      }),
    );
  });
});

function transferLog(overrides: Partial<DryRunTransferLog>): DryRunTransferLog {
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
