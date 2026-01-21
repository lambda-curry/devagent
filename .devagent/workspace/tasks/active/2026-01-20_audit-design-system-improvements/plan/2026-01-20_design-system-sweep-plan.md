# Audit Design System Improvements Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-20
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/active/2026-01-20_audit-design-system-improvements/`
- Stakeholders: Jake Ruesink (Decision Maker)
- Notes: Remove sections marked (Optional) if they do not apply.

---

## PART 1: PRODUCT CONTEXT

### Summary
Establish a cohesive design language based on the reference screenshot, then apply it across tokens, shared components, and product surfaces in a single sweep to eliminate mixed styling and ad-hoc CSS.

### Context & Problem
The current UI lacks a unified design language; tokens, shared components, and screens have drifted. A reference UI screenshot defines the direction, but the concrete language (spacing, type, surface, color, interaction states) is not yet codified. The work must update tokens and components and then roll those changes across app surfaces in a big-bang pass.

### Objectives & Success Metrics
- Document the design language (spacing scale/density tiers, typography scale, surface system, color semantics, interaction states) and keep it as the guiding reference for future UI work.
- Update token definitions so components consistently express the new language in both light and dark themes.
- Update shared components and product surfaces so the app matches the new language without ad-hoc CSS (page-level layout composition allowed; per-page overrides allowed only when component abstraction is overkill).
- Storybook contains a minimum coverage set of key building-block components and is usable for review in both themes.

### Users & Insights
- Primary users: product engineers and reviewers who need a stable, shared visual language for ongoing UI work.
- End users: product UI consumers who benefit from consistent layout density, typography, and surface treatment.
- Insight: the style direction is defined by the reference screenshot; exact traits are flexible as long as a cohesive language is established and applied consistently.

### Solution Principles
- Define non-negotiables first: spacing scale/density tiers, typography scale, surface system (radius/shadow/borders), color semantics, interaction states.
- Prefer token changes and shared components over page-level overrides.
- No ad-hoc CSS for visual styling; exceptions only for page-level layout composition or per-page overrides when component abstraction would be overkill.
- Big-bang rollout to avoid mixed styling.
- Storybook is the primary review surface for component changes.

### Scope Definition
- **In Scope:** Tokens (CSS variables, Tailwind theme), shared UI components, Storybook coverage, and product surfaces (app shell, list/detail views, forms/dialogs, tables/lists) in `apps/ralph-monitoring`.
- **Out of Scope / Future:** Net-new component library or brand system, new product features, or long-lived phased rollout.

### Functional Narrative
#### Global styling + component language
- Trigger: design language decisions finalized.
- Experience narrative: tokens define spacing, typography, surfaces, and interaction states; shared components express these defaults consistently.
- Acceptance criteria: components match the defined language in both light and dark themes without page-level visual overrides.

#### Product surfaces
- Trigger: tokens/components updated.
- Experience narrative: app shell, task list, task detail, and supporting components visually align to the reference direction using shared components and tokens.
- Acceptance criteria: no ad-hoc CSS for visual styling; exceptions only for layout composition or documented per-page overrides.

### Experience References (Optional)
- Reference screenshot: `.devagent/workspace/tasks/active/2026-01-20_audit-design-system-improvements/references/reference.png`

### Technical Notes & Dependencies (Optional)
- Tokens and theme values live in `apps/ralph-monitoring/app/globals.css` using Tailwind v4 `@theme inline` variables.
- Shared UI components live in `apps/ralph-monitoring/app/components/ui/*`.
- App-level components live in `apps/ralph-monitoring/app/components/*` and routes in `apps/ralph-monitoring/app/routes/*`.
- Storybook configuration and review standards live in `apps/ralph-monitoring/.storybook/*` and `apps/ralph-monitoring/docs/STORYBOOK_REVIEW_RUBRIC.md`.

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- Scope focus: single big-bang sweep across tokens, shared components, and product surfaces.
- Key assumptions:
  - The reference screenshot defines direction; exact values will be finalized in the design language task.
  - The design system source-of-truth is fully within `apps/ralph-monitoring`.
- Out of scope: phased rollout or partial application across only one surface.

### Implementation Tasks
Minimum Storybook coverage set (explicit verification requirement): Badge, Button, Card, Input, Select, Skeleton, Sonner (toast), ThemeToggle, EmptyState, LogViewer, Comments, MarkdownSection, TaskCardSkeleton.

#### Task 1: Enumerate design system source-of-truth + baseline inventory
- **Objective:** Document where tokens, components, Storybook, and docs live; capture a baseline list of components/surfaces to update.
- **Impacted Modules/Files:**
  - `.devagent/workspace/tasks/active/2026-01-20_audit-design-system-improvements/plan/2026-01-20_design-system-inventory.md` (new)
  - `apps/ralph-monitoring/app/globals.css` (reference in inventory)
  - `apps/ralph-monitoring/app/components/ui/*` (reference in inventory)
  - `apps/ralph-monitoring/app/components/*` (reference in inventory)
  - `apps/ralph-monitoring/app/routes/*` (reference in inventory)
  - `apps/ralph-monitoring/.storybook/*` (reference in inventory)
  - `apps/ralph-monitoring/docs/*` (reference in inventory)
- **References:** `.devagent/workspace/tasks/active/2026-01-20_audit-design-system-improvements/clarification/2026-01-20_initial-clarification.md`
- **Dependencies:** None.
- **Acceptance Criteria:**
  - Inventory doc lists all token sources, shared components, Storybook paths, and relevant docs with concrete file paths.
  - Inventory doc lists the golden-path surfaces to update (app shell, task list, task detail, forms/dialogs, tables/lists/detail) mapped to actual files.
- **Testing Criteria:** N/A (documentation-only task).
- **Validation Plan:** Peer review against repo tree; ensure all paths are concrete (no placeholders).

#### Task 2: Define design language + update core tokens
- **Objective:** Translate the reference screenshot into explicit token decisions and update theme tokens accordingly (spacing scale/density tiers, typography scale, surface system, color semantics, interaction states).
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/globals.css`
  - `apps/ralph-monitoring/docs/DESIGN_LANGUAGE.md` (new)
  - `apps/ralph-monitoring/app/components/ThemeProvider.tsx` (if theme logic or defaults need adjustment)
- **References:** Reference screenshot path; inventory doc from Task 1.
- **Dependencies:** Task 1 (source-of-truth map).
- **Acceptance Criteria:**
  - Design language doc explicitly defines spacing scale/density tiers, typography scale, surface system (radius/shadow/borders), color semantics, and interaction states.
  - Updated tokens apply consistently in light and dark themes; no ad-hoc CSS introduced.
- **Testing Criteria:**
  - Visual review via Storybook (light/dark) for token-driven components.
- **Validation Plan:** Run Storybook locally and confirm the updated tokens apply to base components without theme regressions.

#### Task 3: Refactor shared UI components to new tokens + Storybook coverage set
- **Objective:** Update shared UI primitives to express the new design language and ensure Storybook stories exist for the minimum coverage set.
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/components/ui/badge.tsx`
  - `apps/ralph-monitoring/app/components/ui/button.tsx`
  - `apps/ralph-monitoring/app/components/ui/card.tsx`
  - `apps/ralph-monitoring/app/components/ui/input.tsx`
  - `apps/ralph-monitoring/app/components/ui/select.tsx`
  - `apps/ralph-monitoring/app/components/ui/skeleton.tsx`
  - `apps/ralph-monitoring/app/components/ui/sonner.tsx`
  - `apps/ralph-monitoring/app/components/ui/*.stories.tsx`
- **References:** `apps/ralph-monitoring/docs/STORYBOOK_REVIEW_RUBRIC.md`.
- **Dependencies:** Task 2 (updated tokens/design language).
- **Acceptance Criteria:**
  - Each component uses tokens (no bespoke CSS) to match the defined language.
  - Minimum Storybook coverage set is present and reviewed for UI primitives: Badge, Button, Card, Input, Select, Skeleton, Sonner (toast).
  - Stories render deterministically in both light and dark themes without importing route modules.
- **Testing Criteria:**
  - `cd apps/ralph-monitoring && bun run storybook` (manual review) or `bun run build-storybook` when available.
- **Validation Plan:** Storybook review against rubric (naming, layout, a11y basics, theme parity).

#### Task 4: Update composite components + product surfaces (golden paths)
- **Objective:** Apply the new design language across app shell and key surfaces, using shared components and tokens.
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/components/Comments.tsx`
  - `apps/ralph-monitoring/app/components/EmptyState.tsx`
  - `apps/ralph-monitoring/app/components/LogViewer.tsx`
  - `apps/ralph-monitoring/app/components/MarkdownSection.tsx`
  - `apps/ralph-monitoring/app/components/TaskCardSkeleton.tsx`
  - `apps/ralph-monitoring/app/components/ThemeToggle.tsx`
  - `apps/ralph-monitoring/app/root.tsx`
  - `apps/ralph-monitoring/app/routes/_index.tsx`
  - `apps/ralph-monitoring/app/routes/tasks.$taskId.tsx`
- **References:** Inventory doc (Task 1), design language doc (Task 2).
- **Dependencies:** Tasks 2-3.
- **Acceptance Criteria:**
  - Golden-path surfaces match the new design language with shared components; no ad-hoc CSS for visual styling.
  - Layout-only overrides are documented and limited to page composition needs.
  - Minimum Storybook coverage set is present and reviewed for composite components: ThemeToggle, EmptyState, LogViewer, Comments, MarkdownSection, TaskCardSkeleton.
- **Testing Criteria:**
  - Storybook review for affected components.
  - Manual UI smoke in app routes (if available) for layout correctness.
- **Validation Plan:** Review routes and composite components against the design language doc; confirm ad-hoc CSS exceptions are minimal and documented.

### Implementation Guidance (Optional)
- **From `.cursorrules/monorepo.mdc` -> Package Structure / Import Patterns:**
  - Keep work scoped to `apps/ralph-monitoring` and use workspace import conventions when referencing shared packages. (`.cursorrules/monorepo.mdc`)
- **From `.cursor/rules/storybook.mdc` -> Storybook (ralph-monitoring):**
  - Use `@storybook/react-vite`, import `app/globals.css` in `.storybook/preview.ts`, and avoid importing RR7 route modules into stories. (`.cursor/rules/storybook.mdc`)
- **From `apps/ralph-monitoring/docs/STORYBOOK_REVIEW_RUBRIC.md` -> Review checklist:**
  - Stories should be deterministic, accessible, and support light/dark themes; prefer component-level stories with router stubs. (`apps/ralph-monitoring/docs/STORYBOOK_REVIEW_RUBRIC.md`)

### Release & Delivery Strategy (Optional)
- Big-bang rollout: complete tokens, shared components, and product surfaces in a single change set to avoid mixed styling.

---

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Final design language values (spacing, type scale, surfaces, colors, interaction states) are not yet concretized. | Risk | Jake | Task 2 defines and documents explicit values before component refactors. | 2026-01-20 |
| DS source-of-truth paths may be broader than `apps/ralph-monitoring`. | Question | Jake | Task 1 inventory verifies all paths. | 2026-01-20 |
| Storybook coverage expectations need explicit component list. | Risk | Jake | Task 3 enumerates minimum coverage set and validates against rubric. | 2026-01-20 |

---

## Progress Tracking
Refer to the AGENTS.md file in the task directory for instructions on tracking and reporting progress during implementation.

---

## Appendices & References (Optional)
- Task hub: `.devagent/workspace/tasks/active/2026-01-20_audit-design-system-improvements/AGENTS.md`
- Clarification packet: `.devagent/workspace/tasks/active/2026-01-20_audit-design-system-improvements/clarification/2026-01-20_initial-clarification.md`
- Reference screenshot: `.devagent/workspace/tasks/active/2026-01-20_audit-design-system-improvements/references/reference.png`
- Storybook rubric: `apps/ralph-monitoring/docs/STORYBOOK_REVIEW_RUBRIC.md`
- Storybook rules: `.cursor/rules/storybook.mdc`
- Monorepo rules: `.cursorrules/monorepo.mdc`
