import { isAddress } from "viem";

import type { BurnEvent, RedemptionWallet } from "../../../workers/redemption-burn-flow.js";
import { BASE_SEPOLIA_CHAIN_ID } from "./base-sepolia-mint-gateway";

export type BaseSepoliaBurnEvidenceInput = {
  burnEvent: BurnEvent;
  expectedWallet: RedemptionWallet;
  expectedAmount: string;
};

export function validateBaseSepoliaBurnEvidence({
  burnEvent,
  expectedWallet,
  expectedAmount,
}: BaseSepoliaBurnEvidenceInput): BurnEvent {
  if (burnEvent.chainId !== BASE_SEPOLIA_CHAIN_ID) {
    throw new Error(`Burn evidence must be on Base Sepolia chain ${BASE_SEPOLIA_CHAIN_ID}.`);
  }

  if (expectedWallet.chainId !== BASE_SEPOLIA_CHAIN_ID) {
    throw new Error(`Expected redemption wallet must be on Base Sepolia chain ${BASE_SEPOLIA_CHAIN_ID}.`);
  }

  if (!isValidTxHash(burnEvent.txHash)) {
    throw new Error("Burn evidence transaction hash must be a 32-byte 0x hash.");
  }

  if (!Number.isSafeInteger(burnEvent.logIndex) || burnEvent.logIndex < 0) {
    throw new Error("Burn evidence log index must be a non-negative safe integer.");
  }

  if (!isAddress(burnEvent.fromAddress) || !isAddress(expectedWallet.address)) {
    throw new Error("Burn evidence wallet addresses must be valid 0x addresses.");
  }

  if (burnEvent.fromAddress.toLowerCase() !== expectedWallet.address.toLowerCase()) {
    throw new Error("Burn evidence source wallet does not match the approved redemption wallet.");
  }

  const burnAmount = parseDecimal6(burnEvent.amount, "burn evidence amount");
  const redemptionAmount = parseDecimal6(expectedAmount, "expected redemption amount");
  if (burnAmount !== redemptionAmount) {
    throw new Error("Burn evidence amount does not match the approved redemption amount.");
  }

  return {
    ...burnEvent,
    txHash: burnEvent.txHash.toLowerCase() as `0x${string}`,
    fromAddress: burnEvent.fromAddress.toLowerCase() as `0x${string}`,
    amount: formatDecimal6(burnAmount),
  };
}

function isValidTxHash(txHash: `0x${string}`): boolean {
  return /^0x[0-9a-fA-F]{64}$/.test(txHash);
}

function parseDecimal6(value: string, label: string): bigint {
  if (!/^\d+(\.\d{1,6})?$/.test(value)) {
    throw new Error(`${label} must be a positive decimal with up to 6 fractional digits.`);
  }

  const [whole, fractional = ""] = value.split(".");
  const parsed = BigInt(whole) * 1_000_000n + BigInt(fractional.padEnd(6, "0"));
  if (parsed <= 0n) {
    throw new Error(`${label} must be greater than zero.`);
  }

  return parsed;
}

function formatDecimal6(value: bigint): string {
  const whole = value / 1_000_000n;
  const fractional = value % 1_000_000n;

  if (fractional === 0n) {
    return whole.toString();
  }

  return `${whole}.${fractional.toString().padStart(6, "0").replace(/0+$/, "")}`;
}
