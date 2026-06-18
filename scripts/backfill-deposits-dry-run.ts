import { readFile } from "node:fs/promises";

import {
  type DryRunBackfillRepository,
  type DryRunKnownCompanyWallet,
  type DryRunTransferLog,
  dryRunMockUsdtBackfill,
} from "../workers/listener-dry-run-backfill.js";

type RawTransferLog = Omit<DryRunTransferLog, "blockNumber" | "amount"> & {
  blockNumber: string | number;
  amount: string;
};

type RawExistingDeposit = {
  chainId: number;
  txHash: `0x${string}`;
  logIndex: number;
};

class FileBackfillRepository implements DryRunBackfillRepository {
  constructor(
    private readonly wallets: DryRunKnownCompanyWallet[],
    private readonly existingDeposits: Set<string>,
  ) {}

  async findActiveCompanyWalletByAddress(chainId: number, address: `0x${string}`) {
    return (
      this.wallets.find(
        (wallet) =>
          wallet.chainId === chainId &&
          wallet.isActive &&
          wallet.address.toLowerCase() === address.toLowerCase(),
      ) ?? null
    );
  }

  async depositExists(chainId: number, txHash: `0x${string}`, logIndex: number) {
    return this.existingDeposits.has(toDepositKey(chainId, txHash, logIndex));
  }
}

const args = parseArgs(process.argv.slice(2));

const logs = (await readJsonFile<RawTransferLog[]>(requiredArg(args, "logs-file"))).map((log) => ({
  ...log,
  blockNumber: BigInt(log.blockNumber),
  amount: BigInt(log.amount),
}));
const wallets = await readJsonFile<DryRunKnownCompanyWallet[]>(requiredArg(args, "known-wallets-file"));
const existingDepositsPath = args["existing-deposits-file"];
const existingDeposits =
  existingDepositsPath === undefined ? [] : await readJsonFile<RawExistingDeposit[]>(existingDepositsPath);
const repository = new FileBackfillRepository(
  wallets,
  new Set(existingDeposits.map((deposit) => toDepositKey(deposit.chainId, deposit.txHash, deposit.logIndex))),
);

const report = await dryRunMockUsdtBackfill({
  chainId: Number(requiredArg(args, "chain-id")),
  treasuryAddress: requiredArg(args, "treasury") as `0x${string}`,
  mockUsdtAddress: requiredArg(args, "mock-usdt") as `0x${string}`,
  fromBlock: BigInt(requiredArg(args, "from-block")),
  toBlock: BigInt(requiredArg(args, "to-block")),
  batchSize: BigInt(args["batch-size"] ?? "500"),
  maxBlocks: BigInt(args["max-blocks"] ?? "5000"),
  logs,
  repository,
});

console.log(stringifyWithBigInt(report));

function parseArgs(argv: string[]) {
  const parsed: Record<string, string> = {};

  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];

    if (key === undefined || !key.startsWith("--") || value === undefined || value.startsWith("--")) {
      throw new Error(`Invalid argument list. Expected --key value pairs.`);
    }

    parsed[key.slice(2)] = value;
  }

  return parsed;
}

function requiredArg(argsByName: Record<string, string>, name: string) {
  const value = argsByName[name];

  if (value === undefined || value.trim() === "") {
    throw new Error(`Missing required argument --${name}.`);
  }

  return value;
}

async function readJsonFile<T>(path: string): Promise<T> {
  return JSON.parse(stripUtf8Bom(await readFile(path, "utf8"))) as T;
}

function toDepositKey(chainId: number, txHash: `0x${string}`, logIndex: number) {
  return `${chainId}:${txHash.toLowerCase()}:${logIndex}`;
}

function stringifyWithBigInt(value: unknown) {
  return JSON.stringify(
    value,
    (_key, innerValue) => (typeof innerValue === "bigint" ? innerValue.toString() : innerValue),
    2,
  );
}

function stripUtf8Bom(value: string) {
  return value.charCodeAt(0) === 0xfeff ? value.slice(1) : value;
}
