# Parallel Agent Execution Plan

## Purpose

Coordinate Enterprise Pilot Readiness v1 follow-up work after `agent/310-ci-repo-health` without overlapping file ownership or bypassing CI.

ORMB remains testnet-only, mock-asset-only, no-real-funds, no-mainnet, and non-production.

## Global Rules

- Merge `agent/*`, `audit/*`, and `release/*` branches into `dev` only.
- Do not merge `dev` into `main` without explicit human approval.
- Do not force-push `main` or `dev`.
- Do not commit secrets, `.env` files, private keys, RPC secrets, production credentials, or customer data.
- Do not use real funds, real USDT, real RMB/CNH, custody, payment processing, or mainnet.
- Do not run `npm audit fix --force`.
- Do not merge failing CI or unresolved conflicts.

## Batch A

| Branch | Role | Objective | Expected files | Conflict risk | Validation | Merge order |
| --- | --- | --- | --- | --- | --- | --- |
| `audit/311-dependency-posture-refresh` | Dependency audit agent | Re-run `npm audit` and `npm outdated`; apply only safe direct upgrades if available; update dependency audit docs. | `docs/DEPENDENCY_AUDIT.md`; package files only if safe direct upgrades exist. | Medium. If package files change, this branch must run alone for package ownership. | `npm audit --json`, `npm outdated`, `npm run test:ci`, `npm run test:e2e` if dependencies change. | First if package files change; otherwise before or after `agent/318`. |
| `agent/318-operator-incident-drills` | Ops documentation agent | Convert operator and incident procedures into tabletop-style checklists for CI failure, listener failure, dependency change, unsafe copy, and secret exposure. | `docs/OPERATOR_RUNBOOK.md`, `docs/INCIDENT_RESPONSE_RUNBOOK.md`, agent report. | Low with `audit/311` unless dependency docs need incident/runbook changes. | `npm run test:ci`. | After `audit/311` if dependency docs require runbook changes; otherwise parallel-safe. |

## Batch B

Run sequentially because listener implementation, audit policy, and taxonomy review share conceptual ownership.

| Branch | Role | Objective | Expected files | Conflict risk | Validation | Merge order |
| --- | --- | --- | --- | --- | --- | --- |
| `agent/312-listener-recovery-drill` | Listener recovery agent | Add or refresh fixture-backed dry-run recovery drill evidence. | Listener tests/fixtures if needed, listener recovery docs, agent report. | Medium. | `npm run test`, `npm run test:ci`. | 1 |
| `audit/313-listener-audit-policy-review` | Listener audit reviewer | Review duplicate/ignored event audit behavior and docs. | Listener docs/tests, agent report. | Medium. | `npm run test`, `npm run test:ci`. | 2 |
| `audit/314-listener-error-taxonomy-review` | Error taxonomy reviewer | Review retry/manual-review/terminal taxonomy and operator actions. | Error taxonomy docs/tests, incident/runbook docs, agent report. | Medium. | `npm run test`, `npm run test:ci`. | 3 |

## Batch C

Run sequentially because risk, reconciliation, and redemption are high-risk state-machine areas.

| Branch | Role | Objective | Expected files | Conflict risk | Validation | Merge order |
| --- | --- | --- | --- | --- | --- | --- |
| `agent/315-risk-case-management-hardening` | Risk workflow agent | Tighten risk case lifecycle docs/tests and high-severity stop behavior. | Risk worker/tests/docs, agent report. | High. | `npm run test`, `npm run typecheck`, `npm run test:ci`. | 1 |
| `audit/316-ledger-reconciliation-review` | Reconciliation audit agent | Re-audit ledger invariants across deposits, mints, burns, redemptions, and supply. | Ledger tests/docs, agent report. | High. | `npm run test`, `npm run test:ci`. | 2 |
| `agent/317-redemption-burn-hardening` | Redemption safety agent | Harden redemption/burn state-machine tests/docs and simulated payout boundaries. | Redemption worker/tests/docs, agent report. | High. | `npm run test`, `npm run typecheck`, `npm run test:ci`. | 3 |

## Batch D

Use cautious parallelism only when file ownership is separated.

| Branch | Role | Objective | Expected files | Conflict risk | Validation | Merge order |
| --- | --- | --- | --- | --- | --- | --- |
| `agent/319-enterprise-pilot-playbook-refresh` | Pilot package agent | Refresh playbook, scorecard, and legal/security boundaries after earlier branches. | Enterprise readiness docs, legal/security docs, agent report. | Medium with hosted/portfolio docs. | `npm run test:ci`. | Before release packaging. |
| `audit/320-hosted-demo-readiness-refresh` | Hosted-demo audit agent | Re-evaluate read-only hosted posture and dependency acceptance. | Hosted demo and dependency docs, agent report. | Medium with `audit/311` and playbook docs. | `npm audit --json`, `npm run test:ci`, `npm run test:e2e`. | After dependency refresh. |
| `agent/321-admin-company-ui-enterprise-readiness` | Enterprise UI agent | Polish admin/company/status copy and related browser evidence. | `src/app/admin/page.tsx`, `src/app/company/page.tsx`, `src/app/status/page.tsx`, e2e docs/tests if needed, agent report. | Medium with Playwright route tests. | `npm run test:ci`, `npm run test:e2e`. | Before portfolio package. |
| `agent/322-stripe-bridge-portfolio-package` | Portfolio packaging agent | Refresh README, portfolio walkthrough, and Stripe/Bridge alignment. | `README.md`, portfolio docs, agent report. | Medium with readiness docs. | `npm run test:ci`; `npm run test:e2e` if route copy changes. | After UI if README references UI evidence. |

## Batch E

Always sequential.

| Branch | Role | Objective | Expected files | Conflict risk | Validation | Merge order |
| --- | --- | --- | --- | --- | --- | --- |
| `release/323-enterprise-pilot-readiness-v1-refresh` | Release packaging agent | Package updated Enterprise Pilot Readiness v1 candidate. | Readiness docs, scorecard, release report. | High. | `npm run test:ci`, `npm run test:e2e`, `npm audit --json`, `git diff --check`. | 1 |
| `audit/324-final-enterprise-readiness` | Final audit agent | Independent final review of security, legal boundaries, dependency posture, CI, UI, worker safety, and docs. | Audit docs and report. | High. | `npm run test:ci`, `npm run test:e2e`, `npm audit --json`. | 2 |

## Integration Validation

After each merged batch:

```bash
npm run test:ci
```

Also run:

```bash
npm run test:e2e
```

when browser/UI, hosted-demo posture, README route copy, or public demo documentation changes.

## Current Next Step

Batch A may dispatch `audit/311-dependency-posture-refresh` and `agent/318-operator-incident-drills` in parallel only if `audit/311` does not modify operator or incident runbooks. If `audit/311` changes package files, merge it before any later package-file branch.
