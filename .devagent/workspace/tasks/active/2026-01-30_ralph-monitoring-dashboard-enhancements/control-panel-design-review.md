# Design Review: LoopControlPanel (control-panel-design)

**Task:** devagent-ralph-dashboard-2026-01-30.control-panel-design  
**Artifact:** `apps/ralph-monitoring/app/components/LoopControlPanel.tsx`, `LoopControlPanel.stories.tsx`, `docs/DESIGN_LANGUAGE.md`, `docs/component-specs.md`

---

## 1. Buttons — design system sizing (36px default)

**Decision:** PASS.

- Primary actions (Start, Pause, Resume) use `size="default"` → `--control-height-default` (36px) per DESIGN_LANGUAGE and component-specs §2.4.
- Skip buttons use `size="sm"` → `--control-height-compact` (32px). Acceptable for secondary/repetitive actions per density tiers; keeps primary actions visually prominent.

**Acceptance:** Primary control buttons are 36px; secondary (Skip) is 32px. No change required.

---

## 2. Status indicators — clear and accessible

**Decision:** PASS.

- Status is shown as text: "Status: Stopped | Running | Paused" in a `<p>` with `aria-live="polite"` so changes are announced.
- Accessible names on buttons ("Start run", "Pause run", "Resume run", "Skip task {title}") are present.

**Optional enhancement (out-of-scope for this review):** A small semantic indicator (e.g. Badge or colored dot) for at-a-glance state (e.g. Running = green dot) could be added in a follow-up; not required for acceptance.

**Acceptance:** Status is readable and announced; no change required.

---

## 3. Confirmation dialogs — well-designed

**Decision:** FAIL.

- **Current:** Pause, Resume, and Skip use native `window.confirm()`. Native confirm is not styled, has no focus trap, and is not consistent with the app’s design system or accessibility expectations.
- **Expected:** Confirmations should use a design-system dialog (e.g. Radix AlertDialog or shadcn AlertDialog) so copy, actions, and focus behavior are consistent and accessible.

**Recommendation for engineering:** Introduce a shared confirmation dialog (e.g. `ConfirmDialog` or use Radix `AlertDialog`) and use it for "Pause the loop after the current task?", "Resume the loop?", and "Skip task \"{title}\"?" so that:
- Dialog uses token-backed styling (card/popover, Button variants).
- Focus is trapped and returned correctly; Escape cancels; primary action is clear.
- Copy and button labels remain as above.

**Acceptance (after fix):** Pause/Resume/Skip trigger a styled, accessible confirmation dialog instead of `window.confirm`.

---

## 4. Layout — different viewport sizes

**Decision:** PASS.

- `CardContent` uses `flex flex-wrap items-center gap-[var(--space-3)]`. Token-based spacing and wrap prevent overflow on narrow viewports.
- No fixed min-width on the control group that would break small screens.

**Acceptance:** Layout works at different viewport sizes; no change required.

---

## Summary

| Criterion | Result | Action |
|----------|--------|--------|
| Buttons 36px default | PASS | None |
| Status clear & accessible | PASS | None |
| Confirmation dialogs well-designed | **FAIL** | Replace `window.confirm` with design-system AlertDialog |
| Layout at different viewports | PASS | None |

**Cross-task:** Engineering/QA task for Control Panel should implement the confirmation-dialog replacement and verify focus/accessibility. Design artifact: this review; no new Storybook story required for the dialog itself once the primitive is in place (existing stories can keep mocking confirm for now).

Signed: Design Agent — Pixel Perfector
