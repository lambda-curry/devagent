# Execute Full Task Orchestrator Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-07
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/active/2026-01-06_full-cycle-workflow-design/`
- Stakeholders: DevAgent maintainers (Workflow owners, Implementers)
- Notes: Remove sections marked `(Optional)` if they do not apply.

---

## PART 1: PRODUCT CONTEXT

### Summary
Design and implement the `execute-full-task` workflow orchestrator that executes a full task lifecycle end-to-end in a single prompt. The workflow will assess task complexity, route through the appropriate workflow chain, and update the task hub `AGENTS.md` with a concise execution summary for traceability.

### Context & Problem
Current DevAgent workflows require manual chaining, which leads to context loss, inconsistent routing, and fragmented documentation. The research analysis documents a need for an orchestrator that can assess complexity, run the right sequence of workflows, and capture the reasoning trail in a single artifact. This plan turns the research into concrete implementation tasks for the new orchestrator. (See `.devagent/workspace/tasks/active/2026-01-06_full-cycle-workflow-design/research/2026-01-06_full-cycle-workflow-design-analysis.md`.)

### Objectives & Success Metrics
- `execute-full-task` runs from task intake through `mark-task-complete` without manual chaining (unless explicit pause requested).
- Complexity assessment is documented and supports user override.
- Task hub `AGENTS.md` is updated with the execution summary (What Was Executed, High-Impact Areas, Links to Files).
- Workflow roster, command interface, and Cursor command links are updated to include the new workflow.
- Error handling attempts workarounds and continues; if truly blocked, skips the blocking workflow and documents it.
- Test runs are executed for at least one complexity tier; automated validation (if any) plus manual review are completed.

### Users & Insights
Primary users are DevAgent operators and AI agents who need an end-to-end workflow to reduce cognitive load and maintain context continuity. Insights are drawn from the full-cycle research analysis and existing workflow definitions. (See `.devagent/workspace/tasks/active/2026-01-06_full-cycle-workflow-design/research/2026-01-06_full-cycle-workflow-design-analysis.md`.)

### Solution Principles
- Orchestrator defaults to full completion, but respects explicit pause points.
- Routing is heuristic-based with a clear rationale captured in the task hub `AGENTS.md`.
- Orchestrator executes workflows directly rather than generating command chains.
- Execution summary links to detailed artifacts rather than duplicating content.
- Error handling favors workarounds and continued execution; skip only when truly blocked, and document the block.

### Scope Definition
- **In Scope:** Workflow definition for `execute-full-task`, command file + symlink, workflow roster updates, summary documentation via task hub `AGENTS.md`, test runs (at least one tier).
- **Out of Scope / Future:** Automating external CLI execution, adding new workflows beyond the orchestrator, or changing existing workflow logic beyond invocation guidance.

### Functional Narrative
#### Flow: End-to-End Task Execution
- Trigger: User provides a task description (optionally includes complexity hints or pause points).
- Experience narrative: Orchestrator assesses complexity, selects a workflow chain, executes each workflow in sequence, updates the task hub `AGENTS.md` summary, and completes the task with `mark-task-complete`.
- Acceptance criteria: Workflow selection matches documented heuristics or user override, each workflow’s outputs are captured, and completion artifacts plus summary links are stored in the task hub.

### Technical Notes & Dependencies (Optional)
- Depends on existing workflows in `.devagent/core/workflows/` and their execution directives.
- Requires updates to command interfaces in `.agents/commands/` and Cursor symlinks in `.cursor/commands/`.

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- Scope focus: Build the new orchestrator prompt and supporting updates (summary via task hub `AGENTS.md`).
- Key assumptions: Existing workflows remain unchanged; orchestrator uses direct execution; manual pause requests are honored; no Full Cycle Log template is required.
- Out of scope: CLI automation, new workflow creation beyond the orchestrator.

### Implementation Tasks

#### Task 1: Author `execute-full-task` workflow definition
- **Objective:** Create the orchestrator workflow file that routes and executes the full lifecycle.
- **Impacted Modules/Files:** `.devagent/core/workflows/execute-full-task.md`
- **Dependencies:** None.
- **Acceptance Criteria:**
  - Workflow mission, inputs, routing logic, and execution steps align with the research analysis.
  - Includes heuristic-based complexity assessment with user override and pause-point handling.
  - Defines direct execution of workflow chain (no command generation) and updates the task hub `AGENTS.md` summary after each workflow phase.
  - Specifies error handling: attempt workaround with best assumptions, document the workaround, continue; if truly blocked, skip the blocking workflow, do as much as possible, and document what was blocked.
  - Captures high-impact areas using heuristics (file type/location and magnitude of change).
- **Validation Plan:** Read the workflow definition to ensure all sections are present, references to other workflows are correct, and instructions follow standard workflow patterns.

#### Task 2: Add command interface + Cursor integration
- **Objective:** Provide a command entry for `execute-full-task` consistent with existing command patterns.
- **Impacted Modules/Files:**
  - `.agents/commands/execute-full-task.md`
  - `.agents/commands/README.md`
  - `.cursor/commands/execute-full-task.md` (symlink)
- **Dependencies:** Task 1.
- **Acceptance Criteria:** Command file mirrors the standard command template, references the workflow file, and README + Cursor symlink list the new command.
- **Validation Plan:** Confirm the command file exists, README includes the entry, and the symlink points to the command file.

#### Task 3: Update workflow roster and naming references
- **Objective:** Make `execute-full-task` discoverable in the core workflow roster and naming convention list.
- **Impacted Modules/Files:** `.devagent/core/AGENTS.md`
- **Dependencies:** Task 1.
- **Acceptance Criteria:** `execute-full-task` appears in the workflows list with description, and naming convention table includes the new workflow name.
- **Validation Plan:** Read `.devagent/core/AGENTS.md` to confirm the workflow is listed in the correct sections.

#### Task 4: Validate with simple, standard, and complex task examples
- **Objective:** Ensure routing and execution guidance work across complexity tiers.
- **Impacted Modules/Files:**
  - `.devagent/workspace/tasks/active/2026-01-06_full-cycle-workflow-design/tasks/` (test notes or prompts)
  - Task hub `AGENTS.md` summary section produced by test runs
- **Dependencies:** Tasks 1–3.
- **Acceptance Criteria:**
  - At least one complexity tier is executed and documented.
  - If run, the simple example skips `clarify-task` and follows the minimal chain.
  - If run, the standard example includes `clarify-task` and supports pause after plan.
  - If run, the complex example includes `brainstorm` and logs extended reasoning.
  - At least one run generates a task hub `AGENTS.md` summary capturing complexity rationale, high-impact areas, and links.
- **Validation Plan:** Document test prompts and record observed routing outcomes in the task folder, referencing generated logs.

### Implementation Guidance (Optional)
- **From `.devagent/core/AGENTS.md` → Standard Workflow Instructions (Date Handling, Execution Directive, Storage Patterns):**
  - Run `date +%Y-%m-%d` before naming dated artifacts and use the ISO output in filenames. (`.devagent/core/AGENTS.md`)
  - Execute workflows immediately when invoked and only pause for missing inputs, blocking errors, or explicit human confirmation. (`.devagent/core/AGENTS.md`)
  - Store task-scoped artifacts under `.devagent/workspace/tasks/{status}/YYYY-MM-DD_task-slug/`. (`.devagent/core/AGENTS.md`)
- **From `AGENTS.md` (root) → When Workflows Change:**
  - Update `.devagent/core/workflows/`, `.devagent/core/AGENTS.md`, `.agents/commands/`, `.cursor/commands/`, and `.agents/commands/README.md` when adding a workflow. (`AGENTS.md`)

---

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Complexity heuristic misclassifies tasks | Risk | Workflow owner | Provide override input and capture rationale in task hub `AGENTS.md` | TBD |
| Interactive workflows (clarify-task) may interrupt full-cycle flow | Risk | Workflow owner | Document interaction expectations and logging requirements | TBD |
| Error handling needs consistent follow-through in execution summary | Risk | Workflow owner | Reinforce workaround/skip guidance and summary expectations in workflow file | TBD |
| Scope creep (turning orchestrator into automation engine) | Risk | Maintainers | Keep workflow strictly prompt-based and avoid CLI automation | TBD |

---

## Progress Tracking
Refer to the AGENTS.md file in the task directory for instructions on tracking and reporting progress during implementation.

---

## Appendices & References (Optional)
- Research analysis: `.devagent/workspace/tasks/active/2026-01-06_full-cycle-workflow-design/research/2026-01-06_full-cycle-workflow-design-analysis.md`
- Name selection: `.devagent/workspace/tasks/active/2026-01-06_full-cycle-workflow-design/research/2026-01-06_workflow-name-options.md`
- Workflow roster: `.devagent/core/AGENTS.md`
- Workflow definitions: `.devagent/core/workflows/`
- Plan template: `.devagent/core/templates/plan-document-template.md`
