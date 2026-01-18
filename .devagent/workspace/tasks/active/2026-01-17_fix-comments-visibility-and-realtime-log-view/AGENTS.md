# Fix Comments Visibility and Realtime Log View Progress Tracker

- Owner: Jake Ruesink
- Last Updated: 2026-01-17
- Status: Draft
- Task Hub: `.devagent/workspace/tasks/active/2026-01-17_fix-comments-visibility-and-realtime-log-view/`

## Summary
This task addresses two critical UI/UX issues in the Ralph monitoring application. First, comments are currently not visible to users—there's no indication of comment count on task cards in the list view, and comments are not displayed in the task details view. Second, the realtime log view consistently fails with a "file not found" error, preventing users from monitoring task execution logs in real-time. The goal is to make comments visible by showing comment counts on task cards and displaying full comments in the details view, and to fix the realtime log streaming functionality so users can properly monitor task execution.

## Agent Update Instructions
- Always update "Last Updated" to today's date (ISO: YYYY-MM-DD) when editing this file. **Get the current date by explicitly running `date +%Y-%m-%d` first, then use the output for the "Last Updated" field.**
- Progress Log: Append a new entry at the end in the form `- [YYYY-MM-DD] Event: concise update, links to files`. Do not rewrite or delete prior entries. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- Implementation Checklist: Mark items as `[x]` when complete, `[~]` for partial with a short note. Add new items if discovered; avoid removing items—strike through only when obsolete.
- Key Decisions: Record important decisions as `- [YYYY-MM-DD] Decision: rationale, links`. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- References: Keep links current to latest spec, research, and tasks. Add additional references as they are created.
- Scope: Edits here should reflect coordination/progress only; do not include application code changes. Preserve history.

## Key Decisions
- [2026-01-17] Task created: Grouped two related UI issues (comments visibility and realtime log view) into a single task for coordinated implementation.
- [2026-01-17] Plan approach: Use Beads CLI for comment retrieval and auto-create log directory to prevent missing-path log streaming errors.
- [2026-01-17] Beads setup: Created epic devagent-201a with child tasks devagent-201a.1-4 for implementation and final report.

## Progress Log
- [2026-01-17] Created task hub: Initial scaffolding complete, ready for research and planning.
- [2026-01-17] Research complete: Created research packet investigating comments visibility and log view issues. Identified implementation gaps and root causes.
- [2026-01-17] Plan created: Added implementation plan covering comments visibility and log view fixes. See plan/2026-01-17_comments-and-log-view-plan.md.
- [2026-01-17] Beads tasks created: Epic devagent-201a with tasks devagent-201a.1-4 created from plan.

## Implementation Checklist
- [x] Research: Investigate current comment data structure and API endpoints
- [x] Research: Investigate realtime log view implementation and file path resolution
- [x] Plan: Create implementation plan for comments visibility features
- [x] Plan: Create implementation plan for realtime log view fix
- [x] Beads: Convert plan into Beads epic + tasks (devagent-201a.1-4)
- [ ] Implement: Add comment count display to task cards
- [ ] Implement: Add comments display to task details view
- [ ] Implement: Fix realtime log view file not found error

## Open Questions
- What is the current comment data structure in Beads?
- How are comments fetched/stored for tasks?
- What is the exact file path resolution logic for log files?
- Why is the log file not found error occurring consistently?

## References
- Plan: `plan/2026-01-17_comments-and-log-view-plan.md`
- Research: `research/2026-01-17_comments-and-log-view-research.md`
- Related files:
  - `apps/ralph-monitoring/app/routes/_index.tsx` - Task card view implementation
  - `apps/ralph-monitoring/app/routes/tasks.$taskId.tsx` - Task details view
  - `apps/ralph-monitoring/app/components/LogViewer.tsx` - Log viewer component
  - `apps/ralph-monitoring/app/routes/api.logs.$taskId.stream.ts` - Realtime log streaming endpoint
  - `apps/ralph-monitoring/app/routes/api.logs.$taskId.ts` - Static log API endpoint
  - `apps/ralph-monitoring/app/utils/logs.server.ts` - Log file utilities
