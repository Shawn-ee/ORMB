# Chain Listener Reliability Review

## Scope

This audit reviews the ORMB mock USDT deposit listener, confirmation worker, backfill helpers, and worker observability helpers after the Enterprise Pilot Readiness v1 reliability hardening branches. ORMB remains testnet-only, mock-asset-only, no-real-funds, no-mainnet, and non-production.

Reviewed areas:

- `workers/deposit-listener.ts`
- `workers/confirmation-worker.ts`
- `workers/listener-backfill.ts`
- `workers/worker-status.ts`
- `docs/DEPOSIT_LISTENER.md`
- `docs/CONFIRMATION_WORKER.md`
- `docs/CHAIN_REORG_AND_BACKFILL.md`
- `docs/LISTENER_RETRY_AND_BACKFILL.md`
- `docs/WORKER_OBSERVABILITY.md`

## Executive Verdict

The chain listener foundation is suitable for a local technical demo and a Stripe/Bridge-style portfolio demo. It is not yet sufficient for limited enterprise pilot preparation because block-hash persistence, checkpoint semantics, dry-run backfill tooling, and operational incident workflow are still incomplete.

Readiness:

- Local technical demo: ready
- Stripe/Bridge portfolio demo: ready
- Public hosted demo: conditionally ready if kept read-only/static or backed by seeded mock data only
- Limited enterprise pilot preparation: not ready
- Production stablecoin infrastructure: not ready

## Strengths

- Deposit event identity uses `(chainId, txHash, logIndex)`.
- Unknown source wallets are rejected and not assigned to a company.
- Confirmation processing is idempotent for unchanged records.
- Optional block-hash comparison can stop confirmation advancement when a reorg is detected.
- Backfill planning is bounded and deterministic.
- Retry delay calculation is deterministic and capped.
- Worker status summaries are pure and do not read secrets, RPC endpoints, or databases.
- Documentation consistently preserves testnet/mock-only boundaries.

## Findings

### High: Block Hash Is Not Persisted In The Schema

Status: addressed by `agent/234-deposit-blockhash-schema`.

Original finding: the confirmation worker could compare a stored deposit block hash with the current canonical hash, but the Prisma deposit schema did not persist a deposit block hash. `agent/234-deposit-blockhash-schema` added optional `Deposit.blockHash` persistence and listener preservation so future adapters can store observed block hashes.

Remaining impact: a future live listener can still confirm deposits using block numbers only if its adapter does not populate `blockHash`. Live adapters must supply the observed block hash before relying on the reorg guard.

Recommended branch: `agent/234-deposit-blockhash-schema`

Acceptance criteria:

- Add block hash fields where needed for deposit records and listener checkpoints.
- Add Prisma validation and migration-safe docs.
- Update listener tests to preserve block hash data.
- Keep all behavior testnet/mock-only.

### High: No Dry-Run Backfill Command Exists

Status: addressed for file-backed demo dry runs by `agent/235-dry-run-backfill-command`.

The repo now has bounded backfill planning helpers but no operator command that performs a dry-run backfill over supplied logs or RPC reads.

Remaining impact: an operator can rehearse recovery from supplied log fixtures, but there is still no live RPC-backed adapter. Live adapters must remain dry-run/read-only unless separately reviewed.

Recommended branch: `agent/235-dry-run-backfill-command`

Acceptance criteria:

- Add a dry-run-only command that accepts explicit chain ID, block range, token, and treasury inputs.
- Require bounded ranges through `createBackfillPlan`.
- Produce a reconciliation summary without writing mints or contracts.
- Do not require real secrets in CI.

### High: Live Checkpoint Semantics Are Not Fully Defined

The listener core updates `SystemJobState` with the latest matching processed log block. A future live runner must checkpoint the finalized scanned block range, not only the latest accepted or matching log.

Impact: a live runner could skip ranges with no matching logs if checkpointing is implemented incorrectly around the current core helper.

Recommended branch: `agent/236-listener-checkpoint-model`

Acceptance criteria:

- Document checkpoint semantics for scanned range, finalized range, and matching event range.
- Add deterministic tests for no-log ranges and ignored-log ranges.
- Keep the current core helper pure and avoid live RPC requirements.

### Medium: Duplicate And Ignored Events Are Counted But Not Audited

Status: addressed by `agent/237-listener-duplicate-ignored-audit-policy`.

The listener result counts duplicates and ignored logs, but the current core only writes audit logs for detected and unknown-wallet rejected deposits.

Remaining impact: duplicate and ignored audit logs are opt-in through verbose audit policy to avoid noisy routine scans. Future live runners must choose the policy explicitly.

Recommended branch: `agent/237-listener-duplicate-ignored-audit-policy`

Acceptance criteria:

- Add audit events for duplicate and ignored events where useful.
- Avoid noisy logs for routine scans by making audit policy explicit.
- Preserve idempotency.

### Medium: Worker Status Is Not Connected To A Runner

Worker status summaries classify supplied checkpoints only. No runner persists checkpoint data or exposes a status endpoint.

Impact: the monitoring/status page remains a static readiness summary, not live operational observability.

Recommended branch: `agent/262-operator-runbook` or `agent/263-incident-response-runbook`

Acceptance criteria:

- Document how operators interpret stale, degraded, and failed worker states.
- Keep hosted-demo mode read-only unless the owner approves live services.

### Medium: RPC Error Taxonomy Is Not Defined

Status: addressed by `agent/238-listener-error-taxonomy`.

Retry helpers provide timing decisions, but the repo does not yet classify retryable versus non-retryable RPC, database, or validation errors.

Remaining impact: the taxonomy is deterministic and tested, but no live runner consumes it yet.

Recommended branch: `agent/238-listener-error-taxonomy`

Acceptance criteria:

- Add deterministic classification for retryable, terminal, and manual-review errors.
- Ensure validation/security failures do not silently retry into state changes.

## Safety Review

No reviewed code:

- deploys contracts
- connects to mainnet
- uses real USDT, RMB/CNH, or customer funds
- requires secrets in CI
- claims legal compliance or production readiness
- creates mint requests from unknown-wallet deposits

## Enterprise Pilot Readiness Impact

The recent listener hardening branches materially improved demo reliability. They do not yet satisfy Enterprise Pilot Readiness v1 because the system still lacks persisted block-hash data, dry-run backfill tooling, checkpoint semantics, incident response, and pilot operator procedures.

## Next Recommended Branch

`agent/234-deposit-blockhash-schema`
