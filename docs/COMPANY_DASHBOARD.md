# Company Dashboard

## Purpose

The company dashboard is a static demo workspace for a whitelisted enterprise participating in the ORMB testnet settlement lifecycle.

## Current Implementation

The page is implemented at `/company` in the Next.js app shell and uses static demo data only.

It displays:

1. ORMB, deposit, mint, and redemption metrics.
2. Pilot participation guidance, operator handoff boundaries, and support/escalation context.
3. MockUSDT deposit lifecycle status.
4. Demo deposit instructions.
5. Whitelisted company wallets.
6. Enterprise-to-enterprise transfer activity.
7. Redemption request status.
8. Recent lifecycle activity.

## Safety Boundary

The dashboard does not submit deposits, create mint requests, transfer ORMB, request redemption, verify burns, write to the database, call contracts, or move real funds. It is a portfolio demo view over representative static data.
