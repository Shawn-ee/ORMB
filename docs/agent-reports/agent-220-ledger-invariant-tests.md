# Agent Report: agent/220-ledger-invariant-tests

## Branch

`agent/220-ledger-invariant-tests`

## Role

Ledger and accounting sub-agent.

## Objective

Add deterministic demo ledger invariant checks and tests so ORMB can explain traceability between mock deposits, mint requests, confirmed mints, verified burns, and expected demo supply.

## Non-Goals

- No real reserve accounting.
- No real USDT, RMB/CNH, payout, custody, or production ledger behavior.
- No database adapter.
- No contract calls.
- No UI changes.

## Files Changed

- `workers/ledger-invariants.ts`
- `test/workers/ledger-invariants.unit.test.ts`
- `docs/LEDGER_INVARIANTS.md`
- `docs/agent-reports/agent-220-ledger-invariant-tests.md`

## Acceptance Criteria

- Duplicate mint accounting is rejected.
- Confirmed minted ORMB reconciles with verified burns and expected supply.
- Failed/rejected records do not inflate demo supply.
- Docs state the checker is demo-only and not proof of real reserves.

## Validation

- `npm run typecheck`: PASS.
- `npm run test`: PASS, 42 unit tests including 7 ledger invariant tests.
- `npm run test:ci`: PASS.
  - `lint`: PASS, placeholder lint script.
  - `prisma:generate`: PASS.
  - `typecheck`: PASS.
  - `prisma:validate`: PASS.
  - `test`: PASS, 42 unit tests.
  - `compile:contracts`: PASS.
  - `test:contracts`: PASS, 15 contract tests.
  - `build`: PASS.
- `npm run test:e2e`: PASS, 12 Playwright production-mode checks.
- `git diff --check`: PASS.

## Self-Review

- Confirmed branch changes are limited to ledger invariant worker code, tests, docs, and agent report.
- Confirmed no secrets, mainnet configuration, real funds, real USDT, real RMB/CNH, customer-funds behavior, or production claims were introduced.
- Confirmed docs explicitly state the checker is not proof of real reserves or production accounting.

## Next Recommended Branch

`agent/210-dependency-hardening`
