# Owner Base Sepolia Live Test Command Plan

## Scope

This is an owner-executable command plan for the first ORMB private Base Sepolia live test. It does not authorize production, mainnet, real funds, real USDT, real RMB/CNH, custody, customer data, public access, or real payouts.

The agent must not run the commands marked `OWNER-RUN ONLY`. Those commands may use local secrets or send Base Sepolia transactions.

## Safety Rules

- Use only Base Sepolia chain ID `84532`.
- Use only testnet wallets, testnet ETH, MockUSDT, and ORMB testnet contracts.
- Do not use mainnet RPC, Base mainnet chain ID `8453`, Ethereum mainnet chain ID `1`, real USDT, real RMB/CNH, real funds, customer data, custody, or payout rails.
- Keep `.env` local/server-only and untracked.
- Do not paste private keys, RPC tokens, passwords, database URLs, seed phrases, or completed sensitive evidence into docs, PRs, screenshots, tickets, or chat.
- Stop if Basic Auth is disabled for `/admin` or `/api/admin/**`.
- Stop if dependency audit risk is not accepted for owner-only local/private Base Sepolia staging review.

## Source References

- `docs/PRIVATE_STAGING_DEPLOY_CANDIDATE.md`
- `docs/PRIVATE_STAGING_LIVE_TEST_CHECKLIST.md`
- `docs/PRIVATE_STAGING_ENVIRONMENT.md`
- `docs/PRIVATE_STAGING_TROUBLESHOOTING.md`
- `docs/PRIVATE_STAGING_EVIDENCE_BUNDLE.md`
- `package.json`
- `hardhat.config.ts`
- `scripts/deploy-contracts.ts`
- `scripts/manage-minter-role.ts`
- `scripts/whitelist-wallet.ts`
- `scripts/manual-mint.ts`
- `scripts/burn-ormb.ts`
- `scripts/preflight-private-staging.ts`
- `scripts/dry-run-live-mint-burn.ts`
- `scripts/preflight-base-sepolia-deploy.ts`
- `docs/DEDICATED_MINTER_RUNBOOK.md`

## Prerequisites

Required local tools:

- Node.js `>=22`
- npm
- Docker Desktop, if using local PostgreSQL through `npm run db:up`
- Git
- A browser for the private admin UI
- A wallet capable of Base Sepolia testnet use
- A Base Sepolia RPC endpoint
- Base Sepolia testnet ETH for gas

Required owner decisions:

- Which wallet is the deployer/admin wallet.
- Which wallet is the staging mint signer.
- Which wallet is the test recipient/company wallet.
- Which wallet is the burn source wallet.
- Whether the first test deploys fresh ORMB/MockUSDT contracts or uses existing Base Sepolia deployments.
- Whether residual dependency audit findings are accepted for owner-only private staging review.

Route B implementation note:

`npm run contracts:manual-mint` and `npm run contracts:manual-mint:minter` use the `baseSepoliaMinter` Hardhat network account, which is configured by `BASE_SEPOLIA_MINTER_PRIVATE_KEY`. The deployer/admin key is used for deploy, role, and whitelist administration only. See `docs/DEDICATED_MINTER_RUNBOOK.md`.

## 1. Start From Reviewed Dev

Safe local commands:

```powershell
git checkout dev
git pull --ff-only origin dev
git status --short --branch
npm ci
npx prisma generate
npx prisma validate
npm run test:ci
npm run test:e2e
npm run build
git diff --check
```

Expected result:

- All validation commands pass.
- Worktree is clean.
- Current commit is the owner-reviewed private staging candidate or a later owner-approved `dev` commit.

## 2. Create Local `.env`

OWNER-RUN ONLY:

```powershell
Copy-Item .env.private-staging.example .env
git status --short
```

Confirm `.env` does not appear in `git status`. If it appears as tracked or staged, stop.

Fill these values manually in `.env` without printing them in terminal logs:

