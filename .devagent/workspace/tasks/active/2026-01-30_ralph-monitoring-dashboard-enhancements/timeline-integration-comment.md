Commit: ca4e7910 - feat(ralph-monitoring): add timeline to epic detail view [skip ci]

Summary:
- Loader now returns executionLogs (getExecutionLogs(epicId)) and taskIdToTitle derived from tasks so timeline and task list share the same data source.
- Timeline section added below EpicProgress with AgentTimeline, filter controls (Agent: All / per agent type; Time range: All time / Last 24h / Last 7d), and useId() for section/trigger IDs to satisfy lint.
- Integration test: loader returns executionLogs and taskIdToTitle; component renders Timeline heading, Agent and Time range filters, timeline with rows, and task list (Task A/B); fixed existing test that asserted "engineering" once (now appears in both task list and timeline) via getAllByText.

Revision Learning:
**Category**: Rules
**Priority**: Low
**Issue**: Biome useUniqueElementIds rule requires useId() for id attributes; static ids like "timeline-heading" fail lint.
**Recommendation**: Use useId() for any id/aria-labelledby/htmlFor in route components when the component can appear more than once or for consistency.
**Files/Rules Affected**: apps/ralph-monitoring/app/routes/epics.$epicId.tsx

Signed: Engineering Agent — Code Wizard
