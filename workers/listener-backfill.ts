export type BackfillRange = {
  fromBlock: bigint;
  toBlock: bigint;
};

export type CreateBackfillPlanInput = {
  fromBlock: bigint;
  toBlock: bigint;
  batchSize: bigint;
  maxBlocks: bigint;
};

export type RetryPolicyInput = {
  attempt: number;
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
};

export type RetryDecision =
  | {
      shouldRetry: true;
      delayMs: number;
      nextAttempt: number;
    }
  | {
      shouldRetry: false;
      reason: "max_attempts_reached";
    };

export function createBackfillPlan({
  fromBlock,
  toBlock,
  batchSize,
  maxBlocks,
}: CreateBackfillPlanInput): BackfillRange[] {
  if (fromBlock < 0n || toBlock < 0n) {
    throw new Error("Backfill block numbers must be non-negative.");
  }

  if (fromBlock > toBlock) {
    throw new Error("fromBlock must be less than or equal to toBlock.");
  }

  if (batchSize <= 0n) {
    throw new Error("batchSize must be positive.");
  }

  if (maxBlocks <= 0n) {
    throw new Error("maxBlocks must be positive.");
  }

  const totalBlocks = toBlock - fromBlock + 1n;

  if (totalBlocks > maxBlocks) {
    throw new Error("Backfill range exceeds the configured maximum block span.");
  }

  const ranges: BackfillRange[] = [];
  let currentFrom = fromBlock;

  while (currentFrom <= toBlock) {
    const currentTo = minBigInt(currentFrom + batchSize - 1n, toBlock);
    ranges.push({ fromBlock: currentFrom, toBlock: currentTo });
    currentFrom = currentTo + 1n;
  }

  return ranges;
}

export function decideRetryDelay({
  attempt,
  maxAttempts,
  baseDelayMs,
  maxDelayMs,
}: RetryPolicyInput): RetryDecision {
  if (!Number.isInteger(attempt) || attempt < 1) {
    throw new Error("attempt must be a positive integer.");
  }

  if (!Number.isInteger(maxAttempts) || maxAttempts < 1) {
    throw new Error("maxAttempts must be a positive integer.");
  }

  if (!Number.isInteger(baseDelayMs) || baseDelayMs <= 0) {
    throw new Error("baseDelayMs must be a positive integer.");
  }

  if (!Number.isInteger(maxDelayMs) || maxDelayMs < baseDelayMs) {
    throw new Error("maxDelayMs must be an integer greater than or equal to baseDelayMs.");
  }

  if (attempt >= maxAttempts) {
    return {
      shouldRetry: false,
      reason: "max_attempts_reached",
    };
  }

  const exponentialDelay = baseDelayMs * 2 ** (attempt - 1);

  return {
    shouldRetry: true,
    delayMs: Math.min(exponentialDelay, maxDelayMs),
    nextAttempt: attempt + 1,
  };
}

function minBigInt(left: bigint, right: bigint) {
  return left < right ? left : right;
}
