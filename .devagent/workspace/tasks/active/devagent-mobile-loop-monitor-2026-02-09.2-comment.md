Commit: a2452686 - feat(ralph-monitoring): loop detail view mobile-first redesign (devagent-mobile-loop-monitor-2026-02-09.2)

Summary:
- Implemented loop detail view at `/epics/:epicId` as mobile-first "what's happening now" screen.
- Header: back arrow, epic name, status badge (Idle/Running/Paused), compact Start/Pause/Resume icon button, ThemeToggle.
- NowCard: running state shows task name, agent type, live elapsed time, and Watch Live link to task detail; idle/paused shows last completed task + outcome (Completed/Failed/Ended).
- ActivityFeed: last 10 execution log entries, one line per entry (relative time, truncated title, outcome icon); tap navigates to task detail.
- StepsList: collapsible "All Steps" (collapsed by default), status chips (Pending/Running/Done/Failed/Blocked), tap to task detail; uses useId() for aria-controls.
- 5s auto-revalidation and visibility-based revalidate on tab focus retained.
- Single scrollable view, max-w-lg, overflow-x-hidden; no Timeline/EpicProgress on this route.

Verification:
- lint (biome), typecheck (react-router typegen + tsc) passed.
- Component tests: NowCard (5), ActivityFeed (4), StepsList (4). Route integration test: epics.$epicId (8). All 21 tests passed.
- Full workspace test suite has pre-existing failures (better-sqlite3 native module, LoopControlPanel flakiness, settings.projects form Content-Type); not introduced by this task.

Revision Learning:
**Category**: Process
**Priority**: Low
**Issue**: Full `npm run test` in ralph-monitoring hits DB/native and other suite failures; scoped test run (only touched files) is the reliable gate for this change.
**Recommendation**: Consider documenting in CONTRIBUTING or Ralph runbook to run scoped tests for epic-specific work when full suite has known env failures.
**Files/Rules Affected**: apps/ralph-monitoring test commands

Signed: Engineering Agent — Code Wizard
