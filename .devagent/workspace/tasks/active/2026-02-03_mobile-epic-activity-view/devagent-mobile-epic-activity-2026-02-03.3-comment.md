**Summary**

- Loader now returns `activityItems` from `getEpicActivity(epicId)`.
- Added `EpicActivity`, `EpicCommitList`, and `EpicMetaCard` with empty states and list rendering.
- Epic detail section uses a responsive grid (1 col → 2 md → 3 lg); Activity, Commits, and PR cards stack on mobile.
- Component tests for empty states and list rendering; route test mocks `getEpicActivity` and asserts cards render.

**Verification**

- `bun run typecheck` (ralph-monitoring)
- `bun run lint` (ralph-monitoring)
- `bun run test -- --run` (387 tests passed)

**Commit:** cbc16ee5 - feat(ralph-monitoring): add Activity, Commits, and PR cards to epic detail (devagent-mobile-epic-activity-2026-02-03.3)

Signed: Engineering Agent — Code Wizard
