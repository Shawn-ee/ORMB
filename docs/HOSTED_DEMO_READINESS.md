# Hosted Demo Readiness

## Purpose

This document defines the readiness boundary for an ORMB hosted demo under Enterprise Pilot Readiness v1. It is a read-only documentation and validation package for a portfolio demo.

This document does not approve production use, public token launch, custody, payment processing, live settlement, real funds, real USDT, real RMB/CNH, mainnet deployment, or live mint/burn behavior.

ORMB remains testnet-first, mock-asset-only, no-real-funds, no-mainnet, and non-production.

## Current Verdict

Read-only hosted demo: **Conditionally ready for human review after validation.**

Hosted demo with live mutations, live worker runners, live RPC polling, database writes, contract calls, payouts, company onboarding submissions, or user-submitted regulated data: **Not ready.**

Production, public RMB/CNH stablecoin launch, retail token offering, real-funds pilot, custody service, or payment-processing deployment: **Prohibited without explicit written human-owner approval plus legal, compliance, security, and business review.**

## Hosted Demo Boundary

A hosted demo may be considered only when all of these remain true:

- The deployed experience is static or effectively read-only.
- `ORMB_ENV_MODE=hosted-demo`.
- `ORMB_READ_ONLY_DEMO_MODE=true`.
- `ORMB_CONFIRM_TESTNET_DEPLOY=NO`.
- No deployer private key, seed phrase, funded wallet, production credential, RPC secret, or customer secret is configured.
- No live admin approval, mint, burn, redemption, transfer, onboarding, webhook, settlement, reconciliation, or monitoring action mutates state.
- No real customer data, KYB/KYC document, customer deposit, customer wallet, private key, seed phrase, RPC secret, database credential, payment credential, or production credential is collected, stored, or committed.
- No mainnet network, mainnet token, real USDT, real RMB/CNH, real customer funds, public RMB/CNH stablecoin claim, custody claim, or payment-processing claim is used.
- Safety boundary copy remains visible on the public demo routes covered by browser validation.

## What Must Not Be Enabled

Do not enable any of the following in a hosted demo:

- Mainnet RPC endpoints, mainnet contract addresses, mainnet wallets, or mainnet deploy scripts.
- Real USDT, real RMB, real CNH, customer deposits, cash equivalents, or any asset with real-world redemption value.
- Custody, payment processing, fiat rails, payout rails, production banking integrations, or live settlement.
- Live mint, burn, redemption, transfer, whitelist mutation, admin approval, or risk-decision execution.
- Persistent worker loops, background listeners, webhook receivers, scheduled jobs, or chain polling that can write state.
- Production databases, production object storage, production monitoring tokens, private provider RPC keys, or analytics tied to real users.
- Real company onboarding, real KYB/KYC collection, sanctions screening submissions, or personal data collection.
- Claims that ORMB is production-ready, legally approved, regulated, redeemable, publicly available, or a public RMB/CNH stablecoin.

## Environment Expectations

The hosted-demo environment must be reviewed against `.env.example`. Placeholder values are acceptable; real secrets are not.

| Variable | Hosted-demo expectation |
| --- | --- |
| `ORMB_ENV_MODE` | Must be `hosted-demo`. |
| `ORMB_READ_ONLY_DEMO_MODE` | Must be `true`. |
| `DATABASE_URL` | Must not point to a production database. A static/read-only demo should not require database writes. |
| `BASE_SEPOLIA_RPC_URL` | Leave as a placeholder unless a future approved branch documents a read-only RPC use case and provider-key handling. Do not use a private provider secret for this package. |
| `BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY` | Must be unset or the all-zero placeholder from `.env.example`. Never use a real key, seed phrase, funded wallet, or production wallet. |
| `ORMB_CONFIRM_TESTNET_DEPLOY` | Must be `NO`; never `YES` for hosted-demo readiness. |
| `ORMB_CONTRACT_ADDRESS` | Placeholder only unless a future approved testnet-only branch documents a read-only contract reference. No mainnet address. |
| `MOCK_USDT_CONTRACT_ADDRESS` | Placeholder or mock testnet-only reference only. Never real USDT. |
| `WHITELIST_WALLET` | Placeholder only; no real customer wallet. |
| `WHITELIST_ENABLED` | May remain a mock/demo flag only; it must not control live access to funds or live mint/burn behavior. |
| `MINT_TO_ADDRESS` | Placeholder only; no real recipient wallet. |
| `MINT_AMOUNT_ORMB` | Must remain `0` for hosted-demo readiness. |

## No-Secret Policy

- Do not commit `.env`, real keys, seed phrases, wallet files, private RPC URLs, database passwords, payment credentials, API tokens, or production credentials.
- Do not paste secrets into deployment dashboards, PR descriptions, issue comments, screenshots, logs, or browser evidence.
- Hosted-demo configuration must be reproducible from `.env.example` using placeholders and read-only flags.
- Any discovered secret or real credential is a stop condition. Remove the hosted demo, rotate the credential, and document the incident before resuming.

