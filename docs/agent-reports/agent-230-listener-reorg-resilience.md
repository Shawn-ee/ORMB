# Agent Report: `agent/230-listener-reorg-resilience`

## Role

Chain reliability sub-agent.

## Objective

Add a narrow, testable reorg guard to the deposit confirmation worker and document the chain reorg/backfill model for Enterprise Pilot Readiness v1.

## Files Changed

- `workers/confirmation-worker.ts`
- `test/workers/confirmation-worker.unit.test.ts`
- `docs/CHAIN_REORG_AND_BACKFILL.md`
- `docs/agent-reports/agent-230-listener-reorg-resilience.md`

## Implementation Summary

- Added optional `blockHash` support to confirmable deposits.
- Added optional `getBlockHash` callback for confirmation processing.
- Added `deposit.reorg_detected` audit event support.
- Prevented confirmation updates when a stored block hash conflicts with the current canonical block hash.
- Preserved existing block-number-only behavior when hash data or a hash lookup is unavailable.
- Added unit coverage for successful hash validation and reorg mismatch handling.
- Documented the required block-hash persistence and backfill model for future branches.

## Validation

- `npm run typecheck`: PASS.
- `npm run test`: PASS, 50 unit tests.
- `npm run test:ci`: PASS.
  - lint placeholder: PASS.
  - Prisma generate: PASS.
  - typecheck: PASS.
  - Prisma validate: PASS.
  - unit tests: PASS, 50 tests.
  - contract compile: PASS.
  - contract tests: PASS, 15 tests.
  - Next.js build: PASS.
- `git diff --check`: PASS.

## Self-Review

- Inspected the diff against `origin/dev`.
- Confirmed the branch does not add schema migrations, deployments, contract calls, or UI changes.
- Confirmed safety language remains testnet/mock-only and does not claim production readiness.

## Known Limitations

- No Prisma schema migration was added for persisted deposit block hashes.
- No live RPC-backed backfill command was added.
- No mint request behavior changed.
- No deployment or contract interaction was performed.

## Safety Notes

- Testnet/mock-only behavior.
- No mainnet deployment.
- No real USDT, RMB/CNH, customer funds, or production claims.
- No secrets or private keys committed.

## Next Recommended Branch

`agent/231-listener-retry-and-backfill`
