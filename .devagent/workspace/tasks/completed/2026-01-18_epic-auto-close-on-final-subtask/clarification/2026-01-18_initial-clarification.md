# Clarified Requirement Packet — Epic auto-close on final subtask

- Requestor: Jake Ruesink (Owner)
- Decision Maker: Jake Ruesink (Owner)
- Date: 2026-01-18
- Mode: Gap Filling
- Status: Complete
- Related Task Hub: `.devagent/workspace/tasks/completed/2026-01-18_epic-auto-close-on-final-subtask/`
- Notes: This clarification focuses on “how it will work” (canonical mechanism + edge case semantics) building on the research packet.

## Task Overview

### Context
- **Task name/slug:** `2026-01-18_epic-auto-close-on-final-subtask`
- **Business context:** Monitoring kanban can show epics as `open` even when all subtasks are `closed`, which creates misleading status without manual cleanup.
- **Stakeholders:** Jake Ruesink (Owner, decision maker)
- **Prior work:**
  - Research: `.devagent/workspace/tasks/completed/2026-01-18_epic-auto-close-on-final-subtask/research/2026-01-18_epic-auto-close-on-final-subtask-research.md`
  - Prior v4 context: `.devagent/workspace/tasks/completed/2026-01-17_ralph-revisions-v4/plan/2026-01-17_ralph-revisions-v4-plan.md`

### Clarification Sessions
- Session 1: 2026-01-18 — Jake Ruesink, interactive clarification (canonical mechanism + edge cases)

---

## Clarified Requirements

### Scope & End Goal

**What needs to be done?**
- Define and document the canonical mechanism for epic auto-close when the “final subtask” closes.
- Keep semantics intentionally simple; define only the minimal rules needed to prevent “epic stays open when work is done”.

**What's the end goal architecture or state?**
- Epic status transitions are consistent and predictable, and the monitoring UI reflects reality without manual cleanup.
- There is exactly one canonical closure mechanism (to avoid split-brain behavior between router logic and PM quality gate tasks).

**In-scope (must-have):**
- Canonical mechanism selection and documentation (router-driven vs PM quality-gate driven).
- Reopen semantics: do **not** auto-reopen (manual only).
- Manual override policy: automation should not fight humans (minimal guidance).
- Nonconforming epic handling defined (missing quality gate task).
- Blocked-child behavior defined (simple: do not auto-block epic).

