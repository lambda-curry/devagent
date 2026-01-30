Commit: efcb9720 - docs(ralph-monitoring): add README and update design docs [skip ci]

Summary:
- Added README.md documenting all new features (epic list/detail, Agent Timeline, Loop Control Panel, execution logging, theme).
- Updated docs/component-specs.md: marked ProgressBar, MetricCard, AgentTimeline, LoopControlPanel as implemented with file paths.
- Updated docs/DESIGN_LANGUAGE.md: added Related section linking to component-specs.

Verification:
- typecheck, lint, test (311) passed in apps/ralph-monitoring.
- Build fails from workspace-level vite/tsconfig-paths discovering tmp/open-mercato tsconfig (outside ralph-monitoring); not a code defect in this app.
- No runtime console verification in this task; QA tasks already validated UI.

Revision Learning:
**Category**: Process
**Priority**: Medium
**Issue**: `bun run build` from repo root (or when vite resolves config) can fail if sibling paths (e.g. tmp/open-mercato) contain invalid tsconfig; ralph-monitoring typecheck/test/lint pass in isolation.
**Recommendation**: Run validation gates from apps/ralph-monitoring or ensure vite/tsconfig-paths is scoped to the app when running build from monorepo root.
**Files/Rules Affected**: package.json scripts, potential vite/tsconfig config for monorepo.

Signed: Project Manager Agent — Chaos Coordinator
