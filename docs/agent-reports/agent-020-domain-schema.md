# Agent Report: Domain Schema

## Phase Name

Ledger and domain model.

## Branch Name

`agent/020-domain-schema`

## Agent Role

Ledger Agent.

## Objective

Add the Prisma business schema for ORMB ledger, lifecycle, audit, and job state records.

## Non-Goals

- No deposit listener implementation.
- No confirmation worker.
- No risk engine implementation.
- No mint engine.
- No redemption engine.
- No UI data wiring.

## Acceptance Criteria

- Domain models exist for companies, wallets, deposits, FX quotes, mint requests, mints, redemptions, audit logs, job state, and risk events.
- Deposit idempotency is enforced by `chainId + txHash + logIndex`.
- Clear lifecycle status enums exist.
- Demo seed script exists.
- Prisma generate/validate and full CI pass.

## Files Changed

- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/DEMO_REQUIREMENTS.md`
- `docs/RUNBOOK.md`
- `docs/agent-reports/agent-020-domain-schema.md`
- `package.json`
- `package-lock.json`
- `prisma/schema.prisma`
- `scripts/seed-demo.ts`

## Validation Commands Run

- `npm run prisma:validate`
- `npm run prisma:generate`
- `npm run typecheck`
- `npm run test:ci`
- `git status --short --branch`
- `git diff origin/dev`
- `rg -n "real funds|real USDT|real RMB|mainnet|PRIVATE_KEY|seed phrase|production" prisma scripts/seed-demo.ts README.md docs/ARCHITECTURE.md docs/RUNBOOK.md docs/DEMO_REQUIREMENTS.md docs/agent-reports/agent-020-domain-schema.md`

## Validation Results

- `npm run prisma:validate` passed. The schema at `prisma/schema.prisma` is valid.
- `npm run prisma:generate` passed and generated Prisma Client v7.8.0.
- `npm run typecheck` passed with `tsc --noEmit`.
- `npm run test:ci` passed. Placeholder lint/app tests, Prisma generate/validate, TypeScript, contract compile/tests, and Next.js production build completed successfully.
- Safety text search found only expected no-real-funds, no-mainnet, and no-production boundary language.

## Self-Review Findings

- The branch adds Prisma domain schema and deterministic demo seed support only.
- No listener, confirmation worker, risk engine, mint engine, redemption engine, UI data wiring, secrets, or real-fund behavior was added.
- The required deposit idempotency constraint exists as `@@unique([chainId, txHash, logIndex])`.
- Next.js validation generated an unrelated `next-env.d.ts` change, which was restored before commit.

## Improvements Applied

- Added lifecycle status enums for companies, wallets, deposits, mint requests, mints, redemptions, jobs, and risk events.
- Added a deterministic seed script for fictional demo companies and wallets.
- Added docs for seed command and schema assumptions.

## Remaining Risks

- No database migration was applied because no live PostgreSQL database is available in CI.
- Worker and API code still need to enforce state transitions in application logic.

## Follow-Up Tasks

- Implement deposit listener in `agent/030-deposit-listener`.
- Implement confirmation worker in `agent/040-confirmation-worker`.

## Next Recommended Branch

`agent/030-deposit-listener`

## PR Status

- PR opened: pending.
- PR merged into `dev`: pending.
