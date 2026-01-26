# Clarified Requirement Packet — Storybook setup for `apps/ralph-monitoring`

- Requestor: Jake Ruesink
- Decision Maker: Jake Ruesink
- Date: 2026-01-18
- Mode: Task Clarification
- Status: Complete (with open items)
- Related Task Hub: `.devagent/workspace/tasks/active/2026-01-18_storybook-setup-ralph-monitoring/`
- Prior work:
  - Research: `.devagent/workspace/tasks/active/2026-01-18_storybook-setup-ralph-monitoring/research/2026-01-18_storybook-setup-ralph-monitoring-research.md`
  - Task hub: `.devagent/workspace/tasks/active/2026-01-18_storybook-setup-ralph-monitoring/AGENTS.md`
  - Cursor rules: `.cursor/rules/storybook.mdc`
  - Ralph skill: `.devagent/plugins/ralph/skills/storybook/SKILL.md`

## Task Overview

### Context
- **Task name/slug:** `2026-01-18_storybook-setup-ralph-monitoring`
- **Trigger / why now:** Provide a repeatable UI review surface (Storybook) to support DEV-36 “design agent” workflow expectations.
- **Stakeholders (known):**
  - Jake Ruesink (Decision Maker)
  - Ralph “design agent” workflow consumers (TBD)
- **Clarification scope:** Gap-filling + requirements review for a technical setup task (confirm scope boundaries + definition of done).

### Clarification Sessions
- Session 1: 2026-01-18 — (in progress)

---

## Clarified Requirements

### Scope & End Goal

**What needs to be done? (current understanding)**
- Add Storybook to `apps/ralph-monitoring` and ensure it runs with the app’s Vite/Tailwind/TS alias setup.

**End state**
- App-local `.storybook/` exists under `apps/ralph-monitoring`
- `bun run storybook` and `bun run build-storybook` work (exact command names TBD)
- Storybook renders Tailwind v4 styles consistent with the app (`app/globals.css`)
- Stories exist for initial UI surface (likely `app/components/ui/*`)

**In-scope (draft)**
- Storybook installed for the app using the Vite framework (`@storybook/react-vite`).
- Tailwind v4 + global CSS loading in Storybook.
- TS alias support for `~/*` in Storybook builds.
- A starter set of stories for the component library.

**Out-of-scope (draft)**
- Writing stories for RR7 route modules (avoid `./+types/*` coupling).
- Making Storybook part of a formal `ralph-e2e` loop (unless explicitly requested later).

---

### Technical Constraints & Requirements

- Must be compatible with `apps/ralph-monitoring` toolchain: Vite + RR7 framework mode + Tailwind v4 + Bun.
- Prefer deterministic stories; avoid live network by default.

---

### Dependencies & Blockers

- External reference: Reportory “known-good” Storybook setup (🚧 blocked — path/snippets not yet provided).

---

### Implementation Approach (draft)

- Use Storybook with Vite (`@storybook/react-vite`).
- Import `../app/globals.css` in `.storybook/preview.ts`.
- Use `viteFinal()` to add:
  - `vite-tsconfig-paths()` for `~/*`
  - Tailwind Vite plugin (to match app behavior)
- Prefer component stories; add router/theme decorators only when needed.

---

### Acceptance Criteria & Verification (draft)

- `cd apps/ralph-monitoring && bun run storybook` starts and loads stories without errors.
- `cd apps/ralph-monitoring && bun run build-storybook` succeeds.
- `Button`/`Input`/`Select` stories render with correct Tailwind styling.
- Interaction test command runs locally and is stable enough for agent feedback loops (exact command TBD).

---

## Assumptions Log

| Assumption | Owner | Validation Required | Validation Method | Due Date | Status |
| --- | --- | --- | --- | --- | --- |
| Storybook should be app-local (not repo-global) | Jake | No | Decision | 2026-01-18 | Pending |
| First stories should focus on `app/components/ui/*` | Jake | No | Decision | 2026-01-18 | Pending |
| Storybook should not import RR7 route modules | Eng | No | Convention (avoid typegen coupling) | 2026-01-18 | Pending |

