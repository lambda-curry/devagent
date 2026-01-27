# Ralph Loop Config Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-22
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/completed/2026-01-22_ralph-loop-config/`
- Stakeholders: Jake Ruesink (Owner)

---

## PART 1: PRODUCT CONTEXT

### Summary
Implement a config-driven approach for Ralph loop setup that allows building Beads tasks programmatically from structured data (JSON schemas). This system enables repeatable task loops, consistent setup/teardown hooks, and reusable templates, moving away from ad-hoc manual setup and improving consistency for epic preparation.

### Context & Problem
Currently, setting up a Ralph loop requires manual interpretation of a plan markdown file or ad-hoc command execution. There is no standardized way to define reusable loops (e.g., "exploration loop", "generic feature loop") or ensure consistent setup (e.g., creating a PR) and teardown (e.g., final review) steps. This leads to inconsistency and duplication of effort.

### Objectives & Success Metrics
- **Objective:** Enable Ralph loops to be initialized from a structured `loop.json` file.
- **Objective:** Support reusable templates with `extends` capability.
- **Objective:** Automatically create Beads tasks for setup and teardown hooks.
- **Metric:** Setup workflow can generate a valid 5-task loop from a template in < 1 minute.
- **Metric:** 100% of created tasks pass schema validation.

### Users & Insights
- **Primary User:** DevAgent (Ralph) itself, automating its own setup process.
- **Secondary User:** Developers executing the `setup-ralph-loop` workflow.
- **Insight:** Repeatable patterns (setup PR -> do work -> review) are common and should be templatized.

### Solution Principles
- **Config-Driven:** Everything needed to start a loop should be defined in JSON.
- **System-Agnostic Schema:** Core schema should focus on task structure, not Beads implementation details (though mapped to Beads eventually).
- **Human-in-the-Loop:** The setup workflow generates the JSON, allowing for review/adjustment before execution.

### Scope Definition
- **In Scope:**
    - JSON Schema definition for Ralph loops.
    - Template library (`.devagent/plugins/ralph/templates/`).
    - Setup script (`ralph-loop-setup.ts`) to parse JSON and execute Beads commands.
    - Integration with `setup-ralph-loop` workflow.
    - Setup/Teardown task hooks.
    - Agent routing via `role` mapping.
- **Out of Scope / Future:**
    - Conditional execution logic for setup/teardown tasks.
    - Automated parsing of markdown plans (workflow driven instead).

### Functional Narrative

#### Setup Flow
- **Trigger:** User initiates `setup-ralph-loop` workflow.
- **Narrative:** The agent reviews the current goal/plan and generates a `loop.json` file in `.devagent/plugins/ralph/runs/`, potentially extending a template from `templates/`.
- **Validation:** The generated JSON is validated against the schema.
- **Execution:** The agent invokes the setup script with the JSON path.
- **Outcome:** Beads tasks are created, linked, and ready for Ralph execution.

### Technical Notes & Dependencies
- **Dependency:** Metadata extension task (`2026-01-17_extend-task-metadata-for-error-tracking`) for full metadata support (though MVP can proceed with basic metadata).
- **Libraries:** `ajv` for JSON schema validation.
- **CLI:** `beads` (bd) CLI for task creation.

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- **Scope focus:** Ralph Plugin (Setup Workflow & Core Tools)
- **Key assumptions:** `ajv` is available or can be added. Beads CLI is installed and configured.
- **Out of Scope:** Modifications to the core Ralph execution loop (this is purely setup).

### Implementation Tasks

#### Task 1: Define Loop Schema & Template Structure
- **Objective:** Create the JSON schema and initial folder structure.
- **Impacted Modules/Files:**
    - `.devagent/plugins/ralph/core/schemas/loop.schema.json` (New)
    - `.devagent/plugins/ralph/templates/generic-ralph-loop.json` (New)
    - `.devagent/plugins/ralph/runs/` (New Directory)
- **References:** Clarification Packet
- **Dependencies:** None
- **Acceptance Criteria:**
    - Schema defined using Draft 7 or newer.
    - Schema validates `id`, `title`, `objective`, `role` (enum), `setupTasks`, `teardownTasks`, `tasks`.
    - `generic-ralph-loop.json` template created with standard setup (PR creation) and teardown (Report generation) tasks.
- **Testing Criteria:** Manual validation of sample JSONs against the schema using a temporary script.
- **Validation Plan:** Verify schema validity with Ajv.

#### Task 2: Implement Loop Setup Script (Core Logic)
- **Objective:** Create the script that parses `loop.json`, resolves templates, and creates Beads tasks.
- **Impacted Modules/Files:**
    - `.devagent/plugins/ralph/tools/setup-loop.ts` (New)
- **References:** Research Packet (Script Design)
- **Dependencies:** Task 1
- **Acceptance Criteria:**
    - Script accepts a file path argument.
    - Script resolves `extends` property (merges template with instance config).
    - Script validates final JSON against schema (Task 1).
    - Script executes `bd create` for all tasks (setup, main, teardown) in order.
    - Script executes `bd dep add` in a second pass to link dependencies.
    - Script sets `role` labels based on config mapping.
- **Testing Criteria:** Run script with a test JSON; verify tasks appear in Beads with correct metadata and dependencies.
- **Validation Plan:** End-to-end run with a dummy loop config.

#### Task 3: Integrate with Setup Workflow
- **Objective:** Update the `setup-ralph-loop` workflow to use the new config-driven approach.
- **Impacted Modules/Files:**
    - `.devagent/plugins/ralph/workflows/setup-ralph-loop.md`
- **References:** Current `setup-ralph-loop.md`
- **Dependencies:** Task 2
- **Acceptance Criteria:**
    - Workflow instructs agent to generate `loop.json` based on plan/goal.
    - Workflow instructs agent to save JSON to `runs/`.
    - Workflow instructs agent to run `setup-loop.ts`.
    - Manual "create task" steps are removed/replaced by the script invocation.
- **Testing Criteria:** Execute the workflow for a sample task; verify correct prompt guidance and successful execution.
- **Validation Plan:** Simulate a workflow run.

#### Task 4: Create Standard Templates
- **Objective:** Populate the template library with common loop patterns.
- **Impacted Modules/Files:**
    - `.devagent/plugins/ralph/templates/exploration-loop.json` (New)
    - `.devagent/plugins/ralph/templates/feature-loop.json` (New)
- **References:** Brainstorm Packet
- **Dependencies:** Task 1
- **Acceptance Criteria:**
    - `exploration-loop` defined (focus on research/validation tasks).
    - `feature-loop` defined (focus on implementation/testing).
    - Templates utilize setup/teardown hooks effectively.
- **Testing Criteria:** Verify templates are valid against the schema.
- **Validation Plan:** Schema validation.

#### Task 5: Explore Epic Setup & Config Integration
- **Objective:** Determine how the parent Epic is defined and created in the new config-driven flow.
- **Impacted Modules/Files:**
    - `.devagent/plugins/ralph/core/schemas/loop.schema.json`
    - `.devagent/plugins/ralph/tools/setup-loop.ts`
- **References:** User feedback ("don't we need an epic task that will hold all these?")
- **Dependencies:** None (Parallel exploration)
- **Acceptance Criteria:**
    - Clarity on whether `loop.json` defines the Epic or inherits it.
    - Updated schema/script design to support Epic creation or linkage.
- **Testing Criteria:** Validation of the chosen Epic integration strategy.
- **Validation Plan:** Documented decision and updated implementation tasks if needed.

### Implementation Guidance
- **From `.devagent/plugins/ralph/tools/config.json`:**
  - Use the existing `agents` mapping to validate `role` values in the schema.
- **From Research Packet:**
  - Use `ajv` with `JSONSchemaType` for TypeScript type safety if possible, or standard `ajv` validation.
  - Remember `bd create` does not support dependencies; use `bd dep add`.

---

## Risks & Open Questions

| Item | Type | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Beads CLI changes | Risk | Jake Ruesink | Pin CLI version or re-verify commands if failures occur. | - |
| Schema complexity | Risk | Jake Ruesink | Keep schema minimal (MVP) and iterate. | - |

---

## Progress Tracking
Refer to the AGENTS.md file in the task directory for instructions on tracking and reporting progress during implementation.

---

## Appendices & References
- **Clarification Packet:** `.devagent/workspace/tasks/completed/2026-01-22_ralph-loop-config/clarification/2026-01-22_initial-clarification.md`
- **Research Packet:** `.devagent/workspace/tasks/completed/2026-01-22_ralph-loop-config/research/2026-01-22_ralph-loop-config-implementation-research.md`
- **Brainstorm Packet:** `.devagent/workspace/tasks/completed/2026-01-22_ralph-loop-config/brainstorms/2026-01-22_ralph-loop-config-brainstorm.md`
