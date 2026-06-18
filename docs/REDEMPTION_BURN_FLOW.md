# Redemption Burn Flow

## Purpose

The redemption burn flow models a company-requested ORMB redemption in the testnet demo by requiring manual approval, verifying a burn event, and recording a simulated payout completion.

## Current Implementation

The current implementation is a deterministic worker core. It does not connect to a live database, scan live chain logs, perform real payouts, or move real funds.

The flow:

1. Validates that the company KYB is approved and the company is active.
2. Validates that the company wallet is active, whitelisted, and belongs to the company.
3. Creates a `REQUESTED` redemption record or a safe `REJECTED` record with an audit log.
4. Requires manual admin approval before burn verification.
5. Moves approved requests to `BURN_PENDING`.
6. Verifies a supplied burn event by chain, source wallet, amount, and unique burn event key.
7. Skips duplicate burn events without processing them twice.
8. Records burn verification failures safely.
9. Simulates payout only after burn verification.
10. Completes the redemption after simulated payout recording.

## Safety Boundary

This flow does not provide real redemption, payout, RMB settlement, customer withdrawal, custody, or production payment behavior. Burn verification is supplied to a testable worker interface and must remain testnet-only when wired to chain listeners.
