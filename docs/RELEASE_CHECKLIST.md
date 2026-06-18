# Release Checklist: demo-v0

## Release Target

Target branch: `release/demo-v0`

Merge target: `dev`

Human approval required before any later `dev` to `main` merge.

## Required Validation

- [x] `npm install`
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm run build`
- [x] `npm run prisma:generate`
- [x] `npm run prisma:validate`
- [x] `npm run test`
- [x] `npm run test:contracts`
- [x] `npm run test:ci`
- [x] `npm run test:e2e`
- [x] `npm audit --json`

## Required Review

- [x] README setup and demo walkthrough are current.
- [x] `docs/DEMO_SCRIPT.md` is current.
- [x] `docs/KNOWN_LIMITATIONS.md` is current.
- [x] `docs/UI_REVIEW.md` has screenshot paths.
- [x] `docs/RELEASE_READINESS.md` has current verdict.
- [x] Dependency audit findings are accepted for local/testnet demo review or remediated.
- [x] No secrets are committed.
- [x] No mainnet deployment or mainnet defaults are introduced.
- [x] No real USDT, RMB, CNH, customer funds, or production payment behavior is introduced.
- [x] No page or document claims ORMB is a public stablecoin launch or real financial product.

## Current Status

Ready for human review after this release branch PR passes GitHub CI.

## Human Approval

The human owner must explicitly approve any promotion from `dev` to `main`. Agents must not perform that merge automatically.
