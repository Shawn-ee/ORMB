import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  type WorkerStatusPolicy,
  summarizeWorkerFleet,
  summarizeWorkerStatus,
} from "../../workers/worker-status.js";

const NOW = new Date("2026-06-18T12:00:00.000Z");
const POLICY: WorkerStatusPolicy = {
  now: NOW,
  staleAfterMs: 60_000,
  degradedFailureThreshold: 2,
  failedFailureThreshold: 4,
};

describe("summarizeWorkerStatus", () => {
  it("marks recently successful workers as healthy", () => {
    const status = summarizeWorkerStatus(
      {
        worker: "deposit-listener",
        lastRunAt: NOW,
        lastSuccessAt: new Date(NOW.getTime() - 5_000),
        latestBlockNumber: 123n,
        consecutiveFailures: 0,
      },
      POLICY,
    );

    assert.equal(status.level, "healthy");
    assert.equal(status.latestBlockNumber, 123n);
  });

  it("marks workers without successful runs as stale", () => {
    const status = summarizeWorkerStatus(
      {
        worker: "confirmation-worker",
        lastRunAt: NOW,
        consecutiveFailures: 0,
      },
      POLICY,
    );

    assert.equal(status.level, "stale");
    assert.match(status.message, /has not recorded a successful run/);
  });

  it("marks workers past the freshness window as stale", () => {
    const status = summarizeWorkerStatus(
      {
        worker: "mint-request-worker",
        lastRunAt: NOW,
        lastSuccessAt: new Date(NOW.getTime() - 120_000),
        consecutiveFailures: 0,
      },
      POLICY,
    );

    assert.equal(status.level, "stale");
  });

  it("prioritizes degraded and failed retry thresholds", () => {
    assert.equal(
      summarizeWorkerStatus(
        {
          worker: "redemption-worker",
          lastSuccessAt: new Date(NOW.getTime() - 5_000),
          consecutiveFailures: 2,
        },
        POLICY,
      ).level,
      "degraded",
    );

    assert.equal(
      summarizeWorkerStatus(
        {
          worker: "ledger-reconciliation",
          lastSuccessAt: new Date(NOW.getTime() - 5_000),
          consecutiveFailures: 4,
        },
        POLICY,
      ).level,
      "failed",
    );
  });

  it("rejects invalid policies and checkpoints", () => {
    assert.throws(() =>
      summarizeWorkerStatus(
        {
          worker: "deposit-listener",
          consecutiveFailures: -1,
        },
        POLICY,
      ),
    );

    assert.throws(() =>
      summarizeWorkerStatus(
        {
          worker: "deposit-listener",
          consecutiveFailures: 0,
        },
        {
          ...POLICY,
          staleAfterMs: 0,
        },
      ),
    );
  });
});

describe("summarizeWorkerFleet", () => {
  it("returns the highest-severity fleet level and counts each worker level", () => {
    const fleet = summarizeWorkerFleet(
      [
        {
          worker: "deposit-listener",
          lastSuccessAt: new Date(NOW.getTime() - 5_000),
          consecutiveFailures: 0,
        },
        {
          worker: "confirmation-worker",
          lastSuccessAt: new Date(NOW.getTime() - 120_000),
          consecutiveFailures: 0,
        },
        {
          worker: "mint-request-worker",
          lastSuccessAt: new Date(NOW.getTime() - 5_000),
          consecutiveFailures: 2,
        },
      ],
      POLICY,
    );

    assert.equal(fleet.level, "degraded");
    assert.deepEqual(fleet.counts, {
      healthy: 1,
      stale: 1,
      degraded: 1,
      failed: 0,
    });
  });
});
