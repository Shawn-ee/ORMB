# Agent Report: Dependency Audit

## Phase Name

Dependency audit.

## Branch Name

`audit/dependency-audit`

## Agent Role

Security Auditor Agent.

## Objective

Analyze npm audit findings without unsafe forced upgrades and document current dependency risk.

## Non-Goals

- No product code changes.
- No forced dependency upgrades.
- No `npm audit fix --force`.
- No contract, worker, schema, or UI changes.

## Acceptance Criteria

- `npm audit --json` is run.
- Findings are classified by toolchain/runtime exposure.
- Safe direct upgrade availability is checked.
- `docs/DEPENDENCY_AUDIT.md` is created.
- Validation passes.

## Files Changed

- `docs/DEPENDENCY_AUDIT.md`
- `docs/agent-reports/audit-dependency-audit.md`

## Validation Commands Run

- `npm audit --json`
- `npm ls --depth=0`
- `npm outdated`
- `npm view next version`
- `npm view postcss version`
- `npm view viem version`
- `npm view @nomicfoundation/hardhat-toolbox-viem version`
- `npm view prisma version`
- `npm view @prisma/client version`
- `npm install`
- `npm run test:ci`
- `git status --short --branch`
- `git diff origin/dev`

## Validation Results

- `npm audit --json` returned a non-zero exit code because vulnerabilities are present. The report listed 25 total findings: 8 low, 9 moderate, 8 high, and 0 critical.
- `npm ls --depth=0` completed and confirmed the direct dependency set.
- `npm outdated` completed with no outdated direct dependencies listed.
- `npm view` checks confirmed the installed direct versions match the latest published versions for `next`, `viem`, `@nomicfoundation/hardhat-toolbox-viem`, `prisma`, and `@prisma/client`.
- `npm install` passed and reported the same 25 audit findings.
- `npm run test:ci` passed. Placeholder lint/tests, Prisma generate/validate, TypeScript, contract compile/tests, and Next.js production build completed successfully.

## Self-Review Findings

- The branch is documentation-only.
- No dependencies were changed.
- No `npm audit fix --force` was run.
- No product code, contracts, workers, schema, UI, secrets, deployment behavior, or real-fund behavior was changed.
- Validation generated an unrelated `next-env.d.ts` change, which was restored so the branch remains docs-only.

## Improvements Applied

- Classified dependency findings by Hardhat/viem tooling, Prisma tooling, Next/PostCSS runtime-adjacent exposure, and GitHub Actions HTTP client transitive exposure.
- Documented why forced fixes are not appropriate at this stage.

## Remaining Risks

- Dependency advisories remain until upstream packages publish safe patched ranges or the project chooses a compatible dependency strategy.

## Follow-Up Tasks

- Re-run dependency audit before demo release.
- Revisit direct package upgrades after upstream releases.

## Next Recommended Branch

`agent/010-contracts-ormb-mockusdt`

## PR Status

- PR opened: pending.
- PR merged into `dev`: pending.
