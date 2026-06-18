# Agent 504 - Redemption Cashout Flow

## Branch

`agent/504-redemption-cashout-flow`

## Scope

Added a Base Sepolia burn evidence validation boundary for future private staging redemption/cashout work. This branch does not add HTTP routes, admin forms, real payout, custody, payment processing, live workers, private-key loading, contract transactions, or production behavior.

## Changes

- Added `src/lib/staging/base-sepolia-burn-gateway.ts`.
- Added unit coverage for:
  - valid Base Sepolia burn evidence normalization
  - non-Base-Sepolia rejection
  - wallet mismatch rejection
  - amount mismatch and malformed amount rejection
  - malformed transaction hash/log index rejection
- Updated API, contract threat model, and private-staging gap docs.

## Safety Notes

- Burn evidence is for simulated private staging cashout only.
- No real payout, real funds, real USDT, real RMB/CNH, custody, banking, mainnet, or production redemption behavior was enabled.
- No secrets were created, requested, committed, or exposed.

## Validation

- `npm run test` passed.
- `npm run typecheck` passed.
- `npm run test:ci` passed.
- `git diff --check` passed.
- Browser checks were not required because this branch does not change UI routes.
