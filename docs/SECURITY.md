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

Future contract work must include:

- Role-based access control.
- Mint and burn event tests.
- Unauthorized access tests.
- Pause or emergency control analysis.
- Upgradeability decision record if upgrades are considered.
- Explicit deployment network checks.

## Backend And Worker Security Expectations

Future backend and worker work must include:

- Idempotency keys or deterministic event uniqueness.
- Replay-safe event processing.
- Clear state transition validation.
- Database constraints for critical lifecycle records.
- Audit logs for admin actions.
- Safe handling of failed or repeated events.

## Bootstrap Status

No security-sensitive implementation exists yet. This document defines required constraints for later branches.
