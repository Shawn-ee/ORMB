# Ledger Reconciliation Review

## Branch

`audit/316-ledger-reconciliation-review`

## Objective

Re-audit the demo ledger invariants across deposits, mint requests, confirmed mints, verified burns, redemptions, and expected supply.

## Changes Made

- Added focused invariant coverage for duplicate confirmed mints on a single mint request.
- Expanded exclusion coverage so pending, submitted, and failed mints plus failed redemptions remain out of supply and duplicate burn calculations.
- Updated `docs/LEDGER_INVARIANTS.md` to document final-state-only reconciliation boundaries and required validation commands.

## Invariant Review

- Deposit path: a deposit cannot have more than one mint request without `DUPLICATE_MINT_REQUEST_FOR_DEPOSIT`.
- Mint request path: mint requests must reference an existing `CONFIRMED` or `MINT_REQUESTED` deposit; `MINTED` requests require at least one confirmed mint.
- Mint path: confirmed mints must reference an existing mint request, must match the request ORMB amount, and only one confirmed mint may exist per mint request.
- Burn path: only `BURN_VERIFIED`, `PAYOUT_SIMULATED`, and `COMPLETED` redemptions require burn event identity and burn event uniqueness.
- Supply path: expected supply is confirmed minted ORMB minus verified burned ORMB; supplied on-chain supply must match expected supply.
- Exclusions: rejected deposits, pending/submitted/failed mints, and requested/burn-pending/rejected/failed redemptions are excluded from supply totals and duplicate burn accounting.

## Validation

- Command: `npm run test`
- Result: passed, 90 unit tests.
- Command: `npm run test:ci`
- Result: passed; lint placeholder, Prisma generate, typecheck, Prisma validate, unit tests, contract compile, contract tests, and Next.js build completed successfully.
- Command: `git diff --check`
- Result: passed; Git reported line-ending normalization warnings for touched text files only.

## Security Notes

This review changed only tests and documentation. It did not add live services, deployments, mint commands, whitelist commands, private keys, seed phrases, production credentials, or mainnet behavior.

## Demo Boundary Notes

No real customer funds, real USDT, real RMB/CNH, real redemption rights, or production accounting claims were introduced. The ledger invariant checker remains a deterministic testnet demo safety tool.

## Follow-Up Work

- Keep future reconciliation behavior changes paired with invariant tests and documentation updates.
