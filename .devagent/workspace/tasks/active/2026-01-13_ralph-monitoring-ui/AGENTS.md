# Ralph Monitoring UI [DERIVED]

- Owner: Jake Ruesink
- Last Updated: 2026-01-14
- Status: Draft
- Task Hub: `.devagent/workspace/tasks/active/2026-01-13_ralph-monitoring-ui/`

## Summary
Develop a dedicated monitoring UI for Ralph using a new React Router 7 app informed by `mantoni/beads-ui` patterns. The UI will visualize active agents, stream real-time execution logs (via `ralph.sh` output piping), and provide stop controls for human intervention.

## Agent Update Instructions
- Always update "Last Updated" to today's date (ISO: YYYY-MM-DD) when editing this file.
- Progress Log: Append a new entry at the end in the form `- [YYYY-MM-DD] Event: concise update, links to files`.
- Key Decisions: Record important decisions as `- [YYYY-MM-DD] Decision: rationale, links`.

## Progress Log
- [2026-01-13] Event: Task Hub scaffolded (split from combined task). Context migrated from `2026-01-13_ralph-quality-gates-and-monitoring-ui`.
- [2026-01-14] Event: Created MVP implementation plan (`plan/2026-01-14_ralph-monitoring-ui-mvp-plan.md`).

## Key Decisions
- [2026-01-14] Decision: MVP plan targets a new React Router 7 app with SSE log streaming and stop controls, plus task-specific log capture in `ralph.sh` (see `plan/2026-01-14_ralph-monitoring-ui-mvp-plan.md`).

## Implementation Checklist
- [ ] Task 1: Fork `mantoni/beads-ui` and analyze codebase.
- [ ] Task 2: Implement task-specific log streaming in `ralph.sh` and the UI.
- [ ] Task 3: Implement intervention (stop/pause) mechanisms.
- [x] Task 4: Create Plan for UI implementation.

## References
- Research: `research/2026-01-13_ralph-monitoring-ui-research.md`
- Plan: `plan/2026-01-14_ralph-monitoring-ui-mvp-plan.md`
- External: `mantoni/beads-ui` (GitHub)
- Script: `.devagent/plugins/ralph/tools/ralph.sh`
