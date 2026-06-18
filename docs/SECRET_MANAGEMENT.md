# Secret Management

## Scope

ORMB remains a testnet-only, mock-asset-only technical demo. This document defines how secrets must be handled for local development, testnet scripts, and any future read-only hosted demo.

## Non-Negotiable Rules

- Do not commit private keys, seed phrases, API keys, database credentials, RPC secrets, production credentials, or customer data.
- Do not configure mainnet deployment keys.
- Do not use real USDT, real RMB/CNH, customer funds, or production payment credentials.
- Keep `.env` files ignored.
- Keep `.env.example` values as placeholders only.

## Environment Modes

`ORMB_ENV_MODE` supports:

- `local`: default mode for local validation and static demo work. Does not require secrets.
- `testnet-script`: Base Sepolia script mode. Requires explicit `ORMB_CONFIRM_TESTNET_DEPLOY=YES`, a non-placeholder Base Sepolia RPC URL, and a non-placeholder testnet deployer key.
- `hosted-demo`: future read-only hosted demo mode. Requires `ORMB_READ_ONLY_DEMO_MODE=true` and must not configure deployer private keys or enable testnet deployment confirmation.

## Validation Helper

`src/lib/config/env.ts` provides `parseOrmbEnvironment()` for future scripts, APIs, and hosted-demo checks.

Current behavior:

- Defaults to `local` mode.
- Rejects unknown environment modes.
- Rejects hosted-demo mode if deployer keys are configured.
- Rejects hosted-demo mode if `ORMB_CONFIRM_TESTNET_DEPLOY=YES`.
- Rejects testnet-script mode when Base Sepolia RPC or deployer key values are placeholders.

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
