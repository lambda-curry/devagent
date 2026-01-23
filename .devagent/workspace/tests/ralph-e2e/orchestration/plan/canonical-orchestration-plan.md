# Ralph E2E Orchestration Canonical Plan — “Orchestrator Hello World”

- Owner: DevAgent / Ralph E2E loop
- Last Updated: 2026-01-23
- Status: Draft
- Related Task Hub: `.devagent/workspace/tests/ralph-e2e/orchestration/`
- Notes: This plan validates the **Orchestrator Loop** by coordinating two trivial epics.

---

## PART 1: PRODUCT CONTEXT

### Summary
Test the fully autonomous orchestration layer by executing two small, sequential epics:
1. **Epic A (Static)**: Add a simple JSON asset file.
2. **Epic B (Dynamic)**: Read that JSON file and output its content to a log.

This exercises:
- Hub branch creation.
- Epic kickoff and background execution.
- Suspend/Resume coordination.
- Automated merging and rebasing.

---

## PART 2: ORCHESTRATION PLAN

### Implementation Epics

#### Epic A: Data Foundation
- **ID:** `devagent-orch-a`
- **Objective:** Create a static data file for Epic B to consume.
- **Tasks:**
  - Create `apps/ralph-monitoring/public/orch-test.json` with `{ "hello": "world" }`.
- **Dependencies:** None

#### Epic B: Data Consumer
- **ID:** `devagent-orch-b`
- **Objective:** Verify the data from Epic A is accessible.
- **Tasks:**
  - Create a test in `apps/ralph-monitoring/app/lib/__tests__/orch-verify.test.ts` that reads the JSON and asserts the content.
- **Dependencies:** Epic A

---

## PART 3: ORCHESTRATOR TASKS (Hub)

### Hub Tasks (To be synced via loop.json)

1. **Sync Loop Config** (ObjectivePlanner)
2. **Kickoff Epic A** (EpicCoordinator) - Target Epic: `devagent-orch-a`
3. **Wait for Epic A** (EpicCoordinator) - Signal: `ready-for-review`
4. **Merge Epic A** (BranchManager) - Target Epic: `devagent-orch-a`
5. **Kickoff Epic B** (EpicCoordinator) - Target Epic: `devagent-orch-b`
6. **Wait for Epic B** (EpicCoordinator) - Signal: `ready-for-review`
7. **Merge Epic B** (BranchManager) - Target Epic: `devagent-orch-b`
8. **Teardown Objective** (EpicCoordinator)
