# Dependency Audit

## Audit Date

2026-06-18

## Commands

```bash
npm audit --json
npm outdated
npm view next version
npm view postcss version
npm view viem version
npm view @nomicfoundation/hardhat-toolbox-viem version
npm view prisma version
npm view @prisma/client version
```

## Summary

`npm audit --json` reports 25 vulnerabilities:

- Low: 8
- Moderate: 9
- High: 8
- Critical: 0

No direct dependency updates are currently available through `npm outdated`. The installed direct versions match the latest versions reported by npm for:

- `next`
- `viem`
- `@nomicfoundation/hardhat-toolbox-viem`
- `prisma`
- `@prisma/client`

No `npm audit fix --force` was run.

## Findings By Area

### Hardhat And viem Tooling

Affected packages include `@nomicfoundation/hardhat-toolbox-viem`, `@nomicfoundation/hardhat-viem`, Hardhat Ignition packages, `viem`, `ws`, `ethers`, `lodash-es`, and older `@ethersproject/*` transitive packages.

Exposure classification:

- Development and test tooling exposure.
- Not currently used in a production server path.
- Relevant to local contract compilation, tests, and future testnet deployment scripts.

Current action:

- No safe direct upgrade is available from the current direct dependency set.
- Do not force downgrade or force major changes during feature work.
- Revisit after Hardhat/viem ecosystem packages publish patched dependency ranges.

### Prisma Tooling

Affected packages include `prisma`, `@prisma/dev`, and `@hono/node-server`.

Exposure classification:

- Development tooling exposure.
- `@prisma/client` is present for future runtime use, but the reported advisory path is through the Prisma CLI/dev tooling package.

Current action:

- npm suggests `prisma@6.19.3` as a semver-major fix path from the installed `7.8.0`, which is effectively a downgrade from the current major.
- Do not downgrade Prisma during this audit branch because the repository has already been configured for Prisma 7 config behavior.
- Revisit when Prisma 7 publishes a patched direct version.

### Next.js And PostCSS

Affected packages include `next` via `postcss`.

Exposure classification:

- Runtime-adjacent because Next.js is part of the app shell.
- Current app shell uses local static CSS and no user-supplied CSS input.
- The demo is not a production public service.

Current action:

- `next@16.2.9` is the latest version reported by npm.
- npm suggests `next@9.3.3` as a semver-major fix target, which is not a viable modern Next.js remediation.
- Revisit when Next publishes a patched dependency range.

### GitHub Actions Transitive HTTP Client

Affected packages include `@actions/http-client` and `undici`.

Exposure classification:

- Transitive development/tooling exposure.
- Not part of ORMB application runtime.

Current action:

- No direct dependency action is available in this repository without broader toolchain changes.
- Monitor upstream dependency updates.

## Recommendation

Continue development with the current dependency set because:

- CI passes.
- No critical vulnerabilities are reported.
- Most high-severity findings are in development/tooling transitive paths.
- Direct package versions are already current.
- Suggested forced fixes include unsafe downgrades or ecosystem-level changes.

Before demo release:

- Re-run `npm audit --json`.
- Check direct package updates again.
- Apply safe direct upgrades if available.
- Re-run full validation.
- Confirm no vulnerable dependency is introduced into server-side production behavior or exposed user-input paths.

## 2026-06-18 Release-Readiness Re-Check

Command:

```bash
npm audit --json
```

Result:

- Exit code: 1
- Low: 8
- Moderate: 9
- High: 8
- Critical: 0
- Total: 25

The vulnerability count remains unchanged after adding Playwright for browser smoke checks. The findings are accepted for `demo-v0` review only because this repository remains a local/testnet technical demo with no production service, no mainnet deployment, no real funds, and no customer data paths. A dependency-hardening branch remains recommended before any hosted or externally accessible demo.

## 2026-06-18 Enterprise Pilot Hardening Re-Check

Branch: `agent/210-dependency-hardening`

Commands:

```bash
npm outdated
npm audit --json
npm view next version
npm view postcss version
npm view viem version
npm view @nomicfoundation/hardhat-toolbox-viem version
npm view prisma version
npm view @prisma/client version
npm view @playwright/test version
npm view typescript version
```

Results:

- `npm outdated`: no outdated direct dependencies reported.
- `npm audit --json`: exit code 1.
- Low: 8
- Moderate: 9
- High: 8
- Critical: 0
- Total: 25

Current latest direct versions reported by npm:

