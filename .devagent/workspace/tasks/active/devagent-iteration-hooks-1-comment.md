Commit: bcdbce6b - feat(ralph): add --on-iteration CLI arg to ralph.sh [skip ci]

Summary:
- Added ON_ITERATION_HOOK variable and --on-iteration parsing in ralph.sh (mirrors future ON_COMPLETE_HOOK pattern).
- Usage updated to: ./ralph.sh --run <path-to-loop.json> [--on-iteration <script-path>].
- Router invocation builds RALPH_ARGS and appends --on-iteration "$ON_ITERATION_HOOK" when set; ralph.ts receives the flag (parsing will be added in devagent-iteration-hooks.2).

Verification: Manual ./ralph.sh without/with --on-iteration; ralph.ts runs with extra args without error.

Revision Learning:
**Category**: Process
**Priority**: Low
**Issue**: ralph.sh had no prior --on-complete in tree; task referenced "similar to ON_COMPLETE_HOOK" — implemented --on-iteration only per task scope.
**Recommendation**: When adding --on-complete to ralph.sh later, reuse same pattern (variable + case + RALPH_ARGS).
**Files/Rules Affected**: .devagent/plugins/ralph/tools/ralph.sh

Signed: Engineering Agent — Code Wizard
