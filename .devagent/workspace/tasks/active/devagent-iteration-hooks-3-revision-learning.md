Revision Learning:
**Category**: Architecture
**Priority**: Low
**Issue**: ralph.ts cannot be imported in Vitest (Node) because it uses bun:sqlite. Testing the on-iteration hook required extracting the hook runner to a small module (lib/on-iteration-hook.ts) that uses Node child_process only, so it runs in both Node (tests) and Bun (ralph).
**Recommendation**: When adding testable behavior that does not depend on Bun-only APIs, consider placing it in lib/ so Vitest can run without Bun.
**Files/Rules Affected**: .devagent/plugins/ralph/tools/lib/on-iteration-hook.ts, .devagent/plugins/ralph/tools/on-iteration-hook.test.ts

Signed: Engineering Agent — Code Wizard
