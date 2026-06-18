# Enterprise Pilot Readiness Roadmap

## Objective

Move ORMB from `demo-v0` to Enterprise Pilot Readiness v1 while keeping it testnet-only, mock-asset-only, no-real-funds, no-mainnet, and non-production.

## Branch Sequence

### 1. `agent/220-ledger-invariant-tests`

Role: Ledger and accounting sub-agent.

Objective: Add deterministic tests and documentation proving demo lifecycle records can reconcile mock deposits, mint requests, mints, burns, and simulated supply.

Dependencies: Current worker core tests and Prisma schema.

Expected files:

- `workers/ledger-invariants.ts`
- `test/workers/ledger-invariants.unit.test.ts`
- `docs/LEDGER_INVARIANTS.md`
- `docs/agent-reports/agent-220-ledger-invariant-tests.md`

Acceptance criteria:

- Demonstrates no duplicate mint accounting for one deposit.
- Demonstrates minted ORMB can be reconciled against mock confirmed deposits and verified burns.
- Documents that invariants are demo-only and not proof of real reserves.

Validation:

- `npm run typecheck`
- `npm run test`
- `npm run test:ci`

### 2. `agent/210-dependency-hardening`

Role: Dependency security sub-agent.

Objective: Recheck dependency advisories, apply only safe non-forced upgrades if available, and update dependency audit docs.

Dependencies: `audit/200` and current lockfile.

Expected files:

- `package.json`
- `package-lock.json`
- `docs/DEPENDENCY_AUDIT.md`
- `docs/agent-reports/agent-210-dependency-hardening.md`

Acceptance criteria:

- No `npm audit fix --force` unless separately justified.
- Full validation passes.
- Remaining findings are clearly accepted or reduced.

Validation:

- `npm install`
- `npm outdated`
- `npm audit --json`
- `npm run test:ci`
- `npm run test:e2e`

### 3. `agent/211-secret-management-hardening`

Role: Secret management sub-agent.

Objective: Add typed environment validation and stronger secret handling docs for local/testnet/hosted-demo modes.

Expected files:

- `.env.example`
- `src/lib/config/env.ts` or `scripts/env-check.ts`
- `test/config/env.unit.test.ts`
- `docs/SECRET_MANAGEMENT.md`
- `docs/agent-reports/agent-211-secret-management-hardening.md`

Acceptance criteria:

- Placeholder secrets remain placeholders.
- Mainnet variables are not introduced.
- Env validation fails closed for missing required demo/testnet variables when scripts need them.

### 4. `audit/214-contract-threat-model`

Role: Smart contract audit sub-agent.

Objective: Produce a focused contract threat model for role admin, minting, whitelisting, pausing, burn behavior, MockUSDT boundaries, and testnet scripts.

Expected files:

- `docs/CONTRACT_THREAT_MODEL.md`
- `docs/SECURITY.md`
- `docs/agent-reports/audit-214-contract-threat-model.md`

### 5. `agent/213-mint-role-runbook-hardening`

Role: Mint operations sub-agent.

Objective: Document minter/hot-wallet assumptions, role separation, emergency pause, key rotation, and manual mint approval process for testnet demo operations.

Expected files:

- `docs/MINT_ROLE_RUNBOOK.md`
- `docs/RUNBOOK.md`
- `docs/SECURITY.md`
- `docs/agent-reports/agent-213-mint-role-runbook-hardening.md`

### 6. `agent/230-listener-reorg-resilience`

Role: Chain reliability sub-agent.

Objective: Add reorg/finality limitations, block hash tracking design, retry/backfill model, and tests for confirmation worker behavior where feasible.

Expected files:

- `docs/CHAIN_REORG_AND_BACKFILL.md`
- `workers/confirmation-worker.ts`
- `test/workers/confirmation-worker.unit.test.ts`
- `docs/agent-reports/agent-230-listener-reorg-resilience.md`

### 7. `agent/240-risk-case-management`

Role: Risk workflow sub-agent.

Objective: Model risk event review statuses and demo-only case management docs without claiming real compliance.

Expected files:

- `docs/RISK_CASE_MANAGEMENT.md`
- Optional worker/test updates if scoped.
- `docs/agent-reports/agent-240-risk-case-management.md`

### 8. `agent/260-enterprise-pilot-playbook`

Role: Enterprise pilot operations sub-agent.

Objective: Add enterprise pilot playbook defining allowed demo pilot scope, participant roles, approval gates, pilot exit criteria, and prohibited real-funds behavior.

Expected files:

- `docs/ENTERPRISE_PILOT_PLAYBOOK.md`
- `docs/LEGAL_BOUNDARIES.md`
- `docs/agent-reports/agent-260-enterprise-pilot-playbook.md`

### 9. `agent/262-operator-runbook`

Role: Operator runbook sub-agent.

Objective: Document local/testnet operator procedures, validation checklist, rollback assumptions, and troubleshooting.

Expected files:

- `docs/OPERATOR_RUNBOOK.md`
- `docs/RUNBOOK.md`
- `docs/agent-reports/agent-262-operator-runbook.md`

### 10. `agent/263-incident-response-runbook`

Role: Incident response sub-agent.

Objective: Add demo/testnet incident response for suspected key exposure, bad mint, wrong whitelist, chain reorg, dependency advisory, or UI disclosure issue.

Expected files:

- `docs/INCIDENT_RESPONSE.md`
- `docs/SECURITY.md`
- `docs/agent-reports/agent-263-incident-response-runbook.md`

### 11. `agent/270-admin-risk-review-ui`

Role: Admin UX sub-agent.

Objective: Improve admin UI explanation of risk review, reconciliation, and manual approval concepts without live mutation behavior.

Validation:

- `npm run test:e2e`
- `npm run test:ci`

### 12. `audit/280-hosted-demo-readiness`

Role: Hosted demo audit sub-agent.

Objective: Document what is required for a safe read-only hosted demo and what remains prohibited.

Expected files:

- `docs/HOSTED_DEMO_READINESS.md`
- `docs/KNOWN_LIMITATIONS.md`
- `docs/agent-reports/audit-280-hosted-demo-readiness.md`

### 13. `agent/290-stripe-bridge-readme-polish`

Role: Portfolio packaging sub-agent.

Objective: Polish portfolio messaging, architecture diagram docs, recruiter walkthrough, and Stripe/Bridge alignment once security/accounting/pilot runbooks are stronger.

### 14. `release/enterprise-pilot-readiness-v1`

Role: Release audit sub-agent.

Objective: Confirm Enterprise Pilot Readiness v1 criteria and produce final human-review package.

## Merge Rules

- Every branch targets `dev`.
- Every branch has one focused PR and one agent report.
- Do not merge if CI fails.
- Do not merge `dev` into `main`.
- Do not force-push `main` or `dev`.
- Do not deploy mainnet or use real funds/secrets.

## Stop Conditions

Stop if real secrets, real funds, mainnet deployment, legal/compliance approval, force-push to protected branches, or unresolved high-risk human approval is required.
