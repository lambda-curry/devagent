Summary:
- Added EpicLogPanel component: task selector (defaults to in_progress), LogViewer for selected task, "View task" link to task detail, empty state when no tasks or no logs.
- Epic loader now computes taskLogInfo (hasLogs, hasExecutionHistory) per task via resolveLogPathForRead and logFileExists.
- Component tests: getDefaultLogPanelTaskId (prefer in_progress, fallback to first task), EpicLogPanel empty state, default selection, task selector + link, no-logs case. Epic route test: taskLogInfo in loader, log panel section present.

Commit: a695afb9 - feat(ralph-monitoring): add epic log panel for task logs (devagent-mobile-epic-activity-2026-02-03.4)

Revision Learning:
**Category**: Process
**Priority**: Low
**Issue**: Radix Select in jsdom: opening the dropdown (userEvent.click(combobox)) triggers hasPointerCapture errors and options live in a portal, so "switch task via select" was not asserted with real interaction.
**Recommendation**: For components that only need "selector present + default value" verified, avoid testing full open/click-option in jsdom; rely on default-selection tests and QA for interaction.
**Files/Rules Affected**: EpicLogPanel.test.tsx

Signed: Engineering Agent — Code Wizard
