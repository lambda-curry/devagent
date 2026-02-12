## Summary

Mobile-first redesign of the Ralph loop monitoring experience in `ralph-monitoring`: three core screens optimized for checking in on the go.

**Epic:** devagent-mobile-loop-monitor-2026-02-09 (Beads)

## What's in this branch

- **Loop Dashboard** — Mobile-first epics index: loop cards with status, progress, current task, last activity; running loops sort to top; 10s revalidation.
- **Loop Detail** — “What’s happening now” view: header with controls, Now card (current task or last outcome), recent activity feed, collapsible all-steps list; 5s revalidation.
- **Live Log** — Full-screen streaming log viewer at `/epics/:epicId/live` with SSE.
- **Design** — Spec and prototype components (LoopCard, NowCard, ActivityRow, StepChip, etc.) with Storybook; design tokens and touch targets per spec.
- **Polish** — Integration polish, fetcher/jsdom test fixes, `test:ci` fixes (better-sqlite3, AbortSignal, settings form).

## Prerequisites verified

- [x] Working branch `codex/2026-02-09-mobile-loop-monitor` exists and is checked out
- [x] Epic `devagent-mobile-loop-monitor-2026-02-09` exists in Beads
- [x] Ralph config validated (`config.json`: base_branch, working_branch, beads, roles)

## Testing

- `typecheck`, `lint`, `test:ci` passing for relevant apps (ralph-monitoring).
- QA tasks completed for dashboard, loop detail, and live log.
