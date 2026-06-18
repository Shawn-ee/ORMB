# ORMB Long-Running Codex Agent Rules

## Purpose

This document defines the long-running autonomous agent workflow for the ORMB repository.

Codex must treat this file as the highest-level operating guide for the ORMB project, together with:

- `AGENTS.md`
- `README.md`
- `docs/PROJECT_CHARTER.md`
- `docs/ARCHITECTURE.md`
- `docs/ROADMAP.md`
- `docs/AGENT_WORKFLOW.md`
- `docs/BRANCHING_STRATEGY.md`
- `docs/DEMO_REQUIREMENTS.md`
- `docs/SECURITY.md`
- `docs/LEGAL_BOUNDARIES.md`
- `docs/STRIPE_BRIDGE_ALIGNMENT.md`
- `docs/RUNBOOK.md`

The goal is to let Codex work for an extended session, potentially overnight, while keeping the project safe, professional, testable, and aligned with a Stripe/Bridge-style stablecoin infrastructure engineering portfolio project.

---

# 1. Final Project Goal

Build **ORMB** into a professional, testnet-only, whitelisted stablecoin issuance and enterprise settlement demo.

The final demo should show the engineering infrastructure behind a stablecoin/payment platform:

- Smart contracts
- Whitelisted wallets
- Mock USDT deposit detection
- Confirmation handling
- FX quote calculation
- Mint request lifecycle
- Manual approval
- ORMB minting
- Enterprise-to-enterprise ORMB transfer
- Redemption/burn flow
- Audit logs
- Risk checks
- Admin dashboard
- Company dashboard
- System status page
- Demo flow page
- CI, tests, and documentation

This is a **portfolio-quality technical demo**, not a public financial product.

---

# 2. Product Positioning

ORMB must always be described as:

> A testnet-only, whitelisted enterprise settlement token demo for stablecoin mint/redeem, payment, ledger, monitoring, and audit workflows.

ORMB is **not**:

- A real RMB stablecoin
- A real CNH stablecoin
- A public stablecoin launch
- A retail token
- A production financial product
- A money transmission product
- A public exchange product
- A real customer funds system
- A China personal FX tool

The project may use ORMB as a demo token name, but all documentation and UI must clearly state:

- Testnet only
- Mock assets only
- No real funds
- No public issuance
- No legal stablecoin claim
- No real RMB/CNH/USDT handling

---

# 3. Technical Stack

The intended stack is:

- Next.js
- TypeScript
- Node.js workers
- Prisma
- PostgreSQL
- viem
- Solidity
- Hardhat
- OpenZeppelin Contracts v5
- Base Sepolia
- GitHub Actions CI

Initial target chain:

- Base Sepolia

Initial target assets:

- MockUSDT
- ORMB

No mainnet deployment may occur without explicit human approval.

---

# 4. Product Quality Reference

The app should feel like serious fintech infrastructure.

Use these as product-quality inspiration:

- Stripe-style dashboard clarity
- Bridge-style stablecoin API/infrastructure framing
- Circle-style mint/redeem workflow clarity
- Coinbase Prime-style institutional dashboard seriousness

Do **not** copy protected branding, UI text, proprietary flows, logos, or design.

The app should not look like a meme coin website.

---

# 5. Hard Safety Boundaries

These rules are mandatory.

Codex must never:

1. Commit secrets.
2. Commit private keys.
3. Commit seed phrases.
4. Commit real RPC keys.
5. Commit production credentials.
6. Use real USDT.
7. Use real RMB.
8. Use real CNH.
9. Use real customer funds.
10. Deploy mainnet contracts.
11. Remove testnet-only disclaimers.
12. Make public stablecoin launch claims.
13. Make legal claims that ORMB is a regulated RMB/CNH stablecoin.
14. Force-push `main` or `dev` unless explicitly approved by the human owner.
15. Merge `dev` into `main` without explicit human approval.
16. Bypass failing CI.
17. Fake validation results.
18. Continue if a task requires real funds or secrets.

If any task requires secrets, Codex must:

