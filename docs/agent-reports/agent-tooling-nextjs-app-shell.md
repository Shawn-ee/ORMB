# Agent Report: Next.js App Shell

## Phase Name

Tooling foundation.

## Branch Name

`agent/tooling-nextjs-app-shell`

## Agent Role

Tooling/UI Foundation Agent.

## Objective

Add a Next.js application shell with placeholder routes for the ORMB demo surfaces.

## Non-Goals

- No backend business logic.
- No real dashboard data.
- No contract calls.
- No deposit listener.
- No mint or redemption workflow.
- No deployment.

## Acceptance Criteria

- Next.js dependencies are installed.
- `npm run dev` starts Next.js.
- `npm run build` runs a real Next.js production build.
- Placeholder routes exist for home, admin, company, and system status.
- Testnet-only and mock-asset boundaries are visible.
- Validation passes.

## Files Changed

- `.gitignore`
- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/RUNBOOK.md`
- `docs/agent-reports/agent-tooling-nextjs-app-shell.md`
- `next-env.d.ts`
- `next.config.ts`
- `package.json`
- `package-lock.json`
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/admin/page.tsx`
- `src/app/company/page.tsx`
- `src/app/status/page.tsx`
- `tsconfig.json`

## Validation Commands Run

- `npm install`
- `npm run build`
- `npm run typecheck`
- `npm run test:ci`
- Local dev server probe on `http://127.0.0.1:3001`
- HTTP route checks for `/`, `/admin`, `/company`, and `/status`
- Playwright browser check attempt through the Browser plugin Node REPL

## Validation Results

- `npm install` passed. npm reported 25 audit findings: 8 low, 9 moderate, and 8 high.
- Initial `npm run build` failed because TypeScript resolver settings were not compatible with Next.js route imports. `tsconfig.json` was updated to use Next-compatible `ESNext` module and `Bundler` module resolution.
- `npm run build` passed after the TypeScript configuration fix.
- `npm run typecheck` passed with `tsc --noEmit`.
- `npm run test:ci` passed. It ran placeholder lint/tests, Prisma generate/validate, TypeScript, contract compile/tests, and Next.js production build.
- Local HTTP probe returned 200 for the app on port 3001.
- HTTP route checks returned 200 and confirmed expected page titles plus the visible testnet-only boundary text for `/`, `/admin`, `/company`, and `/status`.
- Playwright browser automation could not launch because the Chromium binary is not installed in the environment. No screenshot validation was completed.

## Self-Review Findings

- The branch adds app shell and frontend tooling only.
- No backend business logic, real dashboard data, contract calls, deployment, secrets, or real-fund behavior was added.
- The visible layout includes the required testnet-only and mock-asset boundary language.
- `tsconfig.tsbuildinfo` was generated during validation and then excluded through `.gitignore`.

## Improvements Applied

- Added `turbopack.root` to avoid Next.js workspace root ambiguity caused by a parent lockfile outside the repo.
- Updated TypeScript settings to match Next.js App Router requirements.
- Added `.gitignore` coverage for TypeScript build-info files.

## Remaining Risks

- npm audit findings remain from the current dependency set and should be reviewed in `audit/dependency-audit`.

## Follow-Up Tasks

- Add business data/API integration in later focused branches.
- Continue with `audit/dependency-audit`.

## Next Recommended Branch

`audit/dependency-audit`

## PR Status

- PR opened: pending.
- PR merged into `dev`: pending.
