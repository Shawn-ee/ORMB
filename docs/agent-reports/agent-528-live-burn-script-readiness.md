# Agent Report: `agent/528-live-burn-script-readiness`

## Role

Base Sepolia burn script readiness agent.

## Objective

Add a guarded Base Sepolia ORMB burn script for owner-run private staging tests without adding UI or worker-driven live burn execution.

## Files Changed

- `hardhat.config.ts`
- `scripts/burn-ormb.ts`
- `package.json`
- `.env.private-staging.example`
- `docs/PRIVATE_STAGING_ENVIRONMENT.md`
- `docs/PRIVATE_STAGING_LIVE_TEST_CHECKLIST.md`
- `docs/PRIVATE_STAGING_SECURITY_REVIEW.md`
- `docs/agent-reports/agent-528-live-burn-script-readiness.md`

## Implementation Summary

- Added `baseSepoliaBurner` Hardhat network using `BASE_SEPOLIA_BURNER_PRIVATE_KEY`.
- Added `npm run contracts:burn`.
- Added guarded burn script that requires `ORMB_CONFIRM_TESTNET_DEPLOY=YES`, verifies Base Sepolia chain ID, verifies the connected burner signer matches `BURN_FROM_ADDRESS`, checks `paused()`, checks ORMB balance, and only then submits `burn`.
- Updated private staging docs and security review to classify burn execution as a guarded owner-run script/manual path.

## Non-Goals

- No script execution against Base Sepolia.
- No live mint, burn, deploy, role grant, whitelist transaction, RPC transaction, or database mutation during this branch.
- No admin UI burn execution.
- No runtime worker wallet client.
- No `.env` creation or secrets.
- No mainnet, real funds, real USDT, real RMB/CNH, customer data, custody, payout, or production claims.

## Validation

- `npm run typecheck`: PASS.
- `npm run compile:contracts`: PASS.
- `npm run test:contracts`: PASS, 15 contract tests.
- `npm run test:ci`: PASS, including placeholder lint, Prisma generate/validate, typecheck, 157 unit tests, contract compile, 15 contract tests, and Next build.
- `npm run test:e2e`: PASS, 16 Playwright checks.
- `git diff --check`: PASS.
- `npm run contracts:burn`: NOT RUN because it is a live Base Sepolia transaction script.

## Self-Review Notes

- Confirmed the script requires explicit `ORMB_CONFIRM_TESTNET_DEPLOY=YES`.
- Confirmed the script uses `baseSepoliaBurner` with `BASE_SEPOLIA_BURNER_PRIVATE_KEY`.
- Confirmed it checks chain ID, signer/address match, paused state, and balance before submitting `burn`.
- Confirmed script output does not print private keys or RPC secrets.
- Confirmed docs state this is not a dry-run and must not be run in CI/validation.

## Next Recommended Branch

`agent/529-private-staging-evidence-bundle`
