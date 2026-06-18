# Agent Report: `agent/237-listener-duplicate-ignored-audit-policy`

## Role

Chain listener auditability sub-agent.

## Objective

Add an explicit audit policy for duplicate and ignored listener events so backfills and incident reviews can capture more traceability without making routine scans noisy.

## Files Changed

- `workers/deposit-listener.ts`
- `test/workers/deposit-listener.unit.test.ts`
- `docs/DEPOSIT_LISTENER.md`
- `docs/CHAIN_LISTENER_REVIEW.md`
- `docs/agent-reports/agent-237-listener-duplicate-ignored-audit-policy.md`

## Implementation Summary

- Added `ListenerAuditPolicy` with `state_changes_only` default and `verbose` opt-in.
- Preserved existing default behavior for duplicate and ignored logs.
- Added `deposit.duplicate_skipped` audit logs when verbose mode sees an existing event key.
- Added `deposit.ignored` audit logs when verbose mode sees logs outside chain/token/treasury filters.
- Added unit tests for default quiet duplicate handling, verbose duplicate audit logs, and verbose ignored audit logs.
- Updated listener docs and chain listener review status.

## Validation

- `npm run typecheck`: PASS.
- `npm run test`: PASS, 73 unit tests.
- `npm run prisma:generate`: PASS.
- `npm run prisma:validate`: PASS.
- `npm run test:ci`: PASS.
  - lint placeholder: PASS.
  - Prisma generate: PASS.
  - typecheck: PASS.
  - Prisma validate: PASS.
  - unit tests: PASS, 73 tests.
  - contract compile: PASS.
  - contract tests: PASS, 15 tests.
  - Next.js build: PASS.
- `git diff --check`: PASS.

## Self-Review

- Inspected the diff against `origin/dev`.
- Confirmed default listener behavior remains quiet for duplicate and ignored logs.
- Confirmed verbose audit mode is opt-in and does not create deposits for ignored or duplicate events.
- Confirmed no mint requests, mints, confirmation-state changes, contract calls, deployments, mainnet behavior, or secrets were introduced.

## Known Limitations

- Verbose mode is exposed at the worker core level; no live runner chooses the policy yet.
- No live RPC adapter is added.
- No database schema change is needed.
- No contract calls, deployments, mint behavior, or confirmation behavior changes.

## Safety Notes

- Testnet/mock-only behavior.
- No real USDT, RMB/CNH, customer funds, or production claims.
- No secrets or private keys committed.
- No mainnet configuration or deployment.

## Next Recommended Branch

`agent/238-listener-error-taxonomy`
