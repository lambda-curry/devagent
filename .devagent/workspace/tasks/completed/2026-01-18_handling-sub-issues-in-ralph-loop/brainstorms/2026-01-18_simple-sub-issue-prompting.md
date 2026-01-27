# Brainstorm: Simple Sub-Issue Prompting for Ralph

**Date:** 2026-01-18  
**Owner:** Jake Ruesink  
**Mode:** exploratory (Ralph-focused)  
**Task Hub:** `.devagent/workspace/tasks/completed/2026-01-18_handling-sub-issues-in-ralph-loop/`  

## Progress
- Problem / Context ✅
- Ideas ✅
- Clustering ✅
- Evaluation ✅
- Prioritization ⏳
- Packaging / Handoff ⬜ not started

## Problem Statement
Keep prompts for sub-issues **simple**, while ensuring agents that have sub-issues:
1) know how to use sub-issues for **context**, and  
2) know how to use sub-issues to **track work** (progress + rollup).

## Session Inputs (from user)
- **Primary scope:** Ralph loop behavior and prompt content.
- **Secondary scope:** light audit touchpoint for `create-plan` implications (keep Constitution C6 in mind).
- **Mode selection:** exploratory.
- **Constraints:**
  - Minimize overhead; avoid “loop per sub-issue” unless clearly justified.
  - Ralph is **not** human-in-the-loop (note: this creates tension with Constitution C3 defaults; treat as an explicit exception for Ralph execution).
- **Relevant constitution clause:** C6 “Simplicity Over Rigidity” (`.devagent/workspace/memory/constitution.md`).

## Context Snapshot (inputs we’re building on)
- Research recap: “Single loop + leaf sequencing” default; escalate to per-sub-issue loop only when justified.
  - Source: `.devagent/workspace/tasks/completed/2026-01-18_handling-sub-issues-in-ralph-loop/research/2026-01-18_sub-issues-in-ralph-loop-research.md`

## Idea List (divergent)
_(5–10 ideas per batch; append-only; de-dupe during clustering)_

### Batch 1 (2026-01-18)
1. **Sub-issue “cheat sheet” block (3 lines max):** Add a tiny, consistent section in the prompt that defines what sub-issues are, how to use them for context, and the 1-step next action (e.g., “Pick the next sub-issue and proceed.”).
2. **Single “Current focus” pointer:** If there are sub-issues, the prompt must specify *one* current sub-issue (by id/title) to work on now, and treat the rest as backlog context. Prevents “thrash.”
3. **Compact sub-issue list format:** Provide a table-like list of sub-issues with only `{id, title, status, priority, parent_id}`. No descriptions unless explicitly requested. Keep it skimmable.
4. **Rollup micro-protocol:** Define a minimal rollup state machine at the parent level: `Next`, `In progress`, `Blocked`, `Done` with a single sentence per transition. Avoid per-sub-issue “mini-workflows.”
5. **Progress tracking hook:** Require one lightweight progress action at the end of each sub-issue: append a single log line (what changed, result, next). (Where it lands can be decided later—Beads comment vs task hub.)
6. **“Sub-issues are context, not a mandate” phrasing:** Explicitly tell the agent: sub-issues are guidance; if blocked, escalate or re-order, but record why. Keeps flow natural (C6).
7. **Auto-summarize siblings to reduce prompt bloat:** Include only the top N relevant sibling sub-issues (e.g., 5) and a count of remaining; provide a command for fetching more if needed.
8. **Plan/sub-issue alignment hint:** If the agent is in a plan-driven execution mode, map “sub-issues” to “subtasks” vocabulary so the agent knows they’re conceptually the same unit: sequential, validate each, roll up.
9. **Failure handling guidance (one paragraph):** “If a sub-issue fails, mark it Blocked with the blocker and stop; don’t silently skip.” Keeps the system resumable without heavy ceremony.

