import "dotenv/config";

import { network } from "hardhat";

import { requireBaseSepolia, requireTestnetScriptConfirmation } from "./contract-script-guards.js";

requireTestnetScriptConfirmation();

const connection = await network.create("baseSepolia");

try {
  const { viem } = connection;
  const publicClient = await viem.getPublicClient();
  const chainId = await publicClient.getChainId();
  await requireBaseSepolia(chainId);

  const [deployer] = await viem.getWalletClients();
  const mockUsdt = await viem.deployContract("MockUSDT");
  const ormb = await viem.deployContract("ORMBToken", [deployer.account.address]);

  console.log(
    JSON.stringify(
      {
        network: "baseSepolia",
        chainId,
        deployer: deployer.account.address,
        mockUsdt: mockUsdt.address,
        ormb: ormb.address,
      },
      null,
      2,
    ),
  );
} finally {
  await connection.close();
}
