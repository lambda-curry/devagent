# Handling Sub-Issues in the Ralph Loop Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-18
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/active/2026-01-18_handling-sub-issues-in-ralph-loop/`
- Stakeholders: Jake Ruesink (Engineering, Decision Maker)
- Notes: This plan is intentionally tight-scope and guided by Constitution C6 (simplicity). It focuses on Ralph prompt output + minimal traceability comment structure for sub-issues.

---

## PART 1: PRODUCT CONTEXT

### Summary
Ralph’s current prompt context for epics/related tasks can become verbose and inconsistent, and completion comments don’t explicitly capture “struggles” in a predictable, revise-report-friendly way. We will tighten the “sub-issues” prompt contract to a small, repeatable block (bounded list + simple guidance) and standardize a short completion summary comment format so sub-issue work is more traceable without adding ceremony.

### Context & Problem
- Ralph frequently operates in a hierarchical task model (epic → tasks → subtasks). The agent needs enough “sub-issue context” to understand what’s left, without bloating the prompt or forcing a heavy “loop per sub-issue” approach.
- We also want completion comments to capture quick “what happened” and “what was hard” so revise reports can learn from real friction.
- References:
  - Clarification packet: `.devagent/workspace/tasks/active/2026-01-18_handling-sub-issues-in-ralph-loop/clarification/2026-01-18_initial-clarification.md`
  - Brainstorm (P0 bundle): `.devagent/workspace/tasks/active/2026-01-18_handling-sub-issues-in-ralph-loop/brainstorms/2026-01-18_simple-sub-issue-prompting.md`
  - Research (sub-issues handling): `.devagent/workspace/tasks/active/2026-01-18_handling-sub-issues-in-ralph-loop/research/2026-01-18_sub-issues-in-ralph-loop-research.md`
  - Research (Beads terminology): `.devagent/workspace/tasks/active/2026-01-18_handling-sub-issues-in-ralph-loop/research/2026-01-18_beads-status-terminology-alignment.md`

### Objectives & Success Metrics
- **Objective:** Sub-issues context becomes predictable and bounded, so prompts stay readable even for large epics.
- **Objective:** Completion comments reliably capture “struggles” for revise-report consumption without requiring a new workflow.
- **Success (practical):**
  - Prompt includes a compact “Sub-issues / Epic context” section that is bounded (top N + “X more…”).
  - Prompt copy and any status instructions use Beads-aligned tokens (`open`, `in_progress`, `blocked`, `closed`) and never “todo/done/ready”.
  - On completion, the agent is explicitly prompted to leave a short completion summary comment on the sub-issue using a suggested structure.

### Users & Insights
- **Primary user:** Ralph (autonomous agent) needs clear, low-ceremony instructions.
- **Secondary user:** Humans reading task history and revise reports benefit from consistent completion commentary (“what changed / what was hard / how verified”).

### Solution Principles
- **C6: Simplicity over rigidity:** prefer a small number of stable conventions over additional “mini-workflows.”
- **Bounded context:** never dump an unbounded sub-issue list into the prompt.
- **Terminology alignment:** use exact Beads status tokens in commands and prose.

### Scope Definition
- **In Scope:**
  - Update Ralph prompt generation to present sub-issue/epic context in a compact, bounded format.
  - Update completion guidance so sub-issues get a short completion summary comment (Summary / Struggles / Verification).
  - Adjust relevant Ralph docs (as needed) to match the new prompt contract and comment expectations.
- **Out of Scope / Future:**
  - Changing Beads itself or introducing new Beads statuses.
  - Implementing “loop per sub-issue” by default.
  - Building new report parsers; we only standardize the comment input shape.

### Functional Narrative
#### Prompt behavior for tasks with sub-issue context
- Trigger: Ralph builds a prompt for a task in an epic (or related hierarchy).
- Experience narrative:
  - Prompt shows a compact “Epic/Sub-issues context” block: bounded list + minimal guidance.
  - Prompt makes it clear the list is **context**, not a mandate (no auto-select), and that plan ordering is preferred when available.
- Acceptance criteria:
  - Block is present, skimmable, and bounded.
  - Copy is Beads-aligned and C6-simple.

#### Completion traceability for sub-issues
- Trigger: Agent completes a sub-issue task and is ready to close it.
- Experience narrative:
  - Prompt reminds the agent to run `bd update <id> --status closed` after verification gates.
  - Prompt asks for a short completion summary comment on the sub-issue with “Struggles” explicitly included for revise-report learning.
- Acceptance criteria:
  - A consistent suggested comment structure is presented (without requiring extra ceremony).

### Technical Notes & Dependencies (Optional)
- Existing implementation point: `.devagent/plugins/ralph/tools/ralph.ts` `buildPrompt()` currently injects an epic task list grouped by status and potentially unbounded.
- Existing status tokens appear throughout Ralph tooling/docs (`open`, `in_progress`, `blocked`, `closed`).

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- Scope focus: Ralph prompt output + minimal traceability comment guidance.
- Key assumptions:
  - Updating prompt shape + docs is sufficient (no new Beads schema, no new workflows required).
  - We can bound the list without losing essential context (top N plus remainder count).
- Out of scope:
  - Major redesign of Ralph execution loop semantics.

### Implementation Tasks

#### Task 1: Implement bounded “Sub-issues / Epic context” prompt block (P0)
- **Objective:** Make sub-issue context predictable, bounded, and aligned with the “context, not mandate” principle.
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/tools/ralph.ts` (`buildPrompt`, `getEpicTasks`, `getEpicProgressSummary`)
- **References:**
  - Clarification packet: `.devagent/workspace/tasks/active/2026-01-18_handling-sub-issues-in-ralph-loop/clarification/2026-01-18_initial-clarification.md`
  - Brainstorm P0 bundle: `.devagent/workspace/tasks/active/2026-01-18_handling-sub-issues-in-ralph-loop/brainstorms/2026-01-18_simple-sub-issue-prompting.md`
