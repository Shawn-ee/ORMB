# Release Readiness

## Current Verdict

`demo-v0` is ready to enter release packaging, but it is not approved for `main`.

The next branch should be `release/demo-v0` into `dev`. Human owner approval is still required before any merge from `dev` to `main`.

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

- Prepare `release/demo-v0`.
- Polish README setup and walkthrough instructions.
- Add `docs/DEMO_SCRIPT.md`.
- Add `docs/KNOWN_LIMITATIONS.md`.
- Add `docs/RELEASE_CHECKLIST.md`.
- Confirm screenshot paths and browser command in release docs.
- Re-run the full validation matrix on the release branch.
- Present `release/demo-v0` for human review.

## Not Approved

- Do not merge `dev` into `main`.
- Do not deploy to mainnet.
- Do not use real USDT, real RMB/CNH, customer funds, production credentials, or seed phrases.
- Do not market ORMB as a real public stablecoin or financial product.
