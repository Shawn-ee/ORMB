import { createHash } from "node:crypto";

import type { Prisma, PrismaClient } from "@prisma/client";

import type { ManualDepositRepository, ManualDepositRecord, CreateManualConfirmedDepositInput } from "../../../workers/manual-deposit-flow.js";
import type { CreateFxQuoteInput, CreateMintRequestInput, MintRequestRecord } from "../../../workers/mint-request-flow.js";
import type {
  CreateRedemptionRequestInput,
  RedemptionAuditLogInput,
  RedemptionRecord,
  RedemptionRepository,
} from "../../../workers/redemption-burn-flow.js";
import type { RiskAuditLogInput, RiskEventInput } from "../../../workers/risk-engine.js";

type PrismaLike = PrismaClient;

export class PrismaStagingRepository implements ManualDepositRepository, RedemptionRepository {
  constructor(private readonly prisma: PrismaLike) {}

  async findManualDepositByReference(manualReference: string) {
    const deposit = await this.prisma.deposit.findUnique({
      where: { manualReference },
      include: depositInclude,
    });

    return deposit === null ? null : toManualDepositRecord(deposit);
  }

  async createManualConfirmedDeposit(input: CreateManualConfirmedDepositInput) {
    const wallet = await this.prisma.companyWallet.findUniqueOrThrow({
      where: { id: input.companyWalletId },
      include: { company: true },
    });
    const txHash = syntheticManualTxHash(input.manualReference);
    const deposit = await this.prisma.deposit.create({
      data: {
        companyId: input.companyId,
        companyWalletId: input.companyWalletId,
        chainId: wallet.chainId,
        txHash,
        logIndex: 0,
        blockNumber: 0,
        fromAddress: wallet.address.toLowerCase(),
        toAddress: wallet.address.toLowerCase(),
        tokenAddress: process.env.MOCK_USDT_CONTRACT_ADDRESS ?? "0x0000000000000000000000000000000000000000",
        amount: input.amount,
        confirmations: 1,
        status: "CONFIRMED",
        source: "MANUAL_STAGING",
        manualReference: input.manualReference,
        manualConfirmedBy: input.confirmedBy,
        manualConfirmedAt: input.confirmedAt,
        confirmedAt: input.confirmedAt,
      },
      include: depositInclude,
    });

    return toManualDepositRecord(deposit);
  }

  async createManualDepositAuditLog(input: {
    companyId?: string;
    actorType: "admin" | "system";
    actorId?: string;
    action: "manual_deposit.confirmed" | "manual_deposit.skipped_existing";
    entityType: "Deposit";
    entityId: string;
    metadata?: Record<string, unknown>;
  }) {
    await this.createAuditLogRecord(input);
  }

  async getDailyMintedUsdtAmount(companyId: string, businessDate: string) {
    const start = new Date(`${businessDate}T00:00:00.000Z`);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    const mintRequests = await this.prisma.mintRequest.findMany({
      where: {
        companyId,
        createdAt: { gte: start, lt: end },
        status: { in: ["APPROVED", "MINTING", "MINTED"] },
      },
      select: { usdtAmount: true },
    });
    const total = mintRequests.reduce((sum, item) => sum + parseDecimal6(item.usdtAmount.toString()), 0n);

    return formatDecimal6(total);
  }

  async createRiskEvent(input: RiskEventInput) {
    await this.prisma.riskEvent.create({
      data: {
        companyId: input.companyId,
        severity: input.severity,
        code: input.code,
        message: input.message,
        entityType: input.entityType,
        entityId: input.entityId,
        metadata: toJson(input.metadata),
      },
    });
  }

  async createAuditLog(input: RiskAuditLogInput) {
    await this.createAuditLogRecord(input);
  }

  async findMintRequestByDepositId(depositId: string) {
    const mintRequest = await this.prisma.mintRequest.findUnique({
      where: { depositId },
      include: { companyWallet: true, mint: true },
    });

    return mintRequest === null ? null : toMintRequestRecord(mintRequest);
  }

