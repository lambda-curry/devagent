**Commit:** e61f9bf1 — feat(ralph-monitoring): mobile loop monitor design spec and prototype components [skip ci]

**Artifacts:**
- Design spec: `apps/ralph-monitoring/docs/mobile-loop-monitor-design.md` — covers all three screens (Dashboard, Loop Detail, Live Log), wireframes, component inventory, status visualization (running/paused/idle + step states), information density, typography scale, touch targets (min 40px, rows 48px+), dark mode, navigation (back-arrow stack, no tab bar).
- Prototype components: `app/components/mobile-loop/` — LoopCard, NowCard, ActivityRow, StepChip; each has Storybook stories with viewport set to Mobile 375px (added `mobile375` in `.storybook/preview.ts`).

**Decisions:**
- Status: running = green + pulse, paused = amber dot, idle/stopped = muted. StepChip: pending/running/done/failed/skipped with token-driven colors.
- Components use only design tokens (--space-*, --font-size-*, --touch-target-min, bg-card, text-muted-foreground, etc.); LoopCard uses `bg-amber-500` for paused dot (spec called for amber; can be replaced by a --warning token later).
- Navigation rationale: linear drill-down (Dashboard → Detail → Live Log) with back only; no tab bar to reduce chrome on small screens.

**Verification:**
- `bun run lint` — pass (mobile-loop files; one pre-existing warning in settings.projects.tsx).
- `bun run build-storybook` — pass; all mobile-loop stories build.
- `bun run typecheck` — mobile-loop and stories typecheck; pre-existing errors remain in `app/routes/settings.projects.tsx` (unchanged).

**Revision Learning:**
- **Category:** Process
- **Priority:** Low
- **Issue:** Typecheck fails in repo due to existing `settings.projects.tsx` type assertions; design task did not touch that file. Closing the task with “typecheck has known unrelated failures” avoids blocking on out-of-scope fixes.
- **Recommendation:** Consider a follow-up task to fix settings.projects.tsx type errors so CI/typecheck is green for the branch.
- **Files/Rules Affected:** `app/routes/settings.projects.tsx`

Signed: Design Agent — Pixel Perfector
