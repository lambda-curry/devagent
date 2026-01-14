# Ralph Improvements Progress Tracker

- Owner: Jake Ruesink
- Last Updated: 2026-01-13
- Status: Draft
- Task Hub: `.devagent/workspace/tasks/active/2026-01-13_ralph-improvements/`

## Summary

This task focuses on improving the Ralph autonomous execution system with four key enhancements:

1. **Better Task Descriptions**: Tasks should have comprehensive context instead of just referencing the original plan. When setting up tasks, they should include: what parts of the code the task touches, what rules/documentation/references are helpful to review, and any testing criteria that should be covered. This ensures agents have all necessary context without needing to hunt through plan documents.

2. **Setup Worktree for Epic**: Implement git worktree functionality to isolate epic work in separate branches/worktrees, enabling better isolation and parallel development.

3. **PR Creation on Cycle Break**: When the Ralph execution cycle breaks (whether due to success or failure), automatically run an agent to create a PR to a designated base branch with a report of what happened in the PR description. This agent can also write the revise report. Consider implementing this as a final agent that runs when the flow breaks regardless of cause, ensuring there's always a PR at the end. If Vercel builds are cost-effective, consider having the agent push up after completing each task.

4. **Epic-Focused Execution**: Currently Ralph runs for all open tasks. Improve it to focus on a specific epic by passing the epic ID to the ralph script as an environment variable or command-line flag, allowing more targeted execution.

These improvements will enhance Ralph's autonomy, traceability, and usability by providing better context to agents, enabling isolated epic work, ensuring PRs are always created for review, and allowing focused execution on specific epics.

## Agent Update Instructions
- Always update "Last Updated" to today's date (ISO: YYYY-MM-DD) when editing this file. **Get the current date by explicitly running `date +%Y-%m-%d` first, then use the output for the "Last Updated" field.**
- Progress Log: Append a new entry at the end in the form `- [YYYY-MM-DD] Event: concise update, links to files`. Do not rewrite or delete prior entries. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- Implementation Checklist: Mark items as `[x]` when complete, `[~]` for partial with a short note. Add new items if discovered; avoid removing items—strike through only when obsolete.
- Key Decisions: Record important decisions as `- [YYYY-MM-DD] Decision: rationale, links`. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- References: Keep links current to latest spec, research, and tasks. Add additional references as they are created.
- Scope: Edits here should reflect coordination/progress only; do not include application code changes. Preserve history.

## Key Decisions
- [Date] Decision: Description, rationale, links to supporting docs.

## Progress Log
- [Date] Event: Status update, key actions, references to files (spec, research, task plans, prompts).
- [2026-01-13] Event: Created implementation plan for Ralph improvements, reference `.devagent/workspace/tasks/active/2026-01-13_ralph-improvements/plan/2026-01-13_ralph-improvements-plan.md`.
(Append new entries here, preserving historical entries to maintain a progress timeline.)

## Implementation Checklist
- [ ] Task 1: Enrich task descriptions in plan-to-beads conversion. (Updated by agents: [x] completed, [~] partial progress with note.)
- [ ] Task 2: Add epic worktree setup for Ralph execution.
- [ ] Task 3: Automate PR creation on cycle break.
- [ ] Task 4: Add epic-focused execution filter.

## Open Questions
- Question: Owner, due date.

## References
- Ralph Plugin Instructions: `.devagent/plugins/ralph/AGENTS.md` (2026-01-13)
- Ralph Execution Script: `.devagent/plugins/ralph/tools/ralph.sh` (2026-01-13)
- Ralph Workflows: `.devagent/plugins/ralph/workflows/` (2026-01-13)
- Plan-to-Beads Conversion: `.devagent/plugins/ralph/skills/plan-to-beads-conversion/SKILL.md` (2026-01-13)
- Ralph Implementation Task: `.devagent/workspace/tasks/active/2026-01-10_implement-ralph/` (2026-01-13)
- Ralph Improvements Plan: `.devagent/workspace/tasks/active/2026-01-13_ralph-improvements/plan/2026-01-13_ralph-improvements-plan.md` (2026-01-13)
- DevAgent Core Workflows: `.devagent/core/workflows/` (2026-01-13)
- DevAgent Constitution: `.devagent/workspace/memory/constitution.md` (2026-01-13)
