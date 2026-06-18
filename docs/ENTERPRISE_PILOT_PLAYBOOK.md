# Enterprise Pilot Playbook

## Purpose

This playbook defines Enterprise Pilot Readiness v1 for ORMB after human owner, legal, and compliance review. It is a readiness and review checklist only. It does not approve a production launch, authorize a real pilot with funds, issue a real stablecoin, or permit mainnet deployment.

ORMB remains a portfolio and technical demo. It must not handle real customer funds, real USDT, real RMB, real CNH, private keys, seed phrases, production credentials, custody, payment processing, or live mint-burn behavior.

## Readiness State Definitions

| State | Allowed use | Boundary |
| --- | --- | --- |
| Local demo | Developer-run demo on a local machine using mock data, mock assets, and testnet or local-only configuration. | No external users, no real funds, no production credentials, no mainnet. |
| Stripe/Bridge portfolio demo | Portfolio-facing demonstration of intended integration concepts using sandbox, mocked, or static flows only. | No real Stripe or Bridge money movement, no live onboarding, no custody, no payment processing, no real stablecoin issuance. |
| Hosted demo | Externally viewable demo environment for portfolio review using synthetic data and demo-only configuration. | Read-only or tightly controlled demo behavior only; no production claims, no real users, no real funds, no mainnet. |
| Enterprise pilot readiness | Internal readiness state showing that scope, evidence, roles, and approval gates are documented for a possible future enterprise discussion. | Not a pilot approval, not production readiness, not permission to process value, and not permission to represent ORMB as a live financial product. |
| Production readiness | A future state requiring separate legal, compliance, security, operational, financial, and technical approval outside this MVP scope. | Out of scope for this branch and for the MVP unless explicitly approved in writing by the human owner. |

## Pilot Readiness Scope

Enterprise Pilot Readiness v1 may include:

- Review of the ORMB technical demo architecture and demo boundaries.
- Local or hosted walkthroughs using synthetic companies, seeded data, and mock assets.
- Base Sepolia or local testnet demonstrations only.
- MockUSDT or other clearly labeled test assets only.
- Static, fixed, or fixture-backed FX assumptions clearly labeled as demo data.
- Read-only review of demo reports, audit trails, risk cases, and reconciliation views.
- Discussion of future enterprise requirements without committing to launch, custody, payment processing, issuance, redemption, or regulatory status.

Enterprise Pilot Readiness v1 must not include:

- Real USDT, real RMB, real CNH, real bank accounts, real cards, or real customer deposits.
- Mainnet deployment or mainnet transaction instructions.
- Production API keys, production RPC keys, secrets, private keys, or seed phrases.
- Live mint, burn, redemption, settlement, payout, or payment processing behavior.
- Custody, money transmission, exchange, brokerage, retail trading, or public stablecoin offering claims.
- Statements that ORMB is legally approved, compliant, production-ready, or available as a public RMB/CNH stablecoin.

## Roles

- Human owner: Owns final scope, audience, branch merge decisions, and written approval for any external demo.
- Legal reviewer: Reviews whether external language, demo framing, and any future pilot concept are permissible.
- Compliance reviewer: Reviews boundaries around KYB/KYC/AML/sanctions claims, data handling, and prohibited real-value activity.
- Technical operator: Runs validation commands, prepares the demo environment, and records evidence.
- Security reviewer: Reviews secrets handling, dependency findings, environment configuration, access controls, and incident concerns.
- Enterprise observer: May review ORMB as a technical demo only and must not rely on it as live payment, custody, settlement, or stablecoin infrastructure.

## Approval Gates

All gates must pass before any enterprise-facing readiness review:

1. Human owner confirms the audience, scope, environment, and demo script in writing.
2. Legal reviewer approves the exact external framing and confirms that the review is not a product launch.
3. Compliance reviewer approves the no-real-funds, no-real-assets, no-mainnet, and no-production-claims boundary.
4. Technical operator confirms the environment uses only mock data, test assets, testnet/local configuration, and demo credentials.
5. Security reviewer confirms no private keys, seed phrases, production credentials, or customer data are present.
6. Required validation commands pass from the repository root.
7. Demo materials visibly state that ORMB is a portfolio and technical demo, not a real RMB/CNH stablecoin and not production payment infrastructure.
8. Stop conditions are reviewed before the meeting starts.

## Data And Secrets Policy

