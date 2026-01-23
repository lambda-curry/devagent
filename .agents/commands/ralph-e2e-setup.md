# Ralph E2E Setup (Command)

## Instructions
1. Follow the **JSON-first blueprinting** workflow in `.devagent/plugins/ralph/workflows/setup-ralph-loop.md`.
2. Convert the canonical `ralph-e2e` plan into a structured `loop.json` file.
3. Use `setup-loop.ts` to sync the JSON to Beads (**always create a fresh epic; do not reuse**).
4. Ensure the `epic.id` in your JSON starts with the `devagent-` prefix.
5. Prepare `config.json` for execution (no branch creation/switching).

---

**Input Context:**
Plan document path: `.devagent/workspace/tests/ralph-e2e/plan/canonical-plan.md`
Runs directory: `.devagent/plugins/ralph/runs/`

