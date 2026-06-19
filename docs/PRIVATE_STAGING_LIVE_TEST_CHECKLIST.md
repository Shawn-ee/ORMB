# Private Staging Live Test Checklist

## Scope

This checklist prepares the owner to run an owner-only Base Sepolia private staging test. It does not perform the live test and does not authorize production, public access, mainnet, real funds, real USDT, real RMB/CNH, custody, customer data, banking, or payment processing.

## Current Capability Snapshot

Available today:

- Local Docker PostgreSQL and Prisma migration workflow.
- Strict private staging environment validation.
- Basic Auth guard for `/admin`, `/api/admin/**`, and `/api/staging/**`.
- Manual simulated deposit worker core with idempotency by `manualReference`.
- Base Sepolia mint gateway boundary and manual mint script.
- Base Sepolia burn evidence validation boundary.
- Redemption state machine with manual approval, burn verification, duplicate burn protection, simulated payout, and audit interfaces.
- Static admin/company/status pages and staging reconciliation summary.
- Protected mutation API routes for manual deposits, mint approval, redemption approval, burn evidence verification, simulated payout, reconciliation, and audit-log reads.
- Admin UI controls for the protected private staging routes.

Not enabled yet:

- Runtime wallet client loading private keys.
- Live worker runner that sends mint or burn transactions.
- Dedicated script to execute ORMB burn on Base Sepolia.

If a step below requires behavior that is not enabled yet, stop and create a focused implementation branch instead of improvising live operations.

## 1. Local Repository Readiness

```bash
git checkout dev
git pull --ff-only origin dev
npm ci
npx prisma generate
npx prisma validate
npm run staging:preflight
npm run staging:tx-dry-run
npm run test:ci
npm run test:e2e
npm run build
git diff --check
```

Expected result: every command passes, and the worktree is clean.

## 2. Database Readiness

For local owner testing:

```bash
npm run db:up
npm run db:migrate:local
npm run db:seed
```

For server staging:

```bash
npm run db:deploy
```

Confirm:

- `DATABASE_URL` points to the intended local or private staging database.
- The database contains no customer data.
- The seed data is demo/testnet-only.
- No destructive reset command is run against a staging server database.

## 3. Environment Readiness

Create a local/server-only `.env` from `.env.private-staging.example`. Required private staging values are listed in `docs/PRIVATE_STAGING_ENVIRONMENT.md`.

Confirm:

- `ORMB_ENV_MODE=private-staging`
- `ORMB_READ_ONLY_DEMO_MODE=false`
- `BASE_SEPOLIA_CHAIN_ID=84532`
- `BASE_SEPOLIA_RPC_URL` points to Base Sepolia.
- `ORMB_CONTRACT_ADDRESS` is a Base Sepolia ORMB deployment.
- `MOCK_USDT_CONTRACT_ADDRESS` is a Base Sepolia MockUSDT deployment if deposit-listener or contract-address documentation needs it.
- `BASE_SEPOLIA_MINTER_PRIVATE_KEY` is testnet-only.
- `BASE_SEPOLIA_BURNER_PRIVATE_KEY` is testnet-only.
- `STAGING_BASIC_AUTH_USERNAME` and `STAGING_BASIC_AUTH_PASSWORD` are non-placeholder values.
- `.env` is not tracked by git.

Run:

```bash
npm run staging:preflight -- --env-file .env
npm run staging:tx-dry-run -- --env-file .env
```

Expected result: PASS, with no private key, password, database URL, or full RPC secret printed. If contracts are not deployed yet, `STAGING_CONTRACTS_NOT_YET_DEPLOYED=true` may produce a warning; do not proceed to mint/burn until real Base Sepolia contract addresses are configured locally.

`npm run staging:tx-dry-run` is offline and does not call RPC, mint, burn, deploy, grant roles, or write database records. It validates only the intended live staging mint/burn inputs and must pass before using any guarded transaction script.

Do not paste real values into docs, PRs, agent reports, tickets, screenshots, or chat.

## 4. Contract Deployment Readiness

If ORMB and MockUSDT are not already deployed to Base Sepolia, deploy with owner-approved testnet keys only:

```bash
npm run deploy:preflight -- --env-file .env
npm run deploy:contracts
```

This script requires:

- `BASE_SEPOLIA_RPC_URL`
- `BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY`
- `ORMB_CONFIRM_TESTNET_DEPLOY=YES`

See `docs/BASE_SEPOLIA_DEPLOYMENT_READINESS.md` before running deployment.

After deployment:

