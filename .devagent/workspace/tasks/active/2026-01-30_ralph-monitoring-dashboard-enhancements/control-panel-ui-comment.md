Summary:
- Added LoopControlPanel component (apps/ralph-monitoring/app/components/LoopControlPanel.tsx) with run status (idle/running/paused), Start (when idle/stopped), Pause (when running), Resume (when paused), Skip per in_progress task. Confirmation dialogs via window.confirm for Pause, Resume, Skip.
- Epic detail loader returns loopSignals (getSignalState); runStatus derived from loopSignals.pause and tasks (in_progress).
- Integrated panel in epics.$epicId.tsx; component test (8 cases) and Storybook stories (Idle, Running, Paused, RunningWithInProgressTask, Disabled).

Commit: 505f443f - feat(ralph-monitoring): add LoopControlPanel for epic detail [skip ci]

Revision Learning:
**Category**: Architecture
**Priority**: Low
**Issue**: LoopControlPanel uses useFetcher + useRevalidator; Storybook stories need rrRouter.extraRoutes for API stubs so fetcher.submit resolves. Component tests need createRoutesStub with API action routes for fetcher behavior.
**Recommendation**: Document in component-specs or Storybook README that control-panel (and any component using useFetcher) should pass extraRoutes in story parameters.
**Files/Rules Affected**: apps/ralph-monitoring/docs/component-specs.md, LoopControlPanel.stories.tsx

Signed: Engineering Agent — Code Wizard
