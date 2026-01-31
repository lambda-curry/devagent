Revision Learning:
**Category:** Rules & Standards
**Priority:** Medium
**Issue:** LoopControlPanel uses native `window.confirm()` for Pause/Resume/Skip. Review criteria required "confirmation dialogs are well-designed"; native confirm is not styled, not accessible (focus trap, role), and inconsistent with the design system.
**Recommendation:** Add a design-system confirmation primitive (e.g. Radix AlertDialog or shadcn AlertDialog) to the component inventory and use it for all destructive or state-changing confirmations. Document in component-specs or DESIGN_LANGUAGE that confirmations must use the shared dialog, not `window.confirm`.
**Files/Rules Affected:** `apps/ralph-monitoring/app/components/LoopControlPanel.tsx`, `docs/component-specs.md`, future `app/components/ui/alert-dialog.tsx` (or equivalent).

Signed: Design Agent — Pixel Perfector
