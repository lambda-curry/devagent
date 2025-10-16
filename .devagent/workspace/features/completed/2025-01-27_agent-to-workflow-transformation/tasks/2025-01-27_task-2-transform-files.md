# Task Prompt File Template

## Metadata
- `task_slug`: task-2-transform-files
- `feature_slug`: 2025-01-27_agent-to-workflow-transformation
- `date_generated`: 2025-01-27T00:00Z
- `source_type`: spec
- `source_refs`: [`.devagent/workspace/features/2025-01-27_agent-to-workflow-transformation/spec/2025-01-27_agent-to-workflow-transformation-spec.md`]
- `repo`: devagent
- `base_branch`: main @ 2025-01-27T00:00Z
- `target_branch`: feature/agent-to-workflow-transformation
- `owner`: TaskPromptBuilder

## Product Context
- Problem statement: Agent files need to be transformed from agent-based format to workflow-based format to match the new trigger system.
- Customer impact: Users will interact with workflows instead of agents, requiring file structure and content updates.
- Mission alignment: Complete transformation of all 10 existing agents to workflows while maintaining functional parity.

## Research Summary
- Key finding: All existing agent functionality must be preserved during transformation (spec L20)
- Additional insight: File contents need to be updated to reflect workflow approach and terminology (spec L47-48)

## Task Scope
- Objective: Rename and update all agent files to workflow format with updated content.
- Out of scope: Documentation updates, testing, internal reference fixes.
- Dependencies: Task 1 completion, workflow naming convention from Task 1.

## Implementation Plan
1. **Rename files** — Update all 10 agent file names in `.devagent/core/workflows/` to use workflow naming convention.
2. **Update content** — Modify each file's content to use workflow terminology instead of agent terminology.
3. **Fix references** — Update internal cross-references between workflow files to ensure consistency.

## Acceptance Criteria
- All 10 agent files renamed with consistent workflow naming
- All files reference workflows instead of agents
- No broken internal references between files
- File system check confirms successful renaming

## Reference Files
- `.devagent/core/workflows/` — All agent files to be transformed
- `.devagent/workspace/features/2025-01-27_agent-to-workflow-transformation/tasks/2025-01-27_task-1-core-docs.md` — Workflow naming convention
- `.devagent/workspace/features/2025-01-27_agent-to-workflow-transformation/spec/2025-01-27_agent-to-workflow-transformation-spec.md` — Transformation requirements

## Constraints
- Must maintain all existing functionality
- Consistent naming convention across all files
- No backwards compatibility needed

## Deliverables
1. Renamed workflow files — all 10 files with new names
2. Updated file contents — workflow terminology throughout
3. Fixed internal references — no broken links

## Task Pack
| task-id | description | ai_prompt | status | file_hints | context_refs |
| --- | --- | --- | --- | --- | --- |
| task-2-rename | Rename agent files to workflow names | Rename all files in `.devagent/core/workflows/` directory to use workflow naming convention. Update file names consistently across all 10 agent files. Ensure naming follows the convention established in Task 1. | planned | [`.devagent/core/workflows/`] | [`spec.md#L46-47`, `task-1-core-docs.md`] |
| task-2-content | Update file contents for workflow approach | Modify each workflow file's content to use workflow terminology instead of agent terminology. Update descriptions, instructions, and examples to reflect the new workflow-based approach while preserving all functionality. | planned | [`.devagent/core/workflows/`] | [`spec.md#L48`, `task-1-core-docs.md`] |
| task-2-references | Update internal cross-references | Fix all internal references between workflow files to ensure consistency. Update any cross-references, links, or mentions of other workflows to use the new naming convention. | planned | [`.devagent/core/workflows/`] | [`spec.md#L49`, `task-1-core-docs.md`] |

Status values: `planned`, `in_progress`, `blocked`, `ready_for_review`, `done`.

## Status Log
- 2025-01-27T00:00Z — Initial breakdown created.

## Research Links
- `.devagent/workspace/features/2025-01-27_agent-to-workflow-transformation/spec/2025-01-27_agent-to-workflow-transformation-spec.md`
- `.devagent/workspace/features/2025-01-27_agent-to-workflow-transformation/tasks/2025-01-27_task-1-core-docs.md`
