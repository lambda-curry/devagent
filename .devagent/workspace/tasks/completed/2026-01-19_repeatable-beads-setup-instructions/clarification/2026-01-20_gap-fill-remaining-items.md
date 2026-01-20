# Gap-Fill Supplement — Repeatable Beads Setup Instructions (Remaining Items)

- Requestor: Jake Ruesink
- Decision Maker: Jake Ruesink
- Date: 2026-01-20
- Mode: Gap Filling
- Status: In Progress
- Related Task Hub: `.devagent/workspace/tasks/completed/2026-01-19_repeatable-beads-setup-instructions/`
- References:
  - Primary clarification packet: `.devagent/workspace/tasks/completed/2026-01-19_repeatable-beads-setup-instructions/clarification/2026-01-20_initial-clarification.md`
  - Plan doc: `.devagent/workspace/tasks/completed/2026-01-19_repeatable-beads-setup-instructions/plan/2026-01-20_repeatable-beads-setup-instructions-plan.md`
  - Core doc (draft): `.devagent/core/docs/beads-setup.md`

## Why this gap-fill exists

The core docs and initial clarification are in a good state, but the task hub still has a few “completion gating” gaps:
- A checklist item for an **E2E variant** (isolating Ralph E2E runs with a dedicated Beads dir/DB).
- The **depth/shape** of “step-by-step per-mode walkthroughs” still feels underspecified.
- Two **open questions** remain in the task hub about final output location/shape and the recommended default.

This supplement is meant to clarify what “done enough” means for these remaining items and whether anything should be spun out as a follow-up task.

---

## Question Tracker (Gap-Fill)
1. What should we do about the “E2E variant” checklist item (ship now vs defer vs split)? — ✅ answered (A: add a small E2E section now)
2. What minimum level of per-mode walkthrough detail makes the docs “done enough”? — ✅ answered (A: fully flesh out recommended default; others can remain decision-tree summaries)
3. Where should the canonical “repeatable instructions” live (core docs vs task-local vs both)? — ✅ answered (A: core doc only)
4. What is the recommended default for DevAgent-like repos *today* (sync-branch vs BEADS_DIR vs other)? — ✅ answered (A: sync-branch mode)
5. What’s the “good enough to mark complete” threshold for this task hub? — ✅ answered (C: resolve the open questions in AGENTS.md and mark all checklist items [x])

---

## Clarification Session Log

### Session: 2026-01-20
**Participants:** Jake Ruesink

**Questions Asked / Answers Captured:**
- **1. What should we do with the remaining checklist item “Add E2E variant”?** → Depends on complexity; might be better as a prompt/workflow that can cleanup an epic fully after test runs instead of building the variant now. (Jake)
- **2. What minimum level of per-mode walkthrough detail is “done enough”?** → **A.** Fully flesh out the recommended default path; keep others as decision-tree summaries. (Jake)
- **3. Where should the canonical instructions live?** → **A.** Only in `.devagent/core/docs/beads-setup.md`. (Jake)
- **4. What should the recommended default be today?** → **A.** Sync-branch mode. (Jake)
- **5. What is “good enough to mark complete”?** → **C.** Resolve the open questions in `AGENTS.md` and mark all checklist items `[x]`. (Jake)

---

## Next Steps
- Once the above questions are answered (or explicitly deferred), update:
  - the task hub checklist/open questions (`AGENTS.md`)
  - any impacted doc sections (`.devagent/core/docs/beads-setup.md` and/or plan notes)
- Then decide whether to run `.devagent/core/workflows/mark-task-complete.md` now or keep the task in `active/` with scoped follow-ups.

