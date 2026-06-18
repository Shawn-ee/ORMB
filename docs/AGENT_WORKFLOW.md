# Agent Workflow

## Standard Flow

1. Start from the latest `dev` branch unless bootstrapping the repository.
2. Create a focused branch named `agent/<goal>` or `audit/<goal>`.
3. Read `AGENTS.md` and relevant docs before editing.
4. Make the smallest coherent change for the branch goal.
5. Update documentation for every behavior or assumption change.
6. Run validation commands.
7. Write an agent report in `docs/agent-reports/`.
8. Open a pull request into `dev` with the PR template.
9. Merge only when checks pass.

## Agent Report Requirements

Each report must include:

- Branch name.
- Objective.
- Files changed.
- Validation commands and outcomes.
- Security notes.
- Demo boundary notes.
- Follow-up work.

## Validation Expectations

Validation should scale with the change:

- Documentation-only branches: run available placeholder checks and inspect changed files.
- Tooling branches: run install, lint, typecheck, test, and CI-equivalent commands.
- Contract branches: run contract tests and security-focused tests.
- Worker/API branches: run unit, integration, idempotency, and persistence tests.
- UI branches: run build, lint, typecheck, and browser checks.

## Documentation Discipline

Every behavior change must update docs. If a branch changes state transitions, APIs, contract permissions, worker assumptions, security posture, or demo flow, the related documentation must be updated in the same branch.
