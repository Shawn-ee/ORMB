# Enterprise Readiness Review

## Review Date

2026-06-18

## Scope

Branch: `audit/270-enterprise-readiness-review`

This review reassesses ORMB after the Enterprise Pilot Readiness v1 hardening branches through `agent/263-incident-response-runbook`.

ORMB remains testnet-only, mock-asset-only, no-real-funds, no-mainnet, and non-production. Enterprise Pilot Readiness v1 means the repository could support a limited technical pilot discussion after human, legal, compliance, and security approval. It does not mean production launch, real stablecoin issuance, custody, payment processing, or public RMB/CNH stablecoin availability.

## Current Verdict

Enterprise Pilot Readiness v1: **Not ready; blockers listed below.**

The repo is stronger than `demo-v0` and is suitable as a local technical demo and Stripe/Bridge-style portfolio artifact. It is not yet ready for Enterprise Pilot Readiness v1 because hosted-demo posture, API/worker adapter boundaries, database migration safety, audit retention, UI pilot workflows, and final portfolio packaging are still incomplete.

## Readiness Levels

| Level | Verdict | Rationale |
| --- | --- | --- |
| Local technical demo | Ready | Unit, contract, CI, build, and browser smoke checks pass; static routes and deterministic worker cores are documented. |
| Stripe/Bridge portfolio demo | Ready | The repo demonstrates contract controls, mint/burn lifecycle modeling, idempotent event processing, ledger invariants, risk checks, and disciplined documentation. |
| Public hosted demo | Conditionally ready | Static pages can be hosted only in a read-only mode with clear disclaimers and human acceptance of documented dependency findings. |
| Limited enterprise pilot preparation | Not ready | The technical foundation is improving, but API boundaries, durable runner assumptions, hosted-demo posture, database migration safety, audit retention, and pilot UX still need focused branches. |
| Production stablecoin infrastructure | Not ready | No production authorization, real compliance program, custody/reserve model, real rails, mainnet approval, or production operations stack exists. |

## Completed Enterprise Hardening Since Audit 200

- Ledger invariant tests and docs were added.
- Dependency audit was rechecked; findings remain accepted only for local/testnet demo review.
- Secret management and environment-mode validation were added.
- Contract threat model and mint role runbook were added.
- Listener reorg, retry, checkpoint, dry-run backfill, duplicate/ignored audit policy, and error taxonomy work was completed.
- Worker observability helpers were added.
- Risk case management was added.
- Enterprise pilot playbook, operator runbook, and incident response runbook were added.

## Current Criteria Status

| Criterion | Status | Notes |
| --- | --- | --- |
| Repo clearly remains testnet/mock-only. | Pass | App and docs maintain no-real-funds, no-mainnet boundaries. |
| Core demo flows still pass. | Pass | `npm run test:ci` passes locally on this branch. |
| Browser/e2e checks pass. | Pass | `npm run test:e2e` passes locally on this branch. |
| Security review is updated. | Pass | Security docs now link threat model, mint role runbook, incident response, and demo verification. |
| Dependency audit is remediated or accepted for demo-only use. | Partial | Known findings remain accepted only for local/testnet demo review; not acceptable for production or real funds. |
| Ledger/reconciliation invariants are documented and tested. | Pass | Deterministic ledger invariant tests exist. |
| Mint and redemption flows have idempotency tests. | Pass | Duplicate mint and burn paths are covered. |
| Unknown wallet and failed risk paths are safe. | Pass | Unknown-wallet deposits do not mint; risk failures block mint request creation. |
| Admin UI explains risk/review/reconciliation concepts. | Partial | Static dashboard exists, but risk-case/reconciliation workflows need stronger enterprise-review presentation. |
| Company UI explains the pilot flow clearly. | Partial | Static company dashboard exists, but pilot participant guidance can be clearer. |
| Enterprise pilot playbook exists. | Pass | `docs/ENTERPRISE_PILOT_PLAYBOOK.md`. |
| Operator runbook exists. | Pass | `docs/OPERATOR_RUNBOOK.md`. |
| Incident response runbook exists. | Pass | `docs/INCIDENT_RESPONSE_RUNBOOK.md`. |
| Legal/compliance boundary says no real funds or public issuance. | Pass | Legal boundaries and app disclaimers remain explicit. |
| Hosted demo readiness is documented. | Fail | A hosted-demo readiness review is still needed. |
| Stripe/Bridge portfolio package is ready. | Partial | Core alignment exists; final recruiter/walkthrough packaging remains open. |
| `main` remains untouched unless owner approves. | Pass | Work continues through `dev` and focused branches. |

