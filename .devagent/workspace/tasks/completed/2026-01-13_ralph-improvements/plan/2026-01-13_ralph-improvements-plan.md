# Ralph Improvements Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-13
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/active/2026-01-13_ralph-improvements/`
- Stakeholders: Jake Ruesink (Owner, Decision Maker)
- Notes: Clarification + research complete. Manual validation only; no automated tests required.

---

## PART 1: PRODUCT CONTEXT

### Summary
Improve Ralph's autonomous execution system with four must-have enhancements: richer task descriptions, epic worktree isolation, automatic PR creation on cycle break, and epic-focused execution. These changes reduce context hunting for agents, enable parallel epic work, create consistent review artifacts, and allow targeted execution during the testing phase.

### Context & Problem
Ralph's current autonomy has four pain points for engineering managers/team leads: tasks lack actionable context, epic work collides in a single workspace, no PR is created when a run ends, and the loop processes all open tasks instead of a targeted epic. The task hub and research packet confirm these gaps and note manual report generation and lack of worktree support today. References: `.devagent/workspace/tasks/active/2026-01-13_ralph-improvements/clarification/2026-01-13_initial-clarification.md`, `.devagent/workspace/tasks/active/2026-01-13_ralph-improvements/research/2026-01-13_ralph-improvements-research.md`.

### Objectives & Success Metrics
- Deliver all four improvements and keep Ralph usable during ongoing testing.
- Success is measured by qualitative feedback from engineering managers/team leads during manual validation (no formal metrics).
- Failure indicators: regressions in existing Ralph flow or added complexity that makes execution harder.

### Users & Insights
- Primary users: Engineering managers/team leads running Ralph today.
- Secondary/future users: Developers running Ralph for autonomous task execution.
- Insight: Task context is currently too thin; operational friction accumulates when running multiple epics or reviewing output.

### Solution Principles
- Follow existing DevAgent/Ralph patterns and keep changes minimal.
- No new dependencies; use existing git, Beads CLI, and GitHub CLI tooling.
- Ralph remains an autonomous flow (exception to the human-in-the-loop principle).

### Scope Definition
- **In Scope:**
  - Enrich task descriptions during plan-to-Beads conversion with code paths, references, and testing criteria.
  - Create and run Ralph inside an epic-scoped git worktree.
  - Automatically generate a PR on any cycle break with an execution report (and revise report when applicable).
  - Filter Ralph execution to a specific epic via env var and/or CLI flag.
- **Out of Scope / Future:**
  - Automated test suites or CI integration.
  - Backwards compatibility guarantees.
  - Vercel build automation and per-task push optimization (pending cost decision).

### Functional Narrative

#### Flow: Plan → Beads Task Creation (Better Task Descriptions)
- Trigger: A DevAgent plan is converted to Beads tasks via plan-to-beads conversion.
- Experience narrative: Each task description includes the objective, impacted files/modules, relevant rules/docs references, and testing/validation criteria so agents can start without opening the plan.
- Acceptance criteria:
  - Task descriptions contain: objective, impacted modules/files, references, and testing criteria.
  - Tasks still include the plan document path for full context.

#### Flow: Epic Worktree Execution
- Trigger: Ralph is started for an epic.
- Experience narrative: Ralph creates (or reuses) a worktree and branch for the epic, runs execution inside that worktree, and avoids collisions with other epics.
- Acceptance criteria:
  - Epic work runs in a dedicated worktree with a predictable path.
  - Worktree can be cleaned up after epic completion/failure without affecting main worktree.

#### Flow: Cycle Break → PR Creation
- Trigger: Ralph loop ends due to success, failure, blocked epic, or max iterations.
- Experience narrative: Ralph generates an execution summary (and revise report if the epic is complete), pushes the branch, and opens a PR with the report in the description.
- Acceptance criteria:
  - A PR is created for any cycle break scenario.
  - PR body includes run status, summary, and report references.
  - Failure scenarios still create a PR with status clearly noted.

#### Flow: Epic-Focused Execution
- Trigger: Ralph is started with an epic ID (env var or flag).
- Experience narrative: Ralph selects tasks only from the specified epic while preserving existing behavior when no epic is provided.
- Acceptance criteria:
  - Epic-filtered runs only pull ready tasks from the target epic.
  - No epic ID provided keeps current behavior.

### Technical Notes & Dependencies
- Dependencies: git (worktrees), Beads CLI, GitHub CLI. All are already available.
- Ralph execution loop lives in `.devagent/plugins/ralph/tools/ralph.sh`.
- Plan-to-Beads conversion guidance is in `.devagent/plugins/ralph/skills/plan-to-beads-conversion/SKILL.md`.

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- Scope focus: Ralph autonomous execution improvements (four must-have enhancements).
- Key assumptions: Manual validation only; no automated tests. No backward-compatibility guarantee required. Use existing git/Beads/GitHub CLI tooling only. Keep changes minimal and aligned with current Ralph patterns.
- Out of scope: New dependencies, CI wiring, formal metrics, Vercel build optimization.

### Implementation Tasks

#### Task 1: Enrich Task Descriptions in Plan-to-Beads Conversion
- **Objective:** Ensure Beads tasks created from plans include actionable context (impacted files/modules, docs/rules references, and testing criteria) to reduce context hunting.
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/skills/plan-to-beads-conversion/SKILL.md`
  - `.devagent/core/templates/plan-document-template.md`
  - `.devagent/plugins/ralph/AGENTS.md` (task context guidance if needed)
