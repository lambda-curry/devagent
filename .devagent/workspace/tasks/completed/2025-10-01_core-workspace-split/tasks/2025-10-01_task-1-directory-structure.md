# Task 1: Directory Structure & File Moves

## Metadata
- `task_slug`: task-1-directory-structure
- `feature_slug`: 2025-10-01_core-workspace-split
- `date_generated`: 2025-10-01T00:00:00Z
- `source_type`: spec
- `source_refs`: [`.devagent/features/2025-10-01_core-workspace-split/spec/2025-10-01_core-workspace-split-spec.md`, `.devagent/features/2025-10-01_core-workspace-split/tasks/2025-10-01_implementation-plan.md`]
- `repo`: devagent
- `base_branch`: feature/core-workspace-split @ 2025-10-01T00:00Z
- `target_branch`: feature/core-workspace-split
- `owner`: @jaruesink

## Product Context
- **Problem:** Current `.devagent/` structure mixes reusable agent kit with project-specific artifacts, creating setup friction for new projects
- **Impact:** Developers struggle to identify what to copy vs. customize when starting new DevAgent projects, slowing adoption
- **Mission alignment:** Enables "30-day adoption" mission metric by making DevAgent setup under 5 minutes

## Research Summary
- **Structural pattern:** Follows Rails (`lib/` vs `app/`), Next.js (`node_modules/` vs `src/`), and similar framework/project separation patterns
- **User feedback:** Explicit request for "a folder I can copy and paste into any project" — freshness: current conversation (2025-10-01)
- **Risk mitigation:** Clean-cut approach removes backwards compatibility complexity

## Task Scope
- **Objective:** Create new `core/` and `workspace/` directory structure and relocate all files from flat `.devagent/` to appropriate subdirectories per spec
- **Out of scope:** Path reference updates in agent files (Task 2), documentation creation (Task 3), validation testing (Task 4)
- **Dependencies:** None — this is the foundational task that enables all subsequent work

## Implementation Plan
1. **Create top-level directories** — Make `.devagent/core/` and `.devagent/workspace/` directories
2. **Create core subdirectories** — Make `core/agents/`, `core/agents/codegen/`, `core/templates/`, `core/templates/feature-hub-template/`, and subdirectories for feature hub template
3. **Create workspace subdirectories** — Make `workspace/product/`, `workspace/memory/`, `workspace/memory/_archive/`, `workspace/features/`, `workspace/research/`, `workspace/tasks/`
4. **Move agent files** — Move all 12 agent `.md` files from `.devagent/agents/` to `.devagent/core/agents/`, preserving `codegen/` subdirectory structure
5. **Move template files** — Move all 10 template files from `.devagent/templates/` to `.devagent/core/templates/`
6. **Move feature hub template** — Move `.devagent/features/_template/` to `.devagent/core/templates/feature-hub-template/` (reusable scaffold belongs in core)
7. **Move workspace artifacts** — Move `product/`, `memory/`, `features/` (excluding `_template`), and `research/` to `workspace/` subdirectories
8. **Clean up old directories** — Remove empty `.devagent/agents/`, `.devagent/templates/`, `.devagent/product/`, `.devagent/memory/`, `.devagent/features/`, `.devagent/research/`
9. **Validate structure** — Run `tree .devagent -L 3` or `ls -R .devagent` to confirm structure matches spec diagram

## Acceptance Criteria
- [ ] `.devagent/core/` and `.devagent/workspace/` directories exist
- [ ] All 12 agent files present in `core/agents/` (including `codegen/CodegenBackgroundAgent.md`)
- [ ] All 10 template files present in `core/templates/`
- [ ] Feature hub template at `core/templates/feature-hub-template/` with README.md, research/, spec/ subdirectories
- [ ] All product files (mission.md, roadmap.md, guiding-questions.md) in `workspace/product/`
- [ ] All memory files (constitution.md, decision-journal.md, tech-stack.md, overview.md, _archive/) in `workspace/memory/`
- [ ] All feature hubs in `workspace/features/` (excluding _template which is now in core)
- [ ] All research files in `workspace/research/`
- [ ] Old directories removed — only `core/` and `workspace/` exist under `.devagent/`
- [ ] Directory structure matches spec lines 138-195

## Reference Files
- `.devagent/agents/` — Source for 12 agent files to move
  - AgentBuilder.md, FeatureBrainstormAgent.md, FeatureClarifyAgent.md, ProductMissionPartner.md, ResearchAgent.md, SpecArchitect.md, TaskExecutor.md, TaskPlanner.md, TaskPromptBuilder.md, TechStackAgent.md, UpdateConstitution.md, codegen/CodegenBackgroundAgent.md
- `.devagent/templates/` — Source for 10 template files to move
  - agent-brief-template.md, brainstorm-packet-template.md, clarification-packet-template.md, clarification-questions-framework.md, constitution-template.md, research-packet-template.md, spec-document-template.md, task-plan-template.md, task-prompt-template.md, tech-stack-template.md
- `.devagent/features/_template/` — Feature hub template to move to core
- `.devagent/product/`, `.devagent/memory/`, `.devagent/features/`, `.devagent/research/` — Workspace artifacts to relocate

