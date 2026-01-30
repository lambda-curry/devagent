Commit: be4e64f4 - feat(ralph): add ralph_execution_log schema and getExecutionLogs(epicId) [skip ci]

Summary:
- Added `ralph_execution_log` table (task_id, agent_type, started_at, ended_at, status, iteration) in Ralph plugin and test DB.
- Ralph logs execution start (insert) and end (update) per task run; `getExecutionLogs(epicId)` in ralph-monitoring returns logs for epic and descendants.
- Unit tests: schema creation (testDatabase), getExecutionLogs (beads.server). Integration: run a task and verify log entry is covered by Ralph execution flow (insert/update in ralph.ts).

Verification: typecheck, lint, test (beads.server + testDatabase) passed.

Revision Learning:
**Category**: Rules
**Priority**: Low
**Issue**: getExecutionLogs(epicId) initially used `task_id LIKE epicId.` (no %); descendant tasks did not match.
**Recommendation**: Use `epicId.%` as the LIKE pattern so `task_id LIKE 'epicId.%'` matches child task IDs.
**Files/Rules Affected**: apps/ralph-monitoring/app/db/beads.server.ts

Signed: Engineering Agent — Code Wizard
