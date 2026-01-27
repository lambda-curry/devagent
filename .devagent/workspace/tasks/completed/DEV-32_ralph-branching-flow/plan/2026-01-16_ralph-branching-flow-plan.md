# Ralph Branching Flow Simplification Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-16
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/completed/DEV-32_ralph-branching-flow/`
- Stakeholders: Jake Ruesink (Owner, Decision Maker)
- Notes: Removes setup and final review agents from Ralph execution flow. Adds explicit git branch configuration.

---

## PART 1: PRODUCT CONTEXT

### Summary
Simplify Ralph's execution flow by removing the setup and final review agents, moving branch configuration into `config.json`, and validating Epic/branch state directly in `ralph.sh`. This reduces branch creation failures and makes branch context explicit for users running Ralph. The setup workflow (`setup-ralph-loop`) configures required git settings in `config.json` but does not create or switch branches.

### Context & Problem
The current setup agent creates or switches branches and validates epics before the main loop starts. This agent has been a frequent failure point (branch creation errors, unclear failure handling) and is invoked without explicit failure gating. The final review agent is also auto-invoked via a trap, adding complexity and PR automation that is not required for the simplified flow. Research and clarification confirm that removing these agents and moving branch configuration into `config.json` is the preferred simplification path. References: `.devagent/workspace/tasks/completed/DEV-32_ralph-branching-flow/research/2026-01-16_ralph-branching-flow-research.md`, `.devagent/workspace/tasks/completed/DEV-32_ralph-branching-flow/clarification/2026-01-16_initial-clarification.md`.

### Objectives & Success Metrics
- `config.json` contains a required `git` section with `base_branch` and `working_branch`.
- `ralph.sh` fails fast with clear errors if the git config is missing, the working branch is missing, or the current branch does not match.
- Setup agent invocation and final review trap are removed from `ralph.sh`.
- Epic validation is performed directly in `ralph.sh` (simple `bd show` check).
- `setup-ralph-loop` writes the required `git` config fields while preserving existing config settings (no branch creation/switching).

### Users & Insights
Primary users are developers/operators running Ralph. The setup agent's branch creation has been unreliable (GitHub errors and worktree conflicts), and the trap-based final review adds complexity without clear value for this flow. Explicit configuration and fail-fast validation improves reliability and debuggability.

### Solution Principles
- **Simplicity:** Remove agent invocations; use direct validation.
- **Explicit Configuration:** Require branch settings in config.
- **Fail Fast:** Clear error messages for missing config or invalid branch state.
- **Manual Control:** Users control branch creation; setup only writes git config fields.

### Scope Definition
- **In Scope:** Required `git` config section, `ralph.sh` validation updates, removal of setup/final-review agent invocations, setup/start workflow updates, documentation updates.
- **Out of Scope / Future:** Automatic PR creation or summary generation, workspace cleanup automation, backward compatibility shims beyond clear migration notes.

### Functional Narrative
#### Flow: Direct Ralph Execution
- Trigger: User runs `.devagent/plugins/ralph/tools/ralph.sh --epic <id>`
- Experience narrative: Script loads config, validates required git section, validates Epic via `bd show`, ensures working branch exists and matches current branch, then begins the execution loop without setup/final review agents.
- Acceptance criteria: Errors are explicit and fail fast; branch validation replaces the previous “not on main” check.

#### Flow: Setup Ralph Loop
- Trigger: User runs `devagent setup-ralph-loop <plan-path>`
- Experience narrative: Workflow creates tasks and writes the `git` config fields in Step 7. The user is responsible for creating/switching to the working branch before starting Ralph.
- Acceptance criteria: `config.json` includes `git` section after Step 7; start workflow validates that the working branch exists and is checked out.

### Technical Notes & Dependencies
- Requires Beads CLI for Epic validation (`bd show`).
- Relies on `git` CLI for branch existence/current branch checks.
- Migration: Existing configs must be updated with `git` section; `setup-ralph-loop` populates this for new runs.

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- Scope focus: Ralph plugin configuration + execution flow simplification.
- Key assumptions: `git` section is required; failures on missing config are acceptable; users will create/switch branches before running Ralph.
- Out of scope: Restoring or refactoring setup/final review agent logic.

### Implementation Tasks

#### Task 1: Add git configuration to Ralph config template
- **Objective:** Update the shared config template to include required git branch settings.
- **Impacted Modules/Files:** `.devagent/plugins/ralph/tools/config.json`
- **References:** `.devagent/workspace/tasks/completed/DEV-32_ralph-branching-flow/research/2026-01-16_ralph-branching-flow-research.md`
- **Dependencies:** None
- **Acceptance Criteria:**
  - `config.json` includes `git.base_branch` and `git.working_branch` fields with sample values.
  - Added fields are documented in the template without removing existing config sections.
- **Testing Criteria:**
  - Manual inspection of config template for correct schema and no regression to existing sections.
- **Validation Plan:**
  - Verify template contains the `git` section and preserves existing config structure.

#### Task 2: Simplify `ralph.sh` flow and add branch + Epic validation
- **Objective:** Remove setup/final-review agent invocations and validate Epic/branch state directly in `ralph.sh`.
- **Impacted Modules/Files:** `.devagent/plugins/ralph/tools/ralph.sh`
- **References:** `.devagent/workspace/tasks/completed/DEV-32_ralph-branching-flow/research/2026-01-16_ralph-branching-flow-research.md`, `.devagent/workspace/tasks/completed/DEV-32_ralph-branching-flow/clarification/2026-01-16_initial-clarification.md`
- **Dependencies:** Task 1 (config template available)
- **Acceptance Criteria:**
  - Setup agent invocation (around lines 91-96) is removed.
  - Final review trap (around lines 114-124) is removed.
  - `validate_config` fails if `git`, `git.base_branch`, or `git.working_branch` are missing.
  - Script fails fast with clear errors if `working_branch` does not exist or current branch does not match.
  - Epic validation occurs directly via `bd show <epic-id> --json` and fails if not found.
  - Main-branch safety check is replaced by working-branch validation.
- **Testing Criteria:**
  - Manual runs with: missing git section, missing branch, wrong branch, and valid branch scenarios.
  - Manual check that Epic validation fails for a bogus Epic ID.
- **Validation Plan:**
  - Run `./.devagent/plugins/ralph/tools/ralph.sh --epic <invalid>` to confirm Epic error.
  - Run with a config missing `git` to confirm config validation error.
  - Run on wrong branch to confirm branch mismatch error.

#### Task 3: Update setup-ralph-loop Step 7 to write git config (no branch creation)
- **Objective:** Ensure `setup-ralph-loop` writes `git` config during setup (without creating/switching branches).
- **Impacted Modules/Files:** `.devagent/plugins/ralph/workflows/setup-ralph-loop.md`
- **References:** `.devagent/workspace/tasks/completed/DEV-32_ralph-branching-flow/clarification/2026-01-16_initial-clarification.md`
- **Dependencies:** Task 1 (config template updated)
- **Acceptance Criteria:**
  - Step 7 does not create or switch branches.
  - Step 7 shows adding/updating the `git` section in `config.json` while preserving existing settings.
  - Step 7 makes it explicit that `git.working_branch` must already exist and must be checked out before starting Ralph.
- **Testing Criteria:**
  - Manual walkthrough of the workflow to verify the written instructions cover branch creation and config update.
- **Validation Plan:**
  - Review Step 7 content to ensure it matches clarification requirements.

#### Task 4: Update Ralph documentation to reflect simplified flow
- **Objective:** Align Ralph docs with the new configuration and flow (no setup/final review agents).
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/AGENTS.md`
  - `.devagent/plugins/ralph/workflows/start-ralph-execution.md`
  - `.devagent/plugins/ralph/workflows/setup-ralph-loop.md`
