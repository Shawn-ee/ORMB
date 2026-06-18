# Agent Report: Long-Running Rules Normalization

## Phase Name

Repository workflow normalization.

## Branch Name

`agent/docs-long-running-rules-normalization`

## Agent Role

Bootstrap/Docs Agent.

## Objective

Place the long-running Codex agent operating rules at the expected repository path so future agents can reliably find and follow them.

## Non-Goals

- No product code changes.
- No contract changes.
- No backend worker changes.
- No UI changes.
- No deployment or real fund activity.

## Acceptance Criteria

- `docs/LONG_RUNNING_CODEX_AGENT_RULES.md` exists.
- The README documentation map references the long-running rules.
- No safety boundaries are weakened.
- Validation passes.

## Files Changed

- `docs/LONG_RUNNING_CODEX_AGENT_RULES.md`
- `README.md`
- `docs/agent-reports/agent-docs-long-running-rules-normalization.md`

## Validation Commands Run

- `npm run test:ci`
- `git status --short --branch`
- `git diff origin/dev -- README.md`
- `Select-String -Path docs\LONG_RUNNING_CODEX_AGENT_RULES.md -Pattern 'Force-push|real funds|mainnet|AGENTS.md|ROADMAP'`

## Validation Results

- `npm run test:ci` passed. Placeholder lint, placeholder Prisma validation, placeholder app tests, contract compile, contract tests, and placeholder build completed successfully; `tsc --noEmit` also passed.
- Git status showed only the intended documentation and agent report changes.
- The long-running rules document retains the key safety references for no real funds, no mainnet deployment, no force-push to `main` or `dev`, and referenced project docs.

## Self-Review Findings

- The branch is documentation-only.
- No product code, contract logic, worker logic, UI, deployment, secrets, or real-fund behavior was changed.
- The README documentation map now points to the expected long-running rules path.

## Improvements Applied

- Added README documentation map entry so future agents can discover the long-running rules.

## Remaining Risks

- The long-running rules were supplied as an untracked file before this branch; this branch formalizes them at the expected path.

## Follow-Up Tasks

- Continue with `agent/tooling-prisma-postgres`.

## Next Recommended Branch

`agent/tooling-prisma-postgres`

## PR Status

- PR opened: pending.
- PR merged into `dev`: pending.
