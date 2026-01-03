# Implement Plan (Command)

## Instructions

1. Using only `.devagent/**`, follow the `.devagent/core/workflows/implement-plan.md` workflow and execute implementation tasks from the specified plan document.

2. Execute tasks continuously without pausing between tasks. Only pause if:
   - Encountering hard blockers (missing required inputs, blocking errors)
   - Facing truly ambiguous decisions requiring human input
   - Explicitly requested to pause after each task (see input context)

3. Required: Plan document path (or plan document content). Task directory path will be inferred from plan document location.

4. Optional: Task range specification (e.g., "tasks 1-3" or "task 2,4,5"), pause after each task flag (if review at each step is desired).

---

**Input Context:**
Plan document path: `.devagent/workspace/tasks/active/2026-01-02_task-name/plan/2026-01-02_task-name-plan.md`

(Optional: Specify task range, e.g., "tasks 1-3", or "all tasks" to execute all tasks. Optional: Add "pause after each task" if you want to review progress after each task completion.)
