# Agent Report: `agent/238-listener-error-taxonomy`

## Role

Chain listener reliability sub-agent.

## Objective

Add deterministic listener error classification so future runners can distinguish retryable infrastructure failures, terminal validation failures, and manual-review conditions.

## Files Changed

- `workers/listener-error-taxonomy.ts`
- `test/workers/listener-error-taxonomy.unit.test.ts`
- `docs/LISTENER_RETRY_AND_BACKFILL.md`
- `docs/CHAIN_LISTENER_REVIEW.md`
- `docs/agent-reports/agent-238-listener-error-taxonomy.md`

## Implementation Summary

- Added `classifyListenerError`.
- Added retryable classifications for transient RPC and database dependency failures.
- Added terminal classifications for validation and configuration failures.
- Added manual-review classifications for reorg, block-hash mismatch, unknown wallet, duplicate conflict, invariant, and unexpected state conditions.
- Added safe defaults for unmapped infrastructure, validation, and unknown-source errors.
- Added unit tests for known classifications, inferred message classifications, and default behavior.

## Validation

- `npm run typecheck`: PASS.
- `npm run test`: PASS, 80 unit tests.
- `npm run prisma:generate`: PASS.
- `npm run prisma:validate`: PASS.
- `npm run test:ci`: PASS.
  - lint placeholder: PASS.
  - Prisma generate: PASS.
  - typecheck: PASS.
  - Prisma validate: PASS.
  - unit tests: PASS, 80 tests.
  - contract compile: PASS.
  - contract tests: PASS, 15 tests.
  - Next.js build: PASS.
- `git diff --check`: PASS.

## Self-Review

- Inspected the diff against `origin/dev`.
- Confirmed the taxonomy is pure and deterministic.
- Confirmed no retry loop, live RPC adapter, database writes, mint behavior, contract calls, deployments, mainnet behavior, or secrets were introduced.
- Confirmed terminal validation failures do not retry and manual-review cases do not auto-progress.

## Known Limitations

- No live runner consumes the taxonomy yet.
- No retry loop behavior is changed in this branch.
- No database schema changes.
- No contract calls, deployments, mint behavior, or confirmation behavior changes.

## Safety Notes

- Testnet/mock-only behavior.
- No real USDT, RMB/CNH, customer funds, or production claims.
- No secrets or private keys committed.
- No mainnet configuration or deployment.

## Next Recommended Branch

`agent/240-risk-case-management`
