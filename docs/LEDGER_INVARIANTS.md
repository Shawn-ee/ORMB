# Ledger Invariants

## Scope

The ledger invariant checker is a deterministic demo safety tool for ORMB Enterprise Pilot Readiness work. It evaluates supplied lifecycle records and confirms that mock deposits, mint requests, mint records, verified burns, and displayed supply are internally consistent.

It is not proof of real reserves, real USDT deposits, real RMB/CNH backing, real redemption rights, or production accounting.

## Invariants

The demo ledger should satisfy:

- A deposit may have at most one mint request.
- A mint request must reference an existing confirmed or mint-requested deposit.
- A mint request marked `MINTED` must have a confirmed mint record.
- A confirmed mint must reference an existing mint request.
- Confirmed mint amount must match the mint request ORMB amount.
- A mint request may have at most one confirmed mint.
- Verified burn redemptions must include a burn event identity: `chainId`, `txHash`, and `logIndex`.
- A burn event may be used by at most one redemption.
- Verified burns must not exceed confirmed minted ORMB.
- Expected supply equals confirmed minted ORMB minus verified burned ORMB.
- If an on-chain supply value is supplied, it must match expected supply.

## Exclusions

The checker intentionally does not count:

- Rejected deposits.
- Pending, submitted, or failed mints.
- Requested, burn-pending, rejected, or failed redemptions.
- Any real-world reserve, bank, payout, custody, or compliance state.

## Validation

Run:

```bash
npm run test
```

The unit tests cover happy-path reconciliation, duplicate mint requests, amount mismatches, missing confirmed mint records, duplicate burn events, supply mismatch, and ignored failed/rejected records.
