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
| Minter private key | `BASE_SEPOLIA_MINTER_PRIVATE_KEY` |
| Burner private key | `BASE_SEPOLIA_BURNER_PRIVATE_KEY` |
| ORMB contract | `ORMB_CONTRACT_ADDRESS` |
| Mock USDT contract | `MOCK_USDT_CONTRACT_ADDRESS` |

There is no current `MUTATIONS_DISABLED` or `WORKERS_DISABLED` environment flag. The current safety posture is that protected mutation routes, live worker runners, runtime wallet clients, and live burn execution are not enabled yet.

## Required Local Values

Create a local `.env` or server environment file from `.env.example`. Fill values only on the owner machine or private server.

```env
ORMB_ENV_MODE=private-staging
ORMB_READ_ONLY_DEMO_MODE=false
DATABASE_URL=postgresql://...
BASE_SEPOLIA_RPC_URL=https://...
BASE_SEPOLIA_CHAIN_ID=84532
ORMB_CONTRACT_ADDRESS=0x...
MOCK_USDT_CONTRACT_ADDRESS=0x...
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
MINT_TO_ADDRESS=0x...
MINT_AMOUNT_ORMB=1
ORMB_CONFIRM_TESTNET_DEPLOY=YES
```

## Safety Preflight

Before any Base Sepolia action:

1. `BASE_SEPOLIA_CHAIN_ID` is exactly `84532`.
2. The RPC endpoint is Base Sepolia, not Base mainnet, Ethereum mainnet, or another network.
3. Contract addresses are Base Sepolia deployments created for ORMB private staging.
4. Private keys are testnet-only and local/server-only.
5. Test wallets contain only Base Sepolia ETH and testnet ORMB/MockUSDT.
6. Basic Auth credentials are non-placeholder values and are not reused from any production system.
7. No customer data, real deposit data, real USDT, real RMB/CNH, custody, or payout data is used.
8. Public access is blocked; the app is owner-only.
9. `.env` is ignored by git and must not appear in `git status`.
10. `npm run test:ci`, `npm run test:e2e`, and `npm run build` pass before live testing.

## Validation Commands

Run locally before staging:

```bash
npm ci
npx prisma generate
npx prisma validate
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
