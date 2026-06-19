import "dotenv/config";

import { network } from "hardhat";

import { ORMB_MINTER_ROLE } from "../src/lib/staging/base-sepolia-mint-gateway.js";
import {
  formatMinterRoleReadinessReport,
  runMinterRoleReadiness,
} from "../src/lib/config/minter-role-readiness.js";
import { requireBaseSepolia } from "./contract-script-guards.js";

const report = runMinterRoleReadiness(process.env);
console.log(formatMinterRoleReadinessReport(report));

if (!report.ok || report.action === undefined) {
  process.exit(1);
}

const connection = await network.create("baseSepolia");

try {
  const { viem } = connection;
  const publicClient = await viem.getPublicClient();
  const chainId = await publicClient.getChainId();
  await requireBaseSepolia(chainId);

  const ormbAddress = process.env.ORMB_CONTRACT_ADDRESS as `0x${string}`;
  const minterAddress = firstConfiguredAddress(process.env.BASE_SEPOLIA_MINTER_ADDRESS, process.env.MINTER_ROLE_ADDRESS) as `0x${string}`;
  const ormb = await viem.getContractAt("ORMBToken", ormbAddress);
  const alreadyHasRole = await ormb.read.hasRole([ORMB_MINTER_ROLE, minterAddress]);

  if (report.action === "verify") {
    printResult({ action: "verify", chainId, ormb: ormbAddress, minter: minterAddress, hasRole: alreadyHasRole });
  } else if (report.action === "grant") {
    if (alreadyHasRole) {
      printResult({ action: "grant", chainId, ormb: ormbAddress, minter: minterAddress, alreadyHasRole });
    } else {
      const txHash = await ormb.write.grantRole([ORMB_MINTER_ROLE, minterAddress]);
      printResult({ action: "grant", chainId, ormb: ormbAddress, minter: minterAddress, txHash });
    }
  } else if (!alreadyHasRole) {
    printResult({ action: "revoke", chainId, ormb: ormbAddress, minter: minterAddress, alreadyHasRole });
  } else {
    const txHash = await ormb.write.revokeRole([ORMB_MINTER_ROLE, minterAddress]);
    printResult({ action: "revoke", chainId, ormb: ormbAddress, minter: minterAddress, txHash });
  }
} finally {
  await connection.close();
}

function printResult(result: Record<string, unknown>) {
  console.log(JSON.stringify({ network: "baseSepolia", ...result }, null, 2));
}

function firstConfiguredAddress(...values: Array<string | undefined>): string | undefined {
  return values.find(
    (value) =>
      value !== undefined &&
      value.trim() !== "" &&
      value !== "0x0000000000000000000000000000000000000000",
  );
}
