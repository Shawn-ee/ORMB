# Worker Observability Model

## Scope

This document defines the ORMB demo worker observability model for Enterprise Pilot Readiness v1. ORMB remains a testnet-only, mock-asset-only demo and must not process real USDT, real RMB/CNH, real customer funds, production payments, or mainnet activity.

## Status Summary Helper

`workers/worker-status.ts` provides deterministic helpers for summarizing supplied worker checkpoints:

- `summarizeWorkerStatus`
- `summarizeWorkerFleet`

The helpers do not read from a database, call RPC endpoints, poll services, expose secrets, or send alerts. They classify supplied snapshots only.

## Status Levels

- `healthy`: latest success is within the configured freshness window and there are no retry threshold issues.
- `stale`: no success has been recorded or the latest success is older than the configured freshness window.
- `degraded`: consecutive failures reached the configured degraded threshold.
- `failed`: consecutive failures reached the configured failed threshold.

Failure thresholds take priority over freshness because repeated failures need operator attention even if the latest success is recent.

## Expected Checkpoint Fields

Future worker runners should report:

- worker name
- last run time
- last success time
- latest indexed block, when relevant
- consecutive failure count
- last error summary, without secrets

Error summaries must never include private keys, RPC secrets, seed phrases, database URLs, customer data, or real transaction instructions.

## Operator Use

For local/testnet demos, an operator can use the fleet summary to decide whether to:

- re-run a failed worker
- inspect recent audit logs
- perform a dry-run backfill
- pause demo mint operations for manual review
- document the incident in the agent report or incident runbook

## Known Limitations

- No live worker process is started.
- No metrics endpoint is added.
- No alerting integration is added.
- No database schema migration is added.
- No hosted monitoring deployment is added.

## Follow-Up Branches

- `audit/233-chain-listener-review`: review the deposit listener reliability assumptions after reorg, retry, and observability hardening.
- `agent/263-incident-response-runbook`: document operator response for stale, degraded, or failed worker states.
