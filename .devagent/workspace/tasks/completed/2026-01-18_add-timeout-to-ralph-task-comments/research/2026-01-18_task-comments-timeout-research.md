# Add timeout to Ralph task comment retrieval (`bd comments`) — Research

## Classification & Assumptions
- **Classification:** implementation design + reliability hardening (prevent indefinite hang)
- **Assumptions:**
  - The hang is occurring in `.devagent/plugins/ralph/tools/ralph.ts` when calling `Bun.spawnSync(["bd", "comments", taskId, "--json"], ...)`.
  - The primary requirement is **bounded time** for comment retrieval; returning an empty comment list is acceptable as a fallback as long as downstream logic does not hang or crash.
  - This task targets the Ralph loop/router behavior (not the monitoring UI’s server DB layer), per the task hub summary.

## Research Plan (what was validated)
- Locate the comment retrieval call site and downstream consumers (failure counting + blocking logic).
- Confirm whether Bun supports a native timeout for `spawnSync`, and how to detect “timed out” vs “non-zero exit”.
- Identify the safest termination behavior for a timed-out sync subprocess (signal choice) to avoid still hanging after timeout.

## Sources (with links and versions)
- **Internal (repo):**
  - `.devagent/plugins/ralph/tools/ralph.ts` — `getTaskComments()` uses `Bun.spawnSync(["bd","comments",...])` and is called by `getTaskFailureCount()` in the main execution loop.
  - `.devagent/workspace/tasks/completed/2026-01-18_add-timeout-to-ralph-task-comments/AGENTS.md` — task intent, checklist, and decision record.
  - `.devagent/workspace/tasks/completed/2026-01-17_ralph-revisions-v4/AGENTS.md` — original v4 checklist item + acceptance criteria emphasis on “bounded timeout” and avoiding indefinite spinner/hang.
- **External (authoritative):**
  - Bun docs — `Bun.spawnSync()` options include `timeout` and `killSignal`; `SyncSubprocess` includes `exitedDueToTimeout` + `signalCode`. (Source: `https://github.com/oven-sh/bun/blob/main/docs/runtime/child-process.mdx`)
  - Node.js docs — synchronous process creation with `timeout` warns that the parent can still wait if the child handles `SIGTERM`; use an appropriate `killSignal` to ensure termination. (Source: `https://github.com/nodejs/node/blob/main/doc/api/child_process.md`)

## Findings & Tradeoffs
### What’s happening today
- `getTaskComments(taskId)` in `ralph.ts` is synchronous and unbounded:
  - It calls `Bun.spawnSync(["bd", "comments", taskId, "--json"], { stdout: "pipe", stderr: "pipe" })`.
  - If the `bd comments` process stalls indefinitely, **the entire Ralph execution loop stalls** because `spawnSync` blocks the event loop until the subprocess ends.
- Downstream dependency:
  - `getTaskFailureCount(taskId)` relies on `getTaskComments(taskId)` and is called before blocking logic in the main loop (`failureCount >= MAX_FAILURES`).

### Bun supports the needed mechanism
- Bun provides a first-class `timeout` option for `Bun.spawnSync()` (milliseconds).
- Bun provides a machine-readable signal for timeouts: `SyncSubprocess.exitedDueToTimeout === true`.
- Bun allows forcing termination with `killSignal` when timing out.

### Timeout duration tradeoffs
- **Short timeout (e.g., 2–5s):**
  - Pros: fast feedback, keeps loop responsive.
  - Cons: may be too aggressive if `bd comments --json` legitimately takes longer for large comment histories or slow storage; can lead to “unknown failure count” more often.
- **Moderate timeout (e.g., 10s):**
  - Pros: still bounded; likely robust for normal CLI latency; fewer spurious timeouts.
  - Cons: still blocks the loop for up to 10s per task before proceeding/skipping.
- **Long timeout (e.g., 30s+):**
  - Pros: fewer timeouts.
  - Cons: defeats the purpose for “hang-like” behavior; worse operator experience.

