# Multi-Machine Development Runbook

## Purpose

This runbook defines how ORMB private staging work is developed across multiple laptops, desktops, or servers while keeping GitHub as the source of truth.

ORMB remains a portfolio and technical demo. This workflow must not use real funds, real USDT, real RMB or CNH, customer deposits, seed phrases, private keys, production credentials, mainnet deployments, custody flows, payment processing, or live mint-burn behavior.

## Source Of Truth

- GitHub is the source of truth for shared state.
- `origin/dev` is the integration source for agent work.
- Local clones are temporary working copies and must be recreated when they drift from reviewed GitHub state.
- Local `.env.local` files, local databases, generated artifacts, and uncommitted changes are machine-specific state. Do not copy them between machines unless the human owner explicitly approves a safe, non-secret artifact transfer.

## Per-Machine Clone And Setup

Use this flow on each development machine:

1. Clone the repository from GitHub.
2. Fetch the latest remote branches.
3. Check out `dev`.
4. Pull the latest `origin/dev`.
5. Install dependencies using the repository's normal package manager workflow.
6. Create a machine-local `.env.local` from documented example values only.
7. Create or migrate a machine-local development database.
8. Run the validation command expected for the branch before making changes when practical.

Example:

```bash
git clone git@github.com:Shawn-ee/ORMB.git
cd ORMB
git fetch origin
git switch dev
git pull --ff-only origin dev
npm ci
npm run test:ci
```

If the clone already exists:

```bash
git status --short --branch
git fetch origin
git switch dev
git pull --ff-only origin dev
```

Stop before pulling if `git status --short` shows uncommitted work that belongs to another task or another person.

## Per-Machine Environment Files

Each machine owns its own `.env.local`.

- Do not commit `.env.local`.
- Do not paste secrets into docs, issues, pull requests, commit messages, agent reports, or chat.
- Do not reuse production credentials or real private keys.
- Use documented testnet, mock, local-only, or placeholder values.
- Keep each machine's local service URLs scoped to that machine.
- Rotate or delete any value that may have been exposed.

If a branch requires a new environment variable, update the documented example or setup documentation in that same branch without adding real credentials.

## Local Database Separation

Each machine must use a separate local development database.

- Use a local-only database name per machine or per task.
- Do not share local database files, volumes, dumps, or snapshots between machines unless the dump is explicitly sanitized and approved for the demo workflow.
- Do not point local development at a shared staging database unless the branch objective explicitly requires reviewed staging work.
- Do not use databases that contain customer data, deposits, production records, or real payment activity.
- When switching tasks, prefer a fresh local database or a clearly named task database.

Local database state is not source of truth. Schema, migrations, seed scripts, and documented setup steps are source-controlled; local rows are disposable.

## Branching Across Machines

Use one branch per machine and task.

1. Sync `dev` first:

```bash
git fetch origin
git switch dev
git pull --ff-only origin dev
```

2. Create a focused branch from the current `origin/dev`:

```bash
git switch -c agent/<goal> origin/dev
```

3. Keep the branch focused on its stated goal.
4. Open pull requests into `dev` only.
5. Do not merge `dev` into `main`.
6. Do not force-push `main` or `dev`.
7. Do not force-push an agent branch unless the human owner explicitly approves it for that branch.

Avoid using the same branch from multiple machines at the same time. If a task must move machines, commit or stash intentionally, push the branch if allowed, then resume from the latest remote branch on the second machine.

## Syncing A Task Between Machines

Preferred handoff:

1. On machine A, commit the complete current checkpoint.
2. Push the agent branch only if pushing is allowed for the task.
3. On machine B, fetch from GitHub.
4. Check out the same branch.
5. Verify `git status --short --branch`.
6. Recreate `.env.local` and local database state on machine B instead of copying machine A's local state.
7. Run validation before continuing.

If pushing is not allowed, do not move partial work through private files, screenshots of code, or copied local repositories. Finish the work on the original machine or ask the human owner for a handoff decision.

## Pull Requests Into Dev

Every agent branch needs a pull request into `dev` before it becomes shared integration state.

Before opening a PR:

```bash
git status --short --branch
gh auth status
npm run test:ci
git diff --check
```

The PR body must include:

- Objective.
- Files changed.
- Validation results.
- Security notes.
- Demo boundary notes.
- Any stop conditions or follow-up work.

Do not treat local validation as approval to update shared staging servers. Shared servers must consume reviewed `dev` only.

## Server Update Workflow

Use reviewed `dev` only for private staging server updates.

1. Confirm the intended change has been reviewed and merged into `dev`.
2. On the server, fetch from GitHub.
3. Check out `dev`.
4. Pull with fast-forward only.
5. Recreate server-local environment values from approved server setup notes.
6. Run the expected validation or smoke check for the server context.
7. Start or restart only the reviewed demo services required for private staging.
8. Record the update in the relevant runbook, issue, PR, or agent report.

Example:

```bash
git fetch origin
git switch dev
git pull --ff-only origin dev
npm run test:ci
```

Stop if the server has uncommitted changes, unknown local commits, unexpected environment values, failing validation, or any sign that it is pointed at mainnet, production credentials, real funds, real customer data, payment processing, or live mint-burn behavior.

## Conflict Avoidance Rules

- Claim a focused branch and file ownership before editing.
- Prefer new docs over broad rewrites when ownership is unclear.
- Do not edit Docker, Postgres, package, Prisma, API, UI, contract, or worker files unless the branch explicitly owns them.
- Pull latest `dev` before creating a branch.
- Keep commits small enough to review.
- Do not reformat unrelated files.
- Do not resolve conflicts by deleting another branch's work.
- Ask for direction when two branches need incompatible edits to the same file.

## Stop Conditions

Stop and ask the human owner before continuing if any of these occur:

- The work requires real funds, real USDT, real RMB or CNH, customer deposits, production credentials, private keys, seed phrases, mainnet access, custody, payment processing, or live mint-burn behavior.
- The branch needs to merge `dev` into `main`.
- A command would force-push `main` or `dev`.
- `git status --short` shows unrelated changes that would be overwritten.
- The local clone has unknown commits that are not on GitHub.
- A shared server is not on reviewed `dev`.
- Validation fails and the fix would exceed the branch scope.
- A conflict includes files owned by another active agent branch.
- A required secret or credential is missing.

When stopped, preserve the current state with non-destructive commands and report the exact branch, command, file, and validation output involved.
