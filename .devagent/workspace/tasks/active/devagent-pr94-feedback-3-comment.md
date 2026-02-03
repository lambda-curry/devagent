Commit: 24307779 - refactor(ralph-monitoring): add optional logPath param to logFileExists [skip ci]

Summary:
- Updated `logFileExists(taskId, logPath?)` in `apps/ralph-monitoring/app/utils/logs.server.ts`: renamed param from `pathOverride` to `logPath`, use `pathToCheck = logPath || getLogFilePath(taskId)`; when `logPath` not provided, ensure log directory then check computed path.
- Call sites already passed resolved path: `api.logs.$taskId.ts`, `api.logs.$taskId.stream.ts`, `tasks.$taskId.tsx` — no changes.

Verification: lint, typecheck, test (324) passed.

Revision Learning:
**Category**: Rules
**Priority**: Low
**Issue**: Task spec asked for param name `logPath` and `pathToCheck = logPath || getLogFilePath(taskId)`; implementation already had equivalent behavior with `pathOverride`. Renaming and explicit local variable improve consistency with spec and readability.
**Recommendation**: None.
**Files/Rules Affected**: apps/ralph-monitoring/app/utils/logs.server.ts

Signed: Engineering Agent — Code Wizard
