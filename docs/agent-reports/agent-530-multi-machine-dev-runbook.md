# Agent Report: Multi-Machine Development Runbook

## Branch

`agent/530-multi-machine-dev-runbook`

## Objective

Add a current docs-only runbook for multi-machine ORMB private staging development using GitHub as the source of truth.

## Changes Made

- Added `docs/MULTI_MACHINE_DEVELOPMENT.md` with clone, sync, local environment, local database, branching, PR, server update, conflict avoidance, and stop-condition guidance.
- Added a reference from `docs/AGENT_WORKFLOW.md` to the multi-machine runbook.

## Validation

- Command: `npm run test:ci`
- Result: Passed.
- Command: `git diff --check`
- Result: Passed. Git emitted a Windows line-ending warning for `docs/AGENT_WORKFLOW.md`, with no whitespace errors.

## Security Notes

- Documentation reinforces that `.env.local`, credentials, private keys, seed phrases, local databases, and local generated state are machine-specific and must not be committed or pasted into shared channels.
- No code, dependency, schema, API, UI, contract, worker, Docker, or Postgres behavior was changed.

## Demo Boundary Notes

- No real funds, real USDT, real RMB or CNH, customer deposits, mainnet deployment, production credentials, custody, payment processing, or live mint-burn behavior were introduced.
- The runbook limits private staging server updates to reviewed `dev`.

## Follow-Up Work

- None.
