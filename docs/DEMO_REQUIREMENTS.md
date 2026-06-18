# Demo Requirements

The ORMB demo must show a professional, end-to-end stablecoin payment infrastructure lifecycle while remaining testnet-only and non-production.

## Required Demo Stages

1. Admin creates or reviews a whitelisted enterprise.
2. Enterprise receives mock deposit instructions.
3. Worker detects a mock USDT deposit.
4. Worker tracks confirmation count.
5. System applies a fixed FX conversion assumption.
6. System creates a mint request.
7. Admin manually approves the mint request.
8. System mints ORMB on Base Sepolia.
9. Enterprise transfers ORMB to another whitelisted enterprise.
10. Enterprise requests redemption.
11. System verifies burn.
12. Admin reviews audit logs and reconciliation records.

## Required Dashboards

- Admin dashboard for onboarding, approvals, chain activity, reconciliation, and audit logs.
- Company dashboard for deposits, balances, transfers, redemptions, and request status.

## Demo Data Rules

- Use deterministic mock data where possible.
- Use Base Sepolia testnet assets only.
- Never require real USDT, real RMB, real customers, or production credentials.

## Acceptance Standard

The final demo should be clear enough for a technical reviewer to inspect architecture, state transitions, smart contract boundaries, and operational assumptions.
