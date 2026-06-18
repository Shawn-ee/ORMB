# 0003: Token Design

## Status

Accepted

## Context

The ORMB demo needs a token model that supports controlled issuance and redemption without creating a public retail asset.

## Decision

ORMB will be designed as a permissioned demo token for whitelisted enterprise settlement on Base Sepolia. Minting and burning will be controlled by roles and operational approval flows.

The token will not represent a live RMB claim, real-world redemption right, or production financial product.

## Consequences

- Future contracts must use explicit role controls.
- Future docs must distinguish demo accounting from real-world funds.
- Mint and burn actions must be auditable.
- Transfers should be designed around whitelisted enterprise demo participants.
