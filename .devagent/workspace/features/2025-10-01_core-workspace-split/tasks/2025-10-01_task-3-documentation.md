# Task 3: Documentation Updates

## Metadata
- `task_slug`: task-3-documentation
- `feature_slug`: 2025-10-01_core-workspace-split
- `date_generated`: 2025-10-01T00:00:00Z
- `source_type`: spec
- `source_refs`: [`.devagent/features/2025-10-01_core-workspace-split/spec/2025-10-01_core-workspace-split-spec.md`, `.devagent/features/2025-10-01_core-workspace-split/tasks/2025-10-01_implementation-plan.md`]
- `repo`: devagent
- `base_branch`: feature/core-workspace-split @ 2025-10-01T00:00Z
- `target_branch`: feature/core-workspace-split
- `owner`: @jaruesink

## Product Context
- **Problem:** New `core/workspace` structure needs documentation to enable easy setup and onboarding
- **Impact:** Without clear setup guide, developers won't understand how to use the portable core kit in new projects
- **Mission alignment:** Documentation enables the "5-minute setup" goal for cross-project DevAgent adoption

## Research Summary
- **Setup flow:** Spec defines Flow 1 (Initialize DevAgent in New Project) with clear steps for copying core and initializing workspace
- **Documentation pattern:** core/README.md contains portable kit documentation, root README explains project-specific usage
- **Agent roster:** AGENTS.md needs path updates and should be part of portable core kit

## Task Scope
- **Objective:** Create core/README.md with setup guide, update AGENTS.md with new paths, update root README, and fix template self-references
- **Out of scope:** Migration guides for existing projects, validation testing (Task 4)
- **Dependencies:** Tasks 1-2 complete — structure exists and agent paths are updated

## Implementation Plan
1. **Update AGENTS.md** — Change all agent path references from `.devagent/agents/...` to `.devagent/core/agents/...`
2. **Create core/README.md** — Document how to copy `core/` into new projects and initialize `workspace/`, include directory structure diagram and setup steps
3. **Handle AGENTS.md portability** — Copy AGENTS.md to `core/AGENTS.md` for portability, update root AGENTS.md to reference core version or remove it
4. **Update root README.md** — Add section explaining `core/` vs `workspace/` distinction and link to `core/README.md`
5. **Update template self-references** — Fix file path placeholders in templates to reference workspace/ for outputs and core/ for template sources

## Acceptance Criteria
- [ ] AGENTS.md updated with all agent paths using `core/agents/` (10 agent references)
- [ ] `core/README.md` created with setup instructions, directory structure diagram, and initialization checklist
- [ ] `core/AGENTS.md` exists (copy of agent roster for portability)
- [ ] Root `README.md` explains core/ vs workspace/ distinction and links to core/README.md
- [ ] Template self-references updated (e.g., task-plan-template.md line 8 references workspace/ for file location)
- [ ] Documentation review shows no broken links or outdated paths

## Reference Files
- `AGENTS.md` — Lines 18-27 contain agent path references to update
- `/Users/jaruesink/projects/devagent/README.md` — Root README to update
- `.devagent/core/templates/task-plan-template.md` — Line 8 contains file location pattern
- `.devagent/features/2025-10-01_core-workspace-split/spec/2025-10-01_core-workspace-split-spec.md` — Lines 87-103 (Flow 1: Initialize DevAgent) for setup guide content
- `.devagent/features/2025-10-01_core-workspace-split/spec/2025-10-01_core-workspace-split-spec.md` — Lines 138-195 for directory structure diagram

## Constraints
- Keep setup instructions clear and under 5 minutes to execute
- Documentation should be self-contained in core/ for portability
- Maintain consistency with spec terminology (core = portable, workspace = project-specific)
- No migration guide content (out of scope per simplified plan)

## Deliverables
1. **Updated AGENTS.md** — All paths use core/agents/
2. **core/README.md** — Complete setup guide with structure diagram
3. **core/AGENTS.md** — Portable agent roster copy
4. **Updated root README.md** — Explains new structure
5. **Updated templates** — Self-references use correct paths

## Task Pack
| task-id | description | ai_prompt | status | file_hints | context_refs |
| --- | --- | --- | --- | --- | --- |
| task-3-1 | Update AGENTS.md paths | In `AGENTS.md`, replace all agent path references from `.devagent/agents/` to `.devagent/core/agents/`. Update lines 18-27 specifically. All 10 agent references should use the new core/agents/ path pattern. | planned | [`AGENTS.md`] | [`implementation-plan.md#L117-120`] |
| task-3-2 | Create core/README.md | Create `.devagent/core/README.md` with: (1) Introduction to DevAgent core kit, (2) Directory structure diagram from spec lines 138-195, (3) Setup steps from spec Flow 1 (lines 87-103): copy core/ to project, create workspace/ skeleton, customize workspace/product/mission.md, invoke first agent, (4) Usage notes, (5) Changelog/version section placeholder. Target: 5-minute setup time. | planned | [`.devagent/core/README.md`] | [`spec.md#L87-103`, `spec.md#L138-195`, `implementation-plan.md#L121-124`] |
| task-3-3 | Copy AGENTS.md to core | Copy `AGENTS.md` to `.devagent/core/AGENTS.md` to make agent roster part of portable kit. Update root `AGENTS.md` to either: (a) redirect to core/AGENTS.md with a note, or (b) remove it if duplication isn't needed. Decision: keep root AGENTS.md updated to reference core version. | planned | [`AGENTS.md`, `.devagent/core/AGENTS.md`] | [`implementation-plan.md#L125-127`] |
| task-3-4 | Update root README.md | In `/Users/jaruesink/projects/devagent/README.md`, add a section explaining the new structure: (1) Overview of core/ vs workspace/ distinction, (2) Link to `.devagent/core/README.md` for setup guide, (3) Brief explanation that core/ is portable kit and workspace/ is project-specific. Keep existing content, add new section. | planned | [`README.md`] | [`implementation-plan.md#L128-130`] |
| task-3-5 | Update template self-references | Update file path placeholders in all templates under `.devagent/core/templates/`. For example, `task-plan-template.md` line 8 should reference `workspace/features/` for output locations. Templates should instruct users to write outputs to workspace/ paths, not to templates/ or agents/. Check all 10 template files. | planned | [`.devagent/core/templates/*.md`] | [`implementation-plan.md#L131-134`] |
| task-3-6 | Validate documentation | Review all created/updated documentation files: (1) Check for broken links, (2) Verify all paths use core/ or workspace/ conventions, (3) Ensure setup instructions are clear and actionable, (4) Confirm no references to old flat .devagent/ structure remain. Dry-run setup instructions mentally to verify <5 minute target. | planned | [`.devagent/core/README.md`, `AGENTS.md`, `README.md`, `.devagent/core/templates/`] | [`implementation-plan.md#L135`] |

## Status Log
- 2025-10-01T00:00Z — Initial task breakdown by #TaskPromptBuilder

## Research Links
- `.devagent/features/2025-10-01_core-workspace-split/spec/2025-10-01_core-workspace-split-spec.md` — Setup flow (lines 87-103), directory structure (lines 138-195)
- `.devagent/features/2025-10-01_core-workspace-split/tasks/2025-10-01_implementation-plan.md` — Task 3 details (lines 112-135)