### Kill signal choice matters for “actually bounded”
- `spawnSync` timeouts can still effectively hang if the subprocess receives a “soft” signal and refuses to exit.
  - Node’s docs explicitly warn about this for sync timeouts with `SIGTERM`.
  - Recommendation: use `killSignal: "SIGKILL"` for timeouts on `bd comments` to ensure the sync call actually returns in bounded time.
    - Tradeoff: `SIGKILL` prevents cleanup; however `bd comments --json` should be a read-only command and safe to hard-kill.

### “Clear error handling” without overhauling call sites
The current `getTaskComments()` contract is “best-effort, return `[]` on failure”, which is safe for callers. To make failures actionable without breaking callers:
- **Log an explicit warning** when:
  - `exitedDueToTimeout` is true (timeout is the special case we care about).
  - `exitCode !== 0` and stderr indicates a CLI failure.
- **Differentiate timeout vs other failures** in the warning message so operators can tell whether to adjust timeout vs debug Beads/CLI.

### How to “degrade safely” for failure counting
If comments can’t be retrieved, `getTaskFailureCount()` cannot reliably enforce `MAX_FAILURES`. Options:
- **Option A (minimally invasive):** Treat “no comments” as “0 failures” and proceed (current behavior).
  - Pros: never blocks progress due to comment retrieval; avoids false blocks.
  - Cons: may retry a failing task indefinitely if comment retrieval is consistently timing out/failing.
- **Option B (conservative):** If comment retrieval timed out, skip processing that task for this iteration and continue to the next task (or stop with a clear operator message).
  - Pros: avoids runaway repeated failures when you can’t read state.
  - Cons: can stall progress if comment retrieval is systematically broken.
- **Option C (bounded safety net):** On timeout, allow execution but add an additional guardrail that doesn’t depend on comments (e.g., a per-process in-memory attempt counter for the current run).
  - Pros: prevents infinite retries in a single run even when comments are unreadable.
  - Cons: does not persist across process restarts.

Given the task statement (“degrades safely”), **Option A + strong warning** is the safest default unless the desired behavior is explicitly “stop the world when state is unknown”.

## Recommendation
- **Implement a bounded timeout in `getTaskComments()` using Bun’s native `timeout` option** (suggest default: **10_000ms**), plus **`killSignal: "SIGKILL"`** to ensure timeouts are truly bounded.
- **Detect timeouts explicitly** via `result.exitedDueToTimeout` and log a distinct warning:
  - Include: task ID, timeout duration, and that failure counting may be degraded for this iteration.
- **Keep the return shape stable** (`Array<{ body; created_at }>`), returning `[]` on timeout/failure to avoid cascading runtime changes.
- **Decide the failure-count degradation policy**:
  - Default recommendation: **do not block tasks** based solely on inability to fetch comments; rely on the warning and existing MAX_FAILURES enforcement when comments are available.
  - If runaway failures are a real concern, adopt Option C (single-run attempt cap) as a follow-up hardening.

## Repo Next Steps (checklist)
- [ ] Add `timeout` + `killSignal` to the `Bun.spawnSync(["bd","comments",...])` call in `getTaskComments()`.
- [ ] Add explicit timeout detection using `SyncSubprocess.exitedDueToTimeout`.
- [ ] Emit a structured warning message for timeout vs non-timeout failures.
- [ ] Verify `getTaskFailureCount()` behavior when comments are empty (no false positives; no crash).
- [ ] (Optional) Document timeout choice and how to tune it (env var or config) in the task hub and/or Ralph docs.

## Risks & Open Questions
- **Timeout value:** What’s the desired timeout for `bd comments --json` (5s vs 10s vs configurable)?
- **Blocking policy:** Should “cannot retrieve comments” be treated as:
  - “0 failures, proceed” (progress-first), or
  - “unknown, skip/block” (safety-first)?
- **Signal portability:** `SIGKILL` is POSIX; if Windows support is required, confirm the behavior (Bun supports `killSignal`, but semantics differ by OS).
