# Ralph Loop Config with Task Setup Progress Tracker

- Owner: Jake Ruesink
- Last Updated: 2026-01-22
- Status: In Progress
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
- [2026-01-22] Decision: Implement config-driven setup as a workflow-driven process (human-in-the-loop) rather than fully automated parsing. Setup workflow generates `loop.json` which is then executed by a script.
- [2026-01-22] Decision: MVP features include JSON Schema validation (Ajv), Template composition (`extends`), Setup/Teardown hooks, Available Agents constraints, and a Template library.
- [2026-01-22] Decision: Store schemas in `.devagent/plugins/ralph/core/`, templates in `.devagent/plugins/ralph/templates/`, and active runs in `.devagent/plugins/ralph/runs/`.
- [2026-01-22] Decision: Use `role` field in schema to map to routing labels (mandatory), keeping `labels` array optional for extra context.

## Progress Log
- [2026-01-22] Event: Completed exploratory brainstorm session generating 8 ideas for config-driven loop setup. Ideas refined through Q&A: JSON schema system, template library, setup/teardown hooks, config composition, available agents array, validation layer, and workflow pipeline. Brainstorm packet: `.devagent/workspace/tasks/active/2026-01-22_ralph-loop-config/brainstorms/2026-01-22_ralph-loop-config-brainstorm.md`
- [2026-01-22] Event: Completed research on implementation details for config-driven loop setup. Investigated JSON schema patterns (Ajv with JSONSchemaType), Beads CLI capabilities, template composition patterns, and script design requirements. Research packet: `.devagent/workspace/tasks/active/2026-01-22_ralph-loop-config/research/2026-01-22_ralph-loop-config-implementation-research.md`
- [2026-01-22] Event: Completed clarification session defining MVP scope, workflow integration, and schema details. Clarification packet: `.devagent/workspace/tasks/active/2026-01-22_ralph-loop-config/clarification/2026-01-22_initial-clarification.md`
- [2026-01-22] Event: Created detailed implementation plan for Ralph Loop Config. Plan: `.devagent/workspace/tasks/active/2026-01-22_ralph-loop-config/plan/2026-01-22_ralph-loop-config-plan.md`
- [2026-01-22] Event: Created Beads Epic `devagent-c687q2` ("Ralph Loop Config Plan") and populated all tasks. Ready for execution.

## Implementation Checklist
- [ ] Task 1: Define Loop Schema & Template Structure (`devagent-c687q2.2`).
- [ ] Task 2: Implement Loop Setup Script (Core Logic) (`devagent-c687q2.3`).
- [ ] Task 3: Integrate with Setup Workflow (`devagent-c687q2.4`).
- [ ] Task 4: Create Standard Templates (`devagent-c687q2.5`).
- [ ] Task 5: Explore Epic Setup & Config Integration (`devagent-c687q2.7`).

## Open Questions
- Question: Jake Ruesink, due date.

## References
- `.devagent/plugins/ralph/workflows/setup-ralph-loop.md` — Current setup workflow that converts plans to Beads tasks (2026-01-22)
- `.devagent/plugins/ralph/tools/config.json` — Existing Ralph configuration file with beads, git, agents, and prompts sections (2026-01-22)
- `.devagent/workspace/tasks/active/2026-01-22_ralph-loop-config/brainstorms/2026-01-22_ralph-loop-config-brainstorm.md` — Brainstorm packet with 8 refined ideas for config-driven loop setup (2026-01-22)
- `.devagent/workspace/tasks/active/2026-01-22_ralph-loop-config/research/2026-01-22_ralph-loop-config-implementation-research.md` — Research packet on JSON schema patterns, Beads CLI capabilities, template composition, and script design (2026-01-22)
- `.devagent/workspace/tasks/active/2026-01-22_ralph-loop-config/clarification/2026-01-22_initial-clarification.md` — Clarification packet defining MVP scope and schema details (2026-01-22)
- `.devagent/workspace/tasks/active/2026-01-22_ralph-loop-config/plan/2026-01-22_ralph-loop-config-plan.md` — Detailed implementation plan (2026-01-22)
- `.devagent/workspace/tasks/active/2026-01-17_extend-task-metadata-for-error-tracking/` — Metadata extension task (dependency for metadata support in schema) (2026-01-22)
- `.devagent/workspace/tasks/active/2026-01-20_pr-epic-run-review-report-slash-command/` — Related work on config-driven loop-wide preamble and PM/coordinator setup tasks (2026-01-22)
- `.devagent/workspace/product/mission.md` — DevAgent product mission and context (2026-01-22)
- `.devagent/workspace/memory/constitution.md` — DevAgent constitution with delivery principles (2026-01-22)

## Next Steps

Recommended follow-up workflows:

1. **Start Execution**: `devagent run start-ralph-execution` (or manual start) — Begin autonomous execution of the created tasks.
