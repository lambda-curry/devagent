Revision Learning:

**Category**: Process
**Priority**: Medium
**Issue**: The revise report task (devagent-034b9i.7) was triggered while 2 tasks (devagent-034b9i.8, devagent-034b9i.9) remain open. The task description explicitly states "This task runs only after all other epic tasks are closed or blocked", indicating the task was triggered prematurely.

**Recommendation**: Add a validation step at the start of the report generation workflow (`.devagent/plugins/ralph/workflows/generate-revise-report.md`) to verify that all child tasks (excluding the report task itself) are closed or blocked before proceeding. If any open or in_progress tasks remain, exit early with a clear error message explaining which tasks need to be completed first. This prevents wasted effort and ensures the report is only generated when the epic is truly ready for final review.

**Files/Rules Affected**: 
- `.devagent/plugins/ralph/workflows/generate-revise-report.md` (add validation step in Step 1)
- Task trigger logic that determines when the revise report task becomes ready

Signed: Project Manager Agent — Chaos Coordinator