- Add `.env.example`
- Document required variables
- Stop before using real credentials
- Report the blocker clearly

---

# 6. Branch Model

The repository uses this branch model:

- `main` = stable demo branch
- `dev` = integration branch
- `agent/*` = focused implementation branches
- `audit/*` = audit/review/security branches
- `release/*` = release preparation branches

Rules:

- All implementation work starts from latest `origin/dev`.
- Every branch must have one focused goal.
- Every branch opens a PR into `dev`.
- Agent branches may be merged into `dev` when checks pass.
- `dev` must not be merged into `main` without explicit human approval.
- High-risk modules require audit before release.
- Every behavior change must update docs.
- Every branch must write an agent report.

---

# 7. GitHub PR Rules

For every branch:

1. Create branch from latest `origin/dev`.
2. Implement only the scoped task.
3. Run relevant validation.
4. Self-review the diff.
5. Fix in-scope issues.
6. Write agent report.
7. Push branch.
8. Open PR into `dev`.
9. Inspect PR checks.
10. Merge into `dev` only if allowed and checks pass.
11. Sync local `dev`.
12. Continue to next planned branch if unblocked.

If GitHub CLI is authenticated, use it to create PRs.

If GitHub CLI is unavailable, push the branch and provide a manual compare URL.

---

# 8. Force Push Rule

Force-push is forbidden on:

- `main`
- `dev`

unless the human owner explicitly approves it.

Force-push may be used on personal feature branches only when necessary and safe, but normal commits are preferred.

---

# 9. Agent Report Requirement

Every branch must create:

```text
docs/agent-reports/<branch-name>.md
```

The report must include:

- Phase name
- Branch name
- Agent role
- Objective
- Non-goals
- Acceptance criteria
- Files changed
- Validation commands run
- Validation results
- Self-review findings
- Improvements applied
- Remaining risks
- Follow-up tasks
- Next recommended branch
- Whether PR was opened
- Whether PR was merged into `dev`

Do not mark validation as passed unless the command actually passed.

---

# 10. Self-Review and Iteration Loop

After completing a branch, Codex must perform a self-review before opening or merging the PR.

Self-review checklist:

1. Re-read branch goal.
2. Re-read acceptance criteria.
3. Inspect `git diff origin/dev`.
4. Confirm no unrelated modules were changed.
5. Confirm no secrets were added.
6. Confirm no real funds/mainnet defaults were added.
7. Confirm tests were added or updated where appropriate.
8. Confirm docs were updated for behavior changes.
9. Confirm validation commands ran.
10. Confirm agent report is complete.
11. Identify material improvements.

Codex may perform up to **two self-review improvement passes** per branch.

An improvement is valid only if it is:

- Material
- Testable
- In-scope
- Tied to acceptance criteria, correctness, security, tests, docs accuracy, or demo usability

Codex must not endlessly refactor, restyle, rename, or polish subjective details.

After two self-review passes, if the branch is still not clean, Codex must document the blocker and stop that branch.

---

# 11. Autonomous Continuation Rule

Codex should not stop after a single branch if the next branch is clear and unblocked.

After merging a branch into `dev`, Codex must:

1. Sync latest `origin/dev`.
2. Read the roadmap and agent reports.
3. Select the next highest-value branch.
4. Create the next branch from latest `dev`.
5. Continue.

Codex should continue autonomously until one of these stop conditions is met:

- `release/demo-v0` is prepared and waiting for human approval
- A safety boundary requires human approval
- A real secret/key/fund is required
- Mainnet deployment would be required
- CI fails after two focused fix attempts
- Git history would require force-push to `main` or `dev`
- The next step is ambiguous and could cause unsafe scope drift
- Only subjective polishing remains

---

# 12. Next Goal Generation

At the end of each branch, the agent must recommend the next branch.

The recommendation must include:

- Branch name
- Agent role
- Objective
- Why it is the next highest-value task
- Dependencies
- Acceptance criteria
- Validation commands

If the next branch exists in `docs/ROADMAP.md`, use it.

If the roadmap is incomplete, generate the next branch from the final `demo-v0` requirements.

If multiple tasks are possible, prioritize:

