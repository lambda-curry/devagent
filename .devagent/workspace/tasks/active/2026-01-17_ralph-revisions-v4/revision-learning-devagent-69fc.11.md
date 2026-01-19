Revision Learning:
**Category**: Process
**Priority**: Medium
**Issue**: QA for UI ergonomics often expects interactive verification (scroll/visual newline rendering), but in this environment we rely on Vitest + code review, so screenshot capture isn’t always feasible.
**Recommendation**: Add/standardize a lightweight headless UI smoke path (or agent-browser step) for the monitoring app that can capture 1-2 baseline screenshots of the kanban board and a task detail page; alternatively document that Vitest coverage is acceptable verification when screenshots aren’t available.
**Files/Rules Affected**: `.devagent/plugins/ralph/AGENTS.md` (UI Verification + screenshots guidance), `apps/ralph-monitoring/app/routes/__tests__/_index.test.tsx`, `apps/ralph-monitoring/app/db/__tests__/beads.server.test.ts`.
