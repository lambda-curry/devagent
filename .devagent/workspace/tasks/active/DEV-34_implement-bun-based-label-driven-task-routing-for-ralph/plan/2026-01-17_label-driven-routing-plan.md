# Implement Bun-based label-driven task routing for Ralph Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-17
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/active/DEV-34_implement-bun-based-label-driven-task-routing-for-ralph/`
- Stakeholders: Jake Ruesink (Developer, Decision Maker)
- Notes: Remove sections marked `(Optional)` if they do not apply.

---

## PART 1: PRODUCT CONTEXT

### Summary
Replace the current `ralph.sh` shell loop with a Bun-based, label-driven router that assigns tasks to specialized agent profiles based on a single label per task. This enables agent specialization (implementation, QA, general) while keeping execution sequential and simple, with clear fallbacks and error handling.

### Context & Problem
Ralph currently relies on a single bash script for task execution, limiting routing flexibility and making it difficult to specialize agents by task type. We need a Bun-based router that reads agent profiles, matches tasks by label, and executes the correct agent, while preserving Beads-based task orchestration and incremental migration safety. References: `.devagent/plugins/ralph/tools/ralph.sh`, `.devagent/workspace/tasks/active/DEV-34_implement-bun-based-label-driven-task-routing-for-ralph/research/2026-01-17_bun-label-driven-task-routing-research.md`, `.devagent/workspace/tasks/active/DEV-34_implement-bun-based-label-driven-task-routing-for-ralph/clarification/2026-01-17_initial-clarification.md`.

### Objectives & Success Metrics
- Route tasks to the correct agent profile based on a single label per task.
- Fall back to the general agent when a task has no label or an unmapped label.
- Sequentially execute agents with no polling loop beyond re-checking ready tasks after completion.
- Reset failed tasks to `open` with an error comment and block after five failed attempts.
- Update execute-autonomous workflow to assign labels to tasks during creation.

### Users & Insights
Primary users are DevAgent maintainers running Ralph. Insights from research and clarification indicate that a simple, sequential router with Beads acting as the queue is preferred, and multi-label matching is out of scope for now. References: `.devagent/workspace/tasks/active/DEV-34_implement-bun-based-label-driven-task-routing-for-ralph/clarification/2026-01-17_initial-clarification.md`.

### Solution Principles
- One label per task (no multi-agent coordination).
- Agent profiles are JSON files with minimal fields and clear instructions references.
- Configuration stays centralized in `.devagent/plugins/ralph/tools/config.json` with an `agents` mapping.
- Sequential execution, no background polling beyond loop restart on completion.
- Incremental migration from `ralph.sh` (no big-bang replacement).

### Scope Definition
- **In Scope:** Bun routing script, agent profile JSON files, config mapping, label matching with general fallback, sequential execution, error handling with iteration blocking, execute-autonomous label assignment guidance.
- **Out of Scope / Future:** Parallel execution, multi-label routing, router agent, automated tests, polling daemons or event-driven watchers.

### Functional Narrative
#### Flow: Label-Driven Task Execution
- Trigger: Ralph starts execution loop (via `ralph.sh` or new Bun entrypoint).
- Experience narrative: Router loads config + agent profiles, reads ready tasks, selects the agent whose label matches the task, and runs it. If no match, it uses the general agent. After agent completion, the loop restarts if ready tasks remain.
- Acceptance criteria: Task runs with expected agent; status/comments are updated; errors reset to `open` and block after five failures.

### Technical Notes & Dependencies (Optional)
- Extend `.devagent/plugins/ralph/tools/config.json` with `agents` mapping.
- Agent profiles stored in `.devagent/plugins/ralph/agents/`.
- Use `bd ready --json`, `bd update`, and `bd comment` for task management.
- Dependency: `.devagent/plugins/ralph/workflows/execute-autonomous.md` must assign labels.

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- Scope focus: Ralph routing layer + workflow documentation updates.
- Key assumptions: Single label per task, manual testing only, sequential execution, fallback to general agent for unmapped labels.
- Out of scope: Automated test coverage, parallel agent execution, label composition/priority.

### Implementation Tasks

#### Task 1: Define agent profile schema and config mapping
- **Objective:** Create agent profile JSON files and wire them into `config.json` with an `agents` mapping, including an explicit general agent.
- **Impacted Modules/Files:** `.devagent/plugins/ralph/agents/`, `.devagent/plugins/ralph/tools/config.json`
- **References:** `.devagent/workspace/tasks/active/DEV-34_implement-bun-based-label-driven-task-routing-for-ralph/clarification/2026-01-17_initial-clarification.md`
- **Dependencies:** None
- **Acceptance Criteria:**
  - Agent profiles exist as JSON files with fields: `name`, `label`, `ai_tool`, `model_tier`, and `instructions_path` (or equivalent).
  - `config.json` includes an `agents` section mapping labels to profile filenames (including `general`).
  - Profiles cover at least `implementation`, `qa`, and `general` as initial entries.
- **Testing Criteria:** Manual inspection of JSON structure and config mapping (no automated tests).
- **Validation Plan:** Load JSON files in Bun script without parse errors and confirm mapping resolves expected filenames.

#### Task 2: Build Bun router foundation for label matching
- **Objective:** Create the Bun TypeScript entrypoint that loads config and profiles, reads ready tasks, and resolves the correct agent (with general fallback).
- **Impacted Modules/Files:** `.devagent/plugins/ralph/tools/ralph.ts` (new), `.devagent/plugins/ralph/tools/ralph.sh` (integration hook or call site)
- **References:** `.devagent/plugins/ralph/tools/ralph.sh`, `.devagent/plugins/ralph/AGENTS.md`, `.devagent/workspace/tasks/active/DEV-34_implement-bun-based-label-driven-task-routing-for-ralph/research/2026-01-17_bun-label-driven-task-routing-research.md`
- **Dependencies:** Task 1
- **Acceptance Criteria:**
  - Bun script reads `.devagent/plugins/ralph/tools/config.json` and agent profiles from `.devagent/plugins/ralph/agents/`.
  - Router resolves a single label per task and selects the matching profile, defaulting to `general` for no/unmapped labels.
  - Ready tasks are read via `bd ready --json` and parsed into the router’s in-memory model.
- **Testing Criteria:** Manual run of Bun script in a safe/dry-run mode (or log-only) showing correct agent selection per task label.
- **Validation Plan:** Confirm tasks with labels route to matching profile and unlabeled tasks route to `general` without errors.

#### Task 3: Implement sequential execution loop with error handling
- **Objective:** Execute agents sequentially via `Bun.spawn`, update Beads status/comments, and enforce failure iteration limits.
- **Impacted Modules/Files:** `.devagent/plugins/ralph/tools/ralph.ts`, `.devagent/plugins/ralph/tools/ralph.sh`
- **References:** `.devagent/plugins/ralph/AGENTS.md`, `.devagent/plugins/ralph/tools/ralph.sh`, `.devagent/workspace/tasks/active/DEV-34_implement-bun-based-label-driven-task-routing-for-ralph/clarification/2026-01-17_initial-clarification.md`
- **Dependencies:** Task 2
- **Acceptance Criteria:**
  - Agents execute sequentially; after each run, router re-checks for ready tasks and restarts if any remain.
  - Failures reset task status to `open` and add an error comment via `bd comment`.
  - Iteration tracking blocks a task after five failures (`blocked` status).
  - `ralph.sh` routes execution through the Bun router (or provides a guarded switch) without breaking existing validation steps.
- **Testing Criteria:** Manual execution against sample tasks confirming success, failure retry, and block-after-5 behavior.
- **Validation Plan:** Use a test task that fails repeatedly to verify the counter and blocked status; verify status transitions and comments are recorded in Beads.

#### Task 4: Update execute-autonomous workflow to assign agent labels
- **Objective:** Document and apply label assignment in the workflow that creates Beads tasks so routing works end-to-end.
- **Impacted Modules/Files:** `.devagent/plugins/ralph/workflows/execute-autonomous.md`, `.devagent/plugins/ralph/commands/execute-autonomous.md`
- **References:** `.devagent/plugins/ralph/workflows/execute-autonomous.md`, `.devagent/plugins/ralph/AGENTS.md`, `.devagent/workspace/tasks/active/DEV-34_implement-bun-based-label-driven-task-routing-for-ralph/clarification/2026-01-17_initial-clarification.md`
- **Dependencies:** Task 1
- **Acceptance Criteria:**
  - Workflow includes instructions for assigning a single agent label per task.
  - Label assignment references the `agents` mapping in `config.json` and the default `general` fallback.
  - Updated command file points to the revised workflow.
- **Testing Criteria:** Manual review of workflow instructions for correctness and consistency with config/profile structure.
- **Validation Plan:** Create a small test plan and confirm the workflow prescribes label assignment consistent with the new routing logic.

### Implementation Guidance (Optional)
- **From `.devagent/plugins/ralph/AGENTS.md` → Beads Issue Tracking:**
  - Use `bd ready --json`, `bd update`, and `bd comment` for task management; statuses must be `open`, `in_progress`, `closed`, or `blocked`.
- **From `.devagent/plugins/ralph/AGENTS.md` → Status Management:**
  - On failure, leave tasks as `open` (retry) or `blocked` with a documented reason; never use `todo`/`done` statuses.

---

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| `ralph.sh` migration could regress existing validation or branch checks | Risk | Jake Ruesink | Keep validation in `ralph.sh` intact and add guarded routing entrypoint | TBD |
| Failure tracking resets on process restart | Risk | Jake Ruesink | Document behavior or persist failure count in task comments/notes if needed | TBD |
| Label assignment consistency across plans | Risk | Jake Ruesink | Update execute-autonomous workflow and reference config mapping in instructions | TBD |

---

## Progress Tracking
Refer to the AGENTS.md file in the task directory for instructions on tracking and reporting progress during implementation.

---

## Appendices & References (Optional)
- `.devagent/workspace/tasks/active/DEV-34_implement-bun-based-label-driven-task-routing-for-ralph/clarification/2026-01-17_initial-clarification.md`
- `.devagent/workspace/tasks/active/DEV-34_implement-bun-based-label-driven-task-routing-for-ralph/research/2026-01-17_bun-label-driven-task-routing-research.md`
- `.devagent/plugins/ralph/AGENTS.md`
- `.devagent/plugins/ralph/tools/ralph.sh`
- `.devagent/plugins/ralph/tools/config.json`
- `.devagent/plugins/ralph/workflows/execute-autonomous.md`
