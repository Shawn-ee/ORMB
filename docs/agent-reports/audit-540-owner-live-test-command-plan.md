# Agent Report: `audit/540-owner-live-test-command-plan`

## Role

Private staging owner command-plan auditor.

## Objective

Create a concrete owner-executable command plan for the first private Base Sepolia live test without executing live commands, creating `.env`, deploying, minting, burning, granting roles, whitelisting wallets, sending RPC transactions, or committing secrets.

## Files Changed

- `docs/OWNER_BASE_SEPOLIA_LIVE_TEST_COMMAND_PLAN.md`
- `docs/agent-reports/audit-540-owner-live-test-command-plan.md`

## Implementation Summary

- Reviewed the private staging deploy candidate, live test checklist, environment guide, package scripts, Hardhat config, deploy script, role script, whitelist script, mint script, burn script, and staging preflight scripts.
- Added a step-by-step PowerShell-oriented owner command plan.
- Marked secret-bearing and transaction-bearing commands as `OWNER-RUN ONLY`.
- Documented current manual mint signer behavior: `contracts:manual-mint` uses the Hardhat `baseSepolia` account configured by `BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY`.
- Included prerequisites, `.env` creation, Base Sepolia test ETH acquisition, preflight, deployment, local contract address recording, minter role, whitelist, Prisma/database setup, app start, admin UI operations, mint verification, redemption, burn, reconciliation, app stop/restart, rollback, and emergency stop guidance.

## Non-Goals

- No product code changes.
- No `.env` creation.
- No secrets.
- No deployment.
- No mint.
- No burn.
- No role grant.
- No whitelist transaction.
- No RPC transaction.
- No mainnet, real funds, real USDT, real RMB/CNH, customer data, custody, public access, payout, or production claims.

## Validation

- `npm run test:ci`: PASS.
  - 157 unit tests passed.
  - 15 contract tests passed.
  - Prisma generate/validate, typecheck, contract compile, and Next.js build passed.
- `npm run test:e2e`: PASS after rerun by itself.
  - 16 Playwright checks passed.
- `git diff --check`: PASS.

Note: an initial `npm run test:e2e` invocation was run concurrently with `npm run test:ci`, which was rebuilding `.next`; that run saw transient 500 resource errors. The command was rerun by itself after `test:ci` completed and passed.

## Known Limitations

- The repo does not include a dedicated pause/unpause script.
- `contracts:manual-mint` currently uses the `BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY` signer through the `baseSepolia` Hardhat network.
- Dependency audit findings remain accepted only for owner-only local/private Base Sepolia staging review after human approval.
