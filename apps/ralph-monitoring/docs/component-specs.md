# Component Specs — Ralph Monitoring Dashboard

This document defines the **component inventory** and **specifications** for new dashboard components (ProgressBar, MetricCard, AgentTimeline, ControlPanel). It extends the design language in [DESIGN_LANGUAGE.md](./DESIGN_LANGUAGE.md) with token-backed visual and behavioral specs.

---

## 1. Component inventory

### 1.1 Existing primitives (token-driven)

| Component   | Path                                      | Notes                                      |
|------------|-------------------------------------------|--------------------------------------------|
| Button     | `app/components/ui/button.tsx`           | Variants: default, destructive, outline, secondary, ghost, link; sizes: default, sm, lg |
| Badge      | `app/components/ui/badge.tsx`             | Variants: default, secondary, destructive, outline |
| Card       | `app/components/ui/card.tsx`             | Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter |
| Input      | `app/components/ui/input.tsx`            | Uses `--control-height-default`, `--control-padding-*` |
| Select     | `app/components/ui/select.tsx`            | Same control tokens; supports SelectItem |
| Skeleton   | `app/components/ui/skeleton.tsx`         | Loading placeholder |
| Sonner     | `app/components/ui/sonner.tsx`           | Toast notifications |

**Token file:** `app/globals.css`  
**Theme:** `app/components/ThemeProvider.tsx`, `app/root.tsx`

### 1.2 New components (to implement)

| Component     | Purpose                                           | Depends on / composes        |
|-------------|----------------------------------------------------|------------------------------|
| **ProgressBar** | Task/epic progress (0–100%, indeterminate)         | — (primitive)                |
| **MetricCard**  | Single KPI (label, value, optional trend/unit)     | Card, Badge (optional)        |
| **AgentTimeline** | Chronological agent/task events (epic detail)    | Card, Badge, spacing tokens   |
| **ControlPanel** | Start/stop/pause controls for runs                | Button, Card (optional)       |

---

## 2. Component specifications

### 2.1 ProgressBar

**Intent:** Show completion progress (determinate) or loading state (indeterminate) for tasks/epics. Token-first, theme-safe.

**Props (recommended):**

- `value?: number` — 0–100 (omit for indeterminate).
- `max?: number` — default 100.
- `variant?: 'default' | 'success' | 'warning' | 'destructive'` — bar color semantics.
- `size?: 'sm' | 'default' | 'lg'` — track height.
- `showLabel?: boolean` — optional text (e.g. "75%").
- `className?: string` — for layout only; internal styling uses tokens.

**Visual:**

- **Track:** `bg-muted` or `bg-surface`, `rounded-full`, height from size token.
- **Fill:** Semantic color from variant; `rounded-full`; width = `(value / max) * 100%` for determinate.
- **Indeterminate:** Animated fill (e.g. sliding gradient or shimmer) using `primary` or `muted-foreground`; respect `prefers-reduced-motion: reduce` (disable or simplify animation).

**Tokens:**

- Height: `--space-1-5` (sm), `--space-2` (default), `--space-3` (lg).
- Radius: `--radius-lg` (full = large so ends are rounded).
- Colors: `primary`, `muted`, `destructive`; success/warning can map to chart or semantic tokens if added later.

**Accessibility:**

- Use `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax` for determinate; `aria-valuetext="Loading"` or similar for indeterminate.
- If `showLabel` is true, ensure visible text matches announced value or use `aria-valuetext` for custom wording.
- Ensure track/fill contrast meets WCAG 2.1 Level AA (3:1 for large areas).

---

### 2.2 MetricCard

**Intent:** Display a single metric (e.g. task count, duration, success rate) with optional label, unit, and trend. Composes Card for consistency.

**Props (recommended):**

- `label: string` — metric name (e.g. "Tasks completed").
- `value: string | number` — main value to display.
- `unit?: string` — e.g. "%", "ms", "tasks".
- `trend?: 'up' | 'down' | 'neutral'` — optional trend indicator.
- `trendLabel?: string` — e.g. "vs last run" for screen readers.
- `className?: string` — layout.

