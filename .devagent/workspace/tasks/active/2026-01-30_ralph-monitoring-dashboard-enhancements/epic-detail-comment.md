Commit: 7e8c3a65 - feat(ralph-monitoring): add /epics/:epicId route with progress view [skip ci]

Summary:
- Added `/epics/:epicId` route with loader (getTaskById, getEpicById, getTasksByEpicId), 404 when epic not found or not root-level.
- EpicProgress component: epic title/description, overall progress bar, task list (status icon, duration, agent type), estimated time remaining (avg completed task duration × remaining count), real-time polling (5s) via useRevalidator.
- DB: getEpicById(epicId), getTasksByEpicId(epicId) returning EpicTask[] with agent_type from latest exec log; LATEST_EXEC_LOG_WITH_AGENT_SUBQUERY for agent_type.
- Epic list now links to /epics/:epicId instead of /tasks/:taskId for epic cards.

Verification: lint, typecheck, test (286) passed. Loader test (epics.$epicId), EpicProgress test (estimateTimeRemainingMs, progress bar, task list, ETA).

Revision Learning:
**Category**: Process
**Priority**: Low
**Issue**: Route test mocks ~/db/beads.server; EpicProgress imports formatDurationMs from same module, so full mock broke component. Partial mock via vi.importActual resolved it.
**Recommendation**: When mocking modules used by child components, prefer vi.importActual() and override only the functions under test.
**Files/Rules Affected**: app/routes/__tests__/epics.$epicId.test.tsx

Signed: Engineering Agent — Code Wizard
