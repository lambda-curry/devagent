# Consolidate Ralph Plugin Config Files and Add Validation Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-13
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/completed/2026-01-13_ralph-config-consolidation/`
- Stakeholders: Jake Ruesink (Owner, Decision Maker)
- Notes: Plan created from clarification packet at `.devagent/workspace/tasks/completed/2026-01-13_ralph-config-consolidation/clarification/2026-01-13_initial-clarification.md`

---

## PART 1: PRODUCT CONTEXT

### Summary
The Ralph plugin currently uses two config files with a fallback mechanism: a template at `.devagent/plugins/ralph/tools/config.json` and a generated config at `.devagent/plugins/ralph/output/ralph-config.json`. Plugin updates overwrite user-configured settings, which is undesirable. This task consolidates to a single config file at `.devagent/plugins/ralph/tools/config.json`, ensures plugin updates preserve user settings, and adds validation to ensure the config has all required fields before execution.

### Context & Problem
**Current State:**
- Two config file locations exist:
  - Template/base config: `.devagent/plugins/ralph/tools/config.json`
  - Generated config: `.devagent/plugins/ralph/output/ralph-config.json`
- The `ralph.sh` script has a fallback mechanism that checks `config.json` first, then falls back to `output/ralph-config.json`
- Plugin updates overwrite the config file, causing users to lose their configured settings

**User Pain:**
- Developers must understand two config file locations and fallback logic
- Plugin updates destroy user-configured settings (e.g., `ai_tool.name`, `ai_tool.command`, `beads.database_path`)
- No validation ensures required config fields are present before execution, leading to unclear error messages

**Business Trigger:**
This is a maintenance/improvement task to simplify configuration management and prevent accidental overwrites, improving developer experience and reducing support burden.

### Objectives & Success Metrics
**Product Metrics:**
- Metric: Config consolidation and validation implementation
- Baseline: Two config files with fallback mechanism, no validation, plugin updates overwrite user settings
- Target: Single config file at `.devagent/plugins/ralph/tools/config.json` with validation in `ralph.sh`, plugin updates preserve existing config

**Definition of "good enough":**
- Single config file location established
- Validation catches missing required fields and critical nested values (e.g., `ai_tool.name`, `ai_tool.command`)
- Plugin updates preserve existing user config

**What would indicate failure:**
- Config consolidation breaks existing functionality
- Validation doesn't catch missing critical fields
- Plugin updates still overwrite user settings

### Users & Insights
**Primary Users:**
- Developers using the Ralph plugin who need to configure it and maintain their settings across plugin updates

**User Insights:**
- This is a technical maintenance task focused on internal tooling
- The primary beneficiary is developers using the Ralph plugin
- User personas are not applicable in the traditional sense for this task type

### Solution Principles
**Architecture Principles:**
- Config file location: `.devagent/plugins/ralph/tools/config.json` (consolidated location, overwrites template)
- Plugin update behavior: Never overwrite existing config; only create if missing (preserve user settings completely)
- Validation approach: Check that required fields exist AND critical nested fields have non-empty values (e.g., `ai_tool.name`, `ai_tool.command`)

**Quality Bars:**
- Validation must provide clear error messages indicating which fields are missing or invalid
- Script should exit gracefully with non-zero exit code on validation failure
- Must maintain compatibility with existing `ralph.sh` script usage patterns

### Scope Definition
- **In Scope:**
  - Consolidate two config files into one at `.devagent/plugins/ralph/tools/config.json`
  - Remove fallback mechanism from `ralph.sh`
  - Add validation in `ralph.sh` to check required fields and critical nested values
  - Ensure plugin update workflows preserve existing config (never overwrite)
  
- **Out of Scope / Future:**
  - Migration of existing configs (not explicitly required for initial implementation)
  - Full schema validation with type checking and value constraints (deferred to future if needed)
  - Automatic migration from `output/ralph-config.json` to `tools/config.json` (users can manually migrate if needed)

### Functional Narrative

#### Flow: Ralph Plugin Execution with Consolidated Config
- **Trigger:** Developer runs `ralph.sh --epic <epic-id>`
- **Experience narrative:**
  1. Script loads config from `.devagent/plugins/ralph/tools/config.json`
  2. Validation checks that required top-level fields exist (`beads`, `ai_tool`, `quality_gates`, `execution`)
  3. Validation checks that critical nested fields have non-empty values (`ai_tool.name`, `ai_tool.command`)
  4. If validation passes, execution proceeds normally
  5. If validation fails, script exits with clear error message indicating which fields are missing or invalid
- **Acceptance criteria:**
  - `ralph.sh` successfully reads from consolidated config location
  - Validation catches missing `ai_tool.name` or `ai_tool.command` and provides clear error message
  - Script exits gracefully with non-zero exit code on validation failure

#### Flow: Plugin Update Preserves Config
- **Trigger:** Plugin update workflow runs (e.g., `devagent update-devagent`)
- **Experience narrative:**
  1. Plugin update process checks if `.devagent/plugins/ralph/tools/config.json` exists
  2. If config exists, skip overwriting it (preserve user settings)
  3. If config doesn't exist, create it from template
- **Acceptance criteria:**
  - Plugin update mechanism preserves existing config values
  - New installations still get template config created

### Technical Notes & Dependencies
**Current Config Structure:**
```json
{
  "beads": {
    "database_path": ".beads/beads.db",
    "project": "default"
  },
  "ai_tool": {
    "name": "",
    "command": "",
    "env": {}
  },
  "quality_gates": {
    "template": "",
    "overrides": {}
  },
  "execution": {
    "require_confirmation": true,
    "max_iterations": 50
  }
}
```

**Required Fields for Validation:**
- Top-level: `beads`, `ai_tool`, `quality_gates`, `execution`
- Critical nested fields: `ai_tool.name`, `ai_tool.command` (must be non-empty strings)

**Dependencies:**
- Current `ralph.sh` script and config file structure (available)
- Plugin update workflows (need to be updated to preserve config)

**Files Affected:**
- `.devagent/plugins/ralph/tools/ralph.sh` (remove fallback, add validation)
- `.devagent/plugins/ralph/tools/config.json` (consolidated location)
- `.devagent/plugins/ralph/workflows/setup-ralph-loop.md` (update to use consolidated config location, preserve existing config)
- `.devagent/plugins/ralph/workflows/setup-workspace.md` (update config references if needed)
- `.devagent/plugins/ralph/workflows/start-ralph-execution.md` (update config references if needed)

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- **Scope focus:** Config consolidation and validation for Ralph plugin
- **Key assumptions:**
  - No migration needed for existing configs (explicitly out of scope)
  - Current config structure (beads, ai_tool, quality_gates, execution) remains stable
  - Users can manually migrate from `output/ralph-config.json` to `tools/config.json` if needed
- **Out of scope:**
  - Automatic migration of existing configs
  - Full schema validation with type checking and value constraints

### Implementation Tasks

#### Task 1: Update ralph.sh to Use Consolidated Config and Add Validation
- **Objective:** Remove fallback mechanism, use single config location, and add validation for required fields and critical nested values
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/tools/ralph.sh`
- **References:**
  - Clarification packet: `.devagent/workspace/tasks/completed/2026-01-13_ralph-config-consolidation/clarification/2026-01-13_initial-clarification.md`
  - Current config template: `.devagent/plugins/ralph/tools/config.json`
