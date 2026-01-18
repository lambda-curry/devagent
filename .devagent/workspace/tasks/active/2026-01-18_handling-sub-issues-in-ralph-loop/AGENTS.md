# Handling Sub-Issues in the Ralph Loop [DERIVED] Progress Tracker

- Owner: Jake Ruesink
- Last Updated: 2026-01-18
- Status: Draft
- Task Hub: `.devagent/workspace/tasks/active/2026-01-18_handling-sub-issues-in-ralph-loop/`

## Summary
Explore how we should be working with sub-issues on tasks with our Ralph loop. Right now I'm leaning to have the agent just use those sub-tasks as additional context and to move through each of those tasks tracking progress, but also we could run the loop for each sub-task—I just think that would be overkill. I'd like to research what other people are considering for this type of workflow.

## Agent Update Instructions
- Always update "Last Updated" to today's date (ISO: YYYY-MM-DD) when editing this file. **Get the current date by explicitly running `date +%Y-%m-%d` first, then use the output for the "Last Updated" field.**
- Progress Log: Append a new entry at the end in the form `- [YYYY-MM-DD] Event: concise update, links to files`. Do not rewrite or delete prior entries. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- Implementation Checklist: Mark items as `[x]` when complete, `[~]` for partial with a short note. Add new items if discovered; avoid removing items—strike through only when obsolete.
- Key Decisions: Record important decisions as `- [YYYY-MM-DD] Decision: rationale, links`. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- References: Keep links current to latest spec, research, and tasks. Add additional references as they are created.
- Scope: Edits here should reflect coordination/progress only; do not include application code changes. Preserve history.

## Key Decisions
- [2026-01-18] Decision: TBD (research-first task hub scaffolded).

## Progress Log
- [2026-01-18] Event: Created task hub scaffold for researching sub-issues handling in the Ralph loop.
(Append new entries here, preserving historical entries to maintain a progress timeline.)

## Implementation Checklist
- [ ] Research: What patterns do other agent/task-loop systems use for sub-issues/subtasks?
- [ ] Decide: Use sub-issues as context + progress tracking vs. run a full loop per sub-issue (or hybrid).
- [ ] Document: Recommended workflow, rationale, and edge cases (e.g., partial completion, dependencies, parallelism).

## Open Questions
- Should the Ralph loop treat sub-issues as a checklist within one loop, or as independent loop executions?
- What’s the smallest unit of work that should have its own quality gates / iteration cycle?
- How should progress reporting roll up from sub-issues to the parent task?

## References
- `.devagent/workspace/product/guiding-questions.md` (2026-01-18): Question about how Ralph handles tasks that exceed a single context window (adjacent to task decomposition concerns).
- `.devagent/workspace/product/brainstorms/2026-01-10_ralph-integration-capabilities_FINAL.md` (2026-01-18): Notes on what enables Ralph to understand/track work; useful background for sub-issue progress tracking.
- `.devagent/workspace/memory/constitution.md` (2026-01-18): Human-in-the-loop defaults (relevant to deciding if per-sub-issue loops are too heavyweight).
- `.devagent/workspace/memory/decision-journal.md` (2026-01-18): “Close the loop” guidance for tagging affected task hubs and notifying responsible agents.
- `.devagent/workspace/memory/tech-stack.md` (2026-01-18): Review/approval gate notes (relevant to where loops/quality gates should sit).
- Search note (2026-01-18): No direct mentions of “sub-issues/subtasks” found in `.devagent/workspace/product/` or `.devagent/workspace/memory/` via keyword scan; expand via dedicated research workflow.

## Next Steps
- Run: `devagent research` (focus: sub-issues/subtasks in agent loops; decomposition and progress rollups)
- Run: `devagent clarify-task`
- Run: `devagent create-plan`
