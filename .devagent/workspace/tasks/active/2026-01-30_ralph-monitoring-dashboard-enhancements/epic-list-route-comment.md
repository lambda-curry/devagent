Commit: 52daa862 - feat(ralph-monitoring): add /epics route with progress bars [skip ci]

Summary:
- Added getEpics() in beads.server.ts returning EpicSummary (id, title, status, task_count, completed_count, progress_pct, updated_at). Epics = issues with no dot in id; children counted via id LIKE epic_id || '.%'.
- Added epics layout (epics.tsx) and index route (epics._index.tsx): loader calls getEpics(), list shows title, status badge, task/completed counts, ProgressBar; empty state when no epics; each row links to /tasks/:taskId.
- Loader test (mock getEpics) and component tests (empty state, progress display, links to detail) using manual loader + createComponentProps pattern.

Verification: lint, typecheck, test (267 tests) passed.

Revision Learning:
**Category**: Process
**Priority**: Low
**Issue**: createRoutesStub with a route that has a loader does not run the loader in tests; the outlet renders empty.
**Recommendation**: For route component tests that need loader data, call the loader manually and pass loaderData via a wrapper component (createComponentProps(loaderData)), matching _index.test.tsx and tasks.$taskId.test.tsx.
**Files/Rules Affected**: app/routes/__tests__/epics._index.test.tsx, testing-best-practices (createRoutesStub + loaders)

Signed: Engineering Agent — Code Wizard
