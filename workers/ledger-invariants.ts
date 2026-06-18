export type LedgerDepositStatus = "DETECTED" | "CONFIRMING" | "CONFIRMED" | "REJECTED" | "MINT_REQUESTED";
export type LedgerMintRequestStatus = "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "MINTING" | "MINTED" | "FAILED";
export type LedgerMintStatus = "PENDING" | "SUBMITTED" | "CONFIRMED" | "FAILED";
export type LedgerRedemptionStatus =
  | "REQUESTED"
  | "BURN_PENDING"
  | "BURN_VERIFIED"
  | "PAYOUT_SIMULATED"
  | "COMPLETED"
  | "REJECTED"
  | "FAILED";

export type LedgerDeposit = {
  id: string;
  status: LedgerDepositStatus;
  amount: string;
};

export type LedgerMintRequest = {
  id: string;
  depositId: string;
  status: LedgerMintRequestStatus;
  ormbAmount: string;
};

export type LedgerMint = {
  id: string;
  mintRequestId: string;
  status: LedgerMintStatus;
  amount: string;
};

export type LedgerRedemption = {
  id: string;
  status: LedgerRedemptionStatus;
  amount: string;
  burnChainId?: number;
  burnTxHash?: `0x${string}`;
  burnLogIndex?: number;
};

export type DemoLedgerSnapshot = {
  deposits: LedgerDeposit[];
  mintRequests: LedgerMintRequest[];
  mints: LedgerMint[];
  redemptions: LedgerRedemption[];
  onChainSupply?: string;
};

export type LedgerInvariantCode =
  | "MINT_REQUEST_DEPOSIT_MISSING"
  | "MINT_REQUEST_DEPOSIT_NOT_CONFIRMED"
  | "DUPLICATE_MINT_REQUEST_FOR_DEPOSIT"
  | "MINT_REQUEST_MARKED_MINTED_WITHOUT_CONFIRMED_MINT"
  | "MINT_REQUEST_AMOUNT_MISMATCH"
  | "MINT_MINT_REQUEST_MISSING"
  | "DUPLICATE_MINT_FOR_MINT_REQUEST"
  | "MINT_AMOUNT_MISMATCH"
  | "BURN_EVENT_MISSING"
  | "DUPLICATE_BURN_EVENT"
  | "BURNS_EXCEED_CONFIRMED_MINTS"
  | "ON_CHAIN_SUPPLY_MISMATCH";

export type LedgerInvariantFailure = {
  code: LedgerInvariantCode;
  message: string;
  entityId?: string;
};

export type LedgerInvariantTotals = {
  confirmedMintedOrmB: string;
  verifiedBurnedOrmB: string;
  expectedOnChainSupply: string;
};

export type LedgerInvariantResult = {
  valid: boolean;
  failures: LedgerInvariantFailure[];
  totals: LedgerInvariantTotals;
};

const DEPOSIT_STATUSES_ALLOWED_FOR_MINT_REQUEST = new Set<LedgerDepositStatus>(["CONFIRMED", "MINT_REQUESTED"]);
const CONFIRMED_MINT_STATUSES = new Set<LedgerMintStatus>(["CONFIRMED"]);
const VERIFIED_BURN_STATUSES = new Set<LedgerRedemptionStatus>(["BURN_VERIFIED", "PAYOUT_SIMULATED", "COMPLETED"]);

