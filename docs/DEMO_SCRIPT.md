# Demo Script

## Audience

This walkthrough is for a technical portfolio review or smart contract engineering interview. It should be presented as a local/testnet infrastructure demo only.

## Opening Boundary

Say first:

> ORMB is a testnet-only stablecoin infrastructure demo. It uses mock assets and representative static data. It does not process real USDT, RMB, CNH, customer funds, production payments, or mainnet transactions.

## Walkthrough

1. Open `/`.
   - Point out the whitelisted issuance and settlement lifecycle.
   - Call out the app-wide safety banner.
   - Explain that the demo combines contracts, worker cores, Prisma schema, and static dashboards.

2. Open `/demo`.
   - Walk through the twelve-step lifecycle from enterprise onboarding to audit review.
   - Emphasize the gates: known source wallet, confirmations, risk checks, manual approval, burn verification, and audit logging.

3. Open `/admin`.
   - Show onboarding and wallet readiness.
   - Show risk events for unknown wallet, daily limit, unconfirmed deposit, and whitelist review.
   - Show mint approvals, redemptions, reconciliation, and audit log.
   - Explain that the page is static and does not execute approvals or contract calls.

4. Open `/company`.
   - Show mock deposit instructions and confirmed-deposit lifecycle.
   - Show whitelisted wallets, ORMB balance, transfers, redemption state, and activity.
   - Explain that all balances and events are representative demo data.

5. Open `/status`.
   - Show CI, worker cores, open audit notes, and live integration count.
   - Show security controls for secrets, mainnet, funds, actions, and audit reports.
   - Explain remaining limitations before production-like hosting.

6. Close with engineering evidence.
   - Contracts: ORMBToken and MockUSDT tests.
   - Workers: deterministic, idempotent unit-tested cores.
   - UI: browser smoke checks and screenshots.
   - Docs: security review, dependency audit, release checklist, and agent reports.

## Do Not Say

- Do not say ORMB is launched.
- Do not say ORMB is a public RMB or CNH stablecoin.
- Do not say ORMB can process real deposits, redemptions, payouts, or customer funds.
- Do not imply mainnet deployment exists.
- Do not imply legal, regulatory, custody, or money-transmission authorization.
