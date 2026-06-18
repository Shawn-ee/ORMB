# Full Demo Verification

## Verification Date

2026-06-18

## Summary

The ORMB demo is coherent as a static/testnet portfolio demo with testable contract and worker cores. It is not yet ready for `dev` to merge into `main` because browser visual verification and final release approval remain outstanding.

## Requirement Matrix

| Requirement | Status | Evidence |
| --- | --- | --- |
| Admin reviews whitelisted enterprise | Pass | `/admin` onboarding queue; Prisma company/wallet schema; security docs. |
| Enterprise receives mock deposit instructions | Pass | `/company` deposit instructions panel. |
| Worker detects mock USDT deposit | Pass | `workers/deposit-listener.ts`; unit tests for known wallet, unknown wallet, duplicates, wrong treasury. |
| Worker tracks confirmations | Pass | `workers/confirmation-worker.ts`; unit tests for threshold handling and no-op reruns. |
| Fixed FX conversion | Pass | `workers/mint-request-flow.ts`; unit test for 6-decimal amount conversion. |
| Mint request lifecycle | Pass | `workers/mint-request-flow.ts`; tests for creation, duplicate prevention, risk rejection, approval, submission, failure. |
| Manual approval | Pass | Mint request flow requires approval before gateway submission; `/admin` shows manual approval queue. |
| ORMB minting | Pass for contract/test core | `ORMBToken` restricts minting to `MINTER_ROLE` and whitelisted wallets; contract tests pass. Live mint gateway is deferred. |
| Enterprise ORMB transfer | Pass for contract/static demo | `ORMBToken` enforces whitelisted transfers; `/company` shows transfer activity. Live transfer flow is not implemented. |
| Redemption request | Pass | `workers/redemption-burn-flow.ts`; `/company` redemption status. |
| Burn verification | Pass | Redemption flow verifies chain, source wallet, amount, and duplicate event key; contract burn test passes. |
| Audit logs and reconciliation | Pass for static/testable core | Worker repository hooks model audit logs; `/admin` shows audit and reconciliation summaries. |
| Admin dashboard | Pass | `/admin` static dashboard builds. |
| Company dashboard | Pass | `/company` static dashboard builds. |
| Monitoring/security status | Pass | `/status` static readiness dashboard builds. |
| Demo flow page | Pass | `/demo` static walkthrough builds. |
| No real funds/mainnet/secrets | Pass | Security review and safety scans completed. |

## Validation Results

- `npm run test:ci` passed.
- Next.js build generated `/`, `/admin`, `/company`, `/demo`, and `/status`.
- Contract tests passed for ORMBToken and MockUSDT.
- Worker unit tests passed for deposit listener, confirmation worker, risk engine, mint request flow, and redemption burn flow.

## Demo Limitations

- Browser screenshot verification was not available because the in-app browser target was unavailable in this session.
- Dashboards and demo flow use static representative data.
- Live Prisma adapters, RPC polling loops, live contract gateway submission, and real deployment execution are deferred.
- Dependency audit findings remain documented in `docs/DEPENDENCY_AUDIT.md`.

## Release Position

Do not merge `dev` into `main` yet.

Before `release/demo-v0`, complete at least one of:

- Browser-based visual verification of `/`, `/demo`, `/admin`, `/company`, and `/status`.
- Human owner manual UI review.

Also re-check dependency audit status and confirm the human owner accepts the remaining static-demo limitations.
