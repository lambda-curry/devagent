# Research: Completion Hooks, Callbacks, and Event Notification in CLI and Agent Orchestration

- **Filename:** `2026-01-30_completion-hooks-and-callbacks-research.md`
- **Task:** Loop Completion Hooks
- **Classification:** Implementation design
- **Assumptions:** [INFERRED] Hook is for "when a run finishes" (single delegate run or full Ralph loop); primary implementation site is `delegate-agent.ts` in clawd; extensions (webhook, Clawdbot) follow shell hook.

---

## Research Plan (What Was Validated)

1. **Current orchestration flow** — Where completion can be observed and what metadata is available at each layer (delegate-agent.ts, delegate scripts, Ralph loop).
2. **Patterns for exit/complete callbacks** — How CLIs and orchestration scripts invoke configurable hooks on exit (trap, callback script, stdin vs env, timeout).
3. **Payload construction** — What data is available at delegate-agent vs Ralph loop level; how to get rich payload (iterations, summary, exitReason) when the run is a Ralph loop.
4. **Sync vs async and timeout** — Tradeoffs for blocking vs fire-and-forget and hook execution timeout.

---

## Sources

- **Internal:** `~/clawd/scripts/delegate-agent.ts`, `~/clawd/scripts/agents/cursor-delegate.ts`, `~/clawd/scripts/agents/lib.ts`, `~/clawd/skills/ralph-loop-delegation/SKILL.md`; `.devagent/plugins/ralph/tools/ralph.sh`, `.devagent/plugins/ralph/tools/ralph.ts` (executeLoop, executeAgent, CLI entrypoint).
- **Prior art (this repo):** `.devagent/workspace/tasks/completed/2026-01-16_ralph-branching-flow/research/2026-01-16_ralph-branching-flow-research.md` (trap usage in ralph.sh); `.devagent/workspace/tasks/completed/2026-01-22_ralph-loop-config/` (setup/teardown hooks in loop config).
- **General patterns:** Bash `trap ... EXIT`; Node/Bun `child.on('close', ...)`; passing JSON via stdin to a script; webhook POST with JSON body.

---

## Findings & Tradeoffs

### 1. Two Completion Boundaries

| Boundary | Script(s) | When it "completes" | Metadata available |
|----------|-----------|---------------------|--------------------|
| **Delegate run** | `delegate-agent.ts` → spawns `cursor-delegate.ts` (or jules/claude) | Child process exits | task, repo, agent, logFile, exit code (from child), duration (if parent tracks start). No iterations/summary unless child writes an outcome file. |
| **Ralph loop** | `ralph.sh` → `bun ralph.ts --epic ID` | executeLoop() returns (success, no ready tasks, blocked, or throw) | epicId, iterations, maxIterations, exit reason (no tasks / blocked / max failures), branch from run file, config. Summary would require aggregating from Beads or a single line. |

- **delegate-agent.ts** (clawd): Only sees child exit code. It does not know if the child was a Ralph loop or a one-off task. To get a rich payload (iterations, summary, exitReason), either (a) the child must write a well-known outcome file (e.g. `.ralph_outcome.json`) that the parent reads after exit, or (b) the hook is implemented inside the Ralph loop (ralph.ts) and invoked when the loop exits, with delegate-agent optionally forwarding the same hook when it runs something that is not Ralph.
- **Ralph loop** (ralph.ts executeLoop): Has full context: epicId, iteration count, exit reason (no ready tasks / epic blocked / task blocked after N failures), duration. It does not currently return a structured result; it returns `void` and the CLI calls `process.exit(0|1)`. So the natural place for a **rich** completion payload is inside `executeLoop` (or its CLI wrapper): before exiting, build payload, invoke hook, then exit.

**Recommendation:** Implement the hook at **both** layers for clarity and reuse:
- **delegate-agent.ts:** Add `--on-complete <script>`. On child exit, build a **minimal** payload (task, repo, status from exit code, duration) and invoke the script with JSON on stdin. Optionally: if child wrote an outcome file (e.g. `--outcome-file` from delegate or Ralph), merge that into the payload before invoking the hook.
- **Ralph (ralph.ts / ralph.sh):** Add optional completion hook (e.g. env `RALPH_ON_COMPLETE` or flag `--on-complete`). When the loop exits (in the CLI branch that calls `executeLoop`), have `executeLoop` return a result object `{ status, iterations, exitReason, epicId, durationSec, ... }`, then the CLI (or a small wrapper) builds the full payload and invokes the hook. This allows Clawdbot (or any runner) to call `ralph.sh --run ... --on-complete ./hook.sh` and get the rich payload without going through delegate-agent.

If the immediate goal is "notify when delegate run finishes" with minimal payload, implementing only in **delegate-agent.ts** is sufficient. If the goal is "notify when a Ralph loop finishes" with iterations/summary/exitReason, the hook must be invoked from the **Ralph** side (ralph.ts/ralph.sh); delegate-agent can still have its own hook for non-Ralph runs or as a passthrough.

### 2. Patterns for Exit Hooks

- **Bash `trap ... EXIT`:** Ensures a handler runs on script exit (success or failure). Used historically in ralph.sh for final review; good for "always run this on exit." Handler can write a file or call another script; passing large JSON via env is awkward.
- **Parent tracks child exit (Node/Bun):** `child.on('close', (code) => { ... })`. delegate-agent.ts already uses this to `process.exit(code)`. We can add: before exiting, build payload, spawn hook script with payload on stdin, then exit (optionally with a timeout).
- **Invoking a hook script:** Common pattern: write JSON to temp file or pass on stdin. Stdin is preferable (no cleanup, atomic). Example: `echo "$JSON" | ./my-hook.sh` or spawn with `stdin: 'pipe'` and write the JSON. Hook script is responsible for reading stdin.
- **Webhook:** POST JSON to a URL. Same payload; use `fetch` or `curl` with timeout. Can be added as a second mechanism (`--webhook-url`) or as the body of the same hook contract (script can be a wrapper that curls to a URL).

