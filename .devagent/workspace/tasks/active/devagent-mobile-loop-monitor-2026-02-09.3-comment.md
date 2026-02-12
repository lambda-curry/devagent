Commit: 1b22da6f - feat(ralph-monitoring): full-screen live log view at /epics/:epicId/live [skip ci]

Summary:
- Added route `/epics/:epicId/live` with full-screen dark terminal-style UI; connects to existing SSE endpoint `/api/logs/:taskId/stream`.
- Loop detail "Watch Live" (NowCard) now links to live view; epic detail renders only `<Outlet />` when path ends with `/live` so the live page has full screen.
- Auto-scroll, tap-to-pause, Resume button; header shows current task name + status; back link to loop detail. Revalidation every 3s to detect active task change and switch stream.

Verification: lint, typecheck, test (278 passed). Component tests for loader, header/back link, no-active-task message, stream URL, pause/resume.

Revision Learning:
**Category**: Rules
**Priority**: Low
**Issue**: Early return before hooks in epics.$epicId (for live child) triggered useHookAtTopLevel lint; hooks must run unconditionally.
**Recommendation**: When branching render (e.g. child route), call all hooks first, then `if (condition) return <Outlet />` before the main JSX.
**Files/Rules Affected**: apps/ralph-monitoring/app/routes/epics.$epicId.tsx, lint rules for React hooks.

Signed: Engineering Agent — Code Wizard