**Out-of-scope (won't-have):**
- Any non-`.devagent/**` changes (this clarification packet is docs-only).
- Broad epic lifecycle edge cases beyond the explicit decisions captured here (intentionally kept simple).

---

### Implementation Approach (high-level)

**Current documented direction (from research):**
- Treat the final “Generate Epic Revise Report” task as the “final subtask”; when it runs, it closes the epic if all tasks are closed, blocks it if any are blocked.

**Clarified decisions (2026-01-18):**
- Canonical mechanism: **quality gate task is the only epic closer** (no router-driven auto-close backstop).
- Post-close mutations: **do not auto-reopen** epics when new child tasks are added later (manual only).
- If any child task is `blocked`: **do not auto-update epic to `blocked`**; keep epic `open` and rely on humans to manage blocked states.
- Canonical documentation locations: update both `.devagent/plugins/ralph/skills/plan-to-beads-conversion/SKILL.md` and `.devagent/plugins/ralph/workflows/setup-ralph-loop.md`.
- Quality gate execution when blocked children exist:
  - Still **generate** the revise report.
  - **Do not close** the quality gate task; leave it `open` so it can be re-run later.
  - Leave a comment summarizing what remains blocked / what to re-check next run.

**Doc alignment note:**
- This intentionally diverges from existing “block epic if any tasks are blocked” guidance currently present in the workflow/skill docs; update those docs to match this simpler policy.

---

### Acceptance Criteria & Verification (definition of done for this task)

**How will we verify this works?**
- Documented rules are unambiguous enough for `devagent create-plan` to implement without guessing.
- Explicitly documented:
  - The “final subtask” is the **“Generate Epic Revise Report”** quality gate task.
  - The router should **not** auto-close epics (avoid split-brain).
  - Epics do **not** auto-reopen when new tasks are added after close.
  - What to do for nonconforming epics (missing the quality gate task).

---

## Assumptions Log

| Assumption | Owner | Validation Required | Validation Method | Due Date | Status |
| --- | --- | --- | --- | --- | --- |
| “Final subtask” refers to the final quality gate task (“Generate Epic Revise Report”). | Jake | Yes | Confirmed via clarification | 2026-01-18 | Validated |
| We want exactly one canonical epic-close mechanism (avoid split-brain). | Jake | Yes | Confirmed via clarification | 2026-01-18 | Validated |
| Epics do not auto-reopen when new tasks are added after close. | Jake | Yes | Confirmed via clarification | 2026-01-18 | Validated |
| If any child task is blocked, epic remains `open` (no auto-block). | Jake | Yes | Confirmed via clarification | 2026-01-18 | Validated |
| Missing quality gate task is handled via manual backfill (documented procedure). | Jake | Yes | Confirmed via clarification | 2026-01-18 | Validated |
| Canonical docs live in both conversion skill and setup workflow docs. | Jake | Yes | Confirmed via clarification | 2026-01-18 | Validated |
| With blocked child tasks, the revise report can still be generated, but the quality gate task remains `open` for re-run. | Jake | Yes | Confirmed via clarification | 2026-01-18 | Validated |

---

## Gaps Requiring Research

- None identified yet (this is primarily policy/semantic clarification). If we decide to enforce via router, we may need additional research to confirm Beads CLI/DB semantics for parent/child listing and status updates.

---

## Clarification Session Log

### Session 1: 2026-01-18
**Participants:** Jake Ruesink

**Questions Asked:**
1. Decision maker + stakeholders for these semantics? → **A** (Jake is sole decision maker) (Jake)
2. When should an epic transition to `closed`? → **A** (only via final “Generate Epic Revise Report” quality gate task) (Jake)
3. If epic is closed and a new open child is added later, what happens? → **B** (do not auto-reopen; manual only; keep edge cases simple) (Jake)
4. If the quality gate runs and finds blocked children, what should it do? → **B** (keep epic `open`; update docs to stay simple) (Jake)
5. If an epic is missing the quality gate task, what’s the intended fix? → **A** (manual backfill procedure) (Jake)
6. Where should the canonical rule be documented? → **C** (both setup workflow + conversion skill) (Jake)
7. With blocked children, should the quality gate task close itself? → **B** (leave it `open`; add a comment so next run knows what to check) (Jake)
8. With blocked children, should we still generate the revise report? → **A** (yes, still generate) (Jake)

---

## Question Tracker

1. Decision maker + stakeholders for these semantics — ✅ answered
2. Canonical closure mechanism (quality gate task vs router backstop) — ✅ answered
3. Reopen / post-close mutation semantics — ✅ answered
4. Blocked-child handling (does epic become blocked?) — ✅ answered
5. Nonconforming epic handling (missing quality gate task) — ✅ answered
6. Canonical documentation locations — ✅ answered
7. Quality gate task completion semantics when blocked children exist — ✅ answered
8. Report generation policy when blocked children exist — ✅ answered

---

## Next Steps

### Spec Readiness Assessment
**Status:** Ready for Spec

**Rationale:**
- Clarification is complete and plan-ready. Remaining work is documentation + implementation work under downstream workflows.

**Handoff:**
- Next workflow: `devagent create-plan`
- Use this packet + research as inputs:
  - `.devagent/workspace/tasks/completed/2026-01-18_epic-auto-close-on-final-subtask/clarification/2026-01-18_initial-clarification.md`
  - `.devagent/workspace/tasks/completed/2026-01-18_epic-auto-close-on-final-subtask/research/2026-01-18_epic-auto-close-on-final-subtask-research.md`

---

## Change Log

- 2026-01-18 — Created initial clarification packet (gap-filling mode) from existing task hub + research.
- 2026-01-18 — Captured final decisions: keep epic `open` when blocked tasks exist, still generate revise report, and keep quality gate task `open` with a guiding comment for re-run.