1. Broken CI / repo health
2. Tooling dependencies
3. Smart contract correctness
4. Database/ledger correctness
5. Deposit detection
6. Confirmation handling
7. Risk checks
8. Mint lifecycle
9. Redemption lifecycle
10. Dashboards
11. Security audits
12. Demo polish

---

# 13. High-Risk Modules

The following are high-risk:

- Smart contracts
- Mint engine
- Deposit listener
- Redemption flow
- Private key handling
- Wallet/custody logic
- Legal/safety wording
- Mainnet or real asset logic

High-risk modules may be implemented in `agent/*` branches and merged into `dev` if tests pass, but they must trigger a follow-up `audit/*` branch before release.

---

# 14. Agent Roles

Codex may act as different agent roles depending on branch scope.

## 14.1 Bootstrap Agent

Purpose:

- Establish project structure
- Establish docs
- Establish workflow
- Establish CI
- Establish repo rules

Output:

- Documentation
- Package scripts
- Folder structure
- Agent reports

## 14.2 Tooling Agent

Purpose:

- Set up Hardhat
- Set up Prisma
- Set up Next.js
- Set up TypeScript
- Set up viem
- Set up tests and CI

Output:

- Working development tooling
- Validation commands
- Tooling docs

## 14.3 Contract Agent

Purpose:

- Build ORMBToken
- Build MockUSDT
- Add Solidity tests
- Add deploy scripts

Output:

- Secure, tested contracts

## 14.4 Ledger Agent

Purpose:

- Design Prisma schema
- Model internal ledger state machine
- Add seed scripts
- Add DB validation

Output:

- Prisma models
- Migrations
- Demo seed data

## 14.5 Chain Listener Agent

Purpose:

- Detect MockUSDT deposits
- Process events idempotently
- Track latest indexed block
- Create deposits and audit logs

Output:

- Deposit listener worker
- Event processing tests

## 14.6 Confirmation Agent

Purpose:

- Handle block confirmations
- Move deposits through state machine
- Avoid premature minting

Output:

- Confirmation worker
- Tests

## 14.7 Risk Agent

Purpose:

- Enforce KYB, wallet, limits, duplicate, and safety checks

Output:

- Risk engine
- Tests
- Risk docs

## 14.8 Mint Flow Agent

Purpose:

- Create mint requests
- Require admin approval
- Call ORMB mint
- Save mint transaction
- Write audit logs

Output:

- Mint request lifecycle
- Contract interaction
- Tests

## 14.9 Redemption Agent

Purpose:

- Build burn/redeem lifecycle
- Verify burns
- Simulate payout completion
- Track redemption states

Output:

- Redemption flow
- Tests
- Audit logs

## 14.10 UI Agent

Purpose:

- Build admin dashboard
- Build company dashboard
- Build system status page
- Build guided demo flow page

Output:

- Professional fintech UI

## 14.11 Security Auditor Agent

Purpose:

- Review contracts
- Review mint flow
- Review listener idempotency
- Review secrets
- Review legal/safety wording
- Review CI

Output:

- Security review report
- Fix branches if needed

## 14.12 Demo Release Agent

Purpose:

- Prepare `demo-v0`
- Polish README
- Add demo script
- Add deployment guide
- Polish Stripe/Bridge alignment docs

Output:

- Release branch
- Final demo checklist

---

# 15. Execution Roadmap

Codex should work through this roadmap.

## Phase 1 — Tooling Foundation

### 1. `agent/tooling-prisma-postgres`

Goal:

Add Prisma + PostgreSQL tooling foundation.

Scope:

- Install/configure Prisma
- Add `prisma/schema.prisma`
- Use `DATABASE_URL`
- Add Prisma package scripts
- Add `src/lib/db/prisma.ts` if appropriate
- Update README and architecture docs

Non-goals:

- No business schema yet unless explicitly scoped
- No deposit listener
- No mint engine
- No UI

Validation:

- `npm install`
- `npm run prisma:generate`
- `npm run prisma:validate`
- `npm run test:ci`

---

### 2. `agent/tooling-nextjs-app-shell`

