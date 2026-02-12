# Auto-Live Navigation: Design Decision

**Status:** Recommended  
**Scope:** Dashboard epic card tap → destination (detail vs live).  
**Related:** [mobile-loop-monitor-design.md](./mobile-loop-monitor-design.md) (three-screen flow).

---

## 1. Current flow

- **Dashboard:** User taps a LoopCard → navigates to **epic detail** (`/epics/:epicId`).
- **Detail:** Shows NowCard (with “Watch Live” when running), Activity feed, loop controls, All Steps. “Watch Live” → `/epics/:epicId/live`.
- **Live:** Full-screen log stream. Back arrow → epic detail.

All epic cards currently go to detail first, regardless of run state.

---

## 2. Recommendation

**Use status-based navigation from the dashboard:**

| Epic state (dashboard) | Tap destination |
|------------------------|-----------------|
| **Running** (`in_progress`) | `/epics/:epicId/live` (direct) |
| **Paused** (`blocked`)      | `/epics/:epicId` (detail) |
| **Idle / completed** (`open`, `closed`) | `/epics/:epicId` (detail) |

- **Keep the live view’s back link** to epic detail (no change).
- **Keep the NowCard on the detail view** when returning from live (see §4).

---

## 3. Rationale

- **Intent:** Tapping a running epic is strongly associated with “see what’s happening now.” Sending the user straight to the live log matches that intent and removes one tap (detail → Watch Live).
- **Consistency:** Paused/idle/completed epics don’t have a live stream to show; sending them to detail is correct and avoids an empty or “No active task” live screen as the first view.
- **Back stack:** Back from live already goes to detail. That stays the single return path so the mental model is simple: Live → Detail → Dashboard.
- **Data:** Dashboard already has epic status (`epic.status` → `in_progress` / `blocked` / `open` / `closed`) and maps it to run state for the card; no new API is required.

---

## 4. Detail view when returning from live

**Keep the NowCard on the detail view.**

- After “Back” from live, the user is on detail. The NowCard still shows current task (and “Watch Live”) when running, so they can re-enter live or quickly see status without an extra navigation.
- Removing the NowCard would simplify the detail layout but would make “go to live again” harder and would diverge from the existing Loop Detail spec (NowCard as the “Now” hero). The benefit of one fewer component does not outweigh the loss of quick re-entry and consistency with the design spec.

**Conclusion:** No change to detail layout; keep NowCard for both first visit and return-from-live.

---

## 5. Implementation notes

- **Dashboard:** In `epics._index.tsx`, in the `LoopCard` `onClick`, branch on epic status (or the same mapping used for card display): if `epic.status === 'in_progress'`, `navigate(href('/epics/:epicId/live', { epicId: epic.id }))`; otherwise `navigate(href('/epics/:epicId', { epicId: epic.id }))`.
- **Accessibility:** Ensure the card’s accessible name or description reflects that tapping may go to “live log” when running (e.g. aria-label or visible hint so users understand the different behavior).
- **Edge:** If the loop is paused while the user is on the dashboard, the card shows “paused” and tap correctly goes to detail. No change needed for live route when run state changes after load; user can use “Watch Live” from detail if they start/resume from there.

---

## 6. Summary

| Question | Decision |
|----------|----------|
| Running epic tap | Go directly to `/epics/:epicId/live`. |
| Non-running (paused/idle/completed) tap | Go to `/epics/:epicId` (detail). |
| Back from live | Keep existing: back → detail. |
| NowCard on detail after back? | Yes; keep NowCard for re-entry and spec alignment. |

This gives a clear, status-based rule for where the first tap goes and keeps the existing back path and detail layout unchanged.
