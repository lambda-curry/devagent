# Ralph E2E Orchestration Setup (Command)

## Instructions
1. Follow the **JSON-first blueprinting** workflow in `.devagent/plugins/ralph/workflows/setup-ralph-loop.md`.
2. Convert the canonical `ralph-e2e` **Orchestration Plan** into a structured `loop.json` for the Hub Epic.
3. Use `setup-loop.ts` to sync the Hub JSON to Beads (**always create a fresh hub epic**).
4. Verify the Hub Epic contains tasks for kicking off and merging `devagent-orch-a` and `devagent-orch-b`.
5. Prepare `config.json` for execution.

---

**Input Context:**
Orchestration Plan: `.devagent/workspace/tests/ralph-e2e/orchestration/plan/canonical-orchestration-plan.md`
Runs directory: `.devagent/plugins/ralph/runs/`
Expectations: `.devagent/workspace/tests/ralph-e2e/orchestration/expectations/expectations.md`
