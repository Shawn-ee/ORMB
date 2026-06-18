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

## Incident Tabletop Drills

Use these checklists for tabletop practice and demo incident response. They are not production incident procedures and do not authorize real funds, real customer data, mainnet activity, custody, redemption, or legal/compliance decisions.

### CI Failure

Severity guide:

- Critical: failure affects mint, redemption, ledger, security, or legal boundary behavior and cannot be fixed in two focused attempts.
- High: failure blocks release or hosted-demo review.
- Medium: browser/e2e route failure or ambiguous copy.
- Low: non-blocking warning with intact safety boundaries.

Checklist:

1. Stop the merge or release path.
2. Capture the branch, commit, command, and failing test name without secrets.
3. Re-run the failing command once.
4. Classify the affected area and severity.
5. Open or continue a focused fix branch.
6. Run `npm run test:ci` after remediation.
7. Run extra validation when the affected area requires it.
8. Record root cause, validation, and residual risk in the agent report.

Resolution:

- CI passes, or the failure remains contained on a focused branch with no merge.
- No public stablecoin, production, real-funds, mainnet, customer-data, or compliance claim is introduced.

### Listener Failure

Severity guide:

- High: worker status is `failed`, reorg or block-hash mismatch appears, or duplicate processing is suspected.
- Medium: worker status is `degraded`, stale, or retry thresholds are reached.

Checklist:

1. Pause demo mint progression that depends on new deposits.
2. Confirm the issue is fixture-backed or Base Sepolia testnet-only.
3. Review worker status, checkpoints, audit records, and retry causes.
4. Run dry-run backfill over the suspected missed block range when relevant.
5. Review matching treasury deposits, unknown wallet events, duplicates, ignored events, and potential actions.
6. Compare event keys against existing demo deposits using `(chainId, txHash, logIndex)`.
7. Stop if a reorg, block-hash mismatch, duplicate conflict, or unexpected state transition appears.
8. Open a focused fix or incident-response branch if logic or docs must change.

Resolution:

- The suspected listener gap is documented with dry-run evidence where applicable.
- No dry-run output becomes a database write, mint request, ORMB mint, or confirmation-state change.

### Dependency Change

Severity guide:

- High: dependency findings change materially before release or hosted-demo review.
- Medium: dependency warnings affect local/testnet demo reliability.
- Low: stale dependency documentation with no safety impact.

Checklist:

1. Confirm ownership before editing dependency files or dependency audit documentation.
2. Run the scoped dependency review command, such as `npm audit --json`.
3. Compare package names, severity counts, direct exposure, and available fixes.
4. Prefer a focused dependency branch for package changes.
5. Do not run `npm audit fix --force` without separate justification.
6. Run `npm run test:ci` after dependency changes.
7. Document accepted findings as local/testnet demo risk only.

Resolution:

- Findings are fixed or accepted only for local/testnet demo review.
- No acceptance statement implies production readiness or real-funds approval.

### Unsafe Copy

Severity guide:

- High: copy implies public RMB/CNH stablecoin issuance, real USDT/RMB/CNH processing, production payments, or legal compliance.
- Medium: copy is ambiguous about testnet/mock-only boundaries.
- Low: copy is stale but not misleading.

Checklist:

1. Stop the affected demo, PR, or release path.
2. Capture the file, route, screenshot name, or component without overstating the claim.
3. Replace unsafe wording with testnet-only, mock-only, no-real-funds, and non-production language.
4. Check nearby docs and UI for the same claim.
5. Run `npm run test:ci`.
6. Run `npm run test:e2e` if browser-visible copy changed.
7. Document the corrected boundary and validation.

Resolution:

- The unsafe wording is removed or clearly scoped to demo/testnet use.
- No new legal, regulatory, compliance, custody, redemption, or production claim is added.

### Secret Exposure

Severity guide:

- Critical: real private key, seed phrase, production credential, mainnet RPC, real customer record, or real funds data appears.
- High: testnet credential or local-only secret is committed or printed.
- Medium: placeholder handling is ambiguous.

Checklist:

1. Stop the affected workflow.
2. Do not repeat, paste, screenshot, or commit the suspected secret.
3. Record only the location and context, not the value.
4. Determine whether the value is placeholder, local/testnet, or real without disclosing it.
5. Escalate immediately to the human owner for real or production credentials.
6. Remove secret material from tracked files on a focused branch when safe.
7. Do not rotate credentials unless the human owner explicitly directs it.
8. Run `git diff --check` and `npm run test:ci` after remediation.
9. Document containment, owner escalation, and residual risk without secret material.

Resolution:

- No secret value is present in the branch diff or report.
- Real or production credential exposure is escalated to the human owner.

## Worker Incidents

For worker status from `docs/WORKER_OBSERVABILITY.md`:

- `stale`: inspect the last successful checkpoint and determine whether a dry-run backfill is needed.
- `degraded`: inspect retry causes, classify the error with the listener taxonomy, and pause dependent demo progression.
- `failed`: stop automatic progression, run dry-run backfill if listener-related, and open an incident-response or fix branch.

No worker helper currently polls live services or sends alerts. Incident response is manual and documentation-driven.

For redemption burn incidents, stop demo progression and review `docs/REDEMPTION_BURN_FLOW.md` if an invalid state transition, duplicate burn identity, mismatched amount, wrong source wallet, wrong chain id, malformed tx hash, malformed log index, or premature payout simulation is detected. Duplicate burn events must not advance another redemption, and any payout marker must remain simulated only.

## Listener And Backfill Incidents

When the deposit listener, confirmation worker, or backfill review surfaces a problem:

1. Confirm the issue is on fixture-backed or Base Sepolia testnet data only.
2. Classify listener errors with the taxonomy in `docs/LISTENER_RETRY_AND_BACKFILL.md`.
3. Treat `retryable` classifications as permission to retry the same bounded listener operation only; do not use retries to advance deposits, mint requests, ORMB mints, or confirmation state.
4. Treat `terminal` classifications as fail-closed input or configuration problems.
5. Treat `manual_review` classifications as a stop point for automatic progression and collect operator review evidence.
6. Run the dry-run backfill command over the suspected block range when relevant.
7. Review matching treasury deposits, unknown wallet events, duplicates, ignored events, and potential actions.
8. Compare reported event keys against existing demo deposits using `(chainId, txHash, logIndex)`.
9. Stop if a reorg, block-hash mismatch, duplicate conflict, invariant violation, or unexpected state transition appears.

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
