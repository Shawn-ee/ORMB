# Agent Report: `audit/280-hosted-demo-readiness`

## Role

Hosted demo readiness audit sub-agent.

## Objective

Document the conditions under which ORMB could be considered for a safe read-only hosted demo while preserving no-real-funds, no-mainnet, and non-production boundaries.

## Files Changed

- `docs/HOSTED_DEMO_READINESS.md`
- `docs/KNOWN_LIMITATIONS.md`
- `docs/ENTERPRISE_READINESS_REVIEW.md`
- `docs/ENTERPRISE_PILOT_READINESS_SCORECARD.md`
- `docs/DEPENDENCY_AUDIT.md`
- `docs/agent-reports/audit-280-hosted-demo-readiness.md`

## Implementation Summary

- Added read-only hosted-demo verdict and prohibited hosted-demo modes.
- Added pre-host checklist, environment requirements, dependency audit decision, browser evidence expectations, and deployment boundaries.
- Updated known limitations to reference conditional hosted-demo readiness.
- Updated the enterprise readiness review to reflect that hosted-demo readiness now requires human acceptance rather than being undocumented.
- Updated the scorecard to mark hosted-demo readiness as partial/conditional rather than missing.
- Rechecked and documented dependency audit status for hosted-demo review.

## Validation

- `npm run test:ci`: PASS
  - lint placeholder completed
  - Prisma generate completed
  - TypeScript typecheck passed
  - Prisma schema validation passed
  - unit tests passed: 86
  - contract compile passed with no new contracts to compile
  - contract tests passed: 15
  - Next.js production build passed
- `npm run test:e2e`: initial parallel run with `test:ci` failed on `/` due transient 500 console errors while build/test servers were running concurrently; isolated rerun passed
  - isolated rerun result: PASS, 12 Playwright tests passed
- `npm audit --json`: EXIT 1 with known findings
  - Low: 8
  - Moderate: 9
  - High: 8
  - Critical: 0
  - Total: 25
- `git diff --check`: PASS

## Known Limitations

- Documentation-only audit branch.
- Does not deploy the app.
- Does not add hosting infrastructure, API routes, worker runners, database migrations, live RPC polling, or mutation route guards.
- Does not remediate dependency advisories.

## Safety Notes

- Testnet/mock-only boundary preserved.
- No real USDT, RMB/CNH, customer funds, or production claims.
- No legal, compliance, AML, sanctions, custody, or payment compliance claims.
- No secrets or private keys committed.
- No mainnet configuration or deployment.

## Next Recommended Branch

`agent/300-api-contract-docs`
