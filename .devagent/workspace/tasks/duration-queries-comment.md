**Commit:** a0f89505 – feat(ralph-monitoring): expose task duration in queries via execution log join [skip ci]

**Summary:**
- BeadsTask now includes optional started_at, ended_at, duration_ms from ralph_execution_log (latest run per task via LEFT JOIN + ROW_NUMBER).
- When ralph_execution_log is missing, queries fall back to existing behavior (duration fields null); existing views unchanged.
- Added computeDurationMs (pure) and formatDurationMs for human-readable duration; duration shown on index task cards and task detail (header + metadata grid).
- Unit tests: duration calculation, formatDurationMs; snapshot test for task list shape with duration fields.

**Verification:** lint, typecheck, test (245) passed.

**Revision Learning:**
- **Category:** Architecture
- **Priority:** Low
- **Issue:** Snapshot test uses basic seed + one exec log row; snapshot includes all tasks so one task has duration and others have null. Stable and sufficient for regression.
- **Recommendation:** None.
- **Files/Rules Affected:** apps/ralph-monitoring/app/db/__tests__/beads.server.test.ts

Signed: Engineering Agent — Code Wizard