**Visual:**

- **Container:** Use existing `Card` (or `Card`-like) with `CardHeader` / `CardContent`; padding `--space-4`.
- **Label:** `text-muted-foreground`, `text-sm` (or `--font-size-sm`).
- **Value:** `text-foreground`, `text-2xl` / `--font-size-2xl`, `font-semibold`, `leading-tight`.
- **Unit:** Same line or subscript; `text-muted-foreground`, `text-sm`.
- **Trend:** Small badge or icon (e.g. arrow up/down) with semantic color: up = primary or success, down = destructive or warning, neutral = muted. Use existing Badge or icon only.

**Tokens:**

- Spacing: `--space-4` card padding; gap between label and value `--space-2`.
- Typography: `--font-size-sm`, `--font-size-2xl`, `--line-height-tight`.
- Colors: `foreground`, `muted-foreground`, `primary`, `destructive`, `muted`.

**Accessibility:**

- Use a single focusable card only if the card is interactive; otherwise keep it presentational.
- Expose trend to screen readers via `trendLabel` or `aria-label` (e.g. "Up 10% vs last run").
- Ensure value + unit are in a logical order in the DOM for reading order.

---

### 2.3 AgentTimeline

**Intent:** Vertical timeline of agent/task events (e.g. task opened, in progress, closed, comments) for epic or run detail. Chronological, compact.

**Props (recommended):**

- `events: Array<{ id: string; timestamp: string | Date; label: string; detail?: string; status?: 'open' | 'in_progress' | 'closed' | 'blocked'; icon?: ReactNode }>`.
- `className?: string` — layout.

**Visual:**

- **Layout:** Vertical list; each item has a left “dot” or icon, connecting line, and content block.
- **Line:** Vertical line `border-l-2 border-border`, from first to last item; `--space-4` or `--space-6` left offset.
- **Dot/icon:** Circle or status icon aligned to line; size `--space-3`; fill from status (e.g. primary for in_progress, muted for closed) or neutral.
- **Content:** Label (bold) + optional detail (muted, smaller); padding left `--space-3`; vertical spacing between items `--space-4`.
- **Timestamp:** Optional; `text-muted-foreground`, `text-xs` (`--font-size-xs`), right-aligned or below label.

**Tokens:**

- Spacing: `--space-3`, `--space-4`, `--space-6` for gaps and offsets.
- Typography: `--font-size-xs`, `--font-size-sm`, `--font-size-md`.
- Colors: `border`, `foreground`, `muted-foreground`, `primary`, semantic status colors (align with Badge variants).

**Accessibility:**

- Use `role="list"` and `role="listitem"` or a semantic list (`ul`/`li`).
- Each event should be readable in order; include timestamp in accessible text (e.g. “Task closed, 2:30 PM”).
- If items are interactive (e.g. link to task), use buttons/links with visible focus ring (`focus-visible:ring-ring`).

---

### 2.4 ControlPanel

**Intent:** Panel for run/task control actions: start, stop, pause (if applicable). Clear primary action and destructive/secondary actions.

**Props (recommended):**

- `runStatus?: 'idle' | 'running' | 'paused' | 'stopped'` — current state.
- `onStart?: () => void`
- `onStop?: () => void`
- `onPause?: () => void` (optional)
- `disabled?: boolean` — disable all actions.
- `className?: string` — layout.

**Visual:**

- **Container:** Optional Card or bordered container; padding `--space-4`; horizontal layout (flex) for buttons with gap `--space-2` or `--space-3`.
- **Buttons:** Use existing Button: primary for Start, destructive for Stop, outline/secondary for Pause if present. Size `default` or `lg` for prominence.
- **State:** Disable Start when `runStatus === 'running'`; disable Stop when not running; show loading state (e.g. Skeleton or button disabled + “Stopping…”) when a request is in flight.

**Tokens:**

- Spacing: `--space-2`, `--space-3`, `--space-4`; control height from `--control-height-default` or `--control-height-comfortable`.
- Colors: `primary`, `destructive`, `border`; use existing Button variants.

