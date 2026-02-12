# LogViewer Toolbar Simplification for Mobile

**Status:** Recommended  
**Scope:** Card-based LogViewer toolbar (task detail page). Mobile-on-the-go monitoring use case.  
**Related:** [mobile-loop-monitor-design.md](./mobile-loop-monitor-design.md), [auto-live-ux-decision.md](./auto-live-ux-decision.md).

---

## 1. Context

The **card-based LogViewer** (`~/components/LogViewer.tsx`) appears on the **task detail** page (`/projects/:projectId/tasks/:taskId`). It currently shows a toolbar with **7 controls**:

| Control | Purpose |
|--------|--------|
| Retry | Reconnect / reload logs after error or connection loss |
| Pause / Resume | Pause streaming display and auto-scroll |
| Copy | Copy full log text to clipboard |
| Download | Download logs as `.txt` file |
| Jump to top | Scroll to top of log |
| Jump to bottom | Scroll to bottom and resume auto-scroll |
| Toggle line numbers | Show/hide line numbers in content |

For **mobile-on-the-go monitoring**, most of these add clutter. The **fullscreen live view** (`/epics/:epicId/live`, `EpicLiveView`) already provides a minimal UX: **tap-to-pause** on the log area and a single **"Resume auto-scroll"** button when paused — no other toolbar buttons.

This doc answers:

1. Which controls are essential for mobile live monitoring?
2. Should the toolbar be hidden/minimal by default with an overflow menu for power features?
3. Does the card-based LogViewer need separate pause/resume given the fullscreen live view?
4. Should copy/download be desktop-only (hidden on mobile)?

---

## 2. Current usage

- **LogViewer (card):** Task detail only. User has drilled into a specific task; may be on mobile or desktop.
- **EpicLiveView (fullscreen):** Used when user taps a running epic (dashboard → live) or "Watch Live" from epic detail. Optimized for mobile: tap log to pause, one "Resume auto-scroll" button.

The card-based LogViewer is the **secondary** log surface when the user is on task detail rather than the dedicated live screen. The **primary** mobile live experience is EpicLiveView.

---

## 3. Investigation summary

### 3.1 Which controls are essential for mobile live monitoring?

| Control | Mobile essential? | Rationale |
|--------|--------------------|------------|
| **Retry** | No (de-prioritize) | If the system "just works," retry is rarely needed. When it is, it can live in an overflow or error state. Jake: "Shouldn't need retry if it just works." |
| **Pause / Resume** | No for card | On mobile, live monitoring is best done on the **fullscreen live view**, which already has tap-to-pause. The card is for quick reference; explicit pause/resume adds UI weight. |
| **Copy** | No | Copy is a power feature; small screens and clipboard usage are less common on-the-go. Better in overflow or desktop-only. |
| **Download** | No | Same as copy; file download is a desktop-oriented workflow. |
| **Jump to top** | Low | Occasionally useful; can live in overflow. |
| **Jump to bottom** | **Yes** | Most valuable for mobile: "see the latest" with one tap. Aligns with auto-scroll and matches mental model of "bottom = newest." Jake: "Jump to bottom seems like the only feature we might need, especially on mobile on the go." |
| **Line numbers** | Low | Helpful for debugging; not critical for quick glance. Can be in overflow. |

**Conclusion (mobile):** For the card-based LogViewer on mobile, **only "Jump to bottom"** is essential for the primary use case. Retry can remain available in error states (e.g. inline with error message) rather than as a permanent toolbar button.

### 3.2 Toolbar: minimal by default vs overflow?

**Recommendation: Minimal by default on small viewports; overflow for power features.**

- **Default (mobile / narrow):** Show only **Jump to bottom** (and optionally a single "More" control that opens an overflow menu).
- **Overflow menu:** Retry, Pause/Resume, Copy, Download, Jump to top, Line numbers. This keeps the toolbar from wrapping and reduces visual noise.
- **Desktop / wide:** Either keep current full toolbar or same minimal + overflow pattern for consistency.

Implementation options:

- **Option A — Viewport-based:** Use a media query or `useMediaQuery` (e.g. `md` or `640px`). Below breakpoint: minimal toolbar + overflow. Above: full toolbar or same minimal + overflow.
- **Option B — Minimal everywhere:** One row: Jump to bottom + "More" (overflow). All other actions in overflow on all viewports. Simplest and consistent.

Recommendation: **Option A** with a single breakpoint (e.g. `sm` or `md`). Mobile gets minimal + overflow; desktop can keep full bar if desired, or use the same minimal + overflow for consistency.

