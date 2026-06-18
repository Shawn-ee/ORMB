# Release Readiness

## Current Verdict

`demo-v0` is ready for human review after the `release/demo-v0` PR passes GitHub CI, but it is not approved for `main`.

Human owner approval is still required before any merge from `dev` to `main`.

## Completed Gates

- Contract tests cover ORMBToken and MockUSDT demo behavior.
- Worker-core unit tests cover deposit listener, confirmation worker, risk engine, mint request flow, and redemption burn flow.
- Static admin, company, demo flow, and monitoring pages exist.
- Browser smoke checks opened and verified the reviewed routes in desktop and mobile Chromium.
- Screenshots were captured under `docs/ui-screenshots/`.
- Safety disclaimers remain visible in the app shell.
- No mainnet deployment, real secrets, real funds, real USDT, real RMB/CNH, or customer-fund behavior was introduced.

## Dependency Audit Status

`npm audit --json` was re-run on 2026-06-18:

- Exit code: 1
- Low: 8
- Moderate: 9
- High: 8
- Critical: 0
- Total: 25

The findings are accepted only for local/testnet demo review because no critical advisories are reported, direct dependencies are already current per the existing audit, and the demo is not a production hosted service. A dependency-hardening branch remains required before any hosted, public, or production-like deployment.

## Remaining Release Tasks

- Merge the `release/demo-v0` PR into `dev` only after GitHub CI passes.
- Human owner reviews `docs/DEMO_SCRIPT.md`, `docs/KNOWN_LIMITATIONS.md`, `docs/RELEASE_CHECKLIST.md`, and screenshot evidence.
- Human owner decides whether the unresolved dependency audit findings are acceptable for the portfolio demo.
- Human owner explicitly approves or rejects any later `dev` to `main` release action.

## Not Approved

- Do not merge `dev` into `main`.
- Do not deploy to mainnet.
- Do not use real USDT, real RMB/CNH, customer funds, production credentials, or seed phrases.
- Do not market ORMB as a real public stablecoin or financial product.
