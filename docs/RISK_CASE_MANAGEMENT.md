# Risk Case Management

## Scope

Risk case management is a demo workflow for reviewing ORMB `RiskEvent` records. It is not a real compliance, KYB, KYC, sanctions, AML, legal, or financial-crime monitoring system.

ORMB remains testnet-only, mock-asset-only, no-real-funds, no-mainnet, and non-production.

## Status Model

Risk events use the existing Prisma `RiskEventStatus` values:

- `OPEN`: the event needs operator review.
- `ACKNOWLEDGED`: an operator has reviewed the event and is investigating or waiting for supporting context.
- `RESOLVED`: the event has been closed for demo purposes.

## Transitions

`workers/risk-case-management.ts` provides deterministic transition helpers:

- `OPEN` can be acknowledged.
- `OPEN` can be resolved.
- `ACKNOWLEDGED` can be resolved.
- `ACKNOWLEDGED` can be reopened.
- `RESOLVED` can be reopened.

Every transition requires an operator actor ID and produces audit metadata with previous status, next status, actor, optional note, and timestamp.

## Summary

The summary helper counts risk cases by status and severity and flags whether operator review is required. High-severity unresolved cases always require operator review.

## Safety Boundary

Risk case transitions do not:

- approve KYB
- whitelist wallets
- create mint requests
- mint ORMB
- redeem ORMB
- call contracts
- move funds
- claim real compliance status

Human, legal, compliance, and security approval would be required before using any real customer, real stablecoin, real RMB/CNH, or mainnet workflow.

## Follow-Up

- Add admin UI views for risk cases.
- Add operator runbook steps for reviewing and resolving demo risk cases.
- Add incident response procedures for high-severity risk events.
