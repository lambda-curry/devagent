# Ralph E2E Orchestration Canonical Plan — “Orchestrator Hello World”

- Owner: DevAgent / Ralph E2E loop
- Last Updated: 2026-01-23
- Status: Draft
- Related Task Hub: `.devagent/workspace/tests/ralph-e2e/orchestration/`
- Notes: This plan validates the **Dependency-Driven Orchestrator Loop**.

---

## PART 1: PRODUCT CONTEXT

### Summary
Test the fully autonomous orchestration layer by executing two small, sequential epics using native Beads dependencies:
1. **Epic A (Static)**: Add a simple JSON asset file.
2. **Epic B (Dynamic)**: Read that JSON file and output its content to a log.

This exercises:
- Nested hierarchy discovery (Objective -> Epics -> Tasks).
- Flow control via cross-epic dependencies.
- Autonomous, context-aware branching.

---

## PART 2: ORCHESTRATION TREE

### Implementation Epics (Children of Hub)

#### Epic A: Data Foundation
- **ID:** `devagent-orch-a-v2`
- **Objective:** Create a static data file for Epic B to consume.
- **Tasks:**
  - Create `apps/ralph-monitoring/public/orch-test.json` with `{ "hello": "world" }`.
  - **Wrap up & Close Epic A**.
- **Dependencies:** None
- **Branch:** `feature/orch-a`

#### Epic B: Data Consumer
- **ID:** `devagent-orch-b-v2`
- **Objective:** Verify the data from Epic A is accessible.
- **Tasks:**
  - Create a test in `apps/ralph-monitoring/app/lib/__tests__/orch-verify.test.ts` that reads the JSON and asserts the content.
  - **Wrap up & Close Epic B**.
- **Dependencies:** Epic A
- **Branch:** `feature/orch-b`

---

## PART 3: INTEGRATION TASKS (Hub)

### Hub Tasks (Blocked by Epics)

1. **Setup & Sync**: (objective-planner) Create the tree using `setup-loop.ts`.
2. **Merge Epic A**: (branch-manager) Merge `feature/orch-a` to the hub.
   - **Depends on:** `devagent-orch-a-v2.close`.
3. **Merge Epic B**: (branch-manager) Merge `feature/orch-b` to the hub.
   - **Depends on:** `devagent-orch-b-v2.close`.
4. **Final Summary**: (epic-coordinator) Document success.
   - **Depends on:** Merge Epic B.
