# Research: Loop Completion Hooks — CLI Patterns and delegate-agent.ts Integration

- **Filename:** `2026-01-30_delegate-agent-completion-hook-context.md`
- **Task:** Loop Completion Hooks
- **Classification:** Implementation design (integration context)
- **Assumptions:** delegate-agent.ts (clawd) is the primary integration point for Phase 1; shell script hook with JSON on stdin is the contract; sync with timeout per prior research.

---

## Research Plan (What Was Validated)

1. **CLI completion hook patterns** — How established CLIs (npm, Git, GitHub Actions, pre-commit) invoke “run after X completes” and pass data (stdin vs env vs args).
2. **delegate-agent.ts current flow** — Where completion is observed (child exit), what metadata is available, and where to inject the hook.
3. **Application of patterns to delegate-agent.ts** — Mapping post-* semantics, stdin payload, and timeout to the existing spawn/close flow.

---

## Sources

| Source | Version / Date | Link / Path |
|--------|----------------|-------------|
| delegate-agent.ts | Current | `~/clawd/scripts/delegate-agent.ts` |
| clawd agents/lib.ts | Current | `~/clawd/scripts/agents/lib.ts` |
| Task research (CLI patterns) | 2026-01-30 | `research/2026-01-30_cli-completion-hook-patterns.md` |
| Task research (callbacks) | 2026-01-30 | `research/2026-01-30_completion-hooks-and-callbacks-research.md` |
| npm lifecycle scripts | v8/v11 | [docs.npmjs.com – using-npm/scripts](https://docs.npmjs.com/cli/v8/using-npm/scripts) |
| Git githooks | 2.x | [git-scm.com/docs/githooks](https://git-scm.com/docs/githooks) |

---

## Findings & Tradeoffs

### 1. CLI Completion Hook Patterns (Summary)

- **Post-* semantics:** Git post-* hooks and npm `post*` scripts run after the main operation; they are notification-style and do not override the parent exit code. Completion hooks for delegate-agent should follow the same rule: parent exits with the **run’s** exit code, not the hook’s.
- **Data passing:** Git uses stdin for structured ref data; passing one JSON object on stdin to a hook script avoids env size limits and escaping. Established and appropriate for our payload.
- **Sync and timeout:** CLIs typically run hooks synchronously; few document a per-hook timeout. Adding a 30s cap for the completion hook prevents a bad or slow script from hanging the runner; on timeout, log and exit with the run’s code.

### 2. delegate-agent.ts Current Flow

**Relevant code (from `~/clawd/scripts/delegate-agent.ts`):**

- **Entry:** Parses `--agent`, `--task`, `--repo`, `--log`, `--timeout`, `--continue` via `parseArgs(process.argv.slice(2))`. No `--on-complete` today; no start-time capture.
- **Spawn:** `const child = spawn("bun", ["run", agentScript, ...agentArgs], { stdio: "inherit" });`
- **Exit:** `child.on("close", (code) => process.exit(code ?? 0));` and `child.on("error", ...)` for spawn failure.

**Metadata available at child exit:**

- From options: `task`, `repoInput`/`repoPath`, `selectedAgent`, `logFile`, `timeout`.
- From runtime: exit `code` from child. **Duration:** not currently captured — need to record start time before spawn and compute `durationSec` in the close handler.
- **Branch:** Not in delegate-agent today; `lib.ts` exposes `getGitBranch(repo)` — can be called when building the payload if we want `branch` in the minimal payload.

**Insertion point for the hook:** In the `child.on("close", (code) => { ... })` handler, before `process.exit(code ?? 0)`:

1. Compute `durationSec` from start time (must add `startTime = Date.now()` before spawn).
2. Build minimal payload: `{ task, repo, status: code === 0 ? 'completed' : 'failed', exitCode: code ?? -1, durationSec, agent: selectedAgent }`. Optionally add `branch: getGitBranch(repoPath)`.
3. If `options.onComplete` is set and the path exists (or is a valid command): spawn the hook process with stdin set to the JSON string; wait up to 30s; on timeout or error, log and do not change exit behavior.
4. Exit: `process.exit(code ?? 0)` (unchanged — hook exit code does not override).

### 3. Implementation Notes (delegate-agent.ts)

- **Parsing:** Use existing `parseArgs`; add `options.onComplete` (path or script name). No new dependencies.
- **Invoking the hook:** Use `spawn` with `stdio: ['pipe', 'inherit', 'inherit']`, write payload to `child.stdin`, then `child.stdin.end()`. Wait for `close` with a 30s timeout (e.g. `setTimeout` + `child.kill()` or use a small helper that wraps spawn and Promise.race with a timeout).
- **Robustness:** If `--on-complete` is missing or path not executable, log a warning and skip invocation; always exit with the run’s code. Do not let hook failure or timeout change the process exit code.
- **Reuse:** `~/clawd/scripts/agents/lib.ts` already has `getGitBranch`, `parseArgs`, `parseTimeout`. A small `invokeCompletionHook(payload, scriptPath, timeoutMs)` could live in lib.ts and be called from delegate-agent.ts to keep the main script thin.

---

## Recommendation

1. **Implement Phase 1 in delegate-agent.ts:** Add `--on-complete <path>`, record start time before spawn, and in `child.on("close")` build the minimal JSON payload, invoke the hook with JSON on stdin (30s timeout), then `process.exit(code ?? 0)`. Hook exit code never overrides process exit code.
2. **Contract:** Same as prior research — one JSON object on stdin; script reads stdin once; 30s timeout; parent exit code = run exit code.
3. **Optional:** Include `branch` in the minimal payload via `getGitBranch(repoPath)` from lib.ts when building the payload.
4. **Helper:** Consider `invokeCompletionHook(payload, scriptPath, timeoutMs)` in `~/clawd/scripts/agents/lib.ts` to centralize spawn + stdin + timeout logic and keep delegate-agent.ts readable.

---

## Repo Next Steps

- [ ] Add start-time capture and `--on-complete` parsing in delegate-agent.ts.
- [ ] In child close handler: build payload, call hook helper (or inline spawn with stdin + timeout), then process.exit(run code).
- [ ] Add optional `invokeCompletionHook` (or equivalent) in lib.ts; document payload schema and timeout behavior.
- [ ] Validate with a simple hook (e.g. `cat` or script that writes stdin to a file) and assert payload shape and exit code behavior.

---

## Risks & Open Questions

| Item | Type | Note |
|------|------|------|
| Hook path validation | Implementation | If path is a command (e.g. `cat`), may not be a file; treat as “run with argv[0]” and pass path as first arg, or require path to exist when it looks like a file. |
| Timeout kill signal | Implementation | Use SIGTERM first on timeout; document that hook may be killed after 30s. |
| Stdin size | Edge case | Very large payloads (e.g. if we later add logs) could hit buffer limits; keep minimal payload small; document that hook reads once from stdin. |
