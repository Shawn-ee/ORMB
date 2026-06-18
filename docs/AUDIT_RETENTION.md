# Audit Retention And Export

## Purpose

This document defines ORMB audit log retention and export assumptions for Enterprise Pilot Readiness v1. It is documentation only; no export job, storage service, retention scheduler, or tamper-resistant log system is implemented here.

ORMB remains testnet-only, mock-asset-only, no-real-funds, no-mainnet, and non-production.

## Current Audit Model

The Prisma schema includes `AuditLog` records for lifecycle activity. Worker cores create audit records through repository interfaces for deposit detection, confirmation changes, risk failures, mint request lifecycle events, redemption events, and related review actions.

Current audit logging is suitable for deterministic local/testnet demo review. It is not a production audit, compliance, legal, custody, reserve, or financial-record system.

## Audit Record Content

Audit records may include:

- event action
- actor type and actor ID
- entity type and entity ID
- company ID when applicable
- previous state
- next state
- idempotency key or event key
- safe reason code
- safe operator note
- timestamp
- synthetic/demo metadata

Audit records must not include:

- private keys
- seed phrases
- RPC secrets
- API keys
- database URLs
- production credentials
- real customer data
- real KYB/KYC documents
- bank details
- real payment instructions
- real wallet ownership claims
- real transaction instructions for value

## Retention Assumption

For local/testnet demo use:

- Audit records may be retained as long as needed for demo review.
- Demo data may be reset or reseeded.
- Retention does not create legal recordkeeping, compliance, custody, or customer-notice obligations.

For any future hosted demo:

- Retention must be explicitly documented before external sharing.
- Audit data must remain synthetic or demo-generated.
- Hosted demo data should have a clear reset process.
- No real customer or regulated data may be stored.

For any future real pilot:

- This document is insufficient.
- Legal, compliance, security, privacy, and data-governance review would be required before handling real records.

## Export Assumption

Future export tools must:

- require an explicit operator action
- support filtered exports by date, entity, company, and action
- include generated timestamp and export actor
- redact secrets and prohibited data
- produce deterministic file formats such as JSON or CSV
- label exports as testnet/demo-only

Exports must not be treated as legal statements, reserve attestations, compliance evidence, or financial records.

## Tamper-Resistance Assumption

Current demo audit logs are database records, not tamper-resistant infrastructure.

Production-like tamper resistance would require separate design, such as:

- append-only storage controls
- restricted write permissions
- immutable object storage
- signed log batches
- independent log sink
- retention lock
- monitoring and alerting

None of those controls are implemented today.

## Deletion And Reset

For local demo data:

- reset/reseed is allowed for synthetic data
- deleted demo data should not be represented as a production-grade retention process
- agent reports should preserve validation and branch history, but not secret values

For hosted demo data:

- reset behavior must be documented before sharing
- no real customer data may be accepted
- deletion requests for real data should not occur because real data is prohibited

## Operator Review

Operators reviewing audit data should confirm:

- the event is synthetic/testnet-only
- the action matches an expected lifecycle transition
- idempotency keys are present for duplicate-sensitive events
- failed risk checks and unknown-wallet events did not progress to minting
- manual approvals are visible where required
- no secret or real customer data appears in metadata

## Incident Conditions

Stop and escalate if:

- an audit record contains a private key, seed phrase, RPC secret, production credential, or real customer data
- audit logs suggest real funds or mainnet activity
- audit records are missing for a privileged lifecycle state change
- duplicate mint, burn, deposit, or payout records appear without safe idempotency handling
- exports are requested for legal, compliance, custody, reserve, or production financial purposes

## Non-Goals

- No export endpoint is implemented here.
- No retention scheduler is implemented here.
- No tamper-resistant log sink is implemented here.
- No production recordkeeping policy is approved here.
- No privacy, legal, compliance, custody, or reserve attestation system is created here.

## Follow-Up Branches

- `agent/270-admin-risk-review-ui`: show audit and reconciliation concepts more clearly in admin UI.
- `audit/274-browser-enterprise-readiness-review`: verify enterprise UI and copy after UI changes.
- `agent/290-stripe-bridge-readme-polish`: package the portfolio explanation after readiness docs are complete.
