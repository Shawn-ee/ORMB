# Agent Report: Contract Deploy Scripts

## Phase Name

Smart contract tooling.

## Branch Name

`agent/011-contract-deploy-scripts`

## Agent Role

Contract Tooling Agent.

## Objective

Add guarded Base Sepolia contract scripts for deploying demo contracts, whitelisting wallets, and manually minting testnet ORMB.

## Non-Goals

- No real deployment.
- No mainnet configuration.
- No real private keys or RPC secrets.
- No backend mint engine.
- No deposit listener.
- No UI changes.

## Acceptance Criteria

- Scripts are Base Sepolia-only.
- Scripts require explicit `ORMB_CONFIRM_TESTNET_DEPLOY=YES`.
- `.env.example` documents required placeholders only.
- Deployment docs explain safety boundaries.
- Compile, typecheck, contract tests, and CI pass without real credentials.

## Files Changed

- `.env.example`
- `README.md`
- `docs/DEPLOYMENT.md`
- `docs/RUNBOOK.md`
- `docs/SECURITY.md`
- `docs/agent-reports/agent-011-contract-deploy-scripts.md`
- `package.json`
- `scripts/contract-script-guards.ts`
- `scripts/deploy-contracts.ts`
- `scripts/manual-mint.ts`
- `scripts/whitelist-wallet.ts`

## Validation Commands Run

- `npm run compile:contracts`
- `npm run typecheck`
- `npm run test:contracts`
- `npm run test:ci`
- `git status --short --branch`
- `git diff origin/dev`
- `rg -n "ORMB_CONFIRM_TESTNET_DEPLOY|mainnet|real funds|real USDT|real RMB|PRIVATE_KEY|seed phrase" scripts docs/DEPLOYMENT.md .env.example README.md docs/RUNBOOK.md docs/SECURITY.md`

## Validation Results

- `npm run compile:contracts` passed with no contracts needing recompilation.
- `npm run typecheck` passed with `tsc --noEmit`.
- `npm run test:contracts` passed with 15 contract tests.
- `npm run test:ci` passed. Placeholder lint/app tests, Prisma generate/validate, TypeScript, contract compile/tests, and Next.js production build completed successfully.
- Safety text search found the expected testnet confirmation guard, placeholder private-key variable name, and no-real-funds/no-mainnet boundary language.

## Self-Review Findings

- Scripts are Base Sepolia-only and require `ORMB_CONFIRM_TESTNET_DEPLOY=YES`.
- Scripts were not executed during validation and require human-provided testnet credentials.
- No real secrets, mainnet settings, production credentials, real funds, or product code behavior were added.
- Next.js validation generated an unrelated `next-env.d.ts` change, which was restored before commit.

## Improvements Applied

- Added shared script guard helpers for explicit testnet confirmation, Base Sepolia chain ID validation, address validation, and positive amount validation.
- Added deployment documentation and runbook/security references.

## Remaining Risks

- Scripts are not executed in CI because they require human-provided testnet credentials.
- Future testnet execution should be captured in a deployment report.

## Follow-Up Tasks

- Add Prisma business schema in `agent/020-domain-schema`.

## Next Recommended Branch

`agent/020-domain-schema`

## PR Status

- PR opened: pending.
- PR merged into `dev`: pending.
