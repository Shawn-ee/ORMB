# API Contracts

## Purpose

This document defines the intended ORMB API contract surface for future implementation branches. It is documentation only; no API routes are implemented in this branch.

ORMB remains testnet-only, mock-asset-only, no-real-funds, no-mainnet, and non-production. These contracts are for demo architecture review and must not be used for real payment processing, custody, redemption, or public stablecoin issuance.

## API Principles

- Every mutation must be idempotent.
- Every lifecycle transition must validate the current state before changing it.
- Every admin action must create an audit record.
- Unknown-wallet deposits must never create mint requests.
- Minting requires confirmed deposits, passing risk checks, and manual approval.
- Redemption requires manual approval before burn verification and simulated payout completion.
- Hosted-demo mode must be read-only unless a future approved branch adds explicit mutation guards.
- API responses must not expose secrets, private keys, seed phrases, RPC credentials, database URLs, or real customer data.

## Authentication And Authorization Assumptions

Future API branches must define authentication before exposing live endpoints. Until then, these contracts assume abstract roles only:

- `admin_operator`: reviews onboarding, wallet status, risk cases, mint approvals, redemption approvals, reconciliation, and audit logs.
- `company_user`: views company-scoped demo data and submits demo-only requests.
- `system_worker`: records chain listener, confirmation, risk, mint, burn, reconciliation, and worker status events.
- `auditor`: reads audit and reconciliation data without mutation access.

No production authentication, authorization, SSO, RBAC service, or compliance provider integration exists today.

## Idempotency Model

Mutation endpoints must accept an `Idempotency-Key` header or derive a deterministic event key from immutable inputs.

Required idempotency keys:

- Deposit ingestion: `chainId:txHash:logIndex`
- Confirmation update: `depositId:currentBlock:blockHash`
- Mint request creation: `depositId`
- Mint submission: `mintRequestId`
- Redemption request: client-provided request key plus company and wallet
- Burn verification: `chainId:txHash:logIndex`
- Risk case transition: `riskEventId:previousStatus:nextStatus:operatorId:timestamp`

Repeated requests with the same key must return the existing result or a safe duplicate response without creating duplicate deposits, mint requests, mints, burns, payouts, or audit records.

## Response Envelope

Future endpoints should use a consistent envelope:

```json
{
  "ok": true,
  "data": {},
  "requestId": "demo-request-id",
  "idempotencyKey": "demo-idempotency-key"
}
```

Errors should use:

```json
{
  "ok": false,
  "error": {
    "code": "DEMO_ERROR_CODE",
    "message": "Safe operator-facing message",
    "retryable": false
  },
  "requestId": "demo-request-id",
  "idempotencyKey": "demo-idempotency-key"
}
```

Error messages must be safe for logs and must not include secrets or private data.

## Proposed Read Endpoints

