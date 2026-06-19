# Private Staging Environment

## Scope

This document defines the local/server environment required before an owner-only Base Sepolia private staging test. It does not authorize mainnet, real USDT, real RMB/CNH, real customer funds, custody, payment processing, public access, or production use.

Do not commit `.env`, private keys, RPC secrets, database credentials, passwords, seed phrases, screenshots containing secrets, or transaction notes that expose secret material.

## Current Variable Names

Some planning docs use generic names such as `PRIVATE_STAGING_MODE`, `HOSTED_DEMO_MODE`, `MUTATIONS_DISABLED`, `WORKERS_DISABLED`, `CHAIN_ID`, `RPC_URL`, and `ADMIN_PASSWORD`. The current implementation uses the names below.

| Generic concept | Current ORMB variable |
| --- | --- |
| Private staging mode | `ORMB_ENV_MODE=private-staging` |
| Hosted demo mode | `ORMB_READ_ONLY_DEMO_MODE`; must be `false` for private staging |
| Chain ID | `BASE_SEPOLIA_CHAIN_ID=84532` |
| RPC URL | `BASE_SEPOLIA_RPC_URL` |
| Admin password / access guard secret | `STAGING_BASIC_AUTH_USERNAME` and `STAGING_BASIC_AUTH_PASSWORD` |
| Dedicated minter address | `BASE_SEPOLIA_MINTER_ADDRESS`; `MINTER_ROLE_ADDRESS` remains a compatibility alias |
| Minter private key | `BASE_SEPOLIA_MINTER_PRIVATE_KEY` |
| Burner private key | `BASE_SEPOLIA_BURNER_PRIVATE_KEY` |
| ORMB contract | `ORMB_CONTRACT_ADDRESS` |
| Mock USDT contract | `MOCK_USDT_CONTRACT_ADDRESS` |

There is no current `MUTATIONS_DISABLED` or `WORKERS_DISABLED` environment flag. The current safety posture is that protected mutation routes, live worker runners, runtime wallet clients, and live burn execution are not enabled yet.

## Required Local Values

Create a local `.env` or server environment file from `.env.private-staging.example`. Fill values only on the owner machine or private server.

```env
ORMB_ENV_MODE=private-staging
ORMB_READ_ONLY_DEMO_MODE=false
DATABASE_URL=postgresql://...
BASE_SEPOLIA_RPC_URL=https://...
BASE_SEPOLIA_CHAIN_ID=84532
ORMB_CONTRACT_ADDRESS=0x...
MOCK_USDT_CONTRACT_ADDRESS=0x...
BASE_SEPOLIA_MINTER_ADDRESS=0x...
BASE_SEPOLIA_MINTER_PRIVATE_KEY=0x...
BASE_SEPOLIA_BURNER_PRIVATE_KEY=0x...
STAGING_BASIC_AUTH_USERNAME=...
STAGING_BASIC_AUTH_PASSWORD=...
```

## Script-Specific Values

The existing testnet scripts require explicit confirmation:

```env
ORMB_CONFIRM_TESTNET_DEPLOY=YES
BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY=0x...
```

Run the local-only deployment preflight before any deploy attempt:

```bash
npm run deploy:preflight -- --env-file .env
```

See `docs/BASE_SEPOLIA_DEPLOYMENT_READINESS.md` for the full deployment readiness checklist.

Deployment:

```env
BASE_SEPOLIA_RPC_URL=https://...
BASE_SEPOLIA_CHAIN_ID=84532
BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY=0x...
ORMB_CONFIRM_TESTNET_DEPLOY=YES
```

Whitelist update:

```env
ORMB_CONTRACT_ADDRESS=0x...
WHITELIST_WALLET=0x...
WHITELIST_ENABLED=true
ORMB_CONFIRM_TESTNET_DEPLOY=YES
```

Manual mint script:

```env
ORMB_CONTRACT_ADDRESS=0x...
BASE_SEPOLIA_MINTER_ADDRESS=0x...
BASE_SEPOLIA_MINTER_PRIVATE_KEY=0x...
MINT_TO_ADDRESS=0x...
MINT_AMOUNT_ORMB=1
ORMB_CONFIRM_TESTNET_DEPLOY=YES
```

Dedicated minter role tooling:

```env
ORMB_CONTRACT_ADDRESS=0x...
BASE_SEPOLIA_MINTER_ADDRESS=0x...
BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY=0x...
ORMB_CONFIRM_TESTNET_DEPLOY=YES
```

