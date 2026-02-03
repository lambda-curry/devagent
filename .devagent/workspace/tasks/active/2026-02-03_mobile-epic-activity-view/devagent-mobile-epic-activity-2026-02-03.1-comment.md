## Summary

- **Types**: Added `EpicActivityItem` (discriminated union), `EpicActivityExecution`, `EpicActivityComment`, `EpicActivityStatus`, and `ParsedCommitComment` in `beads.types.ts`.
- **DB**: Added `getCommentsForEpicTasks(epicId, projectPathOrId)` in `beads.server.ts` to fetch comments for epic + descendant tasks; introduced `BeadsCommentWithTaskId`.
- **Aggregator**: New `app/utils/epic-activity.server.ts` with `parseCommitComment(body)` (first-line `Commit: <sha> - <message>`) and `getEpicActivity(epicId, projectPathOrId)` merging executions, comments, and task status into one list sorted by timestamp descending. Missing execution log table or comments are handled by existing DB functions returning `[]`.
- **Tests**: Vitest unit tests in `app/utils/__tests__/epic-activity.server.test.ts` for commit parsing (match, trim, null cases) and for aggregation (ordering most recent first, commit field parsing, empty/missing sources).

**Commit:** cb53ab3e - feat(ralph-monitoring): add epic activity feed (execution, comment, status) [skip ci]

**Verification:** Lint (no new issues). Vitest: `epic-activity.server.test.ts` (10 tests) + `beads.server.test.ts` (50 tests) passed. Typecheck has pre-existing failures in other files (Comments.tsx, settings.projects.tsx); not introduced by this task.

---

**Revision Learning:**
- **Category**: Process
- **Priority**: Low
- **Issue**: Repo typecheck fails in unrelated modules (missing type declarations for @hookform/resolvers, @lambdacurry/forms, etc.; settings.projects.tsx type assertions). Engineering could not run full typecheck as a gate for this task.
- **Recommendation**: Either fix or isolate typecheck so task-scoped changes can be validated (e.g. typecheck only under `app/db` and `app/utils`), or document that typecheck is not a required gate for backend-only changes until root cause is fixed.
- **Files/Rules Affected**: `apps/ralph-monitoring` package.json, tsconfig, and/or CI quality gates.

Signed: Engineering Agent — Code Wizard
