# Handoff Prompt

**Goal / Intent**
Implement real-time monitoring for agent processes in `executeAgent` by streaming stdout/stderr to log files in real-time and writing PID files so the Ralph monitoring UI can track and monitor agent execution as it happens.

**Current State**
The `executeAgent` function in `.devagent/plugins/ralph/tools/ralph.ts` currently:
- Uses `Bun.spawn` to execute agent commands (correct approach for long-running processes)
- Waits for process completion before reading output
- Does not write PID files for monitoring
- Does not stream logs in real-time

The Ralph monitoring UI already has infrastructure to:
- Read PID files via `apps/ralph-monitoring/app/utils/process.server.ts`
- Stream log files via `apps/ralph-monitoring/app/routes/api.logs.$taskId.stream.ts`
- Stop processes by PID

**Decisions / Assumptions**
- Keep using `Bun.spawn` (child process is correct for long-running agents)
- Do not run in the main thread (would block execution)
- Stream stdout/stderr to log files as data arrives (not after completion)
- Write PID file immediately after spawn for monitoring UI
- Use `proc.pgid` if available (Bun.spawn doesn't support `processGroup` option)
- Ensure log directory exists before writing (use `mkdirSync` with `recursive: true`)
- Clean up PID file on process completion or error (use `finally` block)
- Use existing utilities: `getLogFilePath()` from `logs.server.ts` and `getPidFilePath()` from `process.server.ts`

**References**
- `.devagent/plugins/ralph/tools/ralph.ts` (lines 461-534) — `executeAgent` function to modify
- `apps/ralph-monitoring/app/utils/logs.server.ts` — `getLogFilePath()` utility for log file paths
- `apps/ralph-monitoring/app/utils/process.server.ts` — `getPidFilePath()` utility for PID file paths
- `apps/ralph-monitoring/app/routes/api.logs.$taskId.stream.ts` — Example of real-time streaming pattern (uses `tail -F`, but shows the streaming approach)
- `.devagent/workspace/tasks/active/2026-01-17_fix-comments-visibility-and-realtime-log-view/plan/2026-01-17_comments-and-log-view-plan.md` — Related task for log streaming improvements

**Next Steps**
1. Modify `executeAgent` to:
   - Import `getLogFilePath` from `apps/ralph-monitoring/app/utils/logs.server.ts`
   - Import `getPidFilePath` from `apps/ralph-monitoring/app/utils/process.server.ts`
   - Import `mkdirSync`, `unlinkSync` from `node:fs`
   - Import `dirname` from `node:path` for directory operations
   - Ensure log directory exists before spawning (use `mkdirSync` with `recursive: true` on `dirname(logPath)`)
   - Write PID file immediately after spawn:
     - Get PID from `proc.pid`
     - Get PGID from `proc.pgid` if available (may be undefined)
     - Format: `${pid}\n${pgid}` if pgid exists, else just `${pid}`
     - Use `Bun.write()` to write PID file atomically
   - Use `for-await-of` to iterate over `proc.stdout` and `proc.stderr` streams in parallel
   - Write chunks to log file in real-time using `Bun.file(logPath).writer()`
   - Use `TextDecoder` to decode `Uint8Array` chunks to strings
   - Wait for both streams to finish before closing log file writer
   - Clean up PID file in `finally` block to ensure it happens on all exit paths (success, error, timeout)
2. Test the implementation:
   - Verify PID file is created and readable by monitoring UI immediately after spawn
   - Verify log file is written in real-time (not just at end) - check file size grows during execution
   - Verify monitoring UI can stream logs while agent is running
   - Verify process can be stopped via PID file
   - Verify cleanup happens on both success and error paths

**Risks / Open Questions**
- Need to handle import paths correctly (ralph.ts is in `.devagent/plugins/ralph/tools/` while utilities are in `apps/ralph-monitoring/app/utils/`)
- Consider using relative imports or re-exporting utilities if cross-package imports are problematic
- Ensure log file writer handles errors gracefully (don't crash if disk is full)
- Bun's `proc.pgid` may be undefined - handle gracefully (PID file format supports optional PGID)

**Execution Notes**
- The monitoring UI expects PID files at `logs/ralph/${taskId}.pid` (handled by `getPidFilePath`)
- The monitoring UI expects log files at `logs/ralph/${taskId}.log` (handled by `getLogFilePath`)
- Both utilities use `REPO_ROOT` and `RALPH_LOG_DIR` environment variables
- PID file format: first line is PID, second line (optional) is process group ID
- Use `TextDecoder` to decode stream chunks from `Uint8Array` to strings
- Use `Bun.file().writer()` for async file writing (not `writeFileSync`)
- Stream both stdout and stderr to the same log file (append both streams)
- Use `Promise.all()` or parallel `for-await-of` loops to handle both streams concurrently
