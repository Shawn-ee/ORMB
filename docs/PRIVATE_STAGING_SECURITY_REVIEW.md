# Private Staging Security Review

## Review Date

2026-06-18

## Scope

This review covers the private interactive Base Sepolia staging readiness surface after:

- Base Sepolia deployment preflight.
- Minter role readiness tooling.
- Protected private staging admin API routes.
- Admin write UI for protected private staging routes.
- Offline mint/burn transaction dry-run checks.

The review does not authorize mainnet, real funds, real USDT, real RMB/CNH, customer data, public access, custody, real redemption, payout, or production use.

## Verdict

Private staging is conditionally ready for owner-only preparation and database/UI rehearsal. It is not yet ready for the full live Base Sepolia mint/burn test.

The repository has strong preflight, route-guard, documentation, and validation coverage for private staging. The remaining blockers are focused and testable:

- Runtime wallet-client loading is not implemented in the app or workers; live actions remain guarded script/manual paths.
- No final private staging deploy-candidate package exists after the security review.
- Dependency audit findings remain accepted only for local/testnet demo review and must be re-checked before any hosted/private-server exposure.

## Reviewed Surfaces

### Environment And Mode Guards

Status: conditionally ready.

- `ORMB_ENV_MODE=private-staging` is required for protected admin mutation routes.
- Hosted/read-only demo mode conflicts are rejected by preflight and API guard paths.
- `BASE_SEPOLIA_CHAIN_ID=84532` is enforced by preflight and dry-run tooling.
- Mainnet-like chain IDs including `1` and `8453` are rejected.
- Placeholder RPC URLs, keys, and contract addresses fail readiness checks where live staging requires concrete values.

Residual risk:

- Environment validation is split across multiple tools; the release candidate should document the exact command order and expected outputs.

### Admin Access Guard

Status: conditionally ready for owner-only staging.

- Basic Auth proxy protects `/admin`, `/api/admin/**`, and `/api/staging/**` in private staging mode.
- API routes also call private-staging mode guards before importing Prisma.
- The guard is explicitly not production authentication, SSO, RBAC, or compliance authorization.

Residual risk:

- Basic Auth is acceptable only for owner-only private staging behind private network or local access.
- There is no per-user authorization, operator role model, session auditing, CSRF token, or production access control.

### Protected Admin Mutation Routes

Status: conditionally ready for private staging database rehearsal.

- Manual simulated deposit creation is idempotent by `manualReference`.
- Mint request approval is database-only and does not submit contract mint transactions.
- Redemption creation and approval use existing state-machine logic.
- Burn evidence verification validates Base Sepolia chain, source wallet, amount, transaction hash, and log index before simulated payout completion.
- Reconciliation and audit-log reads are available through protected admin routes.

Residual risk:

- API responses currently use a simple JSON envelope rather than the fully documented future API contract shape.
- Routes rely on Basic Auth plus mode guards, not production-grade authorization.
- Some route operations depend on seeded/local database IDs and require operator care.

### Admin Write UI

Status: conditionally ready for owner-only staging rehearsal.

- `/admin` exposes controls for existing protected private staging routes.
- The UI does not deploy contracts, grant roles, submit mint transactions, execute burns, move funds, or perform real payouts.
- Browser checks cover the panel and safety copy on desktop and mobile.

Residual risk:

- The UI is an operator control panel, not a polished production console.
- It does not list live DB queues for selecting IDs; operators must copy IDs from database/query outputs or API responses.

### Contract Deployment And Role Tooling

Status: conditionally ready for owner-controlled Base Sepolia scripts.

- Deployment preflight exists and requires Base Sepolia posture plus explicit testnet confirmation.
- Minter role readiness tooling supports verify/grant/revoke posture checks.
- Contract scripts target Base Sepolia and require explicit confirmation for live writes.
- ORMB contract tests cover role, whitelist, pause, mint, transfer, and burn behavior.

Residual risk:

- Scripts can send Base Sepolia transactions when run with real local testnet keys and explicit confirmation; the owner must verify every local `.env` value before use.
- No automated deploy/role output capture writes a sanitized local evidence bundle.

### Mint Execution

Status: partially ready.

- A guarded manual mint script exists.
- Base Sepolia mint gateway validates chain, optional minter role, and optional recipient whitelist before calling mint.
- Offline dry-run validates intended mint recipient, amount, minter address, local-only minter key, contract address, chain ID, and RPC posture.

Blocker:

- There is no integrated private staging worker or UI action that loads a runtime wallet client and submits approved mint requests end-to-end.

Acceptable near-term path:

- Owner may use the guarded manual mint script only after preflight, dry-run, role verification, whitelist confirmation, and explicit testnet approval.

### Burn Execution And Redemption

Status: conditionally ready through guarded script/manual path.

- Burn evidence validation exists.
- Redemption state machine verifies burn evidence before simulated payout completion.
- Offline dry-run validates intended burn source, amount, local-only burner key, and optional burn evidence format.
- A guarded Base Sepolia burn script exists and checks chain ID, signer address, paused state, and balance before transaction submission.

Residual risk:

- Burn execution is not integrated into a worker or UI flow; it remains a guarded owner-run script.
- The script sends a Base Sepolia transaction when run with explicit confirmation and real local testnet values.

Required follow-up:

- Package a final deploy-candidate runbook that sequences dry-run, mint, burn, evidence validation, reconciliation, and audit capture.

### Secrets And Output Redaction

Status: conditionally ready.

- `.env.private-staging.example` uses placeholders only.
- Preflight and dry-run reports summarize secrets as present-redacted.
- No `.env` file or real secret is committed.
- Agent reports and docs avoid real values.

Residual risk:

- The owner must avoid pasting real `.env`, RPC URLs with secret tokens, private keys, screenshots containing secrets, or transaction notes with secret material into docs, issues, PRs, or chat.

### Dependency Risk

Status: accepted for local/testnet demo review only.

- Known npm audit findings remain documented.
- No critical findings are documented in the current known state.
- Findings must not be treated as acceptable for production or real funds.

Required follow-up:

- Re-run `npm audit` before private server exposure or release candidate approval.
- Apply safe direct dependency updates where available.
- Do not run `npm audit fix --force` without explicit owner approval.

## Stop Conditions

Stop the private staging process immediately if:

- Chain ID is not `84532`.
- RPC endpoint is mainnet, Base mainnet, or ambiguous.
- Any private key may be mainnet-funded, reused, or exposed.
- Basic Auth is disabled or bypassed.
- Minter role or whitelist status is unclear.
- Burn execution path is unclear.
- A route or script would process real funds, real USDT, real RMB/CNH, customer data, custody, or real payout.
- Reconciliation does not match expected deposit, mint, burn, and supply state.
- Any dependency, deployment, legal, or security concern requires human approval.

## Required Follow-Up Branches

1. `release/530-private-staging-deploy-candidate`
   - Package the final private staging runbook, re-run dependency audit, validate all commands, and declare ready/not ready for owner approval.

## Final Position

Private staging is not ready for the owner’s full live Base Sepolia mint/burn test until the final deploy-candidate package is completed.
