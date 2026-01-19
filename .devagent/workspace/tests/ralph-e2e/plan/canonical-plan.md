# Ralph E2E Canonical Throwaway Project Plan — “Memory Match Arcade”

- Owner: DevAgent / Ralph E2E loop
- Last Updated: 2026-01-19
- Status: Draft
- Related Task Hub: `.devagent/workspace/tests/ralph-e2e/`
- Stakeholders: Jake Ruesink (Requestor, Decision Maker)
- Notes: This is intentionally a **safe throwaway** plan that only touches the `apps/ralph-monitoring` UI app and does not require external services.

---

## PART 1: PRODUCT CONTEXT

### Summary
Add a small, deterministic “Memory Match” mini-game to the `apps/ralph-monitoring` app under a new `/arcade` route. This provides a repeatable, low-risk surface to exercise the full Ralph loop (Plan → Beads setup → engineering execution → QA evidence capture) without impacting core DevAgent workflows.

### Context & Problem
We need a single stable plan that can be executed repeatedly to validate Ralph’s end-to-end loop and agent handoffs. Using a mini-game avoids entanglement with Beads DB, external APIs, and “real product” semantics, while still testing core engineering behaviors: routing changes, UI state management, unit/component tests, and QA screenshot capture via `agent-browser`.

### Objectives & Success Metrics
- **Repeatability**: The same plan can be run multiple times with comparable results and predictable UI states.
- **Safety**: No changes outside `apps/ralph-monitoring/` other than test evidence in the `ralph-e2e` run folder.
- **Verification**: Changes are covered by tests and QA screenshots captured with `agent-browser`.
- **Quality gates**: Repo quality gates succeed: `bun run test`, `bun run lint`, `bun run typecheck`.

### Users & Insights
- **Primary users**: DevAgent maintainers evaluating Ralph’s workflow correctness and agent performance.
- **Insight**: A deterministic UI with a clear “win state” makes QA evidence capture straightforward and reduces flakiness.

### Solution Principles
- **Deterministic by default**: Game layout should be stable across refresh (seeded shuffle) to make QA + tests reliable.
- **No external dependencies**: No network calls, no DB access, no assets pipeline requirements.
- **Accessible UI**: Buttons and status text should be reachable via keyboard and discoverable with accessible names.
- **Minimal incidental complexity**: Avoid timers and animation-heavy behavior; focus on correctness and testability.

### Scope Definition
- **In Scope:**
  - Add `/arcade` route to `apps/ralph-monitoring` with a Memory Match mini-game.
  - Add a navigation entry from the home page to `/arcade`.
  - Add tests for deterministic shuffle and main UI behaviors.
  - QA run captures screenshots for key states using `agent-browser`.
- **Out of Scope / Future:**
  - Multiplayer, leaderboards, persistence, timers/WPM scoring.
  - Storybook setup (tracked separately).
  - Any changes to Beads DB behavior or DevAgent core workflows.

### Functional Narrative

#### Flow: Play Memory Match
- Trigger: User navigates to `/arcade` from the app’s home page.
- Experience narrative:
  - User sees a “Memory Match” page with a “New game” button and a deterministic “Seed” value (default seed if none provided).
  - User clicks/taps cards to reveal them.
  - If two revealed cards match, they remain revealed. If they do not match, they flip back on the next selection.
  - The UI shows “Moves” and “Matches” counters, and a clear “You win” state when all pairs are matched.
  - User can restart using “New game” (reshuffle based on a new seed).
- Acceptance criteria:
  - Route renders without errors.
  - Game is playable with keyboard and mouse.
  - Win state is clearly presented and can be screenshot reliably.

### Technical Notes & Dependencies (Optional)
- Target app: `apps/ralph-monitoring/` (React Router v7 framework mode + Vite + Tailwind v4 + Vitest).
- Determinism: implement a small seeded PRNG + shuffle helper in-app (no new deps).

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- Scope focus: Add a new route + UI-only feature inside `apps/ralph-monitoring`.
- Key assumptions:
  - We can add a new route entry in `apps/ralph-monitoring/app/routes.ts`.
  - QA can run `agent-browser` locally for screenshot capture.
- Out of scope:
  - Database changes, API changes, and changes to Beads/Ralph core tooling.

### Implementation Tasks