Goal:

Add Next.js app shell.

Scope:

- Landing page placeholder
- Admin route placeholder
- Company route placeholder
- System status route placeholder
- Basic layout/navigation

Non-goals:

- No real business UI
- No backend logic
- No contract changes

Validation:

- `npm run build`
- `npm run typecheck`
- `npm run test:ci`

---

### 3. `audit/dependency-audit`

Goal:

Analyze dependency vulnerabilities without unsafe forced upgrades.

Scope:

- Run `npm audit --json`
- Classify dev/runtime risk
- Recommend safe upgrades
- Create `docs/DEPENDENCY_AUDIT.md`

Non-goals:

- No `npm audit fix --force` unless explicitly justified and validated

Validation:

- `npm install`
- `npm run test:ci`

---

# Phase 2 — Smart Contracts

### 4. `agent/010-contracts-ormb-mockusdt`

Goal:

Implement ORMBToken and MockUSDT.

ORMBToken requirements:

- ERC20
- Name: `Offshore RMB Token`
- Symbol: `ORMB`
- Decimals: 6
- AccessControl
- `MINTER_ROLE`
- `PAUSER_ROLE`
- `WHITELIST_ADMIN_ROLE`
- Whitelist mapping
- `setWhitelisted(address,bool)`
- `mint(address,uint256)` only `MINTER_ROLE`
- Mint only to whitelisted addresses
- Normal transfers only between whitelisted addresses
- Burn support
- Pause/unpause
- Events for whitelist updates

MockUSDT requirements:

- ERC20
- Decimals: 6
- Demo faucet/mint

Tests:

- Non-minter cannot mint
- Minter can mint to whitelisted wallet
- Cannot mint to non-whitelisted wallet
- Whitelisted transfer succeeds
- Transfer to non-whitelisted wallet fails
- Pause blocks transfer
- Burn reduces totalSupply
- MockUSDT faucet/mint works

Validation:

- `npm run compile:contracts`
- `npm run test:contracts`
- `npm run test:ci`

---

### 5. `agent/011-contract-deploy-scripts`

Goal:

Add testnet deployment scripts.

Scope:

- Deploy MockUSDT and ORMB
- Add whitelist script
- Add manual mint script for testnet only
- Add deployment docs
- Use `.env.example` placeholders only

Non-goals:

- No real keys
- No mainnet deploy

Validation:

- `npm run compile:contracts`
- `npm run test:contracts`
- `npm run test:ci`

---

# Phase 3 — Ledger / Domain Schema

### 6. `agent/020-domain-schema`

Goal:

Implement Prisma business schema for ORMB ledger.

Models:

- Company
- CompanyWallet
- Deposit
- FxQuote
- MintRequest
- Mint
- Redemption
- AuditLog
- SystemJobState
- RiskEvent if appropriate

Requirements:

- Clear status enums
- Unique constraint for `chainId + txHash + logIndex` on deposits
- Audit log table
- Seed demo company script

Validation:

- `npm run prisma:generate`
- `npm run prisma:validate`
- `npm run test:ci`

---

# Phase 4 — Deposit Monitoring

### 7. `agent/030-deposit-listener`

Goal:

Implement MockUSDT deposit listener.

Requirements:

- Scan ERC20 Transfer events
- Filter to treasury address
- Match `fromAddress` to known `CompanyWallet`
- Save Deposit idempotently using `chainId + txHash + logIndex`
- Unknown wallet deposits must never mint
- Create AuditLog entries
- Track latest indexed block in SystemJobState

Tests:

- Matching deposit saved
- Duplicate log not saved twice
- Unknown wallet marked review/rejected
- Wrong treasury ignored

---

### 8. `agent/040-confirmation-worker`

Goal:

Implement confirmation handling.

Requirements:

- Check current block
- Calculate confirmations
- Mark `detected → confirming → confirmed`
- Configurable `REQUIRED_CONFIRMATIONS`
- Audit logs for state changes

Tests:

- No confirmation before threshold
- Confirmed after threshold
- Idempotent reruns

---

