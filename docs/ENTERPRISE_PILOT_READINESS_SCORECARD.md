# Enterprise Pilot Readiness Scorecard

## Summary

Current target: Enterprise Pilot Readiness v1

Current verdict: Not ready; blockers remain after Enterprise hardening branches.

The repo is ready as a local technical demo and Stripe/Bridge portfolio demo. It is not ready for Enterprise Pilot Readiness v1 until hosted-demo posture, API/worker boundaries, database migration safety, audit retention, enterprise UX context, and final portfolio packaging are addressed or explicitly accepted by the human owner.

## Scorecard

| Rank | Gap | Severity | Status | Next Branch |
| --- | --- | --- | --- | --- |
| 1 | Hosted demo readiness requires human acceptance for exact read-only posture. | High | Conditionally addressed | `audit/280-hosted-demo-readiness` |
| 2 | API design is specified but not implemented. | High | Documented | `agent/300-api-contract-docs` |
| 3 | Durable worker runner and persistence adapter boundaries are documented but not implemented. | High | Documented | `agent/301-worker-adapter-boundary-docs` |
| 4 | Database migration safety is documented but no migration pipeline exists. | High | Documented | `agent/302-database-migration-runbook` |
| 5 | Dependency audit reports 25 findings, including 8 high. | High | Accepted for local/testnet demo only | `audit/280-hosted-demo-readiness` |
| 6 | Admin UI needs stronger risk/reconciliation pilot explanations. | Medium | Addressed for static demo | `agent/270-admin-risk-review-ui` |
| 7 | Company UI needs stronger pilot participant guidance. | Medium | Addressed for static demo | `agent/272-company-pilot-flow-ui` |
| 8 | Browser tests are smoke-level only. | Medium | Open | `audit/274-browser-enterprise-readiness-review` |
| 9 | Audit log retention and export strategy is documented but not implemented. | Medium | Documented | `agent/303-audit-retention-docs` |
| 10 | Portfolio packaging can be stronger. | Low | Open | `agent/290-stripe-bridge-readme-polish` |
| 11 | Ledger/reconciliation invariants are not tested across deposits, mints, burns, and supply. | Critical | Addressed | `agent/220-ledger-invariant-tests` |
| 12 | Enterprise pilot process docs are incomplete. | Critical | Addressed | `agent/260-enterprise-pilot-playbook` |
| 13 | Secret management lacks typed validation and hosted-demo mode boundaries. | High | Addressed | `agent/211-secret-management-hardening` |
| 14 | Contract role and minter operational threat model is incomplete. | High | Addressed | `audit/214-contract-threat-model` |
| 15 | Mint role runbook and hot wallet/minter assumptions are incomplete. | High | Addressed | `agent/213-mint-role-runbook-hardening` |
| 16 | Chain listener lacks reorg/backfill/retry design. | High | Addressed | `agent/230-listener-reorg-resilience` through `agent/238-listener-error-taxonomy` |
| 17 | Observability and structured logging are not implemented. | High | Partially addressed | `agent/232-worker-observability` |
| 18 | KYB/risk case management is simplified. | High | Partially addressed | `agent/240-risk-case-management` |
| 19 | Operator runbook is incomplete for pilot-style operations. | High | Addressed | `agent/262-operator-runbook` |
| 20 | Incident response runbook is missing. | High | Addressed | `agent/263-incident-response-runbook` |

## Enterprise Pilot Readiness v1 Criteria

| Criterion | Current Status |
| --- | --- |
| Repo clearly remains testnet/mock-only. | Pass |
| Core demo flows pass. | Pass |
| Browser/e2e checks pass. | Pass |
| Security review is updated. | Pass |
| Dependency audit is remediated or accepted for demo-only use. | Partial |
| Ledger/reconciliation invariants are documented and tested. | Pass |
| Mint and redemption flows have idempotency tests. | Pass |
| Unknown wallet and failed risk paths are safe. | Pass |
| Admin UI explains risk/review/reconciliation concepts. | Partial |
| Company UI explains pilot flow clearly. | Partial |
| Enterprise pilot playbook exists. | Pass |
| Operator runbook exists. | Pass |
| Incident response runbook exists. | Pass |
| Legal/compliance boundary says no real funds/public issuance. | Pass |
| Hosted demo readiness is documented. | Partial |
| Stripe/Bridge portfolio package is ready. | Partial |
| `main` remains untouched unless owner approves. | Pass |

## Current Decision

Proceed next with `audit/274-browser-enterprise-readiness-review` because enterprise UI changes need a fresh browser review across admin and company routes.
