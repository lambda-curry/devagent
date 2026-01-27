# Storybook Setup for `apps/ralph-monitoring` [DERIVED] Progress Tracker

- Owner: Jake Ruesink
- Last Updated: 2026-01-26
- Status: Complete
- Task Hub: `.devagent/workspace/tasks/completed/2026-01-18_storybook-setup-ralph-monitoring/`

## Summary
Track the follow-up work required to add **Storybook** to `apps/ralph-monitoring`, so the DEV-36 design workflow can use Storybook as a repeatable UI review surface (and unblock Storybook-driven “design agent” expectations).

This hub is intentionally **coordination + checklist only**; implementation will happen in a separate engineering pass once dependencies are satisfied.

Plan drafted: `.devagent/workspace/tasks/completed/2026-01-18_storybook-setup-ralph-monitoring/plan/2026-01-18_storybook-setup-ralph-monitoring-plan.md`.
Beads epic created for execution tracking: `devagent-20e9`.

## Agent Update Instructions
- Always update "Last Updated" to today's date (ISO: YYYY-MM-DD) when editing this file. **Get the current date by explicitly running `date +%Y-%m-%d` first, then use the output for the "Last Updated" field.**
- Progress Log: Append a new entry at the end in the form `- [YYYY-MM-DD] Event: concise update, links to files`. Do not rewrite or delete prior entries. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- Implementation Checklist: Mark items as `[x]` when complete, `[~]` for partial with a short note. Add new items if discovered; avoid removing items—strike through only when obsolete.
- Key Decisions: Record important decisions as `- [YYYY-MM-DD] Decision: rationale, links`. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- References: Keep links current to latest spec, research, and tasks. Add additional references as they are created.
- Scope: Edits here should reflect coordination/progress only; do not include application code changes. Preserve history.

## Explicit Dependencies (Blockers / Prereqs)

### Internal (DevAgent / Ralph workflow)
- **`storybook` skill exists and is synced**: ensure the Storybook skill is available via `.cursor/skills/storybook` (manifest-driven).
- **`agent-browser` skill exists and is synced**: required for any UI verification that needs browser automation + screenshots.
- **Expectations + run hubs exist for ralph-e2e** (if Storybook becomes part of a formal “design verification” loop):
  - `.devagent/workspace/tests/` structure exists
  - expectation docs describe when to use Storybook vs. in-app routes

### External (Reference implementation)
- **Reportory Storybook reference**: a concrete repo/path/snippet for the “known-good” Storybook setup pattern to copy (builder choice, config patterns, scripts, add-ons).

## Key Decisions
- [2026-01-18] Decision: Prefer `@storybook/react-vite` (Storybook + Vite) for `apps/ralph-monitoring` to match the existing Vite + Tailwind v4 plugin toolchain. See research: `.devagent/workspace/tasks/completed/2026-01-18_storybook-setup-ralph-monitoring/research/2026-01-18_storybook-setup-ralph-monitoring-research.md`.
- [2026-01-18] Decision: TBD — Decide whether Storybook lives as app-local scripts only (`apps/ralph-monitoring/package.json`) or is also exposed via repo-level `turbo` tasks.

## Implementation Checklist (for the future engineering pass)
- [ ] Confirm the reference implementation source (Reportory repo/path) and capture the minimum copied config approach.
- [ ] Add Storybook deps to `apps/ralph-monitoring` (prefer Vite builder):
  - `storybook`, `@storybook/react-vite`, and any required addons.
- [ ] Create `.storybook/` config under `apps/ralph-monitoring`:
  - `main.ts` (stories globs, addons, framework, Vite config hooks)
  - `preview.ts` (global decorators, theme, global CSS import)
- [ ] Ensure Tailwind + app globals render correctly in Storybook:
  - import `app/globals.css` (or an equivalent storybook-only CSS entry).
- [ ] Add example stories for the existing UI surface:
  - `app/components/ui/*` (e.g., `button`, `select`, `card`, `badge`, `input`, `sonner`)
  - one higher-level “page-ish” component if helpful (e.g., `TaskCardSkeleton`, `LogViewer`)
- [ ] Add scripts to `apps/ralph-monitoring/package.json` (names to finalize):
  - `storybook` (dev)
  - `build-storybook` (static build)
- [ ] Document “how to use Storybook for design review” in the relevant skill(s).

## Verification (when implemented)
- Repo-level quality gates:
  - `bun run lint`
  - `bun run typecheck`
  - `bun run test`
- App-level checks:
  - `bun run lint --filter ralph-monitoring` (via turbo) OR `cd apps/ralph-monitoring && bun run lint`
  - `cd apps/ralph-monitoring && bun run test`
  - `cd apps/ralph-monitoring && bun run typecheck`
- Storybook-specific:
  - `cd apps/ralph-monitoring && bun run build-storybook` (once added)

## Progress Log
- [2026-01-18] Event: Created follow-up task hub scaffold for Storybook setup in `apps/ralph-monitoring`. Reference research: `.devagent/workspace/tasks/active/DEV-36_review-linear-issue/research/2026-01-18_dev-36-skills-agent-browser-storybook-ralph-e2e.md`.
- [2026-01-18] Event: Captured Storybook setup research (Vite builder, Tailwind v4, TS path aliasing, RR7 caveats) for `apps/ralph-monitoring`: `.devagent/workspace/tasks/completed/2026-01-18_storybook-setup-ralph-monitoring/research/2026-01-18_storybook-setup-ralph-monitoring-research.md`.
- [2026-01-18] Event: Drafted Storybook implementation plan: `.devagent/workspace/tasks/completed/2026-01-18_storybook-setup-ralph-monitoring/plan/2026-01-18_storybook-setup-ralph-monitoring-plan.md`.
- [2026-01-18] Event: Created Beads epic `devagent-20e9` for Storybook setup execution tracking.
- [2026-01-26] Event: Task moved to completed. Updated all status references and file paths from active/ to completed/ throughout task directory.

## References
- Research: `.devagent/workspace/tasks/active/DEV-36_review-linear-issue/research/2026-01-18_dev-36-skills-agent-browser-storybook-ralph-e2e.md` (2026-01-18)
- Research: `.devagent/workspace/tasks/completed/2026-01-18_storybook-setup-ralph-monitoring/research/2026-01-18_storybook-setup-ralph-monitoring-research.md` (2026-01-18)
- Plan: `.devagent/workspace/tasks/completed/2026-01-18_storybook-setup-ralph-monitoring/plan/2026-01-18_storybook-setup-ralph-monitoring-plan.md` (2026-01-18)
- Beads epic: `devagent-20e9` (2026-01-18)
- App package scripts: `apps/ralph-monitoring/package.json` (verify `lint`, `typecheck`, `test`)
