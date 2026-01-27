# Utilize All Agents Well (Ralph Loop Improvements) Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-19
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/completed/2026-01-19_utilize-all-agents-well/`
- Stakeholders: Jake Ruesink (Decision Maker)
- Notes: This plan is based on the handoff summary plus reconstructed research/clarification packets; verify against original artifacts if they exist elsewhere.

---

## PART 1: PRODUCT CONTEXT

### Summary
Improve Ralph loop coordination so UI-sensitive plans reliably create design tasks with explicit deliverables, agents always read the latest task comments, QA can reopen tasks with concrete fixes, and final review converts PR review feedback into new child tasks before generating revise reports.

### Context & Problem
Ralph setup currently creates tasks directly from plans but does not consistently route design work when UI-sensitive, and final review does not enforce a workflow that turns PR review comments into actionable follow-ups before revise report generation. This risks missing design intent, weak cross-agent coordination, and revise reports that skip critical feedback. The clarified decisions and research summary are captured in `.devagent/workspace/tasks/completed/2026-01-19_utilize-all-agents-well/research/2026-01-19_agent-collaboration-contract-research.md` and `.devagent/workspace/tasks/completed/2026-01-19_utilize-all-agents-well/clarification/2026-01-19_initial-clarification.md`.

### Objectives & Success Metrics
- Setup creates a dedicated design task when a plan is UI-sensitive, with explicit design deliverables embedded in task metadata/comments.
- Agent instructions require reading the latest task comments before execution, reducing context drift.
- QA can reopen tasks to `open` with concrete fix guidance, while out-of-scope improvements are logged for revise report follow-up.
- Final review creates new child tasks from PR review comments and defers revise report generation until those tasks are closed.

### Users & Insights
- Primary users: Ralph agents (engineering, design, QA, project-manager) and Jake as operator.
- Key insight: Design and review feedback need to be captured as explicit tasks to keep the loop reliable and coordinated.

### Solution Principles
- Add design tasks only when plans are UI-sensitive; keep setup lightweight otherwise.
- Design tasks must include intent + observable acceptance, component inventory/reuse with code refs, Storybook stories when available, and lightweight mockups/screenshots when needed.
- Agents should always read the latest task comments to avoid stale context.
- Final review should never generate revise reports while PR review comments remain untracked.

### Scope Definition
- **In Scope:** Setup-ralph-loop workflow updates, UI-sensitivity heuristic, design deliverable checklist, agent instruction updates for comment-reading + QA reopen semantics, final review behavior updates for PR review comments.
- **Out of Scope / Future:** Plan-prompt-specific heuristics, broader Ralph execution loop redesign, auto-implementation of PR review comments.

### Functional Narrative
#### Setup Ralph Loop (UI-sensitive path)
- Trigger: Setup agent reads a plan and detects UI-sensitive signals.
- Experience narrative: Setup agent creates a dedicated design task (label `design`) with explicit deliverables and routing guidance; other tasks proceed as usual.
- Acceptance criteria: Design task exists with deliverables checklist and references; labeling aligns with `.devagent/plugins/ralph/tools/config.json`.

#### Agent Execution Baseline
- Trigger: An agent starts a task.
- Experience narrative: Agent reads the latest task comments before setting status to `in_progress`, then proceeds with work using current context.
- Acceptance criteria: Instructions explicitly require reading latest comments; agent flows include a concrete Beads CLI command or documented method.

#### Final Review Behavior
- Trigger: Final review begins and PR review comments exist.
- Experience narrative: Final review creates new child tasks (engineering/qa labeled) for each actionable PR review comment, keeps the final review task open, and runs revise report only after the new tasks close.
- Acceptance criteria: PR review comments are always translated into child tasks before revise report generation.

### Experience References (Optional)
- Design tasks should follow `.devagent/plugins/ralph/agents/design-agent-instructions.md` (Storybook when available, no new Storybook setup in task).

### Technical Notes & Dependencies (Optional)
- Routing labels must match `.devagent/plugins/ralph/tools/config.json`.
- Final review behavior should align with `.devagent/plugins/ralph/workflows/final-review.md` and `.devagent/plugins/ralph/agents/project-manager-agent-instructions.md`.

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- Scope focus: Ralph workflow docs + agent instruction updates.
- Key assumptions:
  - UI-sensitivity can be detected with a lightweight heuristic from plan content.
  - Beads CLI supports listing task comments (command to be confirmed during implementation).
- Out of scope: Code changes in Ralph execution binaries beyond documentation/workflow guidance.

### Implementation Tasks

#### Task 1: Define UI-Sensitivity Heuristic + Design Task Creation Rules
- **Objective:** Document a simple UI-sensitivity heuristic and ensure setup-ralph-loop creates a design task with explicit deliverables when triggered.
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/workflows/setup-ralph-loop.md`
  - `.devagent/plugins/ralph/skills/plan-to-beads-conversion/SKILL.md`
  - `.devagent/plugins/ralph/agents/design-agent-instructions.md`
- **References:**
  - `.devagent/workspace/tasks/completed/2026-01-19_utilize-all-agents-well/research/2026-01-19_agent-collaboration-contract-research.md`
  - `.devagent/workspace/tasks/completed/2026-01-19_utilize-all-agents-well/clarification/2026-01-19_initial-clarification.md`
  - `.devagent/plugins/ralph/tools/config.json`
