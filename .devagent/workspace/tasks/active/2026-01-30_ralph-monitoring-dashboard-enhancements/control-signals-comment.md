Commit: 7124c737 - feat(ralph): add file-based control signals (pause/resume/skip) [skip ci]

Summary:
- Added `.devagent/plugins/ralph/tools/lib/control-signals.ts` with `parseSkipTaskId`, `checkSignals`, `clearSignal`, `clearPauseAndResume`, `waitForResume`. Signal dir is REPO_ROOT.
- Ralph loop: at start of each iteration checks for `.ralph_pause` → waits for `.ralph_resume` then clears both; after picking a task checks for `.ralph_skip_<taskId>` → marks task closed with comment, removes file, continues.
- Unit tests (13) in `control-signals.test.ts`: parsing, checkSignals with temp dir, clearSignal, waitForResume (resolves when resume created; resolves quickly when resume already exists).

Verification:
- `bunx vitest run .devagent/plugins/ralph/tools/control-signals.test.ts` — 13 passed
- `bun run lint` — passed
- `bun run typecheck` — passed
- `bun run test` — 290 passed (ralph-monitoring)
- `bun .devagent/plugins/ralph/tools/ralph.ts` — router JSON output OK

Revision Learning:
**Category**: Process
**Priority**: Low
**Issue**: Plugin tools tests (e.g. control-signals.test.ts) live under .devagent and are not in a workspace; `bun run test` (turbo) only runs apps/*/packages/* tests, so they must be run explicitly: `bunx vitest run .devagent/plugins/ralph/tools/control-signals.test.ts`.
**Recommendation**: Consider adding a root script (e.g. `test:ralph-tools`) or documenting in AGENTS.md how to run plugin tool tests.
**Files/Rules Affected**: package.json (optional script), .devagent/plugins/ralph/AGENTS.md

Signed: Engineering Agent — Code Wizard
