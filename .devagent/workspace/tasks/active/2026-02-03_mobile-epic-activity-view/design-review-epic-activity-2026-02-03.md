# Design Review: EpicActivity, EpicCommitList, EpicMetaCard

**Task:** devagent-mobile-epic-activity-2026-02-03.3-design  
**Reference:** `apps/ralph-monitoring/docs/DESIGN_LANGUAGE.md`, `app/globals.css`

## Summary

Components are **design-consistent** with DESIGN_LANGUAGE.md: colors use semantic tokens, spacing uses `--space-*`, layout stacks on mobile, empty states are clear, and light/dark parity is maintained via tokens. One small token alignment was applied (EpicMetaCard inline code).

---

## Review Criteria

### 1. Colors match DESIGN_LANGUAGE.md tokens

**Finding: PASS**

- **EpicActivity:** `text-muted-foreground`, `text-foreground`, `border-border` — all semantic.
- **EpicCommitList:** `text-primary`, `text-muted-foreground`, `text-foreground`, `border-border` — all semantic.
- **EpicMetaCard:** `text-primary`, `text-muted-foreground`; empty state previously used `bg-muted` for inline code — **updated** to `bg-code-highlight` + `text-code-foreground` + spacing scale for inline code per design system (code semantics + light/dark parity).

No hardcoded hex/rgb/oklch in these components.

### 2. Spacing follows spacing scale (`--space-*`)

**Finding: PASS**

- Card headers: `pb-[var(--space-2)]`.
- List spacing: `space-y-[var(--space-3)]`, `gap-[var(--space-0-5)]`, `gap-x-[var(--space-2)]`, `gap-y-[var(--space-0-5)]`, `pb-[var(--space-2)]`.
- EpicMetaCard inline code: now `px-[var(--space-1)] py-[var(--space-0-5)]` (was `px-1 py-0.5`).

Parent route `epics.$epicId.tsx` uses `--space-*` for section/grid (`gap-[var(--space-4)]`, `mt-[var(--space-6)]`, etc.). Minor note: header/label areas use Tailwind `gap-2` (8px) — equivalent to `--space-2`; acceptable.

### 3. Mobile layout stacks correctly, readable on small screens

**Finding: PASS**

- Section uses `grid gap-[var(--space-4)] sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3` — single column on small screens, then 2/3 columns.
- Cards use shared `Card`/`CardHeader`/`CardContent` with token-based padding; list items use `flex flex-col` and `flex-wrap` so type + timestamp wrap.
- No fixed min-widths that would break mobile; text is `text-sm` / `text-xs` with readable hierarchy.

### 4. Empty states are clear and helpful

**Finding: PASS**

- **EpicActivity:** “No recent activity for this epic.” — clear, actionable.
- **EpicCommitList:** “No commits recorded for this epic yet.” — clear.
- **EpicMetaCard:** “No PR link for this epic. Set `pr_url` in the run file to show a link.” — explains cause and fix; inline code styled with code tokens.

### 5. Light/dark parity maintained

**Finding: PASS**

All colors are semantic (`background`, `foreground`, `muted-foreground`, `primary`, `border`, `card`, `code-highlight`, `code-foreground`). Theme is wired in `globals.css` for `:root` and `.dark`; no theme-specific overrides in these components.

---

## Artifacts

- **Storybook:** Stories added for design review and theme matrix:
  - `app/components/EpicActivity.stories.tsx` — WithActivity, Empty, dark variants
  - `app/components/EpicCommitList.stories.tsx` — WithCommits, WithCommitsNoRepo, Empty, dark variants
  - `app/components/EpicMetaCard.stories.tsx` — WithPrLink, NoPrLink, dark variants
- Run: `cd apps/ralph-monitoring && bun run storybook` to verify light/dark and empty states.

## Change made

- **EpicMetaCard:** Inline code for `pr_url` now uses `bg-code-highlight`, `text-code-foreground`, and spacing scale `px-[var(--space-1)] py-[var(--space-0-5)]` for consistency with DESIGN_LANGUAGE code semantics and light/dark parity.

## Acceptance (observable)

- [x] Colors use DESIGN_LANGUAGE semantic tokens only.
- [x] Spacing uses `--space-*` scale.
- [x] Mobile: single-column stack, readable text, no overflow.
- [x] Empty states: clear copy and, where relevant, guidance.
- [x] Light/dark: no hardcoded colors; theme parity via tokens.

Signed: Design Agent — Pixel Perfector