- **Dependencies:** None
- **Acceptance Criteria:**
  - UI-sensitivity heuristic is defined (keywords + impacted file extensions) and documented in setup-ralph-loop.
  - When UI-sensitive, setup-ralph-loop instructs creation of a dedicated design task labeled `design` with explicit deliverables in design/notes fields.
  - Design deliverables include intent + observable acceptance, component inventory/reuse with code refs, Storybook stories when available, and lightweight mockups/screenshots when needed.
  - Minimum design artifact when Storybook is missing is specified (e.g., annotated screenshot or lightweight mockup + component inventory + acceptance bullets).
- **Testing Criteria:**
  - Manual doc review: confirm heuristic and deliverables appear in setup-ralph-loop and design-agent instructions.
  - Ensure labels align with keys in `.devagent/plugins/ralph/tools/config.json`.
- **Validation Plan:**
  - Use `rg "UI-sensitive|design task"` to confirm new guidance is present in workflow docs.
  - Cross-check design deliverables list matches clarification decisions.

#### Task 2: Standardize "Read Latest Comments" + QA Reopen Semantics
- **Objective:** Require agents to read the latest task comments before execution and align QA reopen semantics with clarified expectations.
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/AGENTS.md`
  - `.devagent/plugins/ralph/agents/engineering-agent-instructions.md`
  - `.devagent/plugins/ralph/agents/qa-agent-instructions.md`
  - `.devagent/plugins/ralph/agents/design-agent-instructions.md`
  - `.devagent/plugins/ralph/agents/general-agent-instructions.md`
  - `.devagent/plugins/ralph/agents/project-manager-agent-instructions.md`
  - `.devagent/plugins/ralph/skills/beads-integration/SKILL.md`
- **References:**
  - `.devagent/workspace/tasks/completed/2026-01-19_utilize-all-agents-well/clarification/2026-01-19_initial-clarification.md`
  - `.devagent/plugins/ralph/AGENTS.md`
- **Dependencies:** None
- **Acceptance Criteria:**
  - Agent instructions explicitly require reading the latest task comments before setting status to `in_progress`.
  - A concrete Beads CLI command (or confirmed method) for listing latest comments is documented.
  - QA reopen semantics explicitly state that high-confidence fixes can reset tasks to `open` with concrete guidance; out-of-scope items logged for revise report follow-up.
- **Testing Criteria:**
  - Manual doc review: confirm new instructions are present across relevant agent docs.
  - Verify Beads CLI command is accurate (confirm with `bd` help during implementation).
- **Validation Plan:**
  - Use `rg "latest comments" .devagent/plugins/ralph` to confirm consistent guidance.

#### Task 3: Update Final Review to Create Tasks from PR Review Comments
- **Objective:** Ensure final review converts PR review comments into new child tasks and defers revise report generation until those tasks close.
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/workflows/final-review.md`
  - `.devagent/plugins/ralph/agents/project-manager-agent-instructions.md`
  - `.devagent/plugins/ralph/skills/revise-report-generation/SKILL.md`
- **References:**
  - `.devagent/workspace/tasks/completed/2026-01-19_utilize-all-agents-well/clarification/2026-01-19_initial-clarification.md`
- **Dependencies:** None
- **Acceptance Criteria:**
  - Final review workflow includes a step: detect PR review comments and create child tasks (engineering/qa labels) under the epic before running revise report.
  - Final review task remains open until newly created tasks are closed; revise report runs only afterward.
  - Project-manager agent guidance reflects the new behavior and provides labeling rules for PR review follow-up tasks.
- **Testing Criteria:**
  - Manual doc review: confirm final-review workflow and project-manager instructions describe PR comment triage and task creation.
- **Validation Plan:**
  - Use `rg "PR review" .devagent/plugins/ralph` to confirm updated guidance is consistent across docs.

### Implementation Guidance (Optional)
- **From `.devagent/plugins/ralph/AGENTS.md` → Task Context & Beads Integration:**
  - Agents must read task context via `bd show <task-id> --json` and honor Beads status values (`open`, `in_progress`, `blocked`, `closed`).
- **From `.devagent/plugins/ralph/agents/design-agent-instructions.md` → When You're Assigned a Task:**
  - Prefer Storybook for design artifacts; if Storybook is not available, do not set it up in-task (create a follow-up task instead).
- **From `.devagent/plugins/ralph/agents/qa-agent-instructions.md` → QA Fail Semantics:**
  - QA failures should reset tasks to `open` with evidence; `blocked` is reserved for external dependencies.

### Release & Delivery Strategy (Optional)
- Ship as documentation updates in `.devagent/plugins/ralph/**`, then run setup-ralph-loop on a recent plan to validate design task creation behavior.

---

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| UI-sensitivity heuristic misclassifies plans | Risk | Jake Ruesink | Validate heuristic against recent plans; adjust keywords/extensions if noisy | 2026-01-20 |
| Beads CLI command for listing comments unclear | Risk | Jake Ruesink | Confirm via `bd` help and update docs accordingly | 2026-01-19 |
| Final review task could stall revise report if follow-up tasks linger | Risk | Jake Ruesink | Require explicit status check + comment guidance for follow-up tasks | 2026-01-20 |

---

## Progress Tracking
Refer to the AGENTS.md file in the task directory for instructions on tracking and reporting progress during implementation.

---

## Appendices & References (Optional)
- Research: `.devagent/workspace/tasks/completed/2026-01-19_utilize-all-agents-well/research/2026-01-19_agent-collaboration-contract-research.md`
- Clarification: `.devagent/workspace/tasks/completed/2026-01-19_utilize-all-agents-well/clarification/2026-01-19_initial-clarification.md`
- Workflow target: `.devagent/plugins/ralph/workflows/setup-ralph-loop.md`
- Final review workflow: `.devagent/plugins/ralph/workflows/final-review.md`
- Agent instructions: `.devagent/plugins/ralph/agents/*-agent-instructions.md`
