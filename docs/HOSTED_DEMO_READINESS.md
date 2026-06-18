# Hosted Demo Readiness

## Purpose

This document defines what would be required before ORMB is shared as a hosted demo. It does not approve hosting, production use, real funds, real USDT, real RMB/CNH, mainnet deployment, custody, redemption, or payment processing.

ORMB remains testnet-only, mock-asset-only, no-real-funds, no-mainnet, and non-production.

## Current Verdict

Read-only hosted demo: **Conditionally ready for human review.**

Hosted demo with live mutations, live worker runners, live RPC polling, database writes, contract calls, payouts, or user-submitted data: **Not ready.**

Production or enterprise pilot with real funds: **Not ready and prohibited without explicit human, legal, compliance, security, and business approval.**

## Approved Hosted-Demo Shape

A hosted demo may be considered only if all of these remain true:

- The app is served as static/read-only demo pages.
- `ORMB_ENV_MODE=hosted-demo`.
- `ORMB_READ_ONLY_DEMO_MODE=true`.
- No deployer private key is configured.
- `ORMB_CONFIRM_TESTNET_DEPLOY` is not `YES`.
- No live admin approval, mint, redemption, transfer, onboarding, or monitoring action can mutate state.
- No real customer data, private keys, seed phrases, RPC secrets, database credentials, or production credentials are committed.
- No mainnet network, mainnet token, real USDT, real RMB/CNH, or real customer funds are used.
- Safety disclaimers remain visible on every public route.

## Prohibited Hosted-Demo Shape

Do not host ORMB in a mode that:

- accepts real deposits
- accepts real company onboarding data
- stores real KYB/KYC documents
- connects to production databases
- runs persistent worker loops
- executes contract scripts
- stores or uses private keys
- offers redemption for real-world value
- claims production readiness or legal/compliance approval
- presents ORMB as a public RMB/CNH stablecoin

## Required Pre-Host Checklist

Before a human owner approves any hosted demo:

- [ ] `npm run test:ci` passes.
- [ ] `npm run test:e2e` passes.
- [ ] `npm audit --json` is rechecked.
- [ ] Dependency findings are accepted for the exact hosted-demo posture or remediated.
- [ ] `docs/DEPENDENCY_AUDIT.md` is current.
- [ ] `docs/UI_REVIEW.md` or a newer browser review confirms disclaimers on `/`, `/demo`, `/admin`, `/company`, and `/status`.
- [ ] Environment values are reviewed against `docs/SECRET_MANAGEMENT.md`.
- [ ] No `.env` file, real key, seed phrase, RPC secret, or database credential is committed.
- [ ] Hosted environment does not expose mutation routes or worker commands.
- [ ] Human owner approves the exact URL, audience, and duration.

## Environment Requirements

For a safe read-only hosted demo:

```text
ORMB_ENV_MODE=hosted-demo
ORMB_READ_ONLY_DEMO_MODE=true
ORMB_CONFIRM_TESTNET_DEPLOY=NO
BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY=<unset>
```

Do not set `DATABASE_URL` to a production database. A static/read-only demo should not require database writes.

Do not configure `BASE_SEPOLIA_RPC_URL` with a private provider secret unless a future approved branch introduces a read-only RPC use case and documents the provider-key handling model.

## Dependency Audit Decision

As of the `audit/280-hosted-demo-readiness` review, `npm audit --json` still reports known findings:

- Low: 8
- Moderate: 9
- High: 8
- Critical: 0
- Total: 25

These findings may be acceptable only for a static/read-only hosted demo after human owner review because the demo does not process user-generated CSS, live payments, real assets, customer funds, production database writes, or contract transactions.

They are not acceptable for production, real-funds use, mainnet deployment, custody, or public payment processing.

## Browser Evidence

Current Playwright smoke coverage checks:

- `/`
- `/demo`
- `/admin`
- `/company`
- `/status`

The suite verifies route loading, navigation, safety boundary copy, and no captured page or console errors. Screenshots from the prior browser review are stored under `docs/ui-screenshots/`.

Before external sharing, rerun:

```bash
npm run test:e2e
```

## Deployment Boundary

This repository does not currently define a deployment target. Acceptable future hosted-demo work may document:

- static hosting
- preview deployments
- read-only environment variables
- no-mutation route guards
- security headers
- cache behavior
- rollback steps

It must not deploy anything without explicit human owner approval.

## Remaining Follow-Up

- `agent/270-admin-risk-review-ui`: improve enterprise risk/reconciliation explanations.
- `agent/272-company-pilot-flow-ui`: improve pilot participant guidance.
- `audit/274-browser-enterprise-readiness-review`: rerun browser review after UI changes.
- `agent/300-api-contract-docs`: document API boundaries before any live integration discussion.
- `agent/301-worker-adapter-boundary-docs`: document durable worker adapter boundaries.
- `agent/302-database-migration-runbook`: document migration safety.
- `agent/303-audit-retention-docs`: document audit retention/export assumptions.
