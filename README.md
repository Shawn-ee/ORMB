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

## Bootstrap Status

This initial repository bootstrap intentionally does not implement:

- Backend mint engine.
- Worker logic.
- UI/dashboard logic.
- Real deposit monitoring.
- Real money movement.

The repository now includes a Hardhat, TypeScript, viem, OpenZeppelin, Prisma, PostgreSQL, Next.js, React, and dotenv tooling foundation for future contract, ledger, and dashboard work. It also includes testnet-only ORMBToken and MockUSDT contracts for the demo lifecycle.

The repository currently provides project structure, documentation, agent workflow rules, placeholder scripts, and minimal CI.

## Placeholder Commands

```bash
npm run dev
npm run build
npm run test
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

Next.js dev/build, contract compile/test, and Prisma generate/validate commands are active for the placeholder tooling setup. App tests and lint remain placeholders until focused implementation branches replace them.

## App Shell

The current Next.js app shell includes placeholder routes:

- `/`: Demo control plane overview.
- `/admin`: Static admin operations dashboard.
- `/company`: Company workspace placeholder.
- `/status`: System readiness placeholder.

These routes intentionally do not include backend business logic, live dashboard data, contract calls, or real money movement.

## Contracts

The current Solidity contracts are testnet demo contracts:

- `ORMBToken`: permissioned ERC-20 demo token with 6 decimals, role-based minting, whitelisted transfers, pause controls, and burn support.
- `MockUSDT`: 6-decimal mock asset with public demo mint/faucet behavior.

These contracts are not deployed to mainnet and do not represent real USDT, real RMB, redemption rights, or a production financial product.

## Environment

Copy `.env.example` for local environment setup only when future branches need network access. The example values are placeholders. Do not commit real private keys, seed phrases, RPC secrets, production credentials, real USDT, or real RMB configuration.

`DATABASE_URL` is documented for local PostgreSQL-backed Prisma development. The current Prisma schema includes ORMB demo ledger models, but no worker or API behavior is implemented yet.

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
- `docs/STRIPE_BRIDGE_ALIGNMENT.md`: Engineering alignment with Stripe/Bridge-style infrastructure.
- `docs/RUNBOOK.md`: Setup and validation runbook.
- `docs/decisions/`: Architecture decision records.
- `docs/agent-reports/`: Agent reports.