Only synthetic, seeded, fixture-backed, sandbox, or testnet data may be used. Demo names, balances, risk cases, transaction identifiers, and counterparties must be fictional or clearly non-customer examples.

Do not store, request, paste, import, or demonstrate:

- Real customer data or enterprise confidential data.
- Real KYB/KYC documents.
- Real wallet ownership claims.
- Real bank, card, payout, deposit, or payment details.
- Real USDT, RMB, CNH, fiat, stablecoin, or customer balance data.
- Private keys, seed phrases, production API keys, production RPC URLs, signing credentials, or secrets.

If any real data or secret appears during preparation or a demo, stop immediately and treat it as an incident for human owner and security review.

## Validation Evidence

Before human review, run these exact commands from the repository root:

```bash
npm run test:ci
git diff --check
```

Record the command results in the branch agent report and in the pull request validation report when a PR is later opened. Browser checks are not required for this documentation-only playbook refresh unless a future branch touches UI behavior.

Evidence expected before review:

- Current branch name.
- Files changed.
- Output status for each validation command.
- Confirmation that no UI, package, Prisma, worker, contract, test, or runtime behavior changed.
- Confirmation that the playbook preserves the no-real-funds, no-real-USDT/RMB/CNH, no-mainnet, no-custody, no-payment-processing, and no-production-claims boundary.

## Meeting And Demo Checklist

Use this checklist before any enterprise-facing readiness meeting:

- Confirm the meeting is a technical demo or readiness review, not a production launch or commercial offering.
- Confirm the approved audience and meeting owner.
- Confirm the demo environment is local, testnet, hosted demo, or sandbox/mock only.
- Confirm all demo balances, companies, wallets, rates, risk cases, and settlement examples are synthetic.
- Confirm no production dashboards, production credentials, customer systems, or real payment providers are connected.
- Confirm the opening disclaimer is visible or read aloud.
- Confirm stop conditions and escalation contacts are known.
- Confirm notes capture questions and follow-up work without implying approval to launch.

Suggested opening disclaimer:

```text
ORMB is a portfolio and technical demo for testnet-first, whitelisted stablecoin issuance and enterprise settlement concepts. It is not a public RMB/CNH stablecoin, does not process real USDT, RMB, CNH, or customer funds, does not run on mainnet, and is not production payment or custody infrastructure.
```

## Go/No-Go Checklist

Go only if all items are true:

- Human owner, legal reviewer, and compliance reviewer have approved the exact readiness review scope.
- The environment is local, hosted demo, sandbox, or testnet only.
- Required validation commands pass.
- Demo data is synthetic and contains no secrets.
- The demo script contains no public stablecoin launch, production readiness, custody, payment processing, or compliance claims.
- The team is prepared to stop if asked about real funds, real assets, mainnet use, production launch, or live integrations.

No-go if any item is true:

- Real funds, real USDT, real RMB, real CNH, real customer data, or mainnet use is requested or implied.
- Legal or compliance approval is missing, conditional, stale, or unclear.
- Validation fails and has not been reviewed and accepted by the human owner.
- Secrets, private keys, seed phrases, or production credentials are needed.
- Demo behavior could reasonably be mistaken for live issuance, redemption, custody, settlement, or payment processing.
- Any participant asks to treat ORMB as a real financial product or public stablecoin offering.

## Stop Conditions

Stop preparation or the live demo immediately if:

- A participant requests real funds, real USDT, real RMB, real CNH, real customer deposits, or real-world settlement.
- A participant requests mainnet deployment, mainnet wallet signing, or production API credentials.
- A private key, seed phrase, secret, production credential, or real customer record appears.
- The demo produces output that appears to claim production readiness, legal approval, custody, payment processing, or public stablecoin issuance.
- Required validation evidence is missing or failed without explicit written human-owner acceptance.
- Legal, compliance, or security reviewers raise an unresolved blocker.
- The environment cannot be verified as local, hosted demo, sandbox, or testnet only.

When a stop condition occurs, end the demo path, record what happened, notify the human owner, and do not resume until the owner, legal, compliance, and security reviewers decide the next step.

## Required Human Review Packet

Before any future PR or external readiness review, provide:

- This playbook.
- The agent report for the branch.
- Validation command results.
- The exact demo script or meeting agenda.
- The list of demo environments and configuration assumptions.
- The list of known limitations and prohibited activities.
- Written confirmation that production readiness and live pilot approval remain out of scope.
