# Research: Handling Sub-Issues in the Ralph Loop

**Date:** 2026-01-18  
**Task Hub:** `.devagent/workspace/tasks/active/2026-01-18_handling-sub-issues-in-ralph-loop/`  

## Classification & Assumptions
- **Classification:** Implementation design / workflow design question (agent execution + task hierarchy).
- **Problem statement (as provided):** “our new task” **[NEEDS CLARIFICATION]**
- **Assumed intended question (from task hub Summary):** How should Ralph handle tasks with sub-issues/subtasks: treat them as additional context and execute sequentially with rollup tracking vs. run the full Ralph loop per sub-issue (likely overkill).

## Research Plan (what was validated)
- Locate existing DevAgent guidance on **subtasks** and how agents should execute/validate them.
- Find any existing Ralph-specific semantics for **epic/task/subtask** so the loop aligns with the monitoring/Beads model.
- Identify any existing proposals for **injecting related tasks/subtasks into agent context** (vs forcing separate runs).
- Synthesize a recommended default + escalation criteria.

## Sources (internal)
- `.devagent/workspace/tasks/completed/2025-12-27_implement-plan-workflow/research/2025-12-27_implement-plan-workflow-research.md` (freshness: 2025-12-27) — RQ7 “Subtask Handling”: “execute sequentially within parent task; validate each subtask; failures pause + log partial progress.”
- `.devagent/workspace/tasks/active/2026-01-17_ralph-revisions-v4/plan/2026-01-17_ralph-revisions-v4-plan.md` (freshness: 2026-01-17) — Defines **Epic** as issue with `children.length > 0`; **Task** as leaf issue (`children.length === 0`) including subtasks with `parent_id != null`.
- `.devagent/workspace/research/2026-01-17_cross-task-communication-proposal.md` (freshness: 2026-01-17) — Recommends “Epic task list injection (including subtasks)” into prompt context to improve coordination.
- `.devagent/workspace/product/guiding-questions.md` (freshness: 2026-01-10) — Open question about how Ralph should handle tasks that exceed a single context window (relevant to when to split work into smaller units / sub-issues).
- `.devagent/workspace/memory/constitution.md` (freshness: 2026-01-18) — Human-in-the-loop defaults (avoid multiplying heavy loops when lighter structure works).

## Findings & Tradeoffs
### 1) DevAgent already has a strong “subtasks within a task” execution pattern
The `implement-plan` research explicitly treats subtasks as **sequential steps inside a parent task**, with **per-subtask validation** and a **pause/log on failure** pattern. This maps cleanly onto “sub-issues as context + tracked progress” rather than “full loop per sub-issue.”

**Tradeoff:** This assumes subtasks are small enough that one agent run can hold context across them; for very large subtasks you may need escalation.

### 2) Ralph’s “epic vs task vs subtask” semantics already exist (and prefer leaf execution)
The Ralph revisions plan defines “Task” as leaf issues (`children.length === 0`) and notes that this includes “subtasks” (`parent_id != null`). That suggests the natural execution unit is the **leaf** (a task/subtask), while epics/parents are for grouping, visibility, and rollup.

**Tradeoff:** If you invoke Ralph on an epic/parent, you need a deterministic selection strategy for which leaf is “active,” otherwise the loop can thrash.

### 3) There’s an existing direction toward “inject related tasks into context”
The cross-task communication proposal explicitly recommends injecting an **epic task list (including subtasks)** into the agent prompt. This is aligned with your leaning: use sub-issues as **structured context** to drive sequencing and coordination, rather than multiplying full “loop runs.”

**Tradeoff:** Context injection needs summarization/limits; dumping every child detail can overwhelm the prompt. A compact list (id/title/status/parent_id) + a single “current focus” is usually enough.

## Recommendation
### Default (recommended): “Single loop + leaf sequencing”
- **If the current work item is a leaf (no `children`):** Run the normal loop for that leaf. Include minimal parent/sibling context (what epic/parent it belongs to, and what adjacent tasks exist).
- **If the current work item has children (epic/parent):** Run one loop that behaves like a **project manager / coordinator**:
  - Inject a compact list of child leaves (id/title/status/priority).
  - Select **one child leaf at a time** as the “active” unit of execution.
  - Track rollup progress (done/blocked/next) at the parent level; track detailed progress at the leaf level.

This matches the DevAgent “subtasks are sequential within a parent task” pattern, and it matches Ralph’s existing “leaf issues are tasks” semantics.

### Escalate to “loop per sub-issue” only when it’s justified
Run a dedicated loop per sub-issue when at least one is true:
- The sub-issue is large enough to exceed a single context window or is expected to span multiple sessions (ties to the guiding-question about context limits).
- The sub-issue needs a different agent profile/tooling, or has materially different quality gates.
- You need isolation for risk management (e.g., high uncertainty, experimental changes) or clearer human review checkpoints.

### Practical rule of thumb
- **Small/medium sub-issues:** treat like subtasks (sequential steps), validate each, and roll up.
- **Big sub-issues:** treat like tasks (own loop), but keep a single parent “coordination loop” for status and ordering.

## Repo Next Steps (checklist)
- [ ] **[NEEDS CLARIFICATION]** Replace “our new task” with a concrete problem statement (what exactly should Ralph do when invoked on an epic/parent?).
- [ ] Run `devagent clarify-task` to decide the desired default behavior + escalation criteria.
- [ ] Run `devagent create-plan` to turn the decision into implementation steps (prompt changes, progress tracking, selection strategy).

## Risks & Open Questions
- **Selection strategy:** If invoked on an epic/parent, how does Ralph choose the next child? (status order, priority, plan order, explicit human selection?)
- **Progress rollup:** Where should rollup live (parent AGENTS.md vs Beads comments vs both)?
- **Context limits:** What’s the maximum child list size before summarization must kick in?
- **Human-in-loop checkpoints:** Where does confirmation happen—per child, per parent phase, or only at high-risk transitions?
