## Summary

- **Combined view**: Task list already aggregated tasks with `projectId` and composite keys; added project badge (label or id) on every card when `viewMode === 'combined'`.
- **Single-project view**: Optional muted project label (text, not badge) on each card so attribution is visible when desired.
- **Task detail**: Loader now returns `projectLabel` from project config; header shows project badge and "All projects" link to `/projects/combined`; back link remains project-scoped so logs/comments use correct DB.
- **Tests**: Combined-view card shows project badge (new assertion); task detail test mock includes `projectLabel`; fixed settings.projects loader (no-arg) and ComponentProps in tests for typecheck.

## Verification

- `bun run lint` — pass
- `bun run typecheck` — pass
- `bun run test` — 342 tests pass

Commit: 5b34169e - feat(ralph-monitoring): combined view project attribution and task detail context [skip ci]

Signed: Engineering Agent — Code Wizard
