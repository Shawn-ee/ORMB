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

Every transition requires an operator actor ID and produces audit metadata with previous status, next status, actor, optional note, and timestamp. Operators should use the note for demo evidence, such as "fixture reviewed" or "reopened during release review." Notes must not claim real KYB/KYC/AML/sanctions clearance, legal approval, custody, settlement finality, or production readiness.

Invalid transitions fail closed:

- `ACKNOWLEDGED` cannot be acknowledged again.
- `RESOLVED` cannot be acknowledged.
- `RESOLVED` cannot be resolved again.
- Missing or blank actor IDs are rejected.

Reopening a case returns it to `OPEN`; it must be reviewed again before the demo can treat the case as closed.

## Summary

The summary helper counts risk cases by status and severity and flags whether operator review is required. High-severity unresolved cases always require operator review. In the current helper, `highOpenCount` counts high-severity cases whose status is not `RESOLVED`; this includes both `OPEN` and `ACKNOWLEDGED` cases.

Any high-severity `OPEN` or `ACKNOWLEDGED` case is a documented stop condition for demo mint progression. This stop is an operator-review gate only. It does not approve or deny real customers, real wallets, real assets, KYB, KYC, sanctions, AML, legal compliance, or production payments.

Lower-severity `OPEN` cases also require operator review before the demo treats the risk queue as clear. Acknowledged lower-severity cases are already under operator review and should remain documented until resolved or reopened.

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

## Operator Runbooks

See `docs/OPERATOR_RUNBOOK.md` for the tabletop review checklist and `docs/INCIDENT_RESPONSE_RUNBOOK.md` for high-severity incident handling. Those runbooks preserve the same local/testnet, mock-asset-only, no-real-funds, no-mainnet, and non-production boundary.

## Follow-Up

- Add admin UI views for risk cases.
- Add persistence wiring for risk case transition audit metadata when a separately scoped branch owns database mutation behavior.