```env
ORMB_ENV_MODE=private-staging
PRIVATE_STAGING_MODE=true
ORMB_READ_ONLY_DEMO_MODE=false
HOSTED_DEMO_MODE=false
DATABASE_URL=postgresql://...
BASE_SEPOLIA_CHAIN_ID=84532
CHAIN_ID=84532
BASE_SEPOLIA_RPC_URL=https://...
RPC_URL=https://...
STAGING_CONTRACTS_NOT_YET_DEPLOYED=true
ORMB_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
MOCK_USDT_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY=0x...
BASE_SEPOLIA_MINTER_ADDRESS=0x...
BASE_SEPOLIA_MINTER_PRIVATE_KEY=0x...
MINTER_PRIVATE_KEY=0x...
BASE_SEPOLIA_BURNER_PRIVATE_KEY=0x...
MINTER_ROLE_ACTION=verify
MINTER_ROLE_ADDRESS=0x...
STAGING_DRY_RUN_ONLY=true
STAGING_DRY_RUN_FLOW=mint-and-burn
MINT_TO_ADDRESS=0x...
MINT_AMOUNT_ORMB=1
BURN_FROM_ADDRESS=0x...
BURN_AMOUNT_ORMB=1
BURN_EVIDENCE_TX_HASH=
BURN_EVIDENCE_LOG_INDEX=
STAGING_BASIC_AUTH_USERNAME=...
STAGING_BASIC_AUTH_PASSWORD=...
ADMIN_PASSWORD=...
```

Do not set `ORMB_CONFIRM_TESTNET_DEPLOY=YES` until immediately before a transaction command that explicitly requires it.

## 3. Get Base Sepolia ETH

OWNER-RUN ONLY:

1. Open an official or reputable Base Sepolia faucet.
2. Request only testnet ETH for the deployer/admin wallet, mint signer wallet, and burn/test wallet as needed.
3. Confirm the wallet network is Base Sepolia, not Base mainnet.
4. Confirm the received asset is testnet ETH only.

Current faucet references:

- Base lists network faucet options for Base Sepolia in its documentation: <https://docs.base.org/base-chain/network-information/network-faucets>
- Coinbase Developer Platform Faucet supports Base Sepolia testnet assets: <https://www.coinbase.com/developer-platform/products/faucet>
- Alchemy provides a Base Sepolia faucet: <https://www.alchemy.com/faucets/base-sepolia>

Do not bridge or use mainnet ETH for this test.

## 4. Run Environment Preflight

OWNER-RUN ONLY because `.env` contains secrets:

```powershell
npm run staging:preflight -- --env-file .env
npm run staging:tx-dry-run -- --env-file .env
```

Expected result:

- Both commands pass or produce only understood planning warnings.
- No private key, password, database URL, or full RPC secret is printed.
- If `STAGING_CONTRACTS_NOT_YET_DEPLOYED=true`, do not mint or burn yet.

Stop if:

- Chain ID is not `84532`.
- RPC is mainnet or ambiguous.
- Admin guard is missing.
- Required local-only keys are placeholders.
- Dry-run intent does not match the planned mint/burn test.

## 5. Prepare Local Database

For local owner testing:

```powershell
npm run db:up
npm run db:migrate:local
npm run db:seed
```

For private server staging:

OWNER-RUN ONLY if `DATABASE_URL` points to a server database:

```powershell
npm run db:deploy
```

Do not run `npm run db:reset:local` or destructive Prisma reset commands against a private staging server database.

## 6. Deploy Contracts If Not Already Deployed

Skip this section if the owner already has reviewed Base Sepolia ORMB and MockUSDT contract addresses for this staging test.

OWNER-RUN ONLY. This sends Base Sepolia deployment transactions:

```powershell
npm run deploy:preflight -- --env-file .env
$env:ORMB_CONFIRM_TESTNET_DEPLOY='YES'
npm run deploy:contracts
Remove-Item Env:\ORMB_CONFIRM_TESTNET_DEPLOY
```

Expected output:

- JSON containing `network: "baseSepolia"`.
- `chainId` equal to `84532`.
- `mockUsdt` address.
- `ormb` address.
- `deployer` address.

