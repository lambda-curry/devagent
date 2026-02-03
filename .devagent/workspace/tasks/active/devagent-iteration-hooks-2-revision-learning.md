**Revision Learning:**
- **Category:** Process
- **Priority:** Low
- **Issue:** Ralph plugin code (.devagent/plugins/ralph/tools/) is outside the turbo workspace (apps/*, packages/*), so root `bun run lint` and `bun run typecheck` do not run on ralph.ts. Verification relied on workspace gates and a manual smoke run of ralph.ts.
- **Recommendation:** If the plugin gains more TypeScript surface, consider adding a small package or script under apps/ or a dedicated script in package.json to run biome/tsc on .devagent/plugins/ralph/tools for CI.
- **Files/Rules Affected:** .devagent/plugins/ralph/tools/ralph.ts, package.json, turbo.json (optional future).

Signed: Engineering Agent — Code Wizard
