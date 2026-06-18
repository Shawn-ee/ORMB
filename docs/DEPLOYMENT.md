# Testnet Deployment

ORMB contract scripts are Base Sepolia-only helpers for the technical demo.

## Safety Boundary

- Do not use mainnet.
- Do not use real private keys, seed phrases, production RPC credentials, real USDT, real RMB, or customer funds.
- Do not run these scripts unless the target is Base Sepolia.
- MockUSDT is a demo asset only.

## Required Environment Variables

Use `.env.example` as the source of placeholder names.

```env
BASE_SEPOLIA_RPC_URL=
BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY=
BASE_SEPOLIA_MINTER_PRIVATE_KEY=
ORMB_CONFIRM_TESTNET_DEPLOY=YES
ORMB_CONTRACT_ADDRESS=
MOCK_USDT_CONTRACT_ADDRESS=
WHITELIST_WALLET=
WHITELIST_ENABLED=true
MINT_TO_ADDRESS=
MINT_AMOUNT_ORMB=
```

`ORMB_CONFIRM_TESTNET_DEPLOY=YES` is required so the scripts cannot be run accidentally.

## Commands

Compile and test before any testnet script:

```bash
npm run compile:contracts
npm run test:contracts
```

Deploy MockUSDT and ORMBToken to Base Sepolia:

```bash
npm run deploy:contracts
```

Whitelist a wallet:

```bash
npm run contracts:whitelist
```

Manual testnet mint:

```bash
npm run contracts:manual-mint
```

The future private staging runtime mint path uses a dedicated testnet minter key and the reusable Base Sepolia mint gateway boundary. Do not reuse a mainnet key, production wallet, customer wallet, or deployer key for routine staging mint execution.

## Validation Boundary

Repository CI does not deploy contracts and does not require real RPC keys. Script validation is limited to compile, typecheck, and tests unless the human owner explicitly provides testnet credentials.
