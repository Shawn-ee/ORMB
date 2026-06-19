# Agent Report: `agent/541-dedicated-minter-role-tooling`

## Role

Private staging minter role separation engineer.

## Objective

Add safe testnet-only tooling and documentation for Route B: the deployer/admin wallet deploys contracts and manages roles, while a dedicated minter wallet executes ORMB mint transactions after admin approval.

## Files Changed

- `.env.private-staging.example`
- `hardhat.config.ts`
- `package.json`
- `scripts/check-minter-role.ts`
- `scripts/grant-minter-role.ts`
- `scripts/manual-mint.ts`
- `scripts/manage-minter-role.ts`
- `scripts/revoke-minter-role.ts`
- `src/lib/config/live-mint-burn-dry-run.ts`
- `src/lib/config/minter-role-readiness.ts`
- `src/lib/config/private-staging-preflight.ts`
- `test/config/live-mint-burn-dry-run.unit.test.ts`
- `test/config/minter-role-readiness.unit.test.ts`
- `test/config/private-staging-preflight.unit.test.ts`
- `docs/DEDICATED_MINTER_RUNBOOK.md`
- `docs/MINTER_ROLE_GRANT_READINESS.md`
- `docs/OWNER_BASE_SEPOLIA_LIVE_TEST_COMMAND_PLAN.md`
- `docs/PRIVATE_STAGING_DEPLOY_CANDIDATE.md`
- `docs/PRIVATE_STAGING_ENVIRONMENT.md`
- `docs/PRIVATE_STAGING_LIVE_TEST_CHECKLIST.md`
- `docs/PRIVATE_STAGING_TROUBLESHOOTING.md`
- `docs/agent-reports/agent-541-dedicated-minter-role-tooling.md`

## Implementation Summary

- Added a `baseSepoliaMinter` Hardhat network using `BASE_SEPOLIA_MINTER_PRIVATE_KEY`.
- Routed `contracts:manual-mint` and `contracts:manual-mint:minter` through the dedicated minter network.
- Added minter script checks that stop before submission when the signer does not match `BASE_SEPOLIA_MINTER_ADDRESS`, the contract is paused, the minter lacks `MINTER_ROLE`, or the recipient is not whitelisted.
- Added wrapper scripts for `contracts:check-minter-role`, `contracts:grant-minter-role`, and `contracts:revoke-minter-role`.
- Added `BASE_SEPOLIA_MINTER_ADDRESS` to the private staging env template and config preflights while preserving `MINTER_ROLE_ADDRESS` as a compatibility alias.
- Updated owner-facing docs to make the deployer/admin key role-management-only and the dedicated minter key mint-execution-only.

## Non-Goals

- No `.env` creation.
- No secrets.
- No deployment.
- No live role grant, revoke, or check.
- No live mint.
- No live burn.
- No whitelist transaction.
- No RPC transaction.
- No mainnet, real funds, real USDT, real RMB/CNH, customer data, custody, payout, public access, or production claims.

## Validation

- `npm run typecheck`: PASS.
- `npm run test`: PASS.
  - 161 unit tests passed.
- `npm run test:contracts`: PASS.
  - 15 contract tests passed.
- `npm run test:ci`: PASS.
  - Lint placeholder, Prisma generate/validate, typecheck, unit tests, contract compile, contract tests, and Next.js build passed.
- `npm run test:e2e`: PASS.
  - 16 Playwright checks passed.
- `npm run staging:preflight`: PASS with dummy local-only Base Sepolia private staging values.
  - No `.env` was created.
  - No real secrets were used.
  - No RPC calls or transactions were made.
  - Output redacted secret-like values.
- `git diff --check`: PASS.

## Known Limitations

- `contracts:check-minter-role` performs a Base Sepolia RPC read when the owner runs it with a real local `.env`; it is not run in CI.
- `contracts:grant-minter-role`, `contracts:revoke-minter-role`, and `contracts:manual-mint:minter` can send Base Sepolia transactions and require explicit owner approval plus local testnet-only values.
- Runtime worker wallet loading is still not implemented; this branch prepares safe script and env separation for the owner-run private staging path.
