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

const connection = await network.create("baseSepolia");

try {
  const { viem } = connection;
  const publicClient = await viem.getPublicClient();
  const chainId = await publicClient.getChainId();
  await requireBaseSepolia(chainId);

  const ormbAddress = requireAddress("ORMB_CONTRACT_ADDRESS");
  const recipient = requireAddress("MINT_TO_ADDRESS");
  const amount = parseUnits(requireAmount("MINT_AMOUNT_ORMB"), 6);
  const ormb = await viem.getContractAt("ORMBToken", ormbAddress);

  const txHash = await ormb.write.mint([recipient, amount]);

  console.log(
    JSON.stringify(
      {
        network: "baseSepolia",
        chainId,
        ormb: ormbAddress,
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
