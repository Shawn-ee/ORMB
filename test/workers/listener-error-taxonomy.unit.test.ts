import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { classifyListenerError } from "../../workers/listener-error-taxonomy.js";

describe("classifyListenerError", () => {
  it("classifies known RPC dependency errors as retryable", () => {
    const result = classifyListenerError({ source: "rpc", code: "RPC_TIMEOUT" });

    assert.equal(result.category, "retryable");
    assert.equal(result.normalizedCode, "rpc_timeout");
    assert.equal(result.shouldRetry, true);
    assert.equal(result.requiresManualReview, false);
  });

  it("infers retryable errors from common timeout and rate limit messages", () => {
    assert.equal(
      classifyListenerError({ source: "rpc", message: "request timed out" }).normalizedCode,
      "rpc_timeout",
    );
    assert.equal(
      classifyListenerError({ source: "rpc", message: "HTTP 429 rate limit exceeded" }).normalizedCode,
      "rpc_rate_limited",
    );
  });

  it("classifies validation and configuration errors as terminal", () => {
    const result = classifyListenerError({ source: "validation", code: "invalid-block-range" });

    assert.equal(result.category, "terminal");
    assert.equal(result.normalizedCode, "invalid_block_range");
    assert.equal(result.shouldRetry, false);
    assert.equal(result.requiresManualReview, false);
  });

  it("classifies reorg and unknown-wallet conditions as manual review", () => {
    assert.equal(
      classifyListenerError({ source: "chain", code: "block_hash_mismatch" }).category,
      "manual_review",
    );
    assert.equal(
      classifyListenerError({ source: "policy", code: "unknown_wallet" }).category,
      "manual_review",
    );
  });

  it("defaults unmapped infrastructure errors to retryable", () => {
    const result = classifyListenerError({ source: "database", code: "driver_disconnected" });

    assert.equal(result.category, "retryable");
    assert.equal(result.shouldRetry, true);
  });

  it("defaults unmapped validation errors to terminal", () => {
    const result = classifyListenerError({ source: "validation", code: "bad_fixture_shape" });

    assert.equal(result.category, "terminal");
    assert.equal(result.shouldRetry, false);
  });

  it("defaults unknown-source errors to manual review", () => {
    const result = classifyListenerError({ source: "unknown", message: "something unexpected happened" });

    assert.equal(result.category, "manual_review");
    assert.equal(result.shouldRetry, false);
    assert.equal(result.requiresManualReview, true);
  });
});
