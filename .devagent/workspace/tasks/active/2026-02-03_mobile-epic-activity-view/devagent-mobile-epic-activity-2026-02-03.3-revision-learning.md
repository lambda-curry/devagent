**Revision Learning**

- **Category:** Rules
- **Priority:** Low
- **Issue:** Biome lint flags `aria-label` on non-interactive elements (`<p>`, `<span>`) as unsupported (useAriaPropsSupportedByRole). Tests that relied on those labels for `getByLabelText` broke when labels were removed.
- **Recommendation:** Prefer `role="status"` or visible text for empty states when tests need a stable selector; avoid `aria-label` on plain paragraphs/spans. Use `getByText` for card titles when the title is a `<div>` (e.g. CardTitle), not `getByRole('heading', ...)`.
- **Files/Rules Affected:** `apps/ralph-monitoring/app/components/EpicActivity.tsx`, `EpicCommitList.tsx`, `EpicMetaCard.tsx`; testing-best-practices / a11y rules.

Signed: Engineering Agent — Code Wizard
