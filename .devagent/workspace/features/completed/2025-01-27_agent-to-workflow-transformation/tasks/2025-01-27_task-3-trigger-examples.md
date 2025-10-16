# Task Prompt File Template

## Metadata
- `task_slug`: task-3-trigger-examples
- `feature_slug`: 2025-01-27_agent-to-workflow-transformation
- `date_generated`: 2025-01-27T00:00Z
- `source_type`: spec
- `source_refs`: [`.devagent/workspace/features/2025-01-27_agent-to-workflow-transformation/spec/2025-01-27_agent-to-workflow-transformation-spec.md`]
- `repo`: devagent
- `base_branch`: main @ 2025-01-27T00:00Z
- `target_branch`: feature/agent-to-workflow-transformation
- `owner`: TaskPromptBuilder

## Product Context
- Problem statement: Users need clear examples and documentation for the new `devagent [workflow-name]` trigger patterns to understand how to use the transformed system.
- Customer impact: Without clear examples, users may struggle to adopt the new workflow syntax and trigger patterns.
- Mission alignment: Create comprehensive documentation that enables smooth user adoption of the new workflow system.

## Research Summary
- Key finding: Users prefer simpler, more descriptive workflow names and consistency in trigger format improves recognition (spec L32-33)
- Additional insight: Models respond better to natural language patterns than hashtag-based triggers (spec L31)

## Task Scope
- Objective: Develop comprehensive examples and documentation for new workflow triggers.
- Out of scope: File transformations, internal reference updates, testing.
- Dependencies: Task 2 completion, workflow structure finalized.

## Implementation Plan
1. **Create individual examples** — Document `devagent [workflow-name]` usage for each of the 10 workflows with at least 3 examples per workflow.
2. **Document workflow chains** — Show how workflows work together in common sequences with examples of multi-workflow sequences.

## Acceptance Criteria
- At least 3 trigger examples per workflow documented
- Examples of multi-workflow sequences created
- Clear usage patterns established
- Documentation review confirms completeness

## Reference Files
- `.devagent/core/workflows/` — Transformed workflow files for reference
- `.devagent/workspace/features/2025-01-27_agent-to-workflow-transformation/tasks/2025-01-27_task-1-core-docs.md` — Workflow naming convention
- `.devagent/workspace/features/2025-01-27_agent-to-workflow-transformation/spec/2025-01-27_agent-to-workflow-transformation-spec.md` — Transformation requirements

## Constraints
- Examples must be practical and realistic
- Must cover all 10 workflows
- Should demonstrate common usage patterns

## Deliverables
1. Individual workflow trigger examples — 3+ examples per workflow
2. Workflow chain documentation — multi-workflow sequence examples
3. Usage documentation — clear patterns and best practices

## Task Pack
| task-id | description | ai_prompt | status | file_hints | context_refs |
| --- | --- | --- | --- | --- | --- |
| task-3-individual | Create individual workflow trigger examples | Create at least 3 practical examples for each of the 10 workflows showing `devagent [workflow-name]` usage. Examples should be realistic, cover different use cases, and demonstrate the natural language trigger pattern. Document each example with context and expected outcome. | done | [`.devagent/core/workflows/`] | [`spec.md#L69-70`, `task-1-core-docs.md`] |
| task-3-chains | Document common workflow chains | Create examples showing how workflows work together in common sequences. Document multi-workflow sequences that users would typically use, showing the flow from one workflow to another. Include examples of complex development scenarios. | done | [`.devagent/core/workflows/`] | [`spec.md#L71-72`, `task-1-core-docs.md`] |

Status values: `planned`, `in_progress`, `blocked`, `ready_for_review`, `done`.

## Status Log
- 2025-01-27T00:00Z — Initial breakdown created.
- 2025-01-27T00:00Z — Task executed: Created comprehensive trigger examples for all 10 workflows and documented common workflow chains with usage patterns.

## Research Links
- `.devagent/workspace/features/2025-01-27_agent-to-workflow-transformation/spec/2025-01-27_agent-to-workflow-transformation-spec.md`
- `.devagent/workspace/features/2025-01-27_agent-to-workflow-transformation/tasks/2025-01-27_task-1-core-docs.md`
