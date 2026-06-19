import "dotenv/config";

import { network } from "hardhat";
import { parseUnits } from "viem";

import { ORMB_MINTER_ROLE } from "../src/lib/staging/base-sepolia-mint-gateway.js";
import {
  requireAddress,
  requireAmount,
  requireBaseSepolia,
  requireTestnetScriptConfirmation,
} from "./contract-script-guards.js";

requireTestnetScriptConfirmation();

const connection = await network.create("baseSepoliaMinter");

try {
  const { viem } = connection;
  const publicClient = await viem.getPublicClient();
  const chainId = await publicClient.getChainId();
  await requireBaseSepolia(chainId);

  const [minter] = await viem.getWalletClients();
  if (minter === undefined) {
    throw new Error("No dedicated minter wallet client is configured for baseSepoliaMinter.");
  }

  const ormbAddress = requireAddress("ORMB_CONTRACT_ADDRESS");
  const expectedMinter = requireFirstAddress("BASE_SEPOLIA_MINTER_ADDRESS", "MINTER_ROLE_ADDRESS");
  const recipient = requireAddress("MINT_TO_ADDRESS");
  const amount = parseUnits(requireAmount("MINT_AMOUNT_ORMB"), 6);
  const minterAddress = minter.account.address;

  if (minterAddress.toLowerCase() !== expectedMinter.toLowerCase()) {
    throw new Error("Configured minter wallet does not match BASE_SEPOLIA_MINTER_ADDRESS.");
  }

  const ormb = await viem.getContractAt("ORMBToken", ormbAddress, {
    client: { wallet: minter },
  });
  const paused = await ormb.read.paused();
  if (paused) {
    throw new Error("ORMB contract is paused; manual mint script stopped before transaction submission.");
  }

  const hasMinterRole = await ormb.read.hasRole([ORMB_MINTER_ROLE, minterAddress]);
  if (!hasMinterRole) {
    throw new Error("Dedicated minter wallet does not have ORMB MINTER_ROLE.");
  }

  const recipientWhitelisted = await ormb.read.isWhitelisted([recipient]);
  if (!recipientWhitelisted) {
    throw new Error("MINT_TO_ADDRESS is not whitelisted.");
  }

  const txHash = await ormb.write.mint([recipient, amount]);

  console.log(
    JSON.stringify(
      {
        network: "baseSepolia",
        chainId,
        ormb: ormbAddress,
        minter: minterAddress,
        recipient,
        amount: amount.toString(),
        txHash,
      },
      null,
      2,
    ),
  );
} finally {
  await connection.close();
}

function requireFirstAddress(...names: string[]): `0x${string}` {
  for (const name of names) {
    const value = process.env[name];
    if (value !== undefined && value.trim() !== "" && value !== "0x0000000000000000000000000000000000000000") {
      return requireAddress(name);
    }
  }

  throw new Error(`${names.join(" or ")} must be configured as a valid 0x address.`);
}
