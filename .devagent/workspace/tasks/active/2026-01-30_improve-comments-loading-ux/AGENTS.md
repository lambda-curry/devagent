# Improve Comments Loading UX Progress Tracker

- Owner: Jake Ruesink
- Last Updated: 2026-01-30
- Status: Complete
- Task Hub: `.devagent/workspace/tasks/active/2026-01-30_improve-comments-loading-ux/`

## Summary
Improve the user experience when loading comments for issues in the Ralph Monitoring dashboard. Currently, when comments fail to load (timeout or error), users see a yellow warning message "Timed out while loading comments. Please retry." with a Retry button. The task is to enhance this experience so that loading comments works better for issues - potentially improving timeout handling, retry logic, loading states, or fallback behavior to provide a more robust and user-friendly experience.

The issue was identified via a screenshot showing the timeout error state in the task detail view (`apps/ralph-monitoring/app/routes/tasks.$taskId.tsx`).

## Agent Update Instructions
- Always update "Last Updated" to today's date (ISO: YYYY-MM-DD) when editing this file. **Get the current date by explicitly running `date +%Y-%m-%d` first, then use the output for the "Last Updated" field.**
- Progress Log: Append a new entry at the end in the form `- [YYYY-MM-DD] Event: concise update, links to files`. Do not rewrite or delete prior entries. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- Implementation Checklist: Mark items as `[x]` when complete, `[~]` for partial with a short note. Add new items if discovered; avoid removing items—strike through only when obsolete.
- Key Decisions: Record important decisions as `- [YYYY-MM-DD] Decision: rationale, links`. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- References: Keep links current to latest spec, research, and tasks. Add additional references as they are created.
- Scope: Edits here should reflect coordination/progress only; do not include application code changes. Preserve history.

## Key Decisions
- [2026-01-30] Decision: ~~Implement auto-retry with exponential backoff~~ **REVISED**: Use direct SQLite query instead of CLI. Rationale: The `comments` table can be queried directly via better-sqlite3, eliminating the timeout issue at the root cause instead of adding retry workarounds. This is consistent with how we already fetch tasks.

## Progress Log
- [2026-01-30] Event: Task hub created to track comments loading UX improvements. Issue identified via screenshot showing timeout error in task detail view.
- [2026-01-30] Event: Initial plan created with retry logic approach.
- [2026-01-30] Event: **Plan revised** - discovered root cause: comments fetched via `bd comments` CLI which spawns external process. The `comments` table can be queried directly via SQLite, just like tasks. Simplified plan to 3 tasks.
- [2026-01-30] Event: All implementation tasks complete (6, 7, 8). Wrap-up task 9: task hub updated with completion status; epic devagent-comments-ux closed.
(Append new entries here, preserving historical entries to maintain a progress timeline.)

## Implementation Checklist
- [x] Research: Investigate current comments loading implementation and identify pain points
- [x] Design: Identified root cause - CLI spawning instead of direct SQLite query
- [x] Task 6: Add direct SQLite query for comments (`getTaskCommentsDirect`)
- [x] Task 7: Update task detail route to use direct query in loader
- [x] Task 8: Cleanup and verification
- [x] Task 9: Wrap up and close epic

## Open Questions
- (Resolved) Should comments auto-retry on failure? → **No longer needed** - direct SQLite query is instant
- (Resolved) Root cause? → CLI spawning (`bd comments`) can timeout; direct SQLite query eliminates this

## References
- [2026-01-30] **Plan:** `plan/2026-01-30_improve-comments-loading-ux-plan.md` — Implementation plan with 3 tasks
- [2026-01-30] Task detail route: `apps/ralph-monitoring/app/routes/tasks.$taskId.tsx` — contains comments loading logic with 8-second timeout (freshness: 2026-01-30)
- [2026-01-30] Comments component: `apps/ralph-monitoring/app/components/Comments.tsx` — renders the comments list (freshness: 2026-01-30)
- [2026-01-30] Comments API: `apps/ralph-monitoring/app/routes/api.tasks.$taskId.comments.ts` — backend API for fetching comments (freshness: 2026-01-30)
- [2026-01-30] Related completed task: `.devagent/workspace/tasks/completed/2026-01-18_add-timeout-to-ralph-task-comments/AGENTS.md` — previous task about backend timeout handling (decided not to add timeout to `bd comments`) (freshness: 2026-01-30)
- [2026-01-30] Related active task: `.devagent/workspace/tasks/active/2026-01-17_fix-comments-visibility-and-realtime-log-view/AGENTS.md` — related work on comments visibility (freshness: 2026-01-30)

## Next Steps
Recommended follow-up workflows:
- Review the plan: `devagent review-plan`
- Implement the plan: `devagent implement-plan`
