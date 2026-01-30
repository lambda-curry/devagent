## QA Verification: Duration in Task Queries

**Task:** devagent-ralph-dashboard-2026-01-30.duration-qa  
**Status:** PASS

### What was verified

1. **getAllTasks returns duration_ms for tasks with execution logs**
   - `apps/ralph-monitoring/app/db/__tests__/beads.server.test.ts`: describe "getAllTasks with duration (execution log join)" — tests include:
     - `includes started_at, ended_at, duration_ms from latest execution log`: bd-1001/bd-1002 get timing from exec log; bd-1003 has null timing.
     - `snapshot: task list shape with duration fields`: snapshot asserts duration_ms present/null per task.
   - Implementation: `getAllTasks` LEFT JOINs `LATEST_EXEC_LOG_SUBQUERY` and selects `el.started_at`, `el.ended_at`, `el.duration_ms`; `mapRowToTask` sets `duration_ms: row.duration_ms ?? null`.

2. **getTaskById includes timing fields**
   - Added two tests in "getTaskById":
     - `includes started_at, ended_at, duration_ms when execution log exists`: task bd-1001 with exec log row returns start/end/duration_ms (5 min window).
     - `returns null timing fields when task has no execution log`: task bd-1003 returns started_at/ended_at/duration_ms null.
   - Implementation: `getTaskById` uses same JOIN and selects `el.started_at`, `el.ended_at`, `el.duration_ms`; fallback `getTaskByIdWithoutExecLog` sets them null.

3. **Existing UI still renders correctly**
   - Route tests: `_index.test.tsx` (36 tests), `tasks.$taskId.test.tsx` (44 tests) — all pass. Mock tasks do not include duration_ms; UI correctly omits duration when absent.
   - UI code: `_index.tsx` and `tasks.$taskId.tsx` use `task.duration_ms != null && task.duration_ms >= 0` before rendering `formatDurationMs(task.duration_ms)`.

4. **Null handling for tasks without execution logs**
   - DB: When `ralph_execution_log` is missing or task has no row, fallback paths set `started_at`, `ended_at`, `duration_ms` to null. `mapRowToTask` uses `row.duration_ms ?? null`.
   - UI: Condition `task.duration_ms != null && task.duration_ms >= 0` prevents rendering duration for null/undefined.

### Commands run

- `bun run lint` (apps/ralph-monitoring): exit 0 (one unrelated fixable in scripts/serve-built.ts).
- `bun run typecheck` (apps/ralph-monitoring): exit 0.
- `bun run test` (apps/ralph-monitoring): 245 tests passed (19 files). beads.server.test.ts: 52 tests (includes new getTaskById duration tests).

### Evidence

- Implementation: `apps/ralph-monitoring/app/db/beads.server.ts` (getAllTasks, getTaskById, mapRowToTask, fallbacks).
- Types: `apps/ralph-monitoring/app/db/beads.types.ts` (BeadsTask.started_at, ended_at, duration_ms).
- Tests: `apps/ralph-monitoring/app/db/__tests__/beads.server.test.ts` (getAllTasks with duration, getTaskById timing).

### Summary

All acceptance criteria met. Duration fields are correctly exposed in task queries, null handling is consistent, and existing UI and route tests pass. Two getTaskById tests were added to explicitly cover timing fields with and without execution log.

---
Revision Learning:
**Category**: Process  
**Priority**: Low  
**Issue**: getTaskById duration/timing was not explicitly tested; only getAllTasks had duration tests.  
**Recommendation**: When adding join-derived fields to both list and single-row queries, add tests for both entry points.  
**Files/Rules Affected**: apps/ralph-monitoring/app/db/__tests__/beads.server.test.ts

Signed: QA Agent — Bug Hunter
