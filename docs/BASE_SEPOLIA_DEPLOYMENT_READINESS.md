# Base Sepolia Deployment Readiness

## Scope

This document prepares ORMB for an owner-approved Base Sepolia testnet deployment. It does not authorize mainnet, real funds, real USDT, real RMB/CNH, customer data, custody, payout, production use, or public stablecoin issuance.

## Current Deployment Tooling

- `npm run deploy:preflight` validates local deploy posture without RPC calls or transactions.
- `npm run deploy:contracts` deploys `MockUSDT` and `ORMBToken` to the configured `baseSepolia` Hardhat network only after explicit confirmation.
- `scripts/deploy-contracts.ts` checks the connected chain ID is Base Sepolia `84532` before deployment.
- `scripts/contract-script-guards.ts` requires `ORMB_CONFIRM_TESTNET_DEPLOY=YES`.

## Pre-Deploy Checklist

Before running any deployment transaction:

1. Confirm this is owner-approved testnet staging work.
2. Confirm no real funds, real USDT, real RMB/CNH, customer data, custody, payout, mainnet, or production claim is involved.
3. Confirm `.env` is local/server-only and untracked.
4. Confirm `BASE_SEPOLIA_CHAIN_ID=84532`.
5. Confirm `BASE_SEPOLIA_RPC_URL` points to Base Sepolia.
6. Confirm `BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY` is a testnet-only key.
7. Confirm deployer has enough Base Sepolia ETH for gas.
8. Confirm `STAGING_CONTRACTS_NOT_YET_DEPLOYED=true` for first deployment.
9. Confirm `ORMB_CONTRACT_ADDRESS` and `MOCK_USDT_CONTRACT_ADDRESS` are unset or zero before first deployment.
10. Run:

```bash
npm run deploy:preflight -- --env-file .env
npm run compile:contracts
npm run test:contracts
npm run test:ci
```

## Deployment Command

Only after the checklist passes and the owner explicitly approves the live Base Sepolia testnet deployment:

```bash
npm run deploy:contracts
```

Expected output is JSON containing:

- `network`
- `chainId`
- `deployer`
- `mockUsdt`
- `ormb`

Do not paste private keys, RPC secrets, or `.env` contents into reports or chat.

## Post-Deploy Local Record

Record locally, not in git unless the owner explicitly approves:

```text
gitCommit=
network=baseSepolia
chainId=84532
deployerAddress=
mockUsdtAddress=
ormbAddress=
deploymentTxHashes=
timestamp=
operator=
```

Then update local `.env` only:

```env
STAGING_CONTRACTS_NOT_YET_DEPLOYED=false
ORMB_CONTRACT_ADDRESS=0x...
MOCK_USDT_CONTRACT_ADDRESS=0x...
```

Run:

```bash
npm run staging:preflight -- --env-file .env
```

## Minter Role Handoff

After deployment and before mint testing, verify whether the dedicated staging minter has `MINTER_ROLE`:

```bash
MINTER_ROLE_ACTION=verify npm run contracts:minter-role
```

If the minter does not have the role, grant it only after owner approval:

```bash
MINTER_ROLE_ACTION=grant ORMB_CONFIRM_TESTNET_DEPLOY=YES npm run contracts:minter-role
```

Required local-only values:

- `BASE_SEPOLIA_RPC_URL`
- `BASE_SEPOLIA_CHAIN_ID=84532`
- `BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY`
- `ORMB_CONTRACT_ADDRESS`
- `MINTER_ROLE_ADDRESS`

Do not grant roles to customer wallets, mainnet-funded wallets, or unknown addresses. Record the verify/grant transaction hash locally without secrets.

## Stop Conditions

Stop before deployment if:

- chain ID is not `84532`
- RPC endpoint is mainnet-like or ambiguous
- deployer key is missing, placeholder, mainnet-funded, reused, or exposed
- `npm run deploy:preflight` fails
- contract tests or CI fail
- contract addresses are already set and this might be an accidental redeploy
- any step requires real funds, real USDT, real RMB/CNH, customer data, custody, payout, production operation, or `main`
