export type CompanyKybStatus = "PENDING" | "APPROVED" | "REJECTED";
export type CompanyStatus = "ACTIVE" | "SUSPENDED" | "ARCHIVED";
export type WalletWhitelistStatus = "PENDING" | "WHITELISTED" | "REJECTED" | "REMOVED";
export type DepositRiskStatus = "DETECTED" | "CONFIRMING" | "CONFIRMED" | "REJECTED" | "MINT_REQUESTED";

export type RiskCompany = {
  id: string;
  kybStatus: CompanyKybStatus;
  status: CompanyStatus;
};

export type RiskWallet = {
  id: string;
  companyId: string;
  isActive: boolean;
  whitelistStatus: WalletWhitelistStatus;
};

export type RiskDeposit = {
  id: string;
  companyId?: string;
  company?: RiskCompany;
  sourceWallet?: RiskWallet;
  receivingWallet?: RiskWallet;
  amount: string;
  status: DepositRiskStatus;
  hasMintRequest: boolean;
  hasMint: boolean;
};

export type RiskCheckCode =
  | "COMPANY_MISSING"
  | "COMPANY_KYB_NOT_APPROVED"
  | "COMPANY_NOT_ACTIVE"
  | "SOURCE_WALLET_UNKNOWN"
  | "SOURCE_WALLET_INACTIVE"
  | "SOURCE_WALLET_COMPANY_MISMATCH"
  | "RECEIVING_WALLET_MISSING"
  | "RECEIVING_WALLET_INACTIVE"
  | "RECEIVING_WALLET_NOT_WHITELISTED"
  | "RECEIVING_WALLET_COMPANY_MISMATCH"
  | "DEPOSIT_NOT_CONFIRMED"
  | "DEPOSIT_ALREADY_HAS_MINT_REQUEST"
  | "DEPOSIT_ALREADY_MINTED"
  | "DEPOSIT_EXCEEDS_AUTO_MINT_LIMIT"
  | "DAILY_MINT_LIMIT_EXCEEDED";

export type RiskCheckFailure = {
  code: RiskCheckCode;
  message: string;
};

export type RiskDecision = {
  eligible: boolean;
  failures: RiskCheckFailure[];
};

export type RiskEventInput = {
  companyId?: string;
  severity: "MEDIUM" | "HIGH";
  code: RiskCheckCode;
  message: string;
  entityType: "Deposit";
  entityId: string;
  metadata: Record<string, unknown>;
};

export type RiskAuditLogInput = {
  companyId?: string;
  actorType: "system";
  action: "risk.mint_eligibility.passed" | "risk.mint_eligibility.failed";
  entityType: "Deposit";
  entityId: string;
  metadata: Record<string, unknown>;
};

export type RiskEngineRepository = {
  getDailyMintedUsdtAmount(companyId: string, businessDate: string): Promise<string>;
  createRiskEvent(input: RiskEventInput): Promise<void>;
  createAuditLog(input: RiskAuditLogInput): Promise<void>;
};

export type EvaluateMintRiskInput = {
  deposit: RiskDeposit;
  autoMintLimitUsdt?: string;
  dailyMintLimitUsdt?: string;
  repository: RiskEngineRepository;
  now?: Date;
};

