# Ralph E2E Orchestration Expectations (v1.0.0)

This rubric defines the success criteria for a fully autonomous **Objective Orchestration** run.

---

## Stage 0: Hub Setup (ObjectivePlanner)
- [ ] **Hub Branch**: A dedicated `feature/<objective-slug>-hub` branch exists.
- [ ] **Blueprint**: A `loop.json` for the Orchestrator Epic was correctly generated and saved.
- [ ] **Sync**: `setup-loop.ts` was executed against the blueprint, creating the Hub Epic.

## Stage 1: Delegation (EpicCoordinator)
- [ ] **Extraction**: The agent correctly identified "Target Epic: devagent-orch-a" from the task description.
- [ ] **Branching**: A dedicated feature branch for the target epic was created off the hub.
- [ ] **Background execution**: The agent started the background ralph loop for the target epic using `.ralph.sh --epic <id>`.
- [ ] **Suspension**: The Orchestrator agent correctly exited (suspended) when `check-task-status.ts` returned exit code 1.

## Stage 2: Resume & Integration (BranchManager)
- [ ] **Detection**: The Orchestrator correctly resumed when the target epic reached `ready-for-review` or `closed`.
- [ ] **Merge**: The target branch was merged into the hub branch using a non-fast-forward merge (`--no-ff`).
- [ ] **Stacking/Rebase**: If Epic B was already in progress, its branch was correctly rebased onto the updated hub.

## Stage 3: Teardown
- [ ] **Completion**: Both Epic A and Epic B are marked `closed` in Beads.
- [ ] **Final Report**: A final objective summary report exists documenting the coordination success.
- [ ] **C6 Compliance**: Git operations were performed directly by agents without brittle wrapper scripts.

---

**Revision Learnings Policy:**
Any friction in the git rebase process or ID extraction must be documented as a "Revision Learning" in the orchestrator task comments.
