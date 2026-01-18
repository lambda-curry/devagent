QA verification complete for monitoring UI ergonomics (kanban scroll, closed toggle, Tasks/Epics delineation, newline rendering).

Findings
- Kanban horizontal scroll:
  - The board scroller uses `overflow-x-auto` and the columns container uses `flex flex-nowrap`, preventing wrap and enabling horizontal scroll.
  - Keyboard horizontal scrolling is supported when the scroller is focused (ArrowLeft/ArrowRight/Home/End).
  - File: `apps/ralph-monitoring/app/routes/_index.tsx`
- Closed toggle:
  - Closed column is collapsed by default when `status=all`.
  - Toggle is rendered with accessible label and the preference persists via localStorage key `ralph-monitoring.closed-collapsed`.
  - Closed is forced expanded when filtering `status=closed`.
  - File: `apps/ralph-monitoring/app/routes/_index.tsx`
- Epic/task delineation:
  - “Work items” select persists via localStorage key `ralph-monitoring.work-items`.
  - Tasks view (default): renders leaf issues only (`children.length === 0`).
  - Epics view: renders parent issues only (`children.length > 0`) and shows inline child list; avoids duplicate child cards elsewhere.
  - File: `apps/ralph-monitoring/app/routes/_index.tsx`
- Newline rendering:
  - Task fields + comment bodies normalize CRLF and literal `\\n`/`\\r\\n` sequences into real `\n` at the data boundary.
  - Implementation: `normalizeBeadsMarkdownText` in `apps/ralph-monitoring/app/db/beads.server.ts`

Verification evidence (tests)
- Work items toggle present + closed column collapsed-by-default behavior:
  - `apps/ralph-monitoring/app/routes/__tests__/_index.test.tsx`
- Newline normalization for task fields and comment bodies:
  - `apps/ralph-monitoring/app/db/__tests__/beads.server.test.ts`

Quality gates (passed)
- `apps/ralph-monitoring`: `bun run lint`, `bun run typecheck`, `bun run test` (210 tests passed)
- repo root (turbo): `bun run lint`, `bun run typecheck`, `bun run test`

Screenshots captured: none (verification performed via code review + automated tests in this environment).
