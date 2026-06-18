import {
  type CreateMintRequestForDepositResult,
  type MintRequestRepository,
  createMintRequestForDeposit,
} from "./mint-request-flow.js";
import type { RiskDeposit } from "./risk-engine.js";

export type ManualDepositRecord = RiskDeposit & {
  id: string;
  companyId: string;
  companyWalletId: string;
  receivingAddress: `0x${string}`;
  manualReference: string;
};

export type CreateManualConfirmedDepositInput = {
  companyId: string;
  companyWalletId: string;
  manualReference: string;
  amount: string;
  confirmedBy: string;
  confirmedAt: Date;
};

export type ManualDepositAuditLogInput = {
  companyId?: string;
  actorType: "admin" | "system";
  actorId?: string;
  action: "manual_deposit.confirmed" | "manual_deposit.skipped_existing";
  entityType: "Deposit";
  entityId: string;
  metadata?: Record<string, unknown>;
};

export type ManualDepositRepository = MintRequestRepository & {
  findManualDepositByReference(manualReference: string): Promise<ManualDepositRecord | null>;
  createManualConfirmedDeposit(input: CreateManualConfirmedDepositInput): Promise<ManualDepositRecord>;
  createManualDepositAuditLog(input: ManualDepositAuditLogInput): Promise<void>;
};

export type ConfirmManualDepositInput = {
  companyId: string;
  companyWalletId: string;
  manualReference: string;
  amount: string;
  confirmedBy: string;
  fixedFxRate: string;
  repository: ManualDepositRepository;
  autoMintLimitUsdt?: string;
  dailyMintLimitUsdt?: string;
  now?: Date;
};

export type ConfirmManualDepositResult = {
  deposit: ManualDepositRecord;
  mintRequestResult: CreateMintRequestForDepositResult;
  duplicate: boolean;
};

export async function confirmManualDepositAndCreateMintRequest({
  companyId,
  companyWalletId,
  manualReference,
  amount,
  confirmedBy,
  fixedFxRate,
  repository,
  autoMintLimitUsdt,
  dailyMintLimitUsdt,
  now = new Date(),
}: ConfirmManualDepositInput): Promise<ConfirmManualDepositResult> {
  const normalizedReference = requireSafeText("manualReference", manualReference);
  const normalizedConfirmedBy = requireSafeText("confirmedBy", confirmedBy);
  requireDecimal6Amount(amount);

  const existingDeposit = await repository.findManualDepositByReference(normalizedReference);
  if (existingDeposit !== null) {
    await repository.createManualDepositAuditLog({
      companyId: existingDeposit.companyId,
      actorType: "admin",
      actorId: normalizedConfirmedBy,
      action: "manual_deposit.skipped_existing",
      entityType: "Deposit",
      entityId: existingDeposit.id,
      metadata: {
        manualReference: normalizedReference,
      },
    });

    return {
      deposit: existingDeposit,
      mintRequestResult: await createMintRequestForDeposit({
        deposit: existingDeposit,
        fixedFxRate,
        autoMintLimitUsdt,
        dailyMintLimitUsdt,
        repository,
        now,
      }),
      duplicate: true,
    };
  }

  const deposit = await repository.createManualConfirmedDeposit({
    companyId,
    companyWalletId,
    manualReference: normalizedReference,
    amount,
    confirmedBy: normalizedConfirmedBy,
    confirmedAt: now,
  });

  await repository.createManualDepositAuditLog({
    companyId: deposit.companyId,
    actorType: "admin",
    actorId: normalizedConfirmedBy,
    action: "manual_deposit.confirmed",
    entityType: "Deposit",
    entityId: deposit.id,
    metadata: {
      manualReference: normalizedReference,
      amount,
      confirmedAt: now.toISOString(),
      simulatedOnly: true,
    },
  });

  return {
    deposit,
    mintRequestResult: await createMintRequestForDeposit({
      deposit,
      fixedFxRate,
      autoMintLimitUsdt,
      dailyMintLimitUsdt,
      repository,
      now,
    }),
    duplicate: false,
  };
}

function requireSafeText(name: string, value: string): string {
  const normalized = value.trim();
  if (normalized === "") {
    throw new Error(`${name} is required.`);
  }

  if (normalized.length > 120) {
    throw new Error(`${name} must be 120 characters or fewer.`);
  }

  return normalized;
}

function requireDecimal6Amount(value: string) {
  if (!/^\d+(\.\d{1,6})?$/.test(value)) {
    throw new Error("amount must be a positive decimal with up to 6 fractional digits.");
  }

  const [whole, fractional = ""] = value.split(".");
  const parsed = BigInt(whole) * 1_000_000n + BigInt(fractional.padEnd(6, "0"));
  if (parsed <= 0n) {
    throw new Error("amount must be greater than zero.");
  }
}
