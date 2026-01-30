## Ralph Monitoring Dashboard Enhancements

Transforms the ralph-monitoring app from a task viewer into a **loop management dashboard** with:

- **Epic Progress Dashboard** — Bird's-eye view of loop runs (X/Y tasks, estimated time)
- **Loop Control Panel** — Start, pause, skip, retry from the UI
- **Agent Activity Timeline** — Chronological view of agent work across tasks

### Epic & Beads

- **Epic:** `devagent-ralph-dashboard-2026-01-30` (Ralph Monitoring Dashboard Enhancements)
- **Plan:** `.devagent/workspace/tasks/active/2026-01-30_ralph-monitoring-dashboard-enhancements/plan/2026-01-30_dashboard-enhancements-plan.md`

### Prerequisites (verified)

- [x] Working branch exists and is checked out: `feature/ralph-monitoring-dashboard-enhancements`
- [x] Epic exists in Beads; config validated (`config.json`: base `main`, working branch matches)
- [x] PR created for loop execution visibility

### Current progress (from epic)

Phase 1 (Data Foundation) tasks completed: execution log schema, duration in task queries, and associated QA. Remaining work: epic list/detail routes, timeline, control panel, control API, design/QA tasks, final review and revise report.

---

*This PR supports the Ralph autonomous loop for epic `devagent-ralph-dashboard-2026-01-30`.*
