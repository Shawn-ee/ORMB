# Worker Adapter Boundaries

## Purpose

This document defines boundaries for future ORMB worker runners and persistence adapters. It is documentation only; no live worker process, RPC polling loop, queue, database adapter, or deployment service is implemented in this branch.

ORMB remains testnet-only, mock-asset-only, no-real-funds, no-mainnet, and non-production.

## Current Worker Model

Current worker files provide deterministic cores:

- `deposit-listener.ts`: processes supplied MockUSDT transfer logs.
- `confirmation-worker.ts`: advances supplied deposit confirmation state.
- `risk-engine.ts`: evaluates mint eligibility.
- `mint-request-flow.ts`: creates and submits demo mint requests through abstract repositories/gateways.
- `redemption-burn-flow.ts`: validates demo redemption and burn flows through abstract repositories.
- `ledger-invariants.ts`: evaluates demo ledger/supply invariants.
- `listener-backfill.ts`: plans bounded backfill ranges.
- `listener-dry-run-backfill.ts`: analyzes supplied log fixtures without writes.
- `listener-error-taxonomy.ts`: classifies listener/backfill errors.
- `worker-status.ts`: summarizes supplied worker checkpoints.

These cores do not start durable processes, open network connections, read secrets, write directly to a live database, deploy contracts, or process real funds.

## Adapter Layers

Future live-demo work must keep these layers separate:

| Layer | Responsibility | Prohibited Behavior |
| --- | --- | --- |
| Core worker | Deterministic state-transition logic over supplied inputs. | Reading secrets, opening RPC connections, starting loops, writing databases directly. |
| Persistence adapter | Reads/writes Prisma records and audit logs for one scoped operation. | Bypassing unique constraints, hiding failed writes, writing real customer data. |
| Chain adapter | Reads Base Sepolia testnet logs or transaction receipts. | Mainnet RPC, real USDT, private-key use, unbounded scans. |
| Runner | Schedules bounded jobs, retries, status checkpoints, and dead-letter/manual-review outcomes. | Minting, redemption, deployment, or DB mutation without explicit core result validation. |
| Contract gateway | Submits approved Base Sepolia testnet transactions only when separately authorized. | Mainnet transactions, real assets, unapproved minting, hidden key usage. |

## Runner Requirements

Any future durable runner must:

- fail closed when environment validation fails
- require `ORMB_ENV_MODE=testnet-script` or another explicitly approved testnet mode for state-changing chain actions
- remain disabled in `hosted-demo` mode unless read-only
- process bounded block ranges only
- persist scanned-range checkpoints, not only matching event blocks
- use deterministic idempotency keys
- classify errors with `listener-error-taxonomy.ts`
- record safe audit logs for state changes
- redact secrets and private data from logs
- stop automatic progression on manual-review classifications
- expose worker status fields without secrets

## Persistence Adapter Requirements

Prisma-backed adapters must enforce:

- unique deposit identity: `(chainId, txHash, logIndex)`
- unique burn event identity where applicable
- one mint request per deposit
- no mint submission before manual approval
- no redemption burn verification before manual approval
- no simulated payout before burn verification
- audit records for accepted lifecycle transitions
- no assignment of unknown-wallet deposits to a company

Adapters must not treat database write success as proof of real reserves, custody, or legal entitlement.

## Chain Adapter Requirements

Future chain adapters may read Base Sepolia testnet data only.

They must:

- reject mainnet chain IDs
- require explicit token and treasury addresses
- record observed block hashes when available
- enforce bounded `fromBlock` and `toBlock`
- support dry-run before apply
- return logs in a normalized shape consumed by the core worker
- avoid private-key usage for read-only log scans

They must not:

- read or write mainnet
- use real USDT
- infer legal company ownership from a wallet address
- create mint requests directly
- write deposits without the persistence adapter and core result checks

## Retry And Dead-Letter Model

Future runners should treat errors as:

- `retryable`: transient dependency or network failures; retry with capped backoff.
- `terminal`: invalid input or configuration; stop and require configuration change.
- `manual_review`: reorg, block-hash mismatch, unknown wallet, duplicate conflict, or unexpected state transition; stop automatic progression.

Manual-review outcomes should create operator-facing context without triggering minting or redemption.

## Hosted Demo Behavior

When `ORMB_ENV_MODE=hosted-demo`:

- durable worker runners must not start
- chain adapters must not poll RPC
- persistence adapters must not write lifecycle state
- contract gateways must not execute
- dry-run tools may be used only with local/fixture data outside the hosted request path

Hosted demo pages may display static or seeded summaries only.

## Observability Fields

Future runners should persist or emit:

- worker name
- run ID
- environment mode
- block range scanned, if applicable
- latest indexed/scanned block
- latest success timestamp
- consecutive failure count
- last error code and severity
- manual-review reason
- idempotency key or event key

They must not emit secrets, private keys, RPC credentials, database URLs, production credentials, real customer data, or real transaction instructions.

## Apply-Mode Approval Gate

Any branch that adds apply-mode backfill, live RPC polling, Prisma persistence adapters, queues, or contract submission must include:

- focused branch and PR
- updated docs
- deterministic tests
- idempotency tests
- failure-path tests
- secret/environment validation
- agent report
- GitHub CI pass
- explicit human owner approval before external use

## Non-Goals

- No worker runner is implemented here.
- No live RPC adapter is implemented here.
- No Prisma persistence adapter is implemented here.
- No queue or scheduler is implemented here.
- No contract gateway change is implemented here.
- No hosted mutation behavior is approved.
- No production or real-funds workflow is approved.

## Follow-Up Branches

- `agent/302-database-migration-runbook`: document schema migration and rollback safety.
- `agent/303-audit-retention-docs`: document audit retention/export assumptions.
- `agent/270-admin-risk-review-ui`: improve admin operator context.
- `audit/274-browser-enterprise-readiness-review`: verify enterprise UI changes.