---

## Gaps Requiring Research

- None identified beyond what’s already captured in the task research packet.

---

## Question Tracker

| ID | Question | Status | Notes |
| --- | --- | --- | --- |
| Q1 | What is the “definition of done” for Storybook in this repo: local-only vs CI/static build? | ✅ answered | **B** — Local dev + static build |
| Q2 | What story coverage is required initially (UI primitives only vs include higher-level components/decorators)? | ✅ answered | **B + C** — UI primitives + 1–2 “page-ish” components; include Theme + Router decorators from day one |
| Q3 | Should Storybook be integrated into Turbo pipeline at repo root? | ✅ answered | **A** — Yes, wire into Turbo now |
| Q4 | Who are the stakeholders besides Jake (design/QA/eng)? | ❓ unknown | Needed for review expectations |
| Q5 | Do we have a Reportory reference repo/path to mirror? | 🚧 blocked | Needed to copy a known-good setup |
| Q6 | Which “page-ish” components should be included in the first pass? | ✅ answered | “As many as make sense for the current app right now” (Jake) |
| Q7 | What Storybook addons/features are required for the first pass? | ✅ answered | **Interaction testing** (Jake) |
| Q8 | How should Turbo/CI treat Storybook initially? | ✅ answered | **Turbo tasks only; CI integration later** (Jake) |
| Q9 | What’s the selection rule/cap for “page-ish” stories in the first pass? | ✅ answered | **C** — only components already used on the main UI surfaces (Jake) |
| Q10 | What should the interaction testing loop look like for agents? | ✅ answered | **B** — single local command + add a short runbook section in the Storybook skill for how agents run it + what to paste into comments (Jake) |
| Q11 | Do we need network mocking (MSW) in the first pass? | 🚧 blocked | Jake referenced a Reportory approach for mocking RR7 actions/loaders; needs Reportory path/snippets to decide (Jake) |
| Q12 | Which approach should we implement for mocking? | ✅ answered | **A** — router-level stubs that provide mocked actions/loaders (Jake) |
| Q13 | Should Turbo include an interaction-testing task? | ✅ answered | **A** — add `test-storybook` (or equivalent) to Turbo now (Jake) |
| Q14 | Which routes/pages count as the “main UI surfaces” for scope selection? | ⏭️ deferred | Not finalized; OK to resolve during implementation by inspecting what components are used by the chosen “main surfaces” |

---

## Clarification Session Log

### Session 1: 2026-01-18
**Participants:** Jake Ruesink (Decision Maker), DevAgent

**Questions Asked:**
1. Q1 (DoD) → **B**: local dev + static build (Jake)
2. Q2 (coverage) → **B + C**: UI primitives + 1–2 “page-ish” components; include Theme + Router decorators (Jake)
3. Q3 (Turbo) → **A**: wire into Turbo now (Jake)
4. Q6 (“page-ish” component selection) → “as many that make sense for our current app right now” (Jake)
5. Q7 (addons) → **C**: interaction testing is helpful for agent feedback loops (Jake)
6. Q8 (Turbo/CI) → **A**: Turbo tasks only; CI integration later (Jake)
7. Q9 (page-ish selection rule) → **C**: only components already used on the main UI surfaces (Jake)
8. Q10 (agent interaction loop) → **B**: single local command + runbook section in Storybook skill for agent usage and comment format (Jake)
9. Q11 (mocking) → Blocked on Reportory reference; Reportory has a good pattern to mock RR7 actions/loaders in Storybook (Jake)
10. Q12 (mocking approach) → **A**: router-level stubs with mocked actions/loaders (Jake)
11. Q13 (Turbo interaction tests) → **A**: include interaction testing task in Turbo now (Jake)

**Unresolved Items:**
- Reportory Storybook reference location (repo/path/snippets)
  - Specific ask: where in Reportory is the Storybook RR7 action/loader mocking pattern implemented, and what does the pattern look like?
- Definition of “main UI surfaces” routes list (deferred; can be determined by inspecting the UI entry points)

