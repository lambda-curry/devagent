## QA: Epic List Route — Result: PASS

**Checks:**
- [x] Navigate to /epics and verify list renders — PASS (heading "Epics", list of epic cards)
- [x] Verify progress bars show correct percentages — PASS (32%, 0%, 100%, etc. via snapshot)
- [x] Click on epic and verify navigation to detail — PASS (each epic links to `/tasks/:taskId`; hrefs verified)
- [x] Test empty state with no epics — PASS (unit test: "shows empty state when no epics")
- [x] Browser testing with agent-browser — PASS (agent-browser open/snapshot on http://127.0.0.1:5173/epics)

**Quality gates:**
- `bun run lint` — pass
- `bun run typecheck` — pass
- `bun run test` — 267 tests pass (including epics._index 6 tests)

**Fix applied during QA:**
- Direct load of /epics initially failed with "Element type is invalid... got: undefined" because `statusIcons[epic.status]` and `statusColors[epic.status]` can be undefined when Beads returns a status not in the map (e.g. `tombstone`). Added fallbacks: `statusIcons[epic.status] ?? statusIcons.open` and `statusColors[epic.status] ?? statusColors.open` in `app/routes/epics._index.tsx`, plus a unit test for unknown status.

**Evidence:**
- DOM assertions: heading "Epics", list with epic titles, status labels, "X of Y tasks completed", progressbar with correct percentages, links with `/url: /tasks/<id>`
- Screenshot (failure before fix): `.devagent/workspace/tasks/active/2026-01-30_ralph-monitoring-dashboard-enhancements/screenshots/epic-list-qa-direct-load-error.png`

**Revision Learning:**
- **Category**: Rules
- **Priority**: Medium
- **Issue**: Epic list route did not guard against unknown `epic.status` from Beads (e.g. `tombstone`), causing undefined component render and Application Error on direct /epics load.
- **Recommendation**: When mapping external enum-like values (status, priority) to UI (icons, colors), always provide a fallback for unknown values.
- **Files/Rules Affected**: `apps/ralph-monitoring/app/routes/epics._index.tsx`

Signed: QA Agent — Bug Hunter