  async createFxQuote(input: CreateFxQuoteInput) {
    return this.prisma.fxQuote.create({
      data: {
        depositId: input.depositId,
        rate: input.rate,
        fromAsset: input.fromAsset,
        toAsset: input.toAsset,
      },
      select: { id: true },
    });
  }

  async createMintRequest(input: CreateMintRequestInput) {
    const mintRequest = await this.prisma.mintRequest.create({
      data: input,
      include: { companyWallet: true, mint: true },
    });

    return toMintRequestRecord(mintRequest);
  }

  async markDepositMintRequested(depositId: string) {
    await this.prisma.deposit.update({ where: { id: depositId }, data: { status: "MINT_REQUESTED" } });
  }

  async approveMintRequest(id: string, approvedBy: string, approvedAt: Date) {
    const mintRequest = await this.prisma.mintRequest.update({
      where: { id },
      data: { status: "APPROVED", approvedBy, approvedAt },
      include: { companyWallet: true, mint: true },
    });

    return toMintRequestRecord(mintRequest);
  }

  async getMintRequest(id: string) {
    const mintRequest = await this.prisma.mintRequest.findUnique({
      where: { id },
      include: { companyWallet: true, mint: true },
    });

    return mintRequest === null ? null : toMintRequestRecord(mintRequest);
  }

  async markMinting(id: string) {
    await this.prisma.mintRequest.update({ where: { id }, data: { status: "MINTING" } });
  }

  async recordMintSubmitted(input: {
    mintRequestId: string;
    chainId: number;
    txHash: `0x${string}`;
    toAddress: `0x${string}`;
    amount: string;
    submittedAt: Date;
  }) {
    await this.prisma.mint.create({
      data: {
        mintRequestId: input.mintRequestId,
        chainId: input.chainId,
        txHash: input.txHash,
        toAddress: input.toAddress,
        amount: input.amount,
        status: "SUBMITTED",
        submittedAt: input.submittedAt,
      },
    });
    await this.prisma.mintRequest.update({ where: { id: input.mintRequestId }, data: { status: "MINTING" } });
  }

  async recordMintFailure(id: string, errorMessage: string) {
    await this.prisma.mintRequest.update({
      where: { id },
      data: { status: "FAILED", rejectionReason: errorMessage },
    });
  }

  async createMintAuditLog(input: {
    companyId?: string;
    actorType: "system" | "admin";
    actorId?: string;
    action:
      | "mint_request.created"
      | "mint_request.risk_rejected"
      | "mint_request.approved"
      | "mint.submitted"
      | "mint.failed"
      | "mint.skipped_existing";
    entityType: "Deposit" | "MintRequest" | "Mint";
    entityId: string;
    metadata?: Record<string, unknown>;
  }) {
    await this.createAuditLogRecord(input);
  }

  async createRedemptionRequest(input: CreateRedemptionRequestInput) {
    const redemption = await this.prisma.redemption.create({
      data: {
        companyId: input.company.id,
        companyWalletId: input.companyWallet.id,
        amount: input.amount,
        status: "REQUESTED",
        requestedBy: input.requestedBy,
      },
    });

    return toRedemptionRecord(redemption);
  }

  async rejectRedemptionRequest(input: {
    companyId: string;
    companyWalletId: string;
    amount: string;
    requestedBy: string;
    reason: string;
  }) {
    const redemption = await this.prisma.redemption.create({
      data: {
        companyId: input.companyId,
        companyWalletId: input.companyWalletId,
        amount: input.amount,
        status: "REJECTED",
        requestedBy: input.requestedBy,
      },
    });

    return toRedemptionRecord(redemption);
  }

  async approveRedemptionRequest(id: string, approvedBy: string, approvedAt: Date) {
    const redemption = await this.prisma.redemption.update({
      where: { id },
      data: { status: "BURN_PENDING", approvedBy, burnVerifiedAt: undefined, updatedAt: approvedAt },
    });

    return toRedemptionRecord(redemption);
  }

  async getRedemption(id: string) {
    const redemption = await this.prisma.redemption.findUnique({ where: { id } });

    return redemption === null ? null : toRedemptionRecord(redemption);
  }

