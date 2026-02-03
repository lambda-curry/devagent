**Summary:** Implemented `--on-iteration` support in ralph.ts. The implementation was already present in the working tree; verified correctness and committed.

- **Parse --on-iteration:** CLI parses `--on-iteration <path>` and passes it via `ExecuteLoopOptions.onIterationHook` to `executeLoop`.
- **Hook invocation:** In the loop’s `finally` block, after each iteration where a task was processed (`iterationResult` set), `runOnIterationHook` is called with JSON payload on stdin (epicId, iteration, maxIterations, taskId, taskTitle, taskStatus, tasksCompleted, tasksRemaining, iterationDurationSec).
- **Failure behavior:** Hook runs inside try/catch; non-zero exit or thrown errors are logged with `console.warn` and do not stop the loop.

**Verification:** `bun run lint`, `bun run typecheck` (workspace); `bun run .devagent/plugins/ralph/tools/ralph.ts` (router mode smoke).

Commit: 927a9fd5 - feat(ralph): add --on-iteration hook support (devagent-iteration-hooks.2)

Signed: Engineering Agent — Code Wizard
