import "dotenv/config";

import { network } from "hardhat";

import {
  requireAddress,
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
  const wallet = requireAddress("WHITELIST_WALLET");
  const enabled = process.env.WHITELIST_ENABLED !== "false";
  const ormb = await viem.getContractAt("ORMBToken", ormbAddress);

  const txHash = await ormb.write.setWhitelisted([wallet, enabled]);

  console.log(
    JSON.stringify(
      {
        network: "baseSepolia",
        chainId,
        ormb: ormbAddress,
        wallet,
        whitelisted: enabled,
        txHash,
      },
      null,
      2,
    ),
  );
} finally {
  await connection.close();
}