### 3.3 Fullscreen live view vs card-based LogViewer — pause/resume

The **fullscreen live view** (`EpicLiveView`) has:

- **Tap-to-pause** on the log area (no toolbar).
- **"Resume auto-scroll"** button when paused.

The **card-based LogViewer** has:

- **Explicit Pause/Resume** toolbar button.

**Conclusion:** The card does **not** need to mirror the fullscreen tap-to-pause interaction. Rationale:

- **Different contexts:** Fullscreen is "I'm watching the run"; card is "I'm on a task page and see logs in a box." Tap-to-pause on a card could conflict with scroll/drag and adds complexity.
- **Redundancy:** For mobile live monitoring, the intended flow is Dashboard → Live (fullscreen). The card is a fallback or for deep-linked task view. Keeping one explicit Pause/Resume in the card's **overflow** is enough; it doesn't need to be in the primary mobile toolbar.
- **Recommendation:** Move Pause/Resume into the overflow menu for the card. On mobile, the primary controls stay: Jump to bottom (+ More). No need to add tap-to-pause to the card.

### 3.4 Copy / Download — desktop-only?

**Recommendation: Hide Copy and Download on mobile (small viewport); show in overflow or full toolbar on desktop.**

- **Mobile:** Copy and Download are rarely used on-the-go and consume toolbar space. Place them in the overflow menu only, or hide from overflow on small viewports if we want the overflow to stay short.
- **Desktop:** Keep Copy and Download available (in full toolbar or in overflow).

Implementation: When rendering toolbar or overflow items, omit Copy and Download when viewport is below the chosen breakpoint; or include them only in the overflow and show overflow only when "More" is clicked (then on mobile the overflow can still list Copy/Download for users who need them occasionally).

**Recommendation:** Include Copy and Download in the **overflow menu** on all viewports. On mobile, the default visible toolbar is just Jump to bottom + More; Copy/Download appear inside More. No need to remove them entirely on mobile.

---

## 4. Recommendations (summary)

| Question | Recommendation |
|----------|----------------|
| **Essential controls for mobile** | **Jump to bottom** only as primary. Retry available in error state or overflow. |
| **Toolbar layout** | **Minimal by default on small viewport:** Jump to bottom + "More" (overflow). Overflow contains: Retry, Pause/Resume, Copy, Download, Jump to top, Line numbers. Desktop can use same pattern or keep full bar. |
| **Card vs fullscreen pause** | Card does **not** need tap-to-pause. Keep **Pause/Resume in overflow** for the card. Fullscreen live view remains the place for tap-to-pause + Resume auto-scroll. |
| **Copy / Download on mobile** | **Not in primary toolbar.** Put in overflow only; visible on both mobile and desktop when "More" is used. |

### 4.1 Implementation notes

1. **LogViewer.tsx**
   - Add a viewport check (e.g. `useMediaQuery('(min-width: 640px)')` or Tailwind `sm:`).
   - **Mobile (below breakpoint):** Toolbar shows: [Jump to bottom] [More ▼]. "More" opens a dropdown or popover with: Retry, Pause/Resume, Copy, Download, Jump to top, Line numbers.
   - **Desktop (above breakpoint):** Either (a) same minimal + overflow, or (b) keep current full toolbar. Recommend (a) for consistency.
   - Retry: Keep in overflow; optionally also show inline with error UI when `connection.error` is set (e.g. "Retry" link/button in error banner).

2. **Accessibility**
   - "More" button: `aria-label="More log actions"` or "Log actions".
   - Overflow menu: Ensure keyboard and screen reader can reach all actions (dropdown/popover with focus trap and Escape to close).

3. **No change to EpicLiveView**
   - Fullscreen live view keeps tap-to-pause and "Resume auto-scroll" as-is.

---

## 5. Out of scope

- Changing EpicLiveView behavior (tap-to-pause, Resume button).
- Adding tap-to-pause to the card-based LogViewer.
- Removing Retry from the product (only from primary toolbar; keep in overflow or error state).

---

## 6. References

- **LogViewer:** `app/components/LogViewer.tsx` (toolbar ~lines 424–478).
- **EpicLiveView:** `app/components/EpicLiveView.tsx` (tap-to-pause, Resume auto-scroll).
- **Task detail (card usage):** `app/routes/projects.$projectId.tasks.$taskId.tsx`.
- **Mobile design:** [mobile-loop-monitor-design.md](./mobile-loop-monitor-design.md).
- **Auto-live navigation:** [auto-live-ux-decision.md](./auto-live-ux-decision.md).
