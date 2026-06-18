# Confirmation Worker

## Purpose

The confirmation worker advances detected MockUSDT deposits through confirmation states before any mint request can be created.

## Current Implementation

The current implementation is a testable worker core. It does not connect to a live RPC endpoint in CI.

The worker core:

- Reads deposits that still need confirmation.
- Calculates confirmations from the current block and deposit block.
- Moves deposits from `DETECTED` to `CONFIRMING` before the threshold.
- Moves deposits to `CONFIRMED` once `REQUIRED_CONFIRMATIONS` is reached.
- Avoids rewriting unchanged records on idempotent reruns.
- Writes audit logs for state changes.

## Safety Boundary

Confirmed status only means the configured testnet confirmation threshold was reached. It is not proof of real-world funds, real USDT, real RMB, or production settlement.
