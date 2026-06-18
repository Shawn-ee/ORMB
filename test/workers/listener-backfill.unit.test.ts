import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createBackfillPlan, decideRetryDelay } from "../../workers/listener-backfill.js";

describe("createBackfillPlan", () => {
  it("splits an inclusive block range into bounded batches", () => {
    const plan = createBackfillPlan({
      fromBlock: 100n,
      toBlock: 112n,
      batchSize: 5n,
      maxBlocks: 25n,
    });

    assert.deepEqual(plan, [
      { fromBlock: 100n, toBlock: 104n },
      { fromBlock: 105n, toBlock: 109n },
      { fromBlock: 110n, toBlock: 112n },
    ]);
  });

  it("allows a single-block backfill", () => {
    assert.deepEqual(
      createBackfillPlan({
        fromBlock: 100n,
        toBlock: 100n,
        batchSize: 10n,
        maxBlocks: 10n,
      }),
      [{ fromBlock: 100n, toBlock: 100n }],
    );
  });

  it("rejects unbounded or invalid ranges", () => {
    assert.throws(() =>
      createBackfillPlan({
        fromBlock: 100n,
        toBlock: 151n,
        batchSize: 10n,
        maxBlocks: 50n,
      }),
    );

    assert.throws(() =>
      createBackfillPlan({
        fromBlock: 200n,
        toBlock: 100n,
        batchSize: 10n,
        maxBlocks: 50n,
      }),
    );
  });
});

describe("decideRetryDelay", () => {
  it("uses deterministic capped exponential backoff", () => {
    assert.deepEqual(
      decideRetryDelay({
        attempt: 1,
        maxAttempts: 5,
        baseDelayMs: 500,
        maxDelayMs: 5_000,
      }),
      { shouldRetry: true, delayMs: 500, nextAttempt: 2 },
    );

    assert.deepEqual(
      decideRetryDelay({
        attempt: 5,
        maxAttempts: 10,
        baseDelayMs: 500,
        maxDelayMs: 5_000,
      }),
      { shouldRetry: true, delayMs: 5_000, nextAttempt: 6 },
    );
  });

  it("stops when max attempts are reached", () => {
    assert.deepEqual(
      decideRetryDelay({
        attempt: 3,
        maxAttempts: 3,
        baseDelayMs: 500,
        maxDelayMs: 5_000,
      }),
      { shouldRetry: false, reason: "max_attempts_reached" },
    );
  });

  it("rejects invalid retry settings", () => {
    assert.throws(() =>
      decideRetryDelay({
        attempt: 0,
        maxAttempts: 3,
        baseDelayMs: 500,
        maxDelayMs: 5_000,
      }),
    );

    assert.throws(() =>
      decideRetryDelay({
        attempt: 1,
        maxAttempts: 3,
        baseDelayMs: 5_000,
        maxDelayMs: 500,
      }),
    );
  });
});
