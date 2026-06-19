import "dotenv/config";

import { network } from "hardhat";
import { parseUnits } from "viem";

import {
  requireAddress,
  requireAmount,
  requireBaseSepolia,
  requireTestnetScriptConfirmation,
} from "./contract-script-guards.js";

requireTestnetScriptConfirmation();

const connection = await network.create("baseSepoliaBurner");

try {
  const { viem } = connection;
  const publicClient = await viem.getPublicClient();
  const chainId = await publicClient.getChainId();
  await requireBaseSepolia(chainId);

  const [burner] = await viem.getWalletClients();
  if (burner === undefined) {
    throw new Error("No burner wallet client is configured for baseSepoliaBurner.");
  }

  const ormbAddress = requireAddress("ORMB_CONTRACT_ADDRESS");
  const expectedBurner = requireAddress("BURN_FROM_ADDRESS");
  const amount = parseUnits(requireAmount("BURN_AMOUNT_ORMB"), 6);
  const burnerAddress = burner.account.address;

  if (burnerAddress.toLowerCase() !== expectedBurner.toLowerCase()) {
    throw new Error("Configured burner wallet does not match BURN_FROM_ADDRESS.");
  }

  const ormb = await viem.getContractAt("ORMBToken", ormbAddress, {
    client: { wallet: burner },
  });
  const paused = await ormb.read.paused();
  if (paused) {
    throw new Error("ORMB contract is paused; burn script stopped before transaction submission.");
  }

  const balance = await ormb.read.balanceOf([burnerAddress]) as bigint;
  if (balance < amount) {
    throw new Error("BURN_FROM_ADDRESS does not have enough ORMB for the requested burn amount.");
  }

  const txHash = await ormb.write.burn([amount]);

  console.log(
    JSON.stringify(
      {
        network: "baseSepolia",
        chainId,
        ormb: ormbAddress,
        burner: burnerAddress,
        amount: amount.toString(),
        preBurnBalance: balance.toString(),
        txHash,
      },
      null,
      2,
    ),
  );
} finally {
  await connection.close();
}
