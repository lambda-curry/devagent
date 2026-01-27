# Clarified Requirement Packet — Handling Sub-Issues in the Ralph Loop

- Requestor: Jake Ruesink (Engineering)
- Decision Maker: Jake Ruesink (Engineering)
- Date: 2026-01-18
- Mode: Task Clarification
- Status: Complete
- Related Task Hub: `.devagent/workspace/tasks/completed/2026-01-18_handling-sub-issues-in-ralph-loop/`
- Notes: This is a Ralph-focused workflow/prompt refinement with a bias toward Constitution C6 simplicity.

## Task Overview

### Context
- **Task name/slug:** `2026-01-18_handling-sub-issues-in-ralph-loop`
- **What we’re trying to achieve:** Keep prompts for sub-issues **simple**, while ensuring agents use sub-issues for **context** and for **work tracking**.
- **Prior work:**
  - Research: `.devagent/workspace/tasks/completed/2026-01-18_handling-sub-issues-in-ralph-loop/research/2026-01-18_sub-issues-in-ralph-loop-research.md`
  - Brainstorm: `.devagent/workspace/tasks/completed/2026-01-18_handling-sub-issues-in-ralph-loop/brainstorms/2026-01-18_simple-sub-issue-prompting.md`
- **Key constraint:** Avoid “loop per sub-issue” by default; keep overhead minimal.
- **Note on constitution alignment:** We’re intentionally operating Ralph without human-in-the-loop confirmation; treat this as an explicit exception vs C3 defaults, while still applying C6 (“Simplicity Over Rigidity”).

### Clarification Sessions
- Session 1: 2026-01-18 — Participants: Jake Ruesink — Topics: decision maker, epic/parent behavior, tracking destination, definition of “simple prompt”.

---

## Clarified Requirements

### Scope & End Goal
**What needs to be done?**
- Define the minimal prompt contract for tasks that have sub-issues/subtasks (Ralph-facing).
- Define the default runtime behavior (especially when invoked on a parent/epic).
- Define the minimal tracking/rollup mechanism that doesn’t add ceremony.

**What’s the end goal state?**
- When a work item has child issues, the agent:
  - sees a bounded, skimmable index of sub-issues,
  - treats that list primarily as **context** (no automatic child selection when invoked on a parent/epic),
  - knows the stop condition on blockers/failure,
  - when a sub-issue is completed, marks it **Closed** and leaves a completion comment for posterity/traceability.

**In-scope (must-have):**
- P0 “deterministic + skimmable” sub-issue prompt bundle (from brainstorm):
  - bounded sub-issue index
  - stop-on-blocker semantics
  - 3-line guidance block (“sub-issues are context, not mandate”)
- Completion behavior for sub-issues:
  - Mark the sub-issue **Closed** when done (use Beads-aligned terminology; say “marked as closed”)
  - Leave a completion comment on the sub-issue summarizing the work + struggles encountered (follow existing comment patterns; keep it simple per C6)

**Out-of-scope (won’t-have):**
- Full “loop per sub-issue” as the default behavior.
- Large, prescriptive mini-workflows per sub-issue.

**Nice-to-have (could be deferred):**
- P1: one-line progress hook (rollup tracking).
- P2: plan/subtask vocabulary bridge when plan-driven.

---

### Technical Constraints & Requirements
- Keep prompt additions minimal and stable (C6).
- Should avoid prompt bloat for large epics (bounded list + “X more…”).
- Terminology must match Beads expectations:
  - Use Beads status tokens: `open`, `in_progress`, `blocked`, `closed`
  - Do not use: `todo`, `done`, `ready` (as a settable status)
  - In prose: say “mark as closed”; in commands: `bd update <id> --status closed`

---

### Dependencies & Blockers
- None.

---

### Implementation Approach
- When invoked on a parent/epic (has children): inject a bounded child list for context; do not auto-select a child.
- Selection when invoked on parent/epic:
  - Prefer plan ordering (“next open leaf in plan order”) when a plan/task ordering exists.
  - If no plan ordering exists (or it’s ambiguous), the agent may choose the next sub-issue without providing a justification (keep prompting minimal per C6).
- Keep prompt conventions small and stable (C6), and explicitly prompt for a completion comment on the sub-issue when done.
- Optional: plan/subtask vocabulary bridge when plan-driven.

---

