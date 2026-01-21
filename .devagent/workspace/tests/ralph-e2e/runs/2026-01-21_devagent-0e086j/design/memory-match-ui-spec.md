# Memory Match (/arcade) — UI-Sensitive Spec (deterministic + accessible)

Task: devagent-0e086j.1 (Design Deliverables)  
Target app: `apps/ralph-monitoring` (React Router v7, Tailwind v4, shadcn-style primitives)  
Storybook artifact: `apps/ralph-monitoring/app/components/arcade/MemoryMatchDesign.stories.tsx`

## Intent

- **A calm, “monitoring-ui” mini-game**: playful content (emoji/tiles), but expressed through the existing token-driven surfaces.
- **Deterministic and reviewable**: the same seed yields the same board layout so tests + screenshots are stable.
- **Accessibility-first**: playable with keyboard and screen readers (clear names, predictable focus order, status announcements).

## Minimum visual layout (wireframe)

```
Memory Match                           [New game] [Copy seed]
Match all pairs. Seed: 12345678

[Moves: 0] [Matches: 0/8]                         Status: Pick a card.

┌───────────────────────────────────────────────────────────┐
| [□] [□] [□] [□]                                            |
| [□] [□] [□] [□]    (grid of tile buttons, responsive)      |
| [□] [□] [□] [□]                                            |
| [□] [□] [□] [□]                                            |
└───────────────────────────────────────────────────────────┘

Hint: Non-matching cards flip back on the next selection.
```

## Observable acceptance (testable UI behavior)

### Page + controls

- **Title**: page renders `Memory Match` as the primary heading.
- **New game**:
  - Resets board state (no revealed/matched tiles except initial hidden state).
  - Updates seed (or respects `?seed=`; see “Seed behavior”).
  - Resets counters (Moves, Matches) to zero.
- **Seed display**:
  - Seed is visible as plain text and styled as “code-ish” (monospace).
  - Optional “Copy seed” control copies the seed string and provides confirmation (toast or inline “Copied”).

### Board interaction (core deterministic states)

- **Card = button**: every tile is a `<button type="button">` with an accessible name.
- **First selection**:
  - Reveals exactly one tile face.
  - Does not increment “Moves” yet.
- **Second selection**:
  - Reveals the second tile face.
  - Increments “Moves” by 1.
  - If matched: both tiles become **matched** (remain revealed + disabled).
  - If not matched: both tiles remain revealed until the **next** tile selection, at which point they revert to hidden before revealing the new tile.
- **Win state**:
  - When all pairs matched, show a clear message: **“You win”**.
  - The board becomes **locked** (all tiles disabled).
  - “New game” remains available.

### Seed behavior (determinism requirements)

- **Stable default seed**: if no `?seed=` is provided, a default seed is used and displayed; refreshing the page does not change the board layout.
- **URL seed**: if `?seed=<value>` is present, the displayed seed matches the URL and the board layout is stable for that seed.
- **Invalid seed**:
  - UI remains functional.
  - Show a small, non-blocking message near the seed (“Invalid seed; using default”) and fall back to default seed.

### Keyboard + screen reader acceptance

- **Tab order**: header controls first (New game, Copy seed), then tiles in row-major order.
- **Focus visible**: focused controls show the existing ring (`focus-visible:ring-ring` from primitives).
- **Accessible names**:
  - Tiles include position and state in `aria-label`, e.g.:
    - Hidden: “Card 3, hidden”
    - Revealed: “Card 3, 🍎”
    - Matched: “Card 3, 🍎 matched”
- **Status announcements**:
  - A `role="status"` / `aria-live="polite"` line updates for key events (“Match”, “No match”, “You win”, “New game started”).

### Responsive / touch targets

- **Touch target**: tile buttons should meet at least `--touch-target-min` (40px) and remain easily tappable.
- **Layout**:
  - Mobile: controls stack; grid columns reduce to keep tiles readable.
  - Desktop: grid can expand (e.g., 4 columns) with consistent gaps via `--space-*`.

## Visual styling guidance (token-first)

- Use existing semantic classes (`bg-background`, `bg-card`, `border-border`, `text-muted-foreground`, `focus-visible:ring-ring`).
- Avoid bespoke colors/box-shadows; rely on `Card` shadow + borders.
- Tile appearance suggestion:
  - Hidden: `Button variant="outline"` (or a “tile” button style that still uses token classes).
  - Revealed: neutral surface with large glyph/emoji.
  - Matched: visually distinct but subtle (e.g., `secondary` surface or muted border) + disabled.
  - Win: a `Card` banner + celebratory copy; avoid animation-heavy effects (support reduced motion).

## Component inventory / reuse list

Reuse these primitives (existing):

- `apps/ralph-monitoring/app/components/ui/button.tsx` (`Button`)
- `apps/ralph-monitoring/app/components/ui/card.tsx` (`Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`)
- `apps/ralph-monitoring/app/components/ui/badge.tsx` (`Badge`) — for counters
- `apps/ralph-monitoring/app/components/ui/sonner.tsx` (optional) — toast for “Copied seed”
- `apps/ralph-monitoring/app/components/ui/select.tsx` (optional) — if adding a “Pairs/Difficulty” selector later
- Token source: `apps/ralph-monitoring/app/globals.css`

New components (optional, recommended only if it simplifies route UI):

- `apps/ralph-monitoring/app/components/arcade/*` — small, testable pieces like `MemoryMatchBoard`, `MemoryMatchTile`, `MemoryMatchHud`

## Storybook artifact (design states)

This task adds a Storybook story to make the desired UI deterministic and reviewable:

- `apps/ralph-monitoring/app/components/arcade/MemoryMatchDesign.stories.tsx`
  - States rendered: initial board, mid-game with two revealed non-match, win+locked
  - Includes both light and dark variants

## QA screenshot mapping (for devagent-0e086j.5)

Suggested screenshot naming + required states:

- `initial.png`: all tiles hidden; counters at zero; seed visible.
- `mid-game-two-revealed.png`: exactly two tiles revealed; status indicates match/no-match.
- `win.png`: “You win” visible; board locked.

