# Epic Auto-Close on Final Subtask Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-18
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/completed/2026-01-18_epic-auto-close-on-final-subtask/`
- Stakeholders: Jake Ruesink (Owner, Decision Maker), Ralph plugin maintainers (Consulted)
- Notes: Plan is grounded in the clarification + research packets; scope is documentation alignment only.

---

## PART 1: PRODUCT CONTEXT

### Summary
Define and document a single canonical mechanism for closing Beads epics: the final “Generate Epic Revise Report” quality gate task. Update Ralph docs to reflect simplified edge-case semantics (no auto-block, no auto-reopen, manual backfill for missing gate task) so epics stop appearing “open” after all real work completes.

### Context & Problem
Ralph’s monitoring kanban can show epics as `open` even when all subtasks are `closed`, which creates misleading status and manual cleanup. The repository already documents a final quality gate task as the canonical epic closer, but those docs currently instruct “block epic if any child is blocked,” which conflicts with the clarified, simplified policy. This plan updates the two canonical docs to match the decision and remove split-brain expectations. (Refs: `.devagent/workspace/tasks/completed/2026-01-18_epic-auto-close-on-final-subtask/research/2026-01-18_epic-auto-close-on-final-subtask-research.md`, `.devagent/workspace/tasks/completed/2026-01-18_epic-auto-close-on-final-subtask/clarification/2026-01-18_initial-clarification.md`)

### Objectives & Success Metrics
- Canonical closure mechanism is explicit: only the final “Generate Epic Revise Report” task can close the epic.
- Docs no longer instruct auto-blocking epics when any child is blocked; epics remain `open` in that case.
- Quality gate behavior when blocked children exist is unambiguous: report is generated, task stays `open`, and a comment records remaining blockers.
- Manual backfill procedure is documented for epics missing the final report task.
- Post-close behavior is documented: no auto-reopen when new tasks are added later.

### Users & Insights
- **Primary users:** Ralph operators and DevAgent contributors who create epics via plan-to-beads or setup workflows.
- **Insight:** Missing or conflicting doc guidance is the most likely cause of “epic stays open” confusion; aligning docs to the canonical quality-gate mechanism addresses this without router changes.

### Solution Principles
- **Single source of truth:** Epic closure happens only in the final quality gate task.
- **Simplicity over automation:** Avoid router backstops and avoid auto-block/reopen logic.
- **Human control:** Keep epics open when blocked and leave manual override in human hands.

### Scope Definition
- **In Scope:** Doc updates to `.devagent/plugins/ralph/workflows/setup-ralph-loop.md` and `.devagent/plugins/ralph/skills/plan-to-beads-conversion/SKILL.md` to reflect clarified epic closure, blocked-child behavior, and manual backfill.
- **Out of Scope / Future:** Router-side auto-close/backstop, auto-reopen behavior, changes outside `.devagent/**`, or any Beads CLI behavior changes.

### Functional Narrative
#### Final quality gate execution (canonical epic closure)
- **Trigger:** All top-level epic tasks are closed; the “Generate Epic Revise Report” quality gate becomes ready.
- **Experience narrative:** The PM agent verifies child task statuses, generates the revise report, and updates the epic status only if all tasks are closed. If blocked tasks exist, the report is still generated but the epic and report task remain open with a comment describing remaining blockers.
- **Acceptance criteria:** Docs explicitly direct the above behavior and forbid router-driven auto-close.

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- Scope focus: Documentation alignment for epic-close semantics in the Ralph setup workflow and plan-to-beads conversion skill.
- Key assumptions:
  - The quality gate task is the canonical “final subtask.”
  - Nonconforming epics are handled by manual backfill, not router enforcement.
- Out of scope: Any code changes to the router, Beads CLI, or agent runtime.

### Implementation Tasks

#### Task 1: Update `setup-ralph-loop` workflow doc to match clarified epic-close policy
- **Objective:** Replace the “block epic if any blocked” guidance with the clarified behavior and add a manual backfill note.
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/workflows/setup-ralph-loop.md`
- **References:**
  - `.devagent/workspace/tasks/completed/2026-01-18_epic-auto-close-on-final-subtask/clarification/2026-01-18_initial-clarification.md`
  - `.devagent/workspace/tasks/completed/2026-01-18_epic-auto-close-on-final-subtask/research/2026-01-18_epic-auto-close-on-final-subtask-research.md`
- **Dependencies:** None.
- **Acceptance Criteria:**
  - **Step 6 description** explicitly states the report task runs after all tasks are closed or blocked, but **epic closure only happens when all are closed**.
  - **Epic Status Management** instructions are updated to:
    - Close the epic **only** when all child tasks are `closed`.
    - **Do not** auto-block the epic when blocked children exist; keep epic `open`.
    - When blocked children exist, **leave the report task `open`** and add a comment describing remaining blockers and what to re-check on the next run.
  - **Acceptance criteria** text for the report task reflects: report generated; epic closed only if all tasks closed; report task stays open with a blocker summary if blocked children exist.
  - **Manual backfill procedure** is added (near Step 6 or in a short note): if an epic is missing the report task, create it using Step 6 with dependencies and parent set; do not add router-based auto-close.
  - **No router backstop** note is explicit (the workflow should not instruct adding router logic).
- **Testing Criteria:** Doc-only change; ensure the new instructions are internally consistent and readable.
- **Validation Plan:** Manual review of Step 6 and acceptance criteria text to confirm it matches clarified policy.

#### Task 2: Update `plan-to-beads-conversion` skill doc to match clarified epic-close policy
- **Objective:** Align the conversion skill’s “Append Epic Report Task” instructions with the clarified epic-close and blocked-child behavior.
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/skills/plan-to-beads-conversion/SKILL.md`
- **References:**
  - `.devagent/workspace/tasks/completed/2026-01-18_epic-auto-close-on-final-subtask/clarification/2026-01-18_initial-clarification.md`
  - `.devagent/workspace/tasks/completed/2026-01-18_epic-auto-close-on-final-subtask/research/2026-01-18_epic-auto-close-on-final-subtask-research.md`
- **Dependencies:** None.
- **Acceptance Criteria:**
  - **Step 5 description** specifies the report task is the only epic closer and does **not** auto-block epics.
  - **Steps list** updates Epic Status Management to:
    - Close epic only when all tasks are `closed`.
    - Keep epic `open` when any tasks are `blocked`.
    - Leave the report task `open` and add a comment summarizing blocked tasks and next checks.
  - **Acceptance Criteria array** no longer references blocking the epic; instead records report generation plus conditional epic closure and open report task when blockers remain.
  - **Manual backfill note** is added: if an epic is missing the report task, add it manually with dependencies and parent set; do not rely on router enforcement.
  - **Post-close policy** is stated: do not auto-reopen epics if new tasks are added later; manual only.
- **Testing Criteria:** Doc-only change; ensure instructions are consistent with setup workflow.
- **Validation Plan:** Manual cross-check between this skill and `setup-ralph-loop.md` Step 6 so wording and semantics match.

### Implementation Guidance (Optional)
- **From `.devagent/core/AGENTS.md` → Date Handling:** Use `date +%Y-%m-%d` for any new dated artifacts and references. (`.devagent/core/AGENTS.md`)
- **From `.devagent/core/AGENTS.md` → Storage Patterns:** Store the plan in the task’s `plan/` directory with ISO date prefix. (`.devagent/core/AGENTS.md`)

---

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Other Ralph docs (e.g., PM agent instructions) may still imply blocking epics for blocked children. | Risk | Jake Ruesink | Decide whether to align those docs now or track a follow-up update task. | 2026-01-18 |

---

## Progress Tracking
Refer to the AGENTS.md file in the task directory for instructions on tracking and reporting progress during implementation.

---

## Appendices & References
- `.devagent/workspace/tasks/completed/2026-01-18_epic-auto-close-on-final-subtask/clarification/2026-01-18_initial-clarification.md`
- `.devagent/workspace/tasks/completed/2026-01-18_epic-auto-close-on-final-subtask/research/2026-01-18_epic-auto-close-on-final-subtask-research.md`
- `.devagent/plugins/ralph/workflows/setup-ralph-loop.md`
- `.devagent/plugins/ralph/skills/plan-to-beads-conversion/SKILL.md`
- `.devagent/core/templates/plan-document-template.md`
- `AGENTS.md`
- `.devagent/core/AGENTS.md`
