# Task Prompt File Template

## Metadata
- `task_slug`: task-1-core-docs
- `feature_slug`: 2025-01-27_agent-to-workflow-transformation
- `date_generated`: 2025-01-27T00:00Z
- `source_type`: spec
- `source_refs`: [`.devagent/workspace/features/2025-01-27_agent-to-workflow-transformation/spec/2025-01-27_agent-to-workflow-transformation-spec.md`]
- `repo`: devagent
- `base_branch`: main @ 2025-01-27T00:00Z
- `target_branch`: feature/agent-to-workflow-transformation
- `owner`: TaskPromptBuilder

## Product Context
- Problem statement: Current DevAgent system uses hashtag triggers (`#AgentName`) that models don't consistently recognize, requiring users to say "devagent" at the beginning to trigger proper execution. This creates friction and reduces effectiveness.
- Customer impact: Users experience unreliable agent triggering, leading to inconsistent workflow execution and reduced productivity.
- Mission alignment: Transform to workflow-based system using `devagent [workflow-name]` triggers for improved model recognition and usability.

## Research Summary
- Key finding: Models respond better to natural language patterns than hashtag-based triggers (spec L31-34)
- Additional insight: Users prefer simpler, more descriptive workflow names and consistency in trigger format improves recognition (spec L32-33)

## Task Scope
- Objective: Transform AGENTS.md from agent-based to workflow-based structure with clear trigger patterns.
- Out of scope: Actual agent file transformations, internal reference updates, testing.
- Dependencies: Spec approval, current AGENTS.md analysis.

## Implementation Plan
1. **Analyze current structure** — Review existing agent descriptions and trigger patterns in AGENTS.md, inventory all 10 agents and their current descriptions.
2. **Design naming convention** — Create intuitive, descriptive workflow names that are clear and memorable, map each agent to appropriate workflow name.
3. **Update documentation** — Replace agent-based content with workflow-based content, include clear examples of `devagent [workflow-name]` usage patterns.

## Acceptance Criteria
- Complete inventory of current agents and their descriptions documented
- 10 workflow names that are clear and memorable designed
- AGENTS.md reflects new workflow approach with examples
- Manual review confirms completeness and clarity

## Reference Files
- `AGENTS.md` — Current agent documentation to transform
- `.devagent/workspace/features/2025-01-27_agent-to-workflow-transformation/spec/2025-01-27_agent-to-workflow-transformation-spec.md` — Transformation specification
- `.devagent/core/workflows/` — Agent files to understand current structure

## Constraints
- Must maintain all existing agent functionality
- Workflow names must be intuitive and descriptive
- No backwards compatibility needed

## Deliverables
1. Updated `AGENTS.md` — transformed to workflow-based structure
2. Workflow naming convention document — clear mapping of agents to workflows

## Task Pack
| task-id | description | ai_prompt | status | file_hints | context_refs |
| --- | --- | --- | --- | --- | --- |
| task-1-analyze | Analyze current AGENTS.md structure | Read AGENTS.md and inventory all 10 agents with their descriptions. Document current hashtag trigger patterns and usage examples. Create a comprehensive list of what needs to be transformed. | done | [`AGENTS.md`] | [`spec.md#L16`, `AGENTS.md`] |
| task-1-design | Design workflow naming convention | Create intuitive workflow names for all 10 agents. Names should be descriptive, memorable, and follow consistent patterns. Map each agent to its workflow name and document the naming rationale. | done | [`AGENTS.md`] | [`spec.md#L37-38`] |
| task-1-update | Update AGENTS.md with workflow structure | Transform AGENTS.md content from agent-based to workflow-based approach. Replace hashtag triggers with `devagent [workflow-name]` examples. Include clear usage patterns and maintain all functionality descriptions. | done | [`AGENTS.md`] | [`spec.md#L41-42`, `AGENTS.md`] |

Status values: `planned`, `in_progress`, `blocked`, `ready_for_review`, `done`.

## Status Log
- 2025-01-27T00:00Z — Initial breakdown created.
- 2025-01-27T00:00Z — Task executed: Analyzed AGENTS.md, designed workflow names, updated documentation with workflow-based structure.

## Research Links
- `.devagent/workspace/features/2025-01-27_agent-to-workflow-transformation/spec/2025-01-27_agent-to-workflow-transformation-spec.md`
- `.devagent/workspace/features/2025-01-27_agent-to-workflow-transformation/tasks/2025-01-27_agent-to-workflow-transformation-tasks.md`
