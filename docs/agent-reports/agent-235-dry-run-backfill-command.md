# Agent Report: `agent/235-dry-run-backfill-command`

## Role

Chain reliability sub-agent.

## Objective

Add a safe dry-run backfill command for the MockUSDT deposit listener so operators can inspect historical transfer logs over a block range before committing any database changes.

## Files Changed

- `workers/listener-dry-run-backfill.ts`
- `test/workers/listener-dry-run-backfill.unit.test.ts`
- `scripts/backfill-deposits-dry-run.ts`
- `package.json`
- `docs/LISTENER_RETRY_AND_BACKFILL.md`
- `docs/CHAIN_LISTENER_REVIEW.md`
- `docs/agent-reports/agent-235-dry-run-backfill-command.md`

## Implementation Summary

- Added a pure dry-run analyzer for supplied MockUSDT transfer logs.
- Added a file-backed CLI script exposed as `npm run backfill:dry-run`.
- Reports scanned range, batches, events found, matching treasury deposits, known-wallet matches, unknown-wallet events, duplicates, ignored events, and potential non-dry-run actions.
- Uses read-only repository methods only: wallet lookup and duplicate detection.
- Does not write deposits, audit logs, mint requests, mints, confirmation state, or contracts.
- Added unit tests for matching events, no persistence, duplicates, unknown wallets, ignored events, empty ranges, and invalid ranges.

## Validation

- `npm run typecheck`: PASS.
- `npm run test`: PASS, 71 unit tests.
- `npm run prisma:generate`: PASS.
- `npm run prisma:validate`: PASS.
- `npm run test:ci`: PASS.
  - lint placeholder: PASS.
  - Prisma generate: PASS.
  - typecheck: PASS.
  - Prisma validate: PASS.
  - unit tests: PASS, 71 tests.
  - contract compile: PASS.
  - contract tests: PASS, 15 tests.
  - Next.js build: PASS.
- `git diff --check`: PASS.
- `npm run backfill:dry-run -- ...`: PASS with temporary fixture files; output reported one matching treasury deposit, one known company wallet match, and one `would_create_detected_deposit` potential action.

Note: the first CLI smoke command failed because of a malformed PowerShell here-string in the temporary fixture setup. A second run exposed BOM-prefixed JSON handling, which was fixed by stripping an optional UTF-8 BOM before parsing. The final CLI smoke run passed.

## Self-Review

- Inspected the diff against `origin/dev`.
- Confirmed dry-run mode uses read-only repository methods only.
- Confirmed no deposits, audit logs, mint requests, mints, confirmation state, contract calls, deployments, or mainnet behavior are introduced.
- Confirmed no secrets or real-funds paths are added.
- Confirmed operator documentation explains dry-run usage and limitations.

## Known Limitations

- The command is file-backed and does not fetch live RPC logs.
- No apply mode exists.
- No database writes occur.
- No real funds, real token processing, or production recovery claims are made.

## Safety Notes

- Testnet/mock-only behavior.
- No real USDT, RMB/CNH, customer funds, or production claims.
- No secrets or private keys committed.
- No mainnet configuration or deployment.

## Next Recommended Branch

`agent/237-listener-duplicate-ignored-audit-policy`
