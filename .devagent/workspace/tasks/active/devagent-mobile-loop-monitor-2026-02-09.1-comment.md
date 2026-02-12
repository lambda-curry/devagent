Commit: 0dc8bda3 - feat(ralph-monitoring): mobile-first loop dashboard (epics index)

Summary:
- Redesigned epics index as mobile-first loop dashboard using LoopCard from design exploration.
- Each card shows epic name, status (running/paused/idle), progress bar, current task + agent, and relative last-activity time; tap navigates to loop detail.
- getEpics() extended with current_task_title and current_task_agent; formatRelativeTime() added with unit tests.
- Sort order: running > paused > idle > closed. Auto-revalidate every 10s when tab visible.

Verification: lint passed (epics._index); tests passed for epics._index and formatRelativeTime. Typecheck has pre-existing failures in settings.projects.tsx (out of scope). beads.server tests fail in this env due to better-sqlite3 native module/Node version mismatch, not due to these changes.

Revision Learning:
**Category**: Process
**Priority**: Low
**Issue**: Navigation test (click card → assert detail route) triggered React Router's navigate() which in jsdom caused Request/AbortSignal errors; full navigation in stub was unreliable.
**Recommendation**: For route stubs, assert tap targets (button, aria-label) and that cards render; defer full navigation-to-detail to integration or QA when needed.
**Files/Rules Affected**: app/routes/__tests__/epics._index.test.tsx

Signed: Engineering Agent — Code Wizard
