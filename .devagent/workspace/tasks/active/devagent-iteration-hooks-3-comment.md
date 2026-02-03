Commit: 21771c55 - test(ralph): verify on-iteration hook with test script and unit tests [skip ci]

Summary:
- Added test-on-iteration-hook.sh that reads JSON from stdin and appends to a file (OUT_FILE or first arg).
- Extracted runOnIterationHook to lib/on-iteration-hook.ts using Node child_process so it can be tested under Vitest (ralph.ts uses bun:sqlite and cannot be loaded in Node).
- Added on-iteration-hook.test.ts: (1) hook receives payload with all expected fields; (2) hook exit non-zero does not throw; (3) hook command failure does not throw.
- E2E verification is documented in the test hook script (run ralph with RALPH_MAX_ITERATIONS=1 and OUT_FILE set; full e2e runs one agent iteration and is slow).

Verification: `bunx vitest run .devagent/plugins/ralph/tools/on-iteration-hook.test.ts` — 3 tests passed. Lint/typecheck (workspace) passed.

Signed: Engineering Agent — Code Wizard
