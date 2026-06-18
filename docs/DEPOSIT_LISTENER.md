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
- Ignores transfers to the wrong treasury.
- Avoids duplicate deposits using `chainId + txHash + logIndex`.
- Writes audit log entries for detected and rejected deposits.
- Updates `SystemJobState` with the latest processed block.

## Safety Boundary

Unknown wallet deposits must never create mint requests. They are recorded for review and audit only.

The listener is for MockUSDT testnet/demo activity only. It must not process real USDT, real RMB, customer funds, or mainnet deposits.
