# Ralph Monitoring Dashboard Enhancements

- Owner: Jake
- Last Updated: 2026-01-30
- Status: Active
- Task Hub: `.devagent/workspace/tasks/active/2026-01-30_ralph-monitoring-dashboard-enhancements/`

## Summary

Enhance the ralph-monitoring React Router app with three major features to transform it from a task viewer into a comprehensive loop management dashboard:

1. **Epic Progress Dashboard** — A dedicated epic-level view showing loop progress with timing analytics, success rates, estimated time remaining, and historical comparisons.

2. **Loop Control Panel** — Start, configure, and control Ralph loops directly from the UI. Includes execution mode toggles, skip/retry tasks, pause functionality, and live config adjustments.

3. **Agent Activity Timeline** — Chronological timeline visualization showing agent work across tasks with duration, outcomes, and key events. Supports filtering by agent type and time range.

**Current State:** The app has a task list view (index), task detail view with logs/comments, and basic stop functionality. These features will add epic-level orchestration, loop control, and cross-task visibility.

## Agent Update Instructions
- Always update "Last Updated" to today's date (ISO: YYYY-MM-DD) when editing this file.
- Progress Log: Append new entries at the end in the form `- [YYYY-MM-DD] Event: concise update, links to files`.
- Implementation Checklist: Mark items as `[x]` when complete, `[~]` for partial with a short note.
- Key Decisions: Record important decisions as `- [YYYY-MM-DD] Decision: rationale, links`.
- References: Keep links current to latest spec, research, and tasks.

## Key Decisions
- [2026-01-30] Decision: Scope includes all three features (Epic Progress, Loop Control, Timeline) as a unified dashboard enhancement project.

## Progress Log
- [2026-01-30] Task hub created. Branch: `feature/ralph-monitoring-dashboard-enhancements`. Next: research workflow.
- [2026-01-30] Research completed: Analyzed architecture, identified data gaps, evaluated chart libraries. See `research/2026-01-30_dashboard-architecture-research.md`.
- [2026-01-30] Plan created: 4-phase implementation with 10 tasks. See `plan/2026-01-30_dashboard-enhancements-plan.md`.

## Implementation Checklist
- [ ] Research: Analyze existing ralph-monitoring architecture and identify integration points
- [ ] Research: Review Ralph loop execution flow and data available for dashboards
- [ ] Research: Explore timeline/chart libraries compatible with React 19 + Tailwind
- [ ] Plan: Create detailed implementation plan with phased delivery
- [ ] Feature 1: Epic Progress Dashboard
- [ ] Feature 2: Loop Control Panel
- [ ] Feature 3: Agent Activity Timeline

## Open Questions
- What data does Ralph currently expose for loop execution timing?
- Should loop control use WebSockets for real-time updates or polling?
- Timeline library preference (recharts, visx, custom SVG)?

## References
- **Research:** `research/2026-01-30_dashboard-architecture-research.md`
- **Plan:** `plan/2026-01-30_dashboard-enhancements-plan.md`
- App location: `apps/ralph-monitoring/`
- App AGENTS.md: `apps/ralph-monitoring/AGENTS.md`
- Design system: `apps/ralph-monitoring/docs/design-language.md`
- Existing routes: `_index.tsx` (task list), `tasks.$taskId.tsx` (detail)
