export type StagingReconciliationInput = {
  manualDeposits: string;
  mintedOrmB: string;
  burnedOrmB: string;
  onChainSupply: string;
  simulatedReserve: string;
};

export type StagingReconciliationWarning =
  | "SUPPLY_MISMATCH"
  | "RESERVE_MISMATCH"
  | "BURNS_EXCEED_MINTS";

export type StagingReconciliationSummary = {
  expectedSupply: string;
  simulatedReserve: string;
  warnings: StagingReconciliationWarning[];
  readyForOperatorReview: boolean;
};

export function summarizeStagingReconciliation(input: StagingReconciliationInput): StagingReconciliationSummary {
  const manualDeposits = parseDecimal6(input.manualDeposits, "manualDeposits");
  const mintedOrmB = parseDecimal6(input.mintedOrmB, "mintedOrmB");
  const burnedOrmB = parseDecimal6(input.burnedOrmB, "burnedOrmB");
  const onChainSupply = parseDecimal6(input.onChainSupply, "onChainSupply");
  const simulatedReserve = parseDecimal6(input.simulatedReserve, "simulatedReserve");
  const expectedSupply = mintedOrmB - burnedOrmB;
  const warnings: StagingReconciliationWarning[] = [];

  if (expectedSupply < 0n) {
    warnings.push("BURNS_EXCEED_MINTS");
  }

  if (expectedSupply !== onChainSupply) {
    warnings.push("SUPPLY_MISMATCH");
  }

  if (manualDeposits !== simulatedReserve) {
    warnings.push("RESERVE_MISMATCH");
  }

  return {
    expectedSupply: formatDecimal6(expectedSupply),
    simulatedReserve: formatDecimal6(simulatedReserve),
    warnings,
    readyForOperatorReview: warnings.length === 0,
  };
}

function parseDecimal6(value: string, label: string): bigint {
  if (!/^\d+(\.\d{1,6})?$/.test(value)) {
    throw new Error(`${label} must be a non-negative decimal with up to 6 fractional digits.`);
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
