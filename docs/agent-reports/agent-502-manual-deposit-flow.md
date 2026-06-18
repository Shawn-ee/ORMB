# Agent 502 - Manual Deposit Flow

## Branch

`agent/502-manual-deposit-flow`

## Scope

Added the first private-staging manual simulated deposit core without adding protected HTTP routes, admin forms, contract mint execution, custody, payment processing, real funds, or production behavior.

## Changes

- Added manual simulated deposit fields to `Deposit`:
  - `source`
  - `manualReference`
  - `manualConfirmedBy`
  - `manualConfirmedAt`
- Added migration `20260618000100_manual_deposit_fields`.
- Added `workers/manual-deposit-flow.ts`.
- Added unit coverage for:
  - simulated confirmed deposit creation
  - pending mint request creation through the existing risk/mint core
  - idempotent duplicate handling by `manualReference`
  - invalid amount rejection
  - risk rejection when the receiving wallet is not whitelisted
- Updated API and private-staging gap docs.

## Safety Notes

- Manual deposits are simulated staging records only.
- No real USDT, real RMB/CNH, customer deposits, custody, payment processing, payout, mainnet, or production behavior was added.
- No secrets were created, requested, committed, or exposed.
- This branch does not call ORMB minting. Testnet mint execution remains a later branch.

## Validation

- `npm run test` passed.
- `npm run typecheck` passed after tightening in-memory repository test method signatures.
- `npm run prisma:validate` passed.
- `npm run test:ci` passed.
- `git diff --check` passed.
- Browser checks were not required because this branch does not change UI routes.