1. Record the ORMB and MockUSDT addresses only in local/server environment storage.
2. Confirm the deployer is the expected testnet admin.
3. Confirm the network is Base Sepolia `84532`.
4. Confirm no mainnet contract or wallet was used.

## 5. Role And Whitelist Readiness

Before minting:

1. Confirm the staging minter has `MINTER_ROLE`.
2. Confirm recipient test wallet is whitelisted.
3. Confirm the redemption/burn source test wallet is whitelisted when required by the token transfer rules.
4. Confirm wallets have enough Base Sepolia ETH for gas.
5. Confirm `npm run staging:tx-dry-run -- --env-file .env` passes for the intended mint and burn inputs.

The current repo has a minter role script:

```bash
MINTER_ROLE_ACTION=verify npm run contracts:minter-role
MINTER_ROLE_ACTION=grant ORMB_CONFIRM_TESTNET_DEPLOY=YES npm run contracts:minter-role
```

Required values:

- `ORMB_CONTRACT_ADDRESS`
- `MINTER_ROLE_ADDRESS`
- `BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY`
- `BASE_SEPOLIA_CHAIN_ID=84532`

The current repo also has a whitelist script:

```bash
npm run contracts:whitelist
```

Required values:

- `ORMB_CONTRACT_ADDRESS`
- `WHITELIST_WALLET`
- `WHITELIST_ENABLED=true`
- `ORMB_CONFIRM_TESTNET_DEPLOY=YES`

Grant `MINTER_ROLE` only to a dedicated testnet minter wallet after verify mode confirms it is missing.

## 6. Start Private Staging

For local interactive review:

```bash
npm run dev
```

For a production-mode local check:

```bash
npm run build
npm run start
```

Confirm:

- `/admin` requires Basic Auth in private staging mode.
- `/company`, `/demo`, and `/status` keep testnet-only/no-real-funds boundaries visible.
- No page suggests public RMB/CNH stablecoin issuance, real USDT, real RMB/CNH, production payments, custody, or customer funds.

## 7. Owner Live Test Sequence

Run this only after the preflight checks pass and the owner explicitly decides to proceed with Base Sepolia testnet assets.

1. Log in to the private staging admin surface.
2. Confirm company KYB state is approved for demo/staging.
3. Confirm source and receiving wallets are known, active, and whitelisted.
4. Create or seed a manual simulated deposit using the admin Private Staging Operations panel.
5. Confirm the deposit is marked simulated/testnet-only.
6. Create a mint request from the confirmed manual deposit.
7. Manually approve the mint request from the admin Private Staging Operations panel.
8. Execute the Base Sepolia mint through the currently supported guarded path.
9. Verify the recipient test wallet receives ORMB on Base Sepolia.
10. Record the mint transaction hash in the local operator notes and AuditLog path when wired.
11. Create a redemption/cashout request for the test wallet from the admin Private Staging Operations panel.
12. Manually approve the redemption request from the admin Private Staging Operations panel.
13. Return ORMB or produce burn evidence according to the supported current flow.
14. Validate burn evidence in the admin panel: chain `84532`, source wallet, amount, transaction hash, and log index.
15. Mark simulated payout complete in the admin panel only after burn verification.
16. Verify the staging reconciliation read model in the admin panel.
17. Verify AuditLog entries for deposit, risk/mint request, mint, redemption, burn verification, and simulated payout.

Stop immediately if any step would require real funds, real USDT, real RMB/CNH, mainnet, customer data, disabled auth, or a production claim.

## 8. Post-Test Evidence

Record locally:

- Git commit SHA.
- Base Sepolia chain ID.
- ORMB contract address.
- MockUSDT contract address, if used.
- Test wallet addresses.
- Mint transaction hash.
- Burn or return transaction hash and log index, if used.
- Reconciliation summary.
- AuditLog row IDs or local database references.
- Any failure, manual override, or skipped step.

Do not record private keys, passwords, RPC secret tokens, seed phrases, or customer data.

## 9. Stop Conditions

Stop and do not continue the live test if:

- Chain ID is not `84532`.
- RPC endpoint is mainnet or ambiguous.
- A private key may be mainnet-funded or reused.
- Minter role is missing.
- Wallet is not whitelisted.
- Contract address is missing or wrong.
- Any route bypasses Basic Auth.
- A mint or burn transaction fails for an unclear reason.
- Reconciliation does not match expected supply/deposit/burn state.
- Any step requires real funds, real USDT, real RMB/CNH, customer data, custody, banking, or production infrastructure.
