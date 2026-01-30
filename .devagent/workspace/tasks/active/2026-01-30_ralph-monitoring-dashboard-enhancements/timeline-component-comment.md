**Commit:** fa08ec81 - feat(ralph-monitoring): add AgentTimeline component for agent activity

**Summary:**
- Added `AgentTimeline.tsx`: horizontal timeline by agent type; blocks colored by execution log status (success=green, failed=red, running=blue); width proportional to duration; hover tooltip with title/status/duration; click uses `Link` + `href('/tasks/:taskId', { taskId })` to task detail.
- Added `AgentTimeline.stories.tsx`: Default, Empty, SingleAgent, HoverShowsTooltip (play), ClickNavigatesToTask (play) with mock `RalphExecutionLog` and `taskIdToTitle`.
- Added `AgentTimeline.test.tsx`: empty state, rows/blocks render, accessibility labels; jsdom + `createMemoryRouter` for `Link`.

**Verification:** lint, typecheck, test (286 tests including 3 AgentTimeline) passed.

**Revision Learning:**
**Category:** Rules
**Priority:** Low
**Issue:** Linter suggested `<output>` for empty-state "No agent activity" to satisfy useSemanticElements; `<output>` is semantically for calculation/form result, so the rule may be over-broad for status messages.
**Recommendation:** Consider allowing `role="status"` on a div for live-region status, or document when to use `<output>` vs div+role.
**Files/Rules Affected:** AgentTimeline.tsx empty state

Signed: Engineering Agent — Code Wizard
