# Private Interactive Testnet Staging Security Review

## Scope

This review covers the current `dev` branch after the private staging setup, access guard, simulated manual deposit core, Base Sepolia mint/burn boundaries, reconciliation dashboard, and runbook branches.

Private Interactive Testnet Staging remains owner-only and testnet-only. It is not production, public operation, real stablecoin issuance, real funds, real USDT, real RMB/CNH, custody, payment processing, banking, real payout, or compliance approval.

## Reviewed Controls

| Area | Current Control | Review Result |
| --- | --- | --- |
| Environment mode | `ORMB_ENV_MODE=private-staging` validation requires Base Sepolia `84532`, non-placeholder RPC, ORMB address, Basic Auth credentials, and testnet minter/burner keys. | Pass for staging guardrail. |
| Hosted demo separation | Hosted demo remains read-only and rejects deployer/minter/burner keys. | Pass. |
| Admin access | `src/proxy.ts` protects `/admin`, `/api/admin/**`, and `/api/staging/**` in private staging. | Pass for owner-only staging, not production auth. |
| Hidden URL risk | Runbook states hidden URL is not access protection. | Pass. |
| Local secrets | `.env.example` remains placeholder-only. | Pass. |
| Manual deposits | Worker core treats deposits as simulated records, idempotent by `manualReference`. | Pass for core boundary. |
| Mint execution | Base Sepolia mint gateway validates chain, amount, optional minter role, optional whitelist, and injected contract client. | Pass for gateway boundary. |
| Burn evidence | Base Sepolia burn evidence validates chain, event identity, wallet, and amount. | Pass for gateway boundary. |
| Redemption payout | Existing core allows simulated payout only after burn verification. | Pass for core boundary. |
| Reconciliation | Worker helper and admin dashboard show supply/reserve mismatch warnings. | Pass for demo/read-only dashboard. |
| Runbook | Owner-only staging runbook documents setup, deployment, recovery, and stop conditions. | Pass. |

## Remaining Security Gaps

Private staging is not yet fully interactive because the following are still missing:

- Persistent Prisma adapters for manual deposit, mint request, redemption, audit log, and reconciliation workflows.
- Protected HTTP mutation routes.
- Same-origin and anti-CSRF checks for future mutation routes.
- Database-backed admin forms and operator actions.
- Runtime wallet-client construction from local/server-only env values.
- Dedicated scripts to verify deployment, role membership, and whitelist state before staging use.
- Rate limiting or IP/network allowlisting around private staging.
- Structured server-side audit-log persistence for all future API actions.
- Human review of server hardening, backups, key custody, legal/compliance wording, and domain/TLS setup.

## Risk Assessment

| Risk | Current Severity | Notes |
| --- | --- | --- |
| Secret exposure | High | No secrets are committed, but future server setup must keep env files outside the repo with restricted permissions. |
| Public route exposure | High | Basic Auth protects private staging paths, but future routes must not be added outside guarded matchers. |
| Mainnet misuse | High | Env and gateway checks require Base Sepolia. Future scripts must keep hard chain checks. |
| Misleading financial wording | High | Docs repeatedly state no real funds/RMB/CNH/custody/payment/production. Continue reviewing wording in every UI/API branch. |
| Duplicate mint/burn | Medium | Existing cores include idempotency and duplicate burn handling; persistent adapters must preserve uniqueness. |
| Reconciliation drift | Medium | Helper and dashboard show warnings; database-backed reconciliation must block operator confidence when mismatched. |

## Go/No-Go For Human Review

Ready for human review:

- Local development foundations.
- Owner-only private staging architecture.
- Environment and access guardrails.
- Core simulated deposit, mint, burn evidence, redemption, and reconciliation boundaries.
- Deployment/runbook documentation.

Not ready for live private interactive use until a human approves:

- Server environment values.
- Base Sepolia deployment and role grants.
- Protected mutation routes and Prisma adapters.
- Operator UI actions.
- Server hardening and backup plan.
- Legal/compliance review of all staging language.

## Required Stop Conditions

Stop immediately if any next step requires:

- real funds
- real USDT
- real RMB/CNH
- mainnet
- customer data
- real payout
- custody
- payment processing
- committed secrets
- bypassing CI
- weakening private staging access controls
- public stablecoin or production claims

## Audit Verdict

The repository is ready to package Private Interactive Testnet Staging v1 for human review as a guarded technical foundation.

It is not ready for unattended live staging use. The next release branch should state that human approval is required before configuring real server secrets, deploying Base Sepolia contracts, granting roles, or enabling any interactive private staging workflow.