**Recommendation:** Shell hook receives JSON on stdin. Parent (delegate-agent or Ralph CLI) builds payload, spawns the script with stdin set to the JSON string. Optionally enforce a short timeout (e.g. 30s) so a broken hook does not block indefinitely; on timeout, log and exit with original code.

### 3. Payload Shape and Availability

| Field | delegate-agent (after child exit) | Ralph executeLoop |
|-------|-----------------------------------|-------------------|
| loopId / epicId | No (unless task is "run epic X" and we parse it) | Yes (epicId) |
| title | task (string) | Epic title from Beads or run file |
| repo | Yes (repoPath) | REPO_ROOT / run file |
| status | Map exit code → completed/failed | completed / blocked / failed |
| iterations | No | Yes |
| summary | No | Can add one-line from getEpicProgressSummary or similar |
| branch | No (unless we read from repo) | From run file / config |
| exitReason | Inferred from code | Explicit (no ready tasks, blocked, max failures) |
| durationSec | Yes (if parent tracks start) | Yes (loop start to end) |

So the **rich** payload is only available inside Ralph. For delegate-agent-only implementation, payload is: `task`, `repo`, `status` (completed | failed), `exitCode`, `durationSec`, and optionally `agent`. We can document that when the run is a Ralph loop, the runner can use Ralph’s `--on-complete` (or env) to get the full payload; when using delegate-agent for a single task, the minimal payload is used.

### 4. Sync vs Async and Timeout

- **Synchronous (blocking):** Parent waits for hook script to finish, then exits. Simple; hook can block the process.
- **Fire-and-forget:** Parent spawns hook and exits immediately with original exit code. Hook might not run if parent process dies quickly; also harder to debug (hook failures are detached).
- **Timeout:** If we block, cap hook execution (e.g. 30s); on timeout, kill the hook and exit with original code. Prevents a bad hook from hanging the runner.

**Recommendation:** Invoke hook **synchronously** with a **timeout** (e.g. 30s). On timeout or hook non-zero exit, log and proceed with original process exit code. This keeps behavior predictable and avoids indefinite blocks.

---

## Recommendation

1. **Implement `--on-complete <script>` in delegate-agent.ts (clawd):**
   - Before `process.exit(code)`, build a minimal payload: `{ task, repo, status: code === 0 ? 'completed' : 'failed', exitCode: code, durationSec, agent }`. Optionally include `branch` (e.g. from `getGitBranch(repoPath)` in the delegate script; delegate-agent would need to either get branch from the delegate or run git itself).
   - Spawn the hook script with JSON on stdin; wait up to 30s; then exit with original code.
   - Pass `--on-complete` through to the delegate script so that the delegate can optionally write an outcome file (e.g. for Ralph runs) that delegate-agent merges into the payload. Alternatively, implement outcome-file and hook invocation in Ralph and keep delegate-agent’s hook minimal.

2. **Implement completion hook in Ralph (ralph.ts / ralph.sh) for rich payload:**
   - Have `executeLoop` return a result object: `{ status: 'completed' | 'blocked' | 'failed', epicId, iterations, maxIterations, exitReason, durationSec, branch?, summary? }`.
   - CLI (ralph.ts `import.meta.main`): after `executeLoop`, if `RALPH_ON_COMPLETE` or `--on-complete` is set, build payload (including title from epic if available), invoke script with JSON on stdin, then `process.exit(0|1)`.
   - ralph.sh: after `bun ralph.ts --epic ...`, if hook is configured, ralph.sh could build a payload from env (EPIC_ID, EXIT_CODE, etc.) and call the hook—but then we duplicate logic. Prefer having ralph.ts accept `--on-complete` and do the invoke so ralph.sh just passes it through.

3. **Shell hook contract:** Hook script receives one JSON object on stdin (full payload). Exit code of the hook is ignored for the parent’s exit code; parent exits with the run’s exit code. Document the payload schema and that the hook should read stdin once.

4. **Extensions (later):** `--webhook-url` (POST same JSON), `--notify-clawdbot` (call `cron wake` with summary). Same payload; different transport.

---

## Repo Next Steps

- [ ] Add `--on-complete <path>` to delegate-agent.ts (clawd); build minimal payload on child exit; invoke script with JSON on stdin with timeout.
- [ ] Optionally: add `getGitBranch` or branch to delegate payload (in delegate-agent or delegate script).
- [ ] In Ralph: change `executeLoop` to return a result type; CLI invokes hook when `--on-complete` or env is set; document `RALPH_ON_COMPLETE` / `--on-complete` in ralph.sh and skill.
- [ ] Document hook contract (stdin JSON, timeout, exit code semantics) in delegate-agent skill and Ralph plugin README.
- [ ] Add tests: run delegate-agent with `--on-complete 'cat'` (or a script that echoes stdin) and assert payload shape.

---

## Risks & Open Questions

| Item | Type | Owner | Mitigation / Next Step |
|------|------|--------|------------------------|
| Hook blocks or hangs | Risk | Implementer | Use a 30s timeout and kill hook on timeout; log and exit with original code. |
| Rich payload only in Ralph | Clarification | Jake | Implement delegate-agent hook with minimal payload first; add Ralph-side hook and optional outcome-file handoff if we want one invocation point with full payload. |
| Sync vs fire-and-forget | Open question | Jake | Recommend sync with timeout; document in AGENTS.md. |
| Additional payload fields (PR URL, commit SHA) | Open question | Jake | Omit for MVP; add when needed. |