#### Task 1: Add `/arcade` route and homepage entry point
- **Objective:** Create a new route for the mini-game and make it discoverable from the home page.
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/routes.ts`
  - `apps/ralph-monitoring/app/routes/arcade.tsx` (new)
  - `apps/ralph-monitoring/app/routes/_index.tsx` (add link/button to Arcade)
- **References:**
  - React Router v7 route config patterns (`apps/ralph-monitoring/app/routes.ts`)
  - Workspace rule: `./+types/<route>` imports only (React Router v7)
- **Dependencies:** None
- **Acceptance Criteria:**
  - Navigating to `/arcade` renders a page titled “Memory Match”.
  - The home page includes a visible link/button to `/arcade`.
  - Route type import uses `import type { Route } from "./+types/arcade";` (generated by RR7 typecheck).
- **Testing Criteria:**
  - `cd apps/ralph-monitoring && bun run typecheck` passes after adding the route.
- **Validation Plan:**
  - Manually navigate to `/arcade` in dev server and confirm the page renders.

#### Task 2: Implement deterministic Memory Match game UI + logic
- **Objective:** Build the playable mini-game with deterministic seeded shuffle and a clear win state.
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/routes/arcade.tsx`
  - `apps/ralph-monitoring/app/lib/arcade/memory-match.ts` (new; pure logic helpers)
  - (Optional) `apps/ralph-monitoring/app/components/` (small reusable UI bits, if needed)
- **References:**
  - Existing `apps/ralph-monitoring/app/components/ui/*` shadcn-style primitives (Button/Card/Badge)
- **Dependencies:** Task 1
- **Acceptance Criteria:**
  - Game uses a seeded shuffle (default seed) so the initial board is stable for tests.
  - Clicking two matching cards keeps them revealed; non-matching pairs revert on the next selection.
  - UI shows counters: moves and matched pairs.
  - When all pairs are matched, a “You win” message is shown and the board is fully revealed/locked.
  - “New game” resets state and updates the seed (or allows passing `?seed=` for reproducibility).
- **Testing Criteria:**
  - No new dependencies added.
  - UI remains usable on mobile viewport widths (basic responsive layout).
- **Validation Plan:**
  - Manual playthrough to win state.

#### Task 3: Add tests for shuffle determinism and core interactions
- **Objective:** Ensure the mini-game is covered by repeatable tests (logic + UI).
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/lib/arcade/__tests__/memory-match.test.ts` (new)
  - `apps/ralph-monitoring/app/routes/__tests__/arcade.test.tsx` (new)
- **References:**
  - Existing testing patterns in `apps/ralph-monitoring/app/routes/__tests__/`
  - Workspace testing best practices (Testing Library + Vitest)
- **Dependencies:** Task 2
- **Acceptance Criteria:**
  - Logic test proves: same seed → same shuffled deck; different seed → different deck.
  - Route test proves: page renders; “New game” resets; win state can be reached by deterministic interactions (or by seeding a trivial deck in test).
- **Testing Criteria:**
  - `cd apps/ralph-monitoring && bun run test` passes.
- **Validation Plan:**
  - Run app tests and confirm new coverage is included.

#### Task 4: QA verification with `agent-browser` + screenshots (ralph-e2e policy)
- **Objective:** Capture evidence of the new feature in a resettable, comparable way.
- **Impacted Modules/Files:**
  - (No code changes expected)
  - Evidence output under: `.devagent/workspace/tests/ralph-e2e/runs/YYYY-MM-DD_<beads-epic-id>/screenshots/arcade/`
- **References:**
  - `/.devagent/workspace/tests/ralph-e2e/expectations/expectations.md` (QA evidence + fail semantics)
  - `agent-browser` skill (screenshot path conventions for `ralph-e2e`)
- **Dependencies:** Task 3
- **Acceptance Criteria:**
  - Screenshots captured for: initial `/arcade` screen, mid-game (two revealed), win state.
  - Beads task comment includes: pass/fail, expected vs actual notes if failing, and screenshot paths.
  - If QA fails: set task status back to `open` (do not set `blocked` in MVP).
- **Testing Criteria:**
  - N/A (manual QA), but must include evidence paths.
- **Validation Plan:**
  - Reviewer can open screenshots from repo paths and corroborate behavior.

### Implementation Guidance (Optional)
- **Quality gates (repo-level):**
  - `bun run test`
  - `bun run lint`
  - `bun run typecheck`
- **Quality gates (app-level quick checks):**
  - `cd apps/ralph-monitoring && bun run test`
  - `cd apps/ralph-monitoring && bun run lint`
  - `cd apps/ralph-monitoring && bun run typecheck`

---

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Route type generation friction after adding new route | Risk | Engineering agent | Run `cd apps/ralph-monitoring && bun run typecheck` to generate `./+types/arcade` | During Task 1 |

---

## Progress Tracking
For `ralph-e2e` runs, store screenshots under `/.devagent/workspace/tests/ralph-e2e/runs/YYYY-MM-DD_<beads-epic-id>/` and record pass/fail outcomes in Beads comments referencing the expectations version.

