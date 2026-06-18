# Agent Report: `agent/234-deposit-blockhash-schema`

## Role

Chain reliability sub-agent.

## Objective

Persist deposit block hash data needed by the reorg-aware confirmation guard and prove the deposit listener preserves block hash data for known and unknown wallet deposits.

## Files Changed

- `prisma/schema.prisma`
- `workers/deposit-listener.ts`
- `test/workers/deposit-listener.unit.test.ts`
- `docs/CHAIN_REORG_AND_BACKFILL.md`
- `docs/CHAIN_LISTENER_REVIEW.md`
- `docs/DEPOSIT_LISTENER.md`
- `docs/agent-reports/agent-234-deposit-blockhash-schema.md`

## Implementation Summary

- Added nullable `Deposit.blockHash` to the Prisma schema.
- Added optional `blockHash` to mock transfer logs and created deposit inputs.
- Preserved `blockHash` when the listener creates known-wallet and unknown-wallet deposit records.
- Included block number and block hash in deposit audit metadata.
- Updated reorg/backfill docs to reflect schema-level block-hash support.
- Marked the chain listener audit block-hash finding as addressed by this branch.

## Validation

- `npm run prisma:generate`: PASS.
- `npm run prisma:validate`: PASS.
- `npm run typecheck`: PASS.
- `npm run test`: PASS, 62 unit tests.
- `npm run test:ci`: PASS.
  - lint placeholder: PASS.
  - Prisma generate: PASS.
  - typecheck: PASS.
  - Prisma validate: PASS.
  - unit tests: PASS, 62 tests.
  - contract compile: PASS.
  - contract tests: PASS, 15 tests.
  - Next.js build: PASS.
- `git diff --check`: PASS.

## Self-Review

- Inspected the diff against `origin/dev`.
- Confirmed the branch only adds optional block-hash persistence and listener preservation.
- Confirmed no live RPC, deployment, contract call, mint behavior, or mainnet behavior was introduced.
- Confirmed docs preserve testnet/mock-only boundaries.

## Known Limitations

- No live RPC adapter populates block hashes yet.
- No dry-run backfill command is added.
- No database migration file is generated in this branch.
- No contract calls, deployments, or mint behavior changes.

## Safety Notes

- Testnet/mock-only behavior.
- No real USDT, RMB/CNH, customer funds, or production claims.
- No secrets or private keys committed.

## Next Recommended Branch

`agent/236-listener-checkpoint-model`
