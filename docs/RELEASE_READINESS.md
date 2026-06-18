# Release Readiness

## Current Verdict

`release/323-enterprise-pilot-readiness-v1-refresh` refreshes ORMB as an Enterprise Pilot Readiness v1 human-review discussion package only. It is not approved for `main`, production, real funds, real USDT, real RMB/CNH, mainnet, custody, payment processing, live mint/burn behavior, or external enterprise pilot use.

Human owner approval is required before any merge into `dev`. Human owner, legal, and compliance approval are required before any enterprise pilot discussion. Human owner written approval is required before any later `dev` to `main` promotion.

## Readiness Levels

| Level | Release Status |
| --- | --- |
| Local demo | Ready for human review after branch 323 validation passed. |
| Stripe/Bridge portfolio demo | Ready for human review as documentation-only narrative, with no partnership or integration claim. |
| Hosted demo | Conditional static/read-only candidate only after owner approval of exact URL, audience, duration, environment posture, screenshots, dependency risk, and rollback. |
| Enterprise pilot readiness | Discussion package only after owner, legal, and compliance approval. Not an approved pilot. |
| Production readiness | Not ready and not approved. |

## Completed Gates

- Contract tests cover ORMBToken and MockUSDT demo behavior.
- Worker-core unit tests cover deposit listener, confirmation worker, risk engine, mint request flow, redemption burn flow, listener recovery, listener taxonomy, ledger invariants, risk case management, and worker status behavior.
- Static admin, company, demo flow, and status pages exist with explicit demo boundaries.
- Browser checks cover desktop and mobile release routes, navigation, safety boundary copy, admin enterprise review concepts, and company pilot participant boundaries.
- Operator runbook, incident response, hosted-demo readiness, enterprise pilot playbook, scorecard, dependency posture, and Stripe/Bridge-style portfolio package are documented.
- Branches 310-322 refreshed CI, dependency posture, listener recovery and audit policy, listener taxonomy, risk case handling, ledger reconciliation, redemption burn safety, operator drills, pilot playbook, hosted-demo readiness, enterprise UI, and portfolio packaging.
- No mainnet deployment, real secrets, real funds, real USDT, real RMB/CNH, customer deposits, custody, payment processing, live mint/burn behavior, or production claims were introduced.

## Dependency Audit Status

Most recent documented local audit evidence from `audit/311-dependency-posture-refresh`:

- Command: `npm audit --json`
- Exit code: 1
- Low: 8
- Moderate: 9
- High: 8
- Critical: 0
- Total: 25

`npm outdated` reported no outdated direct dependencies. No `npm audit fix --force` was run. The findings remain accepted only for local/testnet portfolio-demo work and conditional static/read-only hosted-demo review after explicit human owner approval. They remain blockers for production, real-funds handling, mainnet, customer deposits, custody, payment processing, live mint/burn behavior, and public financial-product claims.

## Validation Evidence

Commands run for branch 323:

```bash
npm run test:ci
npm run test:e2e
git diff --check
```

Results:

- `npm run test:ci`: passed. Included placeholder lint, Prisma generate, TypeScript check, Prisma validate, 94 unit tests, contract compile, 15 contract tests, and Next build.
- `npm run test:e2e`: passed. Playwright ran 16 desktop and mobile checks.
- `git diff --check`: passed with line-ending normalization warnings for the edited Markdown files only.

## Remaining Release Tasks

- Human owner reviews branch 323 validation evidence.
- Review `docs/ENTERPRISE_PILOT_READINESS_V1.md`, `docs/ENTERPRISE_PILOT_READINESS_SCORECARD.md`, `docs/HOSTED_DEMO_READINESS.md`, `docs/ENTERPRISE_PILOT_PLAYBOOK.md`, `docs/STRIPE_BRIDGE_PORTFOLIO_PACKAGE.md`, and `docs/DEPENDENCY_AUDIT.md`.
- Human owner decides whether the unresolved dependency audit findings are acceptable for the exact local, portfolio, or static/read-only hosted review use case.
- Human owner approves or rejects any merge of branch 323 into `dev`.
- Open next audit branch `audit/324-enterprise-pilot-readiness-v1-review` for release package review.
- Human owner explicitly approves or rejects any later `dev` to `main` release action in writing.

## Stop Conditions

Stop release review if any real funds, real USDT, real RMB/CNH, customer deposits, private keys, seed phrases, production credentials, mainnet configuration, custody flow, payment-processing flow, live mint/burn behavior, public RMB/CNH stablecoin claim, legal/compliance approval claim, partnership claim, or production-readiness claim is found.

Stop release review if `npm run test:ci`, `npm run test:e2e`, or `git diff --check` fails, or if dependency findings materially worsen without a new human risk decision.

## Not Approved

- Do not merge `dev` into `main`.
- Do not deploy to mainnet.
- Do not use real USDT, real RMB/CNH, customer funds, production credentials, private keys, or seed phrases.
- Do not process custody, payments, settlement, redemption, or live mint/burn behavior.
- Do not market ORMB as a real public stablecoin, public RMB/CNH stablecoin, financial product, production service, legal/compliance-approved pilot, or Stripe/Bridge-integrated service.
