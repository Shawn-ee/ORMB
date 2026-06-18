# Secret Management

## Scope

ORMB remains a testnet-only, mock-asset-only technical demo. This document defines how secrets must be handled for local development, testnet scripts, any future read-only hosted demo, and future owner-only private staging.

## Non-Negotiable Rules

- Do not commit private keys, seed phrases, API keys, database credentials, RPC secrets, production credentials, or customer data.
- Do not configure mainnet deployment keys.
- Do not use real USDT, real RMB/CNH, customer funds, or production payment credentials.
- Do not use private staging to claim custody, payment processing, production readiness, or live mint/burn service availability.
- Keep `.env` files ignored.
- Keep `.env.example` values as placeholders only.

## Environment Modes

`ORMB_ENV_MODE` supports:

- `local`: default mode for local validation and static demo work. Does not require secrets.
- `testnet-script`: Base Sepolia script mode. Requires explicit `ORMB_CONFIRM_TESTNET_DEPLOY=YES`, a non-placeholder Base Sepolia RPC URL, and a non-placeholder testnet deployer key.
- `hosted-demo`: future read-only hosted demo mode. Requires `ORMB_READ_ONLY_DEMO_MODE=true` and must not configure deployer, minter, or burner private keys or enable testnet deployment confirmation.
- `private-staging`: future owner-only interactive Base Sepolia staging mode. Requires a non-placeholder Base Sepolia RPC URL, `BASE_SEPOLIA_CHAIN_ID=84532`, a non-placeholder ORMB testnet contract address, staging Basic Auth username and password, and non-placeholder testnet-only minter and burner keys. Must not enable hosted read-only mode.

## Validation Helper

`src/lib/config/env.ts` provides `parseOrmbEnvironment()` for future scripts, APIs, and hosted-demo checks.

Current behavior:

- Defaults to `local` mode.
- Rejects unknown environment modes.
- Rejects hosted-demo mode if deployer keys are configured.
- Rejects hosted-demo mode if minter or burner keys are configured.
- Rejects hosted-demo mode if `ORMB_CONFIRM_TESTNET_DEPLOY=YES`.
- Rejects testnet-script mode when Base Sepolia RPC or deployer key values are placeholders.
- Rejects private-staging mode when Base Sepolia RPC, chain ID, ORMB contract address, Basic Auth credentials, minter key, or burner key are missing or placeholders.
- Rejects private-staging mode when `BASE_SEPOLIA_CHAIN_ID` is not exactly `84532`, including mainnet-like chain IDs such as Ethereum mainnet `1` or Base mainnet `8453`.
- Rejects private-staging mode when `ORMB_READ_ONLY_DEMO_MODE=true`.

## Private Staging Boundary

`private-staging` is an environment validation mode for future owner-only Base Sepolia staging. It includes a Basic Auth proxy guard for `/admin`, `/api/admin/**`, and `/api/staging/**`. It does not add mutation APIs, custody, payment processing, live mint/burn routes, or production operation.

Private staging secrets must live only in local or server environment configuration. They must never be committed to the repository or copied into agent reports. The minter and burner keys must be testnet-only keys with no mainnet or production use.

Basic Auth is an access guard for private staging, not a substitute for production identity, authorization, compliance review, or network controls. A hidden URL is not access protection.

## Hosted Demo Boundary

A hosted demo, if later approved by the human owner, must be read-only unless a separate branch adds explicit approval gates. It must not:

- Execute contract scripts.
- Store private keys.
- Connect to production databases.
- Accept real deposits.
- Process redemptions or payouts.
- Claim production readiness.

## Rotation And Incident Expectations

If a real secret is ever accidentally committed or exposed:

1. Stop using the secret immediately.
2. Revoke or rotate it outside the repository.
3. Do not paste the secret into an issue, PR, chat, or agent report.
4. Add an incident report that describes the type of secret and remediation without revealing the value.
5. Request human owner review before continuing deployment-related work.