## Required Validation Commands

Run these commands before approving the hosted demo and before any refresh after a material change:

```bash
npm run test:ci
npm run test:e2e
git diff --check
```

Recommended supporting checks before external sharing:

```bash
git status --short --branch
npm audit --json
```

`npm audit fix --force` is not approved for this readiness package.

## CI And Browser Evidence

The readiness decision must record evidence from:

- `npm run test:ci` for unit, integration, lint, type, build, and repository checks included in the project CI script.
- `npm run test:e2e` for browser coverage of the hosted-demo routes and safety boundary copy.
- `git diff --check` for whitespace and patch hygiene.

Current browser smoke coverage is expected to include the public demo routes used by the existing Playwright suite, including `/`, `/demo`, `/admin`, `/company`, and `/status`. Browser evidence must show route loading, visible safety boundaries, no real-funds positioning, and no captured page or console errors. Existing screenshot evidence from earlier browser reviews remains under `docs/ui-screenshots/`; rerun `npm run test:e2e` for the current branch before relying on it.

## Pre-Demo Checklist

Complete this checklist before a human owner shares any hosted-demo URL:

- [ ] Confirm the branch, commit, URL, intended audience, and demo duration.
- [ ] Confirm the deployment is static or read-only and uses `ORMB_ENV_MODE=hosted-demo`.
- [ ] Confirm `ORMB_READ_ONLY_DEMO_MODE=true` and `ORMB_CONFIRM_TESTNET_DEPLOY=NO`.
- [ ] Confirm no deployer private key, seed phrase, funded wallet, private RPC secret, production database, payment credential, or customer credential is configured.
- [ ] Confirm no mainnet, real USDT, real RMB/CNH, customer funds, custody, payment processing, or live mint/burn behavior is enabled.
- [ ] Confirm mutation routes, worker commands, listeners, deploy scripts, webhooks, and scheduled jobs cannot run in the hosted environment.
- [ ] Confirm all visible copy describes ORMB as a portfolio/technical demo, not a public stablecoin or production financial product.
- [ ] Run `npm run test:ci`.
- [ ] Run `npm run test:e2e`.
- [ ] Run `git diff --check`.
- [ ] Review dependency findings with `npm audit --json` and accept them only for the exact read-only posture or remediate them on a focused branch.
- [ ] Confirm the human owner approves the exact hosted URL before external sharing.

## Deployment Stop Conditions

Stop deployment, remove access if already live, and do not resume until a focused fix is reviewed when any of these are true:

- Any mainnet endpoint, mainnet contract, real USDT, real RMB/CNH, real customer funds, funded wallet, or real private key is present.
- Any custody, payment-processing, fiat-rail, payout, redemption, mint, burn, transfer, whitelist mutation, or admin approval path can execute against live state.
- Any production database, production credential, private RPC secret, payment secret, customer data, KYB/KYC artifact, or personal data is exposed.
- Safety boundary copy is missing from a public route covered by the demo.
- `npm run test:ci`, `npm run test:e2e`, or `git diff --check` fails without a documented, human-approved exception.
- The hosted page claims production readiness, legal/compliance approval, real-world redemption, or public RMB/CNH stablecoin availability.

## Rollback And Removal Checklist

If a hosted demo must be removed or rolled back:

- [ ] Disable or delete the hosted deployment or preview URL.
- [ ] Revoke public access controls, invite links, deployment aliases, and shared preview links.
- [ ] Confirm no worker, listener, webhook, scheduled job, deploy script, or database migration remains active.
- [ ] Remove any environment variable that is not a placeholder or read-only flag.
- [ ] Rotate any credential that may have been exposed, even if it was intended to be test-only.
- [ ] Preserve validation logs and browser evidence needed for the audit trail without retaining secrets.
- [ ] Document the reason, time, branch, commit, owner decision, and follow-up branch in the relevant agent report.
- [ ] Re-run the required validation commands before restoring any hosted-demo URL.

## Post-Demo Checklist

Complete this after each hosted-demo window:

- [ ] Remove or disable the shared hosted-demo URL unless the human owner explicitly approves continued access.
- [ ] Confirm no real user data, company data, customer funds, wallet material, or credentials were collected.
- [ ] Confirm no database writes, contract calls, worker loops, webhooks, payment events, custody flows, or live mint/burn behavior occurred.
- [ ] Review browser logs, deployment logs, and CI output for errors or boundary violations.
- [ ] Record validation results, findings, blockers, and follow-up work in `docs/agent-reports/`.
- [ ] Open a focused follow-up branch for any issue; do not patch unrelated docs or runtime code from this readiness branch.
