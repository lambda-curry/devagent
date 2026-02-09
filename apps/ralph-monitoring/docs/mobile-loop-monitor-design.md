# Mobile Loop Monitor — Design Spec

Design exploration for the mobile-first loop monitoring experience. Three core screens: **Loop Dashboard**, **Loop Detail**, and **Live Log**. This document defines layout, component inventory, status visualization, typography, touch targets, dark mode, and navigation so implementation can proceed from a single source of truth.

**References:** [DESIGN_LANGUAGE.md](./DESIGN_LANGUAGE.md) (tokens), epic description (three-screen flow). **Research context:** Mobile CI/monitoring UIs (e.g. GitHub Actions, Vercel, Railway, Render) commonly use status-first lists, compact activity feeds, and full-screen log viewers; we align with that pattern while staying within the existing design language.

---

## 1. Screen-by-screen layout

### 1.1 Loop Dashboard (epic list)

**Purpose:** Quick-glance list of active loops. User can see what’s running and tap into a loop.

```
+------------------------------------------+
|  [≡]  Loop Monitor              [theme]  |
+------------------------------------------+
|  NOW RUNNING                             |
|  +------------------------------------+  |
|  | ● Mobile-First Loop Monitor    ▶   |  |  <- NowCard (hero)
|  |   Design Agent · 2m ago            |  |
|  |   [=======>    ] 3/11              |  |
|  +------------------------------------+  |
|  LOOPS                                   |
|  +------------------------------------+  |
|  | ○ Another Epic            [gray]  |  |  <- LoopCard
|  |   1/8 · 5m ago                     |  |
|  +------------------------------------+  |
|  +------------------------------------+  |
|  | ○ Past Epic               [gray]   |  |
|  |   8/8 · 2h ago                     |  |
|  +------------------------------------+  |
+------------------------------------------+
```

- **Top:** App title (or nav); optional menu; theme toggle.
- **Now running:** Single hero card (NowCard) when there is an active run; otherwise omit or show “No active loop.”
- **Loops:** Vertical list of LoopCards (one per epic). Each card is a single tap target; tap navigates to Loop Detail.
- **No tab bar on this screen** — dashboard is the “home” of the flow.

### 1.2 Loop Detail (what’s happening now)

**Purpose:** Live status for one loop: current task, recent activity, and full step list.

```
+------------------------------------------+
|  [←]  Epic title here    [Running] [⏸]  |
+------------------------------------------+
|  NOW                                     |
|  +------------------------------------+  |
|  |  Design Exploration — Mobile...     |  |  <- NowCard
|  |  Pixel Perfector · 2m 34s          |  |
|  |  [    Watch Live    ]              |  |
|  +------------------------------------+  |
|  RECENT ACTIVITY                         |
|  +------------------------------------+  |
|  | 2m ago   Design task...        ✅  |  |  <- ActivityRow
|  | 5m ago   QA: Loop Dashboard    ✅  |  |
|  | 12m ago  Setup PR               ⏭️  |  |
|  +------------------------------------+  |
|  ALL STEPS (tap to expand)        [∨]   |
|  +------------------------------------+  |
|  | [done] Task 1  [run] Task 2  ...   |  |  <- StepChips in list
|  +------------------------------------+  |
+------------------------------------------+
```

- **Header:** Back, epic name (truncate), status badge, pause/resume.
- **Now:** NowCard — current task name, agent, elapsed time, “Watch Live” CTA (→ Live Log).
- **Recent Activity:** Scrollable list of ActivityRows (timestamp, task name, outcome icon).
- **All Steps:** Collapsed by default; expand to show list of steps, each with StepChip + title.

### 1.3 Live Log (streaming log viewer)

**Purpose:** Full-screen streaming terminal for the active task.

```
+------------------------------------------+
|  [←]  Live log · Task name               |
+------------------------------------------+
|  $ devagent implement-plan              |
|  Loading context...                      |
|  ✓ Plan loaded. 3 tasks.                |
|  Running task 1/3...                     |
|  ...                                    |
|  (streaming content, monospace)         |
+------------------------------------------+
```

- **Header:** Back (to Loop Detail), title “Live log · &lt;task name&gt;”.
- **Body:** Full-bleed log area; monospace, scrollable; dark-mode-first for terminal feel (see Dark mode).

---

## 2. Component inventory

| Component     | Purpose | New/Existing | Structure |
|--------------|---------|--------------|-----------|
| **LoopCard** | Dashboard list item | New | Card with status indicator, title, progress bar, current task line, relative time; full-width, min touch height. |
| **NowCard**  | “Currently running” hero | New | Card with title, agent + elapsed, progress (optional), primary CTA (e.g. Watch Live). |
| **ActivityRow** | Single row in recent activity feed | New | One row: relative time (caption), task name (truncated), outcome icon (✅❌⏭️). |
| **StepChip** | Status chip in all-steps list | New | Small pill: status (pending/running/done/failed/skipped) + short label; token-driven colors. |
| Card, Badge, Button, ProgressBar | Primitives | Existing | Use as-is from `ui/` and shared components. |

**New files (prototype):**

