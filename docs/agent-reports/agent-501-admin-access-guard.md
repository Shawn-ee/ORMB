# Agent 501 - Admin Access Guard

## Branch

`agent/501-admin-access-guard`

## Scope

Added a private staging access guard without adding mutation APIs, custody, payment processing, live mint/burn behavior, real-funds handling, or production authentication claims.

## Changes

- Added a pure Basic Auth helper in `src/lib/auth/private-staging-basic-auth.ts`.
- Added `src/proxy.ts` protection for `/admin`, `/api/admin/**`, and `/api/staging/**`.
- Activated the guard only when `ORMB_ENV_MODE=private-staging`.
- Kept local and hosted-demo read-only page access compatible.
- Added unit tests for local/hosted-demo bypass, private-staging missing credentials, invalid credentials, valid credentials, and fail-closed invalid staging config.
- Updated API, secret-management, and private-staging gap docs.

## Safety Notes

- No real secrets were created, requested, committed, or exposed.
- No contract deployment or transaction was attempted.
- No mainnet, real USDT, real RMB/CNH, custody, payment processing, real payout, or production behavior was enabled.
- Basic Auth is documented as owner-only private staging protection, not production authentication.

## Validation

- `npm run test` passed.
- `npm run typecheck` passed.
- `npm run build` passed.
- `npm run test:ci` passed.
- `npm run test:e2e` passed on standalone rerun.
- `git diff --check` passed.

The first `npm run test:e2e` run was started concurrently with `npm run test:ci` and produced transient 500 resource errors while Next build/server work overlapped. A standalone rerun passed all 16 Playwright checks.