export async function evaluateMintRisk({
  deposit,
  autoMintLimitUsdt,
  dailyMintLimitUsdt,
  repository,
  now = new Date(),
}: EvaluateMintRiskInput): Promise<RiskDecision> {
  const failures: RiskCheckFailure[] = [];
  const company = deposit.company;
  const sourceWallet = deposit.sourceWallet;
  const receivingWallet = deposit.receivingWallet;

  if (company === undefined || deposit.companyId === undefined) {
    failures.push(failure("COMPANY_MISSING", "Deposit is not associated with a known company."));
  } else {
    if (company.kybStatus !== "APPROVED") {
      failures.push(failure("COMPANY_KYB_NOT_APPROVED", "Company KYB must be approved before mint eligibility."));
    }

    if (company.status !== "ACTIVE") {
      failures.push(failure("COMPANY_NOT_ACTIVE", "Company must be active before mint eligibility."));
    }
  }

  if (sourceWallet === undefined) {
    failures.push(failure("SOURCE_WALLET_UNKNOWN", "Source wallet must be known before mint eligibility."));
  } else {
    if (!sourceWallet.isActive) {
      failures.push(failure("SOURCE_WALLET_INACTIVE", "Source wallet must be active before mint eligibility."));
    }

    if (deposit.companyId !== undefined && sourceWallet.companyId !== deposit.companyId) {
      failures.push(
        failure("SOURCE_WALLET_COMPANY_MISMATCH", "Source wallet must be associated with the deposit company."),
      );
    }
  }

  if (receivingWallet === undefined) {
    failures.push(failure("RECEIVING_WALLET_MISSING", "Receiving wallet must be present before mint eligibility."));
  } else {
    if (!receivingWallet.isActive) {
      failures.push(failure("RECEIVING_WALLET_INACTIVE", "Receiving wallet must be active before mint eligibility."));
    }

    if (receivingWallet.whitelistStatus !== "WHITELISTED") {
      failures.push(
        failure("RECEIVING_WALLET_NOT_WHITELISTED", "Receiving wallet must be whitelisted before mint eligibility."),
      );
    }

    if (deposit.companyId !== undefined && receivingWallet.companyId !== deposit.companyId) {
      failures.push(
        failure("RECEIVING_WALLET_COMPANY_MISMATCH", "Receiving wallet must be associated with the deposit company."),
      );
    }
  }

  if (deposit.status !== "CONFIRMED") {
    failures.push(failure("DEPOSIT_NOT_CONFIRMED", "Deposit must be confirmed before mint eligibility."));
  }

  if (deposit.hasMintRequest) {
    failures.push(
      failure("DEPOSIT_ALREADY_HAS_MINT_REQUEST", "Deposit already has a mint request and cannot create another."),
    );
  }

  if (deposit.hasMint) {
    failures.push(failure("DEPOSIT_ALREADY_MINTED", "Deposit already has a mint record and cannot mint again."));
  }

  if (autoMintLimitUsdt !== undefined && compareDecimal6(deposit.amount, autoMintLimitUsdt) > 0) {
    failures.push(
      failure("DEPOSIT_EXCEEDS_AUTO_MINT_LIMIT", "Deposit amount exceeds the automatic mint request limit."),
    );
  }

  if (dailyMintLimitUsdt !== undefined && deposit.companyId !== undefined) {
    const businessDate = toBusinessDate(now);
    const dailyMinted = await repository.getDailyMintedUsdtAmount(deposit.companyId, businessDate);
    const projectedDailyTotal = addDecimal6(dailyMinted, deposit.amount);

    if (compareDecimal6(projectedDailyTotal, dailyMintLimitUsdt) > 0) {
      failures.push(
        failure("DAILY_MINT_LIMIT_EXCEEDED", "Projected daily mint total exceeds the configured daily limit."),
      );
    }
  }

  await recordRiskOutcome({ deposit, failures, repository, now });

  return {
    eligible: failures.length === 0,
    failures,
  };
}

function failure(code: RiskCheckCode, message: string): RiskCheckFailure {
  return { code, message };
}

async function recordRiskOutcome({
  deposit,
  failures,
  repository,
  now,
}: {
  deposit: RiskDeposit;
  failures: RiskCheckFailure[];
  repository: RiskEngineRepository;
  now: Date;
}) {
  for (const item of failures) {
    await repository.createRiskEvent({
      companyId: deposit.companyId,
      severity: item.code === "SOURCE_WALLET_UNKNOWN" ? "HIGH" : "MEDIUM",
      code: item.code,
      message: item.message,
      entityType: "Deposit",
      entityId: deposit.id,
      metadata: {
        evaluatedAt: now.toISOString(),
        depositStatus: deposit.status,
        depositAmount: deposit.amount,
      },
    });
  }

  await repository.createAuditLog({
    companyId: deposit.companyId,
    actorType: "system",
    action: failures.length === 0 ? "risk.mint_eligibility.passed" : "risk.mint_eligibility.failed",
    entityType: "Deposit",
    entityId: deposit.id,
    metadata: {
      evaluatedAt: now.toISOString(),
      failureCodes: failures.map((item) => item.code),
    },
  });
}

function toBusinessDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function compareDecimal6(left: string, right: string): number {
  const leftValue = parseDecimal6(left);
  const rightValue = parseDecimal6(right);

  if (leftValue === rightValue) {
    return 0;
  }

  return leftValue > rightValue ? 1 : -1;
}

function addDecimal6(left: string, right: string): string {
  const total = parseDecimal6(left) + parseDecimal6(right);
  const whole = total / 1_000_000n;
  const fractional = total % 1_000_000n;

  if (fractional === 0n) {
    return whole.toString();
  }

  return `${whole}.${fractional.toString().padStart(6, "0").replace(/0+$/, "")}`;
}

function parseDecimal6(value: string): bigint {
  if (!/^\d+(\.\d{1,6})?$/.test(value)) {
    throw new Error(`Invalid 6-decimal amount: ${value}`);
  }

  const [whole, fractional = ""] = value.split(".");
  return BigInt(whole) * 1_000_000n + BigInt(fractional.padEnd(6, "0"));
}
