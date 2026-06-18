# Enterprise Pilot Readiness v1

## Release Candidate Date

2026-06-18

## Verdict

**Enterprise Pilot Readiness v1 is ready only as a human-review discussion package after human owner, legal, and compliance approval.**

This package does not approve a production launch, public RMB/CNH stablecoin launch, real stablecoin issuance, real USDT, real RMB/CNH, real customer funds, customer deposits, custody, payment processing, live redemption, live mint/burn behavior, mainnet deployment, or production operations. ORMB remains a portfolio and technical demo with local/testnet, mock-asset, fixture-backed, and read-only review boundaries.

The readiness claim is narrow: the repository has enough documented technical, security, operational, UI, hosted-demo, dependency, and portfolio evidence for the human owner to review whether ORMB may be discussed as a possible future limited enterprise pilot concept. Any actual pilot discussion still requires human owner approval and legal/compliance approval first.

## Readiness Level

| Level | Current Status | Boundary |
| --- | --- | --- |
| Local demo | Ready for human review | Local/testnet and mock-only. No real funds, customer deposits, production credentials, or mainnet. |
| Stripe/Bridge portfolio demo | Ready for human review | Portfolio-style narrative only. No partnership claim, integration claim, custody, settlement, payment processing, or live stablecoin issuance. |
| Hosted demo | Conditional human-review candidate | Static or read-only only after owner approval of URL, audience, duration, environment posture, dependency risk, screenshots, and rollback plan. |
| Enterprise pilot readiness | Human-review discussion package only | May support a future discussion after owner, legal, and compliance approval. Not an approved enterprise pilot. |
| Production readiness | Not ready and not approved | Blocked by architecture, dependency, security, compliance, operations, auth, database, worker, API, custody, payment, monitoring, and legal gaps. |

## Completed Branch Areas 310-322

| Branch | Contribution |
| --- | --- |
| `agent/310-ci-repo-health` | Aligned CI with `npm ci`, Playwright Chromium installation, `npm run test:e2e`, and setup/validation docs. |
| `audit/311-dependency-posture-refresh` | Re-ran dependency posture checks and documented 25 npm audit findings with 0 critical and no safe direct dependency upgrades. |
| `agent/312-listener-recovery-drill` | Added fixture-backed dry-run listener recovery evidence for missed block ranges with duplicate, known-wallet, unknown-wallet, ignored, and out-of-range events. |
| `audit/313-listener-audit-policy-review` | Reviewed duplicate, ignored, unknown-wallet, and checkpoint listener audit policy and documented state-changing versus verbose audit records. |
| `audit/314-listener-error-taxonomy-review` | Refreshed listener retry, manual-review, and terminal error action guidance without authorizing progression, minting, or live automation. |
| `agent/315-risk-case-management-hardening` | Expanded risk case lifecycle coverage and docs for acknowledge, resolve, reopen, audit notes, and high-severity operator-review gates. |
| `audit/316-ledger-reconciliation-review` | Re-audited ledger invariants for deposits, mint requests, confirmed mints, verified burns, redemptions, duplicate burns, and expected supply. |
| `agent/317-redemption-burn-hardening` | Hardened deterministic redemption/burn state-machine checks and documentation while keeping payout behavior simulated only. |
| `agent/318-operator-incident-drills` | Added tabletop-style operator and incident drills for CI failure, listener failure, dependency changes, unsafe copy, and secret exposure. |
| `agent/319-enterprise-pilot-playbook-refresh` | Refreshed the Enterprise Pilot Playbook with approval gates, roles, demo boundaries, stop conditions, validation, and review packet requirements. |
| `audit/320-hosted-demo-readiness-refresh` | Clarified hosted-demo readiness as static/read-only only with environment expectations, no-secret policy, rollback, and deployment stop conditions. |
| `agent/321-admin-company-ui-enterprise-readiness` | Improved admin/company read-only demo surfaces and Playwright checks for pilot readiness boundaries and operator escalation copy. |
| `agent/322-stripe-bridge-portfolio-package` | Added a standalone Stripe/Bridge-style portfolio package with permitted narrative, forbidden claims, checklist, stop conditions, and script. |

## Readiness Evidence

- Core demo flow remains covered by deterministic worker cores, contracts, Prisma schema validation, static dashboards, tests, and documentation.
- Unit tests cover deposit listener behavior, confirmations, risk engine behavior, mint request flow, redemption burn flow, ledger invariants, listener backfill/recovery, listener taxonomy, risk case management, environment parsing, and worker status.
- Contract tests cover ORMBToken and MockUSDT demo behavior only.
- Browser/e2e checks cover `/`, `/demo`, `/admin`, `/company`, `/status`, navigation, safety boundary copy, admin enterprise review concepts, and company pilot participation boundaries.
- Security, legal, dependency, UI, demo, contract, listener, enterprise, hosted-demo, operator, incident, and audit reviews are documented.
- API contracts, worker adapter boundaries, database migration safety, audit retention, runbooks, and incident response remain documented but not production implementations.
- The Stripe/Bridge package is portfolio-style documentation only and does not claim partnership, integration, settlement, custody, or payment processing.

## Criteria Status

