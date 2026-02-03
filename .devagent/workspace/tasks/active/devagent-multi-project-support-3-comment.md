Commit: f5217a03 - feat(routes): add project to URL and loaders; combined view [skip ci]

Summary:
- URL structure: /projects/:projectId (task list), /projects/:projectId/tasks/:taskId (task detail). Root index redirects to /projects/combined. Legacy /tasks/:taskId redirects to /projects/combined/tasks/:taskId.
- Index loader (projects.$projectId._index): receives projectId param; when 'combined' aggregates getProjectList() + getAllTasks(filters, project.id) per valid project with projectId attached to each task; otherwise getAllTasks(filters, projectId).
- Task detail loader (projects.$projectId.tasks.$taskId): receives projectId + taskId; getTaskById(taskId, projectId), getTaskCommentsDirect(taskId, projectId).
- API routes: api.logs.$taskId and api.logs.$taskId.stream read projectId from query and pass to getTaskLogFilePath(taskId, projectId). api.tasks.$taskId.stop accepts projectId query (reserved for future per-project PID dirs).
- LogViewer accepts optional projectId and appends ?projectId= to fetch/EventSource URLs.
- Tests: _index tests redirect only; new projects.$projectId._index tests (loader single/combined, render); tasks.$taskId tests updated to project-scoped route; tasks.$taskId.redirect tests for legacy redirect.

Verification: lint, typecheck, test (327 passed).

Signed: Engineering Agent — Code Wizard
