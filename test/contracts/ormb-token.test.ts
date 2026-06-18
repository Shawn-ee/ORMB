import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";

import { network } from "hardhat";
import { parseUnits } from "viem";

describe("ORMBToken", async function () {
  const { viem } = await network.create();

  let admin: Awaited<ReturnType<typeof viem.getWalletClients>>[number];
  let companyA: Awaited<ReturnType<typeof viem.getWalletClients>>[number];
  let companyB: Awaited<ReturnType<typeof viem.getWalletClients>>[number];
  let outsider: Awaited<ReturnType<typeof viem.getWalletClients>>[number];
  let ormb: Awaited<ReturnType<typeof viem.deployContract>>;

  beforeEach(async function () {
    [admin, companyA, companyB, outsider] = await viem.getWalletClients();
    ormb = await viem.deployContract("ORMBToken", [admin.account.address]);
  });

  it("sets the expected token metadata", async function () {
    assert.equal(await ormb.read.name(), "Offshore RMB Token");
    assert.equal(await ormb.read.symbol(), "ORMB");
    assert.equal(await ormb.read.decimals(), 6);
  });

  it("blocks non-minters from minting", async function () {
    await ormb.write.setWhitelisted([companyA.account.address, true]);
    const outsiderOrmB = await viem.getContractAt("ORMBToken", ormb.address, {
      client: { wallet: outsider },
    });

    await assert.rejects(
      outsiderOrmB.write.mint([companyA.account.address, parseUnits("100", 6)]),
    );
  });

  it("allows a minter to mint to a whitelisted wallet", async function () {
    await ormb.write.setWhitelisted([companyA.account.address, true]);
    await ormb.write.mint([companyA.account.address, parseUnits("250", 6)]);

    assert.equal(await ormb.read.balanceOf([companyA.account.address]), parseUnits("250", 6));
  });

  it("blocks minting to a non-whitelisted wallet", async function () {
    await assert.rejects(ormb.write.mint([companyA.account.address, parseUnits("100", 6)]));
  });

  it("blocks non-whitelist-admins from changing whitelist state", async function () {
    const outsiderOrmB = await viem.getContractAt("ORMBToken", ormb.address, {
      client: { wallet: outsider },
    });

    await assert.rejects(
      outsiderOrmB.write.setWhitelisted([companyA.account.address, true]),
    );
  });

  it("emits whitelist update events", async function () {
    await viem.assertions.emitWithArgs(
      ormb.write.setWhitelisted([companyA.account.address, true]),
      ormb,
      "WalletWhitelistUpdated",
      [companyA.account.address, true, admin.account.address],
    );
  });

  it("allows transfers between whitelisted wallets", async function () {
    await ormb.write.setWhitelisted([companyA.account.address, true]);
    await ormb.write.setWhitelisted([companyB.account.address, true]);
    await ormb.write.mint([companyA.account.address, parseUnits("100", 6)]);

    const companyAOrmB = await viem.getContractAt("ORMBToken", ormb.address, {
      client: { wallet: companyA },
    });
    await companyAOrmB.write.transfer([companyB.account.address, parseUnits("40", 6)]);

    assert.equal(await ormb.read.balanceOf([companyB.account.address]), parseUnits("40", 6));
  });

  it("blocks transfers to non-whitelisted wallets", async function () {
    await ormb.write.setWhitelisted([companyA.account.address, true]);
    await ormb.write.mint([companyA.account.address, parseUnits("100", 6)]);

    const companyAOrmB = await viem.getContractAt("ORMBToken", ormb.address, {
      client: { wallet: companyA },
    });

    await assert.rejects(
      companyAOrmB.write.transfer([companyB.account.address, parseUnits("10", 6)]),
    );
  });

  it("blocks transfers after a wallet is removed from the whitelist", async function () {
    await ormb.write.setWhitelisted([companyA.account.address, true]);
    await ormb.write.setWhitelisted([companyB.account.address, true]);
    await ormb.write.mint([companyA.account.address, parseUnits("100", 6)]);
    await ormb.write.setWhitelisted([companyB.account.address, false]);

    const companyAOrmB = await viem.getContractAt("ORMBToken", ormb.address, {
      client: { wallet: companyA },
    });

    await assert.rejects(
      companyAOrmB.write.transfer([companyB.account.address, parseUnits("10", 6)]),
    );
  });

  it("blocks non-pausers from pausing", async function () {
    const outsiderOrmB = await viem.getContractAt("ORMBToken", ormb.address, {
      client: { wallet: outsider },
    });

    await assert.rejects(outsiderOrmB.write.pause());
  });

  it("blocks transfers while paused", async function () {
    await ormb.write.setWhitelisted([companyA.account.address, true]);
    await ormb.write.setWhitelisted([companyB.account.address, true]);
    await ormb.write.mint([companyA.account.address, parseUnits("100", 6)]);
    await ormb.write.pause();

    const companyAOrmB = await viem.getContractAt("ORMBToken", ormb.address, {
      client: { wallet: companyA },
    });

    await assert.rejects(
      companyAOrmB.write.transfer([companyB.account.address, parseUnits("10", 6)]),
    );
  });

  it("burns tokens and reduces total supply", async function () {
    await ormb.write.setWhitelisted([companyA.account.address, true]);
    await ormb.write.mint([companyA.account.address, parseUnits("100", 6)]);

    const companyAOrmB = await viem.getContractAt("ORMBToken", ormb.address, {
      client: { wallet: companyA },
    });
    await companyAOrmB.write.burn([parseUnits("25", 6)]);

    assert.equal(await ormb.read.totalSupply(), parseUnits("75", 6));
    assert.equal(await ormb.read.balanceOf([companyA.account.address]), parseUnits("75", 6));
  });
});

describe("MockUSDT", async function () {
  const { viem } = await network.create();

  it("supports 6 decimals and public demo minting", async function () {
    const [admin, recipient] = await viem.getWalletClients();
    const mockUsdt = await viem.deployContract("MockUSDT");

    await mockUsdt.write.mint([recipient.account.address, parseUnits("500", 6)], {
      account: admin.account,
    });

    assert.equal(await mockUsdt.read.decimals(), 6);
    assert.equal(await mockUsdt.read.balanceOf([recipient.account.address]), parseUnits("500", 6));
  });

  it("supports the demo faucet", async function () {
    const [, recipient] = await viem.getWalletClients();
    const mockUsdt = await viem.deployContract("MockUSDT");
    const recipientMockUsdt = await viem.getContractAt("MockUSDT", mockUsdt.address, {
      client: { wallet: recipient },
    });

    await recipientMockUsdt.write.faucet();

    assert.equal(await mockUsdt.read.balanceOf([recipient.account.address]), parseUnits("1000", 6));
  });
});
