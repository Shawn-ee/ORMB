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

Future branches will design a permissioned ERC-20 style ORMB token using OpenZeppelin Contracts v5. Contracts must support a controlled mint/burn lifecycle and clear role boundaries.

The repository includes Hardhat 3, TypeScript, viem, OpenZeppelin Contracts v5, dotenv support, and a Base Sepolia network configuration driven by environment variables. `contracts/ToolingPlaceholder.sol` exists only to validate the toolchain. It does not implement ORMB token logic.

### API Layer

The API layer will model onboarding, mint requests, approvals, transfers, redemptions, and audit log queries. It must be idempotent, explicit about state transitions, and safe for repeated event delivery.

No API implementation exists in the bootstrap milestone.

### Workers

Workers will simulate deposit detection, confirmation tracking, chain event ingestion, reconciliation, and retry handling. All deposit data in the MVP must be mock or testnet-only.

No worker implementation exists in the bootstrap milestone.

### Database

Prisma and PostgreSQL will be used for durable demo state including companies, whitelist status, deposits, mint requests, transfers, redemption requests, chain events, reconciliation records, and audit logs.

The repository includes a Prisma/PostgreSQL tooling baseline with a minimal schema and shared Prisma Client helper. ORMB business ledger models will be added in a later domain schema branch.

### UI

The UI will include an admin dashboard and company dashboard for the target demo lifecycle.

No UI implementation exists in the bootstrap milestone.

## Chain Choice

The target chain is Base Sepolia. Hardhat network configuration uses `BASE_SEPOLIA_RPC_URL` and `BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY` placeholders for future testnet-only deployment work. See `docs/decisions/0002-chain-choice.md`.

## Security Model

The MVP assumes testnet-only assets, manual approvals, whitelisted enterprises, mock deposit inputs, and strict separation from production financial activity.
