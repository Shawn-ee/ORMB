import { formatUnits, getAddress, isAddress } from "viem";

export type DepositStatus = "DETECTED" | "REJECTED";

export type MockUsdtTransferLog = {
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

export type KnownCompanyWallet = {
  id: string;
  companyId: string;
  chainId: number;
  address: `0x${string}`;
  isActive: boolean;
};

export type CreateDepositInput = {
  companyId?: string;
  companyWalletId?: string;
  chainId: number;
  txHash: `0x${string}`;
  logIndex: number;
  blockNumber: bigint;
  blockHash?: `0x${string}`;
  fromAddress: `0x${string}`;
  toAddress: `0x${string}`;
  tokenAddress: `0x${string}`;
  amount: string;
  confirmations: number;
  status: DepositStatus;
};

export type CreateAuditLogInput = {
  companyId?: string;
  actorType: "system";
  action: string;
  entityType: "Deposit" | "SystemJobState";
  entityId: string;
  metadata?: Record<string, unknown>;
};

export type DepositListenerRepository = {
  findActiveCompanyWalletByAddress(chainId: number, address: `0x${string}`): Promise<KnownCompanyWallet | null>;
  depositExists(chainId: number, txHash: `0x${string}`, logIndex: number): Promise<boolean>;
  createDeposit(input: CreateDepositInput): Promise<{ id: string }>;
  createAuditLog(input: CreateAuditLogInput): Promise<void>;
  updateJobState(name: string, latestBlockNumber: bigint): Promise<void>;
};

export type ProcessTransferLogsInput = {
  chainId: number;
  treasuryAddress: `0x${string}`;
  mockUsdtAddress: `0x${string}`;
  logs: MockUsdtTransferLog[];
  repository: DepositListenerRepository;
};

export type ProcessTransferLogsResult = {
  detected: number;
  rejectedUnknownWallet: number;
  duplicates: number;
  ignored: number;
  latestBlockNumber?: bigint;
};

const JOB_NAME = "mock-usdt-deposit-listener";
const TOKEN_DECIMALS = 6;

export async function processMockUsdtTransferLogs({
  chainId,
  treasuryAddress,
  mockUsdtAddress,
  logs,
  repository,
}: ProcessTransferLogsInput): Promise<ProcessTransferLogsResult> {
  assertAddress("treasuryAddress", treasuryAddress);
  assertAddress("mockUsdtAddress", mockUsdtAddress);

  const treasury = normalizeAddress(treasuryAddress);
  const token = normalizeAddress(mockUsdtAddress);
  const result: ProcessTransferLogsResult = {
    detected: 0,
    rejectedUnknownWallet: 0,
    duplicates: 0,
    ignored: 0,
  };

  for (const log of logs) {
    if (log.chainId !== chainId || normalizeAddress(log.toAddress) !== treasury || normalizeAddress(log.tokenAddress) !== token) {
      result.ignored += 1;
      continue;
    }

    result.latestBlockNumber =
      result.latestBlockNumber === undefined || log.blockNumber > result.latestBlockNumber
        ? log.blockNumber
        : result.latestBlockNumber;

    if (await repository.depositExists(chainId, log.txHash, log.logIndex)) {
      result.duplicates += 1;
      continue;
    }

    const sourceWallet = await repository.findActiveCompanyWalletByAddress(
      chainId,
      normalizeAddress(log.fromAddress),
    );
    const status: DepositStatus = sourceWallet === null ? "REJECTED" : "DETECTED";
    const deposit = await repository.createDeposit({
      companyId: sourceWallet?.companyId,
      companyWalletId: sourceWallet?.id,
      chainId,
      txHash: log.txHash,
      logIndex: log.logIndex,
      blockNumber: log.blockNumber,
      blockHash: log.blockHash,
      fromAddress: normalizeAddress(log.fromAddress),
      toAddress: treasury,
      tokenAddress: token,
      amount: formatUnits(log.amount, TOKEN_DECIMALS),
      confirmations: 0,
      status,
    });

    await repository.createAuditLog({
      companyId: sourceWallet?.companyId,
      actorType: "system",
      action: status === "DETECTED" ? "deposit.detected" : "deposit.rejected.unknown_wallet",
      entityType: "Deposit",
      entityId: deposit.id,
      metadata: {
        chainId,
        txHash: log.txHash,
        logIndex: log.logIndex,
        blockNumber: log.blockNumber.toString(),
        blockHash: log.blockHash,
        fromAddress: normalizeAddress(log.fromAddress),
      },
    });

    if (status === "DETECTED") {
      result.detected += 1;
    } else {
      result.rejectedUnknownWallet += 1;
    }
  }

  if (result.latestBlockNumber !== undefined) {
    await repository.updateJobState(JOB_NAME, result.latestBlockNumber);
  }

  return result;
}

function assertAddress(name: string, value: string) {
  if (!isAddress(value)) {
    throw new Error(`${name} must be a valid 0x address.`);
  }
}

function normalizeAddress(address: `0x${string}`): `0x${string}` {
  return getAddress(address);
}
