Summary:
- Implementation was already present in ralph.ts (from prior task devagent-iteration-hooks.2). Verified all acceptance criteria are satisfied.
- ralph.ts parses --on-iteration in CLI (lines 941-944), passes it via ExecuteLoopOptions to executeLoop.
- In executeLoop, the hook is invoked in the loop's finally block (lines 1327-1342) when onIterationHook && iterationResult, with payload: epicId, iteration, maxIterations, taskId, taskTitle, taskStatus, tasksCompleted, tasksRemaining, iterationDurationSec.
- lib/on-iteration-hook.ts runOnIterationHook() pipes JSON to the hook via stdin and catches errors; it logs with console.warn and never throws, so hook failures do not stop the loop.

Verification:
- Ran: cd .devagent/plugins/ralph/tools && bunx vitest run on-iteration-hook.test.ts --config vitest.config.ts — 3 tests passed.
- No code changes required; closing as complete.

Revision Learning:
**Category**: Process
**Priority**: Low
**Issue**: Task devagent-iteration-hooks.4 duplicated scope of devagent-iteration-hooks.2 (same title/description). Verification-only pass.
**Recommendation**: When creating follow-up tasks, use distinct titles/descriptions (e.g. "Verify on-iteration hook in ralph.ts" vs "Add on-iteration support") to avoid duplicate implementation work.
**Files/Rules Affected**: Beads task creation workflow

Signed: Engineering Agent — Code Wizard
