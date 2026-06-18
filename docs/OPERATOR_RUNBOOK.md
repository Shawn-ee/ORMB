# Operator Runbook

## Purpose

This runbook defines local/testnet demo operating procedures for ORMB Enterprise Pilot Readiness v1. It does not authorize production operations, real funds, real USDT, real RMB/CNH, customer funds, or mainnet deployment.

Use the drill checklists below for tabletop practice and demo-branch containment only. They do not authorize real payment operations, custody, redemption, legal/compliance decisions, or production incident handling.

## Operating Modes

### Local Demo

- Static app pages.
- Unit-tested worker cores.
- Fixture-backed dry-run backfill.
- No live RPC polling.
- No contract script execution unless explicitly testing Base Sepolia scripts with placeholder-free testnet variables.

### Hosted Demo Preparation

- Read-only mode only.
- No deploy keys.
- No private keys.
- No real customer data.
- No live mutation flows unless separately approved.

### Testnet Script Mode

- Base Sepolia only.
- Requires explicit `ORMB_CONFIRM_TESTNET_DEPLOY=YES`.
- Requires non-placeholder testnet RPC and testnet deployer key.
- Never use mainnet keys or production credentials.

## Pre-Run Checklist

1. Confirm current branch is not `main` for agent work.
2. Confirm no uncommitted secrets exist.
3. Confirm `.env` values are local/testnet only.
4. Run `npm run test:ci`.
5. Run `npm run test:e2e` if UI/browser behavior changed.
6. Review `docs/LEGAL_BOUNDARIES.md`.
7. Review `docs/ENTERPRISE_PILOT_PLAYBOOK.md`.

## Tabletop Drill Rules

Apply these rules to every operator drill:

- Keep the scenario local, fixture-backed, or Base Sepolia testnet-only.
- Stop immediately if real funds, real USDT, real RMB/CNH, customer data, production credentials, mainnet, private keys, or seed phrases appear.
- Capture commands, branch names, commit IDs, routes, logs, and screenshots only after removing secrets.
- Open a focused `agent/*` or `audit/*` branch for any behavior or documentation change.
- Update documentation when behavior, assumptions, APIs, contracts, security posture, or demo flow changes.
- Record validation results in the agent report.

## Standard Validation

Run:

```bash
npm run test:ci
```

For dependency review before release gates:

```bash
npm audit --json
```

Audit findings must be remediated or explicitly accepted for local/testnet demo use only. Acceptance does not make ORMB production-ready and does not allow real funds.

For browser changes:

```bash
npm run test:e2e
```

For schema-related changes:

```bash
npm run prisma:generate
npm run prisma:validate
```

For contract changes:

```bash
npm run test:contracts
```

## Dry-Run Backfill Procedure

Use the dry-run command only with fixture-backed logs and known-wallet files:

```bash
npm run backfill:dry-run -- --chain-id 84532 --treasury <base-sepolia-demo-treasury> --mock-usdt <base-sepolia-mock-usdt> --from-block <start> --to-block <end> --logs-file ./tmp/mock-transfer-logs.json --known-wallets-file ./tmp/company-wallets.json --existing-deposits-file ./tmp/existing-deposits.json
```

Review:

- events found
- matching treasury deposits
- known company wallet matches
- unknown wallet events
- duplicate event keys
- ignored events
- potential actions

Dry-run output is not approval to write deposits or mint ORMB.

## Worker Status Review

Use worker status summaries to classify supplied checkpoints:

- `healthy`: no action needed beyond routine review.
- `stale`: inspect last run and latest successful checkpoint.
- `degraded`: inspect retry causes and recent audit logs.
- `failed`: stop automatic progression and escalate to incident response.

Worker status summaries are static/demo helpers. They do not poll services or send alerts.

## Operator Tabletop Drills

### CI Failure

Goal: contain a validation failure before it reaches `dev`.

1. Confirm the branch and failing command.
2. Re-run the failing command once to rule out a local transient failure.
3. Classify the affected area: docs, UI, worker, contract, schema, dependency, or safety boundary.
4. Stop demo progression if mint, redemption, ledger, security, or legal-boundary behavior is affected.
5. Open or continue a focused fix branch; do not broaden the change set.
6. Run `npm run test:ci` after the fix.
7. Run focused follow-up validation when relevant: `npm run test:e2e`, `npm run test:contracts`, `npm run prisma:generate`, or `npm run prisma:validate`.
8. Document the failing command, fix, validation result, and residual risk in the agent report.

Exit criteria:

- The failing command passes, or the unresolved failure is escalated with a focused branch and no merge.
- No production, mainnet, real-funds, customer-data, or compliance claim is introduced.

### Listener Failure

If a listener checkpoint is stale, degraded, or failed:

1. Pause any demo mint progression that depends on new deposits.
2. Review recent worker status and audit records.
3. Run the dry-run backfill command over the suspected missed block range.
4. Compare reported duplicates, unknown wallet events, and potential actions.
5. Open a focused fix or incident-response branch if the report suggests missing logic.

Do not convert dry-run output into database writes without a separately scoped, reviewed apply-mode branch.

Exit criteria:

