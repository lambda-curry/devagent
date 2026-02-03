# Multi-Project Support for Cross-Project Monitoring Progress Tracker

- Owner: Jake Ruesink
- Last Updated: 2026-01-31
- Status: Draft
- Task Hub: `.devagent/workspace/tasks/active/2026-01-30_multi-project-support/`

## Summary

Explore and implement multi-project support that allows the monitoring app to work with multiple project paths (such as beads and instances) that may be located in different folders across the filesystem. The feature should provide:

1. **Project registration**: Ability to add multiple project paths to the running app, regardless of their filesystem location
2. **Project switching**: A way to switch between individual projects to focus on one at a time
3. **Combined view**: An option to see all projects combined for cross-project monitoring and visibility
4. **Project attribution**: Cards should clearly show which project they belong to, making it obvious at a glance which project each item is associated with

This enables users to monitor multiple codebases or instances from a single app interface while maintaining clear separation and identification of project origin.

## Agent Update Instructions
- Always update "Last Updated" to today's date (ISO: YYYY-MM-DD) when editing this file. **Get the current date by explicitly running `date +%Y-%m-%d` first, then use the output for the "Last Updated" field.**
- Progress Log: Append a new entry at the end in the form `- [YYYY-MM-DD] Event: concise update, links to files`. Do not rewrite or delete prior entries. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- Implementation Checklist: Mark items as `[x]` when complete, `[~]` for partial with a short note. Add new items if discovered; avoid removing items—strike through only when obsolete.
- Key Decisions: Record important decisions as `- [YYYY-MM-DD] Decision: rationale, links`. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- References: Keep links current to latest spec, research, and tasks. Add additional references as they are created.
- Scope: Edits here should reflect coordination/progress only; do not include application code changes. Preserve history.

## Key Decisions
- [2026-01-30] Decision: Task created to explore multi-project support patterns before implementation.

## Progress Log
- [2026-01-30] Task Created: Scaffolded task hub for multi-project monitoring support exploration.
- [2026-01-31] Research: Created research artifact at `research/2026-01-31_multi-project-support-research.md` (config file persistence, DB-by-path refactor, combined view with project attribution).
- [2026-01-31] Plan: Created implementation plan at `plan/2026-01-31_multi-project-support-plan.md` (five implementation tasks: config schema, beads.server refactor, route/API project context, switcher/registration UI, combined view and attribution).

## Implementation Checklist
- [x] Research: Explore existing patterns for multi-project/workspace management
- [x] Design: Define project configuration schema and storage approach (plan Task 1)
- [x] Design: Define UI patterns for project switching and combined views (plan Tasks 4–5)
- [x] Design: Define card attribution display patterns (plan Task 5)

## Open Questions
- How should projects be persisted? (config file, local storage, database)
- Should there be a "default" or "primary" project concept?
- How should the combined view handle conflicts or overlapping data?
- What metadata should be displayed to identify projects on cards?

## References
- `.devagent/workspace/tasks/active/2026-01-30_multi-project-support/plan/2026-01-31_multi-project-support-plan.md` - Implementation plan (freshness: 2026-01-31)
- `.devagent/workspace/tasks/active/2026-01-30_multi-project-support/research/2026-01-31_multi-project-support-research.md` - Research packet: persistence, switching, combined view, attribution (freshness: 2026-01-31)
- `.devagent/workspace/memory/tech-stack.md` - Mentions "Cross-project memory: Shared learnings across multiple codebases" as future roadmap item (freshness: 2026-01-30)
- `.devagent/workspace/product/guiding-questions.md` - Contains open question about Beads multi-repo flow and `BEADS_DIR` semantics (freshness: 2026-01-30)
- `.devagent/workspace/product/roadmap.md` - Mid-term goal includes integrating updates that propagate across projects (freshness: 2026-01-30)
- `.devagent/workspace/product/mission.md` - Core mission around AI workflows and team coordination (freshness: 2026-01-30)

## Next Steps

Recommended follow-up workflows:

1. **Research discovery** - Explore patterns for multi-project/workspace management:
   ```
   devagent research
   ```

2. **Clarify scope** - Refine requirements and answer open questions:
   ```
   devagent clarify-task
   ```

3. **Create implementation plan** - Design the feature after research:
   ```
   devagent create-plan
   ```
