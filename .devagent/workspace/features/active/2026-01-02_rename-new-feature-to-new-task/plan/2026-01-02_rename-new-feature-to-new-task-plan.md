# Rename New Feature to New Task Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-02
- Status: Draft
- Related Feature Hub: `.devagent/workspace/features/active/2026-01-02_rename-new-feature-to-new-task/`
- Stakeholders: Jake Ruesink (Developer, Decision Authority)
- Notes: Internal tooling rename; no external user impact. Sources: `.devagent/workspace/features/active/2026-01-02_rename-new-feature-to-new-task/clarification/2026-01-02_initial-clarification.md`, `.devagent/workspace/product/mission.md`.

---

## PART 1: PRODUCT CONTEXT

### Summary
Rename the DevAgent workflow from "new-feature" to "new-task" so the command better reflects that it scaffolds work items of any type. The change preserves existing workflow behavior while eliminating outdated naming across docs and command interfaces.

### Context & Problem
The current "new-feature" label implies a narrow scope, even though the workflow creates general-purpose work item hubs. This mismatch causes ambiguity in usage and documentation. The clarification packet confirms the rename is complete in most places and emphasizes a full-reference sweep with no functional regressions. See `.devagent/workspace/features/active/2026-01-02_rename-new-feature-to-new-task/clarification/2026-01-02_initial-clarification.md`.

### Objectives & Success Metrics
- **Objective:** All references updated from "new-feature" to "new-task" with no broken links.
  - Baseline: Existing references included "new-feature" in workflow and docs.
  - Target: Zero remaining "new-feature" references and all links resolve.
- **Objective:** Workflow behavior remains identical after rename.
  - Baseline: "new-feature" workflow scaffolds feature hubs.
  - Target: "new-task" workflow scaffolds the same structure with no errors.

### Users & Insights
- Primary users: DevAgent developers using the workflow roster for internal tooling (see `.devagent/workspace/product/mission.md`).
- Insight: Naming clarity improves adoption and reduces confusion when selecting workflows.

### Solution Principles
- Preserve existing workflow behavior; rename only.
- Keep documentation and command interfaces consistent with workflow names.
- No backward-compatibility alias required.

### Scope Definition
- **In Scope:** Workflow rename, command and symlink updates, documentation references, and validation.
- **Out of Scope / Future:** Additional workflow features, backward-compat aliases, or new command semantics.

### Functional Narrative
#### Workflow Invocation
- Trigger: Developer invokes the `new-task` workflow.
- Experience narrative: The workflow scaffolds the standard feature hub directory structure and metadata, matching the prior "new-feature" behavior.
- Acceptance criteria: Command runs without errors and produces the expected folders/files; no "new-feature" references remain in generated output or documentation.

### Technical Notes & Dependencies
- No external dependencies; changes are confined to repo docs and workflow definitions.

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- Scope focus: Validation and any remaining reference clean-up post-rename.
- Key assumptions: Prior rename work is complete; remaining work is verification-focused.
- Out of scope: New workflow features or backwards compatibility.

### Implementation Tasks

#### Task 1: Validate end-to-end `new-task` workflow behavior
- **Objective:** Confirm the `new-task` workflow definition and command wiring reflect the expected hub scaffolding behavior (workflow invocation, not a CLI).
- **Impacted Modules/Files:** `.devagent/core/workflows/new-task.md`, `.agents/commands/new-task.md`, `.cursor/commands/new-task.md`, `.devagent/workspace/features/active/2026-01-02_rename-new-feature-to-new-task/`
- **Dependencies:** None.
- **Acceptance Criteria:**
  - Workflow definition and command wiring reflect the standard hub structure with no errors or mismatches.
  - Generated output (when invoked via workflow) does not contain "new-feature" references.
- **Validation Plan:** Review `.devagent/core/workflows/new-task.md`, `.agents/commands/new-task.md`, and `.cursor/commands/new-task.md` for correctness; if execution is available in your agent environment, run the workflow in a scratch location and spot-check outputs.

#### Task 2: Sweep for remaining "new-feature" references and remediate
- **Objective:** Ensure all documentation and workflow references align with "new-task".
- **Impacted Modules/Files:** `.devagent/core/AGENTS.md`, `.agents/commands/README.md`, `README.md`, root `AGENTS.md`, any docs referencing the workflow roster.
- **Dependencies:** Task 1 (to confirm runtime behavior before doc updates).
- **Acceptance Criteria:**
  - No remaining "new-feature" references in repository content.
  - All references point to the "new-task" workflow name.
- **Validation Plan:** Re-run repository-wide search for "new-feature"; confirm no matches or update any that remain.

---

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| CLI or scripts still reference "new-feature" internally | Risk | Jake Ruesink | Validate by reviewing workflow/command definitions and scanning for legacy references | 2026-01-02 |

---

## Progress Tracking
Refer to the AGENTS.md file in the feature directory for instructions on tracking and reporting progress during implementation.

---

## Appendices & References (Optional)
- Clarification: `.devagent/workspace/features/active/2026-01-02_rename-new-feature-to-new-task/clarification/2026-01-02_initial-clarification.md`
- Product mission: `.devagent/workspace/product/mission.md`
