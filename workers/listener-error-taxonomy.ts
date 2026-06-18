export type ListenerErrorSource = "rpc" | "database" | "validation" | "chain" | "policy" | "unknown";

export type ListenerErrorCategory = "retryable" | "terminal" | "manual_review";

export type ListenerErrorInput = {
  source: ListenerErrorSource;
  code?: string;
  message?: string;
};

export type ListenerErrorClassification = {
  category: ListenerErrorCategory;
  normalizedCode: string;
  shouldRetry: boolean;
  requiresManualReview: boolean;
  summary: string;
};

const RETRYABLE_CODES = new Set([
  "rpc_timeout",
  "rpc_rate_limited",
  "rpc_unavailable",
  "network_error",
  "connection_reset",
  "db_connection_lost",
  "db_deadlock",
  "db_serialization_failure",
]);

const TERMINAL_CODES = new Set([
  "invalid_address",
  "invalid_block_range",
  "invalid_chain_id",
  "invalid_config",
  "invalid_token",
  "missing_required_argument",
  "schema_validation_failed",
]);

const MANUAL_REVIEW_CODES = new Set([
  "block_hash_mismatch",
  "duplicate_conflict",
  "invariant_violation",
  "reorg_detected",
  "unexpected_state_transition",
  "unknown_wallet",
]);

export function classifyListenerError(input: ListenerErrorInput): ListenerErrorClassification {
  const normalizedCode = normalizeCode(input.code ?? inferCodeFromMessage(input.message));

  if (RETRYABLE_CODES.has(normalizedCode)) {
    return classification("retryable", normalizedCode, "Transient listener dependency failure.");
  }

  if (TERMINAL_CODES.has(normalizedCode)) {
    return classification("terminal", normalizedCode, "Terminal listener validation or configuration failure.");
  }

  if (MANUAL_REVIEW_CODES.has(normalizedCode)) {
    return classification("manual_review", normalizedCode, "Listener condition requires operator review.");
  }

  if (input.source === "rpc" || input.source === "database") {
    return classification("retryable", normalizedCode, "Unmapped infrastructure error treated as retryable.");
  }

  if (input.source === "validation") {
    return classification("terminal", normalizedCode, "Unmapped validation error treated as terminal.");
  }

  return classification("manual_review", normalizedCode, "Unmapped listener error requires operator review.");
}

function classification(
  category: ListenerErrorCategory,
  normalizedCode: string,
  summary: string,
): ListenerErrorClassification {
  return {
    category,
    normalizedCode,
    shouldRetry: category === "retryable",
    requiresManualReview: category === "manual_review",
    summary,
  };
}

function normalizeCode(code: string | undefined) {
  const normalized = code?.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return normalized === undefined || normalized === "" ? "unknown_error" : normalized;
}

function inferCodeFromMessage(message: string | undefined) {
  const normalizedMessage = message?.toLowerCase() ?? "";

  if (normalizedMessage.includes("rate limit") || normalizedMessage.includes("429")) {
    return "rpc_rate_limited";
  }

  if (normalizedMessage.includes("timeout") || normalizedMessage.includes("timed out")) {
    return "rpc_timeout";
  }

  if (normalizedMessage.includes("deadlock")) {
    return "db_deadlock";
  }

  if (normalizedMessage.includes("invalid address")) {
    return "invalid_address";
  }

  if (normalizedMessage.includes("block hash") || normalizedMessage.includes("reorg")) {
    return "reorg_detected";
  }

  return "unknown_error";
}
