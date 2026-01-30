Revision Learning:
**Category**: Rules
**Priority**: Low
**Issue**: DESIGN_LANGUAGE and component-specs call for token-only colors, but AgentTimeline originally used Tailwind palette classes (emerald-500, red-500, blue-500). No explicit "success" semantic exists in globals.css; we used `muted` for completed/success to stay token-based.
**Recommendation**: If a distinct "success" (e.g. green) is desired across the app, add `--success` (and optionally `--success-foreground`) to globals.css and map timeline success blocks to it; until then muted is the token-aligned choice.
**Files/Rules Affected**: apps/ralph-monitoring/app/globals.css (future), DESIGN_LANGUAGE.md

Signed: Design Agent — Pixel Perfector
