# Enterprise Pilot Gap Analysis

## Scope

Branch: `audit/200-enterprise-pilot-gap-analysis`

This review assesses ORMB after `demo-v0` was merged into `dev`. It covers documentation, contracts, Prisma schema, worker cores, static UI, scripts, tests, Playwright checks, dependency posture, and agent reports.

Enterprise pilot readiness does not mean production launch, public stablecoin issuance, real funds, real USDT, real RMB/CNH, mainnet deployment, or legal/compliance approval. It means the repository has enough technical, operational, and documentation foundation for a limited enterprise pilot discussion after human, legal, and compliance review.

## Readiness Levels

| Level | Verdict | Rationale |
| --- | --- | --- |
| 1. Local technical demo | Ready | Contracts, worker cores, static dashboards, Prisma schema, CI, and Playwright smoke checks pass locally. |
| 2. Stripe/Bridge portfolio demo | Ready | The repo demonstrates stablecoin lifecycle modeling, smart contract controls, idempotent workers, manual approval, audit logs, and safety boundaries. |
| 3. Public hosted demo | Conditionally ready | Static pages and browser tests are strong, but dependency findings remain, lint is a placeholder, hosted-demo security posture is not documented, and no read-only hosted mode exists. |
| 4. Limited enterprise pilot preparation | Not ready | Missing accounting invariant tests, pilot playbook, operator runbook, incident response, threat models, durable workers, API design, and chain reliability model. |
| 5. Production stablecoin infrastructure | Not ready | No production authorization, no real compliance program, no custody/reserve model, no real rails, no mainnet approval, no production security or operations stack. |

## Current Strengths

- Clear testnet/mock/no-real-funds boundaries across app and docs.
- ORMBToken has role-based minting, whitelist enforcement, pause support, burn support, and tests.
- MockUSDT is clearly documented as public demo-only code.
- Prisma schema models companies, wallets, deposits, mint requests, mints, redemptions, risk events, audit logs, and job state.
- Worker cores are deterministic and unit-tested for deposit detection, confirmations, risk checks, mint request lifecycle, and redemption burn verification.
- Unknown-wallet deposits are rejected and never mint in the current risk flow.
- Duplicate deposit, mint submission, and burn event paths have baseline tests.
- Static dashboards communicate admin, company, demo flow, and monitoring concepts.
- Playwright production-mode browser checks cover `/`, `/demo`, `/admin`, `/company`, and `/status`.
- Agent workflow and branch discipline are established.

## Gap Analysis By Category