- **Dependencies:** None.
- **Acceptance Criteria:**
  - Task descriptions produced by the conversion include objective + impacted files/modules + references + testing criteria.
  - A fallback is defined when the plan lacks structured references (e.g., use standard docs list and quality gates).
  - Plan template explicitly captures the fields needed for enrichment (impacted modules already present; add references/testing notes if required).
- **Subtasks (optional):**
  1. Update the plan template to add a per-task “References” (rules/docs) field if needed to support enrichment.
     - Validation: Confirm template still aligns with existing DevAgent plan usage and remains concise.
  2. Update plan-to-beads conversion guidance to construct a structured description block (Objective, Impacted Modules/Files, References, Testing Criteria).
     - Validation: Parse a sample plan and confirm description format is complete.
  3. Update Ralph task context guidance (if needed) to point agents to enriched task context first.
     - Validation: Read `bd show` output to confirm enriched description is the first thing agents see.
- **Validation Plan:** Manual validation by creating a sample plan and inspecting generated task JSON/output for complete descriptions.

#### Task 2: Add Epic Worktree Setup for Ralph Execution
- **Objective:** Create a dedicated git worktree and branch per epic to isolate autonomous work.
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/tools/ralph.sh`
  - `.devagent/plugins/ralph/workflows/setup-ralph-loop.md`
  - `.devagent/plugins/ralph/workflows/start-ralph-execution.md`
- **Dependencies:** Task 4 (epic filtering) if worktree naming relies on epic ID.
- **Acceptance Criteria:**
  - Ralph creates or reuses an epic-specific worktree path and branch before executing tasks.
  - Execution runs inside the worktree and does not pollute the main working directory.
  - A cleanup path is documented (automatic or manual) for removing worktrees after completion/failure.
- **Subtasks (optional):**
  1. Implement worktree setup logic (branch naming + worktree path conventions).
     - Validation: `git worktree list` shows the epic worktree; execution runs from it.
  2. Document worktree setup/cleanup steps in the Ralph workflows.
     - Validation: Workflow docs describe creation and cleanup steps clearly.
- **Validation Plan:** Manual: run Ralph with a test epic and confirm worktree creation, execution in the new path, and cleanup behavior.

#### Task 3: Automate PR Creation on Cycle Break
- **Objective:** Generate a PR with execution/revise report details whenever Ralph’s execution loop ends (success, failure, blocked, max iterations).
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/tools/ralph.sh`
  - `.devagent/plugins/ralph/workflows/generate-revise-report.md`
  - `.devagent/plugins/ralph/workflows/start-ralph-execution.md` (behavior note)
  - `.devagent/plugins/ralph/AGENTS.md` (if new instructions needed)
