# Ralph Objective E2E Setup (Command)

## Instructions
1. Follow the **Multi-Epic Orchestration** workflow in `.devagent/plugins/ralph/workflows/orchestrator-loop.md`.
2. Use the **Objective Hub** pattern with separate loop files for each epic.
3. Sync the objective hub first:
   ```bash
   bun .devagent/plugins/ralph/tools/setup-loop.ts .devagent/workspace/tests/ralph-objective-e2e/objective-hub.json
   ```
4. Simulate the Coordinator's first step (syncing Epic A):
   ```bash
   bun .devagent/plugins/ralph/tools/setup-loop.ts .devagent/workspace/tests/ralph-objective-e2e/epic-a.json
   ```
5. Verify the entire project graph:
   ```bash
   bd graph devagent-obj-e2e-hub
   bd graph devagent-obj-e2e-epic-a
   ```

---

**Input Context:**
Objective Hub: `.devagent/workspace/tests/ralph-objective-e2e/objective-hub.json`
Epic A: `.devagent/workspace/tests/ralph-objective-e2e/epic-a.json`
Epic B: `.devagent/workspace/tests/ralph-objective-e2e/epic-b.json`
