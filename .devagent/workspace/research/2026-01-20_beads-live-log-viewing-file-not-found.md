# Beads Live Log Viewing Shows “Can’t Find Log Files”

**Date:** 2026-01-20  
**Classification:** Bug investigation (runtime behavior mismatch)  

## Inferred Problem Statement
When viewing a task in the Ralph monitoring UI, **live log viewing/streaming is not working** and consistently shows “can’t find the log files”. The expectation is **only to show logs while a task is active**, as a way to watch what the agent is doing in real time.

## Assumptions
- [INFERRED] The UI in question is `apps/ralph-monitoring`’s task detail page log viewer.
- [INFERRED] The underlying log stream API returns a 404-like “log file not found” when the resolved log path does not exist.
- [INFERRED] If a task is inactive, it’s acceptable to show no logs (or a clear inactive/no-live-logs state), but active tasks should stream if logs are being written.

## Research Plan (what was validated)
- Confirm what prior internal research concluded about log path resolution and common root causes for “file not found”.
- Determine whether this issue was previously implemented/fixed in this repo (to avoid redundant work).
- Extract concrete “next checks” that can distinguish: misconfiguration vs log writer not producing files vs viewer/stream endpoint mismatch.

## Sources (internal)
- `.devagent/workspace/tasks/active/2026-01-17_fix-comments-visibility-and-realtime-log-view/research/2026-01-17_comments-and-log-view-research.md` — Prior investigation of “Log file not found” flow, including path resolution logic and likely root causes.
- `.devagent/workspace/tasks/active/2026-01-17_fix-comments-visibility-and-realtime-log-view/plan/2026-01-17_comments-and-log-view-plan.md` — Prior plan describing how the repo intended to harden log streaming and directory creation.
- `.devagent/workspace/tasks/active/2026-01-17_fix-comments-visibility-and-realtime-log-view/2026-01-17_devagent-201a-improvements.md` — Claims the log streaming stabilization work shipped (traceability includes a log fix commit hash).

## Findings & Tradeoffs

### 1) Internal docs indicate this was already fixed (at least once)
The epic report at:
- `.devagent/workspace/tasks/active/2026-01-17_fix-comments-visibility-and-realtime-log-view/2026-01-17_devagent-201a-improvements.md`

…states that **log streaming was stabilized** and lists a commit for “stabilize log directory and improve stream error handling”.

**Implication:** If you still see “can’t find the log files”, the most likely explanations are:
- You’re running code that **doesn’t include** that fix commit (branch divergence / missing merge).
- The fix shipped, but the current environment still **isn’t producing logs** where the viewer expects them (config mismatch).
- A regression reintroduced the failure mode.

### 2) The most common root causes from the prior investigation are still configuration + log creation
From the prior research packet, the log path is resolved from:
- `REPO_ROOT` (or `process.cwd()`) and
- `RALPH_LOG_DIR` (or a default under `logs/ralph`)

and the stream endpoint checks “does the file exist?” before attempting to stream. If the viewer always shows “can’t find the log files”, then **either the file is never created**, or it is created **somewhere else** than the viewer expects.

**Tradeoff note:** Auto-creating `logs/ralph/` improves “it just works” locally, but it can also mask misconfiguration (e.g., `REPO_ROOT` pointing at the wrong directory). The best practice is to auto-create *and* emit diagnostics (expected path/config hints) when the file is still missing.

### 3) This is likely an environment/branch mismatch, not a purely UI rendering bug
Because internal artifacts claim a fix landed (and even include commit hashes), the fastest way to avoid wasted effort is to first confirm:
- **Does the running environment include the “log directory creation + better error messaging” changes?**
- **Is the agent execution actually writing logs to the expected location while the task is active?**

## Recommendation
Treat this as a **two-part verification**:

1) **Confirm you’re running code that includes the previously-shipped log streaming hardening** (or identify a regression point if it was reverted).  
2) **Confirm log production + log viewer path agreement** (same task id → same sanitized filename → same resolved directory).

If the fix commit is present but the issue persists, prioritize:
- actionable diagnostics in the “log not found” response (expected path + which env var values were used), and
- validating the log writer (agent execution) is actually writing to the configured `RALPH_LOG_DIR` (or default path).

## Repo Next Steps (checklist)
- [ ] Identify whether the current branch includes the prior “stabilize log directory and improve stream error handling” work (see `.devagent/workspace/tasks/active/2026-01-17_fix-comments-visibility-and-realtime-log-view/2026-01-17_devagent-201a-improvements.md` for commit hints).
- [ ] In the environment where this fails, capture:
  - [ ] the exact error string shown in the UI
  - [ ] whether the task is considered “active” by the UI at the time
  - [ ] the resolved log directory configuration (`RALPH_LOG_DIR`, `REPO_ROOT`) and process working directory
- [ ] Verify whether a log file for the task is ever created while the agent runs (if none is created, fix the writer, not the viewer).
- [ ] If a log file exists but the viewer still claims it does not, validate task ID sanitization and filename agreement between writer and viewer.
- [ ] If file creation timing is the culprit, add a short retry/backoff window for active tasks before surfacing “log not found” (while keeping the inactive case clean and quiet).

## Risks & Open Questions
- **[NEEDS CLARIFICATION] What exactly counts as “active”?** (UI state, Beads status, agent runtime state)
- **[NEEDS CLARIFICATION] Where are logs supposed to be written in your environment?** (default `logs/ralph`, or a configured directory)
- **Potential regression risk:** The fix may exist but could have been altered by later changes (streaming protocol, permissions, packaging, or deployment changes).
- **Portability risk:** Streaming implementations that rely on platform-specific tooling (e.g., `tail -F`) can behave differently across environments.