- **Dependencies:** None
- **Acceptance Criteria:**
  - Script loads config from `.devagent/plugins/ralph/tools/config.json` only (no fallback)
  - Validation function checks that required top-level fields exist (`beads`, `ai_tool`, `quality_gates`, `execution`)
  - Validation function checks that `ai_tool.name` and `ai_tool.command` are non-empty strings
  - Validation provides clear error messages indicating which fields are missing or invalid
  - Script exits with non-zero exit code when validation fails
  - Script proceeds normally when validation passes
- **Testing Criteria:**
  - Test with valid config: script should proceed normally
  - Test with missing top-level field: script should exit with error message identifying missing field
  - Test with empty `ai_tool.name`: script should exit with error message
  - Test with empty `ai_tool.command`: script should exit with error message
  - Test with missing config file: script should exit with clear error message
- **Validation Plan:**
  - Manual testing: Create test configs with various invalid states and verify error messages
  - Verify script behavior matches acceptance criteria
  - Test that existing valid configs continue to work

#### Task 2: Update Plugin Workflows to Use Consolidated Config Location
- **Objective:** Update plugin workflows to reference the consolidated config location and ensure plugin updates preserve existing config
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/workflows/setup-ralph-loop.md`
  - `.devagent/plugins/ralph/workflows/setup-workspace.md`
  - `.devagent/plugins/ralph/workflows/start-ralph-execution.md`
  - `.devagent/plugins/ralph/commands/start-ralph-execution.md`
- **References:**
  - Clarification packet: `.devagent/workspace/tasks/completed/2026-01-13_ralph-config-consolidation/clarification/2026-01-13_initial-clarification.md`
  - Current workflow files
- **Dependencies:** Task 1 (ralph.sh changes)
- **Acceptance Criteria:**
  - All workflow documentation references `.devagent/plugins/ralph/tools/config.json` as the config location
  - References to `output/ralph-config.json` are removed or updated
  - `setup-ralph-loop.md` workflow preserves existing config when creating/updating (never overwrites if config exists)
  - Documentation is consistent across all workflow files
- **Testing Criteria:**
  - Review all workflow files for config location references
  - Verify `setup-ralph-loop.md` preserves existing config during plugin updates
  - Test that new installations still create config from template when config doesn't exist
- **Validation Plan:**
  - Manual review of all workflow files
  - Test plugin update scenario: ensure existing config is preserved
  - Test new installation scenario: ensure config is created from template

#### Task 3: Update Documentation and Remove Obsolete References
- **Objective:** Update all documentation to reflect consolidated config location and remove references to obsolete config file
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/AGENTS.md` (if it references config locations)
  - Any other documentation files that reference `output/ralph-config.json`
