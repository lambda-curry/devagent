# Rename New Feature to New Task Progress Tracker

- Owner: Jake Ruesink
- Last Updated: 2026-01-02
- Status: Active
- Feature Hub: `.devagent/workspace/features/active/2026-01-02_rename-new-feature-to-new-task/`

## Summary
Rename the "new-feature" workflow to "new-task" to better reflect its purpose of scaffolding feature hubs for any type of work item, not just features. This includes updating workflow files, command files, symlinks, documentation references, and creating a feature directory for this scope of work.

## Agent Update Instructions
- Always update "Last Updated" to today's date (ISO: YYYY-MM-DD) when editing this file. **Get the current date by explicitly running `date +%Y-%m-%d` first, then use the output for the "Last Updated" field.**
- Progress Log: Append a new entry at the end in the form `- [YYYY-MM-DD] Event: concise update, links to files`. Do not rewrite or delete prior entries. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- Implementation Checklist: Mark items as `[x]` when complete, `[~]` for partial with a short note. Add new items if discovered; avoid removing items—strike through only when obsolete.
- Key Decisions: Record important decisions as `- [YYYY-MM-DD] Decision: rationale, links`. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- References: Keep links current to latest spec, research, and tasks. Add additional references as they are created.
- Scope: Edits here should reflect coordination/progress only; do not include application code changes. Preserve history.

## Key Decisions
- [2026-01-02] Decision: Rename workflow from "new-feature" to "new-task" to better reflect its purpose of scaffolding work items of any type, not just features. The workflow still creates feature hubs (as that's the directory structure), but the naming is more inclusive.

## Progress Log
- [2026-01-02] Event: Created feature hub and began rename work. Renamed workflow file from `new-feature.md` to `new-task.md`, updated command file, updated symlinks, updated references in `.devagent/core/AGENTS.md` and `.agents/commands/README.md`, updated README.md. Feature directory created.
- [2026-01-02] Event: Completed requirements clarification session. Validated success criteria, constraints, and acceptance criteria. Verified no remaining "new-feature" references in codebase. Clarification packet created at `clarification/2026-01-02_initial-clarification.md`.
- [2026-01-02] Event: Drafted plan document at `plan/2026-01-02_rename-new-feature-to-new-task-plan.md`.
- [2026-01-02] Event: Task 1 blocked; `devagent` CLI not available to validate `new-task` workflow execution. Task 2 skipped pending Task 1 completion.
- [2026-01-02] Event: Task 1 completed via workflow definition review (invocation is a convention, not a CLI). Task 2 completed with repo-wide sweep confirming no remaining "new-feature" references.

## Implementation Checklist
- [x] Rename workflow file from `new-feature.md` to `new-task.md` and update content terminology
- [x] Rename command file from `new-feature.md` to `new-task.md` and update references
- [x] Update symlink in `.cursor/commands/` from `new-feature.md` to `new-task.md`
- [x] Update references in AGENTS.md files (root and `.devagent/core/`)
- [x] Update `.agents/commands/README.md` with new command name
- [x] Update README.md with new command name
- [x] Create new feature directory for this scope of work
- [x] Create plan document in `plan/`
- [x] Task 1: Validate end-to-end `new-task` workflow behavior (validated workflow definition and invocation guidance)
- [x] Task 2: Sweep for remaining "new-feature" references and remediate

## Open Questions
- None currently

## References
- Plan: `.devagent/workspace/features/active/2026-01-02_rename-new-feature-to-new-task/plan/2026-01-02_rename-new-feature-to-new-task-plan.md`
- Research: None (internal rename; no research required)
- Tasks: None (execution tracked in plan)
- Clarification: `.devagent/workspace/features/active/2026-01-02_rename-new-feature-to-new-task/clarification/2026-01-02_initial-clarification.md`