### Acceptance Criteria & Verification
**What does “done” look like?**
- [ ] We can describe Ralph’s behavior in 3–6 bullet points with no ambiguity.
- [ ] Prompt includes P0 elements in a compact, repeatable format.
- [ ] For large child sets, prompt stays bounded (top N + remainder count).
- [ ] Failure/blocker behavior is deterministic (“blocked means stop”).
- [ ] On sub-issue completion, Ralph marks the sub-issue **Closed** and leaves a completion comment containing a short summary and “struggles” for traceability.
- [ ] Terminology is Beads-aligned: prompts and comments say “Closed/mark as closed” (not “Done”) if that’s the canonical state.
- [ ] Completion comment has a suggested minimal structure (keep it short per C6):
  - Summary
  - Struggles (helpful input for revise reports / improvements)
  - Verification

---

## Assumptions Log

| Assumption | Owner | Validation Required | Validation Method | Due Date | Status |
| --- | --- | --- | --- | --- | --- |
| Ralph runs without human confirmation for this flow | Jake Ruesink | No | Explicit constraint in task | 2026-01-18 | Validated |
| Sub-issues should be treated as context + sequencing guidance (not separate loop runs by default) | Jake Ruesink | No | Decision maker confirmed | 2026-01-18 | Validated |
| When invoked on a parent/epic, Ralph should not auto-select a child sub-issue | Jake Ruesink | No | Decision maker confirmed | 2026-01-18 | Validated |
| We do not need a separate “progress hook,” but we do need a completion comment on the sub-issue | Jake Ruesink | No | Decision maker confirmed | 2026-01-18 | Validated |
| Parent/epic invocation should use plan ordering when available to pick “next” work | Jake Ruesink | No | Decision maker confirmed | 2026-01-18 | Validated |
| “Closed” is the correct Beads status name to use (vs “Done”) | Jake Ruesink | Yes | Audit Beads status vocabulary and existing usage | 2026-01-18 | Pending |
| Beads status tokens are `open`, `in_progress`, `blocked`, `closed` and we should not use `todo/done/ready` | Jake Ruesink | No | Confirmed via repo audit (`.devagent/plugins/ralph/**`) | 2026-01-18 | Validated |
| If no plan ordering is present, agent may pick next sub-issue without explaining why | Jake Ruesink | No | Decision maker confirmed | 2026-01-18 | Validated |

---

## Gaps Requiring Research
### For #ResearchAgent
- **Research Question 1:** What are the canonical Beads status values and the correct language we should use in prompts/comments? (“Closed” vs “Done”, etc.)
  - Context: We want Ralph to “mark sub-issues closed” and describe it with Beads-aligned terminology.
  - Evidence needed: Beads docs / existing repo usage indicating canonical status strings and transitions.
  - Priority: High
  - Blocks: Finalizing exact completion semantics + copy in prompt/comment.
  - Status: ✅ Answered (see `.devagent/workspace/tasks/completed/2026-01-18_handling-sub-issues-in-ralph-loop/research/2026-01-18_beads-status-terminology-alignment.md`)

---

## Clarification Session Log

### Session 1: 2026-01-18
**Participants:** Jake Ruesink

**Questions Asked:**
1. Decision maker for this behavior? → Jake (A) (Jake Ruesink)
2. Desired behavior when invoked on a parent/epic? → Inject child list for context, no auto-select (C) (Jake Ruesink)
3. Where should “one-line progress” (if any) be recorded? → No separate hook; prompt to leave completion comment on sub-issue (D + add completion comment) (Jake Ruesink)
4. How does Ralph determine “current sub-issue” when invoked on a parent/epic? → Prefer plan ordering; agent can choose if needed (Jake Ruesink)
5. What does “mark completed” mean? → Set status to **Closed**; audit terminology alignment (Jake Ruesink)
6. Completion comment format? → Follow existing comment patterns; keep it simple per C6. Suggested format: Summary / Struggles / Verification (Jake Ruesink)
7. Fallback when no plan ordering exists? → Agent can pick; no reason required (Jake Ruesink)
8. Constraint on “agent can choose”? → Keep prompting simple; no need to explain rationale (Jake Ruesink)

**Unresolved Items:**
- None.

---

## Next Steps

### Spec Readiness Assessment
**Status:** ☑️ Ready for Spec | ⬜ Research Needed | ⬜ More Clarification Needed

**Rationale:**
We have core behavior clarified and Beads terminology aligned (use `open/in_progress/blocked/closed` and say “mark as closed”). This packet should now be sufficient input for `devagent create-plan`.

