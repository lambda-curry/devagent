# 2026-01-20 — Design System Inventory (Ralph Monitoring)

Objective (Task `devagent-07a7.1`): document where **tokens**, **shared components**, **Storybook**, and **docs** live; capture a baseline list of **golden-path surfaces** to update mapped to real files.

## App scope + entrypoints

- **App root**: `apps/ralph-monitoring/`
- **Route config (source of truth)**: `apps/ralph-monitoring/app/routes.ts`
- **Root layout**: `apps/ralph-monitoring/app/root.tsx`
- **Global styles (tokens + utilities)**: `apps/ralph-monitoring/app/globals.css`

## Token sources (source-of-truth)

### Tailwind v4 theme tokens (CSS-first)

- **Primary token file**: `apps/ralph-monitoring/app/globals.css`
  - `@theme inline` maps semantic Tailwind tokens (`--color-*`, `--radius-*`, breakpoints, fonts) onto CSS variables.
  - `:root` defines the semantic color system (`--background`, `--foreground`, `--card`, `--muted`, `--border`, etc.) for **light** mode.
  - `.dark` overrides those same semantic variables for **dark** mode.

### Global base styles + utilities (design system “behavior”)

All in `apps/ralph-monitoring/app/globals.css`:

- **Base layer defaults**: `@layer base { ... }` (global border/ring behavior, selection styling, scroll smoothness, active-state opacity)
- **Utilities**:
  - `@utility no-scrollbar`
  - `@utility border-ghost`
  - `@utility step`
  - `@utility extend-touch-target`
- **Motion token (currently hardcoded)**: `@keyframes checkmark-pulse` (used by the “closed” status icon animation)

### Token consumption

- **Class composition**: `apps/ralph-monitoring/app/lib/utils.ts` exports `cn()` (`clsx` + `tailwind-merge`).
- **Most UI uses semantic Tailwind classes** (e.g. `bg-background`, `text-foreground`, `border-border`, `text-muted-foreground`) that resolve via the variables defined in `app/globals.css`.

## Shared components (building blocks)

### UI primitives (shadcn-style)

Source of truth: `apps/ralph-monitoring/app/components/ui/*`

- `apps/ralph-monitoring/app/components/ui/button.tsx`
- `apps/ralph-monitoring/app/components/ui/badge.tsx`
- `apps/ralph-monitoring/app/components/ui/card.tsx`
- `apps/ralph-monitoring/app/components/ui/input.tsx`
- `apps/ralph-monitoring/app/components/ui/select.tsx`
- `apps/ralph-monitoring/app/components/ui/skeleton.tsx`
- `apps/ralph-monitoring/app/components/ui/sonner.tsx` (Toaster wrapper + toast classNames)

Related configuration:

- `apps/ralph-monitoring/components.json` (shadcn config points `tailwind.css` at `app/globals.css` and enables CSS variables)

### Composite/shared components

Source of truth: `apps/ralph-monitoring/app/components/*`

- `apps/ralph-monitoring/app/components/ThemeProvider.tsx` (wraps `next-themes`)
- `apps/ralph-monitoring/app/components/ThemeToggle.tsx` (theme switch control; uses `Button`)
- `apps/ralph-monitoring/app/components/LogViewer.tsx` (log streaming UI; uses `Button` + `sonner`)
- `apps/ralph-monitoring/app/components/EmptyState.tsx`
- `apps/ralph-monitoring/app/components/TaskCardSkeleton.tsx` (loading skeleton; uses `Card` + `Skeleton`)

## Product surfaces (routes)

### Task list / dashboard (`/`)

- **Route module**: `apps/ralph-monitoring/app/routes/_index.tsx`
- **Primary UI sections (and the shared components they rely on)**:
  - App shell header + theme toggle: `ThemeToggle` (`app/components/ThemeToggle.tsx`)
  - Filter controls:
    - `Select` (`app/components/ui/select.tsx`)
    - `Input` (`app/components/ui/input.tsx`)
    - `Button` (`app/components/ui/button.tsx`)
  - Empty state: `EmptyState` (`app/components/EmptyState.tsx`)
  - Loading: `TaskCardSkeleton` (`app/components/TaskCardSkeleton.tsx`)
  - Task card surface (inline in the route file): `TaskCard` uses:
    - `Card` / `CardContent` (`app/components/ui/card.tsx`)
    - `Badge` (`app/components/ui/badge.tsx`)
    - `Button` (for icon-only actions)

### Task detail (`/tasks/:taskId`)

