# Database Migration Runbook

## Purpose

This runbook defines how future ORMB database migration work should be planned and validated. It does not create migrations, connect to a live database, approve production deployment, or authorize real customer data.

ORMB remains testnet-only, mock-asset-only, no-real-funds, no-mainnet, and non-production.

## Current State

- Prisma schema exists at `prisma/schema.prisma`.
- Prisma config exists for local tooling.
- Deterministic seed data exists for local demo use.
- No production database is configured.
- No migration deployment pipeline exists.
- No backup/restore automation exists.
- No real customer data is permitted.

## Migration Principles

- Every schema change must be scoped to one branch.
- Every schema change must include documentation and an agent report.
- Every schema change must run Prisma generate and validate.
- Every migration affecting lifecycle records must include tests for state-transition assumptions.
- Migrations must be reversible by a documented forward-fix or rollback plan.
- No branch may use production database credentials.
- No branch may store real customer data, real KYB/KYC documents, private keys, seed phrases, RPC secrets, or payment credentials.

## Required Branch Checklist

Before opening a migration PR:

- [ ] Explain the schema objective.
- [ ] Identify affected tables and enums.
- [ ] Identify affected worker/API/UI docs.
- [ ] Document data backfill assumptions.
- [ ] Document rollback or forward-fix strategy.
- [ ] Run `npm run prisma:generate`.
- [ ] Run `npm run prisma:validate`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run test`.
- [ ] Run `npm run test:ci`.
- [ ] Confirm no real database credentials are committed.
- [ ] Confirm no production database was touched.

## Local Development Procedure

For local-only schema review:

```bash
npm run prisma:generate
npm run prisma:validate
npm run test:ci
```

If a future branch introduces actual migration files, it must document the exact local Prisma command used and the resulting migration name.

Do not run migration commands against hosted, shared, production, or customer databases from agent branches.

## Data Backfill Rules

Future data backfills must:

- run dry-run first
- report record counts and affected IDs
- be idempotent
- avoid real customer data
- avoid contract calls
- avoid minting or redemption
- create audit or operator review context when state changes are applied

Backfills that change deposits, mint requests, mints, redemptions, risk events, audit logs, or worker checkpoints require focused tests and explicit documentation.

## Rollback And Forward-Fix Strategy

Because Prisma migrations may not be safely reversible in every environment, every migration branch must define one of:

- rollback migration for local/demo data
- forward-fix migration
- documented data restore process for synthetic demo data
- explicit statement that rollback is not required because no migration files or live data were changed

Rollback plans must not depend on real customer backups because real customer data is prohibited.

## High-Risk Schema Areas

Treat these as high risk:

- deposit uniqueness and chain event identity
- mint request uniqueness per deposit
- mint transaction identity
- redemption burn event identity
- risk event status transitions
- audit log immutability assumptions
- system job checkpoints
- company wallet whitelist state
- enum values used by worker state machines

High-risk schema changes require both worker tests and documentation updates.

## Hosted Demo Boundary

A read-only hosted demo should not run database migrations at request time.

Any hosted environment must:

- avoid production database credentials
- avoid customer data
- avoid write-enabled mutation flows unless separately approved
- keep seed/demo data fictional
- document reset/reseed assumptions

## Validation Commands

Common validation:

```bash
npm run prisma:generate
npm run prisma:validate
npm run typecheck
npm run test
npm run test:ci
```

If UI behavior changes because of schema work:

```bash
npm run test:e2e
```

## Incident Conditions

Stop and escalate if:

- a production database credential is required
- real customer data is needed
- a migration could affect real funds or legal obligations
- a schema change breaks ledger invariants
- a migration requires force-pushing `main` or `dev`
- rollback or forward-fix is unclear for a high-risk lifecycle table

## Non-Goals

- No migration files are created here.
- No database connection is opened here.
- No production migration plan is approved.
- No backup service is selected.
- No real customer or compliance data handling is approved.

## Follow-Up Branches

- `agent/303-audit-retention-docs`: define audit retention and export assumptions.
- Future schema branches must cite this runbook in their agent reports.
