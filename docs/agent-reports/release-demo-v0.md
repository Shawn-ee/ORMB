# Agent Report: release/demo-v0

## Branch

`release/demo-v0`

## Objective

Prepare the ORMB `demo-v0` release package for human approval without merging `dev` into `main`.

## Files Changed

- `README.md`
- `docs/RUNBOOK.md`
- `docs/STRIPE_BRIDGE_ALIGNMENT.md`
- `docs/LEGAL_BOUNDARIES.md`
- `docs/SECURITY.md`
- `docs/DEMO_VERIFICATION.md`
- `docs/DEMO_SCRIPT.md`
- `docs/KNOWN_LIMITATIONS.md`
- `docs/RELEASE_CHECKLIST.md`
- `docs/agent-reports/release-demo-v0.md`

## Commands Run

- `npm install`: PASS, 25 audit findings reported.
- `npm run lint`: PASS, placeholder lint script.
- `npm run typecheck`: PASS.
- `npm run build`: PASS.
- `npm run prisma:generate`: PASS.
- `npm run prisma:validate`: PASS.
- `npm run test:contracts`: PASS, 15 contract tests.
- `npm run test`: PASS, 35 unit tests.
- `npm run test:ci`: PASS.
- `npm run test:e2e`: PASS, 12 Playwright browser checks.
- `npm audit --json`: exit code 1, 25 vulnerabilities total, 0 critical.

## Release Position

`demo-v0` is ready for human review after this release PR passes GitHub CI. No agent is authorized to merge `dev` into `main`.

## Safety Notes

- No business logic was added.
- No contracts were changed.
- No backend workers were changed.
- No secrets, mainnet settings, real funds, real USDT, real RMB/CNH, or production payment behavior were introduced.
- `git diff --check` passed.
- Safety wording scan found expected boundary language and placeholder environment variable names only.
