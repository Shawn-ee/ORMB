# Admin Dashboard

## Purpose

The admin dashboard is a static demo operations workspace for reviewing the ORMB lifecycle from an operator perspective.

## Current Implementation

The page is implemented at `/admin` in the Next.js app shell and uses static demo data only.

It displays:

1. Operational metrics for companies, mint approvals, redemptions, and risk events.
2. Enterprise review rails for risk case triage, ledger reconciliation, and audit coverage.
3. Enterprise onboarding and wallet review queue.
4. Mint approval queue with fixed FX and ORMB amounts.
5. Redemption review queue with burn status.
6. Risk event list.
7. Reconciliation summary.
8. Audit log activity.

## Safety Boundary

The dashboard does not execute approvals, minting, burning, payouts, database writes, contract calls, or real payment actions. It is a portfolio demo view over representative static data.
