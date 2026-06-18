# ORMB Agent Instructions

ORMB is an agentic software engineering project for a testnet-first, whitelisted stablecoin issuance and enterprise settlement demo.

## Non-Negotiable Boundaries

- ORMB is a portfolio and technical demo.
- ORMB is not a public RMB stablecoin launch.
- ORMB is not a real financial product.
- ORMB is not a retail trading token.
- ORMB must not handle real customer funds in the MVP.
- Do not use real USDT, real RMB, customer deposits, private keys, seed phrases, or production credentials.
- Do not deploy to mainnet unless explicitly approved by the human owner in writing.
- Every behavior change must update documentation.

## Branch Rules

- `main` is the stable demo branch.
- `dev` is the integration branch.
- All work must happen on focused `agent/*` or `audit/*` branches.
- Each branch must have one focused goal.
- Agents may merge focused branches into `dev` only when checks pass.
- Agents must not merge `dev` into `main` unless the release/demo checklist passes.
- Agents should use the GitHub CLI (`gh`) to create pull requests when it is installed and authenticated.
- If `gh` is unavailable, agents must provide a manual GitHub compare URL for the intended PR.

## Required Agent Deliverables

Every agent branch must include:

- A focused code or documentation change.
- A validation report in the pull request.
- An agent report in `docs/agent-reports/`.
- Updated docs for any changed behavior, assumptions, APIs, contracts, security posture, or demo flow.

Use `docs/agent-reports/TEMPLATE.md` for agent reports.

## Pull Request Automation

Before opening a PR, run:

```bash
git status --short --branch
gh auth status
```

When `gh` is available and authenticated, create PRs with an explicit base and head:

```bash
gh pr create --base dev --head agent/<goal> --title "<title>" --body-file <body-file>
```

If `gh` is unavailable, include this manual compare URL pattern in the final report:

```text
https://github.com/Shawn-ee/ORMB/compare/dev...agent/<goal>?expand=1
```

## Current Bootstrap Scope

This repository starts with framework only. Do not add business logic, smart contracts, mint engines, workers, dashboards, or real integrations until the relevant focused branch is opened.
