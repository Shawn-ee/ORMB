# ORMB

ORMB is a testnet-first, whitelisted stablecoin issuance and enterprise settlement demo.

The project is designed as a portfolio and technical demonstration of stablecoin payment infrastructure patterns relevant to smart contract engineering, API-first financial systems, ledger reconciliation, and security-first development.

## What ORMB Is

- A professional demo of a permissioned stablecoin mint, transfer, and redemption lifecycle.
- A Base Sepolia testnet project.
- A technical showcase for Solidity, TypeScript, Node.js workers, Prisma, PostgreSQL, viem, Hardhat, OpenZeppelin Contracts v5, Next.js, and GitHub Actions.
- A controlled environment for demonstrating enterprise onboarding, mock deposit detection, fixed FX conversion, mint approvals, transfers, redemptions, burn verification, audit logs, and dashboards.

## What ORMB Is Not

- Not a public RMB stablecoin launch.
- Not a real financial product.
- Not a retail trading token.
- Not a custody product.
- Not a production payment system.
- Not authorized to process real customer funds, real USDT, real RMB, private keys, seed phrases, or mainnet assets.

## Current Status

ORMB currently provides a local/testnet demo package with Enterprise Pilot Readiness v1 foundations in progress:

- Testnet-only ORMBToken and MockUSDT contracts.
- Deterministic worker cores for deposit detection, confirmations, risk checks, mint requests, and redemption burn verification.
- Static admin, company, demo-flow, and monitoring dashboards with enterprise risk, reconciliation, audit, and pilot-participant review context.
- Prisma schema for demo lifecycle and audit records.
- Ledger invariant tests, risk case management, dry-run backfill tooling, and worker status helpers.
- API contract docs, worker adapter boundaries, migration runbook, audit retention docs, hosted-demo readiness docs, operator runbook, and incident response runbook.
- Browser smoke checks and screenshot evidence for the static UI, including enterprise admin/company review checks.
- CI validation for typecheck, Prisma validation, unit tests, contract tests, and production build.

The demo intentionally does not include live API routes, persistent worker runners, live RPC polling loops, production payment rails, real custody, live hosted mutations, or real money movement.

## Local Setup

Install dependencies:

```bash
npm ci
```

Run the local app:

```bash
npm run dev
```

Open:

- `http://localhost:3000/`
- `http://localhost:3000/demo`
- `http://localhost:3000/admin`
- `http://localhost:3000/company`
- `http://localhost:3000/status`

Run the full local CI validation:

```bash
npm run test:ci
```

Run production-mode browser smoke checks after installing Playwright Chromium:

```bash
npx playwright install chromium
npm run test:e2e
```

## Commands

```bash
npm run dev
npm run start
npm run build
npm run test
npm run test:e2e
npm run test:contracts
npm run compile:contracts
npm run deploy:contracts
npm run typecheck
npm run lint
npm run prisma:generate
npm run prisma:validate
npm run demo:seed
npm run test:ci
```

Next.js dev/build, worker unit tests, contract compile/test, Prisma generate/validate, and Playwright browser checks are active. `lint` remains a placeholder script.

## App Shell

The current Next.js app shell includes static demo routes:

- `/`: Demo control plane overview.
- `/demo`: Static end-to-end demo flow walkthrough.
- `/admin`: Static admin operations dashboard.
- `/company`: Static company settlement dashboard.
- `/status`: Static monitoring and security readiness dashboard.

These routes intentionally do not include backend business logic, live dashboard data, contract calls, or real money movement.

## Demo Walkthrough

Use `docs/DEMO_SCRIPT.md` and `docs/PORTFOLIO_WALKTHROUGH.md` for the recruiter-facing walkthrough. The expected story is:

1. Establish the safety boundary: testnet-only, mock assets, no customer funds.
2. Show the landing overview and target lifecycle.
3. Walk through `/demo` for the full lifecycle.
4. Show `/admin` for KYB, risk events, mint approvals, reconciliation, and audit logs.
5. Show `/company` for deposit instructions, balances, transfers, and redemptions.
6. Show `/status` for security posture, known watch items, and release gates.
7. Close with known limitations, Enterprise Pilot Readiness boundaries, and next engineering branches.

## Contracts

The current Solidity contracts are testnet demo contracts:

- `ORMBToken`: permissioned ERC-20 demo token with 6 decimals, role-based minting, whitelisted transfers, pause controls, and burn support.
- `MockUSDT`: 6-decimal mock asset with public demo mint/faucet behavior.

These contracts are not deployed to mainnet and do not represent real USDT, real RMB, redemption rights, or a production financial product.

## Environment

Copy `.env.example` for local environment setup only when future branches need network access. The example values are placeholders. Do not commit real private keys, seed phrases, RPC secrets, production credentials, real USDT, or real RMB configuration.

`DATABASE_URL` is documented for local PostgreSQL-backed Prisma development. The current Prisma schema includes ORMB demo ledger models and deterministic worker cores, but no live API server or persistent worker runner is wired yet.

`npm run demo:seed` seeds deterministic demo companies and wallets once a local PostgreSQL database is available.

## Documentation Map

- `docs/PROJECT_CHARTER.md`: Project scope and success criteria.
- `docs/ARCHITECTURE.md`: Target architecture and trust assumptions.
- `docs/ROADMAP.md`: Focused branch roadmap.
- `docs/AGENT_WORKFLOW.md`: Required agent process.
- `docs/BRANCHING_STRATEGY.md`: Branch and merge policy.
- `docs/LONG_RUNNING_CODEX_AGENT_RULES.md`: Long-running autonomous agent operating rules.
- `docs/DEMO_REQUIREMENTS.md`: Demo lifecycle requirements.
- `docs/SECURITY.md`: Security posture and restrictions.
- `docs/LEGAL_BOUNDARIES.md`: Non-production and legal boundaries.
- `docs/DEPLOYMENT.md`: Base Sepolia testnet script guidance and safety boundaries.
- `docs/DEPOSIT_LISTENER.md`: MockUSDT deposit listener behavior and safety boundary.
- `docs/CONFIRMATION_WORKER.md`: Deposit confirmation worker behavior and safety boundary.
- `docs/RISK_ENGINE.md`: Mint eligibility risk checks and safety boundary.
- `docs/MINT_REQUEST_FLOW.md`: Risk-gated mint request lifecycle and safety boundary.
- `docs/REDEMPTION_BURN_FLOW.md`: Redemption request, burn verification, and simulated payout safety boundary.
- `docs/ADMIN_DASHBOARD.md`: Static admin operations dashboard scope and safety boundary.
- `docs/COMPANY_DASHBOARD.md`: Static company settlement dashboard scope and safety boundary.
- `docs/DEMO_FLOW_PAGE.md`: Static end-to-end demo flow page scope and safety boundary.
- `docs/MONITORING_SECURITY.md`: Static monitoring and security readiness dashboard scope.
- `docs/UI_REVIEW.md`: Browser verification notes and screenshot paths.
- `docs/ENTERPRISE_UI_REVIEW.md`: Enterprise browser review for admin/company pilot UI.
- `docs/RELEASE_READINESS.md`: Current release readiness status.
- `docs/DEMO_SCRIPT.md`: Demo-v0 walkthrough script.
- `docs/PORTFOLIO_WALKTHROUGH.md`: Stripe/Bridge-style reviewer walkthrough.
- `docs/KNOWN_LIMITATIONS.md`: Remaining limitations and deferred work.
- `docs/RELEASE_CHECKLIST.md`: Human approval checklist for demo-v0.
- `docs/STRIPE_BRIDGE_ALIGNMENT.md`: Engineering alignment with Stripe/Bridge-style infrastructure.
- `docs/ENTERPRISE_READINESS_REVIEW.md`: Enterprise Pilot Readiness v1 status and blockers.
- `docs/HOSTED_DEMO_READINESS.md`: Read-only hosted demo conditions and boundaries.
- `docs/API_CONTRACTS.md`: Future API contract surface and idempotency requirements.
- `docs/WORKER_ADAPTER_BOUNDARIES.md`: Future worker runner and adapter boundaries.
- `docs/DATABASE_MIGRATION_RUNBOOK.md`: Future migration safety expectations.
- `docs/AUDIT_RETENTION.md`: Audit retention and export assumptions.
- `docs/RUNBOOK.md`: Setup and validation runbook.
- `docs/decisions/`: Architecture decision records.
- `docs/agent-reports/`: Agent reports.
