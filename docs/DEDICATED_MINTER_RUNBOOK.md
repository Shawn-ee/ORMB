# Dedicated Minter Wallet Runbook

## Scope

This runbook documents Route B for ORMB private interactive Base Sepolia staging: the deployer/admin wallet deploys contracts and manages roles, while a dedicated minter wallet executes ORMB mint transactions after admin approval.

This is testnet-only. It does not authorize mainnet, production, real funds, real USDT, real RMB/CNH, custody, customer data, public issuance, payment processing, or real payouts.

## Role Separation

| Wallet | Local variable | Purpose |
| --- | --- | --- |
| Deployer/admin | `BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY` | Deploy ORMB/MockUSDT and manage roles/whitelist on Base Sepolia. |
| Dedicated minter | `BASE_SEPOLIA_MINTER_PRIVATE_KEY` | Execute guarded ORMB mint transactions after admin approval. |
| Burner/test wallet | `BASE_SEPOLIA_BURNER_PRIVATE_KEY` | Execute guarded testnet burns for redemption simulation. |

The private staging app/backend must not need the deployer/admin key for normal mint execution.

## Required Local Variables

```env
BASE_SEPOLIA_CHAIN_ID=84532
CHAIN_ID=84532
BASE_SEPOLIA_RPC_URL=https://...
RPC_URL=https://...
ORMB_CONTRACT_ADDRESS=0x...
BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY=0x...
BASE_SEPOLIA_MINTER_ADDRESS=0x...
BASE_SEPOLIA_MINTER_PRIVATE_KEY=0x...
MINT_TO_ADDRESS=0x...
MINT_AMOUNT_ORMB=1
STAGING_DRY_RUN_ONLY=true
STAGING_DRY_RUN_FLOW=mint
```

`MINTER_ROLE_ADDRESS` remains a compatibility alias, but new private staging setup should use `BASE_SEPOLIA_MINTER_ADDRESS`.

Never commit `.env`, private keys, RPC secrets, passwords, seed phrases, database URLs, or completed sensitive evidence.

## Safe Local Checks

OWNER-RUN ONLY because `.env` contains secrets:

```powershell
npm run staging:preflight -- --env-file .env
npm run staging:tx-dry-run -- --env-file .env
```

Expected result:

- Chain ID is `84532`.
- RPC is Base Sepolia.
- Minter address is present.
- Minter private key is present but redacted.
- No private key or full secret is printed.

## Role Check

OWNER-RUN ONLY. This performs a Base Sepolia RPC read:

```powershell
npm run contracts:check-minter-role
```

Expected result:

- `network` is `baseSepolia`.
- `chainId` is `84532`.
- `minter` equals `BASE_SEPOLIA_MINTER_ADDRESS`.
- `hasRole` is `true` before live minting.

## Role Grant

OWNER-RUN ONLY. This sends a Base Sepolia role-grant transaction:

```powershell
$env:ORMB_CONFIRM_TESTNET_DEPLOY='YES'
npm run contracts:grant-minter-role
Remove-Item Env:\ORMB_CONFIRM_TESTNET_DEPLOY
```

Run this only after:

- `npm run contracts:check-minter-role` shows the dedicated minter does not already have `MINTER_ROLE`.
- `BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY` is the owner-approved Base Sepolia admin key.
- `BASE_SEPOLIA_MINTER_ADDRESS` is the intended dedicated minter wallet.

Verify again after grant:

OWNER-RUN ONLY:

```powershell
npm run contracts:check-minter-role
```

## Role Revoke

OWNER-RUN ONLY. This sends a Base Sepolia role-revoke transaction:

```powershell
$env:ORMB_CONFIRM_TESTNET_DEPLOY='YES'
npm run contracts:revoke-minter-role
Remove-Item Env:\ORMB_CONFIRM_TESTNET_DEPLOY
```

Use revoke if the dedicated minter key may be exposed, reused, or no longer needed.

## Dedicated Minter Mint Execution

Before minting:

1. Confirm `BASE_SEPOLIA_MINTER_ADDRESS` matches the wallet derived from `BASE_SEPOLIA_MINTER_PRIVATE_KEY`.
2. Confirm the dedicated minter has `MINTER_ROLE`.
3. Confirm `MINT_TO_ADDRESS` is whitelisted.
4. Confirm `MINT_AMOUNT_ORMB` matches the manually approved mint request.
5. Run `npm run staging:tx-dry-run -- --env-file .env`.

OWNER-RUN ONLY. This sends a Base Sepolia mint transaction:

```powershell
$env:ORMB_CONFIRM_TESTNET_DEPLOY='YES'
npm run contracts:manual-mint:minter
Remove-Item Env:\ORMB_CONFIRM_TESTNET_DEPLOY
```

`npm run contracts:manual-mint` is also routed to the dedicated minter network. The explicit `contracts:manual-mint:minter` name is preferred in owner live-test notes.

The script stops before transaction submission if:

- Chain ID is not Base Sepolia `84532`.
- The configured signer does not match `BASE_SEPOLIA_MINTER_ADDRESS`.
- The contract is paused.
- The dedicated minter lacks `MINTER_ROLE`.
- `MINT_TO_ADDRESS` is not whitelisted.

## Stop Conditions

Stop immediately if:

- Chain ID is `1`, `8453`, or anything other than `84532`.
- RPC is mainnet, Base mainnet, or ambiguous.
- The minter private key may be reused, exposed, or mainnet-funded.
- The deployer/admin key is required for normal mint execution.
- Minter role status is unclear.
- Whitelist status is unclear.
- Any action would involve real funds, real USDT, real RMB/CNH, custody, customer data, public access, or production claims.
