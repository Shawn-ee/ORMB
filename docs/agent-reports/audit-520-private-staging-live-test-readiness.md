# Agent Report: `audit/520-private-staging-live-test-readiness`

## Role

Private staging live-test readiness audit agent.

## Objective

Prepare the owner to run a safe owner-only Base Sepolia private staging test by documenting exact environment requirements, live-test checklist, validation commands, and troubleshooting guidance.

## Scope

- Reviewed current private staging environment validation, contract scripts, staging gateways, runbook, and release docs.
- Added environment checklist for current ORMB variable names.
- Added owner live-test checklist for Base Sepolia mint/burn staging preparation.
- Added troubleshooting guide for common private staging failures.

## Files Changed

- `docs/PRIVATE_STAGING_ENVIRONMENT.md`
- `docs/PRIVATE_STAGING_LIVE_TEST_CHECKLIST.md`
- `docs/PRIVATE_STAGING_TROUBLESHOOTING.md`
- `docs/agent-reports/audit-520-private-staging-live-test-readiness.md`

## Non-Goals

- No product logic changes.
- No `.env` creation.
- No secrets.
- No live mint, burn, deployment, role grant, or RPC transaction.
- No mainnet, real funds, real USDT, real RMB/CNH, customer data, custody, or production claims.

## Validation

- `npm run test:ci`: PASS
  - Unit tests passed: 130.
  - Contract tests passed: 15.
  - Prisma generate/validate, TypeScript typecheck, contract compile, and Next.js build passed.
- `npm run test:e2e`: PASS on sequential rerun.
  - Initial parallel run collided with a concurrent `next build` lock: "Another next build process is already running."
  - Sequential rerun passed: 16 Playwright tests.
- `npm run build`: PASS.
- `git diff --check`: PASS.

## Known Limitations

- Protected mutation API routes and admin write UI are still disabled.
- No dedicated `MINTER_ROLE` grant script exists.
- No dedicated live burn execution script exists.
- Current burn support is a Base Sepolia burn evidence boundary plus redemption state-machine verification.

## Next Recommended Branches

1. `agent/521-local-env-template-and-safe-preflight`
2. `agent/522-base-sepolia-contract-deploy-readiness`
3. `agent/523-guarded-role-management-script`
