# Private Staging Evidence Bundle

## Scope

This is a local-only evidence template for an owner-run Base Sepolia private staging test. It is not a public report, not a production certification, and not proof of real payment activity.

Do not commit a completed copy of this template if it contains private RPC tokens, private keys, passwords, seed phrases, customer data, real fund references, or sensitive infrastructure details.

## Evidence Handling Rules

Allowed to record locally:

- Git commit SHA.
- Base Sepolia chain ID.
- Public contract addresses.
- Public test wallet addresses.
- Public Base Sepolia transaction hashes.
- Local database row IDs.
- Redacted command outputs.
- Reconciliation summaries.
- Audit log action names and row IDs.
- Operator notes that contain no secrets or customer data.

Never record in git, docs, PRs, chat, screenshots, or tickets:

- Private keys.
- Seed phrases.
- Full RPC URLs with secret tokens.
- Database URLs.
- Basic Auth passwords.
- Admin passwords.
- Mainnet wallet details.
- Real customer or counterparty data.
- Real USDT, RMB, CNH, bank, custody, payout, or settlement details.

## Local Evidence Template

Copy this section into a local untracked file such as `private-staging-evidence.local.md`.

```md
# ORMB Private Staging Evidence

## Boundary

- Testnet only: yes/no
- Base Sepolia only: yes/no
- Mock assets only: yes/no
- No real funds/customer data: yes/no
- Owner-only private access: yes/no

## Repository

- Git branch:
- Git commit SHA:
- PR/merge baseline:
- Validation date/time:
- Operator:

## Environment Checks

- `.env` untracked: yes/no
- `npm run staging:preflight -- --env-file .env`: pass/fail
- `npm run staging:tx-dry-run -- --env-file .env`: pass/fail
- `npm run test:ci`: pass/fail
- `npm run test:e2e`: pass/fail
- `npm run build`: pass/fail
- `npm audit` summary:

## Contracts

- Chain ID: 84532
- ORMB contract address:
- MockUSDT contract address:
- Deployer address:
- Minter role address:
- Burner address:
- Recipient/company test wallet:
- Redemption/burn test wallet:

## Role And Whitelist Evidence

- `MINTER_ROLE_ACTION=verify npm run contracts:minter-role`: pass/fail
- Minter has role: yes/no
- Recipient wallet whitelisted: yes/no
- Burn source wallet whitelisted when needed: yes/no
- Notes:

## Manual Deposit And Mint Request

- Admin Basic Auth enabled: yes/no
- Manual reference:
- Company ID:
- Company wallet ID:
- Simulated deposit DB ID:
- Mint request DB ID:
- Risk decision:
- AuditLog row IDs:

## Mint Execution

- Guarded script or path used:
- `npm run contracts:manual-mint`: pass/fail/not run
- Mint amount:
- Recipient test wallet:
- Mint transaction hash:
- Base Sepolia explorer URL:
- Post-mint wallet balance:
- Mint DB row ID, if recorded:
- AuditLog row IDs:

## Redemption And Burn

- Redemption DB ID:
- Redemption amount:
- Redemption approval status:
- Burn execution path:
- `npm run contracts:burn`: pass/fail/not run
- Burn transaction hash:
- Burn log index:
- Base Sepolia explorer URL:
- Burn evidence validation result:
- Simulated payout status:
- AuditLog row IDs:

## Reconciliation

- Simulated deposits:
- Minted ORMB:
- Verified burns:
- Expected supply:
- On-chain supply checked:
- Mismatch warnings:
- Reconciliation route response redacted and saved locally: yes/no

## Exceptions

- Failed command:
- Error summary:
- Recovery action:
- Follow-up branch needed:

## Final Local Verdict

- Private staging live test completed: yes/no
- Ready for owner review: yes/no
- Blockers:
```

## Redaction Checklist

Before sharing any evidence excerpt:

1. Remove private keys and seed phrases.
2. Remove full RPC URLs if they include provider tokens.
3. Remove `DATABASE_URL`.
4. Remove Basic Auth/admin passwords.
5. Remove `.env` contents.
6. Remove screenshots showing browser password prompts, terminal env output, or provider dashboards.
7. Replace any sensitive values with `<redacted>`.
8. Keep only Base Sepolia public addresses and transaction hashes.
9. Confirm no real funds, real USDT, real RMB/CNH, customer data, or payout details appear.

## Operator Notes

The evidence bundle is for private staging review only. It must not be represented as a SOC report, compliance attestation, audit certification, proof of reserves, legal approval, or production readiness approval.
