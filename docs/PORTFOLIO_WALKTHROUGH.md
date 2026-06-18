# Portfolio Walkthrough

## Purpose

This walkthrough frames ORMB for a Stripe/Bridge-style smart contract or stablecoin infrastructure engineering review. It is not a product pitch, fundraising document, compliance claim, or launch announcement.

ORMB remains testnet-only, mock-asset-only, no-real-funds, no-mainnet, and non-production.

## One-Minute Summary

ORMB is a technical demo of whitelisted stablecoin issuance and enterprise settlement infrastructure. It models a mock USDT deposit, confirmation handling, fixed FX conversion, risk-gated mint request, manual approval, ORMB minting, enterprise transfer, redemption request, burn verification, reconciliation, audit logging, and static admin/company dashboards.

The engineering focus is not a real RMB/CNH stablecoin. The focus is lifecycle safety, smart contract permissions, idempotent workers, reconciliation, operational runbooks, and clear boundaries around testnet-only infrastructure.

## Reviewer Path

1. Start with `README.md` for the project boundary and local commands.
2. Open `/demo` for the lifecycle story.
3. Open `/admin` for risk review, mint approval, reconciliation, and audit concepts.
4. Open `/company` for participant deposit, balance, transfer, redemption, and support context.
5. Open `/status` for subsystem readiness and safety posture.
6. Review `contracts/ORMBToken.sol` and `test/contracts/ormb-token.test.ts`.
7. Review worker cores in `workers/` and unit tests in `test/workers/`.
8. Review `prisma/schema.prisma` for lifecycle data modeling.
9. Review `docs/LEDGER_INVARIANTS.md`, `docs/API_CONTRACTS.md`, and `docs/WORKER_ADAPTER_BOUNDARIES.md`.
10. Review `docs/SECURITY.md`, `docs/LEGAL_BOUNDARIES.md`, and `docs/KNOWN_LIMITATIONS.md`.

## Engineering Signals To Call Out

- Permissioned ERC-20 design using OpenZeppelin Contracts v5.
- Whitelisted transfers and role-gated minting.
- Manual approval before mint and redemption progression.
- Deterministic worker cores with unit tests.
- Idempotent event identities for deposits and burns.
- Unknown-wallet deposits fail safe and never mint.
- Ledger invariant tests reconcile mock deposits, mints, burns, and supply.
- Dry-run backfill command supports operator recovery review without database writes.
- API and worker adapter boundaries are documented before implementation.
- Browser/e2e checks verify the static demo routes and safety boundaries.
- Agent workflow uses focused branches, reports, validation, PRs, and CI.

## Known Gaps To Be Honest About

- No live API routes.
- No durable worker runner.
- No production database or migration pipeline.
- No live RPC polling loop.
- No mainnet deployment.
- No real USDT, RMB/CNH, customer funds, custody, or redemption.
- No production authn/authz, compliance provider, or payment rails.
- `npm audit --json` reports known findings accepted only for local/testnet demo and conditional read-only hosted-demo review after human owner approval.

## Closing Position

Use this framing:

> ORMB is a testnet-only technical demo of stablecoin payment infrastructure patterns. It demonstrates smart contract permissions, idempotent lifecycle processing, ledger reconciliation, manual risk gates, operational runbooks, and browser-verified dashboards. It is not a public stablecoin launch, not production infrastructure, and not authorized for real funds.