Preferred owner commands:

```bash
npm run contracts:check-minter-role
npm run contracts:grant-minter-role
npm run contracts:revoke-minter-role
npm run contracts:manual-mint:minter
```

Offline mint/burn dry-run:

```env
STAGING_DRY_RUN_ONLY=true
STAGING_DRY_RUN_FLOW=mint-and-burn
MINT_TO_ADDRESS=0x...
MINT_AMOUNT_ORMB=1
BURN_FROM_ADDRESS=0x...
BURN_AMOUNT_ORMB=1
BURN_EVIDENCE_TX_HASH=0x...
BURN_EVIDENCE_LOG_INDEX=0
```

Guarded burn script:

```env
BASE_SEPOLIA_RPC_URL=https://...
BASE_SEPOLIA_CHAIN_ID=84532
BASE_SEPOLIA_BURNER_PRIVATE_KEY=0x...
ORMB_CONTRACT_ADDRESS=0x...
BURN_FROM_ADDRESS=0x...
BURN_AMOUNT_ORMB=1
ORMB_CONFIRM_TESTNET_DEPLOY=YES
```

## Safety Preflight

Before any Base Sepolia action:

1. `BASE_SEPOLIA_CHAIN_ID` is exactly `84532`.
2. The RPC endpoint is Base Sepolia, not Base mainnet, Ethereum mainnet, or another network.
3. Contract addresses are Base Sepolia deployments created for ORMB private staging.
4. Private keys are testnet-only and local/server-only.
5. `BASE_SEPOLIA_MINTER_ADDRESS` matches the wallet derived from `BASE_SEPOLIA_MINTER_PRIVATE_KEY`.
6. Test wallets contain only Base Sepolia ETH and testnet ORMB/MockUSDT.
7. Basic Auth credentials are non-placeholder values and are not reused from any production system.
8. No customer data, real deposit data, real USDT, real RMB/CNH, custody, or payout data is used.
9. Public access is blocked; the app is owner-only.
10. `.env` is ignored by git and must not appear in `git status`.
11. `npm run test:ci`, `npm run test:e2e`, and `npm run build` pass before live testing.

## Preflight Command

Before any owner live test, run:

```bash
npm run staging:preflight
npm run staging:tx-dry-run
```

To check a specific local file without printing secrets:

```bash
npm run staging:preflight -- --env-file .env
npm run staging:tx-dry-run -- --env-file .env
```

The preflight is local-only. It does not deploy contracts, grant roles, call RPC methods, mint, burn, write to the database, or send transactions. It fails closed for missing database/RPC/admin guard values, mainnet-like chain IDs, hosted-demo mode conflicts, and mutation-disabled interactive staging.

The transaction dry-run is also offline and local-only. It validates intended mint and burn inputs, Base Sepolia posture, dry-run-only confirmation, contract addresses, local-only testnet keys, and optional burn evidence format. It does not create wallet clients, call RPC, query contracts, submit transactions, mint, burn, or write database records.

The guarded burn script is not a dry-run. It sends a Base Sepolia transaction if the owner runs it with `ORMB_CONFIRM_TESTNET_DEPLOY=YES`, a local-only testnet burner key, a matching `BURN_FROM_ADDRESS`, and enough testnet ORMB balance. Do not run it during validation or CI.

The guarded manual mint script is not a dry-run. It uses `BASE_SEPOLIA_MINTER_PRIVATE_KEY` through the `baseSepoliaMinter` Hardhat network and sends a Base Sepolia transaction only after confirming the signer matches `BASE_SEPOLIA_MINTER_ADDRESS`, the contract is not paused, the minter has `MINTER_ROLE`, and the recipient wallet is whitelisted.

The preflight supports `STAGING_CONTRACTS_NOT_YET_DEPLOYED=true` for planning. In that state it may pass with warnings, but the owner must not run live mint or burn until Base Sepolia contract addresses are configured.

## Validation Commands

Run locally before staging:

```bash
npm ci
npx prisma generate
npx prisma validate
npm run staging:preflight
npm run staging:tx-dry-run
npm run test:ci
npm run test:e2e
npm run build
```

Optional local database setup:

```bash
npm run db:up
npm run db:migrate:local
npm run db:seed
npm run dev
```

For private server staging schema application:

```bash
npm run db:deploy
```

Do not run `npm run db:reset:local` or destructive Prisma reset commands against a staging database.
