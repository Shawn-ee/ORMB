export type RedemptionCompany = {
  id: string;
  kybStatus: "PENDING" | "APPROVED" | "REJECTED";
  status: "ACTIVE" | "SUSPENDED" | "ARCHIVED";
};

export type RedemptionWallet = {
  id: string;
  companyId: string;
  chainId: number;
  address: `0x${string}`;
  isActive: boolean;
  whitelistStatus: "PENDING" | "WHITELISTED" | "REJECTED" | "REMOVED";
};

export type RedemptionStatus =
  | "REQUESTED"
  | "BURN_PENDING"
  | "BURN_VERIFIED"
  | "PAYOUT_SIMULATED"
  | "COMPLETED"
  | "REJECTED"
  | "FAILED";

export type RedemptionRecord = {
  id: string;
  companyId: string;
  companyWalletId: string;
  amount: string;
  status: RedemptionStatus;
  burnChainId?: number;
  burnTxHash?: `0x${string}`;
  burnLogIndex?: number;
  burnVerifiedAt?: Date;
  payoutSimulatedAt?: Date;
};

export type CreateRedemptionRequestInput = {
  company: RedemptionCompany;
  companyWallet: RedemptionWallet;
  amount: string;
  requestedBy: string;
};

export type RedemptionAuditLogInput = {
  companyId?: string;
  actorType: "system" | "admin" | "company";
  actorId?: string;
  action:
    | "redemption.requested"
    | "redemption.rejected"
    | "redemption.approved"
    | "redemption.burn_verified"
    | "redemption.burn_duplicate_skipped"
    | "redemption.burn_verification_failed"
    | "redemption.payout_simulated"
    | "redemption.completed";
  entityType: "Redemption";
  entityId: string;
  metadata?: Record<string, unknown>;
};

export type BurnEvent = {
  chainId: number;
  txHash: `0x${string}`;
  logIndex: number;
  fromAddress: `0x${string}`;
  amount: string;
};

export type RedemptionRepository = {
  createRedemptionRequest(input: CreateRedemptionRequestInput): Promise<RedemptionRecord>;
  rejectRedemptionRequest(input: {
    companyId: string;
    companyWalletId: string;
    amount: string;
    requestedBy: string;
    reason: string;
  }): Promise<RedemptionRecord>;
  approveRedemptionRequest(id: string, approvedBy: string, approvedAt: Date): Promise<RedemptionRecord>;
  getRedemption(id: string): Promise<RedemptionRecord | null>;
  findRedemptionByBurnEvent(chainId: number, txHash: `0x${string}`, logIndex: number): Promise<RedemptionRecord | null>;
  markBurnVerified(input: {
    redemptionId: string;
    chainId: number;
    txHash: `0x${string}`;
    logIndex: number;
    verifiedAt: Date;
  }): Promise<RedemptionRecord>;
  markBurnVerificationFailed(id: string, reason: string): Promise<RedemptionRecord>;
  markPayoutSimulated(id: string, simulatedAt: Date): Promise<RedemptionRecord>;
  completeRedemption(id: string, completedAt: Date): Promise<RedemptionRecord>;
  createRedemptionAuditLog(input: RedemptionAuditLogInput): Promise<void>;
};

export type CreateRedemptionRequestResult =
  | { created: true; redemption: RedemptionRecord }
  | { created: false; reason: RedemptionEligibilityFailure; redemption: RedemptionRecord };

export type RedemptionEligibilityFailure =
  | "COMPANY_KYB_NOT_APPROVED"
  | "COMPANY_NOT_ACTIVE"
  | "WALLET_COMPANY_MISMATCH"
  | "WALLET_NOT_ACTIVE"
  | "WALLET_NOT_WHITELISTED"
  | "INVALID_AMOUNT";

