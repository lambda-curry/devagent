# Loop Completion Hooks — Implementation Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-30
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/active/2026-01-30_loop-completion-hooks/`
- Stakeholders: Jake Ruesink (Owner, DRI)
- Notes: Implementation is split between clawd (`delegate-agent.ts`) and DevAgent repo (Ralph plugin). Plan covers both; Phase 1 is delegate-agent only; Phase 2 is Ralph-side rich payload.

---

## PART 1: PRODUCT CONTEXT

### Summary

Ralph/agent loops run via `delegate-agent.ts` (clawd) or `ralph.sh` (DevAgent) with no push-based notification when they finish. Upstream systems (e.g. Clawdbot) rely on polling. This plan adds configurable completion hooks: when a loop or delegate run exits, a callback (shell script first, webhook/Clawdbot later) is invoked with structured JSON so callers can react reliably without polling.

### Context & Problem

- **Current state:** delegate-agent.ts spawns a delegate script (cursor/jules/claude) and on child exit only propagates exit code. Ralph loop (ralph.sh → ralph.ts) runs until done/blocked/failed and exits with no structured outcome.
- **User pain:** No reliable way to get notified when a run completes; polling/heartbeats are blunt and expensive.
- **Business trigger:** Need push-based notification for Clawdbot and other orchestrators.

### Objectives & Success Metrics

- **Objective:** When a delegate run or Ralph loop finishes (success, failure, or blocked), a configurable hook is invoked with structured data about the outcome.
- **Success:** (1) `--on-complete ./hook.sh` invokes the script with JSON on stdin; (2) payload shape is documented and testable; (3) hook execution is bounded by a timeout so a bad hook does not block indefinitely.

### Users & Insights

- **Primary users:** Operators and scripts (e.g. Clawdbot) that start Ralph loops or delegate runs and need to react on completion.
- **Insight:** Shell script hook is the primary mechanism; webhook and Clawdbot wake are extensions (research and task hub).

### Solution Principles

- **JSON on stdin:** Hook script receives one JSON object on stdin; no temp files required.
- **Timeout:** Hook runs with a cap (e.g. 30s); on timeout or hook failure, parent logs and exits with the run’s exit code (hook exit does not override).
- **Two layers:** Delegate run (delegate-agent.ts) can emit a minimal payload; Ralph loop (ralph.ts) can emit a rich payload (iterations, exitReason, summary). Both support the same hook contract.

### Scope Definition

- **In Scope:** `--on-complete <script>` in delegate-agent.ts (clawd) with minimal payload; optional Ralph-side `--on-complete` with rich payload; hook contract (stdin, timeout); documentation in delegate skill and Ralph plugin.
- **Out of Scope / Future:** `--webhook-url`, `--notify-clawdbot`; PR URL / commit SHA in payload; fire-and-forget mode (research recommends sync with timeout).

### Functional Narrative

#### Flow: Delegate run completes

- **Trigger:** User runs `bun run scripts/delegate-agent.ts --task "..." --on-complete ./my-hook.sh`.
- **Experience:** Delegate runs; on child exit, delegate-agent builds payload `{ task, repo, status, exitCode, durationSec, agent }`, spawns `./my-hook.sh` with JSON on stdin, waits up to 30s, then exits with the run’s exit code.
- **Acceptance criteria:** Hook receives valid JSON on stdin; parent exit code equals run exit code; timeout prevents indefinite block.

#### Flow: Ralph loop completes (Phase 2)

- **Trigger:** User runs `ralph.sh --run <loop.json> --on-complete ./my-hook.sh` (or `RALPH_ON_COMPLETE=./my-hook.sh`).
- **Experience:** Ralph loop runs; on exit, ralph.ts builds rich payload (epicId, iterations, status, exitReason, durationSec, branch, summary), invokes hook with JSON on stdin, then exits.
- **Acceptance criteria:** Hook receives rich payload when run is a Ralph loop; same timeout and exit-code semantics.

### Technical Notes & Dependencies

- **clawd repo:** delegate-agent.ts, agents/lib.ts, delegate scripts (cursor-delegate.ts etc.). No change to Beads or Ralph plugin required for Phase 1.
- **DevAgent repo:** Ralph plugin ralph.ts (executeLoop return type, CLI hook invocation), ralph.sh (pass-through of --on-complete or env). Phase 2.
- **Payload:** Minimal payload from delegate-agent; rich payload from Ralph (see research). Same hook contract (stdin JSON).

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions

- **Scope focus:** Phase 1 — delegate-agent.ts (clawd) with `--on-complete` and minimal payload. Phase 2 — Ralph loop completion hook with rich payload (ralph.ts/ralph.sh).
- **Key assumptions:** Hook is synchronous with timeout; hook exit code does not override process exit code; shell script reads JSON from stdin once.
- **Out of scope:** Webhook URL, Clawdbot wake, fire-and-forget mode (documented as future).

### Implementation Tasks

#### Task 1: Add --on-complete and minimal payload to delegate-agent.ts (clawd)

- **Objective:** Accept `--on-complete <path>`, capture start time, on child exit build minimal JSON payload and invoke the script with JSON on stdin with a 30s timeout; then exit with child’s exit code.
- **Impacted Modules/Files:** `~/clawd/scripts/delegate-agent.ts`; optionally `~/clawd/scripts/agents/lib.ts` (if we add a small `invokeCompletionHook(payload, scriptPath, timeoutMs)` helper).
- **References:** Task hub AGENTS.md; research `2026-01-30_completion-hooks-and-callbacks-research.md`; research `2026-01-30_delegate-agent-completion-hook-context.md` (insertion point: `child.on("close", ...)` before `process.exit`; payload build; optional lib.ts helper).
- **Dependencies:** None.
- **Acceptance Criteria:**
  - `--on-complete ./script` runs the script after the delegate exits; script receives one JSON object on stdin.
  - Payload includes at least: `task`, `repo`, `status` (completed | failed), `exitCode`, `durationSec`, `agent`.
  - If hook path is missing or not executable, log warning and exit with run’s exit code (no crash).
  - Hook execution is limited to 30s; on timeout, log and exit with run’s exit code.
  - Process exit code is always the delegate run’s exit code, not the hook’s.
- **Testing Criteria:** Run delegate-agent with `--on-complete 'cat'` (or a script that writes stdin to a file); assert payload shape and that exit code matches delegate run.
- **Validation Plan:** Manual run with a simple hook script; optional unit test for payload shape and timeout behavior.

#### Task 2: Document hook contract and --on-complete in delegate skill

- **Objective:** Document `--on-complete` usage, payload schema, timeout, and exit-code semantics in the delegate-agent skill (and any README in clawd).
- **Impacted Modules/Files:** `~/clawd/skills/ralph-loop-delegation/SKILL.md`; `~/clawd/skills/delegate-to-agent/SKILL.md` if present; README or usage in clawd if applicable.
- **References:** Task 1 payload shape; research recommendation.
- **Dependencies:** Task 1.
- **Acceptance Criteria:** Skill/README describes `--on-complete <script>`, states that script receives JSON on stdin, 30s timeout, and that process exit code is the run’s exit code.
- **Validation Plan:** Review docs for consistency with implementation.

#### Task 3 (Phase 2): Ralph loop completion hook — executeLoop result and CLI invocation

- **Objective:** Have `executeLoop` return a result object `{ status, epicId, iterations, maxIterations, exitReason, durationSec, branch?, logTail? }`. In ralph.ts CLI branch, if `--on-complete` or `RALPH_ON_COMPLETE` is set, build full payload, invoke script with JSON on stdin (with timeout), then process.exit.
- **Impacted Modules/Files:** `.devagent/plugins/ralph/tools/ralph.ts` (executeLoop return type, CLI); `.devagent/plugins/ralph/tools/ralph.sh` (pass `--on-complete` or set/forward env).
- **References:** Research (rich payload, two boundaries); task hub.
- **Dependencies:** Task 1 (contract established).
- **Acceptance Criteria:** Ralph loop exit triggers hook when configured; payload includes epicId, iterations, status (completed | blocked | failed), exitReason, durationSec; same timeout and exit-code semantics as delegate-agent.
- **Testing Criteria:** Run ralph with `--on-complete 'cat'` and a short loop; assert payload shape.
- **Validation Plan:** Manual run; optional test.

#### Task 4 (Phase 2): Document Ralph completion hook

- **Objective:** Document Ralph `--on-complete` and `RALPH_ON_COMPLETE` in Ralph plugin README and ralph-loop-delegation skill.
- **Impacted Modules/Files:** `.devagent/plugins/ralph/README.md`; `~/clawd/skills/ralph-loop-delegation/SKILL.md`.
- **Dependencies:** Task 3.
- **Acceptance Criteria:** Docs describe Ralph completion hook, payload fields, and how to use from ralph.sh and Clawdbot.
- **Validation Plan:** Review for consistency.

### Implementation Guidance

- **From research (`2026-01-30_completion-hooks-and-callbacks-research.md`):**
  - Hook script receives JSON on stdin; parent spawns with stdin set to JSON string.
  - Use a 30s timeout; on timeout or hook non-zero exit, log and exit with original run exit code.
  - Minimal payload (delegate-agent): task, repo, status, exitCode, durationSec, agent. Rich payload (Ralph): add epicId, iterations, exitReason, branch, logTail.
- **Summary clarification (2026-01-30 conversation with Jake):**
  - The `summary` field should be replaced with `logTail` — the last ~3KB of the log file.
  - Rationale: Ralph currently only writes to log files; it doesn't track structured status. Rather than having Ralph compute a summary, the hook includes the log tail as raw context.
  - The receiving agent (e.g. a cheap model like GPT-4o-mini or Haiku) extracts/formats the summary from the log tail. This keeps Ralph's hook logic simple and pushes summarization to the consumer.
  - Implementation: `const logTail = fs.readFileSync(logPath, 'utf8').slice(-3000);` and include `logTail` in the payload.
- **From research (`2026-01-30_delegate-agent-completion-hook-context.md`):**
  - **Insertion point:** In `child.on("close", (code) => { ... })` in delegate-agent.ts, before `process.exit(code ?? 0)`. Add `startTime = Date.now()` before spawn; compute `durationSec` in close handler.
  - **Payload build:** `{ task, repo, status: code === 0 ? 'completed' : 'failed', exitCode: code ?? -1, durationSec, agent: selectedAgent }`; optionally add `branch: getGitBranch(repoPath)` from lib.ts.
  - **Invocation:** Spawn hook with `stdio: ['pipe', 'inherit', 'inherit']`, write payload to `child.stdin`, then `child.stdin.end()`. Wait for close with 30s timeout; on timeout use SIGTERM and log; never let hook exit code override process exit code.
  - **Optional helper:** Add `invokeCompletionHook(payload, scriptPath, timeoutMs)` in `~/clawd/scripts/agents/lib.ts` to centralize spawn + stdin + timeout logic.
- **From task hub AGENTS.md:** Shell script hook is primary mechanism; webhook and Clawdbot are extensions. No delivery dates in plan.
- **General:** Prefer existing patterns (parseArgs in lib.ts, spawn with stdio) and avoid exposing secrets in payload.

---

## Risks & Open Questions

| Item | Type | Owner | Mitigation / Next Step | Due |
|------|------|--------|------------------------|-----|
| Hook blocks or hangs | Risk | Implementer | 30s timeout; kill hook on timeout; log and exit with run code | — |
| Rich payload only in Ralph | Clarification | Jake | Phase 1 = delegate-agent minimal; Phase 2 = Ralph rich payload | — |
| Sync vs fire-and-forget | Open question | Jake | Plan assumes sync with timeout per research | — |
| Additional payload fields (PR URL, commit SHA) | Open question | Jake | Omit for MVP; add when needed | — |

---

## Progress Tracking

Refer to the AGENTS.md file in the task directory for instructions on tracking and reporting progress during implementation.

### Change Log

- **2026-01-30:** Research workflow run: completion hook patterns in CLI tools and delegate-agent.ts integration context. Added research artifact `2026-01-30_delegate-agent-completion-hook-context.md`. Plan updated: Task 1 references new research; Implementation Guidance expanded with insertion point, payload build, invocation details, and optional `invokeCompletionHook` in lib.ts; Appendices reference all three research packets.

---

## Appendices & References

- **Research:** `.devagent/workspace/tasks/active/2026-01-30_loop-completion-hooks/research/2026-01-30_completion-hooks-and-callbacks-research.md`
- **Research (CLI patterns):** `.devagent/workspace/tasks/active/2026-01-30_loop-completion-hooks/research/2026-01-30_cli-completion-hook-patterns.md`
- **Research (delegate-agent context):** `.devagent/workspace/tasks/active/2026-01-30_loop-completion-hooks/research/2026-01-30_delegate-agent-completion-hook-context.md`
- **Task hub:** `.devagent/workspace/tasks/active/2026-01-30_loop-completion-hooks/AGENTS.md`
- **Agent documentation:** `AGENTS.md` (root), `.devagent/core/AGENTS.md`
- **Current implementation:** `~/clawd/scripts/delegate-agent.ts`, `~/clawd/scripts/agents/cursor-delegate.ts`, `~/clawd/scripts/agents/lib.ts`; `.devagent/plugins/ralph/tools/ralph.ts`, `.devagent/plugins/ralph/tools/ralph.sh`
