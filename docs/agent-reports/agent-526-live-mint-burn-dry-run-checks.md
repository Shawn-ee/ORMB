# Agent Report: `agent/526-live-mint-burn-dry-run-checks`

## Role

Private staging transaction safety agent.

## Objective

Add offline dry-run checks for intended Base Sepolia mint and burn inputs before the owner attempts any guarded live staging transaction.

## Files Changed

- `src/lib/config/live-mint-burn-dry-run.ts`
- `scripts/dry-run-live-mint-burn.ts`
- `test/config/live-mint-burn-dry-run.unit.test.ts`
- `.env.private-staging.example`
- `package.json`
- `docs/PRIVATE_STAGING_ENVIRONMENT.md`
- `docs/PRIVATE_STAGING_LIVE_TEST_CHECKLIST.md`
- `docs/agent-reports/agent-526-live-mint-burn-dry-run-checks.md`

## Implementation Summary

- Added `npm run staging:tx-dry-run`.
- Added a pure dry-run validator for mint-only, burn-only, and mint-and-burn intent.
- Required explicit `STAGING_DRY_RUN_ONLY=true`.
- Validated private staging mode, Base Sepolia chain ID, non-mainnet RPC posture, ORMB contract address, intended mint recipient/amount, minter role address, local-only minter key, intended burn source/amount, local-only burner key, and optional burn evidence format.
- Redacted private keys and full transaction hashes from formatted output.
- Updated the private staging env template and runbooks with placeholder-only dry-run values.

## Non-Goals

- No live mint execution.
- No live burn execution.
- No RPC calls or contract reads.
- No wallet client construction.
- No database writes.
- No deployment, role grant, or whitelist transaction.
- No `.env` creation or secrets.
- No mainnet, real funds, real USDT, real RMB/CNH, customer data, custody, payout, or production claims.

## Validation

- `npm run typecheck`: PASS.
- `npm run test`: PASS, 157 unit tests.
- `npm run staging:tx-dry-run` with dummy Base Sepolia-style env values: PASS; no RPC call, no transaction, and private keys redacted.
- `npm run test:ci`: PASS, including placeholder lint, Prisma generate/validate, typecheck, 157 unit tests, contract compile, 15 contract tests, and Next build.
- `npm run test:e2e`: PASS, 16 Playwright checks.
- `git diff --check`: PASS.

## Self-Review Notes

- Confirmed the dry-run script does not import Hardhat, viem clients, Prisma, or wallet constructors.
- Confirmed it validates configuration and intended transaction inputs only.
- Confirmed it requires `STAGING_DRY_RUN_ONLY=true`.
- Confirmed it fails closed for Base mainnet chain ID `8453`, Ethereum mainnet chain ID `1`, missing dry-run confirmation, malformed addresses, invalid 6-decimal amounts, and malformed burn evidence fields.
- Confirmed formatted output redacts private keys and does not print full transaction hashes.

## Next Recommended Branch

`audit/527-private-staging-security-review`