- `next`: 16.2.9
- `viem`: 2.52.2
- `@nomicfoundation/hardhat-toolbox-viem`: 5.0.7
- `prisma`: 7.8.0
- `@prisma/client`: 7.8.0
- `@playwright/test`: 1.61.0
- `typescript`: 6.0.3

Decision:

- No dependency changes were made because the installed direct dependencies already match the latest versions available from npm.
- No `npm audit fix --force` was run.
- npm's currently suggested forced paths include unsafe ecosystem changes or downgrades for this repository's current toolchain.
- The findings remain accepted only for local/testnet demo development and portfolio review.
- Public hosted demo or enterprise pilot preparation should keep this gap open until upstream patched dependency ranges are available or a focused toolchain replacement branch is approved.

Exposure summary:

- Hardhat/viem findings are concentrated in development and contract-test tooling.
- Prisma findings are concentrated in CLI/dev tooling.
- Next/PostCSS remains runtime-adjacent, but the app currently serves static demo pages with no user-supplied CSS input.
- GitHub Actions HTTP client findings are transitive tooling exposure.

## 2026-06-18 Enterprise Readiness Re-Check

Branch: `audit/270-enterprise-readiness-review`

Command:

```bash
npm audit --json
```

Result:

- Exit code: 1
- Low: 8
- Moderate: 9
- High: 8
- Critical: 0
- Total: 25

Decision:

- The vulnerability count is unchanged from the prior Enterprise hardening re-check.
- The findings remain accepted only for local/testnet demo and portfolio review.
- They remain a blocker for production, real-funds usage, mainnet deployment, or any hosted demo that is not explicitly read-only and approved by the human owner.
- The next hosted-demo readiness branch must re-evaluate whether these findings are acceptable for the exact hosting posture.

## 2026-06-18 Hosted Demo Readiness Re-Check

Branch: `audit/280-hosted-demo-readiness`

Command:

```bash
npm audit --json
```

Result:

- Exit code: 1
- Low: 8
- Moderate: 9
- High: 8
- Critical: 0
- Total: 25

Decision:

- The vulnerability count remains unchanged.
- The findings may be accepted only for a static/read-only hosted demo after human owner review of the exact URL, audience, duration, and environment posture.
- The findings remain blockers for live mutations, production services, real funds, real USDT, real RMB/CNH, mainnet deployment, or customer data.

## 2026-06-18 Batch A Dependency Posture Refresh

Branch: `audit/311-dependency-posture-refresh`

Commands:

```bash
npm audit --json
npm outdated
```

Results:

- `npm audit --json`: exit code 1.
- Low: 8
- Moderate: 9
- High: 8
- Critical: 0
- Total: 25
- `npm outdated`: exit code 0 with no outdated direct dependencies reported.

Decision:

- No package files were changed because `npm outdated` did not identify safe direct dependency upgrades.
- No `npm audit fix --force` was run.
- npm still reports forced remediation paths that are not acceptable for this branch, including a Prisma downgrade path and a Next.js downgrade path.
- The remaining findings are accepted only for local/testnet portfolio-demo work under the project boundaries.
- The findings remain blockers for production services, mainnet deployment, real funds, real USDT, real RMB/CNH, customer deposits, private keys, production credentials, or public financial-product claims.

Residual exposure summary:

- `@nomicfoundation/hardhat-toolbox-viem` and `viem` remain direct high-severity findings through transitive `ws` and Hardhat/Ignition tooling paths.
- `next` remains a direct moderate finding through transitive `postcss`; current remediation suggested by npm is not a viable modern Next.js upgrade.
- `prisma` remains a direct moderate finding through Prisma CLI/dev tooling; current remediation suggested by npm is not compatible with the current Prisma 7 setup.
- Additional transitive findings remain in `@actions/http-client`, `undici`, `@ethersproject/*`, `ethers`, `elliptic`, `lodash-es`, and related Hardhat/Prisma tooling packages.

## 2026-06-19 Private Staging Deploy Candidate Re-Check

Branch: `release/530-private-staging-deploy-candidate`

Commands:

```bash
npm audit --json
npm outdated
```

Results:

- `npm audit --json`: exit code 1.
- Low: 8
- Moderate: 9
- High: 8
- Critical: 0
- Total: 25
- `npm outdated`: exit code 0 with no outdated direct dependencies reported.

Decision:

- No dependency changes were made.
- No `npm audit fix --force` was run.
- The findings remain accepted only for local/owner-only Base Sepolia private staging review after human approval.
- The findings remain blockers for production, public financial-product use, mainnet deployment, real funds, real USDT, real RMB/CNH, customer data, or any externally exposed service that is not explicitly approved by the owner.
