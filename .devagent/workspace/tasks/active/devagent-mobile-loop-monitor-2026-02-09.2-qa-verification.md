## QA Verification: Loop Detail (devagent-mobile-loop-monitor-2026-02-09.2-qa)

### Quality gates

| Gate       | Result | Notes |
|-----------|--------|--------|
| typecheck | **PASS** | `bun run typecheck` — 1 package, success |
| lint      | **PASS** | `bun run lint` — biome, 140 files, no fixes |
| test:ci   | **FAIL** | 2 tests fail (see blocker below) |

### Implementation verification (code + tests)

**1. All 4 sections render** — **PASS**
- `epics.$epicId.tsx`: header (back link, epic title, status badge, header loop control, theme toggle), NowCard, ActivityFeed, LoopControlPanel, StepsList.
- Test: "renders epic title, Now Card, Recent Activity, loop control, and All Steps" and "renders link back to Epics" pass.

**2. Now Card states (running/idle/paused)** — **PASS**
- Running: `isRunning && currentTask` → task name, agent, elapsed, Watch Live button.
- Idle: "Last completed" + lastCompletedLog or "No activity yet".
- Paused: "Paused" + last completed.
- `NowCard.test.tsx` covers running, idle (completed/failed/no activity), paused.

**3. Activity feed: last ~10 entries, correct icons** — **PASS**
- `RECENT_ACTIVITY_LIMIT = 10`; `executionLogs.slice(0, RECENT_ACTIVITY_LIMIT)`.
- `ActivityFeed` uses `statusConfig` (Check, X, Loader2) for success/failed/running.
- Test: "renders Recent Activity with execution log entries" passes.

**4. All Steps collapsed by default, expands** — **PASS**
- `StepsList` receives `defaultCollapsed`; route passes `defaultCollapsed`.
- Test: "renders Recent Activity... and All Steps collapsed by default" asserts `aria-expanded="false"`.

**5. Auto-revalidation** — **PASS**
- `useEffect` with 5s interval and `visibilitychange` calls `stableRevalidate()` when tab visible.

**6. Watch Live button** — **NOTE**
- Currently links to `href('/tasks/:taskId', { taskId: currentTask.id })` (task detail with LogViewer).
- Epic task .3 (Live Log) will add `/epics/:epicId/live`. When that route exists, product may switch Watch Live to it; no change required for this QA scope.

**7. 375px viewport** — **Not run in browser**
- Layout uses mobile-first (max-w-lg, touch targets, var(--space-*)). Design review task (.2-design) is closed. Manual 375px check recommended in integration phase.

### Blocker: test:ci failures

Two tests fail with the same root cause (fetcher/Request in jsdom):

1. **LoopControlPanel** — "calls window.confirm before Pause and submits when confirmed"
   - `pauseResumeFetcher.submit()` leads to React Router creating a Request; in node/undici, `RequestInit` expects a real `AbortSignal` instance.
   - Error: `TypeError: RequestInit: Expected signal ("AbortSignal {}") to be an instance of AbortSignal.`
   - So the action route is never hit and `pauseAction` is never called.

2. **storybook router.test** — "supports mocking actions for useFetcher without network"
   - Same AbortSignal/Request issue when the story’s fetcher form is submitted.

**Blocker task:** devagent-mobile-loop-monitor-2026-02-09.5 — "Fix fetcher tests in jsdom (LoopControlPanel, storybook router)". This QA task depends on it; once test:ci is green, QA can be closed.

### Summary

- Loop detail behavior and structure match acceptance criteria; typecheck and lint pass.
- test:ci is failing due to environment (AbortSignal in jsdom), not loop detail code. Blocker task created and dependency set. QA task left open until devagent-mobile-loop-monitor-2026-02-09.5 is closed and test:ci passes.

Signed: QA Agent — Bug Hunter
