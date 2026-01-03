# Task Prompt File Template

## Metadata
- `task_slug`: task-4-internal-refs
- `feature_slug`: 2025-01-27_agent-to-workflow-transformation
- `date_generated`: 2025-01-27T00:00Z
- `source_type`: spec
- `source_refs`: [`.devagent/workspace/features/2025-01-27_agent-to-workflow-transformation/spec/2025-01-27_agent-to-workflow-transformation-spec.md`]
- `repo`: devagent
- `base_branch`: main @ 2025-01-27T00:00Z
- `target_branch`: feature/agent-to-workflow-transformation
- `owner`: TaskPromptBuilder

## Product Context
- Problem statement: Internal references throughout the codebase need to be updated to point to the new workflow structure instead of the old agent structure.
- Customer impact: Broken references would cause confusion and potential system failures when users try to access workflows.
- Mission alignment: Ensure all internal references point to new workflow structure for consistency and reliability.

## Research Summary
- Key finding: Internal reference updates missed could cause system failures (spec L104)
- Additional insight: Comprehensive audit and automated checks needed to ensure no references are missed (spec L104)

## Task Scope
- Objective: Ensure all internal references point to new workflow structure with no broken links.
- Out of scope: File transformations, documentation updates, testing.
- Dependencies: Tasks 1-3 completion.

## Implementation Plan
1. **Audit references** — Find all references to old agent names throughout the codebase using search tools.
2. **Update references** — Fix all identified references to point to new workflow names.
3. **Validate consistency** — Ensure terminology is consistent across all files with no mixed usage.

## Acceptance Criteria
- Complete list of files needing reference updates documented
- All references point to new workflow names
- No mixed terminology (agents vs workflows) found
- Automated reference checking confirms no broken links

## Reference Files
- `.devagent/workspace/features/2025-01-27_agent-to-workflow-transformation/tasks/2025-01-27_task-1-core-docs.md` — Workflow naming convention
- `.devagent/workspace/features/2025-01-27_agent-to-workflow-transformation/tasks/2025-01-27_task-2-transform-files.md` — Transformed workflow files
- `.devagent/workspace/features/2025-01-27_agent-to-workflow-transformation/spec/2025-01-27_agent-to-workflow-transformation-spec.md` — Transformation requirements

## Constraints
- Must find all references to old agent names
- No references can be missed
- Terminology must be consistent throughout

## Deliverables
1. Reference audit report — complete list of files needing updates
2. Updated reference files — all references fixed
3. Consistency validation — no mixed terminology

## Task Pack
| task-id | description | ai_prompt | status | file_hints | context_refs |
| --- | --- | --- | --- | --- | --- |
| task-4-audit | Audit all internal references | Search the entire codebase for references to old agent names using grep/search tools. Look for hashtag references, file paths, and any mentions of agent names. Create a comprehensive list of all files that need reference updates. | done | [`AGENTS.md`, `.devagent/`] | [`spec.md#L81-82`, `task-1-core-docs.md`] |
| task-4-update | Update reference files | Fix all identified references to point to new workflow names. Update file paths, mentions, and any other references found in the audit. Ensure all references are consistent with the new workflow naming convention. | done | [`AGENTS.md`, `.devagent/`] | [`spec.md#L83`, `task-1-core-docs.md`] |
| task-4-validate | Validate consistency | Check that terminology is consistent across all files. Ensure no mixed usage of "agents" vs "workflows" terminology. Run automated checks to confirm no broken references remain. | done | [`AGENTS.md`, `.devagent/`] | [`spec.md#L84`, `task-1-core-docs.md`] |

Status values: `planned`, `in_progress`, `blocked`, `ready_for_review`, `done`.

## Status Log
- 2025-01-27T00:00Z — Initial breakdown created.
- 2025-10-15T00:00Z — Task execution completed: audited references, updated files (AGENTS.md, README.md, docs/codegen-quick-reference.md), validated consistency.

## Research Links
- `.devagent/workspace/features/2025-01-27_agent-to-workflow-transformation/spec/2025-01-27_agent-to-workflow-transformation-spec.md`
- `.devagent/workspace/features/2025-01-27_agent-to-workflow-transformation/tasks/2025-01-27_task-1-core-docs.md`
