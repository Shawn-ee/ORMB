import { isAddress, keccak256, parseUnits, stringToBytes } from "viem";

import type { MintGateway } from "../../../workers/mint-request-flow.js";

export const BASE_SEPOLIA_CHAIN_ID = 84532;
export const ORMB_MINTER_ROLE = keccak256(stringToBytes("MINTER_ROLE"));

export type ChainIdReader = {
  getChainId(): Promise<number>;
};

export type OrmbMintContract = {
  read?: {
    hasRole?: (args: readonly [`0x${string}`, `0x${string}`]) => Promise<boolean>;
    isWhitelisted?: (args: readonly [`0x${string}`]) => Promise<boolean>;
  };
  write: {
    mint: (args: readonly [`0x${string}`, bigint]) => Promise<`0x${string}`>;
  };
};

export type BaseSepoliaMintGatewayInput = {
  publicClient: ChainIdReader;
  ormb: OrmbMintContract;
  minterAddress?: `0x${string}`;
};

export function createBaseSepoliaMintGateway({
  publicClient,
  ormb,
  minterAddress,
}: BaseSepoliaMintGatewayInput): MintGateway {
  return {
    async mint(toAddress, amount) {
      const parsedAmount = parseOrmbAmount(amount);
      await assertBaseSepolia(publicClient);
      await assertOptionalMinterRole(ormb, minterAddress);
      await assertOptionalWhitelistedRecipient(ormb, toAddress);

      return {
        txHash: await ormb.write.mint([toAddress, parsedAmount]),
      };
    },
  };
}

export function parseOrmbAmount(amount: string): bigint {
  if (!/^\d+(\.\d{1,6})?$/.test(amount)) {
    throw new Error("ORMB mint amount must be a positive decimal with up to 6 fractional digits.");
  }

  const parsed = parseUnits(amount, 6);
  if (parsed <= 0n) {
    throw new Error("ORMB mint amount must be greater than zero.");
  }

  return parsed;
}

async function assertBaseSepolia(publicClient: ChainIdReader) {
  const chainId = await publicClient.getChainId();
  if (chainId !== BASE_SEPOLIA_CHAIN_ID) {
    throw new Error(`Testnet mint gateway requires Base Sepolia chain ${BASE_SEPOLIA_CHAIN_ID}; received ${chainId}.`);
  }
}

async function assertOptionalMinterRole(ormb: OrmbMintContract, minterAddress: `0x${string}` | undefined) {
  if (minterAddress === undefined || ormb.read?.hasRole === undefined) {
    return;
  }

  if (!isAddress(minterAddress)) {
    throw new Error("Testnet minter address must be a valid 0x address.");
  }

  const hasMinterRole = await ormb.read.hasRole([ORMB_MINTER_ROLE, minterAddress]);
  if (!hasMinterRole) {
    throw new Error("Configured testnet minter does not have ORMB MINTER_ROLE.");
  }
}

async function assertOptionalWhitelistedRecipient(ormb: OrmbMintContract, toAddress: `0x${string}`) {
  if (!isAddress(toAddress)) {
    throw new Error("ORMB mint recipient must be a valid 0x address.");
  }

  if (ormb.read?.isWhitelisted === undefined) {
    return;
  }

  const whitelisted = await ormb.read.isWhitelisted([toAddress]);
  if (!whitelisted) {
    throw new Error("ORMB mint recipient is not whitelisted.");
  }
}
