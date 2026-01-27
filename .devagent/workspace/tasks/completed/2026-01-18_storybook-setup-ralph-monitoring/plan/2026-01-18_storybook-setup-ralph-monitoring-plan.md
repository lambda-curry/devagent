# Storybook Setup for `apps/ralph-monitoring` Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-18
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/completed/2026-01-18_storybook-setup-ralph-monitoring/`
- Stakeholders: Jake Ruesink (Decision Maker), Ralph design-agent workflow consumers (TBD)
- Notes: Reportory reference path/snippets are still blocked; plan proceeds with a generic RR7 router-stub approach.

---

## PART 1: PRODUCT CONTEXT

### Summary
Add Storybook to `apps/ralph-monitoring` (RR7 + Vite + Tailwind v4 + Bun) so the design-agent workflow has a repeatable UI review surface. The plan focuses on app-local Storybook dev + static build, initial story coverage for UI primitives and page-ish components, and a single local interaction-testing command wired into Turbo.

### Context & Problem
Design-oriented workflows need a consistent UI artifact; today `apps/ralph-monitoring` has no Storybook surface. The app’s Vite + Tailwind v4 setup and RR7 typegen constraints mean Storybook must mirror Tailwind plugins, preserve `~/*` aliases, and avoid route module imports. Reference research and clarification for constraints and locked decisions: `.devagent/workspace/tasks/completed/2026-01-18_storybook-setup-ralph-monitoring/research/2026-01-18_storybook-setup-ralph-monitoring-research.md`, `.devagent/workspace/tasks/completed/2026-01-18_storybook-setup-ralph-monitoring/clarification/2026-01-18_initial-clarification.md`.

### Objectives & Success Metrics
- Storybook dev server starts locally for `apps/ralph-monitoring` with Tailwind v4 styles and `~/*` imports working.
- Static Storybook build succeeds locally.
- Initial story coverage exists for UI primitives and page-ish components that appear on main UI surfaces.
- Interaction testing runs via a single local command and is wired into Turbo.
- Storybook skill runbook includes an agent-friendly interaction test loop and evidence format.

### Users & Insights
- Primary users: Ralph design-agent workflow consumers and engineers reviewing UI changes.
- Insight: Deterministic, component-scoped stories are required to avoid RR7 typegen coupling and unreliable network dependencies.

### Solution Principles
- Keep stories component-scoped (avoid RR7 route modules and `./+types/*`).
- Tailwind v4 must render identically to the app (`app/globals.css` + Tailwind Vite plugin).
- Always support `~/*` alias resolution in Storybook.
- Prefer deterministic stories with router-level stubs over live network access.

### Scope Definition
- **In Scope:** App-local Storybook config, Tailwind + alias support, router/theme decorators, UI primitive stories, page-ish component stories, interaction tests, Turbo task wiring, and Storybook skill runbook updates.
- **Out of Scope / Future:** CI integration, Chromatic/visual regression, RR7 route module stories, production rollout work.

### Functional Narrative
#### Storybook dev loop
- Trigger: `bun run storybook` (or Turbo wrapper).
- Experience narrative: Storybook loads with app styling, UI primitives and page-ish components render deterministically, router context available via decorator.
- Acceptance criteria: No build-time alias/Tailwind errors; components render without relying on RR7 route modules or network.

#### Static build loop
- Trigger: `bun run build-storybook`.
- Experience narrative: Static build succeeds locally with identical styling to dev mode.
- Acceptance criteria: Build completes without RR7 typegen errors or missing CSS.

#### Interaction testing loop
- Trigger: single local command (e.g., `bun run test-storybook` or `bun run storybook:test`).
- Experience narrative: Interaction tests run against built stories; results are copy/pastable for Beads comments.
- Acceptance criteria: At least a minimal set of interaction tests runs reliably for selected primitives/page-ish stories.

### Technical Notes & Dependencies (Optional)
- Blocker: Reportory Storybook reference path/snippets are missing. Proceed with generic RR7 router-stub approach and leave a follow-up note for alignment.
- RR7 typegen coupling: avoid importing `app/routes/*` in stories; prefer component-level stories with router decorator.
- Interaction testing requires selecting the correct Storybook runner/command for v8 + Vite.

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- Scope focus: App-local Storybook setup for `apps/ralph-monitoring` with Turbo integration.
- Key assumptions: `@storybook/react-vite` is the framework; Tailwind v4 uses `@tailwindcss/vite`; RR7 route modules are excluded from stories.
- Out of scope: CI integration, Chromatic, and RR7 route module stories.

### Implementation Tasks

#### Task 1: Add Storybook deps, scripts, and Turbo tasks
- **Objective:** Install Storybook for the app and expose Storybook commands via Turbo.
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/package.json`
  - `turbo.json`
  - `apps/ralph-monitoring/package.json` (scripts: `storybook`, `build-storybook`, interaction test command)
- **References:** `.devagent/workspace/tasks/completed/2026-01-18_storybook-setup-ralph-monitoring/research/2026-01-18_storybook-setup-ralph-monitoring-research.md`
- **Dependencies:** Task 2 for config; Task 4 for stories; Task 5 for runbook.
- **Acceptance Criteria:**
  - Storybook dependencies added for `@storybook/react-vite` and required addons (including interaction testing support).
  - App-level scripts added for `storybook`, `build-storybook`, and a single interaction-test command.
  - Turbo pipeline includes Storybook dev/build and interaction-test tasks for `apps/ralph-monitoring`.
- **Testing Criteria:**
  - `cd apps/ralph-monitoring && bun run storybook` starts (after Task 2).
  - `cd apps/ralph-monitoring && bun run build-storybook` completes (after Task 2).
  - `cd apps/ralph-monitoring && bun run <interaction-test-command>` runs (after Task 4).
- **Validation Plan:** Run app-level commands and `turbo run storybook --filter ralph-monitoring` once config is complete.

#### Task 2: Create Storybook config aligned to Vite + Tailwind v4
- **Objective:** Implement `.storybook/main.ts` and `.storybook/preview.ts` with Tailwind + TS alias support.
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/.storybook/main.ts`
  - `apps/ralph-monitoring/.storybook/preview.ts`
  - `apps/ralph-monitoring/app/globals.css` (imported)
- **References:** `.cursor/rules/storybook.mdc`
- **Dependencies:** Task 1 dependencies installed.
- **Acceptance Criteria:**
  - `preview.ts` imports `../app/globals.css` so Tailwind v4 renders in Storybook.
  - `main.ts` uses `@storybook/react-vite` and `viteFinal()` to add `vite-tsconfig-paths()` plus Tailwind Vite plugin.
  - Stories glob targets component-level stories (`app/components/**`) and avoids route modules.
- **Testing Criteria:**
  - Storybook dev loads with Tailwind styles and `~/*` imports resolve.
- **Validation Plan:** Run `bun run storybook` and confirm CSS renders with a known UI primitive.

#### Task 3: Add router/theme decorators and router-level stubs
- **Objective:** Provide reusable decorators and a router stub pattern for deterministic Storybook stories.
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/.storybook/preview.ts`
  - `apps/ralph-monitoring/app/components/ThemeProvider.tsx` (imported into decorator)
  - `apps/ralph-monitoring/app/lib/storybook/*` (new helpers for router stubs)
- **References:** `.cursor/rules/storybook.mdc`, `.cursor/rules/react-router-7.mdc`
- **Dependencies:** Task 2 config exists.
- **Acceptance Criteria:**
  - Global decorator wraps stories in ThemeProvider and a MemoryRouter/RouterProvider.
  - Provide router-level stub helpers for mocked RR7 loaders/actions (no live network by default).
  - Document how to opt out or override router stubs for browser-API-heavy components.
- **Testing Criteria:**
  - A story using `Link` renders without runtime errors.
  - A story with mocked loader/action renders without live network.
- **Validation Plan:** Add a sample story that exercises router context and mocked loader behavior.

#### Task 4: Add initial stories + interaction tests
- **Objective:** Cover UI primitives and page-ish components from main UI surfaces, with interaction tests where meaningful.
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/components/ui/*.stories.tsx`
  - `apps/ralph-monitoring/app/components/*.stories.tsx` (page-ish components)
- **References:** `.devagent/workspace/tasks/completed/2026-01-18_storybook-setup-ralph-monitoring/clarification/2026-01-18_initial-clarification.md`
- **Dependencies:** Task 2 config; Task 3 decorators.
- **Acceptance Criteria:**
  - UI primitives stories exist for `app/components/ui/*` (e.g., Button, Badge, Card, Input, Select, Skeleton, Sonner).
  - Page-ish stories include components already used on “main UI surfaces.” Begin by auditing (read-only) `apps/ralph-monitoring/app/routes/_index.tsx` and `apps/ralph-monitoring/app/routes/tasks.$taskId.tsx` to determine qualifying components (likely `TaskCardSkeleton`, `LogViewer`, etc.).
  - At least a minimal set of interaction tests is implemented using Storybook’s interaction APIs (`play` function with user events).
  - Browser-API-heavy components are either mocked via decorators/stubs or explicitly skipped with rationale.
- **Testing Criteria:**
  - Run Storybook dev and confirm target stories render with correct styling.
  - Run the interaction-test command and capture pass/fail output.
- **Validation Plan:** Use the interaction-test command on a subset of stories and record results.

#### Task 5: Update Storybook skill runbook (agent feedback loop)
- **Objective:** Document the single interaction-test command and Beads evidence format for agents.
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/skills/storybook/SKILL.md`
- **References:** `.devagent/plugins/ralph/skills/storybook/SKILL.md`
- **Dependencies:** Task 1 interaction test command finalized.
- **Acceptance Criteria:**
  - Runbook section added describing the exact command agents run locally.
  - Include a copy/paste-friendly evidence format for Beads comments (command, result summary, failing story names if any).
- **Testing Criteria:**
  - Verify command reference matches `apps/ralph-monitoring/package.json`.
- **Validation Plan:** Confirm runbook matches the final script name and expected output.

### Agent Feedback Loop (for inclusion in Storybook skill)
- **Command:** `cd apps/ralph-monitoring && bun run <interaction-test-command>`
- **Evidence format to paste into Beads comments:**
  - `Command: bun run <interaction-test-command>`
  - `Result: pass/fail (include exit code)`
  - `Stories tested: <list or glob>`
  - `Failures: <story + assertion or “none”>`
  - `Notes: <any browser-api mocks or skips>`

### Implementation Guidance (Optional)
- **From `.cursor/rules/storybook.mdc` → Tailwind/alias/router guardrails:**
  - Import `apps/ralph-monitoring/app/globals.css` in `.storybook/preview.ts`, add `vite-tsconfig-paths()` in `viteFinal()`, keep stories component-scoped and avoid RR7 route modules. (`.cursor/rules/storybook.mdc`)
- **From `.cursor/rules/testing-best-practices.mdc` → Interaction testing alignment:**
  - Prefer `userEvent` for interactions and keep tests deterministic; use `createMemoryRouter` patterns for components needing router context. (`.cursor/rules/testing-best-practices.mdc`)
- **From `.cursor/rules/react-router-7.mdc` → RR7 constraints:**
  - Avoid direct route-module coupling and respect RR7’s generated types; Storybook should not depend on route module imports. (`.cursor/rules/react-router-7.mdc`)

---

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Reportory Storybook reference path/snippets missing | Risk | Jake | Proceed with generic RR7 router-stub pattern; add follow-up note to align later | Before implementation |
| “Main UI surfaces” route list not finalized | Question | Eng | Audit `app/routes/_index.tsx` and `app/routes/tasks.$taskId.tsx` to determine page-ish components | During Task 4 |
| Interaction-test command choice for Storybook v8 + Vite | Risk | Eng | Confirm supported command/addon (`@storybook/test`, `test-storybook`, or `storybook test`) before scripting | Task 1 |
| No Epic/Improvement report linked | Question | Jake | Note for tracking; optional follow-up to link in task hub | After plan review |

---

## Progress Tracking
Refer to `.devagent/workspace/tasks/completed/2026-01-18_storybook-setup-ralph-monitoring/AGENTS.md` for progress tracking instructions during implementation.

---

## Appendices & References (Optional)
- Research: `.devagent/workspace/tasks/completed/2026-01-18_storybook-setup-ralph-monitoring/research/2026-01-18_storybook-setup-ralph-monitoring-research.md`
- Clarification: `.devagent/workspace/tasks/completed/2026-01-18_storybook-setup-ralph-monitoring/clarification/2026-01-18_initial-clarification.md`
- Storybook rules: `.cursor/rules/storybook.mdc`
- Testing rules: `.cursor/rules/testing-best-practices.mdc`
- RR7 rules: `.cursor/rules/react-router-7.mdc`
- Task hub: `.devagent/workspace/tasks/completed/2026-01-18_storybook-setup-ralph-monitoring/AGENTS.md`