**Accessibility:**

- Each control must be a button (or link if navigation) with an accessible name: “Start run”, “Stop run”, “Pause”.
- When disabled, use `aria-disabled="true"` and explain in status text if needed (e.g. “Run in progress”).
- If panel has a heading, use `aria-labelledby` to associate it with the control group.

**Confirmation dialogs:**

- Destructive or reversible actions (e.g. Pause, Resume, Skip task) must use a **design-system confirmation dialog** (e.g. Radix AlertDialog or shadcn AlertDialog), not `window.confirm()`, so that copy, actions, focus trap, and styling are consistent and accessible.

---

## 3. Color tokens and spacing for new visualizations

### 3.1 Color tokens (from DESIGN_LANGUAGE.md)

Use only these semantic tokens for new components (no hardcoded hex/oklch in components):

| Token (Tailwind)     | Use in new components                    |
|----------------------|------------------------------------------|
| `background`, `foreground` | Page and text hierarchy                 |
| `card`, `card-foreground`  | MetricCard, ControlPanel container       |
| `surface`            | Inset areas, ProgressBar track (optional)|
| `muted`, `muted-foreground` | Secondary text, labels, timestamps   |
| `primary`, `primary-foreground` | Progress fill, primary actions, “up” trend |
| `destructive`        | Stop action, “down” trend, error state   |
| `border`, `input`    | Dividers, timeline line, inputs           |
| `ring`               | Focus rings (focus-visible)               |
| `chart-1` … `chart-5`| Future charts only; prefer semantic for bars |

ProgressBar variants can map: default → `primary`, success → `primary` (or keep primary until a success token exists), warning → `muted-foreground` or future token, destructive → `destructive`.

### 3.2 Spacing scale (reuse)

- **Component internal:** `--space-1` to `--space-4` for gaps and padding.
- **Section / panel:** `--space-4`, `--space-6` for padding and margins between blocks.
- **Timeline:** `--space-3` (dot-to-content), `--space-4` (item spacing), `--space-6` (line offset).

### 3.3 Density and typography

- **Controls in ControlPanel:** `--control-height-default` or `--control-height-comfortable`.
- **Metric value:** `--font-size-2xl`, `--line-height-tight`.
- **Labels / secondary:** `--font-size-sm`, `--font-size-xs`; `--line-height-normal` or `--line-height-snug`.

---

## 4. Accessibility considerations

- **Focus:** All interactive elements (buttons, links, focusable cards) use visible focus ring: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` (or project default). No focus styling that disappears on dark backgrounds.
- **Contrast:** Text on `card`, `background`, `surface` uses `foreground` or `muted-foreground`; ensure 4.5:1 for body, 3:1 for large text (WCAG 2.1 AA).
- **Motion:** Respect `prefers-reduced-motion: reduce`: disable or simplify ProgressBar indeterminate animation and any timeline enter animations.
- **Semantics:** Use correct roles (`progressbar`, `list`, `listitem`, `button`) and ARIA where needed (`aria-valuenow`, `aria-valuetext`, `aria-disabled`, `aria-labelledby`).
- **Labels:** Every control has an accessible name (visible text or `aria-label`); MetricCard trend and ProgressBar value are exposed to assistive tech.
- **Reading order:** DOM order matches visual order for timeline and metric (label → value → unit → trend).

---

## 5. Storybook and verification

When Storybook is available (see DESIGN_LANGUAGE.md):

- Add stories for **ProgressBar:** determinate (0%, 50%, 100%), indeterminate, variants (default, destructive), sizes; light + dark.
- Add stories for **MetricCard:** with/without unit, with/without trend (up, down, neutral); light + dark.
- Add stories for **AgentTimeline:** 1, 3, 5+ events; mixed statuses; light + dark.
- Add stories for **ControlPanel:** idle, running, disabled; light + dark.

**Acceptance:** All new components use only tokens from `globals.css` and DESIGN_LANGUAGE.md; no ad-hoc colors or spacing. Focus and reduced-motion behavior are verified in Storybook or QA.