export async function createRedemptionRequest({
  company,
  companyWallet,
  amount,
  requestedBy,
  repository,
}: CreateRedemptionRequestInput & {
  repository: RedemptionRepository;
}): Promise<CreateRedemptionRequestResult> {
  const failure = firstRedemptionEligibilityFailure({ company, companyWallet, amount });

  if (failure !== null) {
    const redemption = await repository.rejectRedemptionRequest({
      companyId: company.id,
      companyWalletId: companyWallet.id,
      amount,
      requestedBy,
      reason: failure,
    });
    await repository.createRedemptionAuditLog({
      companyId: company.id,
      actorType: "company",
      actorId: requestedBy,
      action: "redemption.rejected",
      entityType: "Redemption",
      entityId: redemption.id,
      metadata: { reason: failure },
    });

    return { created: false, reason: failure, redemption };
  }

  const redemption = await repository.createRedemptionRequest({
    company,
    companyWallet,
    amount,
    requestedBy,
  });
  await repository.createRedemptionAuditLog({
    companyId: company.id,
    actorType: "company",
    actorId: requestedBy,
    action: "redemption.requested",
    entityType: "Redemption",
    entityId: redemption.id,
    metadata: { amount, walletAddress: companyWallet.address },
  });

  return { created: true, redemption };
}

export async function approveRedemptionRequest({
  redemptionId,
  approvedBy,
  repository,
  now = new Date(),
}: {
  redemptionId: string;
  approvedBy: string;
  repository: RedemptionRepository;
  now?: Date;
}): Promise<RedemptionRecord> {
  const redemption = await repository.approveRedemptionRequest(redemptionId, approvedBy, now);
  await repository.createRedemptionAuditLog({
    companyId: redemption.companyId,
    actorType: "admin",
    actorId: approvedBy,
    action: "redemption.approved",
    entityType: "Redemption",
    entityId: redemption.id,
    metadata: { approvedAt: now.toISOString() },
  });

  return redemption;
}

export async function verifyRedemptionBurn({
  redemptionId,
  burnEvent,
  expectedWallet,
  repository,
  now = new Date(),
}: {
  redemptionId: string;
  burnEvent: BurnEvent;
  expectedWallet: RedemptionWallet;
  repository: RedemptionRepository;
  now?: Date;
}): Promise<{ verified: boolean; reason?: string; redemption: RedemptionRecord }> {
  const redemption = await requireRedemption(repository, redemptionId);
  const existingBurn = await repository.findRedemptionByBurnEvent(
    burnEvent.chainId,
    burnEvent.txHash,
    burnEvent.logIndex,
  );

  if (existingBurn !== null) {
    await repository.createRedemptionAuditLog({
      companyId: redemption.companyId,
      actorType: "system",
      action: "redemption.burn_duplicate_skipped",
      entityType: "Redemption",
      entityId: redemption.id,
      metadata: {
        existingRedemptionId: existingBurn.id,
        txHash: burnEvent.txHash,
        logIndex: burnEvent.logIndex,
      },
    });

    return {
      verified: false,
      reason: existingBurn.id === redemption.id ? "BURN_ALREADY_VERIFIED" : "BURN_EVENT_ALREADY_USED",
      redemption: existingBurn.id === redemption.id ? existingBurn : redemption,
    };
  }

  const failure = burnVerificationFailure(redemption, burnEvent, expectedWallet);
  if (failure !== null) {
    const failed = await repository.markBurnVerificationFailed(redemption.id, failure);
    await repository.createRedemptionAuditLog({
      companyId: redemption.companyId,
      actorType: "system",
      action: "redemption.burn_verification_failed",
      entityType: "Redemption",
      entityId: redemption.id,
      metadata: { reason: failure, burnEvent },
    });

    return { verified: false, reason: failure, redemption: failed };
  }

  const verified = await repository.markBurnVerified({
    redemptionId: redemption.id,
    chainId: burnEvent.chainId,
    txHash: burnEvent.txHash,
    logIndex: burnEvent.logIndex,
    verifiedAt: now,
  });
  await repository.createRedemptionAuditLog({
    companyId: redemption.companyId,
    actorType: "system",
    action: "redemption.burn_verified",
    entityType: "Redemption",
    entityId: redemption.id,
    metadata: {
      chainId: burnEvent.chainId,
      txHash: burnEvent.txHash,
      logIndex: burnEvent.logIndex,
      amount: burnEvent.amount,
    },
  });

  return { verified: true, redemption: verified };
}