---

## Next Steps

### Good-to-include checklist (captured so far)
- **Dependencies** added to `apps/ralph-monitoring` for Storybook (Vite framework)
- **App-local `.storybook/`** config under `apps/ralph-monitoring/.storybook/`
- **Tailwind v4 + app globals** render in Storybook (import `app/globals.css`)
- **TS path aliases** (`~/*`) work in stories
- **Global decorators available from day one**
  - Theme (matches app’s `ThemeProvider` usage)
  - Router (so RR7 components like `Link` can render)
- **Initial story surface**
  - `app/components/ui/*` primitives
  - 1–2 “page-ish” components (TBD which ones)
- **Scripts**
  - `storybook` (dev)
  - `build-storybook` (static build)
- **Repo-level Turbo tasks**
  - `turbo run storybook` / `turbo run build-storybook` (exact naming TBD)
- **Verification gates**
  - Storybook dev starts
  - Storybook static build succeeds
- **Interaction testing feedback loop**
  - Stories include interaction coverage where it makes sense
  - There is a repeatable command to run interaction tests locally (exact command TBD)
- **Agent runbook**
  - Document in `.devagent/plugins/ralph/skills/storybook/SKILL.md`: how to run interaction tests + what evidence to paste into Beads comments
- **Mocking approach**
  - Prefer router-level stubs (mock RR7 actions/loaders) for Storybook isolation
- **Turbo tasks**
  - `storybook`, `build-storybook`, and an interaction test task (e.g., `test-storybook`)

### Draft task breakdown (requirements-level)
- **Task 1 — Add Storybook dependencies and scripts**
  - Add Storybook deps to `apps/ralph-monitoring`
  - Add `storybook` + `build-storybook` scripts
- **Task 2 — Create Storybook config**
  - Add `apps/ralph-monitoring/.storybook/main.ts`
  - Add `apps/ralph-monitoring/.storybook/preview.ts` (imports `../app/globals.css`)
  - Ensure Vite config supports `~/*` and Tailwind v4
- **Task 3 — Add global decorators**
  - Theme decorator (align with `next-themes` usage in app)
  - Router decorator (RR7-friendly)
- **Task 4 — Add starter stories**
  - Stories for `app/components/ui/*`
  - Stories for “page-ish” components used on the main UI surfaces (final selection TBD)
- **Task 4b — Add interaction testing coverage**
  - Add interaction tests for at least the most important primitives (e.g., button focus/keyboard) and any “page-ish” story where it adds value
  - Add a repeatable local test command (e.g., `test-storybook`, exact naming TBD)
- **Task 4c — Add agent runbook**
  - Update Storybook skill with a short, copy/paste-friendly section: command(s) to run + what to include in Beads comments when interaction tests pass/fail
- **Task 4d — Add router-level mocking**
  - Add a Storybook-friendly pattern to run components under a router with mocked RR7 actions/loaders (no real network)
- **Task 5 — Wire Turbo tasks (repo-level)**
  - Add Turbo pipeline tasks that run Storybook commands in `apps/ralph-monitoring`
- **Task 5b — Wire Turbo interaction testing**
  - Add a Turbo task that runs Storybook interaction tests in `apps/ralph-monitoring`
- **Task 6 — Verification**
  - Confirm dev + static build pass; document any known limitations (e.g., “interactive-only” stories)
  - Confirm interaction tests run locally (CI integration deferred)

### Spec Readiness Assessment
**Status:** ⬜ Ready for Spec | ⬜ Research Needed | ⬜ More Clarification Needed

**Current assessment:** ⬜ Ready for Spec — remaining items are implementation-detail selection (which routes define “main UI surfaces”) and optional reference-copying from Reportory.

**Notes / open items for the plan:**
- Route list for “main UI surfaces” can be settled by choosing the canonical entry routes (likely task list + task detail) and auditing which components they render.
- Reportory reference is still useful to copy a known-good mocking pattern, but we can proceed with a router-stub approach without it.

---

## Change Log

- 2026-01-18: Created initial clarification packet from task hub + research.

