# Demo Flow Page

## Purpose

The demo flow page provides a static end-to-end walkthrough of the ORMB testnet lifecycle for technical reviewers.

## Current Implementation

The page is implemented at `/demo` in the Next.js app shell and uses static demo content only.

It displays:

1. A 12-step lifecycle from enterprise onboarding through audit review.
2. A map from lifecycle areas to implemented contracts, worker cores, dashboards, and safety documentation.
3. Safety checkpoints for no real funds, no real USDT/RMB, no mainnet keys, and no production actions.

## Safety Boundary

The page is a read-only walkthrough. It does not call APIs, submit transactions, deploy contracts, write to the database, trigger workers, move funds, or perform real payment activity.
