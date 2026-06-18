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

- ORMB smart contracts.
- Backend mint engine.
- Worker logic.
- UI/dashboard logic.
- Real deposit monitoring.
- Real money movement.

The repository now includes a Hardhat, TypeScript, viem, OpenZeppelin, and dotenv tooling foundation for future contract work. `contracts/ToolingPlaceholder.sol` exists only to validate compilation and test execution; it is not ORMB token business logic.

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
npm run test:ci
```

Contract compile and test commands are active for the placeholder Hardhat setup. Non-contract application commands remain placeholders until focused implementation branches replace them.

## Environment

Copy `.env.example` for local environment setup only when future branches need network access. The example values are placeholders. Do not commit real private keys, seed phrases, RPC secrets, production credentials, real USDT, or real RMB configuration.

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
- `docs/STRIPE_BRIDGE_ALIGNMENT.md`: Engineering alignment with Stripe/Bridge-style infrastructure.
- `docs/RUNBOOK.md`: Setup and validation runbook.
- `docs/decisions/`: Architecture decision records.
- `docs/agent-reports/`: Agent reports.
