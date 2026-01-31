# Fix Cursor Agent Logs in Ralph Monitoring

- Owner: Jake Ruesink
- Last Updated: 2026-01-31
- Status: Active
- Task Hub: `.devagent/workspace/tasks/active/2026-01-30_fix-cursor-agent-logs/`
- Research: `research/2026-01-30_cursor-agent-log-locations.md`
- Plan: `plan/2026-01-30_fix-cursor-agent-logs-plan.md`

## Summary

The ralph-monitoring app's log viewer isn't working reliably. For both in-progress and completed tasks, the logs panel is stuck "trying to connect" and never displays the actual log content.

**Root cause hypothesis:** Similar to the comments issue we just fixed, the current approach tries to connect to log files dynamically. Instead, we should know where logs are stored and read them directly—no connection/streaming complexity.

**Scope:** Focus on Cursor Agent first since that's our default agent. Figure out how to get consistent, reliable log display for Cursor Agent task execution.

**Approach:**
1. Understand where Cursor Agent outputs its logs ✅ (research complete)
2. Implement direct file reading (similar to how we fixed comments with direct SQLite queries)
3. Display logs in the task detail view without connection/streaming issues

**Implementation strategy (see plan):**
- **LogViewer:** Load static logs first via `GET /api/logs/:taskId`, then optionally attach stream for live tail so the UI does not stay on "trying to connect."
- **Path resolution:** Use stored `task.log_file_path` from the DB for reading when present instead of recomputing path from taskId, so reader and writer paths align (fixes path/env mismatches).

## Agent Update Instructions
- Always update "Last Updated" to today's date (ISO: YYYY-MM-DD) when editing this file.
- Progress Log: Append new entries at the end.
- Implementation Checklist: Mark items as `[x]` when complete, `[~]` for partial.

## Key Decisions
- [2026-01-30] Decision: Focus on Cursor Agent first as it's our default agent for Ralph loops.
- [2026-01-30] Decision: Use direct file reading approach (similar to comments fix) rather than streaming/connection-based approach.

## Progress Log
- [2026-01-30] Task created: Scaffolded task hub for fixing Cursor Agent log display in ralph-monitoring.
- [2026-01-30] Research complete: Cursor Agent (when invoked by Ralph) does not write to a separate Cursor location; Ralph captures stdout/stderr and writes to `logs/ralph/<taskId>.log`. Stored `log_file_path` in DB is not used for reading—app recomputes path from taskId; using stored path when present would fix path/env mismatches. See `research/2026-01-30_cursor-agent-log-locations.md`.
- [2026-01-30] Plan created: Implementation plan added. Key changes: (1) LogViewer loads static logs first via GET /api/logs/:taskId, then optionally attaches stream for live tail; (2) use stored task.log_file_path from DB for reading when present. See `plan/2026-01-30_fix-cursor-agent-logs-plan.md`.
- [2026-01-30] Implementation complete:
  - Added `resolveLogPathForRead()` helper to `logs.server.ts` - prefers stored path when available
  - Added `getTaskLogFilePath()` to `beads.server.ts` - retrieves stored log_file_path from DB
  - Updated `logFileExists()`, `readLastLines()`, `getLogFileStats()`, `isLogFileTooLarge()` to accept optional pathOverride
  - Updated task route loader to use resolved path for log existence check
  - Updated `api.logs.$taskId.ts` and `api.logs.$taskId.stream.ts` to use stored path for reading/streaming
  - Updated LogViewer to prioritize showing logs content over "Loading..." status
  - Updated LogViewer to load static logs first, then connect stream for live tail (only for active tasks)

## Implementation Checklist
- [x] Research: Understand where Cursor Agent stores its output logs
- [x] Research: Review current log loading implementation in ralph-monitoring
- [x] Design: Determine simplest direct approach to reading and displaying logs (see plan)
- [x] Implement: Use stored `task.log_file_path` for reading when present (API + loader + logs.server)
- [x] Implement: LogViewer — load static logs first via GET /api/logs/:taskId, then optionally attach stream
- [x] Implement: Update task detail view to use new log loading (covered by above)
- [ ] Test: Verify logs display correctly for in-progress and completed tasks
- [ ] Cleanup: Remove or simplify connection-based log code if no longer needed

## Open Questions
- ~~Where exactly does Cursor Agent write its logs?~~ **Answered:** Ralph writes to `logs/ralph/<taskId>.log` (same path resolution as viewer; Cursor CLI output is piped there).
- ~~Are there multiple log sources we need to consolidate?~~ **Answered:** No; single file per task in this flow.
- Do we need to handle log rotation or large files? (Already supported: readLastLines + stream; document limits if needed.)

## References
- **Plan:** `plan/2026-01-30_fix-cursor-agent-logs-plan.md` — implementation tasks (stored path, LogViewer static-first then stream).
- **Research:** `research/2026-01-30_cursor-agent-log-locations.md` — log locations, path resolution, use of stored `log_file_path`, UI stream vs static.
- Related fix: Comments direct SQLite query (feature/comments-direct-sqlite-query branch)
- Ralph monitoring app: `apps/ralph-monitoring/`
- Cursor Agent config: `.devagent/plugins/ralph/agents/`
