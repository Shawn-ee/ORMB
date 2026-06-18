import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  BASE_SEPOLIA_CHAIN_ID,
  ORMB_MINTER_ROLE,
  createBaseSepoliaMintGateway,
  parseOrmbAmount,
  type OrmbMintContract,
} from "../../src/lib/staging/base-sepolia-mint-gateway.js";

const RECIPIENT = "0x1000000000000000000000000000000000000001";
const MINTER = "0x2000000000000000000000000000000000000002";
const TX_HASH = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

describe("parseOrmbAmount", () => {
  it("parses ORMB decimal amounts to 6-decimal units", () => {
    assert.equal(parseOrmbAmount("12.345678"), 12_345_678n);
  });

  it("rejects zero, negative, and over-precision amounts", () => {
    assert.throws(() => parseOrmbAmount("0"), /greater than zero/);
    assert.throws(() => parseOrmbAmount("-1"), /positive decimal/);
    assert.throws(() => parseOrmbAmount("1.0000001"), /up to 6 fractional digits/);
  });
});

describe("createBaseSepoliaMintGateway", () => {
  it("mints through the ORMB contract after Base Sepolia, role, and whitelist preflight", async () => {
    const contract = fakeOrmbContract();
    const gateway = createBaseSepoliaMintGateway({
      publicClient: chain(BASE_SEPOLIA_CHAIN_ID),
      ormb: contract,
      minterAddress: MINTER,
    });

    const result = await gateway.mint(RECIPIENT, "100.5");

    assert.equal(result.txHash, TX_HASH);
    assert.deepEqual(contract.mintCalls, [[RECIPIENT, 100_500_000n]]);
    assert.deepEqual(contract.roleChecks, [[ORMB_MINTER_ROLE, MINTER]]);
    assert.deepEqual(contract.whitelistChecks, [RECIPIENT]);
  });

  it("rejects non-Base-Sepolia chains before minting", async () => {
    const contract = fakeOrmbContract();
    const gateway = createBaseSepoliaMintGateway({
      publicClient: chain(8453),
      ormb: contract,
      minterAddress: MINTER,
    });

    await assert.rejects(() => gateway.mint(RECIPIENT, "1"), /Base Sepolia chain 84532/);
    assert.equal(contract.mintCalls.length, 0);
  });

  it("rejects missing MINTER_ROLE before minting when role read is available", async () => {
    const contract = fakeOrmbContract({ minterHasRole: false });
    const gateway = createBaseSepoliaMintGateway({
      publicClient: chain(BASE_SEPOLIA_CHAIN_ID),
      ormb: contract,
      minterAddress: MINTER,
    });

    await assert.rejects(() => gateway.mint(RECIPIENT, "1"), /does not have ORMB MINTER_ROLE/);
    assert.equal(contract.mintCalls.length, 0);
  });

  it("rejects non-whitelisted recipients before minting when whitelist read is available", async () => {
    const contract = fakeOrmbContract({ recipientWhitelisted: false });
    const gateway = createBaseSepoliaMintGateway({
      publicClient: chain(BASE_SEPOLIA_CHAIN_ID),
      ormb: contract,
      minterAddress: MINTER,
    });

    await assert.rejects(() => gateway.mint(RECIPIENT, "1"), /recipient is not whitelisted/);
    assert.equal(contract.mintCalls.length, 0);
  });
});

function chain(chainId: number) {
  return {
    async getChainId() {
      return chainId;
    },
  };
}

function fakeOrmbContract({
  minterHasRole = true,
  recipientWhitelisted = true,
}: {
  minterHasRole?: boolean;
  recipientWhitelisted?: boolean;
} = {}): OrmbMintContract & {
  mintCalls: Array<readonly [`0x${string}`, bigint]>;
  roleChecks: Array<readonly [`0x${string}`, `0x${string}`]>;
  whitelistChecks: Array<`0x${string}`>;
} {
  const mintCalls: Array<readonly [`0x${string}`, bigint]> = [];
  const roleChecks: Array<readonly [`0x${string}`, `0x${string}`]> = [];
  const whitelistChecks: Array<`0x${string}`> = [];

  return {
    mintCalls,
    roleChecks,
    whitelistChecks,
    read: {
      async hasRole(args) {
        roleChecks.push(args);
        return minterHasRole;
      },
      async isWhitelisted(args) {
        whitelistChecks.push(args[0]);
        return recipientWhitelisted;
      },
    },
    write: {
      async mint(args) {
        mintCalls.push(args);
        return TX_HASH;
      },
    },
  };
}