export function evaluateDemoLedgerInvariants(snapshot: DemoLedgerSnapshot): LedgerInvariantResult {
  const failures: LedgerInvariantFailure[] = [];
  const depositsById = new Map(snapshot.deposits.map((deposit) => [deposit.id, deposit]));
  const mintRequestsById = new Map(snapshot.mintRequests.map((request) => [request.id, request]));
  const mintRequestsByDeposit = groupBy(snapshot.mintRequests, (request) => request.depositId);
  const mintsByMintRequest = groupBy(snapshot.mints, (mint) => mint.mintRequestId);
  const burnEvents = new Set<string>();

  for (const [depositId, requests] of mintRequestsByDeposit) {
    if (requests.length > 1) {
      failures.push(failure("DUPLICATE_MINT_REQUEST_FOR_DEPOSIT", "Deposit has more than one mint request.", depositId));
    }
  }

  for (const request of snapshot.mintRequests) {
    const deposit = depositsById.get(request.depositId);
    const linkedConfirmedMints = (mintsByMintRequest.get(request.id) ?? []).filter((mint) =>
      CONFIRMED_MINT_STATUSES.has(mint.status),
    );

    if (deposit === undefined) {
      failures.push(failure("MINT_REQUEST_DEPOSIT_MISSING", "Mint request references a missing deposit.", request.id));
    } else if (!DEPOSIT_STATUSES_ALLOWED_FOR_MINT_REQUEST.has(deposit.status)) {
      failures.push(
        failure("MINT_REQUEST_DEPOSIT_NOT_CONFIRMED", "Mint request references a deposit that is not confirmed.", request.id),
      );
    }

    if (request.status === "MINTED" && linkedConfirmedMints.length === 0) {
      failures.push(
        failure(
          "MINT_REQUEST_MARKED_MINTED_WITHOUT_CONFIRMED_MINT",
          "Mint request is marked minted without a confirmed mint record.",
          request.id,
        ),
      );
    }

    for (const mint of linkedConfirmedMints) {
      if (compareDecimal6(mint.amount, request.ormbAmount) !== 0) {
        failures.push(
          failure("MINT_REQUEST_AMOUNT_MISMATCH", "Confirmed mint amount does not match mint request amount.", request.id),
        );
      }
    }
  }

  for (const [mintRequestId, mints] of mintsByMintRequest) {
    const confirmedMints = mints.filter((mint) => CONFIRMED_MINT_STATUSES.has(mint.status));
    if (confirmedMints.length > 1) {
      failures.push(
        failure("DUPLICATE_MINT_FOR_MINT_REQUEST", "Mint request has more than one confirmed mint.", mintRequestId),
      );
    }
  }

  for (const mint of snapshot.mints) {
    const request = mintRequestsById.get(mint.mintRequestId);
    if (request === undefined) {
      failures.push(failure("MINT_MINT_REQUEST_MISSING", "Mint references a missing mint request.", mint.id));
      continue;
    }

    if (CONFIRMED_MINT_STATUSES.has(mint.status) && compareDecimal6(mint.amount, request.ormbAmount) !== 0) {
      failures.push(failure("MINT_AMOUNT_MISMATCH", "Mint amount does not match mint request amount.", mint.id));
    }
  }

  for (const redemption of snapshot.redemptions) {
    if (!VERIFIED_BURN_STATUSES.has(redemption.status)) {
      continue;
    }

    if (
      redemption.burnChainId === undefined ||
      redemption.burnTxHash === undefined ||
      redemption.burnLogIndex === undefined
    ) {
      failures.push(failure("BURN_EVENT_MISSING", "Verified burn redemption is missing burn event identity.", redemption.id));
      continue;
    }

    const eventKey = `${redemption.burnChainId}:${redemption.burnTxHash}:${redemption.burnLogIndex}`;
    if (burnEvents.has(eventKey)) {
      failures.push(failure("DUPLICATE_BURN_EVENT", "Burn event is used by more than one redemption.", redemption.id));
    }
    burnEvents.add(eventKey);
  }

  const confirmedMinted = sumDecimal6(
    snapshot.mints.filter((mint) => CONFIRMED_MINT_STATUSES.has(mint.status)).map((mint) => mint.amount),
  );
  const verifiedBurned = sumDecimal6(
    snapshot.redemptions
      .filter((redemption) => VERIFIED_BURN_STATUSES.has(redemption.status))
      .map((redemption) => redemption.amount),
  );
  const expectedSupply = confirmedMinted - verifiedBurned;

  if (expectedSupply < 0n) {
    failures.push(failure("BURNS_EXCEED_CONFIRMED_MINTS", "Verified burns exceed confirmed minted ORMB."));
  }

  if (snapshot.onChainSupply !== undefined && compareParsedDecimal6(expectedSupply, snapshot.onChainSupply) !== 0) {
    failures.push(failure("ON_CHAIN_SUPPLY_MISMATCH", "Expected supply does not match supplied on-chain supply."));
  }

  return {
    valid: failures.length === 0,
    failures,
    totals: {
      confirmedMintedOrmB: formatDecimal6(confirmedMinted),
      verifiedBurnedOrmB: formatDecimal6(verifiedBurned),
      expectedOnChainSupply: formatDecimal6(expectedSupply),
    },
  };
}

function failure(code: LedgerInvariantCode, message: string, entityId?: string): LedgerInvariantFailure {
  return { code, message, entityId };
}

function groupBy<T>(items: T[], keyFor: (item: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = keyFor(item);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return groups;
}

function sumDecimal6(values: string[]): bigint {
  return values.reduce((sum, value) => sum + parseDecimal6(value), 0n);
}

function compareDecimal6(left: string, right: string): number {
  return compareParsedDecimal6(parseDecimal6(left), right);
}

function compareParsedDecimal6(left: bigint, right: string): number {
  const rightValue = parseDecimal6(right);
  if (left === rightValue) {
    return 0;
  }

  return left > rightValue ? 1 : -1;
}

function parseDecimal6(value: string): bigint {
  if (!/^\d+(\.\d{1,6})?$/.test(value)) {
    throw new Error(`Invalid 6-decimal amount: ${value}`);
  }

  const [whole, fractional = ""] = value.split(".");
  return BigInt(whole) * 1_000_000n + BigInt(fractional.padEnd(6, "0"));
}

function formatDecimal6(value: bigint): string {
  const sign = value < 0n ? "-" : "";
  const absolute = value < 0n ? -value : value;
  const whole = absolute / 1_000_000n;
  const fractional = absolute % 1_000_000n;

  if (fractional === 0n) {
    return `${sign}${whole}`;
  }

  return `${sign}${whole}.${fractional.toString().padStart(6, "0").replace(/0+$/, "")}`;
}
