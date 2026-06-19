# Minter Role Grant Readiness

## Scope

This document covers owner-approved Base Sepolia `MINTER_ROLE` verification, grant, and revoke readiness. It does not authorize mainnet, production, real funds, real USDT, real RMB/CNH, customer data, custody, payout, or public minting.

## Command

Use the guarded role script:

```bash
npm run contracts:minter-role
```

Required local-only values:

```env
BASE_SEPOLIA_RPC_URL=
BASE_SEPOLIA_CHAIN_ID=84532
BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY=
ORMB_CONTRACT_ADDRESS=
MINTER_ROLE_ADDRESS=
MINTER_ROLE_ACTION=verify
```

`MINTER_ROLE_ACTION` must be one of:

- `verify`
- `grant`
- `revoke`

`grant` and `revoke` require:

```env
ORMB_CONFIRM_TESTNET_DEPLOY=YES
```

## Safety Rules

1. Run `verify` before `grant` or `revoke`.
2. Confirm chain ID is Base Sepolia `84532`.
3. Confirm `ORMB_CONTRACT_ADDRESS` is the owner-approved Base Sepolia deployment.
4. Confirm `MINTER_ROLE_ADDRESS` is the dedicated testnet minter wallet.
5. Do not grant roles to customer wallets, mainnet-funded wallets, shared wallets, or unknown addresses.
6. Do not paste private keys, RPC secrets, or `.env` values into chat, PRs, reports, or docs.
7. Record only safe output: action, chain ID, ORMB address, minter address, role status, and transaction hash.

## Stop Conditions

Stop before role changes if:

- `npm run contracts:minter-role` readiness output fails.
- chain ID is not `84532`.
- RPC endpoint is mainnet-like or ambiguous.
- admin/deployer key is missing, placeholder, exposed, or not owner-approved.
- ORMB contract address is missing or wrong.
- minter address is missing, unknown, or not testnet-only.
- any step requires real funds, real USDT, real RMB/CNH, customer data, custody, payout, production operation, or `main`.
