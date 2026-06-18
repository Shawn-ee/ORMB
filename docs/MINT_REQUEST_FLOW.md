# Mint Request Flow

## Purpose

The mint request flow converts a risk-approved, confirmed MockUSDT deposit into a manual-approval ORMB mint request for the testnet demo.

## Current Implementation

The current implementation is a deterministic worker core. It does not connect to a live database or call a real contract in CI.

The flow:

1. Rejects duplicate mint request creation for the same deposit.
2. Runs mint eligibility risk checks.
3. Creates a fixed-rate FX quote.
4. Calculates ORMB amount from MockUSDT amount and fixed FX rate.
5. Creates a `PENDING_APPROVAL` mint request.
6. Requires manual admin approval before mint submission.
7. Uses a contract gateway interface to submit an approved mint.
8. Records submitted mint transaction hashes.
9. Skips duplicate mint submissions.
10. Records mint failures safely.

## Safety Boundary

This flow does not handle real customer funds, real USDT, real RMB, real redemption rights, or production settlement. Contract mint submission is abstracted behind a testable gateway interface and must use testnet-only configuration when wired to real scripts.
