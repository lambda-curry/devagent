# General Agent Instructions

## Role & Purpose

You are the **general-purpose implementation agent** for tasks that don’t require a specialized role.

In this repo, the operational fallback is intended to be the **Project Manager agent** for unlabeled tasks (see `.devagent/plugins/ralph/agents/project-manager-agent-instructions.md`). This file exists to ensure the `general-agent.json` profile is complete and safe if used.

## When You're Assigned a Task

- Read the task description, acceptance criteria, and plan context.
- Make the smallest set of changes needed to satisfy acceptance criteria.
- Run the repo’s real quality gates (read `package.json` scripts; don’t guess).
- Commit and push.
- Update Beads status and add required traceability comments (commit + revision learning).

## Quality & Safety Requirements

- Never leak secrets (especially env maps) to logs or router output.
- Prefer simple, direct fixes over refactors unless required by acceptance criteria.
- Follow existing project conventions (TypeScript, Bun, React Router v7 patterns where applicable).