Record the resulting contract addresses only in local/server environment storage:

```env
STAGING_CONTRACTS_NOT_YET_DEPLOYED=false
ORMB_CONTRACT_ADDRESS=0x...
MOCK_USDT_CONTRACT_ADDRESS=0x...
```

Rerun:

OWNER-RUN ONLY:

```powershell
npm run staging:preflight -- --env-file .env
npm run deploy:preflight -- --env-file .env
```

## 7. Verify And Grant `MINTER_ROLE`

OWNER-RUN ONLY. Verify mode performs an RPC read:

```powershell
npm run contracts:check-minter-role
```

If verify reports the intended mint signer already has `MINTER_ROLE`, do not grant again.

If the role is missing and the owner approves the grant, run:

OWNER-RUN ONLY. This sends a Base Sepolia role-grant transaction:

```powershell
$env:ORMB_CONFIRM_TESTNET_DEPLOY='YES'
npm run contracts:grant-minter-role
Remove-Item Env:\ORMB_CONFIRM_TESTNET_DEPLOY
```

Then verify again:

OWNER-RUN ONLY:

```powershell
npm run contracts:check-minter-role
```

Record the role-grant transaction hash locally in the evidence bundle. Do not commit it if the owner considers the staging addresses private.

## 8. Whitelist Test Wallets

Whitelist the recipient/company wallet and the burn source wallet if they differ.

OWNER-RUN ONLY. This sends a Base Sepolia whitelist transaction:

```powershell
$env:WHITELIST_WALLET='0x...'
$env:WHITELIST_ENABLED='true'
$env:ORMB_CONFIRM_TESTNET_DEPLOY='YES'
npm run contracts:whitelist
Remove-Item Env:\WHITELIST_WALLET
Remove-Item Env:\WHITELIST_ENABLED
Remove-Item Env:\ORMB_CONFIRM_TESTNET_DEPLOY
```

Repeat only for the specific testnet wallets needed for this owner test.

## 9. Final Offline Dry Run Before UI

OWNER-RUN ONLY because `.env` contains secrets:

```powershell
npm run staging:preflight -- --env-file .env
npm run staging:tx-dry-run -- --env-file .env
npm run test:ci
npm run test:e2e
npm run build
```

Stop if any command fails.

## 10. Start The App

Local development mode:

OWNER-RUN ONLY if `.env` is loaded into the shell:

```powershell
npm run dev
```

Production-mode local check:

OWNER-RUN ONLY if `.env` is loaded into the shell:

```powershell
npm run build
npm run start
```

Open:

```text
http://localhost:3000/admin
```

Confirm:

- Browser prompts for Basic Auth in private staging mode.
- `/admin` displays the "Private Staging Operations" panel.
- The warning says controls do not deploy contracts, grant roles, submit mint transactions, execute burns, move real funds, or perform real payouts.

## 11. Create Manual Simulated Deposit

In `/admin`, use "Manual Simulated Deposit".

Enter:

- Company ID: seeded demo company ID, for example `demo-company-harbor`.
- Wallet ID: seeded demo wallet ID, for example `demo-wallet-harbor`.
- Manual reference: unique owner reference, for example `owner-staging-deposit-001`.
- Amount: test amount, for example `1`.
- FX rate: test fixed FX rate, for example `1`.
- Confirmed by: `private-staging-admin`.

Click "Record simulated deposit".

Expected result:

- Response body has `ok: true`.
- Response includes a deposit and/or mint request ID.
- No chain transaction is sent.
- No real deposit is implied.

Record the manual reference, deposit ID, and mint request ID locally.

## 12. Approve Mint Request In UI

In `/admin`, use "Mint Request Approval".

Enter:

- Mint request ID from the manual deposit response.
- Approved by: `private-staging-admin`.

Click "Approve mint request".

Expected result:

- Response body has `ok: true`.
- Mint request status moves to approved state.
- No chain transaction is sent by this UI action.

## 13. Execute Testnet Mint

