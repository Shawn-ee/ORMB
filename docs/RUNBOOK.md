# Runbook

## Current Bootstrap Setup

The repository currently contains project structure, documentation, placeholder scripts, and minimal CI.

## Local Validation

Run:

```bash
npm run test:ci
```

The current scripts should pass without external services. Next.js build, Prisma validation, and contract tooling checks run locally without real credentials.

## Future Setup Expectations

Later branches will add:

- Business UI and API routes.
- Worker execution commands.
- Demo seed data.

## Worker Cores

The current deposit listener, confirmation worker, and risk engine implementations are testable cores only. They process supplied data and do not run live RPC polling loops or create mint requests.

Run unit tests:

```bash
npm run test
```

## Demo Seed Data

After configuring a local PostgreSQL `DATABASE_URL` and applying the schema in a future migration branch, seed deterministic demo companies and wallets:

```bash
npm run demo:seed
```

Do not run seed scripts against production databases.

## Contract Scripts

Base Sepolia contract scripts are documented in `docs/DEPLOYMENT.md`.

Do not run contract scripts with real funds or mainnet credentials. Scripts require `ORMB_CONFIRM_TESTNET_DEPLOY=YES` and are not executed by CI.

## Operational Boundary

Do not run production-like operations from this repository. Do not use mainnet keys, real deposits, real customers, real USDT, or real RMB.

## Creating and Merging Agent PRs

Agent branches target `dev`. Do not open agent PRs directly into `main`.

Before creating a PR, confirm the branch state:

```bash
git status --short --branch
git branch -vv --all
git remote -v
```

When the GitHub CLI is installed and authenticated, create the PR with an explicit base and head:

```bash
gh auth status
gh pr create --base dev --head agent/<goal> --title "<title>" --body-file <body-file>
```

If a PR already exists, do not create a duplicate. Report the existing PR URL.

Inspect checks before merging:

```bash
gh pr checks
gh pr status
```

If checks pass and repository rules allow the merge, merge the focused agent branch into `dev`. Prefer squash merge unless a stricter repository policy exists:

```bash
gh pr merge --squash
git switch dev
git pull origin dev
```

If `gh` is unavailable, provide the manual compare URL:

```text
https://github.com/Shawn-ee/ORMB/compare/dev...agent/<goal>?expand=1
```

Do not merge `dev` into `main` during normal agent work.

## Release Checklist Placeholder

Before merging `dev` into `main`, confirm:

- CI passes.
- Documentation is current.
- Demo walkthrough works.
- Security review is complete.
- Legal boundaries are current.
- No secrets are committed.
- No real money flow exists.
