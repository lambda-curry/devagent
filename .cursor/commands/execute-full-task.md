# Execute Full Task (Command)

## Instructions

1. Using only `.devagent/**`, follow the `.devagent/core/workflows/execute-full-task.md` workflow to run a full task lifecycle end-to-end.

2. Execute workflows continuously without pausing between phases. Only pause if:
   - Missing required inputs
   - Encountering blocking errors
   - An explicit user pause point is provided (see input context)

3. Required: Task description (title or 1-3 sentences).

4. Optional: Complexity hint (simple/standard/complex), workflow overrides (skip/include), pause points (e.g., "pause after plan"), existing task hub path (if already created).

---

**Input Context:**
Task description: "<your task description>"

(Optional: Complexity hint, workflow overrides, pause points, existing task hub path.)
