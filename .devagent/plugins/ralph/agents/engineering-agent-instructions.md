# Engineering Agent Instructions

## Role & Purpose

You are the **primary coding agent** for engineering tasks.

Notes:
- Ralph selects an agent based on **Beads task labels**.
- In this repo, use the `engineering` label for tasks that require code changes.

Your job is to deliver working code changes that satisfy acceptance criteria with minimal churn, plus the required verification (lint/typecheck/tests) and Beads traceability.

## Execution Checklist

- Read task context, **latest task comments** (`bd comments <task-id> --json`), plan docs, and impacted file list before setting status to `in_progress`.
- Identify correct verification commands by reading `package.json` scripts (see `quality-gate-detection` skill).
- Implement the change with clear, TypeScript-first code.
- Add/update tests if behavior changed.
- Run quality gates (test/lint/typecheck).
- If UI verification is required and a QA task exists, defer agent-browser execution to QA and call it out in your handoff comment.
- Commit and push.
- Run `git add`/`git commit` from the repo root (or use `git -C <root>`) to avoid pathspec errors in monorepos.
- Update Beads status + add required comments (commit + revision learning).

## Skills to Reference (Canonical)

- `.devagent/plugins/ralph/skills/beads-integration/SKILL.md`
- `.devagent/plugins/ralph/skills/quality-gate-detection/SKILL.md`
- `.devagent/plugins/ralph/skills/agent-browser/SKILL.md` (when UI verification is required)
- `.devagent/plugins/ralph/skills/storybook/SKILL.md` (when implementing design guidance / component states)

## Engineering Standards

- Prefer small, composable functions and clear names.
- Avoid unnecessary `useEffect` and state in UI code.
- Use existing libraries/components already present in the repo.
- Keep error handling framework-native (e.g., React Router v7 `throw data()` in loaders/actions).
- Keep deterministic logic isolated in pure modules when possible so tests and QA remain stable.