export async function simulateRedemptionPayout({
  redemptionId,
  repository,
  now = new Date(),
}: {
  redemptionId: string;
  repository: RedemptionRepository;
  now?: Date;
}): Promise<{ simulated: boolean; reason?: string; redemption: RedemptionRecord }> {
  const redemption = await requireRedemption(repository, redemptionId);

  if (redemption.status === "COMPLETED" || redemption.status === "PAYOUT_SIMULATED") {
    return { simulated: false, reason: "PAYOUT_ALREADY_SIMULATED", redemption };
  }

  if (redemption.status !== "BURN_VERIFIED") {
    return { simulated: false, reason: "BURN_NOT_VERIFIED", redemption };
  }

  const paid = await repository.markPayoutSimulated(redemption.id, now);
  await repository.createRedemptionAuditLog({
    companyId: redemption.companyId,
    actorType: "system",
    action: "redemption.payout_simulated",
    entityType: "Redemption",
    entityId: redemption.id,
    metadata: { payoutSimulatedAt: now.toISOString() },
  });

  const completed = await repository.completeRedemption(paid.id, now);
  await repository.createRedemptionAuditLog({
    companyId: completed.companyId,
    actorType: "system",
    action: "redemption.completed",
    entityType: "Redemption",
    entityId: completed.id,
    metadata: { completedAt: now.toISOString() },
  });

  return { simulated: true, redemption: completed };
}

function firstRedemptionEligibilityFailure({
  company,
  companyWallet,
  amount,
}: {
  company: RedemptionCompany;
  companyWallet: RedemptionWallet;
  amount: string;
}): RedemptionEligibilityFailure | null {
  if (company.kybStatus !== "APPROVED") {
    return "COMPANY_KYB_NOT_APPROVED";
  }

  if (company.status !== "ACTIVE") {
    return "COMPANY_NOT_ACTIVE";
  }

  if (companyWallet.companyId !== company.id) {
    return "WALLET_COMPANY_MISMATCH";
  }

  if (!companyWallet.isActive) {
    return "WALLET_NOT_ACTIVE";
  }

  if (companyWallet.whitelistStatus !== "WHITELISTED") {
    return "WALLET_NOT_WHITELISTED";
  }

  if (parseDecimal6(amount) <= 0n) {
    return "INVALID_AMOUNT";
  }

  return null;
}

function burnVerificationFailure(
  redemption: RedemptionRecord,
  burnEvent: BurnEvent,
  expectedWallet: RedemptionWallet,
): string | null {
  if (redemption.status !== "BURN_PENDING") {
    return "REDEMPTION_NOT_BURN_PENDING";
  }

  if (expectedWallet.id !== redemption.companyWalletId || expectedWallet.companyId !== redemption.companyId) {
    return "WALLET_REDEMPTION_MISMATCH";
  }

  if (burnEvent.chainId !== expectedWallet.chainId) {
    return "BURN_CHAIN_MISMATCH";
  }

  if (normalizeAddress(burnEvent.fromAddress) !== normalizeAddress(expectedWallet.address)) {
    return "BURN_SOURCE_WALLET_MISMATCH";
  }

  if (parseDecimal6(burnEvent.amount) !== parseDecimal6(redemption.amount)) {
    return "BURN_AMOUNT_MISMATCH";
  }

  return null;
}

async function requireRedemption(repository: RedemptionRepository, redemptionId: string): Promise<RedemptionRecord> {
  const redemption = await repository.getRedemption(redemptionId);

  if (redemption === null) {
    throw new Error(`Redemption ${redemptionId} was not found.`);
  }

  return redemption;
}

function normalizeAddress(address: `0x${string}`): string {
  return address.toLowerCase();
}

function parseDecimal6(value: string): bigint {
  if (!/^\d+(\.\d{1,6})?$/.test(value)) {
    throw new Error(`Invalid 6-decimal amount: ${value}`);
  }

  const [whole, fractional = ""] = value.split(".");
  return BigInt(whole) * 1_000_000n + BigInt(fractional.padEnd(6, "0"));
}
