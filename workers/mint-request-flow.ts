import { type RiskDeposit, type RiskEngineRepository, evaluateMintRisk } from "./risk-engine.js";

export type MintRequestRecord = {
  id: string;
  companyId: string;
  companyWalletId: string;
  depositId: string;
  status: "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "MINTING" | "MINTED" | "FAILED";
  ormbAmount: string;
  toAddress: `0x${string}`;
  mint?: {
    id: string;
    txHash?: `0x${string}`;
    status: "PENDING" | "SUBMITTED" | "CONFIRMED" | "FAILED";
  };
};

export type CreateFxQuoteInput = {
  depositId: string;
  rate: string;
  fromAsset: "USDT";
  toAsset: "ORMB";
};

export type CreateMintRequestInput = {
  companyId: string;
  companyWalletId: string;
  depositId: string;
  fxQuoteId: string;
  usdtAmount: string;
  ormbAmount: string;
  requestedBy: "system";
};

export type MintFlowAuditLogInput = {
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
};

export type MintRequestRepository = RiskEngineRepository & {
  findMintRequestByDepositId(depositId: string): Promise<MintRequestRecord | null>;
  createFxQuote(input: CreateFxQuoteInput): Promise<{ id: string }>;
  createMintRequest(input: CreateMintRequestInput): Promise<MintRequestRecord>;
  markDepositMintRequested(depositId: string): Promise<void>;
  approveMintRequest(id: string, approvedBy: string, approvedAt: Date): Promise<MintRequestRecord>;
  getMintRequest(id: string): Promise<MintRequestRecord | null>;
  markMinting(id: string): Promise<void>;
  recordMintSubmitted(input: {
    mintRequestId: string;
    chainId: number;
    txHash: `0x${string}`;
    toAddress: `0x${string}`;
    amount: string;
    submittedAt: Date;
  }): Promise<void>;
  recordMintFailure(id: string, errorMessage: string): Promise<void>;
  createMintAuditLog(input: MintFlowAuditLogInput): Promise<void>;
};

export type MintGateway = {
  mint(toAddress: `0x${string}`, amount: string): Promise<{ txHash: `0x${string}` }>;
};

export type CreateMintRequestForDepositInput = {
  deposit: RiskDeposit & {
    companyId: string;
    companyWalletId: string;
    receivingAddress: `0x${string}`;
  };
  fixedFxRate: string;
  autoMintLimitUsdt?: string;
  dailyMintLimitUsdt?: string;
  repository: MintRequestRepository;
  now?: Date;
};

export type CreateMintRequestForDepositResult =
  | { created: true; mintRequest: MintRequestRecord }
  | { created: false; reason: "EXISTING_MINT_REQUEST"; mintRequest: MintRequestRecord }
  | { created: false; reason: "RISK_REJECTED"; failures: string[] };

export async function createMintRequestForDeposit({
  deposit,
  fixedFxRate,
  autoMintLimitUsdt,
  dailyMintLimitUsdt,
  repository,
  now = new Date(),
}: CreateMintRequestForDepositInput): Promise<CreateMintRequestForDepositResult> {
  const existing = await repository.findMintRequestByDepositId(deposit.id);
  if (existing !== null) {
    await repository.createMintAuditLog({
      companyId: deposit.companyId,
      actorType: "system",
      action: "mint.skipped_existing",
      entityType: "Deposit",
      entityId: deposit.id,
      metadata: { mintRequestId: existing.id },
    });

    return { created: false, reason: "EXISTING_MINT_REQUEST", mintRequest: existing };
  }

  const riskDecision = await evaluateMintRisk({
    deposit,
    autoMintLimitUsdt,
    dailyMintLimitUsdt,
    repository,
    now,
  });

  if (!riskDecision.eligible) {
    await repository.createMintAuditLog({
      companyId: deposit.companyId,
      actorType: "system",
      action: "mint_request.risk_rejected",
      entityType: "Deposit",
      entityId: deposit.id,
      metadata: {
        failureCodes: riskDecision.failures.map((item) => item.code),
      },
    });

    return {
      created: false,
      reason: "RISK_REJECTED",
      failures: riskDecision.failures.map((item) => item.code),
    };
  }

  const ormbAmount = multiplyDecimal6ByRate(deposit.amount, fixedFxRate);
  const fxQuote = await repository.createFxQuote({
    depositId: deposit.id,
    rate: fixedFxRate,
    fromAsset: "USDT",
    toAsset: "ORMB",
  });
  const mintRequest = await repository.createMintRequest({
    companyId: deposit.companyId,
    companyWalletId: deposit.companyWalletId,
    depositId: deposit.id,
    fxQuoteId: fxQuote.id,
    usdtAmount: deposit.amount,
    ormbAmount,
    requestedBy: "system",
  });

  await repository.markDepositMintRequested(deposit.id);
  await repository.createMintAuditLog({
    companyId: deposit.companyId,
    actorType: "system",
    action: "mint_request.created",
    entityType: "MintRequest",
    entityId: mintRequest.id,
    metadata: {
      depositId: deposit.id,
      fxQuoteId: fxQuote.id,
      fixedFxRate,
      usdtAmount: deposit.amount,
      ormbAmount,
    },
  });

  return { created: true, mintRequest };
}

