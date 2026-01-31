# Fix Cursor Agent Logs — Implementation Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-30
- Status: In Review
- Related Task Hub: `.devagent/workspace/tasks/active/2026-01-30_fix-cursor-agent-logs/`
- Notes: Plan created from research packet `research/2026-01-30_cursor-agent-log-locations.md`.

---

## PART 1: PRODUCT CONTEXT

### Summary

The ralph-monitoring log viewer is stuck "trying to connect" and does not reliably show log content for in-progress or completed tasks. Research showed that (1) the UI prefers the EventSource stream and only falls back to static read when the stream fails, so users see "connecting" until the stream opens or fallback runs; and (2) the app recomputes log path from `taskId` via `getLogFilePath(taskId)` instead of using the stored `task.log_file_path` from the DB, so path/env mismatches (e.g., app started from a different cwd than Ralph) cause 404s. This plan implements loading static logs first via GET `/api/logs/:taskId`, then optionally attaching the stream for live tail, and using stored `task.log_file_path` when present so reader and writer paths align.

### Context & Problem

- **Current state:** LogViewer dispatches `SET_AVAILABLE` and calls both `loadStaticLogs()` and `connectToStream()` when `hasLogs` is true; the stream connection drives much of the visible state, so when the stream fails or is slow (or path resolution differs from the writer), the UI shows "trying to connect" and content may never appear.
- **Path resolution:** Ralph sets `log_file_path` in the DB to the same path it uses for writing. The app ignores it and uses `getLogFilePath(taskId)` everywhere, so if the app runs with different `REPO_ROOT`/`RALPH_LOG_DIR`/cwd, it looks for the file in the wrong place.
- **Research source:** `research/2026-01-30_cursor-agent-log-locations.md` — log locations, path resolution, use of stored `log_file_path`, UI stream vs static.

### Objectives & Success Metrics

- Log content appears reliably for tasks that have execution history and a log file (in-progress or completed).
- When the app runs with different cwd/env than Ralph, logs still display when the DB stores the writer’s path (`log_file_path`).
- Users see existing log content quickly (static read first), with live tail as an enhancement when the stream is available.

### Users & Insights

- Users viewing a task detail page expect to see Cursor Agent (Ralph) execution logs. Stuck "trying to connect" and empty panels undermine trust. Direct file read is already implemented; the fix is ordering (static first) and path consistency (use stored path).

### Solution Principles

- Prefer static/direct read first; attach stream for live tail optionally.
- Use a single source of truth for path when available: stored `task.log_file_path` from the DB.
- No new log sources: Ralph’s single file per task remains the only source in this flow.

### Scope Definition

- **In Scope:** LogViewer load order (static first, then optional stream); server-side use of stored `log_file_path` for existence check and read/stream APIs; tests and task hub updates.
- **Out of Scope / Future:** Log rotation handling beyond existing behavior; reading Cursor IDE app-data logs; multi-source log aggregation.

### Functional Narrative

- **Trigger:** User opens a task detail page for a task that has been executed by Ralph (has execution history).
- **Experience:** Log panel shows existing log content as soon as the static GET `/api/logs/:taskId` returns; if the task is in progress, the client may then attach the stream to show live tail. If path is stored in DB, server uses it so logs are found even when app cwd/env differs from Ralph’s.
- **Acceptance:** Log content appears for in-progress and completed tasks; using stored path when present fixes path/env mismatches (validated by running Ralph from repo root with env set and app from a different cwd).

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions

- Scope focus: ralph-monitoring app — LogViewer component, task route loader, log API routes, and `logs.server`/DB helpers.
- Key assumptions: Ralph continues to set `log_file_path` in the execution log; GET `/api/logs/:taskId` and GET `/api/logs/:taskId/stream` remain the two APIs; no change to Ralph plugin writer or DB schema.
- Out of scope: Ralph plugin changes, log rotation, performance tuning beyond current behavior.

### Implementation Tasks

#### Task 1: Use stored `log_file_path` for reading when present

