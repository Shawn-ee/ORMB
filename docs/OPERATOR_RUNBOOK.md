# Operator Runbook

## Purpose

This runbook defines local/testnet demo operating procedures for ORMB Enterprise Pilot Readiness v1. It does not authorize production operations, real funds, real USDT, real RMB/CNH, customer funds, or mainnet deployment.

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

## Listener Recovery Review

If a listener checkpoint is stale, degraded, or failed:

1. Pause any demo mint progression that depends on new deposits.
2. Review recent worker status and audit records.
3. Run the dry-run backfill command over the suspected missed block range.
4. Compare reported duplicates, unknown wallet events, and potential actions.
5. Open a focused fix or incident-response branch if the report suggests missing logic.

Do not convert dry-run output into database writes without a separately scoped, reviewed apply-mode branch.

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
