# Branching Strategy

## Branch Roles

- `main`: Stable demo branch. Only receives release-ready demo merges.
- `dev`: Integration branch for validated agent work.
- `agent/*`: Focused feature, tooling, documentation, or demo branches.
- `audit/*`: Focused review, security, correctness, or compliance branches.

## Merge Rules

- Agent branches target `dev`.
- Audit branches target `dev` unless they are release audits for `main`.
- `dev` must not merge into `main` until the release/demo checklist passes.
- Each pull request must include a validation report.
- Checks must pass before merge.
- Force-pushing to `main` or `dev` is forbidden unless explicitly approved by the human owner.

## Naming Examples

- `agent/bootstrap-repository`
- `agent/contracts-ormb-token`
- `agent/worker-mock-deposit-monitor`
- `agent/admin-dashboard`
- `audit/security-review`

## Release Rule

A `dev` to `main` merge requires:

- Passing CI.
- Updated runbook.
- Updated security documentation.
- Completed demo walkthrough.
- Completed legal boundary review.
- No secrets or production credentials.
- Confirmation that no real money flow exists.
