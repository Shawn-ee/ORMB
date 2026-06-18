# Enterprise Pilot Playbook

## Purpose

This playbook defines what ORMB would need before a limited enterprise pilot could be discussed. It does not approve a pilot, launch a product, authorize real funds, or create a public stablecoin offering.

ORMB remains testnet-only, mock-asset-only, no-real-funds, no-mainnet, and non-production unless the human owner later obtains explicit legal, compliance, security, and business approval.

## Allowed Pilot-Preparation Scope

Enterprise pilot preparation may include:

- controlled demos with deterministic mock companies
- Base Sepolia testnet contracts
- MockUSDT only
- fixed demo FX rates
- seeded or fixture-backed operational data
- read-only hosted demo mode
- dry-run backfill reports
- demo risk case review
- demo reconciliation and audit review
- architecture and runbook review with prospective enterprise stakeholders

## Prohibited Activity

Enterprise pilot preparation must not include:

- real USDT
- real RMB or CNH
- real customer funds
- redemption for real-world value
- custody of assets
- mainnet deployment
- production payment processing
- public stablecoin issuance
- retail trading
- claims of legal, regulatory, KYB, KYC, AML, sanctions, custody, money transmission, or payment compliance

## Participant Roles

- Human owner: approves scope, branch merges, demo release gates, and any external sharing.
- Technical operator: runs local/testnet validation and demo scripts.
- Security reviewer: reviews contract roles, secrets, environment modes, dependency findings, and incident response.
- Legal/compliance reviewer: decides whether any future real pilot is permissible. The repository does not make this decision.
- Enterprise observer: may review the demo as a technical artifact but must not treat ORMB as a live payment product.

## Required Approval Gates

Before any pilot-like external use, the following gates must pass:

1. Demo remains testnet/mock-only.
2. `npm run test:ci` passes.
3. Browser/e2e checks pass for public demo routes.
4. Dependency audit findings are remediated or explicitly accepted for demo-only use.
5. Ledger and supply invariants pass.
6. Mint and redemption idempotency tests pass.
7. Unknown-wallet and failed-risk paths are safe.
8. Operator runbook exists.
9. Incident response runbook exists.
10. Hosted demo readiness is documented.
11. Legal boundaries are visible in README, app, and relevant docs.
12. Human owner approves the exact demo environment and audience.

## Pilot Exit Criteria

A future limited pilot discussion must stop if:

- anyone requests real funds, real USDT, real RMB/CNH, or mainnet use
- secrets or private keys are required in the repo
- dependency or security findings are unacceptable
- demo behavior suggests production readiness
- legal/compliance approval is unclear
- reconciliation or idempotency checks fail
- an incident cannot be handled through the runbook

## Data Handling

Pilot-preparation data must be synthetic, mock, seeded, or fixture-backed. Do not store real customer names, real bank details, real wallet ownership claims, real KYB documents, private keys, seed phrases, production RPC keys, or transaction instructions for real value.

## Demo Communication

Every enterprise-facing discussion should use this framing:

> ORMB is a testnet-only technical demo of whitelisted stablecoin issuance and enterprise settlement infrastructure. It does not issue a real RMB/CNH stablecoin, does not process real USDT or customer funds, and is not production payment infrastructure.

## Next Required Work

- Operator runbook
- Incident response runbook
- Hosted demo readiness review
- Admin risk/reconciliation UI polish
- Final enterprise readiness review
