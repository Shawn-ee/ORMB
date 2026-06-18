# Runbook

## Current Bootstrap Setup

The repository currently contains project structure, documentation, placeholder scripts, and minimal CI.

## Local Validation

Run:

```bash
npm run test:ci
```

The bootstrap scripts are placeholders and should pass without external services.

## Future Setup Expectations

Later branches will add:

- Node and Next.js setup.
- Hardhat and contract compilation.
- Prisma schema and PostgreSQL setup.
- Base Sepolia deployment scripts.
- Worker execution commands.
- Demo seed data.

## Operational Boundary

Do not run production-like operations from this repository. Do not use mainnet keys, real deposits, real customers, real USDT, or real RMB.

## Release Checklist Placeholder

Before merging `dev` into `main`, confirm:

- CI passes.
- Documentation is current.
- Demo walkthrough works.
- Security review is complete.
- Legal boundaries are current.
- No secrets are committed.
- No real money flow exists.
