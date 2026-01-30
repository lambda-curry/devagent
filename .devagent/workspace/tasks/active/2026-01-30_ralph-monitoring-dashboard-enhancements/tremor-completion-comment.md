Commit: 7f132054 - feat(ralph-monitoring): integrate Tremor, add ProgressBar and MetricCard [skip ci]

Summary:
- Added @tremor/react and Tremor theme tokens in globals.css (@theme + .dark) for Tailwind v4 compatibility.
- ProgressBar: value 0–100, optional label, color variants (primary, muted, destructive, secondary, accent), showAnimation.
- MetricCard: title, value (ReactNode), optional subtitle and icon; uses Card + typography.
- Storybook stories for both components; Vitest snapshot tests (4 snapshots, 13 tests).
- Lint fix in scripts/serve-built.ts (useTemplate).

Verification: lint, typecheck, test (all passed).

Revision Learning:
**Category**: Architecture
**Priority**: Low
**Issue**: @tremor/react targets Tailwind v3 and uses tremor-* class names; our app uses Tailwind v4 with @theme inline.
**Recommendation**: We mapped tremor tokens to design system vars in @theme so Tremor chart components (e.g. AreaChart) can be used later. ProgressBar and MetricCard are custom components using our tokens for full control.
**Files/Rules Affected**: apps/ralph-monitoring/app/globals.css, app/components/ProgressBar.tsx, app/components/MetricCard.tsx

Signed: Engineering Agent — Code Wizard