export async function approveMintRequest({
  mintRequestId,
  approvedBy,
  repository,
  now = new Date(),
}: {
  mintRequestId: string;
  approvedBy: string;
  repository: MintRequestRepository;
  now?: Date;
}): Promise<MintRequestRecord> {
  const mintRequest = await repository.approveMintRequest(mintRequestId, approvedBy, now);

  await repository.createMintAuditLog({
    companyId: mintRequest.companyId,
    actorType: "admin",
    actorId: approvedBy,
    action: "mint_request.approved",
    entityType: "MintRequest",
    entityId: mintRequest.id,
    metadata: { approvedAt: now.toISOString() },
  });

  return mintRequest;
}

export async function submitApprovedMintRequest({
  mintRequestId,
  chainId,
  repository,
  gateway,
  now = new Date(),
}: {
  mintRequestId: string;
  chainId: number;
  repository: MintRequestRepository;
  gateway: MintGateway;
  now?: Date;
}): Promise<{ submitted: boolean; txHash?: `0x${string}`; reason?: string }> {
  const mintRequest = await repository.getMintRequest(mintRequestId);

  if (mintRequest === null) {
    throw new Error(`Mint request ${mintRequestId} was not found.`);
  }

  if (mintRequest.mint?.txHash !== undefined || mintRequest.status === "MINTED") {
    await repository.createMintAuditLog({
      companyId: mintRequest.companyId,
      actorType: "system",
      action: "mint.skipped_existing",
      entityType: "MintRequest",
      entityId: mintRequest.id,
      metadata: { txHash: mintRequest.mint?.txHash },
    });

    return { submitted: false, reason: "ALREADY_SUBMITTED", txHash: mintRequest.mint?.txHash };
  }

  if (mintRequest.status !== "APPROVED") {
    return { submitted: false, reason: "NOT_APPROVED" };
  }

  await repository.markMinting(mintRequest.id);

  try {
    const result = await gateway.mint(mintRequest.toAddress, mintRequest.ormbAmount);
    await repository.recordMintSubmitted({
      mintRequestId: mintRequest.id,
      chainId,
      txHash: result.txHash,
      toAddress: mintRequest.toAddress,
      amount: mintRequest.ormbAmount,
      submittedAt: now,
    });
    await repository.createMintAuditLog({
      companyId: mintRequest.companyId,
      actorType: "system",
      action: "mint.submitted",
      entityType: "MintRequest",
      entityId: mintRequest.id,
      metadata: {
        chainId,
        txHash: result.txHash,
        toAddress: mintRequest.toAddress,
        amount: mintRequest.ormbAmount,
      },
    });

    return { submitted: true, txHash: result.txHash };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown mint failure";
    await repository.recordMintFailure(mintRequest.id, message);
    await repository.createMintAuditLog({
      companyId: mintRequest.companyId,
      actorType: "system",
      action: "mint.failed",
      entityType: "MintRequest",
      entityId: mintRequest.id,
      metadata: { errorMessage: message },
    });

    return { submitted: false, reason: "MINT_FAILED" };
  }
}

export function multiplyDecimal6ByRate(amount: string, rate: string): string {
  const amountValue = parseDecimal(amount, 6);
  const rateValue = parseDecimal(rate, 8);
  const scaled = (amountValue * rateValue) / 100_000_000n;
  const whole = scaled / 1_000_000n;
  const fractional = scaled % 1_000_000n;

  if (fractional === 0n) {
    return whole.toString();
  }

  return `${whole}.${fractional.toString().padStart(6, "0").replace(/0+$/, "")}`;
}

function parseDecimal(value: string, decimals: number): bigint {
  const pattern = new RegExp(`^\\d+(\\.\\d{1,${decimals}})?$`);
  if (!pattern.test(value)) {
    throw new Error(`Invalid decimal amount: ${value}`);
  }

  const [whole, fractional = ""] = value.split(".");
  return BigInt(whole) * 10n ** BigInt(decimals) + BigInt(fractional.padEnd(decimals, "0"));
}
