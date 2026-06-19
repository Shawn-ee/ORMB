import { summarizeStagingReconciliation } from "../../../../../workers/staging-reconciliation";
import { jsonError, jsonOk, requirePrivateStagingApi } from "../../../../lib/api/private-staging-api";

export async function GET() {
  try {
    requirePrivateStagingApi();
    const { prisma } = await import("../../../../lib/db/prisma");
    const [manualDeposits, mintRows, burnRows] = await Promise.all([
      prisma.deposit.findMany({ where: { source: "MANUAL_STAGING", status: { not: "REJECTED" } }, select: { amount: true } }),
      prisma.mint.findMany({ where: { status: { in: ["SUBMITTED", "CONFIRMED"] } }, select: { amount: true } }),
      prisma.redemption.findMany({ where: { status: { in: ["BURN_VERIFIED", "PAYOUT_SIMULATED", "COMPLETED"] } }, select: { amount: true } }),
    ]);
    const mintedOrmB = sumDecimalRows(mintRows);
    const burnedOrmB = sumDecimalRows(burnRows);
    const summary = summarizeStagingReconciliation({
      manualDeposits: sumDecimalRows(manualDeposits),
      mintedOrmB,
      burnedOrmB,
      onChainSupply: subtractDecimal6(mintedOrmB, burnedOrmB),
      simulatedReserve: sumDecimalRows(manualDeposits),
    });

    return jsonOk({ ok: true, summary });
  } catch (error) {
    return jsonError(error);
  }
}

function sumDecimalRows(rows: Array<{ amount: unknown }>): string {
  return formatDecimal6(rows.reduce((sum, row) => sum + parseDecimal6(String(row.amount)), 0n));
}

function subtractDecimal6(left: string, right: string): string {
  return formatDecimal6(parseDecimal6(left) - parseDecimal6(right));
}

function parseDecimal6(value: string): bigint {
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