- **Dependencies:** Task 2 (worktree branch creation) so PR points to the correct branch.
- **Acceptance Criteria:**
  - On any cycle break, a PR is created via GitHub CLI with a clear status summary.
  - PR body includes an execution summary and links/inline content from the revise report when applicable.
  - Failure states are clearly labeled in the PR title/body.
  - If GitHub CLI auth is missing, the script fails gracefully with actionable guidance.
- **Subtasks (optional):**
  1. Add cycle break reason tracking and summary generation in `ralph.sh`.
     - Validation: Simulate each break condition and confirm summary text.
  2. Invoke revise report generation when the epic is complete; attach its output to the PR.
     - Validation: Report appears in `.devagent/workspace/reviews/` and is referenced in PR body.
  3. Implement `gh pr create` flow with branch push and error handling.
     - Validation: PR created successfully and body includes the report.
- **Validation Plan:** Manual: trigger each cycle break scenario in a sandbox epic and verify PR creation and content.

#### Task 4: Add Epic-Focused Execution Filter
- **Objective:** Allow Ralph to target a single epic by env var and/or CLI flag while preserving default behavior.
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/tools/ralph.sh`
  - `.devagent/plugins/ralph/workflows/start-ralph-execution.md`
- **Dependencies:** None.
- **Acceptance Criteria:**
  - `RALPH_EPIC_ID=<id>` and `--epic <id>` both filter task selection to the epic.
  - When no epic ID is provided, Ralph retains current behavior (all open tasks).
  - Epic status checks continue to guard against blocked/done epics.
- **Subtasks (optional):**
  1. Add CLI parsing for `--epic` and env var fallback.
     - Validation: `ralph.sh --epic bd-xxxx` uses that ID.
  2. Update task selection to filter via `bd list --parent <epic> --status todo --json` (or equivalent).
     - Validation: Only tasks from that epic are selected.
- **Validation Plan:** Manual: run with and without epic ID and confirm task selection behavior.

### Implementation Guidance (Optional)
- **From `.devagent/plugins/ralph/AGENTS.md` → Task Context & Beads Integration:**
  - Read task and epic context via `bd show <task-id> --json` / `bd show <epic-id> --json` and always read referenced plan documents. This should inform how enriched descriptions are structured and what context is surfaced in the task description.
- **From `.devagent/plugins/ralph/AGENTS.md` → Commit Messaging Guidelines:**
  - Use Conventional Commits and reference Beads task IDs in commit subjects/bodies; preserve the Ralph co-author trailer.

### Release & Delivery Strategy (Optional)
- Land changes as a single improvement set; manual validation after each task is sufficient for this testing phase.
- If PR creation relies on GitHub CLI auth, add a short setup note in Ralph docs rather than adding new automation.

---

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Plan documents may not capture structured references for task enrichment | Risk | Implementation | Add per-task references field to plan template; fallback to standard docs list | TBD |
| Worktree cleanup behavior after failures is unclear | Risk | Implementation | Document manual cleanup and optionally add auto-cleanup on success | TBD |
| GitHub CLI auth missing on environments running Ralph | Risk | Implementation | Detect auth and provide clear error message/instructions | TBD |
| Vercel build costs for per-task pushes | Question | Owner | Investigate pricing before enabling per-task pushes | TBD |
| Report timing when epic is incomplete | Question | Owner | Decide whether to include partial summary vs full revise report | TBD |

---

## Progress Tracking
Refer to the AGENTS.md file in the task directory for instructions on tracking and reporting progress during implementation.

---

## Appendices & References (Optional)
- Clarification packet: `.devagent/workspace/tasks/active/2026-01-13_ralph-improvements/clarification/2026-01-13_initial-clarification.md`
- Research packet: `.devagent/workspace/tasks/active/2026-01-13_ralph-improvements/research/2026-01-13_ralph-improvements-research.md`
- Task hub: `.devagent/workspace/tasks/active/2026-01-13_ralph-improvements/AGENTS.md`
- Ralph plugin instructions: `.devagent/plugins/ralph/AGENTS.md`
- Ralph execution loop: `.devagent/plugins/ralph/tools/ralph.sh`
- Ralph workflows: `.devagent/plugins/ralph/workflows/`
- Plan template: `.devagent/core/templates/plan-document-template.md`
