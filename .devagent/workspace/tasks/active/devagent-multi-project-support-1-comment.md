**Commit:** 131dea8e — feat(ralph-monitoring): project list schema and server loader (devagent-multi-project-support.1)

**Summary:**
- Added `app/lib/projects.server.ts` with schema (Project: id, path, label; ProjectsConfig: projects, defaultId), config path from `RALPH_PROJECTS_FILE` or default `<repoRoot>/.ralph/projects.json`, and functions: getProjectsConfigPath, resolveBeadsDbPath, validateProjectPath, loadProjectsConfig, getProjectList, getPathByProjectId, getDefaultProjectId. Validation ensures path exists and Beads DB is openable (readonly).
- Root loader in `app/root.tsx` returns `{ projects, defaultProjectId }` for future project switcher.
- README Configuration section documents RALPH_PROJECTS_FILE, BEADS_DB, REPO_ROOT.
- Unit tests: `app/lib/__tests__/projects.server.test.ts` (25 tests) cover path resolution, validation, parsing, and list/default helpers.

**Verification:** typecheck pass; lint pass (2 pre-existing warnings in LogViewer); `bun run test -- app/lib/__tests__/projects.server.test.ts app/db/__tests__/beads.server.test.ts` — 68 tests pass. One pre-existing failure in `tasks.$taskId.test.tsx` (missing `resolveLogPathForRead` in mock) — unrelated to this task.

Signed: Engineering Agent — Code Wizard
