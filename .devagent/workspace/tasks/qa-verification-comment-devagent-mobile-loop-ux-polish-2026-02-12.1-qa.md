# QA verification: Auto-Live Navigation (devagent-mobile-loop-ux-polish-2026-02-12.1-qa)

## Verified

- **Existing tests pass**: All 281 tests in `apps/ralph-monitoring` pass (`bun run test`).
- **LoopCard links by status**: Confirmed via `getEpicCardTargetPath` unit tests and implementation review:
  - `in_progress` → `/epics/:epicId/live`
  - `closed` / `open` / `blocked` → `/epics/:epicId`
- **No typecheck or lint errors**: `bun run typecheck` and `bun run lint` pass (143 files checked).

## Commands run

```bash
cd apps/ralph-monitoring
bun run typecheck   # react-router typegen && tsc --noEmit
bun run lint        # biome lint .
bun run test        # vitest run
```

## Evidence

- **Implementation**: `app/routes/epics._index.tsx` uses `getEpicCardTargetPath(epic.id, epic.status)` in `LoopCard` onClick; `getEpicCardTargetPath` returns `/epics/${epicId}/live` for `in_progress` and `/epics/${epicId}` otherwise.
- **Tests**: `app/routes/__tests__/epics._index.test.tsx` includes a `getEpicCardTargetPath` describe with tests for live path (in_progress) and detail path (closed, open, blocked). Component tests render LoopCards with correct status mapping (`epicStatusToLoopRunStatus`).

## Revision Learning

**Category**: Process  
**Priority**: Low  
**Issue**: Click-to-navigate integration tests with `createRoutesStub` and multiple routes did not update the rendered route after `navigate()` in this setup (stub may not re-render on programmatic navigation).  
**Recommendation**: Rely on unit tests for `getEpicCardTargetPath` and component tests that render the index; for full click→URL assertions consider e2e or a router stub that exposes `router.state.location` after navigation.  
**Files/Rules Affected**: `apps/ralph-monitoring/app/routes/__tests__/epics._index.test.tsx`, testing-best-practices (createRoutesStub usage).
