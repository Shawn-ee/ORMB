# Dependency Hardening Plan

## Current Position

ORMB currently has 25 npm audit findings:

- Low: 8
- Moderate: 9
- High: 8
- Critical: 0

No direct dependency update is available through `npm outdated` as of the Enterprise Pilot Readiness v1 hardening pass.

## Hardening Policy

Agents must not run `npm audit fix --force` unless a branch explicitly justifies the full dependency graph change, validates the resulting toolchain, and documents migration risk.

Dependency hardening should prefer:

1. Safe direct upgrades within existing semver ranges.
2. Safe direct upgrades to newer patched major versions when the repository can validate the migration.
3. Removal of unused direct dependencies.
4. Replacement of high-risk toolchains only in focused migration branches.
5. Documentation of accepted demo-only risk when no safe remediation exists.

## Current Blocking Areas

### Hardhat And viem

The Hardhat/viem toolchain is required by current contract tests and scripts. Current direct versions are latest published versions. Replacing the toolbox would be a focused tooling migration, not a small hardening patch.

### Prisma CLI

The Prisma advisory path is through CLI/dev tooling. The current direct version is latest published. npm's forced fix path is not treated as safe because this repository is configured for Prisma 7 behavior.

### Next And PostCSS

The Next/PostCSS finding is runtime-adjacent. Current direct Next version is latest published. The app is currently static demo UI with no user-supplied CSS input, but this must be revisited before any hosted/public deployment.

## Hosted Demo Gate

Before a public hosted demo or enterprise pilot environment is approved:

- Re-run `npm audit --json`.
- Re-run `npm outdated`.
- Apply safe direct updates if available.
- Confirm no vulnerable package is exposed through user input, SSR mutation paths, secrets, or production credentials.
- Record human owner acceptance of any remaining findings.

## Validation Baseline

Every dependency hardening branch must run:

```bash
npm ci
npm audit --json
npm outdated
npm run test:ci
npm run test:e2e
```
