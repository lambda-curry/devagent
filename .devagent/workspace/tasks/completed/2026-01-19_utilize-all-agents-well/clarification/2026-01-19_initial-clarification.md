# Clarified Requirement Packet — Utilize All Agents Well (Ralph Loop Improvements)

- Requestor: Jake Ruesink (Engineering)
- Decision Maker: Jake Ruesink (Engineering)
- Date: 2026-01-19
- Mode: Task Clarification
- Status: Complete
- Related Task Hub: `.devagent/workspace/tasks/completed/2026-01-19_utilize-all-agents-well/`
- Notes: Reconstructed from handoff summary; validate against original clarification packet if it exists elsewhere.

## Task Overview

### Context
- **Task name/slug:** `2026-01-19_utilize-all-agents-well`
- **What we are trying to achieve:** Improve Ralph loop setup so it reliably creates and routes design work when UI-sensitive, and ensure final review creates follow-up tasks from PR review comments before revise report generation.
- **Prior work:** Research packet at `.devagent/workspace/tasks/completed/2026-01-19_utilize-all-agents-well/research/2026-01-19_agent-collaboration-contract-research.md`.
- **Key constraint:** Improvements should apply to any plan, not plan-prompt-specific behaviors.

### Clarification Sessions
- Session 1: 2026-01-19 — Participants: Jake Ruesink — Topics: design task creation criteria, design deliverables, QA reopen semantics, final review behavior, deferred decisions.

---

## Clarified Requirements

### Scope & End Goal

**What needs to be done?**
- Improve `setup-ralph-loop` so it creates a dedicated design task when a plan is UI-sensitive.
- Encode expected design deliverables in that design task (intent + observable acceptance, component inventory/reuse with code refs, Storybook stories when available, lightweight mockups/screenshots when needed).
- Standardize a baseline requirement for agents to read the latest task comments.
- Update final review flow to create new child tasks from PR review comments before generating a revise report.

**What is the end goal state?**
- UI-sensitive plans consistently produce a design task with explicit deliverables.
- Design output lives in the design task comments with links to artifacts.
- Agents rely on latest task comments for current context before acting.
- Final review converts PR review feedback into new tasks and waits to generate revise report until those tasks close.

**In-scope (must-have):**
- UI-sensitivity heuristic for setup agent.
- Design deliverables checklist embedded in design task metadata/comments.
- Baseline "read latest comments" requirement documented and enforced.
- Final review behavior for PR review comments that creates child tasks and defers revise report.

**Out-of-scope (won't-have):**
- Plan-prompt-specific logic or bespoke heuristics per plan.
- Full redesign of Ralph execution loop (focus is on setup + final review behavior).

**Nice-to-have (could be deferred):**
- Refinement of design artifact minimums once Storybook availability is audited.

---

### Technical Constraints & Requirements
- Updates should be applied to workflow docs and agent instructions in `.devagent/plugins/ralph/**`.
- Design tasks should use routing labels from `.devagent/plugins/ralph/tools/config.json` (`design`, `engineering`, `qa`, `project-manager`, `general`).
- QA may reopen tasks to `open` for high-confidence improvements when concrete fix guidance is available.

---

### Dependencies & Blockers
- None identified.

---

### Implementation Approach
- Use a lightweight UI-sensitivity heuristic based on plan content (keywords + impacted file types).
- Embed design deliverables into design task `design`/`notes` fields or initial comments when tasks are created.
- Update agent instructions to read latest comments before acting and to align QA reopen semantics.
- Update final review workflow/agent guidance to create tasks from PR review comments before running revise report.

---

### Acceptance Criteria & Verification
**What does done look like?**
- [ ] Setup workflow documents a UI-sensitivity heuristic and design task creation rules.
- [ ] Design task deliverables are explicitly defined and referenced in setup-ralph-loop guidance.
- [ ] "Read latest comments" baseline is documented in agent instructions or core Ralph guidance.
- [ ] Final review behavior includes PR review comment triage into child tasks and defers revise report until those tasks close.
- [ ] Documentation updates cite relevant file paths and keep routing labels aligned with `config.json`.

---

## Assumptions Log

| Assumption | Owner | Validation Required | Validation Method | Due Date | Status |
| --- | --- | --- | --- | --- | --- |
| UI-sensitive plans can be detected via lightweight heuristic in setup-ralph-loop | Jake Ruesink | Yes | Define heuristic in plan and validate on sample plans | 2026-01-19 | Pending |
| Minimal design artifact can be defined without Storybook availability | Jake Ruesink | Yes | Decide in plan and align with design agent instructions | 2026-01-19 | Pending |
| Agents can reliably read latest comments with Beads CLI | Jake Ruesink | Yes | Confirm CLI command and document in instructions | 2026-01-19 | Pending |

---

## Gaps Requiring Research

### For #ResearchAgent

**Research Question 1:** What is the best lightweight UI-sensitivity heuristic for plans?
- Context: Needed to decide when to create design tasks in setup-ralph-loop.
- Evidence needed: Examples from recent plans or UI changes; preferred keyword/file heuristics.
- Priority: Medium
- Blocks: Finalizing setup-ralph-loop rules.

**Research Question 2:** What is the Beads CLI command for listing latest task comments?
- Context: Required to enforce "read latest comments" baseline.
- Evidence needed: Beads CLI help/docs or existing usage.
- Priority: High
- Blocks: Enforcing comment-reading requirement.

---

## Clarification Session Log

### Session 1: 2026-01-19
**Participants:** Jake Ruesink

**Questions Asked:**
1. When should design tasks be created? → Only when the setup agent judges the plan as UI-sensitive. (Jake Ruesink)
2. What must design tasks deliver? → Intent + observable acceptance, component inventory/reuse with code refs, Storybook stories when available, lightweight mockups/screenshots when needed. Output lives in design task comments + links. (Jake Ruesink)
3. How should QA handle high-confidence improvements? → QA may reopen tasks to `open` with concrete fix guidance; out-of-scope improvements logged for revise report. (Jake Ruesink)
4. What should final review do with PR review comments? → Create new child tasks under the same epic (engineering/qa labels), keep final review open, and only run revise report once new tasks close. (Jake Ruesink)
5. What is deferred to planning? → UI-sensitivity heuristic, baseline "read latest comments" wording, minimum design artifact when Storybook is missing. (Jake Ruesink)

**Unresolved Items:**
- UI-sensitivity heuristic definition.
- Baseline "read latest comments" requirement wording.
- Minimum design artifact when Storybook is missing.

---

## Next Steps

### Spec Readiness Assessment
**Status:** ⬜ Ready for Spec | ⬜ Research Needed | ☑️ More Clarification Needed

**Rationale:** Clarification captured the intended behaviors, but three deferred items must be decided in the plan before implementation.
