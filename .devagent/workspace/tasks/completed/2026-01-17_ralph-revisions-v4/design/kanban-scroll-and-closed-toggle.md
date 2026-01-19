# Kanban UX Spec: Horizontal Scroll + Closed Toggle

Task: `devagent-69fc.7` (Ralph Monitoring UI)

## Goals
- Keep kanban **status columns side-by-side** (no wrapping) across viewport sizes.
- Reduce clutter from large closed lists while keeping closed work discoverable.
- Ensure interactions are usable with **mouse, trackpad, touch, and keyboard**, and are screen-reader friendly.

## Horizontal kanban scrolling

### Layout
- The kanban board is a **single horizontal strip** of status columns.
- Columns are laid out with a **no-wrap flex row**:
  - `display: flex`
  - `flex-wrap: nowrap`
  - `gap` between columns
  - container `overflow-x: auto`
- Each column has a **stable width** to ensure consistent scanning:
  - recommended: `min-width: 320px` on mobile and `min-width: 360–420px` on larger viewports
  - columns should not shrink below their min width

### Scrolling behaviors (input modalities)
- **Trackpad / touchpad**: horizontal two-finger scroll pans the board (native behavior).
- **Mouse wheel**:
  - vertical wheel scroll should continue to scroll the page normally
  - `Shift + wheel` scrolls horizontally (native browser behavior for many devices)
- **Scrollbar**: visible horizontal scrollbar is acceptable; do not hide it.

### Keyboard + accessibility
- The kanban scroller region is **focusable** so keyboard users can intentionally interact with horizontal scroll.
  - Provide a clear accessible label (e.g. “Task board columns”).
- When the scroller is focused:
  - **ArrowLeft / ArrowRight** scrolls the board by roughly one column (or ~80% of a column width).
  - **Home / End** scrolls to start/end of the columns.
- Columns are exposed as semantic regions (e.g. `section`) with an `h2` heading (“In Progress”, “Open”, “Blocked”, “Closed”).
- Focus should not get “lost” off-screen:
  - If a focusable element in a column receives focus while the column is partially off-screen, the UI should ensure the focused element becomes visible horizontally (e.g. `scrollIntoView({ inline: "nearest" })` behavior).

## Closed-task toggle

### Default state
- Default is **closed tasks collapsed** to avoid large “Closed” lists dominating the board.
- The “Closed” column still exists as a column in the board, but its content is collapsed by default.

### Interaction model
- The toggle lives in the **Closed column header** and controls only the closed list visibility (not other columns).
- When **collapsed**:
  - show the header “Closed” and the **count** of closed tasks, but do **not** render the task list
  - include an action labeled **“Show closed”** (or “Show closed tasks”) in the header
- When **expanded**:
  - render the closed task cards normally
  - the header action becomes **“Hide closed”**
- Collapsing should not reset scroll position of other columns.

### Relationship to existing filters/search
- The toggle is intended for the “board” view (all statuses displayed together).
- If the user explicitly filters status to `closed` via the existing Status filter:
  - closed tasks must be visible regardless of previous collapse state (effectively forced expanded)
  - the closed collapse toggle may be hidden or disabled (to avoid “I filtered to closed but can’t see them” confusion)
- If the user filters to a non-`all` status other than `closed` (e.g. `open`):
  - the closed column is not relevant; hide the closed toggle affordance entirely.
- Search should apply to **visible tasks**:
  - if closed is collapsed, closed tasks should not appear in the board results/counts; users can expand closed (or filter status=closed) to search within closed work.

### Persistence
- Persist the collapsed/expanded preference **per browser** (e.g. localStorage) so it survives refreshes.
- URL parameters remain the source of truth for status/priority/search filters; the closed toggle is a UI preference unless we explicitly decide to add it to the URL later.

### Accessibility requirements
- Toggle control must be operable by keyboard (Tab → Space/Enter).
- Use an appropriate accessible name:
  - e.g. “Show closed tasks” / “Hide closed tasks”
  - include count in visible text; screen reader label may optionally include the count.
- Prefer a semantic `button` with `aria-expanded` reflecting the collapsed/expanded state of the closed list region, or a `switch` pattern with `aria-checked`.

## Non-goals / explicitly out of scope (for this decision)
- Adding scroll snap, drag-to-scroll, or momentum behaviors beyond what the browser provides.
- Server-side filtering of closed tasks based on the toggle (this is a presentational toggle unless we later decide to add it to URL + loader).

