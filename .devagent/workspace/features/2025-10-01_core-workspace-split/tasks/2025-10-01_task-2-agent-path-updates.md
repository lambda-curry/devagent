# Task 2: Agent Path Reference Updates

## Metadata
- `task_slug`: task-2-agent-path-updates
- `feature_slug`: 2025-10-01_core-workspace-split
- `date_generated`: 2025-10-01T00:00:00Z
- `source_type`: spec
- `source_refs`: [`.devagent/features/2025-10-01_core-workspace-split/spec/2025-10-01_core-workspace-split-spec.md`, `.devagent/features/2025-10-01_core-workspace-split/tasks/2025-10-01_implementation-plan.md`]
- `repo`: devagent
- `base_branch`: feature/core-workspace-split @ 2025-10-01T00:00Z
- `target_branch`: feature/core-workspace-split
- `owner`: @jaruesink

## Product Context
- **Problem:** Agent instruction sheets contain 79+ hardcoded path references to old flat `.devagent/` structure
- **Impact:** After file moves (Task 1), agents will reference non-existent paths, breaking all workflows
- **Mission alignment:** Ensures portable `core/` kit and project-specific `workspace/` paths work correctly for cross-project adoption

## Research Summary
- **Scope identified:** Grep detected 79 path references across 12 agent files requiring updates
- **Pattern consistency:** All references follow one of two patterns: templates (`core/`) or working artifacts (`workspace/`)
- **Validation approach:** Automated grep validation confirms no old patterns remain post-update

## Task Scope
- **Objective:** Update all path references in 12 agent instruction sheets to use new `core/` and `workspace/` directory conventions
- **Out of scope:** Documentation updates (Task 3), template file updates (Task 3.5), validation testing (Task 4)
- **Dependencies:** Task 1 complete — files must be in new locations before updating references to them

## Implementation Plan
1. **Update each agent file systematically** — Go through all 12 agent files and replace path patterns:
   - `.devagent/agents/` → `.devagent/core/agents/`
   - `.devagent/templates/` → `.devagent/core/templates/`
   - `.devagent/product/` → `.devagent/workspace/product/`
   - `.devagent/memory/` → `.devagent/workspace/memory/`
   - `.devagent/features/` → `.devagent/workspace/features/`
   - `.devagent/research/` → `.devagent/workspace/research/`
2. **Preserve agent logic** — Only update paths, do not modify agent workflow logic or instructions
3. **Handle special cases** — Feature hub template now at `core/templates/feature-hub-template/`, not `workspace/features/_template/`
4. **Validate with grep** — Run grep search to confirm no old path patterns remain in agent files

## Acceptance Criteria
- [ ] All 12 agent files updated with new path references
- [ ] AgentBuilder.md references `core/agents/`, `core/templates/`
- [ ] ProductMissionPartner.md references `workspace/product/`, `workspace/memory/`
- [ ] ResearchAgent.md references `core/templates/`, `workspace/research/`, `workspace/features/`
- [ ] SpecArchitect.md, TaskPlanner.md, TaskExecutor.md, TaskPromptBuilder.md reference `core/templates/`, `workspace/features/`
- [ ] TechStackAgent.md references `core/templates/`, `workspace/memory/`
- [ ] UpdateConstitution.md references `workspace/memory/`
- [ ] CodegenBackgroundAgent.md references `core/templates/`, `workspace/features/`
- [ ] FeatureBrainstormAgent.md and FeatureClarifyAgent.md reference `core/templates/`, `workspace/features/`
- [ ] Grep validation: `grep -r "\.devagent/\(agents\|templates\|features\|memory\|product\|research\)" .devagent/core/agents/` returns no matches (or only acceptable documentation references)
- [ ] No agent logic modified — only path strings updated

## Reference Files
- `.devagent/core/agents/AgentBuilder.md` — Lines 19, 26 contain path references
- `.devagent/core/agents/ProductMissionPartner.md` — Lines 18, 24-28 contain path references
- `.devagent/core/agents/ResearchAgent.md` — Lines 15-18 contain path references
- `.devagent/core/agents/TaskPlanner.md` — Lines 14-17 contain path references
- `.devagent/core/agents/TaskPromptBuilder.md` — Lines 14-16 contain path references
- `.devagent/core/agents/TechStackAgent.md` — Line 29 contains path references
- `.devagent/core/agents/FeatureBrainstormAgent.md` — Multiple path references
- `.devagent/core/agents/FeatureClarifyAgent.md` — Multiple path references
- `.devagent/core/agents/SpecArchitect.md` — Multiple path references
- `.devagent/core/agents/TaskExecutor.md` — Multiple path references
- `.devagent/core/agents/UpdateConstitution.md` — Multiple path references
- `.devagent/core/agents/codegen/CodegenBackgroundAgent.md` — Multiple path references

## Constraints
- Only update path strings — preserve all other content exactly
- Maintain line structure and formatting — don't reformat files
- Update all instances consistently — no mixed old/new paths in single file
- Path updates follow spec conventions (lines 199-207)

## Deliverables
1. **12 updated agent files** — All path references use `core/` or `workspace/` conventions
2. **Grep validation pass** — No old path patterns detected
3. **Preserved agent logic** — All workflow instructions unchanged

