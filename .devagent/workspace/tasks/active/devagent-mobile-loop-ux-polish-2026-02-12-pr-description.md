# Mobile Loop UX Polish — Auto-Live & Live Log Storybook

## Summary

UX polish for the Ralph mobile loop flow: **auto-navigate** running epics to the live log view, and a **fullscreen live log** Storybook story for design/QA. Builds on the mobile loop monitor (epics index, loop detail, live log route).

**Epic:** devagent-mobile-loop-ux-polish-2026-02-12 (Beads)  
**Branch:** `codex/2026-02-12-mobile-loop-ux-polish`

## What's in this branch

- **Auto-live navigation** — When an epic is in a “running” state, the app automatically navigates to `/epics/:epicId/live` so users land on the live log without an extra tap. Decision and behavior documented in `apps/ralph-monitoring/docs/auto-live-ux-decision.md`.
- **Fullscreen live log Storybook story** — New story for the full-screen live log view (`epics.$epicId.live`) so the flow can be reviewed in isolation; Storybook config updated to include `routes/__stories__`.
- **Final review** — typecheck, lint, test, and build-storybook all passing; this PR description prepared for handoff.

## Verification

- [x] `bun run typecheck` — passes (turbo, ralph-monitoring)
- [x] `bun run lint` — passes (biome, ralph-monitoring)
- [x] `bun run test` — passes (281 tests, ralph-monitoring)
- [x] `bun run --cwd apps/ralph-monitoring build-storybook` — succeeds

## Notes

- This branch includes prior work from the mobile loop monitor epic (dashboard, loop detail, live route, design spec). The UX polish epic adds auto-live behavior and the live log story only.
- For creating the PR: `gh pr create --base main --head codex/2026-02-12-mobile-loop-ux-polish --title "feat(ralph-monitoring): mobile loop UX polish — auto-live + live log storybook" --body-file .devagent/workspace/tasks/active/devagent-mobile-loop-ux-polish-2026-02-12-pr-description.md`
