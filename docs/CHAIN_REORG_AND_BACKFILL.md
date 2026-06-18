# Chain Reorg and Backfill Model

## Scope

This document defines the ORMB demo chain-listener reliability model for Base Sepolia. ORMB remains a testnet-only, mock-asset-only portfolio demo. It must not be used for real USDT, real RMB/CNH, real customer funds, production payments, or mainnet deployment.

## Current Reliability Position

ORMB has a deterministic confirmation worker that advances mock deposits from `DETECTED` or `CONFIRMING` to `CONFIRMED` after a configured confirmation threshold. The worker now supports an optional block-hash check before changing confirmation state.

If a deposit stores the original block hash and the caller supplies a `getBlockHash` function, the worker compares the stored block hash against the current canonical block hash for that block number. If the hashes differ, the worker:

- does not update the deposit state
- does not mark the deposit confirmed
- writes a `deposit.reorg_detected` audit event
- returns the deposit in the `reorgDetected` result count

When no stored block hash or hash lookup is available, the worker preserves the existing block-number-only demo behavior.

## Required Deposit Record Data

A reorg-aware listener should persist:

- `chainId`
- transaction hash
- log index
- deposit block number
- deposit block hash
- observed token address
- source wallet
- company wallet mapping at detection time
- amount and token decimals

The database schema currently tracks the core event identity and block number. Full block-hash persistence remains a follow-up schema migration before hosted pilot preparation.

## Confirmation Policy

For demo mode:

- use Base Sepolia only
- use a positive confirmation threshold
- never advance unknown-wallet deposits into mint eligibility
- never advance deposits whose stored block hash conflicts with the current canonical block hash
- treat reorg events as manual-review items

For future enterprise pilot preparation:

- store block hash on every detected deposit
- store the latest indexed block hash in listener checkpoints
- keep the finality threshold configurable per chain
- require manual review after any detected reorg near a deposit event
- reconcile deposits after backfill before mint request creation

## Backfill Model

The safe backfill model is:

1. Start from a known finalized block checkpoint.
2. Re-read logs over a bounded block range.
3. Use `(chainId, txHash, logIndex)` as the idempotency key.
4. Compare stored block number and block hash for existing events.
5. Create audit logs for new, duplicate, and reorged events.
6. Do not create mint requests during backfill until reconciliation passes.

No automatic backfill command is introduced in this branch. A future branch should add a bounded dry-run backfill command before any hosted demo.

## Known Limitations

- This branch does not add a Prisma block-hash column.
- This branch does not implement a live RPC-backed backfill command.
- This branch does not modify mint request creation.
- This branch does not call contracts or deploy anything.
- This branch does not prove reserve sufficiency for real assets.

## Follow-Up Branches

- `agent/231-listener-retry-and-backfill`: add bounded dry-run backfill tooling and retry policy.
- `agent/232-worker-observability`: add worker status output and operational metrics for demo runs.
- `audit/233-chain-listener-review`: audit listener idempotency, reorg handling, and backfill assumptions.