- **References:**
  - Clarification packet: `.devagent/workspace/tasks/completed/2026-01-13_ralph-config-consolidation/clarification/2026-01-13_initial-clarification.md`
  - Current documentation files
- **Dependencies:** Task 1, Task 2
- **Acceptance Criteria:**
  - All documentation references the consolidated config location (`.devagent/plugins/ralph/tools/config.json`)
  - References to `output/ralph-config.json` are removed or updated
  - Documentation is consistent and accurate
- **Testing Criteria:**
  - Search codebase for references to `ralph-config.json` and verify they're updated or removed
  - Review documentation for accuracy
- **Validation Plan:**
  - Search for all references to old config location
  - Manual review of documentation accuracy
  - Verify no broken references remain

### Implementation Guidance

**From `.devagent/plugins/ralph/AGENTS.md` → Commit Messaging Guidelines:**
- Follow **Conventional Commits v1.0.0** when composing commit messages
- Use appropriate commit type (`feat`, `fix`, `chore`, `refactor`) based on the change
- Default to `[skip ci]` for intermediate commits
- Reference task ID in commit message when applicable

**From `.devagent/plugins/ralph/AGENTS.md` → Quality Gates & Verification:**
- Follow the 7-Point Checklist for task execution
- Self-diagnose verification commands from `package.json`
- Run standard checks (test/lint/typecheck) after implementation
- Add/update tests if logic changed

**From `.devagent/core/AGENTS.md` → Standard Workflow Instructions:**
- Use ISO date format (YYYY-MM-DD) for dated artifacts
- Get current date by running `date +%Y-%m-%d` first
- Follow standard guardrails: prefer authoritative sources, never expose secrets, tag uncertainties

**Bash Script Best Practices:**
- Use `set -e` and `set -o pipefail` for error handling
- Use `jq` for JSON parsing (already used in `ralph.sh`)
- Provide clear error messages with actionable guidance
- Exit with appropriate exit codes (0 for success, non-zero for failure)

### Release & Delivery Strategy
**Milestone 1: Config Consolidation**
- Task 1: Update `ralph.sh` with consolidated config and validation
- Validation: Manual testing with various config states

**Milestone 2: Workflow Updates**
- Task 2: Update plugin workflows to use consolidated config location
- Validation: Review workflow files and test plugin update scenarios

**Milestone 3: Documentation Cleanup**
- Task 3: Update documentation and remove obsolete references
- Validation: Search and review for accuracy

**Launch Readiness:**
- [ ] Config consolidated to single location (`.devagent/plugins/ralph/tools/config.json`)
- [ ] Validation logic added to `ralph.sh` checking required fields and critical nested values
- [ ] Fallback mechanism removed from `ralph.sh`
- [ ] Plugin update mechanism preserves existing config
- [ ] All workflow documentation updated
- [ ] All documentation references updated
- [ ] Manual testing confirms all flows work correctly

---

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Existing users may have config at `output/ralph-config.json` | Risk | Jake Ruesink | Document manual migration steps; not blocking since migration is out of scope | During implementation |
| Validation error messages may need refinement | Question | Jake Ruesink | Can be refined during implementation based on testing | During implementation |
| Plugin update mechanism may need changes beyond workflows | Risk | Jake Ruesink | Review plugin update scripts/processes to ensure config preservation | During Task 2 |

---

## Progress Tracking
Refer to the AGENTS.md file in the task directory (`.devagent/workspace/tasks/completed/2026-01-13_ralph-config-consolidation/AGENTS.md`) for instructions on tracking and reporting progress during implementation.

---

## Appendices & References

### Agent Documentation
- `AGENTS.md` (root): Project-level agent context
- `.devagent/core/AGENTS.md`: Standard workflow instructions
- `.devagent/plugins/ralph/AGENTS.md`: Ralph plugin instructions and commit guidelines

### Task Artifacts
- **Clarification Packet:** `.devagent/workspace/tasks/completed/2026-01-13_ralph-config-consolidation/clarification/2026-01-13_initial-clarification.md`
- **Task Hub:** `.devagent/workspace/tasks/completed/2026-01-13_ralph-config-consolidation/AGENTS.md`

### Related Files
- **Config Template:** `.devagent/plugins/ralph/tools/config.json`
- **Ralph Script:** `.devagent/plugins/ralph/tools/ralph.sh`
- **Plugin Workflows:**
  - `.devagent/plugins/ralph/workflows/setup-ralph-loop.md`
  - `.devagent/plugins/ralph/workflows/setup-workspace.md`
  - `.devagent/plugins/ralph/workflows/start-ralph-execution.md`
- **Plugin Commands:**
  - `.devagent/plugins/ralph/commands/start-ralph-execution.md`

### Constitution References
- **C2. Chronological Task Artifacts:** This plan follows ISO-date prefix convention
- **C3. Delivery Principles:** Implementation tasks are execution-focused with concrete deliverables

---
