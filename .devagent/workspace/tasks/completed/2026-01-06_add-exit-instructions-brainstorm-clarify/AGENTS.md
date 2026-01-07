# Add Exit Instructions to Brainstorm and Clarify Workflows Progress Tracker

- Owner: jaruesink
- Last Updated: 2026-01-06
- Status: Complete
- Task Hub: `.devagent/workspace/tasks/completed/2026-01-06_add-exit-instructions-brainstorm-clarify/`

## Summary
Add clear instructions to the brainstorm and clarify-task workflows to let users know they can end sessions by saying "all done" or exiting at any time. Ensure responses are captured incrementally after each answer so users can walk away at any point.

## Agent Update Instructions
- Always update "Last Updated" to today's date (ISO: YYYY-MM-DD) when editing this file. **Get the current date by explicitly running `date +%Y-%m-%d` first, then use the output for the "Last Updated" field.**
- Progress Log: Append a new entry at the end in the form `- [YYYY-MM-DD] Event: concise update, links to files`. Do not rewrite or delete prior entries. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- Implementation Checklist: Mark items as `[x]` when complete, `[~]` for partial with a short note. Add new items if discovered; avoid removing items—strike through only when obsolete.
- Key Decisions: Record important decisions as `- [YYYY-MM-DD] Decision: rationale, links`. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- References: Keep links current to latest spec, research, and tasks. Add additional references as they are created.
- Scope: Edits here should reflect coordination/progress only; do not include application code changes. Preserve history.

## Key Decisions
- [2026-01-06] Decision: Add exit instructions after each question batch and ensure incremental response capture after each answer. This allows users to walk away at any point while preserving their progress.

## Progress Log
- [2026-01-06] Event: Task created. Need to update brainstorm.md and clarify-task.md workflows to add exit instructions and ensure incremental response capture.
- [2026-01-06] Event: Updated both workflows with exit instructions and incremental response capture. Added reminders after questions, ensured documents are saved after each response, and added critical progress preservation notes to Interactive Session Model sections.
- [2026-01-06] Event: Task moved to completed. Updated all status references and file paths from active/ to completed/ throughout task directory.

## Implementation Checklist
- [x] Update brainstorm.md workflow with exit instructions
- [x] Update clarify-task.md workflow with exit instructions
- [x] Ensure both workflows capture responses incrementally after each answer
- [ ] Test that users can exit at any point and resume later

## Open Questions
- None currently

## References
- Workflow files: `.devagent/core/workflows/brainstorm.md`, `.devagent/core/workflows/clarify-task.md`