- Missed, duplicate, unknown-wallet, or reorg-related events are documented.
- Any code change has focused validation.
- No dry-run output is treated as approval to create deposits, mint requests, or ORMB mints.

### Dependency Change

Goal: review dependency movement without making production-readiness claims.

1. Confirm no parallel agent owns the dependency files before editing package metadata or audit docs.
2. Run the dependency command requested by the branch scope, such as `npm audit --json`.
3. Compare new counts, affected packages, and direct dependency exposure against the prior report.
4. Prefer safe direct upgrades only when they are in scope and validation remains clean.
5. Do not run `npm audit fix --force` unless a separate branch justifies the ecosystem change.
6. Update the dependency audit documentation only on the dependency-owned branch.
7. Run `npm run test:ci`.
8. Record accepted findings as local/testnet demo risk only.

Exit criteria:

- Dependency findings are remediated or explicitly accepted for demo use only.
- Acceptance does not claim production readiness or allow real funds.

### Unsafe Copy

Goal: remove wording that could imply a public stablecoin, production payment product, or legal/compliance approval.

1. Identify the file, route, or screenshot with unsafe copy.
2. Classify as High severity if it suggests public RMB/CNH stablecoin issuance, real USDT/RMB/CNH processing, production payments, or legal compliance.
3. Replace copy with explicit testnet-only, mock-only, no-real-funds, and non-production language.
4. Confirm the edit does not add legal, regulatory, custody, redemption, or compliance claims.
5. Run `npm run test:ci`.
6. Run `npm run test:e2e` if browser-visible behavior changed.
7. Document the before/after intent without overstating readiness.

Exit criteria:

- The visible or documented copy stays within ORMB demo boundaries.
- Any UI route changed by the copy update has appropriate validation.

### Secret Exposure

Goal: contain suspected secrets without spreading them.

1. Stop work in the affected workflow.
2. Do not print, copy, commit, screenshot, or paste the suspected secret.
3. Record only the file path, command, route, or log source where the exposure appeared.
4. Confirm whether the value is a placeholder, local/testnet value, or real credential without revealing the value.
5. If a real secret, private key, seed phrase, production credential, mainnet RPC, or customer data appears, escalate to the human owner immediately.
6. Remove the secret from tracked files in a focused branch when safe to do so.
7. Do not attempt credential rotation unless explicitly directed by the human owner.
8. Run `git diff --check` and `npm run test:ci` after safe remediation.
9. Document containment and residual risk without including secret material.

Exit criteria:

- No secret material remains in the branch diff.
- The human owner is notified for real or production credentials.

## Risk Case Review

Risk cases are demo `RiskEvent` records only.

Operator review may:

- acknowledge a case
- resolve a case
- reopen a case
- add a note in audit metadata

Operator review must not:

- approve real KYB
- whitelist real wallets
- create mint requests
- override failed risk checks for real funds
- claim compliance approval

## Manual Mint Boundary

Before any testnet manual mint script is considered, confirm:

1. The request is for Base Sepolia only.
2. The deposit is mock/testnet only.
3. The company and receiving wallet are approved in demo data.
4. Risk checks passed.
5. Ledger invariants pass.
6. The mint role runbook was followed.
7. No real funds or customer obligations are involved.

See `docs/MINT_ROLE_RUNBOOK.md`.

## Stop Conditions

Stop operations if:

- a real secret, key, or production credential is required
- real funds, real USDT, real RMB/CNH, or customer funds are involved
- mainnet deployment is requested
- dependency/security findings are unacceptable
- reconciliation or idempotency checks fail
- UI copy implies production readiness or public stablecoin issuance
- legal/compliance approval is unclear

Incident classification and response steps are documented in `docs/INCIDENT_RESPONSE_RUNBOOK.md`.

## Escalation

Escalate to the human owner before:

- sharing a hosted demo externally
- running testnet deployment scripts
- changing role assignments
- resolving high-severity risk cases
- accepting dependency vulnerabilities for a release
- changing legal boundary language

## Rollback And Recovery

For demo branches:

- revert through a focused PR into `dev`
- do not force-push `main` or `dev`
- preserve agent reports
- document failed validation and root cause

For demo data:

- reseed deterministic local data
- rerun validation
- do not attempt to recover real customer data because real customer data is prohibited

## Troubleshooting

- Prisma validation fails: check schema edits, run `npm run prisma:generate`, then rerun `npm run prisma:validate`.
- TypeScript fails: inspect the exact type error before changing shared interfaces.
- Unit tests fail: isolate the failing worker or flow and add a focused fix branch.
- Contract tests fail: do not deploy; inspect Hardhat config, fixtures, and role assumptions.
- Browser/e2e fails: verify the app builds, routes load, and disclaimers remain visible.
- Dry-run backfill rejects a range: confirm `fromBlock <= toBlock` and that both values are non-negative integers.
- Dependency audit changes: update `docs/DEPENDENCY_AUDIT.md` before any release-readiness claim.
- A real key, mainnet RPC, real asset, or customer data is requested: stop and escalate to the human owner.

## Handoff Requirements

Every operator-facing agent branch must report:

- branch name
- PR URL
- validation commands and results
- known limitations
- safety boundary changes, if any
- next recommended branch
