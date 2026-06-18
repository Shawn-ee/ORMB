# Architecture

## Target System Overview

ORMB will be organized as an API-first demo with clearly separated responsibilities:

- `contracts/`: Solidity contracts for the ORMB token and permissioned mint/burn controls.
- `src/`: Next.js application and API routes.
- `workers/`: Node.js workers for mock deposit monitoring, confirmations, reconciliation, and event processing.
- `prisma/`: Database schema and migration files.
- `scripts/`: Deployment and operational scripts.
- `test/`: Contract, backend, worker, and integration tests.

## Planned Components

### Smart Contracts

The repository includes a permissioned ERC-20 style ORMB demo token using OpenZeppelin Contracts v5. The token supports controlled minting, burning, pause controls, and whitelisted transfers for the testnet demo lifecycle.

The repository also includes MockUSDT as a 6-decimal mock deposit asset. Both contracts are testnet-only demo components and must not be represented as production financial instruments.

Hardhat 3, TypeScript, viem, OpenZeppelin Contracts v5, dotenv support, and a Base Sepolia network configuration are driven by environment variables.

### API Layer

The API layer will model onboarding, mint requests, approvals, transfers, redemptions, and audit log queries. It must be idempotent, explicit about state transitions, and safe for repeated event delivery.

No API implementation exists in the bootstrap milestone.

### Workers

Workers will simulate deposit detection, confirmation tracking, chain event ingestion, reconciliation, and retry handling. All deposit data in the MVP must be mock or testnet-only.

The repository includes testable worker cores for MockUSDT deposit log processing, deposit confirmation handling, mint eligibility risk checks, mint request lifecycle orchestration, and redemption burn verification. Live RPC polling runners and production persistence adapters are deferred to later branches.

### Database

Prisma and PostgreSQL will be used for durable demo state including companies, whitelist status, deposits, mint requests, transfers, redemption requests, chain events, reconciliation records, and audit logs.

The repository includes Prisma/PostgreSQL models for companies, company wallets, deposits, FX quotes, mint requests, mints, redemptions, audit logs, system job state, and risk events. Deposit ingestion is designed around an idempotency constraint on `chainId + txHash + logIndex`.

Workers and APIs are responsible for enforcing state transitions in later branches.

### UI

The UI will include an admin dashboard and company dashboard for the target demo lifecycle.

The repository includes a Next.js app shell with placeholder home, admin, company, and system status routes. These routes are static placeholders only; business data wiring and operational dashboards will be added in later focused branches.

## Chain Choice

The target chain is Base Sepolia. Hardhat network configuration uses `BASE_SEPOLIA_RPC_URL` and `BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY` placeholders for future testnet-only deployment work. See `docs/decisions/0002-chain-choice.md`.

## Security Model

The MVP assumes testnet-only assets, manual approvals, whitelisted enterprises, mock deposit inputs, and strict separation from production financial activity.
