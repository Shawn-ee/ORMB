# Risk Engine

## Purpose

The risk engine determines whether a confirmed MockUSDT deposit is eligible to create an ORMB mint request.

## Current Implementation

The current implementation is deterministic and unit-testable. It does not create mint requests, call contracts, or move funds.

Risk checks require:

- Company KYB status is `APPROVED`.
- Company is active.
- Source wallet is known, active, and associated with the company.
- Receiving wallet is active, whitelisted, and associated with the company.
- Deposit status is `CONFIRMED`.
- Deposit does not already have a mint request.
- Deposit does not already have a mint record.
- Deposit amount is not above `AUTO_MINT_LIMIT_USDT` when configured.
- Projected company daily mint volume is not above `DAILY_MINT_LIMIT_USDT` when configured.

Failed checks are recorded through RiskEvent and AuditLog repository hooks.

Risk events can be reviewed through the deterministic demo case-management helpers documented in `docs/RISK_CASE_MANAGEMENT.md`.

## Safety Boundary

Unknown-wallet deposits must never mint. Failed risk checks do not create mint requests. The risk engine is part of a testnet-only demo and must not be used for real funds, real USDT, real RMB, or production approvals.
