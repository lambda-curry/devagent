# Research — Epic auto-close on final subtask (Ralph/Beads)

- Requested By: Jake Ruesink
- Last Updated: 2026-01-18
- Task Hub: `.devagent/workspace/tasks/active/2026-01-18_epic-auto-close-on-final-subtask/`

## Classification & Assumptions

- **Classification**: Implementation design / workflow semantics (epic lifecycle management).
- **Assumptions**:
  - “Final subtask” can (and should) be the **final Epic quality gate task**: **“Generate Epic Revise Report”**.
  - We prefer **one canonical mechanism** for changing epic status to avoid split-brain behavior (router vs PM task).
  - This packet only uses `.devagent/**` artifacts per task constraints.

## Research Plan (what was validated)

- Validate the intended epic close flow in Ralph docs (workflow + plan-to-beads conversion).
- Validate PM agent responsibilities around epic completion.
- Validate current router behavior regarding epic status updates (and confirm whether router-side auto-close exists).
- Identify likely root causes for “epic stays open even when all subtasks are closed”.

## Sources (internal)

- `.devagent/plugins/ralph/workflows/setup-ralph-loop.md` — Step 6 “Create Final Report Task” and explicit “Epic Status Management” instructions (lines 306–343 in current file view).
- `.devagent/plugins/ralph/skills/plan-to-beads-conversion/SKILL.md` — “Append Epic Report Task (Quality Gate)” and “Epic Status Management” (lines 173–205 in current file view).
- `.devagent/plugins/ralph/agents/project-manager-agent-instructions.md` — “Final Review (Before Epic Completion)” and “Final Review Task” pattern including “Update epic status” (lines 64–82 and 170–182 in current file view).
- `.devagent/plugins/ralph/AGENTS.md` — “Epic Quality Gate & Retrospectives” (lines 208–216 in current file view).
- `.devagent/plugins/ralph/tools/ralph.ts` — Execution loop checks epic blocked/closed but does not implement epic auto-close in-loop (see `isEpicBlocked()` and `executeLoop()`).
- Task context: `.devagent/workspace/tasks/active/2026-01-18_epic-auto-close-on-final-subtask/AGENTS.md`
- Prior context: `.devagent/workspace/tasks/completed/2026-01-17_ralph-revisions-v4/plan/2026-01-17_ralph-revisions-v4-plan.md`

## Findings & Tradeoffs

### Finding 1: The repo already defines a canonical epic-closing mechanism: the final “Revise Report” quality gate task

Both the setup workflow and the conversion skill explicitly require adding a final task with steps that include:
- verify all children are `closed` or `blocked`
- generate the revise report
- **set epic status**:
  - **close** epic if all tasks are closed (none blocked)
  - **block** epic if any tasks are blocked

This strongly implies “close epics when the final subtask completes” should mean:
- The “final subtask” is the **quality gate** task, and
- the epic closure is performed *by that task’s execution*, not automatically by the router.

### Finding 2: Router-driven epic auto-close is not currently the canonical flow (and may cause split-brain behavior)

In `.devagent/plugins/ralph/tools/ralph.ts`, the loop:
- stops if the epic is already `blocked` or `closed` (`isEpicBlocked()`),
- iterates ready tasks and runs agents,
- relies on agents to close tasks they complete,
but it does **not** implement an “auto-close epic when children complete” step in the loop.

Tradeoff summary:
- **Router-driven auto-close**
  - Pros: closes epics even if a PM gate task is missing; automatic and immediate.
  - Cons: can bypass the explicit “final review / revise report” gate; risks fighting manual status overrides and/or reopening flows; adds another place where epic semantics live.
- **PM quality-gate auto-close (via final task)**
  - Pros: single source of truth; aligns with documentation and PM instructions; naturally supports “blocked if any blocked” policy; provides a canonical place to generate the report.
  - Cons: requires that every epic includes the gate task; epics created outside the conversion workflow need manual backfill.

### Finding 3: The “epic remains open even when all subtasks are closed” symptom is most consistent with missing (or skipped) quality gate execution

Given the documented canonical mechanism, an epic can stay `open` after all implementation tasks are `closed` if:
- The final “Generate Epic Revise Report” task was **never created**, or
- It exists but never ran (so the epic status update step never happened), or
- It ran but the epic status update step was omitted/failed.

This aligns with why the monitoring kanban can become misleading: the epic’s own status isn’t updated unless the final gate runs.

## Recommendation

### Canonical mechanism: **PM quality-gate task closes the epic**

Adopt and document this as the canonical mechanism:
- The **final subtask** is the **“Generate Epic Revise Report”** task.
- When this final task is completed, it must:
  - **close** the epic if all other tasks are `closed`
  - **block** the epic if any tasks are `blocked`

This matches the existing workflow + skill docs and avoids competing closure logic in the router.

### Practical enforcement / guardrails (doc + workflow level)

- Ensure `setup-ralph-loop` (and any plan-to-beads conversion path) **always appends** the final report task and sets its parent to the epic.
- Ensure this final task is labeled `project-manager` and depends on **all** top-level tasks (so it becomes ready only at the end).
- Treat any epics without this task as “nonconforming”; backfill by adding the missing final task rather than adding router-side closure logic.

## Repo Next Steps (checklist)

- [ ] Decide (and record in task hub): canonical mechanism = **PM “Generate Epic Revise Report” final task** is the epic closer.
- [ ] Document: update relevant Ralph docs to explicitly define “final subtask” as the quality gate task and explain why router shouldn’t auto-close.
- [ ] Audit guidance: add a small “If epic is open but all children closed…” troubleshooting note pointing to backfilling/running the final report task.
- [ ] Verify: ensure existing epics created outside conversion have the final report task (or add a “backfill” procedure in docs).

## Risks & Open Questions

- **[NEEDS CLARIFICATION] Reopen semantics**: if an epic is `closed` and a new child task is added later, should the epic auto-reopen to `open`, or require manual reopening?
- **No-children epics**: if an “epic” has zero children, should it be treated as a task (no derived completion), or should we prevent this state?
- **Manual override policy**: if a human intentionally keeps an epic `open` after completion (for tracking), should automation ever override them?
- **Nonconforming epics**: do we want a periodic “hygiene” workflow to detect epics missing the quality gate task, or is this handled ad-hoc?

