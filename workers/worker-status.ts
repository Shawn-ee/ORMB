export type WorkerKind =
  | "deposit-listener"
  | "confirmation-worker"
  | "mint-request-worker"
  | "redemption-worker"
  | "ledger-reconciliation";

export type WorkerStatusLevel = "healthy" | "stale" | "degraded" | "failed";

export type WorkerCheckpoint = {
  worker: WorkerKind;
  lastRunAt?: Date;
  lastSuccessAt?: Date;
  latestBlockNumber?: bigint;
  consecutiveFailures: number;
  lastError?: string;
};

export type WorkerStatusPolicy = {
  now: Date;
  staleAfterMs: number;
  degradedFailureThreshold: number;
  failedFailureThreshold: number;
};

export type WorkerStatusSummary = {
  worker: WorkerKind;
  level: WorkerStatusLevel;
  message: string;
  latestBlockNumber?: bigint;
  lastRunAt?: Date;
  lastSuccessAt?: Date;
  consecutiveFailures: number;
  lastError?: string;
};

export type WorkerFleetSummary = {
  level: WorkerStatusLevel;
  workers: WorkerStatusSummary[];
  counts: Record<WorkerStatusLevel, number>;
};

const LEVEL_ORDER: Record<WorkerStatusLevel, number> = {
  healthy: 0,
  stale: 1,
  degraded: 2,
  failed: 3,
};

export function summarizeWorkerStatus(
  checkpoint: WorkerCheckpoint,
  policy: WorkerStatusPolicy,
): WorkerStatusSummary {
  validatePolicy(policy);

  if (checkpoint.consecutiveFailures < 0) {
    throw new Error("consecutiveFailures must be non-negative.");
  }

  const level = getWorkerStatusLevel(checkpoint, policy);

  return {
    worker: checkpoint.worker,
    level,
    message: getWorkerStatusMessage(level, checkpoint, policy),
    latestBlockNumber: checkpoint.latestBlockNumber,
    lastRunAt: checkpoint.lastRunAt,
    lastSuccessAt: checkpoint.lastSuccessAt,
    consecutiveFailures: checkpoint.consecutiveFailures,
    lastError: checkpoint.lastError,
  };
}

export function summarizeWorkerFleet(
  checkpoints: WorkerCheckpoint[],
  policy: WorkerStatusPolicy,
): WorkerFleetSummary {
  const workers = checkpoints.map((checkpoint) => summarizeWorkerStatus(checkpoint, policy));
  const counts: Record<WorkerStatusLevel, number> = {
    healthy: 0,
    stale: 0,
    degraded: 0,
    failed: 0,
  };

  let fleetLevel: WorkerStatusLevel = "healthy";

  for (const worker of workers) {
    counts[worker.level] += 1;

    if (LEVEL_ORDER[worker.level] > LEVEL_ORDER[fleetLevel]) {
      fleetLevel = worker.level;
    }
  }

  return {
    level: fleetLevel,
    workers,
    counts,
  };
}

function getWorkerStatusLevel(
  checkpoint: WorkerCheckpoint,
  policy: WorkerStatusPolicy,
): WorkerStatusLevel {
  if (checkpoint.consecutiveFailures >= policy.failedFailureThreshold) {
    return "failed";
  }

  if (checkpoint.consecutiveFailures >= policy.degradedFailureThreshold) {
    return "degraded";
  }

  if (checkpoint.lastSuccessAt === undefined) {
    return "stale";
  }

  if (policy.now.getTime() - checkpoint.lastSuccessAt.getTime() > policy.staleAfterMs) {
    return "stale";
  }

  return "healthy";
}

function getWorkerStatusMessage(
  level: WorkerStatusLevel,
  checkpoint: WorkerCheckpoint,
  policy: WorkerStatusPolicy,
) {
  if (level === "failed") {
    return `${checkpoint.worker} reached the failed retry threshold.`;
  }

  if (level === "degraded") {
    return `${checkpoint.worker} has recent retry failures and needs operator review.`;
  }

  if (level === "stale" && checkpoint.lastSuccessAt === undefined) {
    return `${checkpoint.worker} has not recorded a successful run.`;
  }

  if (level === "stale") {
    return `${checkpoint.worker} has not succeeded within ${policy.staleAfterMs}ms.`;
  }

  return `${checkpoint.worker} is within the configured demo health policy.`;
}

function validatePolicy(policy: WorkerStatusPolicy) {
  if (policy.staleAfterMs <= 0) {
    throw new Error("staleAfterMs must be positive.");
  }

  if (policy.degradedFailureThreshold <= 0) {
    throw new Error("degradedFailureThreshold must be positive.");
  }

  if (policy.failedFailureThreshold < policy.degradedFailureThreshold) {
    throw new Error("failedFailureThreshold must be greater than or equal to degradedFailureThreshold.");
  }
}
