# Research Packet — Cursor Agent Log Locations (Ralph Flow)

- Mode: Task
- Requested By: (devagent research workflow)
- Last Updated: 2026-01-30
- Related Task Hub: `.devagent/workspace/tasks/active/2026-01-30_fix-cursor-agent-logs/AGENTS.md`
- Storage Path: `.devagent/workspace/tasks/active/2026-01-30_fix-cursor-agent-logs/research/2026-01-30_cursor-agent-log-locations.md`
- Notes: Research for implementing direct file reading instead of connection/streaming for Cursor Agent logs in ralph-monitoring.

## Request Overview

**Problem:** The ralph-monitoring app's log viewer is stuck "trying to connect" and does not reliably display logs for in-progress or completed tasks.

**Goal:** Understand where Cursor Agent stores its logs in the Ralph execution flow so we can implement direct file reading (similar to the comments fix with direct SQLite queries) instead of relying on connection/streaming.

**Scope:** Cursor Agent as the default Ralph agent; consistent, reliable log display in the task detail view.

## Research Questions

| ID | Question | Status | Notes |
| --- | --- | --- | --- |
| R1 | Where does Cursor Agent (when invoked by Ralph) write its output? | Answered | Ralph captures stdout/stderr and writes to Ralph-owned log path; Cursor CLI does not write to a separate Cursor-specific location in this flow. |
| R2 | What path resolution do Ralph (writer) and ralph-monitoring (reader) use? | Answered | Both use the same env vars and logic: `RALPH_LOG_DIR` or `<REPO_ROOT\|cwd>/logs/ralph`, filename `<taskId>.log`. |
| R3 | Is the stored `log_file_path` in the DB used for reading? | Answered | No. The app recomputes path from `taskId` via `getLogFilePath(taskId)`; it does not read using `task.log_file_path`. |
| R4 | Why might the UI show "trying to connect" instead of content? | Answered | LogViewer prefers stream (EventSource) then fallback static; path or env mismatch can cause 404 on both. |

## Key Findings

1. **Ralph owns the log file.** When Ralph runs a task (including Cursor Agent), it opens a single log file per task via `openRalphTaskLogWriter(task.id)` and pipes the agent process stdout/stderr into it. The path is resolved with the same logic as the viewer: `RALPH_LOG_DIR` or `<REPO_ROOT>/logs/ralph` + `<taskId>.log`. See `.devagent/plugins/ralph/tools/ralph.ts` (e.g. lines 771–773, 1210–1211) and `.devagent/plugins/ralph/tools/lib/ralph-log-writer.server.ts`.

2. **Cursor Agent does not write to a separate Cursor-specific path in this flow.** Ralph spawns the Cursor CLI (or other agent), captures stdout/stderr, and writes to the Ralph log path. There is no second "Cursor Agent log location" to read for the same run.

3. **Path alignment is critical.** Ralph sets `process.env.REPO_ROOT` and `process.env.RALPH_LOG_DIR` at loop start so the plugin’s `logs.server.ts` (used by the log writer) matches the intended directory. The ralph-monitoring app uses `apps/ralph-monitoring/app/utils/logs.server.ts`, which uses the same env vars and default `logs/ralph`. If the app runs with a different cwd or without those env vars, it may resolve a different directory and get 404 for the same task.

4. **DB stores the path but the app does not use it for reading.** `ralph_execution_log.log_file_path` is set to `resolveRalphTaskLogPath(task.id)` (the same path the writer uses). The task detail loader only uses `task.log_file_path != null` to decide "has execution history" and then calls `logFileExists(taskId)`, which recomputes the path from `taskId`. Reading by the stored `log_file_path` when present would avoid resolution mismatches.

5. **Direct file reading already exists.** The static API route `GET /api/logs/:taskId` reads the file directly via `readLastLines(taskId, 100)` and does not depend on streaming. The streaming route `GET /api/logs/:taskId/stream` uses `tail -F` on the same path. So "direct file reading" is already implemented; the issue is likely path/env consistency and/or UI preferring stream and showing "connecting" until stream opens or fallback runs.

## Detailed Findings

### Where Ralph writes logs

- **Code:** `.devagent/plugins/ralph/tools/ralph.ts`
  - `executeAgent()` opens `openRalphTaskLogWriter(task.id)` and pipes the spawned agent’s stdout/stderr into it via `drainStreamToLogAndCaptureTail` → `logWriter.write(value)`.
  - Before the loop, Ralph sets `process.env.REPO_ROOT` and `process.env.RALPH_LOG_DIR` so the plugin’s path resolution matches the config (e.g. `resolveRalphLogDirFromConfig(config)`).
- **Code:** `.devagent/plugins/ralph/tools/lib/ralph-log-writer.server.ts`, `.devagent/plugins/ralph/tools/lib/logs.server.ts`
  - Writer uses `getLogFilePath(taskId)` from the plugin’s `logs.server.ts`: `RALPH_LOG_DIR` or `<REPO_ROOT>/logs/ralph`, file `<taskId>.log` (sanitized).