## Constraints
- Preserve all file contents exactly — this is a pure move operation with no content changes
- Maintain subdirectory structure (e.g., `codegen/` under agents, `_archive/` under memory)
- Do not update any path references in files yet — that's Task 2
- Current feature hub (2025-10-01_core-workspace-split) should move to workspace/features/

## Deliverables
1. **New directory structure** — `core/` and `workspace/` with all subdirectories created
2. **Relocated agent files** — 12 files in `core/agents/`
3. **Relocated templates** — 10 files in `core/templates/` plus feature-hub-template/ subdirectory
4. **Relocated workspace artifacts** — All project-specific files in `workspace/` subdirectories
5. **Clean state** — Old flat directories removed

## Task Pack
| task-id | description | ai_prompt | status | file_hints | context_refs |
| --- | --- | --- | --- | --- | --- |
| task-1-1 | Create directory structure | Create `.devagent/core/` and `.devagent/workspace/` directories, then create all required subdirectories: `core/agents/`, `core/agents/codegen/`, `core/templates/`, `core/templates/feature-hub-template/`, `core/templates/feature-hub-template/research/`, `core/templates/feature-hub-template/spec/`, `workspace/product/`, `workspace/memory/`, `workspace/memory/_archive/`, `workspace/features/`, `workspace/research/`, `workspace/tasks/`. Verify each directory exists after creation. | planned | [`.devagent/core/`, `.devagent/workspace/`] | [`spec.md#L138-195`] |
| task-1-2 | Move agent files to core | Move all 12 agent files from `.devagent/agents/` to `.devagent/core/agents/`: AgentBuilder.md, FeatureBrainstormAgent.md, FeatureClarifyAgent.md, ProductMissionPartner.md, ResearchAgent.md, SpecArchitect.md, TaskExecutor.md, TaskPlanner.md, TaskPromptBuilder.md, TechStackAgent.md, UpdateConstitution.md. Move `codegen/CodegenBackgroundAgent.md` to `core/agents/codegen/CodegenBackgroundAgent.md`. Preserve file contents exactly. | planned | [`.devagent/agents/*.md`, `.devagent/core/agents/*.md`] | [`implementation-plan.md#L41-43`] |
| task-1-3 | Move template files to core | Move all 10 template files from `.devagent/templates/` to `.devagent/core/templates/`: agent-brief-template.md, brainstorm-packet-template.md, clarification-packet-template.md, clarification-questions-framework.md, constitution-template.md, research-packet-template.md, spec-document-template.md, task-plan-template.md, task-prompt-template.md, tech-stack-template.md. Preserve file contents exactly. | planned | [`.devagent/templates/*.md`, `.devagent/core/templates/*.md`] | [`implementation-plan.md#L44-46`] |
| task-1-4 | Move feature hub template to core | Move `.devagent/features/_template/` directory to `.devagent/core/templates/feature-hub-template/`. This includes README.md and empty research/ and spec/ subdirectories. The feature hub template is a reusable scaffold and belongs in the portable core kit. | planned | [`.devagent/features/_template/`, `.devagent/core/templates/feature-hub-template/`] | [`implementation-plan.md#L47-50`, `spec.md#L165-168`] |
| task-1-5 | Move workspace artifacts | Move project-specific directories to workspace: `.devagent/product/` → `.devagent/workspace/product/`, `.devagent/memory/` → `.devagent/workspace/memory/`, `.devagent/features/` → `.devagent/workspace/features/` (excluding _template which is already moved), `.devagent/research/` → `.devagent/workspace/research/`. Preserve all subdirectories and files exactly. Note: Current feature hub (2025-10-01_core-workspace-split) moves to workspace/features/. | planned | [`.devagent/product/`, `.devagent/memory/`, `.devagent/features/`, `.devagent/research/`, `.devagent/workspace/`] | [`implementation-plan.md#L51-63`] |
| task-1-6 | Clean up old directories | Delete empty old directories: `.devagent/agents/`, `.devagent/templates/`, `.devagent/product/`, `.devagent/memory/`, `.devagent/features/`, `.devagent/research/`. Only `core/` and `workspace/` should remain under `.devagent/`. Verify with `ls .devagent` showing only core/ and workspace/. | planned | [`.devagent/agents/`, `.devagent/templates/`, `.devagent/product/`, `.devagent/memory/`, `.devagent/features/`, `.devagent/research/`] | [`implementation-plan.md#L64-65`] |
| task-1-7 | Validate structure | Run `tree .devagent -L 3` or `ls -R .devagent` and compare output against spec diagram (lines 138-195). Verify all files moved correctly, no files lost, subdirectory structure preserved. Count agent files (should be 12), template files (should be 10), and check feature hub template location. | planned | [`.devagent/`] | [`spec.md#L138-195`, `implementation-plan.md#L66`] |

## Status Log
- 2025-10-01T00:00Z — Initial task breakdown by #TaskPromptBuilder

## Research Links
- `.devagent/features/2025-10-01_core-workspace-split/spec/2025-10-01_core-workspace-split-spec.md` — Full specification with directory structure diagram
- `.devagent/features/2025-10-01_core-workspace-split/tasks/2025-10-01_implementation-plan.md` — Complete implementation plan with all 4 tasks

