# Agent Report: Confirmation Worker

## Phase Name

Confirmation handling.

## Branch Name

`agent/040-confirmation-worker`

## Agent Role

Confirmation Agent.

## Objective

Implement the testable core of the deposit confirmation worker.

## Non-Goals

- No live RPC polling.
- No mint request creation.
- No risk engine.
- No real deposits.
- No UI changes.

## Acceptance Criteria

- Deposits move to `CONFIRMING` before the threshold.
- Deposits move to `CONFIRMED` at or above the threshold.
- Reruns are idempotent for unchanged records.
- Invalid confirmation thresholds are rejected.
- Audit logs are written for state changes.
- Unit tests and full CI pass.

## Files Changed

- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/CONFIRMATION_WORKER.md`
- `docs/RUNBOOK.md`
- `docs/SECURITY.md`
- `docs/agent-reports/agent-040-confirmation-worker.md`
- `test/workers/confirmation-worker.unit.test.ts`
- `workers/confirmation-worker.ts`

## Validation Commands Run

- `npm run test`
- `npm run typecheck`
- `npm run test:ci`
- `git status --short --branch`
- `git diff origin/dev`
- `rg -n "real funds|real USDT|real RMB|mainnet|PRIVATE_KEY|seed phrase|mint request|production" workers/confirmation-worker.ts test/workers/confirmation-worker.unit.test.ts docs/CONFIRMATION_WORKER.md docs/SECURITY.md docs/agent-reports/agent-040-confirmation-worker.md`

## Validation Results

- `npm run test` passed with 10 unit tests across deposit listener and confirmation worker suites.
- `npm run typecheck` passed with `tsc --noEmit`.
- `npm run test:ci` passed. Placeholder lint, Prisma generate/validate, TypeScript, unit tests, contract compile/tests, and Next.js production build completed successfully.
- Safety text search found only expected no-real-funds, no-mainnet, no-production, and no-mint-request boundary language.

## Self-Review Findings

- The branch adds confirmation worker core and unit tests only.
- No live RPC polling, mint request creation, risk engine, UI changes, secrets, or real-fund behavior was added.
- Confirmation threshold behavior is explicit and invalid thresholds are rejected.
- Next.js validation generated an unrelated `next-env.d.ts` change, which was restored before commit.

## Improvements Applied

- Added `calculateConfirmations` helper with tests for block-counting behavior.
- Added idempotent rerun handling to avoid rewriting unchanged confirmation records.
- Added confirmation worker docs and security notes.

## Remaining Risks

- A live chain adapter is still needed to provide current block numbers.
- Mint request creation remains deferred.

## Follow-Up Tasks

- Implement risk checks in `agent/050-risk-engine`.

## Next Recommended Branch

`agent/050-risk-engine`

## PR Status

- PR opened: pending.
- PR merged into `dev`: pending.
