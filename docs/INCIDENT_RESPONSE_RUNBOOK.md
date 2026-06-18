# Incident Response Runbook

## Purpose

This runbook defines incident response procedures for ORMB Enterprise Pilot Readiness v1. ORMB remains testnet-only, mock-asset-only, no-real-funds, no-mainnet, and non-production. This runbook does not authorize real payment operations, custody, redemption, or legal/compliance decisions.

## Incident Severity

### Critical

Stop all demo progression and escalate to the human owner immediately if:

- a real private key, seed phrase, production credential, real customer record, real USDT, real RMB/CNH, or mainnet action is requested or detected
- UI, docs, scripts, or logs suggest ORMB is a public stablecoin, production payment system, or legally compliant financial product
- a contract role, mint script, or deployment script could execute outside Base Sepolia
- CI or validation failures affect mint, redemption, ledger, security, or legal boundary behavior and cannot be fixed in two focused attempts

### High

Pause affected demo operations and open a focused fix or audit branch if:

- worker status is `failed`
- reorg or block-hash mismatch is detected
- ledger or supply reconciliation invariants fail
- duplicate mint, duplicate burn, or duplicate deposit processing is suspected
- a high-severity unresolved risk case exists
- dependency findings change materially before a release or hosted-demo review

### Medium

Investigate and document if:

- worker status is `degraded`
- a listener retry threshold is reached
- dry-run backfill reports unknown-wallet or duplicate events that need operator review
- browser/e2e tests fail on demo routes
- admin or company copy becomes ambiguous about testnet/mock-only boundaries

### Low

Track in the next appropriate branch if:

- docs are stale but safety boundaries remain intact
- static demo data is confusing but not misleading
- non-blocking validation warnings appear

## Immediate Response Steps

1. Stop the affected workflow.
2. Confirm no real funds, real customer data, mainnet credentials, or production secrets are involved.
3. Capture the branch, commit, command, route, worker checkpoint, or dry-run report that exposed the issue.
4. Classify the incident severity.
5. Preserve logs or command output in the agent report without secrets.
6. Open a focused `agent/*` or `audit/*` branch for remediation or review.
7. Run relevant validation after the fix.
8. Merge only after CI passes.

Do not force-push `main` or `dev`. Do not merge `dev` into `main` during incident response.

## Worker Incidents

For worker status from `docs/WORKER_OBSERVABILITY.md`:

- `stale`: inspect the last successful checkpoint and determine whether a dry-run backfill is needed.
- `degraded`: inspect retry causes, classify the error with the listener taxonomy, and pause dependent demo progression.
- `failed`: stop automatic progression, run dry-run backfill if listener-related, and open an incident-response or fix branch.

No worker helper currently polls live services or sends alerts. Incident response is manual and documentation-driven.

## Listener And Backfill Incidents

When the deposit listener, confirmation worker, or backfill review surfaces a problem:

1. Confirm the issue is on fixture-backed or Base Sepolia testnet data only.
2. Run the dry-run backfill command over the suspected block range when relevant.
3. Review matching treasury deposits, unknown wallet events, duplicates, ignored events, and potential actions.
4. Compare reported event keys against existing demo deposits using `(chainId, txHash, logIndex)`.
5. Stop if a reorg, block-hash mismatch, duplicate conflict, or unexpected state transition appears.

Dry-run output is not permission to write deposits, create mint requests, mint ORMB, or change confirmation state.

## Risk Case Incidents

High-severity unresolved `RiskEvent` cases require operator review before demo mint progression continues.

Allowed response:

- acknowledge the case
- resolve the case for demo purposes when supporting context is clear
- reopen the case if new context appears
- document the transition actor, note, timestamp, and branch

Prohibited response:

- approve real KYB/KYC/AML/sanctions status
- whitelist real wallets
- bypass failed risk checks for real assets
- create mint requests for unknown-wallet deposits
- claim regulatory or legal approval

## Contract And Mint Role Incidents

If a contract, deployment, or mint role issue appears:

1. Stop script execution.
2. Confirm no mainnet network or real key is configured.
3. Review `docs/MINT_ROLE_RUNBOOK.md` and `docs/CONTRACT_THREAT_MODEL.md`.
4. Run `npm run test:contracts`.
5. Open a focused fix branch if role, whitelist, pause, mint, burn, or script guards are affected.

Do not deploy or rotate roles without explicit human owner approval.

## UI And Browser Incidents

If browser checks fail or copy appears unsafe:

1. Run `npm run build` and `npm run test:e2e`.
2. Inspect the failing route.
3. Confirm visible disclaimers still state testnet-only, mock-only, no real funds, and no production payment claims.
4. Open a focused UI or copy hardening branch.

Unsafe copy must be treated as High severity if it suggests public RMB/CNH stablecoin issuance, real USDT/RMB/CNH processing, production payments, or legal compliance.

## Dependency Incidents

Before release or hosted-demo review:

```bash
npm audit --json
```

If counts or affected packages change materially:

1. Update `docs/DEPENDENCY_AUDIT.md`.
2. Check direct package updates.
3. Apply safe direct upgrades only when validation remains clean.
4. Do not run `npm audit fix --force` unless a separate branch justifies the ecosystem change.

Known findings are accepted only for local/testnet demo review, not production or real-funds use.

## Communication Template

Use this structure in the agent report or PR body:

```text
Incident:
Severity:
Branch:
Commit:
Affected area:
Commands/routes reviewed:
Immediate containment:
Fix or audit branch:
Validation:
Residual risk:
Next action:
```

Do not include secrets, private keys, RPC credentials, customer data, seed phrases, or real transaction instructions.

## Resolution Criteria

An incident can be marked resolved for demo purposes only when:

- the root cause is documented
- a focused fix or audit branch exists if behavior changed
- `npm run test:ci` passes
- browser/e2e checks pass when UI behavior changed
- docs and agent reports are updated
- no prohibited real-funds, mainnet, customer, or production behavior remains

## Escalation To Human Owner

Escalate before:

- sharing any hosted demo externally
- accepting dependency findings for a release gate
- changing contract role assignments
- running testnet deployment scripts
- resolving high-severity risk cases for a release gate
- changing legal or compliance boundary language
- taking any action involving real funds, real customers, mainnet, or production credentials
