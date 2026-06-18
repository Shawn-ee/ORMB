# Agent Report: Risk Engine

## Phase Name

Risk checks.

## Branch Name

`agent/050-risk-engine`

## Agent Role

Risk Agent.

## Objective

Implement deterministic mint eligibility risk checks for confirmed deposits before mint request creation.

## Non-Goals

- No mint request creation.
- No contract mint call.
- No UI work.
- No live database adapter.
- No real funds.

## Acceptance Criteria

- KYB approval is required.
- Source wallet must be known, active, and associated with the company.
- Receiving wallet must be active, whitelisted, and associated with the company.
- Deposit must be confirmed.
- Existing mint request or mint blocks eligibility.
- Automatic mint limit is enforced when configured.
- Daily mint limit is enforced when configured.
- Unknown-wallet deposits never pass.
- Failed checks are recorded via RiskEvent and AuditLog hooks.
- Unit tests and full CI pass.

## Files Changed

- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/RISK_ENGINE.md`
- `docs/RUNBOOK.md`
- `docs/SECURITY.md`
- `docs/agent-reports/agent-050-risk-engine.md`
- `test/workers/risk-engine.unit.test.ts`
- `workers/risk-engine.ts`

## Validation Commands Run

- `npm run test`
- `npm run typecheck`
- `npm run test:ci`
- `git status --short --branch`
- `git diff origin/dev`
- `rg -n "real funds|real USDT|real RMB|mainnet|PRIVATE_KEY|seed phrase|contract mint|mint request|production" workers/risk-engine.ts test/workers/risk-engine.unit.test.ts docs/RISK_ENGINE.md docs/SECURITY.md docs/agent-reports/agent-050-risk-engine.md`

## Validation Results

- `npm run test` passed with 20 unit tests across deposit listener, confirmation worker, and risk engine suites.
- `npm run typecheck` passed with `tsc --noEmit`.
- `npm run test:ci` passed. Placeholder lint, Prisma generate/validate, TypeScript, unit tests, contract compile/tests, and Next.js production build completed successfully.
- Safety text search found only expected no-real-funds, no-mainnet, no-production, and no-mint-request boundary language.

## Self-Review Findings

- The branch adds deterministic risk engine logic and unit tests only.
- No mint request creation, contract mint call, UI work, live database adapter, secrets, or real-fund behavior was added.
- Failed checks are recorded through repository hooks for RiskEvent and AuditLog.
- Next.js validation generated an unrelated `next-env.d.ts` change, which was restored before commit.

## Improvements Applied

- Added 6-decimal string amount comparison to avoid floating-point limit decisions.
- Added tests for passing eligibility, KYB failure, unknown wallets, inactive/mismatched wallets, non-confirmed deposits, duplicate mint prevention, auto mint limit, and daily mint limit enforcement.
- Added risk engine documentation and security/runbook references.

## Remaining Risks

- A Prisma repository adapter is still needed for live persistence.
- Mint request creation is intentionally deferred to `agent/060-mint-request-flow`.

## Follow-Up Tasks

- Implement mint request lifecycle in `agent/060-mint-request-flow`.

## Next Recommended Branch

`agent/060-mint-request-flow`

## PR Status

- PR opened: pending.
- PR merged into `dev`: pending.
