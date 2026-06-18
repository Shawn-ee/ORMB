# Known Limitations

## Demo Scope

ORMB `demo-v0` is a local/testnet technical demo. It is not a hosted production service and does not process real assets.

## Product Limitations

- No live onboarding API.
- No live admin approval API.
- No live company self-service actions.
- No production authentication or authorization layer.
- No hosted database, queue, or worker runtime.
- No production monitoring or alerting.
- No external compliance provider integration.

## Blockchain Limitations

- No mainnet deployment.
- No real USDT integration.
- No real RMB/CNH reserve, redemption, or payout integration.
- Base Sepolia scripts require explicit testnet confirmation and are not run by CI.
- Contract gateway submission is abstracted for tests and not wired to a live production service.

## Data Limitations

- Dashboards use representative static demo data.
- Prisma schema and seed script exist for local development, but no migration/deployment pipeline is included.
- Worker cores process supplied data in tests; they are not durable polling loops.

## Security Limitations

- `npm audit --json` currently reports 25 vulnerabilities: 8 low, 9 moderate, 8 high, and 0 critical.
- Findings are accepted only for local/testnet demo review.
- Dependency hardening is required before any hosted, public, or production-like deployment.
- Lint remains a placeholder script.

## Review Limitations

- Browser verification is smoke-level desktop/mobile Chromium coverage.
- No full accessibility audit has been completed.
- No external smart contract audit has been completed.
- No load, performance, or incident-response exercises have been completed.
