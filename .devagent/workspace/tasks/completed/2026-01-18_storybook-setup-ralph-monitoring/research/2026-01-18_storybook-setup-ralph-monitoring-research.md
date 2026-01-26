# Research — Storybook setup for `apps/ralph-monitoring`

- Mode: Task
- Requested By: Jake Ruesink
- Last Updated: 2026-01-18
- Related Plan: (not yet created)
- Storage Path: `.devagent/workspace/tasks/active/2026-01-18_storybook-setup-ralph-monitoring/research/2026-01-18_storybook-setup-ralph-monitoring-research.md`
- Stakeholders: Jake Ruesink (Decision Maker), Ralph “design agent” workflow consumers

## Request Overview
Add **Storybook** to `apps/ralph-monitoring` so we have a repeatable UI review surface for design-oriented workflows (and future “design agent” expectations). Research focus: the minimum setup that works cleanly with this app’s **React Router v7 + Vite + Tailwind v4 + Bun + TS path aliases**.

## Context Snapshot
- App: `apps/ralph-monitoring` (React Router 7 app)
- Vite config: `apps/ralph-monitoring/vite.config.ts` uses `reactRouter()`, `vite-tsconfig-paths`, `@tailwindcss/vite`
- Tailwind: v4 via CSS `@import "tailwindcss";` in `apps/ralph-monitoring/app/globals.css` and Vite plugin `@tailwindcss/vite`
- TS aliases: `~/* -> app/*` (`apps/ralph-monitoring/tsconfig.json`) and shadcn alias map (`apps/ralph-monitoring/components.json`)
- Prior related research: `.devagent/workspace/tasks/completed/DEV-36_review-linear-issue/research/2026-01-18_dev-36-skills-agent-browser-storybook-ralph-e2e.md`

## Classification & Assumptions
- Classification: **Implementation design** (how to wire Storybook into this repo/app)
- Assumptions:
  - Storybook should be app-local under `apps/ralph-monitoring/` (not repo-global) for the first pass.
  - Stories will target **components**, not RR7 route modules, to avoid `.react-router` typegen coupling (`./+types/*` imports).
  - Tailwind must render identically to the app (import `app/globals.css` into Storybook).
  - [NEEDS CLARIFICATION] “Reportory Storybook reference” repo/path/snippets are not available in current task context.

## Research Plan (what was validated)
- Validate current `ralph-monitoring` build toolchain and constraints (Vite plugins, Tailwind v4, TS aliasing).
- Validate Storybook configuration primitives for React + Vite:
  - `framework: { name: '@storybook/react-vite' }`
  - `viteFinal()` for adding Vite plugins/merging config
  - importing global CSS in `preview.ts`
- Identify likely integration risks (RR7 route typegen, router context, browser-only APIs in components).

## Key Findings
- **Tailwind v4 in this app is Vite-plugin-driven** (`@tailwindcss/vite`) and `globals.css` starts with `@import "tailwindcss";`; Storybook should mirror this by importing `../app/globals.css` in `.storybook/preview.ts` and ensuring the Tailwind Vite plugin is active in Storybook’s Vite config.
- **TS path aliases are pervasive** (`~/*`), so Storybook’s Vite config should include `vite-tsconfig-paths()` (or equivalent alias mapping) in `viteFinal()`.
- **Avoid importing RR7 route modules into stories**: route files import `./+types/*` (generated); Storybook builds will fail if those types weren’t generated, and it’s unnecessary for component isolation.
- **Some components are browser-API heavy** (e.g., `LogViewer` uses `EventSource`, `fetch`, `navigator.clipboard`, `document`, `window`), so Storybook should either:
  - focus stories on UI primitives and “pure-ish” components first, or
  - use mocks (MSW / decorators) and explicit “interactive-only” story guidance.

## Detailed Findings

### RQ1 — Where should Storybook live in this monorepo?
**Answer:** App-local under `apps/ralph-monitoring` is the lowest-risk first step.

**Evidence:**
- App already has its own build/test scripts and toolchain (`apps/ralph-monitoring/package.json`).
- No existing Storybook config found in repo (per DEV-36 research).

**Implication:** Add `.storybook/` and Storybook deps in the app package first; optionally add Turbo pipeline exposure later once stable.

### RQ2 — What Storybook framework/builder matches this app’s tooling?
**Answer:** Use **React + Vite**: `@storybook/react-vite`.

**Evidence (external):**
- Storybook React-Vite config uses `framework: { name: "@storybook/react-vite" }` and TS-typed `StorybookConfig`. (Storybook docs v8.6.14)

### RQ3 — How do we keep Tailwind + global styling consistent?
**Answer:** Import `app/globals.css` in `.storybook/preview.ts`, and ensure Tailwind’s build integration exists in Storybook’s Vite config.

**Evidence:**
- App CSS entrypoint is `apps/ralph-monitoring/app/globals.css` and already includes Tailwind v4 import (`@import "tailwindcss";`).
- Storybook supports importing global styles in `preview.ts`. (Storybook docs v8.6.14)

**Freshness note:** Tailwind v4 usage here is current as of `apps/ralph-monitoring/package.json` (`tailwindcss` and `@tailwindcss/vite`).