- **Dependencies:** None.
- **Acceptance Criteria:**
  - Prompt includes a compact block that:
    - shows epic progress (optional) and a **bounded** sub-issue list (top N + “X more…”),
    - uses Beads-aligned status tokens only (`open`, `in_progress`, `blocked`, `closed`),
    - includes a 3-line “how to use sub-issues” guidance note (C6-simple) and explicitly states it is **context** (no auto-select).
  - No unbounded multi-hundred-line lists appear in prompt output for large epics.
- **Testing Criteria:**
  - `bun run typecheck` (repo)
  - `bun run lint` (repo)
- **Validation Plan:**
  - Manually inspect a generated prompt (sample epic with many children) to confirm bounded list and copy.

#### Task 2: Add completion-summary comment prompt for sub-issues (C6-friendly)
- **Objective:** Ensure the agent is prompted to leave a short completion comment on the sub-issue that includes “Struggles” for revise-report learning.
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/tools/ralph.ts` (`buildPrompt` completion instructions section)
  - `.devagent/plugins/ralph/AGENTS.md` (Task Commenting for Traceability section; add/clarify completion-summary expectation)
- **References:**
  - Clarification packet: `.devagent/workspace/tasks/active/2026-01-18_handling-sub-issues-in-ralph-loop/clarification/2026-01-18_initial-clarification.md`
  - Ralph commenting requirements: `.devagent/plugins/ralph/AGENTS.md`
- **Dependencies:** Task 1 (so the prompt structure is coherent).
- **Acceptance Criteria:**
  - Prompt includes a **suggested** completion comment structure (keep it short per C6):
    - Summary
    - Struggles (explicitly framed as input for revise reports / improvements)
    - Verification
  - Prompt continues to reference existing required comment types (commit info / revision learning / screenshots) without contradiction.
  - Status instructions remain Beads-aligned: `bd update <id> --status closed` (never “done”).
- **Testing Criteria:**
  - `bun run typecheck`
  - `bun run lint`
- **Validation Plan:**
  - Manually inspect prompt text for the completion section and confirm it stays concise and consistent with `.devagent/plugins/ralph/AGENTS.md`.

#### Task 3: Tight-scope documentation alignment (keep future drift low)
- **Objective:** Ensure the new sub-issues prompt contract is documented in exactly one obvious place.
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/AGENTS.md` (add a small “Sub-issues context & completion comment” subsection)
  - `.devagent/plugins/ralph/skills/beads-integration/SKILL.md` (only if it helps; otherwise omit)
- **References:**
  - Research terminology: `.devagent/workspace/tasks/active/2026-01-18_handling-sub-issues-in-ralph-loop/research/2026-01-18_beads-status-terminology-alignment.md`
- **Dependencies:** None.
- **Acceptance Criteria:**
  - A future agent can find the sub-issue prompt expectations and completion comment suggestion quickly.
  - No redundant/conflicting “subtasks vs sub-issues” instructions are added.
- **Testing Criteria:** N/A (docs only).
- **Validation Plan:** Quick read-through to ensure C6 tone and minimalism.

### Implementation Guidance (Optional)
- **From `.devagent/workspace/memory/constitution.md` → C6. Simplicity Over Rigidity:**
  - Prefer simpler, natural flows over rigid structures; avoid overly prescriptive processes when concise prompting achieves the same goal.
- **From `.devagent/plugins/ralph/AGENTS.md` → Beads Status Values:**
  - Valid statuses: `open`, `in_progress`, `closed`, `blocked` and explicitly avoid `todo/done`.
- **From `.devagent/plugins/ralph/AGENTS.md` → Task Commenting for Traceability:**
  - Existing requirements for revision learning + commit info comments; ensure the new completion-summary suggestion complements rather than replaces these.

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Prompt bloat regressions | Risk | Jake Ruesink | Enforce “bounded list” in prompt rendering and keep copy short | During implementation |
| Comment redundancy vs existing traceability comments | Risk | Jake Ruesink | Make completion-summary structure “suggested” and keep it 3 bullets; avoid adding more required comment types unless necessary | During implementation |
| “Plan ordering” availability | Question | Jake Ruesink | In create-plan/plan-to-beads flows, ensure ordering is discoverable; otherwise agent chooses fallback (as clarified) | During implementation |

---

## Progress Tracking
Refer to the AGENTS.md file in the task directory for instructions on tracking and reporting progress during implementation.