## Pruned / Merged Prompt Patterns (candidate set)
1. **Minimal Sub-Issue Block (Prompt Skeleton):** Always include the same compact section:
   - 3-line “what sub-issues are + how to use them + what to do next” (from #1)
   - “sub-issues are context, not mandate” (from #6; cite C6)
2. **Current Focus + Backlog Context:** Always designate exactly one “Current focus” sub-issue; treat the rest as backlog context (from #2).
3. **Compact Sub-Issue Index (bounded):** List sub-issues as a compact table of `{id, title, status, priority, parent_id}`, show top N + “X more…” (from #3 + #7).
4. **Rollup State + Single Progress Hook:** Use a tiny rollup model (Next / In progress / Blocked / Done) and require a single log line after each sub-issue (from #4 + #5).
5. **Failure = Blocked + Stop:** A single paragraph that defines the failure semantics (from #9) to preserve resumability and avoid thrash.
6. **Vocabulary bridge (optional):** If the run is plan-driven, state “sub-issues ≈ subtasks” and “sequential + validate + roll up” (from #8).

## Clusters
### Cluster A — Prompt structure (keep it simple by default)
- Minimal Sub-Issue Block (Prompt Skeleton)
- Compact Sub-Issue Index (bounded)

### Cluster B — Execution control (avoid thrash)
- Current Focus + Backlog Context
- Failure = Blocked + Stop

### Cluster C — Tracking & rollup (progress without ceremony)
- Rollup State + Single Progress Hook

### Cluster D — Cross-workflow alignment (optional glue)
- Vocabulary bridge (plan subtasks ↔ sub-issues)

## Evaluation
**Scoring scale:** 1 (low) → 5 (high)

**Criteria:**
- **Simplicity**: How small/low-ceremony is this in the prompt?
- **Context value**: How well does it help the agent use sub-issues as context?
- **Tracking value**: How well does it help track/roll up work across sub-issues?
- **Risk / complexity**: Implementation + operational risk (higher = riskier).

| Cluster | Simplicity | Context value | Tracking value | Risk / complexity | Notes |
|---|---:|---:|---:|---:|---|
| **A — Prompt structure** | 4 | 4 | 2 | 2 | A consistent “sub-issue block” + bounded index is easy to skim and keeps prompts predictable; tracking impact is indirect. |
| **B — Execution control** | 5 | 3 | 3 | 2 | “Current focus” + “blocked means stop” prevents thrash and keeps runs deterministic; low overhead and low risk. |
| **C — Tracking & rollup** | 3 | 2 | 5 | 3 | Provides the most tracking value, but requires deciding *where* the single log line lives and how rollup is represented. |
| **D — Cross-workflow alignment** | 4 | 3 | 3 | 2 | Helpful when plan-driven; keep optional so it doesn’t bloat Ralph prompts when no plan/subtasks exist. |

### Evaluation Notes (Ralph constraints + constitution)
- **Ralph not human-in-the-loop:** Favor patterns that reduce decisions and runtime ambiguity (Cluster B) while keeping prompt overhead minimal (Cluster A).
- **C6 simplicity:** Prefer a small number of stable conventions (A + B) and avoid introducing “mini-workflows” per sub-issue.
- **Key tension:** Cluster C has the most value for tracking, but it’s the one most likely to accrete ceremony unless we keep it to “one log line, one place.”

## Prioritization (tight-scope recommendation)
### P0 (MVP): “Deterministic + skimmable” sub-issue prompt bundle
**Goal:** Keep prompts minimal while ensuring sub-issues are used as context and execution doesn’t thrash.

Include:
1. **Current Focus + Backlog Context** (Cluster B) — always identify exactly one sub-issue to work on “now.”
2. **Failure = Blocked + Stop** (Cluster B) — on failure/blocker, stop and record the blocker (resumable).
3. **Compact Sub-Issue Index (bounded)** (Cluster A) — show top N items with `{id, title, status, priority, parent_id}` + “X more…”
4. **Minimal Sub-Issue Block (Prompt Skeleton)** (Cluster A) — 3-line cheat sheet + “context not mandate” phrasing (cite C6).

**Why P0:** Highest simplicity and lowest risk, while directly addressing your goal (simple prompts, clear “how to use them,” deterministic behavior).

### P1 (Optional, but high leverage): “One-line progress hook”
Add:
- **Rollup State + Single Progress Hook** (Cluster C), constrained to:
  - One log line per completed/blocked sub-issue.
  - One canonical destination (TBD: Beads comment vs task hub progress log).

**Why P1:** Strong tracking value without turning into a workflow-within-a-workflow—*if* we keep it truly one line and one destination.

### P2 (Optional, only when plan-driven): “Vocabulary bridge”
Add:
- **Vocabulary bridge (sub-issues ≈ subtasks)** (Cluster D) only when a plan/subtasks are present in context.

**Why P2:** Helps agents generalize, but should be conditional to avoid bloating everyday Ralph prompts.

## Prioritized Candidates (top 3)
1. **Candidate 1 (P0-only):** Skimmable index + current focus + stop-on-blocker + 3-line guidance.
2. **Candidate 2 (P0 + P1):** Candidate 1 + one-line progress hook (minimal rollup tracking).
3. **Candidate 3 (P0 + P1 + P2 conditional):** Candidate 2 + plan/subtask vocabulary bridge when applicable.

## Next Steps (handoff)
- If you want pure prompt/output changes: run `devagent create-plan` using this packet + the task research doc as inputs.
- If you want to adjust Ralph’s behavior when invoked on epics/parents: run `devagent clarify-task` (selection strategy + rollup destination are the two key decisions).

## Parking Lot
- Possible `create-plan` audit: ensure plan subtasks guidance stays consistent with “simple sub-issue prompting,” and doesn’t accidentally push loop-per-subtask by default.