- `app/components/mobile-loop/LoopCard.tsx` (+ `.stories.tsx`)
- `app/components/mobile-loop/NowCard.tsx` (+ `.stories.tsx`)
- `app/components/mobile-loop/ActivityRow.tsx` (+ `.stories.tsx`)
- `app/components/mobile-loop/StepChip.tsx` (+ `.stories.tsx`)

Rough structure:

- **LoopCard:** `Card` → status dot/badge + title + `ProgressBar` + subtitle (current task + time).
- **NowCard:** `Card` → title + meta line (agent, elapsed) + `Button` (Watch Live).
- **ActivityRow:** flex row: time (caption) + task name (truncate) + icon.
- **StepChip:** `Badge`-like pill with status variant + label; semantic colors.

---

## 3. Status visualization

- **Loop run status** (dashboard + detail header):  
  - **running:** Green accent + optional subtle pulse (CSS animation).  
  - **paused:** Amber/warning accent.  
  - **idle / stopped:** Muted (gray).  
  Use semantic tokens: `primary` (running), a warning/amber token if available, else `destructive` only for failure; `muted` for idle.

- **Step status** (StepChip):  
  - **pending:** `muted` border + muted text.  
  - **running:** `primary` background + pulse (same as run “running”).  
  - **done:** Neutral success (e.g. `primary` muted or dedicated success token).  
  - **failed:** `destructive`.  
  - **skipped:** Muted + distinct icon (e.g. ⏭️).

- **Pulse animation:** For “running” only: `@keyframes` opacity or scale (e.g. 1 → 1.05 → 1) with `prefers-reduced-motion: reduce` disabling it.

- **Icons:** Prefer Lucide (e.g. Circle, Check, X, SkipForward) for consistency with existing app.

---

## 4. Information density

- **At a glance (no tap):** Loop status (running/paused/idle), epic title, progress (e.g. 3/11), current task name, “last activity” relative time.
- **Tap to expand:** “All steps” section (collapsed by default). Optional: expand an ActivityRow to full task title if truncated.
- **Tap targets:** Entire LoopCard and NowCard are tappable; list rows (ActivityRow, step rows) are one tap target each. No tiny icon-only taps as primary actions; secondary actions (e.g. pause) use at least `--touch-target-min` (40px).

---

## 5. Typography scale (mobile)

Use existing design tokens; no ad-hoc font sizes.

| Use case | Token / class | Notes |
|----------|----------------|--------|
| Screen title / section heading | `--font-size-lg` or `--font-size-xl`, font-semibold | One level per screen. |
| Card title / list primary | `--font-size-md`, font-medium | Epic name, task name. |
| Body / meta | `--font-size-sm` | Agent name, elapsed time. |
| Caption / secondary | `--font-size-xs`, `text-muted-foreground` | “2m ago”, labels. |
| Log content | `--font-size-xs` or `--font-size-sm`, font-mono | Live log viewer. |

Line-height: `--line-height-snug` for headings, `--line-height-normal` for body. Single-line truncation where needed (`truncate`).

---

## 6. Touch target sizing

- **Minimum:** `--touch-target-min: 40px` (already in DESIGN_LANGUAGE) for any control (buttons, chips that act as links).
- **List rows (LoopCard, ActivityRow, step row):** Min height ≥ 48px (12px from scale) for comfortable tap; prefer 48px–56px.
- **Extend hit area:** Use utility `extend-touch-target` (from globals) for icon buttons so logical size can stay compact while touch area meets minimum.

---

## 7. Dark mode

- **General:** All components use semantic tokens (`bg-card`, `text-muted-foreground`, `border-border`, etc.) so light/dark are handled by theme.
- **Live Log:** Prefer dark-first: dark background (`bg-background` in dark theme), high-contrast monospace (`--code-foreground`), optional subtle `--surface` for log lines. Ensure focus ring and selection remain visible (design language).

---

## 8. Navigation pattern

- **Stack-based (back-arrow):** Dashboard → Loop Detail → Live Log. Each screen has a back control (←) in the header; no tab bar. Rationale: linear “drill-down” matches “check status → see detail → watch log”; fewer chrome elements on small screens.
- **No swipe-between-screens:** Swipe is reserved for scroll; navigation is explicit (back, tap card, “Watch Live”).
- **Deep links:** Loop Detail and Live Log are route-based (`/epics/:epicId`, `/epics/:epicId/log` or similar) so links and refresh keep context.

---

## 9. Summary

- **Three screens:** Dashboard (list + optional NowCard), Detail (NowCard + Activity + All Steps), Live Log (full-screen stream).
- **Four new components:** LoopCard, NowCard, ActivityRow, StepChip — all token-driven, with Storybook stories at 375px.
- **Status:** Running (green, pulse), paused (amber), idle/stopped (muted); steps: pending, running, done, failed, skipped.
- **Density:** Key info visible at a glance; All Steps collapsed by default.
- **Typography:** Existing scale (xs/sm/md/lg/xl); monospace for log.
- **Touch:** Min 40px targets; list rows 48px+.
- **Dark:** Semantic tokens + dark-first Live Log.
- **Nav:** Back-arrow stack; no tab bar.

Implementations should use this spec plus DESIGN_LANGUAGE.md and the prototype components/stories for layout and spacing verification.