# Phase 5 — Risk and Mint Lifecycle

### 9. `agent/050-risk-engine`

Goal:

Implement risk checks.

Rules:

- Company KYB must be APPROVED
- Source wallet must be known/active
- Receiving wallet must be whitelisted
- Deposit must be confirmed
- Deposit must not already be minted
- Amount must be under `AUTO_MINT_LIMIT`
- Daily mint limit enforced if configured
- Unknown wallets never mint

Tests required.

---

### 10. `agent/060-mint-request-flow`

Goal:

Implement mint request lifecycle.

Flow:

1. Confirmed deposit passes risk checks.
2. Fixed `USDT_CNH_RATE` creates FxQuote.
3. ORMB amount = MockUSDT amount × rate.
4. Create MintRequest.
5. Manual admin approval required for MVP.
6. Approved request calls `ORMB.mint`.
7. Save Mint tx hash.
8. Update statuses.
9. Write audit logs.

Tests:

- Deposit creates mint request
- Duplicate deposit does not create duplicate mint
- Unapproved request does not mint
- Approved request mints once
- Failed mint records error safely

---

# Phase 6 — Redemption / Burn Lifecycle

### 11. `agent/070-redemption-burn-flow`

Goal:

Implement redemption flow.

Requirements:

- Company creates redemption request
- ORMB burn or transfer-to-redeem-wallet flow
- Worker verifies burn/return transaction
- Admin marks payout simulated/completed
- Redemption updates ledger and audit logs

Tests:

- Redemption request created
- Burn verified
- Payout status updated
- Cannot redeem more than balance
- Duplicate burn not processed twice

---

# Phase 7 — UI / Dashboard

### 12. `agent/080-admin-dashboard`

Goal:

Build admin dashboard.

Pages:

- Companies
- Company wallets
- Deposits
- Mint requests
- Mints
- Redemptions
- Audit logs
- Risk events
- System status

Actions:

- Approve KYB
- Add wallet
- Whitelist wallet
- Approve mint request
- Mark payout completed

Design:

- Professional fintech infrastructure dashboard
- Stripe/Bridge/Circle-inspired quality
- No copied branding

---

### 13. `agent/090-company-dashboard`

Goal:

Build company dashboard.

Pages:

- Deposit instructions
- Wallet status
- ORMB balance
- Deposit history
- Mint status
- Transfer guidance
- Redemption request
- Transaction history

Must clearly show testnet-only disclaimers.

---

### 14. `agent/100-demo-flow-page`

Goal:

Build guided demo page.

Flow:

- Seed demo companies
- Faucet MockUSDT
- Simulate or perform deposit
- Show deposit detected
- Approve mint
- Show ORMB minted
- Transfer ORMB to another company
- Redeem/burn
- Show audit trail

The demo must be easy to show to recruiters.

---

# Phase 8 — Monitoring / Security / Demo Polish

### 15. `agent/110-monitoring-security`

Goal:

Add monitoring and safety features.

Requirements:

- Listener health
- Latest indexed block
- Pending deposit count
- Daily minted total
- Anomalous mint warning
- Unknown wallet deposit warning
- Pause runbook
- SECURITY.md updates
- LEGAL_BOUNDARIES.md updates

---

### 16. `audit/120-full-security-review`

Goal:

Review the whole project for security and compliance boundary issues.

Check:

- Secrets not committed
- No mainnet defaults
- No real money wording
- No fake production claims
- Mint role safety
- Whitelist enforcement
- Idempotency
- Audit logs
- Tests

Output:

- `docs/agent-reports/audit-120-full-security-review.md`
- `docs/SECURITY_REVIEW.md`

---

### 17. `audit/130-full-demo-verification`

Goal:

Run full end-to-end validation.

Run:

- `npm install`
- `npm run lint`
- `npm run typecheck`
- `npm run prisma:generate`
- `npm run prisma:validate`
- `npm run test:contracts`
- `npm run test`
- `npm run test:ci`

Verify:

- Contracts compile
- Tests pass
- Prisma validates
- App builds
- Demo flow works
- Docs updated

Output:

- `docs/agent-reports/audit-130-full-demo-verification.md`

---

### 18. `release/demo-v0`

Goal:

Prepare demo-v0 release branch.

Scope:

- README polish
- Screenshots or screenshot placeholders
- Demo script
- Deployment guide
- Stripe/Bridge alignment doc polish
- Known limitations
- Final checklist

Do not merge to `main` unless explicitly approved by the human owner.

---

# 16. Final Demo Requirements

`demo-v0` is ready only when all of these are true:

- Base Sepolia-ready contract tooling
- MockUSDT and ORMB deployable
- Prisma ledger works
- Deposit listener works on MockUSDT Transfer events
- Deposits are idempotent
- Confirmation worker works
- Risk checks work
- Confirmed deposits create mint requests
- Admin can approve mint request
- ORMB mints to whitelisted company wallet
- ORMB can transfer between whitelisted company wallets
- Redemption/burn flow works
- Audit logs show full lifecycle
- Admin dashboard usable
- Company dashboard usable
- System status visible
- Guided demo flow works
- CI passes
- README explains setup and demo
- SECURITY.md clearly states testnet-only/no real funds
- LEGAL_BOUNDARIES.md avoids public stablecoin claims
- STRIPE_BRIDGE_ALIGNMENT.md explains relevance to stablecoin infrastructure engineering

---

# 17. Validation Discipline

For every branch, Codex must run relevant validation and record exact command results.

Common commands:

```bash
npm install
npm run lint
npm run typecheck
npm run prisma:generate
npm run prisma:validate
npm run compile:contracts
npm run test:contracts
npm run test
npm run test:ci
```

If a command does not exist, Codex must either:

- Add it if in scope, or
- Report that it is unavailable and explain why

Codex must never claim a command passed unless it actually passed.

---

# 18. Dependency Audit Rule

If `npm install` reports vulnerabilities, Codex must not blindly run:

```bash
npm audit fix --force
```

Instead, Codex should:

1. Run `npm audit --json`.
2. Classify vulnerabilities.
3. Determine dev/runtime exposure.
4. Recommend safe upgrades.
5. Add or update `docs/DEPENDENCY_AUDIT.md`.
6. Only apply fixes that do not break tooling.
7. Re-run validation.

---

# 19. Environment Variable Rules

All environment variables must be documented in `.env.example`.

Allowed placeholders:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ormb"
CHAIN_ID="84532"
RPC_URL="https://base-sepolia.example"
TREASURY_ADDRESS="0x0000000000000000000000000000000000000000"
ORMB_CONTRACT_ADDRESS="0x0000000000000000000000000000000000000000"
MOCK_USDT_CONTRACT_ADDRESS="0x0000000000000000000000000000000000000000"
MINTER_PRIVATE_KEY=""
REQUIRED_CONFIRMATIONS="10"
AUTO_MINT_LIMIT_USDT="1000"
DAILY_MINT_LIMIT_USDT="5000"
USDT_CNH_RATE="7.20"
```

Never commit real values.

---

# 20. Stop Conditions

Codex must stop and report if:

- A real secret/key is required
- A real fund transfer is required
- Mainnet deployment is required
- Real USDT/RMB/CNH would be involved
- CI fails after two focused fix attempts
- Git history requires force-push to `main` or `dev`
- The next step is ambiguous and unsafe
- Only subjective polishing remains
- The human owner’s approval is required

---

# 21. Final Command for Codex

When instructed to begin long-running work, Codex should follow this command:

```text
Start now. Continue autonomously through the roadmap and self-generated next goals for as long as possible. Work in small focused branches, validate each branch, self-review each branch, merge safe passing branches into dev, create audit branches for high-risk modules, and stop only when blocked, when release/demo-v0 is ready for human approval, or when no material testable in-scope improvement remains.
```

---

# 22. One-Sentence Mission

Build ORMB into a professional, safe, testnet-only, whitelisted stablecoin infrastructure demo that proves the engineering lifecycle of stablecoin minting, transfer, redemption, monitoring, auditability, and dashboarding without touching real funds or making real stablecoin issuance claims.
