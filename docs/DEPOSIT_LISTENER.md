# Deposit Listener

## Purpose

The MockUSDT deposit listener processes Base Sepolia ERC-20 `Transfer` logs for the ORMB demo treasury address.

## Current Implementation

The current branch adds the testable listener core. It does not start a live polling worker and does not connect to a real RPC endpoint in CI.

The listener core:

- Filters logs by chain ID, MockUSDT token address, and treasury recipient address.
- Matches the source address to an active `CompanyWallet`.
- Saves known-wallet deposits with `DETECTED` status.
- Saves unknown-wallet deposits with `REJECTED` status and no company assignment.
- Preserves the observed deposit block hash when supplied by the caller.
- Ignores transfers to the wrong treasury.
- Avoids duplicate deposits using `chainId + txHash + logIndex`.
- Writes audit log entries for detected and rejected deposits.
- Supports `auditPolicy: "verbose"` for duplicate and ignored event audit logs during backfill or incident review.
- Updates `SystemJobState` with the latest matching event block, or with an explicit finalized scanned block when `scannedToBlock` is supplied by a future runner.

## Safety Boundary

Unknown wallet deposits must never create mint requests. They are recorded for review and audit only.

The listener is for MockUSDT testnet/demo activity only. It must not process real USDT, real RMB, customer funds, or mainnet deposits.

## Duplicate And Ignored Event Audit Policy

The default listener audit policy is `state_changes_only`. This avoids noisy audit logs during routine scans and records only deposits that are detected or rejected.

For backfills and incident investigations, future runners can pass `auditPolicy: "verbose"` to also write:

- `deposit.duplicate_skipped` for events that already have a stored deposit key.
- `deposit.ignored` for logs outside the configured chain, token, or treasury filter.

Verbose audit mode still does not create mint requests, confirm deposits, call contracts, or process real funds.

Current unit coverage confirms:

- Duplicate events are counted and skipped without a second deposit; verbose mode adds `deposit.duplicate_skipped`.
- Ignored events outside the configured chain, token, or treasury filter are counted without deposits; verbose mode adds `deposit.ignored`.
- Unknown-wallet treasury deposits are stored as `REJECTED`, audited as `deposit.rejected.unknown_wallet`, and left unassigned to a company.
- `scannedToBlock` advances the checkpoint for no-log and all-ignored ranges so future runners can checkpoint the finalized scanned range rather than only matching deposits.