- **References:** `.devagent/workspace/tasks/completed/DEV-32_ralph-branching-flow/clarification/2026-01-16_initial-clarification.md`
- **Dependencies:** Tasks 1-3
- **Acceptance Criteria:**
  - Flow diagram and narrative remove setup/final review agent invocation.
  - Documentation describes required git config and branch validation expectations.
  - Start/execute docs reference the new config requirements and branch setup flow.
- **Testing Criteria:**
  - Manual doc review for consistency and accurate references.
- **Validation Plan:**
  - Spot-check updated docs for removed agent references and correct branch naming.

### Implementation Guidance (Optional)
- **From `.devagent/workspace/tasks/completed/DEV-32_ralph-branching-flow/clarification/2026-01-16_initial-clarification.md` → Implementation Approach:**
  - Required git config (`base_branch`, `working_branch`), fail-fast validation, remove setup/final review agents, update setup-ralph-loop Step 7 to write git config fields (no branch creation).
- **From `.devagent/plugins/ralph/tools/ralph.sh` (current flow):**
  - Remove setup agent invocation at lines 91-96 and final review trap at lines 114-124; replace main-branch safety check at lines 137-143 with working-branch validation.

---

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Existing configs missing `git` section will fail after update | Risk | Jake Ruesink | Document migration path and ensure setup-ralph-loop populates git config fields for new runs | TBD |
| Removal of final review agent drops PR automation and summaries | Risk | Jake Ruesink | Document manual review steps in docs; consider optional manual workflow | TBD |
| Branch validation in worktrees could block legitimate flows if config mismatched | Risk | Jake Ruesink | Provide explicit error messaging and clear remediation steps | TBD |

---

## Progress Tracking
Refer to the AGENTS.md file in the task directory for instructions on tracking and reporting progress during implementation.

---

## Appendices & References (Optional)
- `.devagent/workspace/tasks/completed/DEV-32_ralph-branching-flow/clarification/2026-01-16_initial-clarification.md`
- `.devagent/workspace/tasks/completed/DEV-32_ralph-branching-flow/research/2026-01-16_ralph-branching-flow-research.md`
- `.devagent/plugins/ralph/tools/ralph.sh`
- `.devagent/plugins/ralph/tools/config.json`
- `.devagent/plugins/ralph/workflows/setup-ralph-loop.md`
