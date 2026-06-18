# Private Interactive Testnet Staging Gap Analysis

## Branch

`audit/500-private-staging-gap-analysis`

## Objective

Assess the current `dev` branch against Private Interactive Testnet Staging v1 and define the implementation path for an owner-only Base Sepolia staging system.

Private Interactive Testnet Staging v1 means a guarded, owner-only, testnet system where an admin can manually confirm simulated received funds, create and approve mint requests, execute ORMB mints on Base Sepolia, process simulated cashout/redemption requests, execute burns on Base Sepolia, and record every step in `AuditLog`.

It does not mean production launch, public operation, real funds, real USDT, real RMB/CNH, customer deposits, custody, payment processing, real payout, compliance approval, or mainnet deployment.

## Current Machine Readiness

| Area | Current Status |
| --- | --- |
| Node | `v25.8.1`; satisfies the repo `>=22` engine requirement. |
| npm | `11.11.0`. |
| Git | Clean on `dev` before this branch; `origin/dev` at `f65b3bf` before branch creation. |
| Docker | Available: Docker `29.4.2`. |
| Docker Compose | Available: Compose `v5.1.3`. |
| Dependencies | `node_modules` present; `npm ci` was not required during this audit pass. |
| CI validation | `npm run test:ci` passed on current `dev`. |
| Browser validation | `npm run test:e2e` passed with 16 Playwright checks. |
| Build validation | `npm run build` passed. |
| Dependency audit | `npm audit --json` reports 25 findings: 8 low, 9 moderate, 8 high, 0 critical. |
| Local services | No repo-managed PostgreSQL service exists yet. |
| Secrets | No `.env` or real secrets were created, modified, inspected, or required. |

## Current Project Readiness

ORMB has reached Enterprise Pilot Readiness v1 as a human-review discussion package. The repository includes:

- Base Sepolia-oriented ORMBToken and MockUSDT contracts.
- Testnet-only Hardhat deploy, whitelist, and manual mint scripts.
- Prisma schema for companies, wallets, deposits, FX quotes, mint requests, mints, redemptions, audit logs, worker state, and risk events.
- Deterministic worker cores for deposit processing, confirmations, risk checks, mint request flow, redemption burn flow, ledger invariants, backfill, listener taxonomy, risk cases, and worker status.
- Static Next.js admin/company/demo/status pages.
- Playwright coverage for static routes, safety copy, navigation, admin readiness concepts, and company readiness concepts.
- Extensive runbooks and readiness documentation.

The repository does not yet include:

- Docker PostgreSQL support committed to the repo.
- Prisma migrations for a private staging database lifecycle.
- A `private-staging` environment validation mode in `src/lib/config/env.ts`.
- Private staging Basic Auth proxy guard for `/admin`, `/api/admin/**`, and `/api/staging/**`.
- Protected mutation API routes.
- Persistent Prisma adapters for the existing worker-core interfaces.
- Manual simulated deposit schema fields and worker core exist; protected API and admin UI integration remain future work.
- Database-backed admin staging UI.
- Testnet mint/burn gateway integrations for the web app.
- Minter-role grant/verification script for a staging minter wallet.
- Private staging Nginx/systemd deployment runbook.

## Readiness Level Assessment

| Level | Current Status | Gap To Private Interactive Staging |
| --- | --- | --- |
| Local demo | Ready for human review | Needs Docker PostgreSQL, migrations, seeds, and database-backed flows. |
| Stripe/Bridge portfolio demo | Ready for human review | No staging blocker; narrative must remain claim-limited. |
| Hosted read-only demo | Conditional | Must stay read-only and must not expose staging mutation routes. |
| Private interactive testnet staging | Not ready | Needs guarded mutation APIs, env validation, DB persistence, Base Sepolia mint/burn gateways, and operator UI. |
| Production readiness | Not ready and out of scope | Private staging must not add production claims or real-funds behavior. |