- **Route module**: `apps/ralph-monitoring/app/routes/tasks.$taskId.tsx`
- **Primary UI sections**:
  - Back nav + theme toggle: `ThemeToggle`
  - Status header card: currently uses raw Tailwind classes directly in the route module
  - Stop action: currently a **custom `<button>`** with ad-hoc Tailwind classes (candidate to unify on `Button` + token-driven variants)
  - Log surface: `LogViewer` (`app/components/LogViewer.tsx`)

## Storybook (current state)

- **No Storybook present in repo right now**:
  - Missing directory: `apps/ralph-monitoring/.storybook/`
  - No `*.stories.*` files under `apps/ralph-monitoring/`

Baseline “expected” locations (when added in later tasks):

- `apps/ralph-monitoring/.storybook/main.ts`
- `apps/ralph-monitoring/.storybook/preview.ts`
- Stories co-located with primitives, e.g. `apps/ralph-monitoring/app/components/ui/button.stories.tsx`

## Docs (current state + planned)

### Existing

- App overview + stack: `apps/ralph-monitoring/AGENTS.md`
- shadcn configuration (ties UI to token file): `apps/ralph-monitoring/components.json`
- Sweep runbook folders:
  - Run overview: `.devagent/workspace/tasks/active/2026-01-20_audit-design-system-improvements/run/README.md`
  - Reference placeholder: `.devagent/workspace/tasks/active/2026-01-20_audit-design-system-improvements/references/README.md` (expects `references/reference.png`)

### Planned (per sweep plan)

- Design language doc target path: `apps/ralph-monitoring/docs/DESIGN_LANGUAGE.md` (folder does not exist yet; will be created in task `devagent-07a7.2`)

## Baseline “golden path” surfaces to update (mapped to files)

Use this as the checklist for the token + primitives refactor and the surface sweep.

### Surface: task list page (layout + filters + sections)

- **File**: `apps/ralph-monitoring/app/routes/_index.tsx`
- **Update targets**:
  - Page shell spacing/density and typography
  - Filter row affordances (Select/Input/Button sizing, radius, focus states)
  - Column headers (“In Progress”, “Open”, etc.) styling + spacing

### Surface: task card (interactive card + quick actions + child issues)

- **File**: `apps/ralph-monitoring/app/routes/_index.tsx` (inline `TaskCard`)
- **Update targets**:
  - Card border/shadow/hover elevation (token-driven)
  - Badge variants usage + consistency
  - Icon button affordances (hover/active, hit targets)
  - Child issue row styling (muted surface + hover)

### Surface: task list loading + empty states

- **Files**:
  - `apps/ralph-monitoring/app/components/TaskCardSkeleton.tsx`
  - `apps/ralph-monitoring/app/components/EmptyState.tsx`
- **Update targets**:
  - Skeleton shape/density parity with final cards
  - Empty state surface + icon container styling

### Surface: task detail header card + stop action

- **File**: `apps/ralph-monitoring/app/routes/tasks.$taskId.tsx`
- **Update targets**:
  - Convert the header container to shared primitives (`Card`, `Badge`, `Button`) where it improves consistency
  - Replace the custom Stop `<button>` with `Button` (or a dedicated “danger” action component) so interaction states match the system

### Surface: log viewer (streaming panel + toolbar)

- **File**: `apps/ralph-monitoring/app/components/LogViewer.tsx`
- **Update targets**:
  - Panel border/radius/surface tokens
  - Toolbar button variants/sizes consistency
  - Error banner styling and severity semantics
  - Line-number affordance (selected vs unselected state)

### Surface: toasts

- **File**: `apps/ralph-monitoring/app/components/ui/sonner.tsx`
- **Update targets**:
  - Toast surface + shadow + border tokens
  - Action/cancel button styling parity with `Button` variants

### Surface: theme toggle

- **File**: `apps/ralph-monitoring/app/components/ThemeToggle.tsx`
- **Update targets**:
  - Icon button size/radius and hover/active states
  - Ensure token-driven colors look correct in both themes

### Surface: root layout theming + global transitions

- **Files**:
  - `apps/ralph-monitoring/app/root.tsx`
  - `apps/ralph-monitoring/app/components/ThemeProvider.tsx`
  - `apps/ralph-monitoring/app/globals.css`
- **Update targets**:
  - Theme class strategy (`next-themes` `attribute="class"`) with semantic token overrides
  - Global transition rules (avoid unintended motion on large layout changes while preserving a “polished” feel)

