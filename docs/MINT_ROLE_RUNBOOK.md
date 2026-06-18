# Mint Role Runbook

## Scope

This runbook defines how ORMB mint, whitelist, pause, and admin roles should be handled for testnet-only demo and future enterprise pilot preparation.

It does not authorize mainnet deployment, real stablecoin issuance, real USDT/RMB/CNH handling, custody, redemption value, or production payment activity.

## Current Contract Roles

`ORMBToken` defines:

- `DEFAULT_ADMIN_ROLE`: can grant and revoke roles.
- `MINTER_ROLE`: can mint ORMB to whitelisted wallets while unpaused.
- `WHITELIST_ADMIN_ROLE`: can add or remove whitelisted wallets.
- `PAUSER_ROLE`: can pause and unpause token movement.

Current constructor behavior grants every role to the initial admin. This is acceptable for local/testnet demo work but is not sufficient for enterprise pilot preparation without role separation.

## Role Separation Target

For any human-approved testnet pilot rehearsal:

| Role | Recommended Holder | Reason |
| --- | --- | --- |
| `DEFAULT_ADMIN_ROLE` | Human-owner controlled multisig or equivalent testnet governance wallet | Reduces single-key control over all roles. |
| `MINTER_ROLE` | Dedicated testnet minter wallet or gateway account | Limits mint authority and makes mint actions easier to monitor. |
| `WHITELIST_ADMIN_ROLE` | Separate operations wallet or multisig-controlled admin | Keeps onboarding/whitelist changes separate from mint submission. |
| `PAUSER_ROLE` | Emergency operator wallet plus admin backup | Allows quick testnet pause without exposing mint authority. |

No role holder may use a mainnet key, funded production wallet, real customer wallet, or production credential.

## Manual Mint Preconditions

Before any testnet mint script is run:

1. Confirm the branch is not `main`.
2. Confirm target network is Base Sepolia.
3. Confirm `ORMB_CONFIRM_TESTNET_DEPLOY=YES`.
4. Confirm environment values are not placeholders and are testnet-only.
5. Confirm the recipient wallet is whitelisted.
6. Confirm the mint request has manual approval in the demo ledger.
7. Confirm ledger invariants are expected to remain valid after mint.
8. Run:

```bash
npm run compile:contracts
npm run test:contracts
npm run test:ci
```

## Mint Submission Policy

Mint submission must remain manual and testnet-only.

Required operator checks:

- One mint request maps to one confirmed mock deposit.
- Mint amount matches the approved fixed-FX ORMB amount.
- Recipient is the approved company wallet.
- Mint request has not already submitted a mint transaction.
- No unknown-wallet or failed-risk deposit is involved.
- Audit log records approval and submission.

## Private Staging Gateway Boundary

`src/lib/staging/base-sepolia-mint-gateway.ts` provides the reusable gateway boundary for future private staging mint execution. It:

- Requires Base Sepolia chain ID `84532`.
- Parses ORMB amounts with 6 decimals.
- Optionally verifies the configured minter has `MINTER_ROLE` when a contract role reader is provided.
- Optionally verifies the recipient is whitelisted when a contract whitelist reader is provided.
- Calls `ORMB.mint()` only through an injected contract client.

The gateway does not load secrets, create wallet clients, deploy contracts, grant roles, run workers, or expose HTTP routes. Future private staging integration must wire it only after admin approval, audit logging, idempotency, and environment validation pass.

## Emergency Pause Procedure

Use pause only for testnet demo containment:

1. Identify reason: bad whitelist, bad mint, suspected key exposure, script misfire, or demo integrity issue.
2. Pause with a `PAUSER_ROLE` wallet.
3. Stop all mint and whitelist scripts.
4. Record incident context in an agent report or future incident log.
5. Review ledger invariants and affected wallets.
6. Do not unpause until the human owner approves the testnet recovery plan.

## Key Rotation Procedure

For testnet role rotation:

1. Grant the role to the replacement testnet wallet.
2. Confirm the replacement wallet can perform only the intended role.
3. Revoke the role from the old wallet.
4. Run contract tests locally.
5. Record the role change in docs or an agent report.

Never commit the old or new private key.

## Bad Mint Response

If a testnet mint is submitted incorrectly:

1. Pause the token if continued transfers are a risk.
2. Identify the mint transaction, recipient, amount, and linked mint request.
3. Mark the ledger state as exception in future adapter work.
4. Do not simulate payout or redemption for the bad mint.
5. Document the incident and corrective action.

Because ORMB is a testnet demo, this does not create real redemption value, customer liability, or production payment impact.

## Required Follow-Up

- Add incident response runbook.
- Add operator runbook.
- Consider role admin separation tests or deployment script support in a focused contract permission branch.
- Integrate `parseOrmbEnvironment()` into contract scripts in a future script-hardening branch.
