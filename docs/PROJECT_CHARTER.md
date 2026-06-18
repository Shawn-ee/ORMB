# Project Charter

## Mission

ORMB demonstrates a testnet-first, whitelisted stablecoin issuance and enterprise settlement flow suitable for a smart contract engineering portfolio.

The system should show how an enterprise stablecoin payment product could be designed without claiming to operate a real financial product or handling real funds.

## MVP Demo Flow

The target demo includes:

1. Whitelisted enterprise onboarding.
2. Mock USDT deposit detection.
3. Confirmation handling.
4. Fixed FX conversion.
5. Mint request lifecycle.
6. Manual approval.
7. ORMB minting.
8. Enterprise-to-enterprise ORMB transfer.
9. Redemption request.
10. Burn verification.
11. Audit logs.
12. Admin dashboard.
13. Company dashboard.

## Engineering Goals

- Solidity smart contract design.
- Stablecoin mint and burn lifecycle.
- Hot wallet and deposit monitoring assumptions.
- Ledger reconciliation.
- Idempotent event processing.
- API-first payment infrastructure.
- Security-first engineering.
- Documentation and CI discipline.

## Explicit Non-Goals

- No public stablecoin launch.
- No production payment processing.
- No real customer funds.
- No mainnet deployment.
- No real USDT or RMB handling.
- No retail trading flows.

## Bootstrap Deliverable

The first repository milestone creates only the framework for future agent work: documents, directories, placeholder scripts, and CI.
