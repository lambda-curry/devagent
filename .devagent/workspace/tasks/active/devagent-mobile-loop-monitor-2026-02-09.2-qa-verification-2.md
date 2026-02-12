## QA Verification: Loop Detail (Re-run after blocker .5 closed)

### Quality gates

| Gate | Result | Notes |
|------|--------|--------|
| typecheck | **PASS** | `bun run typecheck` — 1 package, success |
| lint | **PASS** | `bun run lint` — biome, 141 files, no fixes |
| test:ci (full) | **FAIL** | 6 test files failed, 77 tests failed (see below) |
| Loop-detail tests only | **PASS** | 37/37 — epics.$epicId, epics._index, NowCard, ActivityFeed, StepsList, LoopControlPanel |

### Loop-detail implementation verification

1. **All 4 sections render** — **PASS**  
   Route `epics.$epicId.tsx`: header (back link, epic title, status badge, loop control, theme toggle), NowCard, ActivityFeed, LoopControlPanel, StepsList. Tests: "renders epic title, Now Card, Recent Activity, loop control, and All Steps", "renders link back to Epics", "renders Recent Activity... and All Steps collapsed by default" all pass.

2. **Now Card states (running/idle/paused)** — **PASS**  
   NowCard.test.tsx: running (task name, agent, elapsed, Watch Live), idle (last completed / no activity), paused. All 5 tests pass.

3. **Activity feed: last ~10 entries, correct icons** — **PASS**  
   `RECENT_ACTIVITY_LIMIT = 10`; ActivityFeed uses statusConfig (Check, X, Loader2). Tests pass.

4. **All Steps collapsed by default, expands** — **PASS**  
   StepsList receives `defaultCollapsed`; test asserts `aria-expanded="false"` when collapsed.

5. **Auto-revalidation** — **PASS**  
   `useEffect` with 5s interval and `visibilitychange` calls `stableRevalidate()` when tab visible (code in epics.$epicId.tsx).

6. **Watch Live button** — **PASS**  
   Links to `href('/tasks/:taskId', { taskId: currentTask.id })` (task detail with LogViewer). Epic task .3 will add `/epics/:epicId/live`; when that exists, product may point Watch Live there. Current behavior is in scope and correct.

7. **375px viewport** — **Not run in browser**  
   Layout is mobile-first (max-w-lg, touch targets). Design review (.2-design) closed. Manual 375px check recommended in integration phase.

### test:ci failures (out of loop-detail scope)

Failures are in other areas; loop-detail tests all pass when run in isolation:

- **better-sqlite3 native module**: `beads.server.test.ts`, `seed-data.test.ts`, `testDatabase.test.ts`, `projects.server.test.ts` — `ERR_DLOPEN_FAILED` loading `better_sqlite3.node` in test workers. Environment / native addon loading.
- **tasks.$taskId.test.tsx**: Unhandled rejection `RequestInit: Expected signal to be an instance of AbortSignal` when navigation/fetcher runs (same class as previous .5 fix). One test times out in waitFor (Task stopped successfully).
- **settings.projects.test.tsx**: Action tests fail with "Content-Type was not one of multipart/form-data or application/x-www-form-urlencoded" (form encoding in test request).

### Blocker

Created fix task for full test:ci: **Fix test:ci (better-sqlite3 in workers, AbortSignal in tasks route tests, settings form encoding)**. This QA task is blocked on that task until `bun run test:ci` passes.

### Commands run

- `bun run typecheck` — pass  
- `bun run lint` — pass  
- `bun run test:ci` — fail (77 failed)  
- `vitest run "app/routes/__tests__/epics.$epicId.test.tsx" "app/routes/__tests__/epics._index.test.tsx" "app/components/__tests__/NowCard.test.tsx" "app/components/__tests__/ActivityFeed.test.tsx" "app/components/__tests__/StepsList.test.tsx" "app/components/__tests__/LoopControlPanel.test.tsx"` — 37 passed  

Signed: QA Agent — Bug Hunter
