**Summary**
- Implemented `--on-complete` in ralph.sh and ralph.ts (previously only `--on-iteration` existed).
- Added `lib/on-complete-hook.ts` and unit tests; loop calls the hook once on exit with payload: status, epicId, iterations, maxIterations, exitReason, durationSec, branch, logTail.
- Added `verify-hooks-e2e.sh` to run ralph with both `--on-iteration` and `--on-complete` (same append-to-file script) and assert iteration + completion payloads and expected keys.
- ralph.sh now respects `RALPH_MAX_ITERATIONS` env override so e2e can use max_iterations=1.

**Verification**
- Unit: `bunx vitest run --config .devagent/plugins/ralph/tools/vitest.config.ts .devagent/plugins/ralph/tools` — 95 tests pass (including on-complete-hook tests).
- E2E: `./.devagent/plugins/ralph/tools/verify-hooks-e2e.sh` must be run from repo root with epic and beads available; in this environment git/beads were not available so e2e was not run here.

**Commit:** 5b0d60b3 — feat(ralph): add --on-complete hook and e2e verification for both hooks [skip ci]

**Revision Learning**
- **Category:** Process
- **Priority:** Low
- **Issue:** E2E script failed in run environment with "fatal: not a git repository" and "Epic not found in Beads database" — likely sandbox/workspace layout.
- **Recommendation:** Run `verify-hooks-e2e.sh` from repo root in an environment where `.git` and beads DB (with epic devagent-iteration-hooks and at least one ready task) are available to confirm both hooks end-to-end.
- **Files/Rules Affected:** `.devagent/plugins/ralph/tools/verify-hooks-e2e.sh` (doc comment updated with requirements).

Signed: Engineering Agent — Code Wizard
