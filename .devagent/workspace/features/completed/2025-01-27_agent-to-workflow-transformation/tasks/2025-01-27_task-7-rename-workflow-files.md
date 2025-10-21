# Task Prompt File Template

## Metadata
- `task_slug`: task-7-rename-workflow-files
- `feature_slug`: 2025-01-27_agent-to-workflow-transformation
- `date_generated`: 2025-01-27T00:00Z
- `source_type`: spec
- `source_refs`: [`.devagent/workspace/features/2025-01-27_agent-to-workflow-transformation/spec/2025-01-27_agent-to-workflow-transformation-spec.md`]
- `repo`: devagent
- `base_branch`: main @ 2025-01-27T00:00Z
- `target_branch`: feature/agent-to-workflow-transformation
- `owner`: TaskPromptBuilder

## Product Context
- Problem statement: Workflow files still use agent-based naming (e.g., BuildAgent.md) which creates confusion and inconsistency with the new workflow-based system.
- Customer impact: Users may be confused by mixed terminology and file names that don't reflect the workflow-based approach.
- Mission alignment: Complete the transformation by renaming workflow files to use action-based naming that reflects their purpose.

## Research Summary
- Key finding: Workflow files need to be renamed from agent names to workflow action names (spec L47)
- Additional insight: Consistent naming convention improves usability and reduces confusion (spec L38)

## Task Scope
- Objective: Rename all workflow files from agent-based names to workflow action-based names.
- Out of scope: Content updates, internal reference fixes, documentation updates.
- Dependencies: Tasks 1-6 completion.

## Implementation Plan
1. **Analyze current workflow files** — Identify all workflow files that need renaming and map them to appropriate action-based names.
2. **Rename workflow files** — Rename files to use action-based naming convention (e.g., BuildAgent.md → BuildWorkflow.md).
3. **Update internal references** — Fix any internal references to the renamed workflow files.

## Acceptance Criteria
- All workflow files renamed to action-based names
- Consistent naming convention applied across all files
- No broken internal references
- File system reflects workflow-based approach

## Reference Files
- `.devagent/core/workflows/` — All workflow files to be renamed
- `.devagent/workspace/features/2025-01-27_agent-to-workflow-transformation/spec/2025-01-27_agent-to-workflow-transformation-spec.md` — Transformation requirements
- `.devagent/workspace/features/2025-01-27_agent-to-workflow-transformation/tasks/2025-01-27_task-1-core-docs.md` — Workflow naming convention

## Constraints
- Must maintain all existing functionality
- Consistent naming convention across all files
- No backwards compatibility needed

## Deliverables
1. Renamed workflow files — all files use action-based naming
2. Updated internal references — no broken links
3. Consistent file structure — reflects workflow-based approach

## Task Pack
| task-id | description | ai_prompt | status | file_hints | context_refs |
| --- | --- | --- | --- | --- | --- |
| task-7-analyze | Analyze current workflow files | Identify all workflow files in `.devagent/core/workflows/` that need renaming. Map each file to its appropriate action-based name (e.g., BuildAgent.md → BuildWorkflow.md). Create a comprehensive list of rename operations needed. | done | [`.devagent/core/workflows/`] | [`spec.md#L47`, `task-1-core-docs.md`] |
| task-7-rename | Rename workflow files | Rename all identified workflow files to use action-based naming convention. Ensure consistent naming across all files and maintain file functionality. Update file names systematically. | done | [`.devagent/core/workflows/`] | [`spec.md#L47`, `task-1-core-docs.md`] |
| task-7-references | Update internal references | Fix any internal references to the renamed workflow files. Update cross-references, links, and mentions to use the new file names. Ensure no broken references remain. | done | [`.devagent/core/workflows/`, `.devagent/core/AGENTS.md`] | [`spec.md#L49`, `task-1-core-docs.md`] |

Status values: `planned`, `in_progress`, `blocked`, `ready_for_review`, `done`.

## Status Log
- 2025-01-27T00:00Z — Initial breakdown created.
- 2025-10-15T00:00Z — Task executed: Analyzed workflow files, renamed to action-based names, updated all references.
- 2025-10-15T00:00Z — Updated workflow names per user request: architect-spec→create-spec, brainstorm-features→brainstorm, build-agent→build-workflow, create-product-mission→update-product-mission, document-tech-stack→update-tech-stack, deploy-codegen-agent→run-codegen-background-agent. Updated all references accordingly.
- 2025-10-15T00:00Z — Full audit completed: Updated all internal workflow references, triggers, and cross-links to use new workflow names and devagent triggers.
- 2025-10-15T00:00Z — Updated UpdateConstitution.md to new workflow format: Renamed to update-constitution.md, updated trigger to devagent update-constitution, and updated all cross-references to other workflows.

## Research Links
- `.devagent/workspace/features/2025-01-27_agent-to-workflow-transformation/spec/2025-01-27_agent-to-workflow-transformation-spec.md`
- `.devagent/workspace/features/2025-01-27_agent-to-workflow-transformation/tasks/2025-01-27_task-1-core-docs.md`
