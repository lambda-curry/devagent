# Design Language (Ralph Monitoring)

This document defines the **token decisions** for the Ralph Monitoring UI so shared primitives can be implemented **token-first** (no ad-hoc CSS) and render consistently in **light + dark** themes.

> Reference screenshot: expected at `.devagent/workspace/tasks/active/2026-01-20_audit-design-system-improvements/references/reference.png` (currently missing from the repo; token choices below reflect the intended direction and existing UI constraints until the reference is added).

## Intent

- **A calm, technical monitoring UI**: neutral surfaces, subtle borders, restrained shadows.
- **Compact-by-default density**: efficient use of space without sacrificing accessibility.
- **Predictable interaction states**: focus/hover/active feel consistent across primitives.
- **Semantic colors**: components express meaning via `bg-background`, `border-border`, `text-muted-foreground`, etc.

## Observable acceptance (testable UI behavior)

- **Light/dark parity**: the same components read correctly in both themes (contrast and hierarchy preserved).
- **Focus state**: keyboard focus produces a consistent ring (Tailwind `ring` semantics) and never disappears on dark surfaces.
- **Surface hierarchy**: `bg-background` < `bg-surface` < `bg-card` < `bg-popover` is visually increasing in elevation/contrast in both themes.
- **Selection**: text selection uses `selection` tokens and remains legible in both themes.
- **No bespoke CSS**: components and routes use token-backed Tailwind classes (e.g. `bg-*`, `text-*`, `border-*`) instead of one-off hardcoded colors.

## Token decisions

### Spacing scale

Defined in `apps/ralph-monitoring/app/globals.css` as `--space-*` (4px base with a few half steps):

- `--space-0`: 0px
- `--space-0-5`: 2px
- `--space-1`: 4px
- `--space-1-5`: 6px
- `--space-2`: 8px
- `--space-3`: 12px
- `--space-4`: 16px
- `--space-5`: 20px
- `--space-6`: 24px
- `--space-8`: 32px
- `--space-10`: 40px
- `--space-12`: 48px
- `--space-16`: 64px

### Density tiers

Control sizing tokens (for Button/Input/Select variants):

- `--control-height-compact`: 32px
- `--control-height-default`: 36px
- `--control-height-comfortable`: 40px
- `--control-padding-x`: `--space-3`
- `--control-padding-y`: `--space-1-5`
- `--icon-button-size`: 36px
- `--touch-target-min`: 40px

### Typography scale

These are **design tokens** (Tailwind typography utilities remain the API until primitives adopt the vars):

- `--font-size-xs`: 12px
- `--font-size-sm`: 13px
- `--font-size-md`: 14px (default body target)
- `--font-size-lg`: 16px
- `--font-size-xl`: 18px
- `--font-size-2xl`: 20px

Line-height tokens:

- `--line-height-tight`: 1.2
- `--line-height-snug`: 1.35
- `--line-height-normal`: 1.5

### Surface system (radius/shadow/borders)

Radius + shadows:

- `--radius`: 12px (mapped to Tailwind radius tokens via `@theme inline`)
- `--border-width`: 1px
- `--shadow-1`: subtle elevation (cards/toasts)
- `--shadow-2`: popovers/menus

Semantic surface tokens (shadcn-compatible; used via Tailwind classes):

- `--background` / `bg-background`
- `--surface` / `bg-surface` (inset panels)
- `--card` / `bg-card`
- `--popover` / `bg-popover`
- `--border` / `border-border`

### Color semantics

Colors are defined as semantic variables in `apps/ralph-monitoring/app/globals.css` for both `:root` (light) and `.dark`:

- **Core**: `background`, `foreground`
- **Surfaces**: `card`, `popover`, `surface`
- **Text hierarchy**: `muted-foreground`
- **Interactive**: `primary`, `ring`
- **System**: `destructive`
- **Chrome**: `border`, `input`

### Interaction states

Global behavior (in `@layer base` in `globals.css`):

- **Active feedback**: `--active-opacity` applied to `a:active` and `button:active:not(:disabled)`
- **Reduced motion**: transitions disabled when `prefers-reduced-motion: reduce`

> Component-level hover/active background/outline styling should be expressed using semantic Tailwind utilities (`hover:bg-accent`, `focus-visible:ring-ring`, etc.) so states stay consistent across themes.

## Component inventory (token-driven primitives impacted)

Primitives (source of truth):

- `apps/ralph-monitoring/app/components/ui/button.tsx`
- `apps/ralph-monitoring/app/components/ui/badge.tsx`
- `apps/ralph-monitoring/app/components/ui/card.tsx`
- `apps/ralph-monitoring/app/components/ui/input.tsx`
- `apps/ralph-monitoring/app/components/ui/select.tsx`
- `apps/ralph-monitoring/app/components/ui/skeleton.tsx`
- `apps/ralph-monitoring/app/components/ui/sonner.tsx`

Token file:

- `apps/ralph-monitoring/app/globals.css`

Theme wiring:

- `apps/ralph-monitoring/app/components/ThemeProvider.tsx`
- `apps/ralph-monitoring/app/root.tsx` (passes `attribute="class"` / `defaultTheme="system"`)

## Storybook review plan (light/dark)

Storybook is not currently present under `apps/ralph-monitoring/` (see inventory doc). When it’s added (Task `devagent-07a7.3`), the minimum review set should include:

- **Primitives stories** (co-located):
  - `app/components/ui/button.stories.tsx`
  - `app/components/ui/input.stories.tsx`
  - `app/components/ui/select.stories.tsx`
  - `app/components/ui/card.stories.tsx`
  - `app/components/ui/badge.stories.tsx`
  - `app/components/ui/skeleton.stories.tsx`
  - `app/components/ui/sonner.stories.tsx`
- **Theme matrix**:
  - Light + dark variants for each story (via global toolbar toggle or per-story decorator)
  - Check focus-visible ring, hover/active states, borders on dark

Minimum artifact if Storybook is not yet wired:

- Acceptance bullets + component inventory explained in the task comments.

