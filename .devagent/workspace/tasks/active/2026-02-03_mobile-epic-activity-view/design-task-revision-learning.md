Revision Learning:
**Category**: Rules
**Priority**: Low
**Issue**: DESIGN_LANGUAGE.md documents code tokens (`--code`, `--code-highlight`, `--code-foreground`) but component inventory does not call out inline `<code>` usage; EpicMetaCard used `bg-muted` for inline code.
**Recommendation**: In component-specs or DESIGN_LANGUAGE, add a short note: "Inline code in prose: use `bg-code-highlight` + `text-code-foreground` and spacing scale for padding."
**Files/Rules Affected**: `apps/ralph-monitoring/docs/DESIGN_LANGUAGE.md`, `docs/component-specs.md` (if present)

Signed: Design Agent — Pixel Perfector
