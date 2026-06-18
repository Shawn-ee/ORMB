import { formatUnits, getAddress, isAddress } from "viem";

import { type BackfillRange, createBackfillPlan } from "./listener-backfill.js";

export type DryRunTransferLog = {
  chainId: number;
  txHash: `0x${string}`;
  logIndex: number;
  blockNumber: bigint;
  blockHash?: `0x${string}`;
  fromAddress: `0x${string}`;
  toAddress: `0x${string}`;
  tokenAddress: `0x${string}`;
  amount: bigint;
};

export type DryRunKnownCompanyWallet = {
  id: string;
  companyId: string;
  chainId: number;
  address: `0x${string}`;
  isActive: boolean;
};

export type DryRunBackfillRepository = {
  findActiveCompanyWalletByAddress(
    chainId: number,
    address: `0x${string}`,
  ): Promise<DryRunKnownCompanyWallet | null>;
  depositExists(chainId: number, txHash: `0x${string}`, logIndex: number): Promise<boolean>;
};

export type DryRunPotentialAction =
  | {
      type: "would_create_detected_deposit";
      txHash: `0x${string}`;
      logIndex: number;
      blockNumber: string;
      companyId: string;
      companyWalletId: string;
      amount: string;
    }
  | {
      type: "would_create_rejected_unknown_wallet_deposit";
      txHash: `0x${string}`;
      logIndex: number;
      blockNumber: string;
      fromAddress: `0x${string}`;
      amount: string;
    }
  | {
      type: "would_skip_duplicate";
      txHash: `0x${string}`;
      logIndex: number;
      blockNumber: string;
    }
  | {
      type: "would_ignore_event";
      txHash: `0x${string}`;
      logIndex: number;
      blockNumber: string;
      reason: "outside_filter";
    };

export type DryRunBackfillInput = {
  chainId: number;
  treasuryAddress: `0x${string}`;
  mockUsdtAddress: `0x${string}`;
  fromBlock: bigint;
  toBlock: bigint;
  batchSize: bigint;
  maxBlocks: bigint;
  logs: DryRunTransferLog[];
  repository: DryRunBackfillRepository;
};

export type DryRunBackfillReport = {
  mode: "dry-run";
  blockRangeScanned: {
    fromBlock: string;
    toBlock: string;
  };
  batches: BackfillRange[];
  eventsFound: number;
  matchingTreasuryDeposits: number;
  knownCompanyWalletMatches: number;
  unknownWalletEvents: number;
  duplicatesAlreadyPresent: number;
  ignoredEvents: number;
  potentialActions: DryRunPotentialAction[];
};

const TOKEN_DECIMALS = 6;

export async function dryRunMockUsdtBackfill({
  chainId,
  treasuryAddress,
  mockUsdtAddress,
  fromBlock,
  toBlock,
  batchSize,
  maxBlocks,
  logs,
  repository,
}: DryRunBackfillInput): Promise<DryRunBackfillReport> {
  assertAddress("treasuryAddress", treasuryAddress);
  assertAddress("mockUsdtAddress", mockUsdtAddress);

  const batches = createBackfillPlan({ fromBlock, toBlock, batchSize, maxBlocks });
  const treasury = normalizeAddress(treasuryAddress);
  const token = normalizeAddress(mockUsdtAddress);
  const logsInRange = logs.filter((log) => log.blockNumber >= fromBlock && log.blockNumber <= toBlock);
  const report: DryRunBackfillReport = {
    mode: "dry-run",
    blockRangeScanned: {
      fromBlock: fromBlock.toString(),
      toBlock: toBlock.toString(),
    },
    batches,
    eventsFound: logsInRange.length,
    matchingTreasuryDeposits: 0,
    knownCompanyWalletMatches: 0,
    unknownWalletEvents: 0,
    duplicatesAlreadyPresent: 0,
    ignoredEvents: 0,
    potentialActions: [],
  };

  for (const log of logsInRange) {
    const isMatchingTreasuryDeposit =
      log.chainId === chainId &&
      normalizeAddress(log.toAddress) === treasury &&
      normalizeAddress(log.tokenAddress) === token;

    if (!isMatchingTreasuryDeposit) {
      report.ignoredEvents += 1;
      report.potentialActions.push({
        type: "would_ignore_event",
        txHash: log.txHash,
        logIndex: log.logIndex,
        blockNumber: log.blockNumber.toString(),
        reason: "outside_filter",
      });
      continue;
    }

    report.matchingTreasuryDeposits += 1;

    if (await repository.depositExists(chainId, log.txHash, log.logIndex)) {
      report.duplicatesAlreadyPresent += 1;
      report.potentialActions.push({
        type: "would_skip_duplicate",
        txHash: log.txHash,
        logIndex: log.logIndex,
        blockNumber: log.blockNumber.toString(),
      });
      continue;
    }

    const sourceWallet = await repository.findActiveCompanyWalletByAddress(
      chainId,
      normalizeAddress(log.fromAddress),
    );
    const amount = formatUnits(log.amount, TOKEN_DECIMALS);

    if (sourceWallet === null) {
      report.unknownWalletEvents += 1;
      report.potentialActions.push({
        type: "would_create_rejected_unknown_wallet_deposit",
        txHash: log.txHash,
        logIndex: log.logIndex,
        blockNumber: log.blockNumber.toString(),
        fromAddress: normalizeAddress(log.fromAddress),
        amount,
      });
      continue;
    }

    report.knownCompanyWalletMatches += 1;
    report.potentialActions.push({
      type: "would_create_detected_deposit",
      txHash: log.txHash,
      logIndex: log.logIndex,
      blockNumber: log.blockNumber.toString(),
      companyId: sourceWallet.companyId,
      companyWalletId: sourceWallet.id,
      amount,
    });
  }

  return report;
}

function assertAddress(name: string, value: string) {
  if (!isAddress(value)) {
    throw new Error(`${name} must be a valid 0x address.`);
  }
}

function normalizeAddress(address: `0x${string}`): `0x${string}` {
  return getAddress(address);
}
