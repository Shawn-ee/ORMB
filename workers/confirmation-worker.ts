export type ConfirmableDepositStatus = "DETECTED" | "CONFIRMING" | "CONFIRMED";

export type ConfirmableDeposit = {
  id: string;
  companyId?: string;
  chainId: number;
  txHash: `0x${string}`;
  logIndex: number;
  blockNumber: bigint;
  confirmations: number;
  status: ConfirmableDepositStatus;
};

export type UpdateDepositConfirmationInput = {
  id: string;
  confirmations: number;
  status: ConfirmableDepositStatus;
  confirmedAt?: Date;
};

export type ConfirmationAuditLogInput = {
  companyId?: string;
  actorType: "system";
  action: "deposit.confirming" | "deposit.confirmed";
  entityType: "Deposit";
  entityId: string;
  metadata: Record<string, unknown>;
};

export type ConfirmationWorkerRepository = {
  findDepositsNeedingConfirmation(chainId: number): Promise<ConfirmableDeposit[]>;
  updateDepositConfirmation(input: UpdateDepositConfirmationInput): Promise<void>;
  createAuditLog(input: ConfirmationAuditLogInput): Promise<void>;
};

export type ProcessConfirmationsInput = {
  chainId: number;
  currentBlockNumber: bigint;
  requiredConfirmations: number;
  repository: ConfirmationWorkerRepository;
  now?: Date;
};

export type ProcessConfirmationsResult = {
  checked: number;
  movedToConfirming: number;
  confirmed: number;
  unchanged: number;
};

export async function processDepositConfirmations({
  chainId,
  currentBlockNumber,
  requiredConfirmations,
  repository,
  now = new Date(),
}: ProcessConfirmationsInput): Promise<ProcessConfirmationsResult> {
  if (requiredConfirmations <= 0) {
    throw new Error("requiredConfirmations must be positive.");
  }

  const deposits = await repository.findDepositsNeedingConfirmation(chainId);
  const result: ProcessConfirmationsResult = {
    checked: deposits.length,
    movedToConfirming: 0,
    confirmed: 0,
    unchanged: 0,
  };

  for (const deposit of deposits) {
    const confirmations = calculateConfirmations(currentBlockNumber, deposit.blockNumber);
    const nextStatus: ConfirmableDepositStatus =
      confirmations >= requiredConfirmations ? "CONFIRMED" : "CONFIRMING";

    if (deposit.status === nextStatus && deposit.confirmations === confirmations) {
      result.unchanged += 1;
      continue;
    }

    await repository.updateDepositConfirmation({
      id: deposit.id,
      confirmations,
      status: nextStatus,
      confirmedAt: nextStatus === "CONFIRMED" ? now : undefined,
    });

    await repository.createAuditLog({
      companyId: deposit.companyId,
      actorType: "system",
      action: nextStatus === "CONFIRMED" ? "deposit.confirmed" : "deposit.confirming",
      entityType: "Deposit",
      entityId: deposit.id,
      metadata: {
        chainId: deposit.chainId,
        txHash: deposit.txHash,
        logIndex: deposit.logIndex,
        confirmations,
        requiredConfirmations,
      },
    });

    if (nextStatus === "CONFIRMED") {
      result.confirmed += 1;
    } else {
      result.movedToConfirming += 1;
    }
  }

  return result;
}

export function calculateConfirmations(currentBlockNumber: bigint, depositBlockNumber: bigint): number {
  if (currentBlockNumber < depositBlockNumber) {
    return 0;
  }

  const confirmations = currentBlockNumber - depositBlockNumber + 1n;

  return Number(confirmations);
}