  async findRedemptionByBurnEvent(chainId: number, txHash: `0x${string}`, logIndex: number) {
    const redemption = await this.prisma.redemption.findUnique({
      where: { burnChainId_burnTxHash_burnLogIndex: { burnChainId: chainId, burnTxHash: txHash, burnLogIndex: logIndex } },
    });

    return redemption === null ? null : toRedemptionRecord(redemption);
  }

  async markBurnVerified(input: {
    redemptionId: string;
    chainId: number;
    txHash: `0x${string}`;
    logIndex: number;
    verifiedAt: Date;
  }) {
    const redemption = await this.prisma.redemption.update({
      where: { id: input.redemptionId },
      data: {
        status: "BURN_VERIFIED",
        burnChainId: input.chainId,
        burnTxHash: input.txHash,
        burnLogIndex: input.logIndex,
        burnVerifiedAt: input.verifiedAt,
      },
    });

    return toRedemptionRecord(redemption);
  }

  async markBurnVerificationFailed(id: string, _reason: string) {
    const redemption = await this.prisma.redemption.update({ where: { id }, data: { status: "FAILED" } });

    return toRedemptionRecord(redemption);
  }

  async markPayoutSimulated(id: string, simulatedAt: Date) {
    const redemption = await this.prisma.redemption.update({
      where: { id },
      data: { status: "PAYOUT_SIMULATED", payoutSimulatedAt: simulatedAt },
    });

    return toRedemptionRecord(redemption);
  }

  async completeRedemption(id: string) {
    const redemption = await this.prisma.redemption.update({ where: { id }, data: { status: "COMPLETED" } });

    return toRedemptionRecord(redemption);
  }

  async createRedemptionAuditLog(input: RedemptionAuditLogInput) {
    await this.createAuditLogRecord(input);
  }

  private async createAuditLogRecord(input: {
    companyId?: string;
    actorType: string;
    actorId?: string;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: Record<string, unknown>;
  }) {
    await this.prisma.auditLog.create({
      data: {
        companyId: input.companyId,
        actorType: input.actorType,
        actorId: input.actorId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        metadata: toJson(input.metadata),
      },
    });
  }
}

export async function loadRedemptionInputs(prisma: PrismaLike, companyId: string, companyWalletId: string) {
  const [company, companyWallet] = await Promise.all([
    prisma.company.findUniqueOrThrow({ where: { id: companyId } }),
    prisma.companyWallet.findUniqueOrThrow({ where: { id: companyWalletId } }),
  ]);

  return {
    company: { id: company.id, kybStatus: company.kybStatus, status: company.status },
    companyWallet: {
      id: companyWallet.id,
      companyId: companyWallet.companyId,
      chainId: companyWallet.chainId,
      address: companyWallet.address as `0x${string}`,
      isActive: companyWallet.isActive,
      whitelistStatus: companyWallet.whitelistStatus,
    },
  };
}

export async function loadRedemptionWallet(prisma: PrismaLike, companyWalletId: string) {
  const wallet = await prisma.companyWallet.findUniqueOrThrow({ where: { id: companyWalletId } });

  return {
    id: wallet.id,
    companyId: wallet.companyId,
    chainId: wallet.chainId,
    address: wallet.address as `0x${string}`,
    isActive: wallet.isActive,
    whitelistStatus: wallet.whitelistStatus,
  };
}

const depositInclude = {
  company: true,
  companyWallet: true,
  mintRequest: { include: { mint: true } },
} as const;

