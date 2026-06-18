# Security

## Core Principles

- Testnet first.
- Whitelisted enterprise access only.
- Manual approvals for minting and redemption lifecycle steps.
- No real customer funds.
- No real private keys, seed phrases, or production credentials in the repository.
- Idempotent event processing for worker and chain ingestion flows.
- Explicit audit logs for privileged actions and lifecycle state changes.

## Secrets Policy

Never commit:

- Private keys.
- Seed phrases.
- API keys.
- Database credentials.
- RPC provider secrets.
- Exchange, bank, payment, or custody credentials.

Use documented environment variables and local `.env` files only after tooling is added. `.env` files must remain ignored.

## Smart Contract Security Expectations

Contract work must include:

- Role-based access control.
- Mint and burn event tests.
- Unauthorized access tests.
- Pause or emergency control analysis.
- Upgradeability decision record if upgrades are considered.
- Explicit deployment network checks.

Current contract baseline:

- ORMBToken uses `MINTER_ROLE`, `PAUSER_ROLE`, and `WHITELIST_ADMIN_ROLE`.
- Minting is restricted to `MINTER_ROLE` and whitelisted recipients.
- Normal transfers require both sender and recipient to be whitelisted.
- Pausing blocks token movement.
- MockUSDT is intentionally public-mint/faucet testnet demo code and must not be used as a real asset.
- Contract scripts require explicit `ORMB_CONFIRM_TESTNET_DEPLOY=YES` and must remain Base Sepolia-only.

## Backend And Worker Security Expectations

Future backend and worker work must include:

- Idempotency keys or deterministic event uniqueness.
- Replay-safe event processing.
- Clear state transition validation.
- Database constraints for critical lifecycle records.
- Audit logs for admin actions.
- Safe handling of failed or repeated events.

Current listener baseline:

- Deposit logs are idempotent by `chainId + txHash + logIndex`.
- Unknown wallet deposits are rejected and must never create mint requests.
- Wrong-treasury transfers are ignored.
- Live RPC polling and private-key usage are not implemented.
- Confirmation handling is threshold-based and must complete before later mint request creation.
- Confirmation worker reruns avoid rewriting unchanged records.

## Current Security Status

Security-sensitive implementation now exists in the smart contract layer. Contract changes require focused tests, documentation updates, and audit follow-up before demo release.
