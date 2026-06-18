# 0001: Project Scope

## Status

Accepted

## Context

ORMB needs to demonstrate stablecoin payment infrastructure patterns while avoiding production financial claims and real money handling.

## Decision

ORMB will be built as a testnet-first, whitelisted enterprise settlement demo. It will model onboarding, mock deposit detection, confirmation handling, fixed FX conversion, mint approval, ORMB minting, transfer, redemption, burn verification, audit logs, and dashboards.

The MVP will not handle real customer funds, real USDT, real RMB, retail trading, or mainnet deployments.

## Consequences

- Documentation must consistently present ORMB as a technical demo.
- All implementation must preserve testnet and mock-data boundaries.
- Future work must include validation reports and security notes.
