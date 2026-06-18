import { isAddress } from "viem";

export const BASE_SEPOLIA_CHAIN_ID = 84532;

export function requireTestnetScriptConfirmation() {
  if (process.env.ORMB_CONFIRM_TESTNET_DEPLOY !== "YES") {
    throw new Error(
      "Set ORMB_CONFIRM_TESTNET_DEPLOY=YES to run testnet-only contract scripts.",
    );
  }
}

export async function requireBaseSepolia(chainId: number) {
  if (chainId !== BASE_SEPOLIA_CHAIN_ID) {
    throw new Error(`Expected Base Sepolia chain ${BASE_SEPOLIA_CHAIN_ID}; received ${chainId}.`);
  }
}

export function requireAddress(name: string): `0x${string}` {
  const value = process.env[name];

  if (value === undefined || !isAddress(value)) {
    throw new Error(`${name} must be a valid 0x address.`);
  }

  return value;
}

export function requireAmount(name: string): string {
  const value = process.env[name];

  if (value === undefined || value.trim() === "" || Number(value) <= 0) {
    throw new Error(`${name} must be a positive decimal amount.`);
  }

  return value;
}
