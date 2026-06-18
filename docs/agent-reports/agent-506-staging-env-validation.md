# Agent Report: Staging Environment Validation

## Branch

`agent/506-staging-env-validation`

## Objective

Add strict `private-staging` environment mode validation for future owner-only interactive Base Sepolia staging without adding admin guards, mutation APIs, custody, payment processing, or live mint/burn behavior.

## Changes Made

- Added `ORMB_ENV_MODE=private-staging` support in `src/lib/config/env.ts`.
- Added private staging validation for non-placeholder Base Sepolia RPC, `BASE_SEPOLIA_CHAIN_ID=84532`, non-placeholder ORMB contract address, staging Basic Auth username/password, and non-placeholder testnet-only minter/burner private keys.
- Kept `local` mode usable without secrets and kept `testnet-script` deployer-key behavior compatible.
- Hardened `hosted-demo` validation so it remains read-only and rejects deployer, minter, and burner private keys.
- Added focused unit tests for private staging acceptance and fail-closed rejection cases.
- Updated `.env.example` with placeholder-only private staging values and no real secrets.
- Updated secret-management and private-staging gap-analysis documentation.

## Validation

- Command: `npm run test`
- Result: Pending.
- Command: `npm run typecheck`
- Result: Pending.
- Command: `npm run test:ci`
- Result: Pending.
- Command: `git diff --check`
- Result: Pending.

## Security Notes

- No real secrets, private keys, RPC credentials, seed phrases, customer data, or production credentials were added.
- Private staging validation is Base Sepolia only and rejects mainnet-like chain IDs such as Ethereum mainnet `1` and Base mainnet `8453`.
- This branch does not add admin middleware, API routes, UI routes, Prisma changes, contracts, workers, Docker compose changes, package changes, or live transaction behavior.

## Demo Boundary Notes

- No real funds, real USDT, real RMB/CNH, customer deposits, mainnet deployment, custody, payment processing, live mint/burn service behavior, or production claims were introduced.

## Follow-Up Work

- Implement admin access middleware in the later focused admin guard branch.
- Add mutation APIs, persistent adapters, staging on-chain gateways, and staging runbooks only in their later approved branches.
