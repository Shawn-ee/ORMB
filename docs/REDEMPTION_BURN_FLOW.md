# Redemption Burn Flow

## Purpose

The redemption burn flow models a company-requested ORMB redemption in the local/testnet demo by requiring manual approval, verifying a supplied burn event, and recording a simulated payout completion.

This is a deterministic worker core for Enterprise Pilot Readiness v1. It is not a public redemption service, does not create redemption rights, does not pay RMB/CNH or USDT, and does not move customer funds.

## Demo Boundary

The current implementation:

- does not connect to a live database
- does not scan live chain logs
- does not perform payout, custody, payment processing, or settlement
- does not handle real USDT, real RMB/CNH, real customer deposits, or production credentials
- does not authorize mainnet use or production redemption behavior

Any adapter, listener, script, or UI added later must preserve this boundary and must remain local/fixture-backed or Base Sepolia testnet-only unless the human owner separately approves a new focused branch.

## State Machine

Allowed demo states:

1. `REQUESTED`: an eligible company and whitelisted wallet submitted a demo redemption request.
2. `BURN_PENDING`: an admin manually approved the request for demo burn review.
3. `BURN_VERIFIED`: the supplied burn event passed deterministic validation.
4. `PAYOUT_SIMULATED`: the worker recorded a simulated payout marker after burn verification.
5. `COMPLETED`: the worker recorded completion after simulated payout.
6. `REJECTED`: eligibility failed at request creation.
7. `FAILED`: burn verification failed closed.

Hardening rules:

- Approval is allowed only from `REQUESTED`.
- Burn verification is allowed only from `BURN_PENDING`.
- Payout simulation is allowed only from `BURN_VERIFIED`.
- Completion is recorded only after the simulated payout marker is written.
- Invalid approval or repository postcondition transitions throw deterministic `INVALID_REDEMPTION_TRANSITION` errors.
- Burn verification failures return deterministic reason codes and record a failed audit path.

## Burn Verification Requirements

A burn event can verify only when all of these checks pass:

- redemption is manually approved and currently `BURN_PENDING`
- expected wallet belongs to the redemption company and wallet record
- chain id is a positive safe integer and matches the expected wallet chain id
- tx hash is a 32-byte hex transaction hash
- log index is a non-negative safe integer
- source wallet matches the expected company wallet
- burn amount is a positive 6-decimal amount and equals the redemption amount
- burn event identity `(chainId, normalized txHash, logIndex)` is not already attached to any redemption

Duplicate burn identities fail closed:

- same redemption duplicate: `BURN_ALREADY_VERIFIED`
- another redemption reuse attempt: `BURN_EVENT_ALREADY_USED`

Duplicate burn events do not advance another redemption and do not write a second burn identity.

## Operator Checklist

Before manually advancing a demo redemption:

1. Confirm the branch is a focused `agent/*` or `audit/*` branch, not `main`.
2. Confirm the request uses only local fixtures or Base Sepolia testnet data.
3. Confirm there are no real funds, real USDT, real RMB/CNH, customer deposits, custody obligations, private keys, seed phrases, production credentials, or mainnet instructions.
4. Confirm the company and wallet are approved only in demo data.
5. Confirm the redemption is `REQUESTED` before approval.
6. Confirm burn review starts only after the request is `BURN_PENDING`.
7. Confirm `(chainId, txHash, logIndex)` is unique before accepting burn verification.
8. Confirm amount, source wallet, chain id, tx hash, and log index match the expected demo burn event.
9. Confirm payout remains a simulation marker only and is never represented as real settlement.
10. Record validation and residual risk in the agent report.

## Stop Conditions

Stop the workflow and escalate to the human owner if any of the following appear:

- real funds, real USDT, real RMB/CNH, customer deposits, custody, payment processing, or production redemption rights
- mainnet RPC, mainnet contract addresses, production credentials, private keys, or seed phrases
- burn event identity collision or unclear duplicate handling
- redemption state differs from the required source state
- amount, source wallet, chain id, tx hash, or log index does not match expected demo evidence
- repository postconditions do not record the expected state or burn identity exactly
- docs or UI copy suggests a public stablecoin, production payment product, legal approval, or real redemption

## Validation

For redemption burn hardening branches, run:

```bash
npm run test
npm run typecheck
npm run test:ci
git diff --check
```

Browser checks are not required unless UI files change.

## Current Test Coverage

The unit tests cover:

- eligible request creation
- eligibility rejection, including malformed amounts
- manual approval before burn verification
- fail-closed approval from invalid states
- matching burn verification
- duplicate burn suppression on the same redemption
- duplicate burn suppression across redemptions
- malformed burn event identity rejection
- amount mismatch rejection
- payout simulation and completion only after burn verification