## Environment Architecture Gap

Current environment modes are:

- `local`
- `testnet-script`
- `hosted-demo`
- `private-staging`

Private staging requires a distinct `private-staging` mode because `hosted-demo` is intentionally read-only and rejects deployer, minter, and burner keys.

Current and required future behavior:

- `local`: PostgreSQL-backed local development with no required testnet keys.
- `hosted-demo`: static/read-only only; no private keys and no mutation APIs.
- `testnet-script`: one-off Base Sepolia deploy/admin scripts with explicit confirmation.
- `private-staging`: owner-only interactive staging with Basic Auth, PostgreSQL, Base Sepolia RPC, deployed contract addresses, and staging minter/burner keys. This branch adds strict environment validation only; mutation APIs, admin access middleware, persistent adapters, and on-chain gateways remain future branches.

Required env values for `private-staging` validation:

```env
ORMB_ENV_MODE=private-staging
DATABASE_URL=
BASE_SEPOLIA_RPC_URL=
BASE_SEPOLIA_CHAIN_ID=84532
ORMB_CONTRACT_ADDRESS=
BASE_SEPOLIA_MINTER_PRIVATE_KEY=
BASE_SEPOLIA_BURNER_PRIVATE_KEY=
STAGING_BASIC_AUTH_USERNAME=
STAGING_BASIC_AUTH_PASSWORD=
```

Validation requires `BASE_SEPOLIA_CHAIN_ID=84532` exactly and rejects mainnet-like chain IDs such as Ethereum mainnet `1` and Base mainnet `8453`. `ORMB_CONFIRM_TESTNET_DEPLOY=YES` remains specific to `testnet-script` mode and is not required by this validation-only private staging branch. All values must remain local or server environment values only. `.env.example` must stay placeholder-only.

## Docker And PostgreSQL Gap

Docker and Compose are available on this machine, but the repo has no Compose file. The next environment branch should add:

- `docker-compose.yml` with a local PostgreSQL service, named volume, fixed local port, and healthcheck.
- npm scripts for migration, reset, seed, and inspection.
- Documentation for local reset versus private staging migration deploy.
- Seed data for owner-only staging fixtures.

Private staging must use `prisma migrate deploy`; local development may use `prisma migrate dev` and destructive reset commands only against local Docker databases.

## Base Sepolia On-Chain Gap

Contracts and Base Sepolia scripts exist, but private staging needs additional owner-only workflow support:

- Script to grant and verify `MINTER_ROLE` for a dedicated staging minter wallet.
- Deployment verification script for chain ID, bytecode, token metadata, role membership, whitelist state, and total supply.
- Runtime mint gateway boundary exists for Base Sepolia chain, amount, role, whitelist, and `ORMB.mint()` preflight; wiring it to a staging wallet/API remains future work.
- Runtime burn evidence boundary exists for Base Sepolia chain, event identity, source wallet, and amount validation; wiring it to a staging API/UI remains future work.
- API and worker tests that mock gateways and never require real RPC keys in CI.

All on-chain execution must hard-check Base Sepolia chain ID `84532`.

## Private Admin Access Status

The app now has a private staging Basic Auth proxy guard. Private staging must not rely on a hidden URL.

Current controls:

- Basic Auth proxy guard activates only when `ORMB_ENV_MODE=private-staging`.
- `/admin`, `/api/admin/**`, and `/api/staging/**` require staging Basic Auth in private staging.
- Local and hosted-demo modes keep the static read-only admin page browsable for demo review.
- Invalid private staging configuration fails closed before serving protected routes.

Required future controls:

- Mutation routes must also require same-origin checks and an explicit staging admin header.
- Future company participant mutation routes must receive a separate access policy before they are added.
- Hosted read-only demo mode must reject mutation routes and private keys.

## Manual Deposit To Mint Gap

