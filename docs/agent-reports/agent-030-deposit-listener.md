# Agent Report: Deposit Listener

## Phase Name

Deposit monitoring.

## Branch Name

`agent/030-deposit-listener`

## Agent Role

Chain Listener Agent.

## Objective

Implement the testable core of the MockUSDT deposit listener for idempotent transfer-log processing.

## Non-Goals

- No live RPC polling loop.
- No real deposits.
- No mint request creation.
- No confirmation handling.
- No risk engine.
- No UI changes.

## Acceptance Criteria

- Matching treasury deposits from known wallets are saved.
- Duplicate logs are not saved twice.
- Unknown wallet deposits are rejected and never assigned to a company.
- Wrong-treasury transfers are ignored.
- Audit logs are created for detected/rejected deposits.
- Latest indexed block is tracked.
- Unit tests and full CI pass.

## Files Changed

- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/DEPOSIT_LISTENER.md`
- `docs/RUNBOOK.md`
- `docs/SECURITY.md`
- `docs/agent-reports/agent-030-deposit-listener.md`
- `package.json`
- `test/workers/deposit-listener.unit.test.ts`
- `workers/deposit-listener.ts`

## Validation Commands Run

- `npm run test`
- `npm run typecheck`
- `npm run test:ci`
- `git status --short --branch`
- `git diff origin/dev`
- `rg -n "real funds|real USDT|real RMB|mainnet|PRIVATE_KEY|seed phrase|mint request|MINT_REQUESTED|production" workers test/workers docs/DEPOSIT_LISTENER.md docs/SECURITY.md docs/agent-reports/agent-030-deposit-listener.md`

## Validation Results

- `npm run test` passed with 4 unit tests.
- `npm run typecheck` passed with `tsc --noEmit`.
- `npm run test:ci` passed. Placeholder lint, Prisma generate/validate, TypeScript, unit tests, contract compile/tests, and Next.js production build completed successfully.
- Safety text search found only expected no-real-funds, no-mainnet, no-production, and no-mint-request boundary language.

## Self-Review Findings

- The branch adds the deposit listener core and tests only.
- No live RPC polling loop, real deposits, mint request creation, confirmation handling, risk engine, UI changes, secrets, or real-fund behavior was added.
- Unknown wallet deposits are explicitly rejected and not assigned to a company.
- Next.js validation generated an unrelated `next-env.d.ts` change, which was restored before commit.

## Improvements Applied

- Added a repository interface so the listener core can be tested without a live database.
- Added unit tests for known-wallet detection, duplicate suppression, unknown-wallet rejection, and wrong-treasury ignoring.
- Added documentation for listener safety boundaries.

## Remaining Risks

- A live polling worker and real Prisma repository adapter are still needed.
- Confirmation handling is intentionally deferred.

## Follow-Up Tasks

- Implement confirmation worker in `agent/040-confirmation-worker`.
- Add a live listener runner after RPC and persistence adapters are finalized.

## Next Recommended Branch

`agent/040-confirmation-worker`

## PR Status

- PR opened: pending.
- PR merged into `dev`: pending.