- **DB:** `insertExecutionLogStart(dbPath, task.id, agentType, iteration, logFilePath)` with `logFilePath = resolveRalphTaskLogPath(task.id)` (same path).

### Where ralph-monitoring reads logs

- **Code:** `apps/ralph-monitoring/app/utils/logs.server.ts`
  - Same env vars: `RALPH_LOG_DIR`, `REPO_ROOT`; same default `logs/ralph`; same filename from `getLogFilePath(taskId)`.
  - `logFileExists(taskId)` and `readLastLines(taskId, n)` use this resolution; they do not use `task.log_file_path` from the DB.
- **Code:** `apps/ralph-monitoring/app/routes/tasks.$taskId.tsx`
  - Loader: `hasExecutionHistory = task.log_file_path != null`; `hasLogs = hasExecutionHistory ? logFileExists(taskId) : false`. So existence is checked by recomputed path, not by stored path.
- **Code:** `apps/ralph-monitoring/app/routes/api.logs.$taskId.ts` (static) and `api.logs.$taskId.stream.ts` (stream)
  - Both use `getLogFilePath(taskId)` (and related helpers) from `~/utils/logs.server`; neither accepts or uses a path from the request or from the DB.

### Cursor IDE’s own logs (out of scope for this flow)

- Cursor the application may write logs under e.g. `~/Library/Application Support/Cursor/` (macOS) or similar app-data directories. Those are not used by Ralph; Ralph only captures what the Cursor CLI (or other agent) prints to stdout/stderr and writes it to the Ralph log file.

## Implications for Implementation

1. **Use stored path when available.** For tasks with `task.log_file_path` set, the API and loader could read from that path instead of recomputing from `taskId`. That aligns reader with writer when env/cwd differ (e.g. app started from `apps/ralph-monitoring` without `REPO_ROOT`).
2. **Prefer direct read in the UI.** To avoid "trying to connect" when the stream fails or is slow, the LogViewer could load static logs first (direct read) and then optionally attach the stream for live updates, rather than waiting on EventSource before showing content.
3. **Keep a single source of truth.** The Ralph log path (`logs/ralph/<taskId>.log` with env-based base) remains the one place Cursor Agent output is stored in this flow; no need to discover or read a separate "Cursor Agent" log location.
4. **Optional: pass path from loader to viewer.** The loader could pass the resolved path (or a "read via path" hint) to the client so the client can request logs by path for debugging or future direct-path API; for now, using the stored path on the server is sufficient.

## Risks & Open Questions

| Item | Type | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Path in DB could be relative or absolute | Question | Impl | Confirm what Ralph stores (absolute vs relative); if relative, resolve against same base as writer. | TBD |
| Log rotation / large files | Risk | Impl | Already handled: `readLastLines` and stream support large files; document limits. | TBD |
| Multiple log sources | Question | Answered | No second source for this flow; single file per task. | — |

## Recommended Follow-ups

1. **Implement:** Prefer static/direct read in LogViewer (show content from GET `/api/logs/:taskId` first; attach stream for live tail if desired).
2. **Implement:** When `task.log_file_path` is present, use it for reading (and for `logFileExists` checks) so path resolution matches the writer.
3. **Validate:** Run Ralph from repo root with env set, then open ralph-monitoring from a different cwd; confirm logs appear when using stored path for read.

## Sources

| Reference | Type | Freshness | Access Notes |
| --- | --- | --- | --- |
| `.devagent/plugins/ralph/tools/ralph.ts` | Code | 2026-01-30 | executeAgent, insertExecutionLogStart, resolveRalphLogDirFromConfig, REPO_ROOT/RALPH_LOG_DIR |
| `.devagent/plugins/ralph/tools/lib/ralph-log-writer.server.ts` | Code | 2026-01-30 | openRalphTaskLogWriter, resolveRalphTaskLogPath |
| `.devagent/plugins/ralph/tools/lib/logs.server.ts` | Code | 2026-01-30 | getLogFilePath, getLogDirectory (plugin copy) |
| `apps/ralph-monitoring/app/utils/logs.server.ts` | Code | 2026-01-30 | getLogFilePath, logFileExists, readLastLines (app copy) |
| `apps/ralph-monitoring/app/routes/api.logs.$taskId.ts` | Code | 2026-01-30 | Static log read API |
| `apps/ralph-monitoring/app/routes/api.logs.$taskId.stream.ts` | Code | 2026-01-30 | Stream API (tail -F) |
| `apps/ralph-monitoring/app/components/LogViewer.tsx` | Code | 2026-01-30 | loadStaticLogs, connectToStream, preference order |
| `apps/ralph-monitoring/app/db/beads.server.ts` | Code | 2026-01-30 | log_file_path in queries, mapRowToTask |
| Task hub AGENTS.md | Task | 2026-01-30 | Goal: direct file reading; Cursor Agent first |