| Category | Current State | Pilot Gap | Severity |
| --- | --- | --- | --- |
| Smart contract security | Role, whitelist, pause, mint, burn tests exist. | No full threat model, no external audit, no role-admin separation analysis, no multisig/timelock runbook. | High |
| Mint role safety | `DEFAULT_ADMIN_ROLE`, `MINTER_ROLE`, `PAUSER_ROLE`, and `WHITELIST_ADMIN_ROLE` start on one admin. | Pilot needs documented role separation, hot wallet/minter risk limits, emergency procedures, and key custody assumptions. | High |
| Whitelist model | Contract and schema support whitelisted wallets. | No expiration, review workflow, reason codes, evidence references, or removal review policy. | Medium |
| Deposit listener correctness | Processes supplied MockUSDT logs idempotently. | No live polling runner, RPC error handling, canonical log validation, or persistent adapter implementation. | High |
| Confirmation/reorg handling | Threshold confirmation worker exists. | No reorg detection, block hash tracking, rollback policy, or finality assumptions beyond block count. | High |
| Duplicate processing/idempotency | Deposit and burn uniqueness are modeled and tested. | Need cross-flow ledger invariant tests and retry/backfill semantics. | High |
| Ledger/accounting completeness | Schema has deposits, mint requests, mints, redemptions, and audit logs. | No tested end-to-end reconciliation invariant tying mock deposits, mints, burns, and supply together. | Critical |
| Risk engine completeness | KYB, wallet, deposit, duplicate, auto-limit, and daily-limit checks exist. | No case-management lifecycle, manual review assignment, policy versioning, risk evidence, or escalation workflow. | High |
| Redemption/burn flow completeness | Redemption request, approval, burn verification, duplicate burn skip, and payout simulation exist. | Needs stronger state-machine docs/tests and explicit simulated-payout runbook. | Medium |
| Audit logging | Worker cores create audit events through repository interfaces. | No standard audit schema guide, retention policy, tamper-resistance model, or query API. | Medium |
| Monitoring and alerting | Static status dashboard exists. | No live health checks, job metrics, alert routing, log structure, or runbook. | High |
| Dependency vulnerabilities | 25 npm audit findings, 0 critical, documented. | Must be rechecked and reduced if safe before hosted/public demo. | High |
| Secret management | `.env` ignored; placeholders documented. | Need environment validation, secret inventory, rotation policy, and CI secret rules. | High |
| Environment configuration | Base Sepolia env variables and guards exist. | No typed env validation or clear local/testnet/hosted demo modes. | High |
| Database migration safety | Prisma schema validates. | No migrations, migration rollback plan, seed isolation, or backup/restore assumptions. | High |
| UI/admin usability | Static admin dashboard communicates risk and reconciliation. | Needs richer risk review and reconciliation explanations for pilot operators. | Medium |
| Company dashboard usability | Static company dashboard explains deposit/redemption flow. | Needs pilot participant guide, statuses, and support/escalation language. | Medium |
| Demo flow quality | Static walkthrough and demo script exist. | Needs enterprise pilot narrative and optional diagram/video package. | Low |
| Browser/e2e coverage | Route/navigation/safety checks exist. | No interaction-level admin/company assertions or accessibility checks. | Medium |
| API design | No API implementation. | Need API contract docs before pilot preparation can be considered. | High |
| Error handling | Worker cores return deterministic reasons. | No global error taxonomy, retry policy, dead-letter model, or operator remediation guide. | High |
| Deployment readiness | Testnet scripts are guarded; no deployment done. | No Docker/local stack, hosted-demo plan, read-only mode, or server deployment runbook. | High |
| Observability/logging | Audit logs and status page are modeled. | No structured runtime logging, correlation IDs, metrics, traces, or alert severity model. | High |
| Data retention | Audit logs exist in schema. | No retention, export, deletion, or privacy boundary policy. | Medium |
| KYB/KYC workflow design | Company KYB status exists. | No demo-only KYB workflow states, evidence handling, restricted-use policy, or no-real-compliance disclaimer. | High |
| Legal/compliance boundaries | Strong no-real-product docs exist. | Need enterprise pilot policy doc distinguishing demo review from regulated activity. | High |
| Enterprise pilot process | Release checklist exists for demo-v0. | Need pilot playbook, participant roles, acceptance gates, operator runbook, and incident response. | Critical |
| Stripe/Bridge application readiness | Alignment doc and demo script exist. | Needs architecture diagrams, recruiter walkthrough, resume bullets, and portfolio packaging. | Medium |

## Key Findings

### Critical

1. Ledger and accounting invariants are not yet tested across the full lifecycle.
2. Enterprise pilot process docs do not yet exist beyond demo-v0 release materials.

### High

1. Dependency vulnerabilities remain unresolved and block hosted/public-demo confidence.
2. Secret and environment management need stronger validation and documented modes.
3. Contract role safety needs a threat model and role separation runbook.
4. Chain listener reliability lacks reorg, retry, and backfill strategy.
5. API, durable worker, and observability architecture are not defined for pilot preparation.
6. KYB/risk case-management workflow is still a simplified demo model.

### Medium

1. Admin and company dashboards need more pilot-oriented explanatory states.
2. Audit log retention and query strategy are not documented.
3. Browser tests are route-level smoke checks, not workflow or accessibility coverage.

### Low

1. Portfolio packaging can be improved after security, accounting, and pilot-runbook gaps are addressed.

## Recommended Next Move

The highest unblock value is the ledger/accounting gap because enterprise pilot discussions depend on traceability between mock deposits, mint requests, mints, burns, and displayed supply. The next implementation branch should be:

`agent/220-ledger-invariant-tests`

Security hardening and pilot process docs should follow immediately after the accounting invariant baseline.