function toManualDepositRecord(deposit: {
  id: string;
  companyId: string | null;
  companyWalletId: string | null;
  amount: unknown;
  status: string;
  manualReference: string | null;
  company: { id: string; kybStatus: string; status: string } | null;
  companyWallet: { id: string; companyId: string; address: string; isActive: boolean; whitelistStatus: string } | null;
  mintRequest: { mint: unknown | null } | null;
}): ManualDepositRecord {
  if (deposit.companyId === null || deposit.companyWalletId === null || deposit.company === null || deposit.companyWallet === null || deposit.manualReference === null) {
    throw new Error("Manual deposit record is missing required company or wallet data.");
  }

  const wallet = {
    id: deposit.companyWallet.id,
    companyId: deposit.companyWallet.companyId,
    isActive: deposit.companyWallet.isActive,
    whitelistStatus: deposit.companyWallet.whitelistStatus as "PENDING" | "WHITELISTED" | "REJECTED" | "REMOVED",
  };

  return {
    id: deposit.id,
    companyId: deposit.companyId,
    companyWalletId: deposit.companyWalletId,
    receivingAddress: deposit.companyWallet.address as `0x${string}`,
    manualReference: deposit.manualReference,
    company: {
      id: deposit.company.id,
      kybStatus: deposit.company.kybStatus as "PENDING" | "APPROVED" | "REJECTED",
      status: deposit.company.status as "ACTIVE" | "SUSPENDED" | "ARCHIVED",
    },
    sourceWallet: wallet,
    receivingWallet: wallet,
    amount: String(deposit.amount),
    status: deposit.status as "DETECTED" | "CONFIRMING" | "CONFIRMED" | "REJECTED" | "MINT_REQUESTED",
    hasMintRequest: deposit.mintRequest !== null,
    hasMint: deposit.mintRequest?.mint !== null,
  };
}

function toMintRequestRecord(mintRequest: {
  id: string;
  companyId: string;
  companyWalletId: string;
  depositId: string;
  status: string;
  ormbAmount: unknown;
  companyWallet: { address: string };
  mint: { id: string; txHash: string | null; status: string } | null;
}): MintRequestRecord {
  return {
    id: mintRequest.id,
    companyId: mintRequest.companyId,
    companyWalletId: mintRequest.companyWalletId,
    depositId: mintRequest.depositId,
    status: mintRequest.status as MintRequestRecord["status"],
    ormbAmount: String(mintRequest.ormbAmount),
    toAddress: mintRequest.companyWallet.address as `0x${string}`,
    mint:
      mintRequest.mint === null
        ? undefined
        : {
            id: mintRequest.mint.id,
            txHash: mintRequest.mint.txHash === null ? undefined : (mintRequest.mint.txHash as `0x${string}`),
            status: mintRequest.mint.status as "PENDING" | "SUBMITTED" | "CONFIRMED" | "FAILED",
          },
  };
}

function toRedemptionRecord(redemption: {
  id: string;
  companyId: string;
  companyWalletId: string;
  amount: unknown;
  status: string;
  burnChainId: number | null;
  burnTxHash: string | null;
  burnLogIndex: number | null;
  burnVerifiedAt: Date | null;
  payoutSimulatedAt: Date | null;
}): RedemptionRecord {
  return {
    id: redemption.id,
    companyId: redemption.companyId,
    companyWalletId: redemption.companyWalletId,
    amount: String(redemption.amount),
    status: redemption.status as RedemptionRecord["status"],
    burnChainId: redemption.burnChainId ?? undefined,
    burnTxHash: redemption.burnTxHash === null ? undefined : (redemption.burnTxHash as `0x${string}`),
    burnLogIndex: redemption.burnLogIndex ?? undefined,
    burnVerifiedAt: redemption.burnVerifiedAt ?? undefined,
    payoutSimulatedAt: redemption.payoutSimulatedAt ?? undefined,
  };
}

function syntheticManualTxHash(manualReference: string): `0x${string}` {
  return `0x${createHash("sha256").update(`manual-staging:${manualReference}`).digest("hex")}`;
}

function parseDecimal6(value: string): bigint {
  const [whole, fractional = ""] = value.split(".");
  return BigInt(whole) * 1_000_000n + BigInt(fractional.padEnd(6, "0"));
}

function formatDecimal6(value: bigint): string {
  const whole = value / 1_000_000n;
  const fractional = value % 1_000_000n;

  if (fractional === 0n) {
    return whole.toString();
  }

  return `${whole}.${fractional.toString().padStart(6, "0").replace(/0+$/, "")}`;
}

function toJson(value: Record<string, unknown> | undefined): Prisma.InputJsonValue | undefined {
  return value === undefined ? undefined : (value as Prisma.InputJsonValue);
}