- **Objective:** Resolve log file path from DB when available so reader and writer use the same path and path/env mismatches are avoided.
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/db/beads.server.ts` — add or expose a thin getter that returns `log_file_path` for a task (e.g. `getTaskLogFilePath(taskId): string | null`).
  - `apps/ralph-monitoring/app/utils/logs.server.ts` — add `resolveLogPathForRead(taskId: string, storedPath?: string | null): string` (return `storedPath` when present and non-empty, else `getLogFilePath(taskId)`). Add optional `pathOverride` to `logFileExists`, `readLastLines`, `getLogFileStats`, `getMissingLogDiagnostics` (or equivalent) so callers can pass the resolved path; internally use path when provided, else compute from taskId.
  - `apps/ralph-monitoring/app/routes/tasks.$taskId.tsx` — loader: resolve path via `resolveLogPathForRead(taskId, task.log_file_path)` and pass to `logFileExists(taskId, resolvedPath)` for `hasLogs`. Keep passing `hasLogs` and `hasExecutionHistory` to the page.
  - `apps/ralph-monitoring/app/routes/api.logs.$taskId.ts` — resolve path using stored path: e.g. `getTaskLogFilePath(taskId)` then `resolveLogPathForRead(taskId, storedPath)`; use resolved path for existence check, stats, and `readLastLines` (pass pathOverride where supported).
  - `apps/ralph-monitoring/app/routes/api.logs.$taskId.stream.ts` — same: resolve path via DB + `resolveLogPathForRead`, then use that path for `tail -F` and permission checks.
- **References:** Research packet § "DB stores the path but the app does not use it for reading"; § "Implications for Implementation" (use stored path when available).
- **Dependencies:** None.
- **Acceptance Criteria:**
  - When a task has `log_file_path` set, the loader and both API routes use that path for existence check and read/stream.
  - When `log_file_path` is null, behavior falls back to current `getLogFilePath(taskId)`.
  - No change to Ralph writer or DB schema.
- **Testing Criteria:** Unit or integration tests for `resolveLogPathForRead` (with/without stored path). Existing API and route tests updated or extended so that when a task has `log_file_path`, requests use that path (e.g. mock or fixture with stored path). Optionally: manual check with Ralph from repo root and app from different cwd.
- **Validation Plan:** Run existing ralph-monitoring tests; add/update tests for path resolution and API behavior with stored path.

#### Task 2: LogViewer — load static logs first, then optionally attach stream

- **Objective:** Show log content from GET `/api/logs/:taskId` as soon as it’s available; only then attach the EventSource stream for live tail so the UI does not stay on "trying to connect" when the stream is slow or fails.
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/components/LogViewer.tsx` — change initialization so that when `hasLogs` is true or when waiting for logs (active task), the component first fetches GET `/api/logs/:taskId` and displays the result; only after static content is shown (or after a short delay if desired) open the stream for live tail. When `hasLogs` is true, do not show "connecting" as the primary state before static content is loaded; prefer showing static content immediately and then "attaching live updates" or leaving stream as optional enhancement. Adjust reducer/state if needed so that "content available" is driven by static load first.
  - `apps/ralph-monitoring/app/components/LogViewer.reducer.ts` — if needed, add or adjust actions/state so that static load can set "content ready" before stream connects; stream then appends without being required for initial display.
- **References:** Research § "Prefer direct read in the UI"; § "Recommended Follow-ups" (static first, then attach stream).
- **Dependencies:** Task 1 (so that GET `/api/logs/:taskId` resolves path correctly).
- **Acceptance Criteria:**
  - For tasks with `hasLogs`, opening the task detail page shows log content from the static API as soon as the response returns, without waiting for the stream.
  - Stream is attached after static content is loaded (or in parallel but not blocking display); if the stream fails, existing static content remains visible.
  - For active tasks without a log file yet, existing "wait for logs" polling behavior remains; when the file appears, static load runs first, then stream can attach.
- **Testing Criteria:** Update or add LogViewer tests (and reducer tests) to assert: when `hasLogs` is true, static fetch is used and content is applied before or regardless of stream; stream is optional for initial display. Consider integration or E2E that opens a task with logs and asserts log text is present.
- **Validation Plan:** Run LogViewer and reducer tests; manual verification that task detail shows logs quickly and stream augments when available.

#### Task 3: Document plan in task hub and update checklist

- **Objective:** Record the implementation plan in the task hub and align AGENTS.md checklist with the plan.
- **Impacted Modules/Files:**
  - `.devagent/workspace/tasks/active/2026-01-30_fix-cursor-agent-logs/AGENTS.md` — add link to this plan under References; update Implementation Checklist to reflect "Design: Determine simplest direct approach" as done and add/check items for "Use stored log_file_path" and "LogViewer static-first then stream"; set "Last Updated" to 2026-01-30.
- **References:** Create-plan workflow output; task hub Progress Log.
- **Dependencies:** None.
- **Acceptance Criteria:** AGENTS.md references the plan and checklist matches the two main implementation tasks (path from DB, LogViewer static-first).
- **Testing Criteria:** N/A.
- **Validation Plan:** Review AGENTS.md for consistency with this plan.

### Implementation Guidance

- **From research packet `research/2026-01-30_cursor-agent-log-locations.md`:** Use stored path when available; prefer direct read in the UI then optional stream; single source of truth remains Ralph’s log file.
- **From `apps/ralph-monitoring`:** Follow existing error-handling and React Router patterns; use `data()` for API responses and avoid custom error classes (see ai-rules-generated-error-handling). Use Vitest and testing-library for tests; prefer `createRoutesStub` and route-level tests where appropriate (see ai-rules-generated-testing-best-practices).
- **Path security:** When using stored `log_file_path`, treat it as trusted (set by Ralph). If adding validation, ensure the path is under the expected log directory or matches a known pattern to avoid path traversal.

### Risks & Open Questions

| Item | Type | Owner | Mitigation / Next Step | Due |
|------|------|--------|-------------------------|-----|
| Stored path may be relative or absolute | Question | Impl | Confirm what Ralph stores; if relative, resolve against same base as writer (e.g. getLogDirectory()). | TBD |
| Large files / rotation | Risk | — | Already handled by readLastLines and stream; document limits if needed. | — |

### Progress Tracking

See the AGENTS.md file in the task directory for instructions on tracking and reporting progress during implementation.

### Appendices & References

- **Research:** `research/2026-01-30_cursor-agent-log-locations.md`
- **Task hub:** `.devagent/workspace/tasks/active/2026-01-30_fix-cursor-agent-logs/AGENTS.md`
- **Code:** `apps/ralph-monitoring/app/utils/logs.server.ts`, `app/routes/api.logs.$taskId.ts`, `app/routes/api.logs.$taskId.stream.ts`, `app/components/LogViewer.tsx`, `app/db/beads.server.ts`
- **Cursor rules:** ai-rules-generated-error-handling, ai-rules-generated-testing-best-practices, ai-rules-generated-react-router-7
