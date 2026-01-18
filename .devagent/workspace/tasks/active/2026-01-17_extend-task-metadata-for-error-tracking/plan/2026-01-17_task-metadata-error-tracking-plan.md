# Extend Task Metadata for Error Tracking in Ralph Execution Loop Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-17
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/active/2026-01-17_extend-task-metadata-for-error-tracking/`
- Stakeholders: Jake Ruesink (Owner, Decision Maker)
- Notes: Remove sections marked (Optional) if they do not apply.

---

## PART 1: PRODUCT CONTEXT

### Summary
Replace Ralph's comment-parsing failure tracking with a dedicated execution metadata table in the Beads SQLite database, accessed via Bun's native SQLite driver, so the execution loop can make blocking decisions efficiently and consistently.

### Context & Problem
Ralph currently calls `bd comments` for each task and parses comment bodies to determine failure counts. This adds repeated CLI overhead and parsing work inside the execution loop. We need a durable, queryable metadata store that tracks failure counts and execution timestamps without modifying the core Beads schema. Research and clarification confirm Beads extension patterns and a custom table approach are the preferred solution.

### Objectives & Success Metrics
- Store execution metadata (`failure_count`, `last_failure_at`, `last_success_at`, `execution_count`) in a dedicated SQLite table keyed by `issues.id`.
- Initialize the table automatically on Ralph startup with `CREATE TABLE IF NOT EXISTS`.
- Replace `getTaskFailureCount()` comment parsing with direct metadata queries.
- Preserve blocking logic after 5 failures and maintain existing comment logging for errors.
- Target metadata lookups to be materially faster than the current comment parsing (clarified target: <1ms per lookup).

### Users & Insights
- **Primary user:** Ralph execution loop and operators running Ralph.
- **Insight:** Failure tracking overhead impacts loop performance and scales poorly with task history; a native table removes repeated CLI work and makes metadata persistent across runs.

### Solution Principles
- **Follow Beads extension pattern**: add a custom table with a foreign key to `issues.id` without modifying core schema.
- **Fail fast**: if metadata operations fail, stop execution rather than proceeding with partial state.
- **Lazy migration**: create metadata records on first access with defaults.

### Scope Definition
- **In Scope:** Custom `ralph_execution_metadata` table, Bun SQLite access, metadata helper functions, execution loop integration.
- **Out of Scope / Future:** Modifying Beads core schema, migration scripts for historical comment data, automated/integration tests, performance benchmarking tooling.

### Functional Narrative
#### Execution Loop Metadata Flow
- Trigger: Ralph starts execution loop for an epic.
- Experience narrative:
  - On startup, Ralph ensures the `ralph_execution_metadata` table exists in the Beads database.
  - Before running a task, Ralph reads the task's metadata row (creating it if missing) and uses `failure_count` to decide whether to block.
  - Each execution attempt increments `execution_count` and updates timestamps on success/failure.
  - Comment logging for failures remains in place for traceability; failure counting no longer depends on comments.
- Acceptance criteria:
  - Failure count reflects persisted metadata, not comment parsing.
  - Tasks are blocked after 5 failures using metadata.
  - Metadata persists across Ralph runs.

### Technical Notes & Dependencies
- Use Bun native SQLite module (`bun:sqlite`) for direct access.
- Database path is read from `config.json` (`beads.database_path`).
- Table created on startup with `CREATE TABLE IF NOT EXISTS` and FK to `issues.id`.

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- Scope focus: Ralph execution loop metadata tracking in `.devagent/plugins/ralph/tools/ralph.ts`.
- Key assumptions: `bun:sqlite` is available in the runtime; Beads DB is accessible at configured path; failure count semantics remain cumulative (no reset on success).
- Out of scope: historical comment migration, automated performance measurement.

### Implementation Tasks

#### Task 1: Add metadata storage helpers and table initialization
- **Objective:** Introduce `ralph_execution_metadata` schema and helper functions for reads/writes using `bun:sqlite`, including lazy record creation.
- **Impacted Modules/Files:** `.devagent/plugins/ralph/tools/ralph.ts`
- **References:** `.beads/docs/EXTENDING.md`, `.devagent/workspace/tasks/active/2026-01-17_extend-task-metadata-for-error-tracking/research/2026-01-17_task-metadata-extension-research.md`
- **Dependencies:** None
- **Acceptance Criteria:**
  - Table `ralph_execution_metadata` is created on startup with expected schema and FK to `issues.id`.
  - `getTaskMetadata()` returns default values when a record does not exist (lazy insert).
  - `updateTaskMetadata()` updates counts and timestamps deterministically.
  - Any SQLite error throws and stops execution (fail fast).
- **Testing Criteria:**
  - Manual: run Ralph against a real Beads DB and confirm table creation and row creation for a task id.
- **Validation Plan:**
  - Use a local run to verify the table exists and that metadata rows update after a simulated success/failure.

#### Task 2: Replace failure tracking with metadata in execution loop
- **Objective:** Remove comment parsing from failure counting and integrate metadata updates into the success/failure branches of the execution loop.
- **Impacted Modules/Files:** `.devagent/plugins/ralph/tools/ralph.ts`
- **References:** `.devagent/plugins/ralph/tools/ralph.ts` (current failure logic), `.devagent/workspace/tasks/active/2026-01-17_extend-task-metadata-for-error-tracking/clarification/2026-01-17_initial-clarification.md`
- **Dependencies:** Task 1
- **Acceptance Criteria:**
  - `getTaskFailureCount()` uses metadata instead of `bd comments` parsing (or is removed in favor of metadata helpers).
  - Execution loop increments `execution_count` on each attempt and updates `last_failure_at` or `last_success_at` accordingly.
  - Blocking logic uses metadata `failure_count` and continues to add failure comments for traceability.
  - Unused comment-parsing helpers are removed if no longer referenced.
- **Testing Criteria:**
  - Manual: force a failing task and verify failure count increments and block after 5 failures; force a success and verify success timestamp updates.
- **Validation Plan:**
  - Run a short execution loop with a controlled failing task to verify metadata behavior and block logic.

### Implementation Guidance
- **From `.devagent/plugins/ralph/AGENTS.md` → Beads Issue Tracking:**
  - Use `bd ... --json` for programmatic Beads CLI calls and keep work tracked in Beads. (`.devagent/plugins/ralph/AGENTS.md`)
- **From `.devagent/plugins/ralph/AGENTS.md` → Validation Gates:**
  - Verify changes with the project’s validation checklist before closing tasks. (`.devagent/plugins/ralph/AGENTS.md`)
- **From `.cursorrules/monorepo.mdc` → Package Structure:**
  - Keep changes scoped to the relevant package and avoid cross-package coupling. (`.cursorrules/monorepo.mdc`)

---

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| DB path resolution in worktrees | Risk | Engineering | Validate `config.json` path resolves correctly under worktrees before merging | Before implementation |
| SQLite concurrent access | Risk | Engineering | Keep operations short; rely on SQLite locking; revisit if concurrency issues surface | During implementation |
| Failure count semantics (reset vs cumulative) | Question | Owner | Confirm cumulative behavior is acceptable; keep current semantics unless requested | Before implementation |

---

## Progress Tracking
Refer to the AGENTS.md file in the task directory for instructions on tracking and reporting progress during implementation.

---

## Appendices & References
- Research: `.devagent/workspace/tasks/active/2026-01-17_extend-task-metadata-for-error-tracking/research/2026-01-17_task-metadata-extension-research.md`
- Clarification: `.devagent/workspace/tasks/active/2026-01-17_extend-task-metadata-for-error-tracking/clarification/2026-01-17_initial-clarification.md`
- Beads Extension Pattern: `.beads/docs/EXTENDING.md`
- Beads Architecture: `.beads/docs/ARCHITECTURE.md`
- Ralph Execution Loop: `.devagent/plugins/ralph/tools/ralph.ts`
- Ralph Plugin Instructions: `.devagent/plugins/ralph/AGENTS.md`
- Root Agent Instructions: `AGENTS.md`
- Core Workflow Instructions: `.devagent/core/AGENTS.md`
- Cursor Rules: `.cursorrules/monorepo.mdc`
