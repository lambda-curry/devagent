# Clarified Requirement Packet — Add timeout to Ralph task comment retrieval

- Requestor: Jake Ruesink (Owner)
- Decision Maker: Jake Ruesink (Owner)
- Date: 2026-01-18
- Mode: Task Clarification
- Status: Complete
- Related Task Hub: `.devagent/workspace/tasks/completed/2026-01-18_add-timeout-to-ralph-task-comments/`
- Notes: This packet is being built interactively; unresolved items are tracked in the Question Tracker.

## Task Overview

### Context
- **Task name/slug:** `2026-01-18_add-timeout-to-ralph-task-comments`
- **Trigger:** Ralph’s `getTaskComments()` runs `bd comments <id> --json` via `Bun.spawnSync` with no timeout; if the subprocess hangs, the Ralph loop can hang indefinitely.
- **Current environment notes:**
  - Beads is currently running in **daemon mode** for this workspace (`bd info --json` shows `mode: "daemon"`, `daemon_status: "healthy"`).
  - On this machine, `bd comments <id> --json` is typically fast (~70–90ms for sampled tasks). Decision-maker prefers not to add timeout complexity preemptively.
- **Stakeholders:** Jake Ruesink (requestor/decision maker)
- **Prior work:**
  - Research: `.devagent/workspace/tasks/completed/2026-01-18_add-timeout-to-ralph-task-comments/research/2026-01-18_task-comments-timeout-research.md`
  - Call site: `.devagent/plugins/ralph/tools/ralph.ts` → `getTaskComments(taskId)`

### Clarification Sessions
- Session 1: 2026-01-18 — Jake Ruesink + Agent (initial clarification + decision capture)

---

## Clarified Requirements

### Scope & End Goal

**What needs to be done?**
- Decision made: **do not add a timeout** right now (accept hang risk rather than add “what-if” complexity). Current call remains `Bun.spawnSync` with no timeout.

**What’s the end state?**
- Accept the (rare) risk that comment retrieval could block the Ralph loop, relying on daemon health and manual intervention when Beads/CLI is wedged.

**In-scope (must-have):**
- None (task closed as “not needed” given current daemon mode + fast `bd comments` locally).

**Out-of-scope (explicitly excluded):**
- Changing `getTaskFailureCount()` behavior (you indicated it’s going to be based on something else).
- Any UI changes in `apps/ralph-monitoring/` as part of this task.

---

### Technical Constraints & Requirements

**Runtime constraints:**
- Ralph runs under Bun; implementation should use Bun-native child process options (no node APIs in `ralph.ts`).

**Beads constraints:**
- Beads is daemon-backed in this workspace, but we should assume `bd` calls can still stall in pathological cases (e.g., DB lock, wedged daemon, stuck process).

**Quality bars:**
- Must not introduce a new infinite wait/hang.
- Logging should be specific and actionable.

---

### Dependencies & Blockers

**Dependencies:**
- Beads CLI `bd` available in PATH and configured for this repo.
- Beads daemon health (when in daemon mode).

**Blockers:** none known

---

### Implementation Approach

**Strategy (draft):**
- Leave the call as-is; no timeout added.

---

### Acceptance Criteria & Verification

**Acceptance criteria:**
- No code changes required for this task (decision: no timeout).

**Verification approach:**
- Manual: confirm Beads is running in daemon mode and `bd comments --json` remains fast for representative tasks (done during audit).

---

## Question Tracker

1. Timeout duration for `bd comments` in Ralph loop — ❓ unknown (requestor unsure whether needed)
2. Timeout termination behavior (signal) — ❓ unknown (requestor unsure of impact)
3. Should timeout be configurable (env/config) vs constant — ✅ answered: constant in code
4. Add a timeout at all (safety net) — ✅ answered: no timeout (accept hang risk)
5. If we ever add a timeout, termination behavior (signal) — ⏭️ deferred (requestor: “you pick safest”)
6. Expected behavior when timeout occurs (return `[]` + warn vs throw/abort) — 🚫 not applicable (no timeout planned)

---

## Assumptions Log

| Assumption | Owner | Validation Required | Validation Method | Due Date | Status |
| --- | --- | --- | --- | --- | --- |
| Beads daemon mode reduces typical `bd comments` latency, but doesn’t eliminate hang risk | Jake | No | N/A | 2026-01-18 | Validated |
| Returning `[]` on timeout is acceptable for now (no crash/hang), since failure counting is changing | Jake | 🚫 not applicable | No timeout planned | 2026-01-18 | Closed |

---

## Gaps Requiring Research

### For #ResearchAgent

**Research Question 1:** Is there any Beads-specific recommendation for consumer-side timeouts around `bd` CLI invocations (daemon vs non-daemon)?
- Context: We want to align with Beads operator guidance.
- Evidence needed: Beads docs section or maintainer guidance.
- Priority: Low
- Blocks: No (we can proceed with Bun timeout regardless).

---

## Clarification Session Log

### Session 1: 2026-01-18
**Participants:** Jake Ruesink (Owner)

**Questions Asked:**
1. Timeout duration for `bd comments` in Ralph loop? → ❓ unknown (“I don't know is this needed?”) (Jake)
2. Timeout termination behavior (signal)? → ❓ unknown (“beyond my knowledge / not sure what this affects”) (Jake)
3. Should timeout be configurable (env/config) vs constant? → Constant in code (Jake)
4. Add a timeout at all (safety net)? → No (Jake)
5. If timeout existed, pick termination behavior? → “You pick safest” (Jake)

---

## Next Steps

### Spec Readiness Assessment
**Status:** ⬜ Ready for Spec | ⬜ Research Needed | ⬜ More Clarification Needed

**Current read:** ⬜ Ready for Spec (n/a) — task closed as “not needed”.

