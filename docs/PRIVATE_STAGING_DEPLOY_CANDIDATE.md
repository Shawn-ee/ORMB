# Private Staging Deploy Candidate

## Scope

This document packages ORMB Private Interactive Testnet Staging for human review. It does not authorize production, mainnet, real funds, real USDT, real RMB/CNH, custody, customer data, public financial-product claims, or real payouts.

## Candidate Verdict

Ready for human review.

The repository is ready for the owner to review the private staging package and decide whether to run an owner-only Base Sepolia test with testnet assets. The repository is not production-ready and is not approved for a real enterprise pilot, public hosted write access, real funds, or mainnet.

## Current Baseline

- Branch target: `dev`
- Release candidate branch: `release/530-private-staging-deploy-candidate`
- Private staging chain: Base Sepolia `84532`
- Asset boundary: mock/testnet only
- Admin access boundary: owner-only private staging Basic Auth
- Live transaction boundary: guarded scripts only, never CI, never automatic workers

## Included Capabilities

- Strict private staging environment preflight.
- Offline mint/burn transaction dry-run checks.
- Base Sepolia deployment preflight.
- Guarded deploy script.
- Guarded minter role verify/grant/revoke script.
- Guarded whitelist script.
- Guarded manual mint script.
- Guarded burn script.
- Protected admin API routes for manual deposits, mint approval, redemption approval, burn evidence verification, simulated payout, reconciliation, and audit logs.
- Admin UI controls for the protected private staging routes.
- Local-only evidence bundle template.
- Security review and legal boundary docs.
- CI, unit, contract, build, and Playwright validation.

## Human Approval Gates

The owner must approve all of the following before any live Base Sepolia private staging test:

1. `.env` is local/server-only and untracked.
2. `BASE_SEPOLIA_CHAIN_ID=84532`.
3. RPC URL is Base Sepolia and does not point to mainnet.
4. Private keys are testnet-only and not reused.
5. Basic Auth is enabled for `/admin` and `/api/admin/**`.
6. Contract addresses are Base Sepolia deployments for this demo.
7. Minter role and whitelist state are verified.
8. `npm run staging:preflight -- --env-file .env` passes.
9. `npm run staging:tx-dry-run -- --env-file .env` passes.
10. `npm run test:ci`, `npm run test:e2e`, and `npm run build` pass.
11. Dependency audit residual risk is accepted for owner-only testnet staging only.
12. Evidence capture uses `docs/PRIVATE_STAGING_EVIDENCE_BUNDLE.md` and stays local/untracked if sensitive.

## Owner Execution Order

Run only after reviewing `docs/PRIVATE_STAGING_LIVE_TEST_CHECKLIST.md`.

```bash
git checkout dev
git pull --ff-only origin dev
npm ci
npx prisma generate
npx prisma validate
npm run staging:preflight -- --env-file .env
npm run staging:tx-dry-run -- --env-file .env
npm run test:ci
npm run test:e2e
npm run build
git diff --check
```

Optional database setup:

```bash
npm run db:up
npm run db:migrate:local
npm run db:seed
```

Contract preparation:

```bash
npm run deploy:preflight -- --env-file .env
npm run deploy:contracts
MINTER_ROLE_ACTION=verify npm run contracts:minter-role
MINTER_ROLE_ACTION=grant ORMB_CONFIRM_TESTNET_DEPLOY=YES npm run contracts:minter-role
npm run contracts:whitelist
```

Live staging transaction scripts, only with explicit owner approval and local testnet values:

```bash
npm run contracts:manual-mint
npm run contracts:burn
```

## Required Evidence

Use `docs/PRIVATE_STAGING_EVIDENCE_BUNDLE.md` for local evidence capture.

Required local evidence:

- Git commit SHA.
- Base Sepolia chain ID.
- ORMB contract address.
- MockUSDT contract address, if used.
- Minter role verification.
- Whitelist verification.
- Manual simulated deposit ID.
- Mint request ID.
- Mint transaction hash.
- Redemption ID.
- Burn transaction hash and log index.
- Burn evidence validation result.
- Simulated payout completion.
- Reconciliation summary.
- AuditLog row IDs.

Do not commit completed evidence if it contains secrets, `.env`, RPC tokens, passwords, private keys, customer data, or sensitive infrastructure details.

## Dependency Audit Status

`npm audit --json` was re-run for this candidate:

- Low: 8
- Moderate: 9
- High: 8
- Critical: 0
- Total: 25

`npm outdated` reported no outdated direct dependencies.

Residual dependency findings are accepted only for owner-only local/private Base Sepolia staging review after human approval. They remain blockers for production, public write access, mainnet, real funds, real assets, or customer data.

## Stop Conditions

Stop immediately if:

- Chain ID is not `84532`.
- RPC endpoint is mainnet, Base mainnet, or ambiguous.
- A private key may be mainnet-funded, reused, or exposed.
- Basic Auth is disabled or bypassed.
- Minter role or whitelist status is unclear.
- Any command would use real funds, real USDT, real RMB/CNH, customer data, custody, or real payout.
- `npm run contracts:manual-mint` or `npm run contracts:burn` fails for an unclear reason.
- Reconciliation does not match expected deposit, mint, burn, and supply state.
- A legal, compliance, security, or dependency concern requires human approval.

## Final Position

Ready for human review.

Not production-ready. Not approved for mainnet. Not approved for real funds, real USDT, real RMB/CNH, customer data, custody, public issuance, or real payouts.
