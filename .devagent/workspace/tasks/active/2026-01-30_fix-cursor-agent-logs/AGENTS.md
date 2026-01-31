# Fix Cursor Agent Logs in Ralph Monitoring

- Owner: Jake Ruesink
- Last Updated: 2026-01-30
- Status: Active
- Task Hub: `.devagent/workspace/tasks/active/2026-01-30_fix-cursor-agent-logs/`

## Summary

The ralph-monitoring app's log viewer isn't working reliably. For both in-progress and completed tasks, the logs panel is stuck "trying to connect" and never displays the actual log content.

**Root cause hypothesis:** Similar to the comments issue we just fixed, the current approach tries to connect to log files dynamically. Instead, we should know where logs are stored and read them directly—no connection/streaming complexity.

**Scope:** Focus on Cursor Agent first since that's our default agent. Figure out how to get consistent, reliable log display for Cursor Agent task execution.

**Approach:**
1. Understand where Cursor Agent outputs its logs
2. Implement direct file reading (similar to how we fixed comments with direct SQLite queries)
3. Display logs in the task detail view without connection/streaming issues

## Agent Update Instructions
- Always update "Last Updated" to today's date (ISO: YYYY-MM-DD) when editing this file.
- Progress Log: Append new entries at the end.
- Implementation Checklist: Mark items as `[x]` when complete, `[~]` for partial.

## Key Decisions
- [2026-01-30] Decision: Focus on Cursor Agent first as it's our default agent for Ralph loops.
- [2026-01-30] Decision: Use direct file reading approach (similar to comments fix) rather than streaming/connection-based approach.

## Progress Log
- [2026-01-30] Task created: Scaffolded task hub for fixing Cursor Agent log display in ralph-monitoring.

## Implementation Checklist
- [ ] Research: Understand where Cursor Agent stores its output logs
- [ ] Research: Review current log loading implementation in ralph-monitoring
- [ ] Design: Determine simplest direct approach to reading and displaying logs
- [ ] Implement: Add direct log file reading for Cursor Agent
- [ ] Implement: Update task detail view to use new log loading
- [ ] Test: Verify logs display correctly for in-progress and completed tasks
- [ ] Cleanup: Remove or simplify connection-based log code if no longer needed

## Open Questions
- Where exactly does Cursor Agent write its logs? (file path, format)
- Are there multiple log sources we need to consolidate?
- Do we need to handle log rotation or large files?

## References
- Related fix: Comments direct SQLite query (feature/comments-direct-sqlite-query branch)
- Ralph monitoring app: `apps/ralph-monitoring/`
- Cursor Agent config: `.devagent/plugins/ralph/agents/`
