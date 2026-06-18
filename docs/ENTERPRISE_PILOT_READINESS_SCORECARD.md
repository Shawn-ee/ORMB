# Enterprise Pilot Readiness Scorecard

## Summary

Current target: Enterprise Pilot Readiness v1 refresh.

Current verdict: Ready only as a human-review discussion package after human owner, legal, and compliance approval. It is not approved for production, real funds, real USDT, real RMB/CNH, mainnet, custody, payment processing, live mint/burn behavior, or external enterprise pilot use.

The repo is strongest as a local technical demo and Stripe/Bridge-style portfolio demo. A hosted demo remains conditional on static/read-only posture and explicit human approval. Enterprise pilot readiness means a review packet for discussion, not approval to operate. Production readiness is not achieved.

## Readiness Levels

| Level | Status | Notes |
| --- | --- | --- |
| Local demo | Ready for human review | Local/testnet, fixture-backed, mock-only, no real funds. |
| Stripe/Bridge portfolio demo | Ready for human review | Documentation and presentation narrative only. No partnership, integration, payment, custody, or settlement claim. |
| Hosted demo | Conditional | Static/read-only only after owner approval of URL, audience, duration, environment posture, rollback, screenshots, and dependency risk. |
| Enterprise pilot readiness | Discussion package only | Requires owner, legal, and compliance approval before any enterprise pilot discussion. |
| Production readiness | Not ready | Blocked by dependency, architecture, operational, security, compliance, auth, database, worker, API, and legal gaps. |

## Updated Scorecard

| Rank | Gap | Severity | Status | Next Branch |
| --- | --- | --- | --- | --- |
| 1 | Production readiness is not established. | Critical | Blocked and out of scope | Future production program only |
| 2 | Legal/compliance approval is not granted. | Critical | Human gate required | `audit/324-enterprise-pilot-readiness-v1-review` |
| 3 | Dependency audit reports 25 findings, including 8 high and 0 critical. | High | Accepted only for local/testnet and conditional static/read-only hosted review | `audit/324-enterprise-pilot-readiness-v1-review` |
| 4 | Hosted demo requires exact owner-approved static/read-only posture. | High | Conditionally addressed | `audit/320-hosted-demo-readiness-refresh` |
| 5 | API design is specified but not implemented. | High | Documented | `agent/300-api-contract-docs` |
| 6 | Durable worker runner and persistence adapter boundaries are documented but not implemented. | High | Documented | `agent/301-worker-adapter-boundary-docs` |
| 7 | Database migration safety is documented but no production migration pipeline exists. | High | Documented | `agent/302-database-migration-runbook` |
| 8 | No production authn/authz, tenant isolation, or customer data controls exist. | High | Blocked for production | Future scoped branch |
| 9 | No real compliance provider integration exists. | High | Blocked for production and real pilots | Future scoped branch after approval |
| 10 | Audit retention is documented but no immutable export/log sink exists. | Medium | Documented | `agent/303-audit-retention-docs` |
| 11 | Operator and incident drills require human review before external use. | Medium | Addressed for tabletop demo | `agent/318-operator-incident-drills` |
| 12 | Admin/company enterprise UI remains static/read-only. | Medium | Addressed for demo review | `agent/321-admin-company-ui-enterprise-readiness` |
| 13 | Stripe/Bridge-style package must avoid partnership and integration claims. | Medium | Addressed for portfolio review | `agent/322-stripe-bridge-portfolio-package` |
| 14 | Listener recovery, audit policy, and taxonomy are documented but not live-runner automation. | Medium | Addressed for deterministic demo review | `agent/312-listener-recovery-drill`, `audit/313-listener-audit-policy-review`, `audit/314-listener-error-taxonomy-review` |
| 15 | Ledger and redemption safety remain demo state-machine guarantees, not production accounting. | Medium | Addressed for demo review | `audit/316-ledger-reconciliation-review`, `agent/317-redemption-burn-hardening` |

## Branch 310-322 Coverage

| Area | Branches | Current Status |
| --- | --- | --- |
| CI and browser validation | `agent/310-ci-repo-health` | `npm ci`, CI, and Playwright browser checks documented as passing. |
| Dependency posture | `audit/311-dependency-posture-refresh` | 25 findings, 0 critical, no safe direct upgrades, no force fix. |
| Listener recovery and audit policy | `agent/312-listener-recovery-drill`, `audit/313-listener-audit-policy-review`, `audit/314-listener-error-taxonomy-review` | Demo dry-run and documentation coverage improved. No live automation approval. |
| Risk, ledger, and redemption safety | `agent/315-risk-case-management-hardening`, `audit/316-ledger-reconciliation-review`, `agent/317-redemption-burn-hardening` | Deterministic tests and docs improved for demo state machines and stop conditions. |
| Operations and pilot process | `agent/318-operator-incident-drills`, `agent/319-enterprise-pilot-playbook-refresh` | Human review gates, tabletop drills, and pilot packet guidance refreshed. |
| Hosted demo | `audit/320-hosted-demo-readiness-refresh` | Static/read-only hosted posture documented with stop conditions. |
| Enterprise UI | `agent/321-admin-company-ui-enterprise-readiness` | Admin/company read-only demo readiness copy and browser checks refreshed. |
| Portfolio package | `agent/322-stripe-bridge-portfolio-package` | Stripe/Bridge-style portfolio packet added with forbidden claims and stop conditions. |

## Enterprise Pilot Readiness v1 Criteria

| Criterion | Current Status |
| --- | --- |
| Repo clearly remains local/testnet/mock-only. | Pass |
| Core CI validation passes on branch 323. | Pass |
| Browser/e2e checks pass on branch 323. | Pass |
| Security/legal/demo boundaries remain explicit. | Pass |
| Dependency audit is remediated or accepted for demo-only use. | Partial; 25 findings remain |
| Ledger/reconciliation invariants are documented and tested. | Pass |
| Mint and redemption flows have deterministic tests and stop conditions. | Pass for demo |
| Listener recovery, audit policy, and error taxonomy are documented. | Pass for demo |
| Risk case high-severity behavior is an operator-review gate. | Pass for demo |
| Admin UI explains risk/review/reconciliation concepts. | Pass for static/read-only demo |
| Company UI explains pilot participant boundaries. | Pass for static/read-only demo |
| Enterprise pilot playbook exists. | Pass |
| Operator and incident drills exist. | Pass |
| Hosted demo readiness is documented. | Pass with human approval gate |
| Stripe/Bridge portfolio package is reviewable. | Pass with claim restrictions |
| `main` remains untouched unless owner approves in writing. | Pass |
| Production readiness is achieved. | Fail; not in scope |

## Current Decision

Proceed next with `audit/324-enterprise-pilot-readiness-v1-review` after branch 323 validation. The next audit should verify this package as a discussion artifact only and confirm no newer evidence changes the blockers, gates, or demo boundaries.