| Criterion | Status |
| --- | --- |
| Repo clearly remains local/testnet/mock-only. | Pass |
| Core CI validation passes. | Pass on branch 323 |
| Browser/e2e checks pass. | Pass on branch 323 |
| Security and legal boundaries remain explicit. | Pass |
| Dependency audit is documented and accepted only for local/testnet and conditional read-only hosted-demo review. | Pass with blocker |
| Ledger/reconciliation invariants are documented and tested. | Pass |
| Mint and redemption flows have deterministic tests and stop conditions. | Pass for demo state machines |
| Unknown-wallet, duplicate, ignored, retryable, terminal, and manual-review listener paths are documented. | Pass |
| High-severity risk cases remain operator-review gates. | Pass |
| Admin UI explains risk/review/reconciliation concepts. | Pass for static/read-only demo |
| Company UI explains pilot participant boundaries. | Pass for static/read-only demo |
| Enterprise pilot playbook exists. | Pass |
| Operator and incident drill guidance exists. | Pass |
| Hosted demo readiness is documented. | Pass with human approval gate |
| Stripe/Bridge portfolio package is ready for review. | Pass |
| `main` remains untouched unless owner approves in writing. | Pass |
| Production readiness is achieved. | Fail, not in scope |

## Validation Evidence

Branch 323 validation commands:

```bash
npm run test:ci
npm run test:e2e
git diff --check
```

Branch 323 validation results:

- `npm run test:ci`: passed. Included placeholder lint, Prisma generate, TypeScript check, Prisma validate, 94 unit tests, contract compile, 15 contract tests, and Next build.
- `npm run test:e2e`: passed. Playwright ran 16 desktop and mobile checks for release routes, navigation, safety boundary copy, admin enterprise review concepts, and company pilot boundaries.
- `git diff --check`: passed with line-ending normalization warnings for the edited Markdown files only.

Recent 310-322 evidence also recorded:

- `agent/310-ci-repo-health`: `npm ci`, `npm run test:ci`, `npx playwright install chromium`, `npm run test:e2e`, and `git diff --check` passed.
- `audit/311-dependency-posture-refresh`: `npm audit --json` reported 25 findings, 0 critical; `npm outdated` reported no outdated direct dependencies; `npm run test:ci` and `git diff --check` passed.
- `audit/320-hosted-demo-readiness-refresh` and `agent/321-admin-company-ui-enterprise-readiness`: `npm run test:ci`, `npm run test:e2e`, and `git diff --check` passed.

## Remaining Blockers

- `npm audit --json` most recently documented 25 findings: 8 low, 9 moderate, 8 high, 0 critical. These remain accepted only for local/testnet portfolio-demo work and conditional static/read-only hosted-demo review after explicit human owner approval.
- No production API implementation exists.
- No durable worker runner, live RPC polling loop, or production queue exists.
- No production database, migration pipeline, or backup/restore process exists.
- No production authn/authz, tenant isolation, or customer data controls exist.
- No real KYB/KYC/AML/sanctions/compliance provider integration exists.
- No audit export endpoint, immutable log sink, or production monitoring/alerting stack exists.
- Hosted demo remains conditional on static/read-only posture, owner-approved URL/audience/duration, no secrets, and rollback plan.
- `lint` remains a placeholder.
- Legal/compliance approval has not been granted.
- Production readiness, real-funds handling, custody, payment processing, mainnet deployment, and live mint/burn behavior are out of scope and blocked.

## Human Review Gates

Before any external sharing, hosted demo, enterprise pilot discussion, `dev` merge decision, or later `dev` to `main` release, the human owner must approve:

- exact review audience, URL, duration, and access controls, if hosted
- static/read-only hosted-demo posture and rollback/removal plan
- dependency audit acceptance for the exact use case
- no-real-funds, no-mainnet, no-customer-data, no-custody, and no-payment-processing boundary
- legal/compliance wording and any enterprise pilot discussion framing
- screenshots, walkthrough material, and portfolio narrative
- branch/PR merge target and release scope
- whether `dev` should ever be promoted to `main`

Legal/compliance approval is required before any enterprise pilot discussion. Owner approval alone is not approval to imply public stablecoin issuance, financial product availability, custody, settlement, or production readiness.

## Stop Conditions

Stop and do not share, host, merge for release, or present as pilot-ready if any of the following is true:

- real USDT, real RMB/CNH, customer funds, customer deposits, or production credentials are present
- private keys, seed phrases, RPC secrets, payment credentials, database credentials, or `.env` values are exposed
- mainnet deployment, live mint/burn, custody, payment processing, settlement, redemption, or production service behavior is introduced
- copy implies a public RMB/CNH stablecoin launch, public financial product, legal approval, compliance approval, partnership, or production availability
- hosted-demo behavior is mutable, writable, connected to live services, or not explicitly owner-approved
- dependency findings change materially or critical findings appear without a new human risk decision
- CI, e2e, or `git diff --check` fails

## Merge And Release Rules

- This branch is `release/323-enterprise-pilot-readiness-v1-refresh`.
- It may be merged only into `dev` after checks pass and the human owner reviews the release package.
- Do not merge `dev` into `main` from this branch.
- Do not force-push.
- Do not run `npm audit fix --force`.
- Do not deploy to mainnet or production.
- Do not open a PR or push from this branch unless separately instructed.

## Explicit Non-Approvals

This release package does not approve:

- public RMB/CNH stablecoin launch
- real USDT
- real RMB/CNH
- real customer funds
- customer deposits
- custody
- redemption for real-world value
- mainnet deployment
- production payment processing
- live settlement
- live mint/burn behavior
- real KYB/KYC/AML/sanctions/compliance claims
- production auth, database, monitoring, incident, or support operations
- Stripe, Bridge, bank, issuer, payment processor, or regulated partner integration claims

## Next Audit Branch

Next branch: `audit/324-enterprise-pilot-readiness-v1-review`.

Recommended scope for #324:

- Review this branch 323 package after validation completes.
- Re-check dependency posture if the package is being considered for hosted sharing.
- Confirm all stop conditions remain absent.
- Confirm branch 310-323 evidence is consistent and no newer branch invalidates the review package.
- Decide whether the package may be discussed as a human/legal/compliance-reviewed enterprise pilot concept, still without production, real-funds, custody, payment-processing, mainnet, or live mint/burn approval.
