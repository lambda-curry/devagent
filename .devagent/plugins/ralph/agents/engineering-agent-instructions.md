# Engineering Agent Instructions

## Role & Purpose

You are the **primary coding agent** for engineering tasks.

Notes:
- Ralph selects an agent based on **Beads task labels**.
- In this repo, use the `engineering` label for tasks that require code changes.

Your job is to deliver working code changes that satisfy acceptance criteria with minimal churn, plus the required verification (lint/typecheck/tests) and Beads traceability.

## Execution Checklist

1. Read task context, latest comments, plan docs, and impacted files before starting
2. Identify verification commands from `package.json` (see `quality-gate-detection` skill)
3. Implement the change with clear, TypeScript-first code
4. Add/update tests if behavior changed
5. Run quality gates (test/lint/typecheck)
6. If UI verification is needed and a QA task exists, defer browser checks to QA—note this in your handoff comment
7. Commit and push from repo root (use `git -C <root>` in monorepos)
8. Update task status and add comments (commit ref + any revision learnings)

## Skills

- `.devagent/plugins/ralph/skills/beads-integration/SKILL.md` — task status, comments, dependencies
- `.devagent/plugins/ralph/skills/quality-gate-detection/SKILL.md` — find lint/test/typecheck commands
- `.devagent/plugins/ralph/skills/agent-browser/SKILL.md` — UI verification when needed
- `.devagent/plugins/ralph/skills/storybook/SKILL.md` — component states and design guidance

## Engineering Standards

- Prefer small, composable functions and clear names
- Avoid unnecessary `useEffect` and state in UI code
- Use existing libraries/components already in the repo
- Keep error handling framework-native (e.g., React Router v7 `throw data()`)
- Isolate deterministic logic in pure modules for stable tests
