# Stripe/Bridge Portfolio Package

## Purpose

This package frames ORMB for a Stripe/Bridge-style portfolio review. It is a demo narrative for discussing engineering judgment around stablecoin infrastructure patterns, not evidence of a Stripe partnership, Bridge partnership, live integration, production availability, payment processing, custody, settlement, compliance approval, or real stablecoin issuance.

ORMB remains a testnet-only, mock-asset-only, no-real-funds, no-mainnet, non-production portfolio project.

## Portfolio Positioning

Position ORMB as:

- A technical demo of whitelisted stablecoin infrastructure patterns.
- A portfolio artifact showing lifecycle modeling, smart contract permissions, worker idempotency, manual risk gates, reconciliation, auditability, and operational boundaries.
- A local/testnet engineering review package for conversations about payment infrastructure design.
- A demonstration of how a small product surface can explain deposit detection, confirmation, mint request review, transfer visibility, redemption request handling, burn verification, and ledger checks without moving real value.

Do not position ORMB as:

- A public RMB or CNH stablecoin.
- A Stripe, Bridge, or Stripe-owned product.
- A production payment, settlement, custody, money transmission, exchange, brokerage, or redemption service.
- A legally approved, compliance-approved, regulator-approved, or enterprise-approved product.
- A system that can process real USDT, real RMB/CNH, customer deposits, customer withdrawals, payouts, reserves, or live mint/burn activity.

## Permitted Demo Narrative

Use this narrative:

> ORMB is a testnet-only portfolio demo of stablecoin payment infrastructure patterns. It uses mock assets, deterministic fixtures, and documented safety boundaries to show how whitelisted issuance, lifecycle state machines, manual review, audit logging, and reconciliation could be modeled in a controlled engineering prototype.

Permitted supporting points:

- ORMB is relevant to a Stripe/Bridge-style engineering conversation because it demonstrates payment lifecycle modeling, smart contract access controls, audit trails, and operational discipline.
- The repo has contracts, deterministic worker cores, schema modeling, static dashboards, runbooks, and validation commands that reviewers can inspect.
- The demo is intentionally constrained to Base Sepolia/testnet and representative fixture data.
- The current package is documentation-only and does not add API routes, payment rails, live adapters, custody logic, or production integrations.

## Forbidden Claims

Do not say or imply that:

- Stripe or Bridge has partnered with, endorsed, reviewed, approved, hired, acquired, integrated, or sponsored ORMB.
- ORMB is connected to Stripe APIs, Bridge APIs, banking rails, payment processors, on/off ramps, compliance vendors, or real treasury operations.
- ORMB can accept, custody, convert, settle, redeem, transfer, or pay out real funds.
- ORMB issues a real RMB/CNH stablecoin or any token with real-world redemption rights.
- MockUSDT is real USDT, collateral, customer money, reserves, or redeemable value.
- Testnet ORMB is a live financial instrument, investment product, or retail trading token.
- The demo has legal, compliance, sanctions, KYB/KYC, AML, regulatory, security, production, or enterprise pilot approval.
- Any current workflow is safe for mainnet, production, real customers, real deposits, or live mint/burn operations.

## Architecture Talking Points

When presenting ORMB, focus on design signals rather than production claims:

- Permissioned token controls: role-gated minting, burn support, pause controls, and whitelist enforcement.
- Mock deposit lifecycle: supplied MockUSDT events are processed as deterministic testnet/demo inputs.
- Confirmation and reorg assumptions: confirmation state is modeled with explicit testnet boundaries.
- Risk-gated mint requests: worker logic can decide whether a mock deposit is eligible to create a request, but it does not approve real funds.
- Manual approval posture: admin surfaces describe review checkpoints without executing production settlement.
- Redemption and burn modeling: burn verification is a demo lifecycle stage, not a real redemption or payout.
- Ledger reconciliation: invariant checks compare modeled deposits, mints, burns, and supply in the demo domain.
- Operational documentation: runbooks, security notes, legal boundaries, known limitations, and agent reports show disciplined delivery.
- Adapter boundaries: live APIs, RPC pollers, durable runners, hosted observability, external providers, and production payment integrations are deferred and restricted.

