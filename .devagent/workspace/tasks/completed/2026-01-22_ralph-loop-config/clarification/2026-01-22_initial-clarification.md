# Clarified Requirement Packet — Ralph Loop Config with Task Setup

- Requestor: Jake Ruesink (Owner)
- Decision Maker: Jake Ruesink (Owner)
- Date: 2026-01-22
- Mode: Task Clarification
- Status: Completed
- Related Task Hub: `.devagent/workspace/tasks/active/2026-01-22_ralph-loop-config/`

## Task Overview

### Context
- **Task name/slug:** ralph-loop-config
- **Business context:** Create config-driven approach for Ralph loop setup enabling programmatic Beads task creation from structured data. This will improve task preparation for epics by allowing repeatable task loops, consistent setupTasks and teardownTasks, and reusable templates.
- **Stakeholders:** Jake Ruesink (Owner, Decision Maker)
- **Prior work:** 
  - Brainstorm packet: `.devagent/workspace/tasks/active/2026-01-22_ralph-loop-config/brainstorms/2026-01-22_ralph-loop-config-brainstorm.md`
  - Research packet: `.devagent/workspace/tasks/active/2026-01-22_ralph-loop-config/research/2026-01-22_ralph-loop-config-implementation-research.md`

### Clarification Sessions
- Session 1: 2026-01-22 — Initial clarification (completed)

---

## Clarified Requirements

### Core Technical Dimensions

- **Scope & End Goal:** Implement a config-driven Ralph loop setup where a setup workflow (not a standalone script) creates a structured `loop.json` based on either a plan markdown or a high-level goal. The system must support repeatable task loops with consistent setup/teardown tasks.
- **Workflow Integration:** The `setup-ralph-loop` workflow will be responsible for reviewing context (plan or goal) and generating the loop JSON. This is an intentional human/agent-in-the-loop process, not automated parsing.
- **MVP Features:** 
  - JSON Schema Validation (Ajv) for type safety.
  - `extends` / Template Composition for reusability.
  - Setup/Teardown Hook tasks (automatic prepend/append).
  - Available Agents Array routing constraints.
  - Template library with presets (e.g., `generic-ralph-loop`).
- **Organization:** 
  - Schemas in `.devagent/plugins/ralph/core/`.
  - Preset templates in `.devagent/plugins/ralph/templates/`.
  - Final loop configurations (instance-specific) in `.devagent/plugins/ralph/runs/`.
- **Loop Identification:** Loop JSON files will be named using `{task-id}_{date}_{loop-name}.json` (or similar) to support multiple concurrent loops per task.
- **Task Creation:** A dedicated setup script will parse the generated loop JSON, validate it, and execute the necessary Beads CLI (`bd`) commands to create the tasks, set parents, and link dependencies.
- **Schema Fields:**
  - `id`, `title`, `objective` (Required)
  - `role` (Mandatory): Maps to a specific set of routing labels (e.g., `engineering`, `qa`, `design`) used to assign the task to an agent.
  - `acceptance_criteria` (Array of strings)
  - `dependencies` (Array of task IDs)
  - `labels` (Optional, Array of strings): For additional context or future use.
  - `metadata` (Optional, Flexible Object): Fully flexible for arbitrary key-value pairs.
- **Invocation:** The setup script will be invoked with an explicit path to the target JSON file (e.g., `bun setup-loop.ts .devagent/plugins/ralph/runs/task_date_name.json`).
- **Task Hooks:** Setup and teardown tasks will be optional arrays that always run if present.

### Technical Constraints
- Must use JSON Schema (Ajv) for validation.
- Must integrate with Beads CLI for task creation.
- Must support hierarchical IDs and dependency linking.
- Script must perform a two-pass creation: create all tasks first, then link dependencies to ensure IDs exist.

---

## Clarification Session Log

### Session 1: 2026-01-22
**Participants:** Jake Ruesink (Owner)

**Questions & Answers:**

1. **How should the new config-driven setup interact with existing plan markdown files?**
   - **Answer:** The setup workflow should review the plan (or goal) and generate the loop JSON manually/programmatically within the workflow. It's not an "automatic parsing" script. It needs to handle cases with no plan (just a goal).
   
2. **Which brainstormed features are "Must-Have" for MVP?**
   - **Answer:** All of them: Schema validation, Template composition, Setup/Teardown hooks, Available Agents Array, and the Template library.

3. **Where should the task schema and template library reside?**
   - **Answer:** Schemas in `.devagent/plugins/ralph/core/` and templates in `.devagent/plugins/ralph/templates/`.

4. **Role of the "Available Agents Array"?**
   - **Answer:** Preferred list for setup suggestions, keeping it simple for now.

5. **Should setup/teardown tasks be conditional?**
   - **Answer:** No. They are optional arrays that always run if defined.

6. **Mechanism for Beads task creation?**
   - **Answer:** A dedicated script will parse the JSON and run `bd` commands.

7. **Schema fields prioritization?**
   - **Answer:** `acceptance_criteria`, `dependencies`, and `labels` (as an array). `metadata` (general object). No `impacted_files`.

8. **Storage for final loop JSONs?**
   - **Answer:** Centralized `.devagent/plugins/ralph/runs/` folder.

9. **Role field vs Labels array?**
   - **Answer:** `role` is mandatory and maps to routing labels for agent assignment. `labels` is an optional array for future/extra context.

10. **Metadata flexibility?**
    - **Answer:** Fully flexible.

11. **Setup script invocation?**
    - **Answer:** Explicit file path argument.

---

## Next Steps

### Plan Readiness Assessment
**Status:** ✅ Ready for Plan

**Rationale:**
Requirements are fully clarified, including schema fields, file organization, workflow integration, and technical implementation details.
