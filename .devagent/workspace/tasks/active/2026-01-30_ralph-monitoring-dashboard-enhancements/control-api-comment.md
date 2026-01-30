## Completion

**Commit:** a3850e75 - feat(ralph-monitoring): add API routes for loop control [skip ci]

**Summary:**
- Added POST /api/loop/pause, resume, skip/:taskId, start with server utils (loop-control.server.ts, loop-start.server.ts).
- Pause creates `.ralph_pause`; resume removes pause and creates `.ralph_resume`; skip creates `.ralph_skip_<taskId>`; start finds run file by epic ID and spawns ralph.sh --run <path> (detached).
- All four routes registered in routes.ts. Tests use temp-dir file system for pause/resume/skip and vi.mock of loop-start.server for start.

**Verification:** lint, typecheck, test (302 tests) passed.

**Revision Learning:**
- **Category:** Architecture
- **Priority:** Low
- **Issue:** ralph.sh accepts only `--run <path>`, not `--epic <id>`. Start API resolves run file by scanning .devagent/plugins/ralph/runs/*.json for matching epic.id; optional body.runFilePath allows explicit path.
- **Recommendation:** Document that start requires either a run file in runs/ with epic.id or a provided runFilePath. Consider adding a GET /api/loop/run-files or similar to list available runs for the UI.
- **Files/Rules Affected:** apps/ralph-monitoring/app/utils/loop-start.server.ts, apps/ralph-monitoring/app/routes/api.loop.start.ts

Signed: Engineering Agent — Code Wizard