| Method | Path | Role | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/demo/health` | public/read-only | Return demo mode, commit, and static readiness summary. |
| `GET` | `/api/admin/companies` | `admin_operator` | List demo companies and onboarding state. |
| `GET` | `/api/admin/wallets` | `admin_operator` | List company wallets and whitelist state. |
| `GET` | `/api/admin/deposits` | `admin_operator` | List mock deposit records and confirmation state. |
| `GET` | `/api/admin/mint-requests` | `admin_operator` | List mint requests and approval/submission state. |
| `GET` | `/api/admin/redemptions` | `admin_operator` | List redemption requests and burn verification state. |
| `GET` | `/api/admin/risk-events` | `admin_operator` | List risk events and case status. |
| `GET` | `/api/admin/reconciliation` | `admin_operator` or `auditor` | Return ledger invariant and supply reconciliation summary. |
| `GET` | `/api/admin/audit-logs` | `admin_operator` or `auditor` | Query audit activity with filters. |
| `GET` | `/api/company/:companyId/summary` | `company_user` | Return company-scoped balances, deposits, transfers, and requests. |
| `GET` | `/api/company/:companyId/activity` | `company_user` | Return company-scoped activity only. |
| `GET` | `/api/status/workers` | `admin_operator` | Return worker status summaries from stored checkpoints. |

## Proposed Mutation Endpoints

These endpoints are future-only and must remain disabled in hosted-demo mode unless a separately approved branch implements and validates mutation guards.

| Method | Path | Role | Idempotency | Purpose |
| --- | --- | --- | --- | --- |
| `POST` | `/api/admin/companies` | `admin_operator` | required header | Create a demo company record. |
| `POST` | `/api/admin/wallets` | `admin_operator` | required header | Register or update a demo company wallet. |
| `POST` | `/api/admin/wallets/:walletId/whitelist` | `admin_operator` | required header | Change demo whitelist state. |
| `POST` | `/api/worker/deposits/detected` | `system_worker` | event key | Persist a detected mock deposit. |
| `POST` | `/api/worker/deposits/:depositId/confirmations` | `system_worker` | deterministic key | Advance confirmation state. |
| `POST` | `/api/worker/mint-requests` | `system_worker` | `depositId` | Create a risk-approved mint request. |
| `POST` | `/api/admin/mint-requests/:requestId/approve` | `admin_operator` | required header | Manually approve a mint request. |
| `POST` | `/api/worker/mints/:requestId/submit` | `system_worker` | `mintRequestId` | Record testnet mint submission through a guarded gateway. |
| `POST` | `/api/company/:companyId/redemptions` | `company_user` | required header | Create a demo redemption request. |
| `POST` | `/api/admin/redemptions/:requestId/approve` | `admin_operator` | required header | Manually approve redemption for burn verification. |
| `POST` | `/api/worker/redemptions/:requestId/burns` | `system_worker` | burn event key | Verify a supplied testnet burn event. |
| `POST` | `/api/worker/redemptions/:requestId/payout-simulated` | `system_worker` | `redemptionId` | Mark simulated payout completion only. |
| `POST` | `/api/admin/risk-events/:riskEventId/transition` | `admin_operator` | required header | Acknowledge, resolve, or reopen a demo risk case. |

## State Transition Rules

Future APIs must enforce existing worker-core state transitions rather than duplicating logic in route handlers.

Required guards:

- Deposits must move only through valid detection and confirmation states.
- A deposit can have at most one mint request.
- A mint request can be submitted only after manual approval.
- A mint submission cannot happen twice for the same request.
- Redemption requests require approved company and whitelisted wallet checks.
- Burn verification must match chain, wallet, amount, and event key.
- Simulated payout can complete only after burn verification.
- Risk case transitions must follow `docs/RISK_CASE_MANAGEMENT.md`.

## Hosted Demo Behavior

When `ORMB_ENV_MODE=hosted-demo`, APIs must fail closed:

- Read endpoints may return static or seeded demo data.
- Mutation endpoints must return a safe disabled response.
- Worker endpoints must not run.
- Contract gateway endpoints must not run.
- Testnet script endpoints must not exist.

Recommended disabled response:

```json
{
  "ok": false,
  "error": {
    "code": "HOSTED_DEMO_READ_ONLY",
    "message": "This hosted demo is read-only and does not execute lifecycle mutations.",
    "retryable": false
  }
}
```

## Audit Requirements

Every accepted mutation must record:

- actor role and actor ID
- entity type and entity ID
- previous state
- next state
- idempotency key
- request ID
- timestamp
- safe reason or note

Audit records must not contain private keys, seed phrases, RPC secrets, database URLs, production credentials, real customer data, or real transaction instructions.

Retention and export assumptions for audit records are documented in `docs/AUDIT_RETENTION.md`.

## Non-Goals

- No API route implementation is added here.
- No authentication provider is selected.
- No production authorization model is claimed.
- No hosted mutation mode is approved.
- No real payment, custody, redemption, settlement, or compliance API is defined.
- No mainnet API path is permitted.

## Follow-Up Branches

- `agent/301-worker-adapter-boundary-docs`: define durable worker and persistence adapter boundaries.
- `agent/302-database-migration-runbook`: document migration safety.
- `agent/303-audit-retention-docs`: define audit retention/export assumptions.
- `agent/270-admin-risk-review-ui`: show API/risk/reconciliation concepts in admin UI.