## Task Pack
| task-id | description | ai_prompt | status | file_hints | context_refs |
| --- | --- | --- | --- | --- | --- |
| task-2-1 | Update AgentBuilder.md | In `.devagent/core/agents/AgentBuilder.md`, replace `.devagent/agents/` with `.devagent/core/agents/`, `.devagent/templates/` with `.devagent/core/templates/`, and `.devagent/product/` with `.devagent/workspace/product/`. Check lines 19 and 26 specifically. Replace all instances consistently. | planned | [`.devagent/core/agents/AgentBuilder.md`] | [`implementation-plan.md#L73-76`] |
| task-2-2 | Update FeatureBrainstormAgent.md | In `.devagent/core/agents/FeatureBrainstormAgent.md`, replace template paths with `core/templates/` and feature hub paths with `workspace/features/`. Preserve all workflow logic. | planned | [`.devagent/core/agents/FeatureBrainstormAgent.md`] | [`implementation-plan.md#L77-79`] |
| task-2-3 | Update FeatureClarifyAgent.md | In `.devagent/core/agents/FeatureClarifyAgent.md`, replace template paths with `core/templates/` and feature hub paths with `workspace/features/`. Preserve all workflow logic. | planned | [`.devagent/core/agents/FeatureClarifyAgent.md`] | [`implementation-plan.md#L80-82`] |
| task-2-4 | Update ProductMissionPartner.md | In `.devagent/core/agents/ProductMissionPartner.md`, replace `.devagent/product/` with `.devagent/workspace/product/` and `.devagent/memory/` with `.devagent/workspace/memory/`. Check lines 18 and 24-28 specifically. | planned | [`.devagent/core/agents/ProductMissionPartner.md`] | [`implementation-plan.md#L83-85`] |
| task-2-5 | Update ResearchAgent.md | In `.devagent/core/agents/ResearchAgent.md`, replace `.devagent/templates/` with `.devagent/core/templates/`, `.devagent/research/` with `.devagent/workspace/research/`, and `.devagent/features/` with `.devagent/workspace/features/`. Check lines 15-18 specifically. | planned | [`.devagent/core/agents/ResearchAgent.md`] | [`implementation-plan.md#L86-88`] |
| task-2-6 | Update SpecArchitect.md | In `.devagent/core/agents/SpecArchitect.md`, replace template paths with `core/templates/` and feature hub paths with `workspace/features/`. Preserve all workflow logic. | planned | [`.devagent/core/agents/SpecArchitect.md`] | [`implementation-plan.md#L89-91`] |
| task-2-7 | Update TaskPlanner.md | In `.devagent/core/agents/TaskPlanner.md`, replace `.devagent/templates/` with `.devagent/core/templates/` and `.devagent/features/` with `.devagent/workspace/features/`. Check lines 14-17 specifically. | planned | [`.devagent/core/agents/TaskPlanner.md`] | [`implementation-plan.md#L92-94`] |
| task-2-8 | Update TaskExecutor.md | In `.devagent/core/agents/TaskExecutor.md`, replace `.devagent/features/` with `.devagent/workspace/features/` for all feature hub and task references. | planned | [`.devagent/core/agents/TaskExecutor.md`] | [`implementation-plan.md#L95-97`] |
| task-2-9 | Update TaskPromptBuilder.md | In `.devagent/core/agents/TaskPromptBuilder.md`, replace `.devagent/templates/` with `.devagent/core/templates/` and `.devagent/features/` with `.devagent/workspace/features/`. Check lines 14-16 specifically. Note: This file was already updated earlier, verify changes are correct. | planned | [`.devagent/core/agents/TaskPromptBuilder.md`] | [`implementation-plan.md#L98-100`] |
| task-2-10 | Update TechStackAgent.md | In `.devagent/core/agents/TechStackAgent.md`, replace `.devagent/templates/` with `.devagent/core/templates/` and `.devagent/memory/` with `.devagent/workspace/memory/`. Check line 29 specifically. | planned | [`.devagent/core/agents/TechStackAgent.md`] | [`implementation-plan.md#L101-103`] |
| task-2-11 | Update UpdateConstitution.md | In `.devagent/core/agents/UpdateConstitution.md`, replace `.devagent/memory/` with `.devagent/workspace/memory/` for all constitution and decision journal references. | planned | [`.devagent/core/agents/UpdateConstitution.md`] | [`implementation-plan.md#L104-106`] |
| task-2-12 | Update CodegenBackgroundAgent.md | In `.devagent/core/agents/codegen/CodegenBackgroundAgent.md`, replace template paths with `core/templates/` and feature hub paths with `workspace/features/`. Preserve all API integration logic. | planned | [`.devagent/core/agents/codegen/CodegenBackgroundAgent.md`] | [`implementation-plan.md#L107-109`] |
| task-2-13 | Validate with grep | Run `grep -r "\.devagent/\(agents\|templates\|features\|memory\|product\|research\)" .devagent/core/agents/` to verify no old path patterns remain. Only acceptable matches should be in documentation or examples explicitly showing migration. Any other matches indicate missed updates. | planned | [`.devagent/core/agents/`] | [`implementation-plan.md#L110`] |

## Status Log
- 2025-10-01T00:00Z — Initial task breakdown by #TaskPromptBuilder

## Research Links
- `.devagent/features/2025-10-01_core-workspace-split/spec/2025-10-01_core-workspace-split-spec.md` — Path reference conventions (lines 199-207)
- `.devagent/features/2025-10-01_core-workspace-split/tasks/2025-10-01_implementation-plan.md` — Task 2 details (lines 68-110)

