# Agent Report: `agent/236-listener-checkpoint-model`

## Role

Chain reliability sub-agent.

## Objective

Define and test listener checkpoint semantics for scanned ranges, including ranges with no matching logs.

## Files Changed

- `workers/deposit-listener.ts`
- `test/workers/deposit-listener.unit.test.ts`
- `docs/CHAIN_REORG_AND_BACKFILL.md`
- `docs/DEPOSIT_LISTENER.md`
- `docs/agent-reports/agent-236-listener-checkpoint-model.md`

## Implementation Summary

- Added optional `scannedToBlock` input to the deposit listener core.
- Preserved existing behavior when `scannedToBlock` is omitted.
- Checkpoints the greater of the latest matching event block and the explicitly scanned block.
- Rejects negative scanned checkpoint values.
- Added tests for no-log scanned ranges, ignored-log scanned ranges, and invalid scanned checkpoint values.

## Validation

- `npm run typecheck`: PASS.
- `npm run test`: PASS, 65 unit tests.
- `npm run test:ci`: PASS.
  - lint placeholder: PASS.
  - Prisma generate: PASS.
  - typecheck: PASS.
  - Prisma validate: PASS.
  - unit tests: PASS, 65 tests.
  - contract compile: PASS.
  - contract tests: PASS, 15 tests.
  - Next.js build: PASS.
- `git diff --check`: PASS.

## Self-Review

- Inspected the diff against `origin/dev`.
- Confirmed existing listener behavior is preserved when `scannedToBlock` is omitted.
- Confirmed the new checkpoint path is deterministic and covered for no-log, ignored-log, and invalid-block cases.
- Confirmed no live RPC, contract calls, deployments, mint behavior, mainnet behavior, or secrets were introduced.

## Known Limitations

- No live RPC runner is introduced.
- No dry-run backfill command is introduced.
- No contract calls, deployments, or mint behavior changes.

## Safety Notes

- Testnet/mock-only behavior.
- No real USDT, RMB/CNH, customer funds, or production claims.
- No secrets or private keys committed.

## Next Recommended Branch

`agent/235-dry-run-backfill-command`