## Remaining Blockers

### High: Hosted Demo Readiness Requires Human Acceptance

A safe hosted demo now has a read-only posture and checklist in `docs/HOSTED_DEMO_READINESS.md`, but the human owner still must accept the exact URL, audience, duration, and dependency posture before external sharing.

Recommended branch: `audit/280-hosted-demo-readiness`

### High: Durable Worker Implementation Is Not Present

The repo intentionally has no live mutation handlers, RPC polling loops, or persistent worker runners. API contract boundaries are documented in `docs/API_CONTRACTS.md`, and future worker adapter boundaries are documented in `docs/WORKER_ADAPTER_BOUNDARIES.md`. Durable worker implementation remains deferred and is not required for the current read-only hosted-demo posture.

Recommended branches:

- future `agent/304-worker-runner-prototype`, only if explicitly scoped as testnet/mock-only

### High: Database Migration Pipeline Is Not Implemented

Prisma schema validation passes, and migration safety expectations are documented in `docs/DATABASE_MIGRATION_RUNBOOK.md`. The repo still has no migration deployment pipeline, live database, backup/restore automation, or production database approval.

Recommended branch: `agent/302-database-migration-runbook`

### Medium: Audit Retention And Export Strategy Is Documented But Not Implemented

Audit retention, export, deletion, and tamper-resistance assumptions are documented in `docs/AUDIT_RETENTION.md`. No export endpoint, retention scheduler, immutable log sink, or production recordkeeping policy is implemented.

Recommended branch: `agent/303-audit-retention-docs`

### Medium: Admin And Company Pilot UX Need More Enterprise Review Context

Static pages are readable and safe, but they do not yet show enough risk-case, reconciliation, operator escalation, and pilot participant context for Enterprise Pilot Readiness v1.

Recommended branches:

- `agent/270-admin-risk-review-ui`
- `agent/272-company-pilot-flow-ui`
- `audit/274-browser-enterprise-readiness-review`

### Medium: Dependency Findings Remain Open For Anything Beyond Local/Testnet Demo

The dependency audit remains acceptable only for local/testnet demo review. It must be rechecked before hosted-demo or enterprise-readiness approval.

Recommended branch: include re-check in `audit/280-hosted-demo-readiness`.

### Low: Portfolio Packaging Is Not Final

Stripe/Bridge alignment exists, but architecture diagram docs, recruiter walkthrough, and final portfolio package remain incomplete.

Recommended branches:

- `agent/290-stripe-bridge-readme-polish`
- `agent/291-architecture-diagram-docs`
- `release/enterprise-pilot-readiness-v1`

## Next Branch Decision

Proceed next with `audit/280-hosted-demo-readiness`.

Rationale: hosted-demo readiness is the highest unblock value after runbooks because it forces a clear decision on read-only mode, dependency acceptance, environment posture, browser validation, and what must remain prohibited before any enterprise-facing demo discussion.

## Safety Confirmation

This audit branch does not:

- deploy contracts
- connect to mainnet
- use real USDT, RMB/CNH, or customer funds
- add secrets
- change mint, burn, listener, risk, UI, API, or database behavior
- claim legal compliance or production readiness