Before minting, confirm:

- `MINT_TO_ADDRESS` in `.env` is the intended whitelisted recipient wallet.
- `MINT_AMOUNT_ORMB` matches the approved mint amount.
- The signer behind `BASE_SEPOLIA_MINTER_PRIVATE_KEY` matches `BASE_SEPOLIA_MINTER_ADDRESS`.
- The dedicated minter address has `MINTER_ROLE`.
- `npm run staging:tx-dry-run -- --env-file .env` passes.

OWNER-RUN ONLY. This sends a Base Sepolia mint transaction:

```powershell
npm run staging:tx-dry-run -- --env-file .env
$env:ORMB_CONFIRM_TESTNET_DEPLOY='YES'
npm run contracts:manual-mint:minter
Remove-Item Env:\ORMB_CONFIRM_TESTNET_DEPLOY
```

Expected result:

- JSON containing `network: "baseSepolia"`.
- `chainId` equal to `84532`.
- `minter` equals `BASE_SEPOLIA_MINTER_ADDRESS`.
- `recipient` equals `MINT_TO_ADDRESS`.
- `txHash` is returned.

Record the mint transaction hash locally.

## 14. Verify ORMB Received

OWNER-RUN ONLY if using private staging addresses.

Use a Base Sepolia explorer, not Base mainnet. Search for:

- ORMB contract address.
- Mint transaction hash.
- Recipient wallet address.

Confirm:

- Chain is Base Sepolia.
- Transaction succeeded.
- Recipient received the expected ORMB amount.
- Contract address matches local `ORMB_CONTRACT_ADDRESS`.

Do not use explorer pages for production claims or public distribution.

## 15. Create Redemption/Cashout Request

In `/admin`, use "Redemption Request".

Enter:

- Company ID used for the mint.
- Wallet ID used for the mint.
- Amount to redeem, for example `1` or a smaller amount.
- Requested by: `private-staging-admin`.

Click "Create redemption".

Expected result:

- Response body has `ok: true`.
- Response includes a redemption ID.
- No real payout is created.

Record the redemption ID locally.

## 16. Approve Redemption

In `/admin`, use "Redemption Approval".

Enter:

- Redemption ID from the previous step.
- Approved by: `private-staging-admin`.

Click "Approve redemption".

Expected result:

- Response body has `ok: true`.
- Redemption moves to burn-pending state.
- No burn transaction is sent by this UI action.

## 17. Burn ORMB

Before burning, confirm:

- `BURN_FROM_ADDRESS` is the burn source wallet.
- The signer behind `BASE_SEPOLIA_BURNER_PRIVATE_KEY` exactly matches `BURN_FROM_ADDRESS`.
- `BURN_AMOUNT_ORMB` equals the approved redemption amount.
- Burn source wallet has enough ORMB and Base Sepolia ETH for gas.
- `npm run staging:tx-dry-run -- --env-file .env` passes.

OWNER-RUN ONLY. This sends a Base Sepolia burn transaction:

```powershell
npm run staging:tx-dry-run -- --env-file .env
$env:ORMB_CONFIRM_TESTNET_DEPLOY='YES'
npm run contracts:burn
Remove-Item Env:\ORMB_CONFIRM_TESTNET_DEPLOY
```

Expected result:

- JSON containing `network: "baseSepolia"`.
- `chainId` equal to `84532`.
- `burner` equals `BURN_FROM_ADDRESS`.
- `txHash` is returned.

Record the burn transaction hash and log index locally. If the log index is not obvious, inspect the Base Sepolia transaction receipt for the ORMB `Transfer` event to the zero address.

## 18. Verify Burn Evidence In UI

In `/admin`, use "Burn Evidence Verification".

Enter:

- Redemption ID.
- Chain ID: `84532`.
- Transaction hash: burn transaction hash.
- Log index: log index from the burn event.
- From address: `BURN_FROM_ADDRESS`.
- Amount: `BURN_AMOUNT_ORMB`.

Click "Verify burn evidence".

Expected result:

- Response body has `ok: true`.
- Burn evidence matches chain, wallet, amount, transaction hash, and log index.
- Duplicate burn evidence is not accepted for another redemption.

## 19. Mark Simulated Payout Complete

In `/admin`, use "Simulated Payout Completion".

Enter:

- Redemption ID.

Click "Mark payout simulated".

Expected result:

- Response body has `ok: true`.
- Payout state is simulated only.
- No real payout, bank transfer, RMB/CNH movement, or customer settlement occurs.

## 20. Verify Reconciliation And Audit Log

In `/admin`, use "Read Models".

Click:

- "Load reconciliation"
- "Load audit logs"

Expected result:

- Reconciliation reflects manual simulated deposits, submitted/confirmed mints, verified burns, and expected supply.
- Audit logs include manual deposit, mint request, mint approval, redemption creation, redemption approval, burn verification, and simulated payout entries.
- No mismatch warnings are unexplained.

Record locally:

- Manual deposit ID.
- Mint request ID.
- Mint transaction hash.
- Redemption ID.
- Burn transaction hash and log index.
- Reconciliation summary.
- AuditLog row IDs.

Use `docs/PRIVATE_STAGING_EVIDENCE_BUNDLE.md` for local notes. Do not commit completed evidence if it contains sensitive staging details.

## 21. Stop And Restart The App

To stop a local foreground Next.js process:

```powershell
Ctrl+C
```

To restart:

OWNER-RUN ONLY if `.env` is loaded into the shell:

```powershell
npm run dev
```

To stop local Docker PostgreSQL:

```powershell
npm run db:down
```

Do not run database reset commands unless the owner is intentionally resetting only a local disposable database.

## 22. Rollback And Emergency Stop

If anything looks wrong, stop before sending any additional transaction.

Local app stop:

```powershell
Ctrl+C
```

Local database stop:

```powershell
npm run db:down
```

Revoke minter role from the staging signer:

OWNER-RUN ONLY. This sends a Base Sepolia role-revoke transaction:

```powershell
$env:ORMB_CONFIRM_TESTNET_DEPLOY='YES'
npm run contracts:revoke-minter-role
Remove-Item Env:\ORMB_CONFIRM_TESTNET_DEPLOY
```

Remove a wallet from the whitelist:

OWNER-RUN ONLY. This sends a Base Sepolia whitelist transaction:

```powershell
$env:WHITELIST_WALLET='0x...'
$env:WHITELIST_ENABLED='false'
$env:ORMB_CONFIRM_TESTNET_DEPLOY='YES'
npm run contracts:whitelist
Remove-Item Env:\WHITELIST_WALLET
Remove-Item Env:\WHITELIST_ENABLED
Remove-Item Env:\ORMB_CONFIRM_TESTNET_DEPLOY
```

Operational stop actions:

1. Stop the app.
2. Do not run more mint, burn, whitelist, role, or deploy scripts.
3. Remove or rotate any exposed testnet-only key.
4. Preserve local logs and transaction hashes for review without exposing secrets.
5. Open a focused audit/fix branch if the issue is code-related.

Current limitation:

The repo does not include a dedicated pause/unpause script. If contract pausing is needed during an incident, stop and create a focused branch for guarded pause tooling before relying on pause operations.

## Final Go/No-Go Gate

Proceed with the first live test only if all are true:

- The owner explicitly approves an owner-only Base Sepolia test.
- `.env` is local/server-only and untracked.
- `npm run staging:preflight -- --env-file .env` passes.
- `npm run staging:tx-dry-run -- --env-file .env` passes.
- `npm run test:ci`, `npm run test:e2e`, and `npm run build` pass.
- Chain ID is `84532`.
- RPC is Base Sepolia.
- Basic Auth protects `/admin` and `/api/admin/**`.
- Contract addresses are Base Sepolia only.
- Minter role and whitelist state are verified.
- Test wallets hold only testnet assets.
- Dependency audit residual risk is accepted only for owner-only private staging review.

If any item is false, do not run live commands.