Current worker cores can create mint requests and submit approved mints through abstract repository/gateway interfaces. The manual simulated deposit branch adds Prisma fields for owner-confirmed staging deposits and a worker core that creates a simulated confirmed deposit, records audit events, and creates a pending mint request through the existing risk and mint-request core.

Remaining missing pieces:

- Persistent Prisma repository adapter.
- Protected API routes for manual deposit creation, mint request approval, and mint submission.
- Admin UI forms and status panels.
- Database-backed AuditLog records for manual deposit, mint request creation, approval, submission, failure, and idempotent skips.
- Mocked gateway tests and browser checks.

Safety requirement: manual deposits are simulated staging records only and must never be described as real USDT, real funds, customer deposits, or RMB/CNH backing.

## Redemption/Cashout To Burn Gap

Current worker cores model redemption request, approval, burn verification, payout simulation, and completion. A Base Sepolia burn evidence boundary now validates chain, event identity, source wallet, and amount before the core consumes burn evidence.

Remaining missing pieces:

- Protected API routes for redemption creation, approval, returned-ORMB verification, burn execution, and simulated payout completion.
- Persistent Prisma adapter.
- Runtime API/UI wiring for the burn evidence boundary or a redeem-wallet balance verification path.
- Admin UI controls that clearly say payout is simulated only.
- AuditLog records for every state transition.
- Reconciliation tests proving duplicate burns and premature payout completion fail closed.

Safety requirement: cashout/redemption is a simulation boundary only. No real payout, custody, payment processing, banking, or RMB/CNH settlement may be introduced.

## Reconciliation Dashboard Gap

Current ledger invariant logic exists, but private staging needs a database-backed dashboard:

- Manual deposits by source and status.
- Mint requests and mint records with tx hashes.
- Redemption and burn records.
- On-chain total supply reader.
- Expected supply calculation.
- Simulated reserve ledger.
- Mismatch warnings and stop states.

Warnings should block operator confidence if deposits, mints, burns, or redemptions diverge.

## Multi-Machine Gap

The repo has branch/runbook docs, but owner multi-machine development needs a dedicated current runbook:

- GitHub is source of truth.
- Each machine uses its own `.env.local`.
- Each machine uses its own local PostgreSQL data volume.
- Branches are one task per machine.
- Pull latest `dev` before branching.
- Server updates pull reviewed `dev`, run migrations, build, restart.
- Never force-push `main` or `dev`.

## Recommended Branch Order

1. `agent/520-local-docker-postgres-dev-env`
2. `agent/530-multi-machine-dev-runbook`
3. `agent/506-staging-env-validation`
4. `agent/501-admin-access-guard`
5. `agent/502-manual-deposit-flow`
6. `agent/503-testnet-mint-execution`
7. `agent/504-redemption-cashout-flow`
8. `agent/505-staging-reconciliation-dashboard`
9. `agent/507-staging-runbook`
10. `audit/508-private-staging-security-review`
11. `release/510-private-interactive-testnet-staging-v1`

`agent/520` and `agent/530` may run in parallel after this audit if they keep file ownership disjoint. All environment, access guard, mutation API, on-chain, redemption, reconciliation, security, and release branches should run sequentially.

## Stop Conditions

Stop implementation if any branch requires:

- real funds
- real USDT
- real RMB/CNH
- mainnet
- real payout
- custody
- payment processing
- customer data
- committed secrets
- hidden URL as the only access control
- bypassing failing CI
- `npm audit fix --force`
- force-push to `main` or `dev`
- misleading legal/compliance/production wording

## Audit Verdict

The machine is technically ready to begin Private Interactive Testnet Staging v1 implementation work. Docker, Compose, Node, npm, Git, CI validation, browser validation, build validation, and contract tests are available.

The project is not yet ready for private interactive staging. The next work should start with Docker/PostgreSQL support and multi-machine runbook work, then proceed into environment validation and access control before any mutation API or testnet mint/burn execution is added.