## Mock And Fixture Boundaries

The portfolio demo may use:

- Base Sepolia/testnet assumptions where explicitly documented.
- MockUSDT, fixture companies, fixture wallets, fixture events, fixture balances, and deterministic local test data.
- Static dashboards and read-only demo pages.
- Unit, contract, and CI validation outputs.
- Manual demo language that describes intended lifecycle stages as simulated or mocked.

The portfolio demo must not use:

- Real USDT, real RMB, real CNH, customer deposits, customer withdrawals, reserves, private keys, seed phrases, production credentials, or mainnet deployments.
- Live Stripe, Bridge, bank, treasury, custody, compliance, exchange, payout, or payment processor integrations.
- Production databases, production queues, production RPC services, production webhooks, live mint/burn runners, or settlement instructions.
- Any data that would be presented as real customer, transaction, compliance, reserve, or financial record data.

## Review Checklist

Before presenting ORMB in a Stripe/Bridge-style portfolio context, confirm:

- The presentation says "portfolio demo", "technical demo", "testnet-only", and "mock-asset-only".
- Stripe and Bridge are referenced only as review context or engineering-style comparison, not as partners or integrated services.
- No copy claims real stablecoin issuance, payment processing, custody, settlement, redemption, compliance approval, legal approval, or production readiness.
- No demo step requires real funds, real USDT, real RMB/CNH, mainnet, customer data, private keys, seed phrases, or production credentials.
- The reviewer path points to inspectable engineering artifacts and docs rather than unsupported product claims.
- Known limitations and deferred production work are stated plainly.
- The validation report includes `npm run test:ci` and `git diff --check`.
- Browser checks are omitted unless UI files are changed.

## Required Validation Commands

Run these before opening a PR or sharing a final branch report:

```bash
npm run test:ci
git diff --check
```

Browser checks are not required for this package because it is documentation-only and does not touch UI.

## Stop Conditions

Stop the demo, review, or branch work immediately if any reviewer, script, copy, or proposed change asks for:

- Real funds, real USDT, real RMB/CNH, customer deposits, customer withdrawals, reserves, or payouts.
- Mainnet deployment or production credentials.
- Private keys, seed phrases, bank credentials, Stripe credentials, Bridge credentials, or production API keys.
- Live custody, live payment processing, live settlement, live redemption, or live mint/burn behavior.
- Claims of Stripe/Bridge partnership, endorsement, approval, integration, or production availability.
- Legal, compliance, sanctions, KYB/KYC, AML, regulator, enterprise, or security approval claims.
- Editing outside the focused branch scope without explicit owner approval.

If a stop condition appears, document it in the agent report and do not continue the affected activity until the human owner gives explicit written direction.

## Demo Script

1. Open with the boundary:
   "ORMB is a testnet-only portfolio demo. It uses mock assets and fixtures. It is not a Stripe or Bridge integration, not a partnership claim, not production payment infrastructure, and not authorized for real funds."

2. Describe the engineering story:
   "The repo models a stablecoin infrastructure lifecycle: mock deposit detection, confirmation assumptions, risk-gated mint request creation, manual approval, permissioned token controls, transfer visibility, redemption request modeling, burn verification, reconciliation, audit logs, and operational boundaries."

3. Show the review path:
   "A reviewer can inspect contracts and tests for permissioned token controls, worker cores and tests for deterministic lifecycle behavior, Prisma schema for data modeling, and docs for API contracts, adapter boundaries, security posture, legal boundaries, and known limitations."

4. Call out what is intentionally absent:
   "There are no live payment rails, no real USDT/RMB/CNH, no customer funds, no custody, no production database, no live RPC worker, no Stripe/Bridge API integration, no mainnet deployment, and no production compliance claim."

5. Close with the permitted framing:
   "ORMB is useful as a portfolio artifact because it demonstrates disciplined engineering around payment infrastructure patterns while keeping the financial, legal, and operational boundaries explicit."
