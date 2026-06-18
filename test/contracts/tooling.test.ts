import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";

describe("ToolingPlaceholder", async function () {
  const { viem } = await network.create();

  it("deploys and returns the placeholder tooling version", async function () {
    const placeholder = await viem.deployContract("ToolingPlaceholder");

    assert.equal(
      await placeholder.read.toolingVersion(),
      "hardhat-viem-tooling",
    );
  });
});
