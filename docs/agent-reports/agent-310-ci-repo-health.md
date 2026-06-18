# Agent Report: `agent/310-ci-repo-health`

## Branch

`agent/310-ci-repo-health`

## Objective

Align GitHub Actions validation with the fresh-machine setup baseline by using lockfile-based dependency installation and running browser checks in CI.

## Changes Made

- Updated `.github/workflows/ci.yml` to use `npm ci` with npm cache support.
- Added Playwright Chromium installation and `npm run test:e2e` to CI validation.
- Updated setup and validation docs to prefer `npm ci`.

## Validation

- `npm ci`: PASS
  - Installed from `package-lock.json`.
  - Known audit output remains `25` findings: `8 low`, `9 moderate`, `8 high`, `0 critical`.
- `npm run test:ci`: PASS
  - Prisma generate and validate passed.
  - TypeScript passed.
  - Unit tests passed: `86`.
  - Contract compile passed.
  - Contract tests passed: `15`.
  - Next production build passed.
- `npx playwright install chromium`: PASS
- `npm run test:e2e`: PASS
  - Playwright checks passed: `16`.
- `git diff --check`: PASS

## Security Notes

- No secrets, deployer keys, RPC credentials, production credentials, or `.env` files were added.
- The workflow does not run deployment, mint, whitelist, or manual contract scripts.
- Browser checks run against the local production Next.js build served by Playwright config.

## Demo Boundary Notes

- No real funds, real USDT, real RMB/CNH, custody, payment processing, mainnet deployment, or production claims were introduced.
- ORMB remains testnet/mock-only and non-production.

## Follow-Up Work

- Run `audit/311-dependency-posture-refresh` after this branch to re-check the documented dependency audit posture.
