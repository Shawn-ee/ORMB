# Roadmap

All work must happen on focused `agent/*` or `audit/*` branches and merge into `dev` only after validation.

## Phase 0: Repository Bootstrap

- Branch: `agent/bootstrap-repository`
- Goal: Create project structure, docs, placeholder scripts, and CI.
- Status: initial bootstrap.

## Phase 1: Project Tooling

- Branch: `agent/tooling-next-typescript`
- Goal: Add Next.js, TypeScript, linting, formatting, and test harness.

- Branch: `agent/tooling-hardhat-viem`
- Goal: Add Hardhat, viem, OpenZeppelin Contracts v5, and contract test setup.

- Branch: `agent/tooling-prisma-postgres`
- Goal: Add Prisma, PostgreSQL configuration, schema baseline, and validation scripts.

## Phase 2: Domain Model

- Branch: `agent/domain-schema`
- Goal: Define companies, whitelist records, deposits, mint requests, transfers, redemption requests, chain events, and audit logs.

- Branch: `agent/state-machines`
- Goal: Document and encode mint and redemption state transitions.

## Phase 3: Contracts

- Branch: `agent/contracts-ormb-token`
- Goal: Implement testnet ORMB token contract with permissioned mint and burn controls.

- Branch: `agent/contracts-access-control-tests`
- Goal: Validate access control, mint/burn safety, and event behavior.

## Phase 4: Backend And Workers

- Branch: `agent/api-mint-lifecycle`
- Goal: Implement API endpoints for mint request creation, approval, and status.

- Branch: `agent/worker-mock-deposit-monitor`
- Goal: Implement mock deposit detection and confirmation handling.

- Branch: `agent/worker-chain-event-indexer`
- Goal: Implement idempotent chain event processing.

- Branch: `agent/ledger-reconciliation`
- Goal: Implement ledger reconciliation checks and reporting.

## Phase 5: Dashboards

- Branch: `agent/admin-dashboard`
- Goal: Build admin onboarding, approval, audit, and reconciliation views.

- Branch: `agent/company-dashboard`
- Goal: Build company deposit, mint, transfer, and redemption views.

## Phase 6: Demo Hardening

- Branch: `agent/demo-seed-data`
- Goal: Add deterministic demo data and scripted walkthrough.

- Branch: `audit/security-review`
- Goal: Review security assumptions, access controls, secrets handling, and demo boundaries.

- Branch: `agent/release-demo-checklist`
- Goal: Complete release checklist before any `dev` to `main` merge.
