# Setup Ralph Loop (Ralph Plugin Command)

## Instructions
1. Follow the **JSON-first blueprinting** workflow in `.devagent/plugins/ralph/workflows/setup-ralph-loop.md`.
2. Convert the plan into a structured `loop.json` file.
3. Use `setup-loop.ts` to sync the JSON to Beads (**always create a fresh epic; do not reuse**).
4. Prepare `config.json` for execution (no branch creation/switching).
5. Start the loop with `.devagent/plugins/ralph/workflows/start-ralph-execution.md`.

---

**Input Context:**
Plan document path: `.devagent/workspace/tasks/active/YYYY-MM-DD_task-name/plan/YYYY-MM-DD_task-name-plan.md`
Runs directory: `.devagent/plugins/ralph/runs/`

