# Enterprise Pilot Readiness v1

## Release Candidate Date

2026-06-18

## Verdict

**Enterprise Pilot Readiness v1 is ready for human review.**

This does not approve a real enterprise pilot, production launch, mainnet deployment, real stablecoin issuance, custody, payment processing, redemption, or real customer activity. It means the repository now has a coherent technical, security, operational, documentation, and workflow foundation that a human owner can review for a future limited enterprise pilot discussion.

ORMB remains testnet-only, mock-asset-only, no-real-funds, no-mainnet, and non-production.

## Readiness Evidence

- Core demo flow is implemented as contracts, deterministic worker cores, static dashboards, Prisma schema, and docs.
- Unit tests cover deposit listener, confirmations, risk engine, mint request flow, redemption burn flow, ledger invariants, listener backfill, error taxonomy, risk case management, environment parsing, and worker status.
- Contract tests cover ORMBToken and MockUSDT demo behavior.
- Browser/e2e tests cover `/`, `/demo`, `/admin`, `/company`, `/status`, navigation, safety boundary copy, admin enterprise review concepts, and company pilot participation boundaries.
- Security, legal, dependency, UI, demo, contract, listener, enterprise, hosted-demo, and audit reviews are documented.
- API contracts, worker adapter boundaries, database migration safety, audit retention, operator runbook, and incident response are documented.
- Stripe/Bridge-style portfolio walkthrough is documented.

## Criteria Status

| Criterion | Status |
| --- | --- |
| Repo clearly remains testnet/mock-only. | Pass |
| Core demo flows still pass. | Pass |
| Browser/e2e checks pass. | Pass |
| Security review is updated. | Pass |
| Dependency audit is documented and accepted only for local/testnet and conditional read-only hosted-demo review. | Pass with limitation |
| Ledger/reconciliation invariants are documented and tested. | Pass |
| Mint and redemption flows have idempotency tests. | Pass |
| Unknown wallet and failed risk paths are safe. | Pass |
| Admin UI explains risk/review/reconciliation concepts. | Pass for static demo |
| Company UI explains pilot flow clearly. | Pass for static demo |
| Enterprise pilot playbook exists. | Pass |
| Operator runbook exists. | Pass |
| Incident response runbook exists. | Pass |
| Legal/compliance boundary says no real funds or public issuance. | Pass |
| Hosted demo readiness is documented. | Pass with human approval gate |
| Stripe/Bridge portfolio package is ready. | Pass |
| `main` remains untouched unless owner approves. | Pass |

## Required Human Approval Gates

Before any external sharing, hosted demo, pilot discussion, or later `dev` to `main` release, the human owner must approve:

- exact audience and URL, if hosted
- dependency audit acceptance for the exact use case
- no-real-funds/no-mainnet/no-customer-data boundary
- legal/compliance wording
- screenshots and walkthrough material
- branch/PR merge target
- whether `dev` should ever be promoted to `main`

## Explicit Non-Approvals

This release candidate does not approve:

- public RMB/CNH stablecoin launch
- real USDT
- real RMB/CNH
- real customer funds
- custody
- redemption for real-world value
- mainnet deployment
- production payment processing
- real KYB/KYC/AML/sanctions/compliance claims
- production auth, database, monitoring, or incident operations

## Known Limitations

- No live API implementation.
- No durable worker runner.
- No live RPC polling loop.
- No production database or migration pipeline.
- No hosted deployment target.
- No production authn/authz.
- No real compliance provider integration.
- No audit export endpoint or tamper-resistant log sink.
- `lint` remains a placeholder.
- `npm audit --json` reports known findings accepted only for local/testnet and conditional read-only hosted-demo review after human owner approval.

## Validation Summary

Validation for this release branch is recorded in `docs/agent-reports/release-enterprise-pilot-readiness-v1.md`.

## Next Human Review Path

1. Review this document.
2. Review `README.md`.
3. Review `docs/PORTFOLIO_WALKTHROUGH.md`.
4. Review `docs/ENTERPRISE_UI_REVIEW.md`.
5. Review `docs/HOSTED_DEMO_READINESS.md`.
6. Review `docs/DEPENDENCY_AUDIT.md`.
7. Review screenshots under `docs/ui-screenshots/`.
8. Decide whether Enterprise Pilot Readiness v1 is accepted as a testnet/mock-only portfolio and technical demo.
