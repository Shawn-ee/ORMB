# Enterprise Pilot Readiness Scorecard

## Summary

Current target: Enterprise Pilot Readiness v1

Current verdict: Not ready

The repo is ready as a local technical demo and Stripe/Bridge portfolio demo. It is not ready for limited enterprise pilot preparation until the critical and high gaps below are addressed or explicitly accepted by the human owner.

## Scorecard

| Rank | Gap | Severity | Status | Next Branch |
| --- | --- | --- | --- | --- |
| 1 | Ledger/reconciliation invariants are not tested across deposits, mints, burns, and supply. | Critical | Open | `agent/220-ledger-invariant-tests` |
| 2 | Enterprise pilot process docs are incomplete. | Critical | Open | `agent/260-enterprise-pilot-playbook` |
| 3 | Dependency audit reports 25 findings, including 8 high. | High | Open | `agent/210-dependency-hardening` |
| 4 | Secret management lacks typed validation and hosted-demo mode boundaries. | High | Open | `agent/211-secret-management-hardening` |
| 5 | Contract role and minter operational threat model is incomplete. | High | Open | `audit/214-contract-threat-model` |
| 6 | Mint role runbook and hot wallet/minter assumptions are incomplete. | High | Open | `agent/213-mint-role-runbook-hardening` |
| 7 | Chain listener lacks reorg/backfill/retry design. | High | Open | `agent/230-listener-reorg-resilience` |
| 8 | API design is not specified. | High | Open | Future `agent/300-api-contract-docs` |
| 9 | Durable worker runners and persistence adapters are not implemented. | High | Open | Future `agent/301-worker-adapters` |
| 10 | Observability and structured logging are not implemented. | High | Open | `agent/232-worker-observability` |
| 11 | KYB/risk case management is simplified. | High | Open | `agent/240-risk-case-management` |
| 12 | Operator runbook is incomplete for pilot-style operations. | High | Open | `agent/262-operator-runbook` |
| 13 | Incident response runbook is missing. | High | Open | `agent/263-incident-response-runbook` |
| 14 | Database migration safety is not documented. | High | Open | Future `agent/302-database-migration-runbook` |
| 15 | Admin UI needs stronger risk/reconciliation pilot explanations. | Medium | Open | `agent/270-admin-risk-review-ui` |
| 16 | Company UI needs stronger pilot participant guidance. | Medium | Open | `agent/272-company-pilot-flow-ui` |
| 17 | Browser tests are smoke-level only. | Medium | Open | `agent/274-browser-enterprise-readiness-review` |
| 18 | Audit log retention and export strategy is missing. | Medium | Open | Future `agent/303-audit-retention-docs` |
| 19 | Hosted demo readiness is not documented. | Medium | Open | `audit/280-hosted-demo-readiness` |
| 20 | Portfolio packaging can be stronger. | Low | Open | `agent/290-stripe-bridge-readme-polish` |

## Enterprise Pilot Readiness v1 Criteria

| Criterion | Current Status |
| --- | --- |
| Repo clearly remains testnet/mock-only. | Pass |
| Core demo flows pass. | Pass |
| Browser/e2e checks pass. | Pass |
| Security review is updated. | Partial |
| Dependency audit is remediated or accepted for demo-only use. | Partial |
| Ledger/reconciliation invariants are documented and tested. | Fail |
| Mint and redemption flows have idempotency tests. | Partial |
| Unknown wallet and failed risk paths are safe. | Pass |
| Admin UI explains risk/review/reconciliation concepts. | Partial |
| Company UI explains pilot flow clearly. | Partial |
| Enterprise pilot playbook exists. | Fail |
| Operator runbook exists. | Partial |
| Incident response runbook exists. | Fail |
| Legal/compliance boundary says no real funds/public issuance. | Pass |
| Hosted demo readiness is documented. | Fail |
| Stripe/Bridge portfolio package is ready. | Partial |
| `main` remains untouched unless owner approves. | Pass |

## Current Decision

Proceed next with `agent/220-ledger-invariant-tests` because it addresses a critical correctness gap and unblocks later risk, reconciliation, admin UI, and pilot-readiness work.
