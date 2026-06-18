# Full Security Review

## Review Date

2026-06-18

## Scope

This review covers the current `dev` baseline through the monitoring/security status dashboard:

- Solidity contracts and contract scripts.
- Prisma domain schema.
- Worker cores for deposits, confirmations, risk, mint requests, and redemptions.
- Static Next.js pages.
- Documentation, agent reports, and CI posture.
- Secrets, mainnet defaults, real-money wording, production claims, idempotency, audit logging, and tests.

## Findings

### Medium: Dependency Audit Findings Remain Open

`docs/DEPENDENCY_AUDIT.md` documents current npm audit findings across Hardhat/viem tooling, Prisma tooling, Next/PostCSS, and GitHub Actions transitive packages. No critical vulnerabilities are documented, and most exposure is development/tooling. The Next/PostCSS finding is runtime-adjacent, but the app is currently static demo UI with no user-supplied CSS input.

Release impact: demo release can proceed only if the release audit accepts this documented residual risk or a dependency-hardening branch applies safe upstream fixes.

Recommended follow-up: re-run dependency audit before release, apply safe direct updates if available, and avoid `npm audit fix --force` unless explicitly approved and fully validated.

### Low: Browser Visual Verification Was Not Available

The in-app browser target was unavailable during dashboard branches, so UI verification relied on `next build`, static route generation, TypeScript checks, and source review. This is not a smart contract or funds risk, but it is a demo-quality risk.

Release impact: full demo verification should include browser screenshots or manual browser review before `release/demo-v0`.

Recommended follow-up: perform browser-based verification in `audit/130-full-demo-verification`.

### Informational: MockUSDT Public Minting Is Intentional Demo Behavior

`MockUSDT` exposes public demo mint and faucet functions. This is acceptable only because MockUSDT is explicitly documented as a testnet/mock asset and not real collateral, custody, USDT, or redeemable value.

Release impact: no blocker if the legal and security boundary language remains visible and accurate.

Recommended follow-up: keep MockUSDT out of any mainnet or production configuration.

### Informational: Live Adapters Are Deferred

Current worker modules are deterministic cores with in-memory unit tests. Live RPC polling, Prisma persistence adapters, and contract gateway adapters are intentionally deferred. This limits operational risk but also means the demo is not an automated live system.

Release impact: no blocker for a static/testnet portfolio demo; must not be represented as production infrastructure.

Recommended follow-up: future live-adapter branches need independent security review before release.

## Security Checks

### Secrets

No committed private keys, seed phrases, production credentials, API secrets, or real RPC secrets were identified. `.env.example` contains placeholder values only.

### Mainnet Defaults

No mainnet deployment default was identified. Contract scripts target Base Sepolia and require `ORMB_CONFIRM_TESTNET_DEPLOY=YES`.

### Real-Money Wording

The repository consistently describes ORMB as a testnet-only portfolio demo. Legal and security docs prohibit real USDT, real RMB, customer funds, real redemption, and production payment activity.

### Production Claims

No production-readiness claim was identified. Current docs and UI label the implementation as demo/static/testnet-only.

### Mint Role Safety

`ORMBToken` restricts minting to `MINTER_ROLE`, requires whitelisted mint recipients, supports pause controls, and has tests for unauthorized minting and whitelisted mint behavior.

### Whitelist Enforcement

`ORMBToken` enforces whitelisted recipients for minting and both sender/recipient whitelisting for normal transfers. Worker risk checks also require known active source wallets and active whitelisted receiving wallets.

### Idempotency

Deposit ingestion uses `chainId + txHash + logIndex` uniqueness. Confirmation worker avoids rewriting unchanged records. Mint request flow skips existing deposit mint requests and duplicate mint submissions. Redemption burn flow skips duplicate burn events.

### Audit Logs

Worker cores expose repository hooks for audit logs across deposit detection, confirmation changes, risk decisions, mint request lifecycle events, and redemption/burn events. Static dashboard pages do not create audit entries because they do not mutate state.

### Tests

Current CI covers TypeScript, Prisma validation, unit tests, contract compile/tests, and Next.js build. Unit tests cover worker core pass/fail cases and contract tests cover role, whitelist, pause, mint, transfer, and burn behavior.

## Release Position

Security review does not identify a blocker that requires code changes before continuing to demo verification.

`dev` must not be merged into `main` yet. Remaining release work includes full demo verification, dependency audit re-check, browser or manual visual review, and release checklist approval.
