**Summary:** Moved `resolveLogPathForRead` to run only after task ID validation. Validation try/catch now runs first (calling `getLogFilePath(taskId)` when there is no stored path); then `resolveLogPathForRead(taskId, storedLogPath)` is called. Invalid task IDs now return 400 instead of 500. Added test for invalid task ID format (e.g. `.`) returning 400.

**Verification:** `bun run typecheck`, `bun run test -- --run` (324 tests), lint — all passed.

**Commit:** 4154678a - fix(api): move resolveLogPathForRead after taskId validation (devagent-pr94-feedback.2) [skip ci]

---
Revision Learning:
**Category**: Rules
**Priority**: Low
**Issue**: None; change was straightforward.
**Recommendation**: N/A
**Files/Rules Affected**: N/A

Signed: Engineering Agent — Code Wizard