### RQ4 — How do we handle `~/*` imports in stories?
**Answer:** Use Vite’s TS path support in Storybook’s Vite config (`vite-tsconfig-paths()` in `viteFinal()`).

**Evidence:**
- `apps/ralph-monitoring/tsconfig.json` defines `~/*` paths.
- Many components import from `~/...` (repo grep results).

### RQ5 — How do we handle Router dependencies in components?
**Answer:** Provide a Storybook decorator that wraps stories in a router (prefer `createMemoryRouter` + `RouterProvider` so RR7 hooks/components work).

**Evidence:**
- App uses React Router v7 (`react-router` dependency).
- Even if the first stories are mostly UI primitives, higher-level components and future stories will likely render `Link`, `NavLink`, or `useNavigate`.

**Practical recommendation:** Start with “no-router-needed” stories (`app/components/ui/*`), then add a router decorator when you introduce stories that need it.

## Comparative / Alternatives Analysis
- **Vite builder (`@storybook/react-vite`) vs Webpack builder**
  - **Vite**: aligns with existing Vite/Tailwind v4 plugin approach; likely less friction.
  - **Webpack**: would require parallel config and likely more CSS/Tailwind plumbing divergence.
- **App-local scripts only vs Turbo pipeline integration**
  - **App-local only (recommended first)**: fastest to iterate, minimal coordination.
  - **Turbo integration**: useful later (CI, consistent commands), but premature before config stabilizes.

## Recommendation
Proceed with an app-local Storybook setup using:
- `@storybook/react-vite` (Storybook 8+)
- `.storybook/main.ts` with `viteFinal()` to add:
  - `vite-tsconfig-paths()` (for `~/*`)
  - `@tailwindcss/vite` plugin (to match Tailwind v4 behavior)
- `.storybook/preview.ts` importing `../app/globals.css`
- Initial story surface: `apps/ralph-monitoring/app/components/ui/*` first (Button, Badge, Card, Input, Select, Skeleton, Sonner), then selectively add higher-level components.

Defer route stories until we have a clear policy for RR7 typegen coupling (or ensure `bun run typecheck` is part of the Storybook run loop).

## Repo Next Steps (checklist)
- [ ] Add Storybook deps to `apps/ralph-monitoring` (`storybook`, `@storybook/react-vite`, `@storybook/addon-essentials` at minimum)
- [ ] Add `.storybook/main.ts` + `.storybook/preview.ts` under `apps/ralph-monitoring`
- [ ] Import `../app/globals.css` in `.storybook/preview.ts`
- [ ] Configure `viteFinal()` to include `vite-tsconfig-paths()` and Tailwind Vite plugin
- [ ] Add `storybook` + `build-storybook` scripts to `apps/ralph-monitoring/package.json`
- [ ] Add initial stories for `app/components/ui/*`
- [ ] (Optional) Add global decorators: `ThemeProvider` (next-themes) and Router wrapper
- [ ] (Optional) Decide whether to add Turbo tasks for Storybook

## Risks & Open Questions
| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Storybook build breaks if stories import RR7 routes with missing `./+types/*` | Risk | Eng | Avoid route stories initially; document “run `bun run typecheck` first” if needed | Before implementation |
| Browser-API heavy components (`EventSource`, clipboard, `document`) are brittle in Storybook | Risk | Eng | Start with UI primitives; add MSW/mocks/decorators for interactive components | During implementation |
| Unknown “Reportory Storybook reference” details | Question | Jake | Provide repo/path/snippets to copy any known-good patterns | Before implementation |
| Decide if Storybook should be part of `ralph-e2e` expectations loop | Question | Jake | Clarify where Storybook fits vs in-app route testing; update skills/runbooks | Planning |

## Sources
| Reference | Type | Freshness | Access Notes |
| --- | --- | --- | --- |
| `apps/ralph-monitoring/package.json` | Internal | 2026-01-18 | App deps/scripts, confirms Vite/Tailwind setup |
| `apps/ralph-monitoring/vite.config.ts` | Internal | 2026-01-18 | Uses `reactRouter()`, `vite-tsconfig-paths`, `@tailwindcss/vite` |
| `apps/ralph-monitoring/app/globals.css` | Internal | 2026-01-18 | Tailwind v4 entry via `@import "tailwindcss";` |
| `apps/ralph-monitoring/tsconfig.json` | Internal | 2026-01-18 | `~/*` alias definition |
| DEV-36 research: `.../2026-01-18_dev-36-skills-agent-browser-storybook-ralph-e2e.md` | Internal | 2026-01-18 | Confirms Storybook absent today; notes external Reportory dependency |
| Storybook docs: React + Vite framework config | External | Storybook v8.6.14 | `https://github.com/storybookjs/storybook/blob/v8.6.14/docs/get-started/frameworks/react-vite.mdx` |
| Storybook docs: `viteFinal()` customization | External | Storybook v8.6.14 | `https://github.com/storybookjs/storybook/blob/v8.6.14/docs/api/main-config/main-config-vite-final.mdx` |
| Storybook docs: import global styles in `preview.ts` | External | Storybook v8.6.14 | `https://github.com/storybookjs/storybook/blob/v8.6.14/docs/configure/styling-and-css.mdx` |

