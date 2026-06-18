# Private Staging Troubleshooting

## Scope

This guide supports owner-only Base Sepolia private staging diagnostics. It must not be used to weaken safety checks, bypass Basic Auth, commit secrets, use mainnet, process real funds, or claim production readiness.

## Missing `.env`

Symptoms:

- Environment validation fails.
- Private staging mode cannot start.
- Contract scripts read placeholder values.

Actions:

1. Copy `.env.example` to a local `.env`.
2. Fill only local/server-approved testnet values.
3. Confirm `.env` is not tracked by git.
4. Do not paste secrets into docs, PRs, logs, or chat.

## Wrong Chain ID

Symptoms:

- Error mentions Base Sepolia chain `84532`.
- Contract script refuses to run.
- Mint or burn gateway rejects the action.

Actions:

1. Set `BASE_SEPOLIA_CHAIN_ID=84532`.
2. Confirm the RPC endpoint returns chain ID `84532`.
3. Stop if the endpoint returns `1`, `8453`, or any mainnet-like chain ID.

## Mainnet RPC Accidentally Configured

Symptoms:

- Chain ID is `1`, `8453`, or another production network.
- Contract address appears on a mainnet explorer.

Actions:

1. Stop immediately.
2. Replace the RPC URL with a Base Sepolia endpoint.
3. Rotate any testnet key if it may have been sent to the wrong provider or exposed.
4. Do not run deploy, whitelist, mint, or burn commands.

## Insufficient Base Sepolia ETH

Symptoms:

- Transaction fails before confirmation.
- Wallet cannot pay gas.
- RPC returns insufficient funds.

Actions:

1. Fund only the testnet wallet with Base Sepolia ETH from an approved faucet.
2. Do not use mainnet ETH.
3. Retry only after confirming chain ID and wallet address.

## Missing Minter Role

Symptoms:

- Mint gateway reports missing `MINTER_ROLE`.
- `ORMB.mint()` reverts.

Actions:

1. Confirm the expected minter address.
2. Confirm the ORMB contract address.
3. Grant `MINTER_ROLE` only through an owner-reviewed Base Sepolia admin path.
4. Record the role-grant transaction hash locally.
5. Consider adding a guarded role-management script in a focused branch.

## Wallet Not Whitelisted

Symptoms:

- Mint gateway reports recipient is not whitelisted.
- ORMB transfer or mint reverts.

Actions:

1. Confirm the wallet address and chain.
2. Set `WHITELIST_WALLET` locally.
3. Set `WHITELIST_ENABLED=true`.
4. Run `npm run contracts:whitelist` only after Base Sepolia and testnet confirmation checks pass.

## Contract Address Missing Or Wrong

Symptoms:

- Env validation rejects `ORMB_CONTRACT_ADDRESS`.
- Contract call fails with no code at address.
- Explorer shows a different contract.

Actions:

1. Confirm ORMB and MockUSDT addresses from the deployment output.
2. Confirm both are Base Sepolia contracts.
3. Update only local/server env storage.
4. Do not commit addresses if the owner wants them private.

## RPC Error

Symptoms:

- Timeout, rate limit, connection reset, or provider error.

Actions:

1. Retry only idempotent read checks first.
2. Confirm no transaction was already broadcast before retrying a write.
3. Use explorer or RPC transaction lookup for ambiguous mint/burn attempts.
4. Record uncertainty in local operator notes.

## Prisma Migration Error

Symptoms:

- `prisma migrate dev` or `prisma migrate deploy` fails.
- Schema validation passes but database state is stale.

Actions:

1. Confirm `DATABASE_URL` points to the intended database.
2. For local-only databases, rerun `npm run db:migrate:local`.
3. For server staging, use `npm run db:deploy`.
4. Do not run destructive reset commands on staging server data.
5. Back up the database before manual recovery.

## Admin Access Guard Issue

Symptoms:

- `/admin` is unexpectedly public.
- Valid credentials fail.
- Browser repeatedly prompts for Basic Auth.

Actions:

1. Confirm `ORMB_ENV_MODE=private-staging`.
2. Confirm `STAGING_BASIC_AUTH_USERNAME` and `STAGING_BASIC_AUTH_PASSWORD` are non-placeholder local/server values.
3. Confirm reverse proxy headers do not bypass middleware.
4. Stop if admin mutation routes are public.

## Mint Transaction Failed

Symptoms:

- `ORMB.mint()` reverts.
- Transaction is dropped or replaced.
- Recipient balance does not change.

Actions:

1. Confirm chain ID `84532`.
2. Confirm minter role.
3. Confirm recipient whitelist state.
4. Confirm amount uses up to 6 decimals and is greater than zero.
5. Confirm the mint request was manually approved and not already submitted.
6. Do not retry until transaction status is known.

## Burn Transaction Or Burn Evidence Failed

Symptoms:

- Burn evidence validation rejects chain, wallet, amount, tx hash, or log index.
- Redemption remains burn-pending.

Actions:

1. Confirm burn evidence is from Base Sepolia chain `84532`.
2. Confirm burn source wallet matches the approved redemption wallet.
3. Confirm burn amount equals the redemption amount.
4. Confirm tx hash is a 32-byte hash and log index is correct.
5. Confirm the burn event was not already used by another redemption.
6. Do not mark simulated payout complete before burn verification.

## Reconciliation Mismatch

Symptoms:

- Dashboard flags supply, reserve, mint, or burn mismatch.
- Audit trail does not align with transaction evidence.

Actions:

1. Stop mint/redemption progression.
2. Export or record local reconciliation inputs without secrets.
3. Compare deposits, mint requests, confirmed mints, verified burns, and expected supply.
4. Check duplicate mint and duplicate burn event identities.
5. Create a focused audit/fix branch if the mismatch is caused by code or schema behavior.
