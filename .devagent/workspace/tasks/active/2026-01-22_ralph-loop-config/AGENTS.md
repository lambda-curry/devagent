# Ralph Loop Config with Task Setup Progress Tracker

- Owner: Jake Ruesink
- Last Updated: 2026-01-22
- Status: Draft
- Task Hub: `.devagent/workspace/tasks/active/2026-01-22_ralph-loop-config/`

## Summary

Create a config-driven approach for Ralph loop setup that enables building Beads tasks programmatically from structured data (using JSON schema). This will improve task preparation for epics by allowing repeatable task loops, consistent setupTasks and teardownTasks that can be configured to always run before and after loops, and reusable templates. For example, a generic ralph loop could always have a setup task that gets a PR ready at the beginning and a teardown task that prepares the final review and does a final check of the project. We could also have pre-defined loops for common patterns like exploring a new task, which could be used without modification or with slight customization. This config-driven approach will make Ralph loops more repeatable, consistent, and easier to configure for different use cases.

## Agent Update Instructions
- Always update "Last Updated" to today's date (ISO: YYYY-MM-DD) when editing this file. **Get the current date by explicitly running `date +%Y-%m-%d` first, then use the output for the "Last Updated" field.**
- Progress Log: Append a new entry at the end in the form `- [YYYY-MM-DD] Event: concise update, links to files`. Do not rewrite or delete prior entries. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- Implementation Checklist: Mark items as `[x]` when complete, `[~]` for partial with a short note. Add new items if discovered; avoid removing items—strike through only when obsolete.
- Key Decisions: Record important decisions as `- [YYYY-MM-DD] Decision: rationale, links`. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- References: Keep links current to latest spec, research, and tasks. Add additional references as they are created.
- Scope: Edits here should reflect coordination/progress only; do not include application code changes. Preserve history.

## Key Decisions
- [Date] Decision: Description, rationale, links to supporting docs.

## Progress Log
- [2026-01-22] Event: Completed exploratory brainstorm session generating 8 ideas for config-driven loop setup. Ideas refined through Q&A: JSON schema system, template library, setup/teardown hooks, config composition, available agents array, validation layer, and workflow pipeline. Brainstorm packet: `.devagent/workspace/tasks/active/2026-01-22_ralph-loop-config/brainstorms/2026-01-22_ralph-loop-config-brainstorm.md`
- [2026-01-22] Event: Completed research on implementation details for config-driven loop setup. Investigated JSON schema patterns (Ajv with JSONSchemaType), Beads CLI capabilities, template composition patterns, and script design requirements. Research packet: `.devagent/workspace/tasks/active/2026-01-22_ralph-loop-config/research/2026-01-22_ralph-loop-config-implementation-research.md`
(Append new entries here, preserving historical entries to maintain a progress timeline.)

## Implementation Checklist
- [ ] Task 1: Description, link to task plan if available. (Updated by agents: [x] completed, [~] partial progress with note.)
- [ ] Task 2: Description.

## Open Questions
- Question: Owner, due date.

## References
- `.devagent/plugins/ralph/workflows/setup-ralph-loop.md` — Current setup workflow that converts plans to Beads tasks (2026-01-22)
- `.devagent/plugins/ralph/tools/config.json` — Existing Ralph configuration file with beads, git, agents, and prompts sections (2026-01-22)
- `.devagent/workspace/tasks/active/2026-01-22_ralph-loop-config/brainstorms/2026-01-22_ralph-loop-config-brainstorm.md` — Brainstorm packet with 8 refined ideas for config-driven loop setup (2026-01-22)
- `.devagent/workspace/tasks/active/2026-01-22_ralph-loop-config/research/2026-01-22_ralph-loop-config-implementation-research.md` — Research packet on JSON schema patterns, Beads CLI capabilities, template composition, and script design (2026-01-22)
- `.devagent/workspace/tasks/active/2026-01-17_extend-task-metadata-for-error-tracking/` — Metadata extension task (dependency for metadata support in schema) (2026-01-22)
- `.devagent/workspace/tasks/active/2026-01-20_pr-epic-run-review-report-slash-command/` — Related work on config-driven loop-wide preamble and PM/coordinator setup tasks (2026-01-22)
- `.devagent/workspace/tasks/active/2026-01-19_utilize-all-agents-well/` — Related work on setup-ralph-loop workflow improvements and design task creation (2026-01-22)
- `.devagent/workspace/tests/ralph-e2e/expectations/expectations.md` — Expectations document that mentions PM/coordinator setup tasks (2026-01-22)
- `.devagent/workspace/product/mission.md` — DevAgent product mission and context (2026-01-22)
- `.devagent/workspace/memory/constitution.md` — DevAgent constitution with delivery principles (2026-01-22)

## Next Steps

Recommended follow-up workflows:

1. **Clarify scope**: `devagent clarify-task` — Define the exact schema structure, identify what's already started, and clarify requirements for setupTasks, teardownTasks, and templates.

2. **Research discovery**: `devagent research` — Investigate JSON schema patterns, existing config structures, and how to integrate with the current setup-ralph-loop workflow.

3. **Create plan**: `devagent create-plan` — Develop an implementation plan for the config-driven loop setup with task templates and structured data support.
