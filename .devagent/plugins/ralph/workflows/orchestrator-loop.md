# Orchestrator Loop Workflow (Ralph Plugin)

## Mission
Execute the orchestrator loop to coordinate multiple dependent epics for a multi-epic objective. This workflow leverages **native Beads dependencies** to manage the lifecycle of implementation epics, ensuring a seamless flow from sync to integration without manual "wait" tasks.

## Prerequisites
- Orchestrator configuration exists at `.devagent/plugins/ralph/tools/config.json`
- Objective loop config JSON exists (created by setup workflow)
- Beads tasks and nested epics created via `setup-loop.ts`
- Git access is available and working branch is configured

## Standard Instructions Reference
Before executing this workflow, review standard instructions in `.devagent/core/AGENTS.md` → Standard Workflow Instructions.

## Workflow Overview

The orchestrator loop follows a **Dependency-Driven** pattern:
1. **Setup & Sync**: Initialize the objective hub and sync the nested tree (Objective -> Epics -> Tasks) to Beads.
2. **Implementation (Automatic)**: Ralph executes implementation tasks as they become "ready" in the tree. Agents autonomously switch branches based on task hints.
3. **Integration (Merge)**: Integration tasks (merging epics to the hub) become "ready" as soon as their respective implementation epics are closed.
4. **Teardown**: Finalize the objective once all implementation and integration work is complete.

## Workflow Steps

### Step 1: Objective Setup & Sync

**Objective:** Initialize the hub branch and sync the entire project blueprint to Beads.

**Instructions:**
1. Create the `feature/<objective-slug>-hub` branch off the base branch.
2. Construct/Verify the `loop.json` blueprint. 
   - Use `descriptionPath` for long objective specs.
   - For multi-epic objectives, reference child loop files in kickoff tasks: `Loop File: ./path/to/child-loop.json`.
3. Run the setup tool:
   ```bash
   bun .devagent/plugins/ralph/tools/setup-loop.ts path/to/loop.json
   ```
4. Verify the tree structure: `bd tree --parent <OBJECTIVE_ID>`.

**Acceptance Criteria:**
- Objective tree created in Beads.
- Kickoff tasks include `Target Epic` and optional `Loop File` references.
- Implementation epics correctly linked to the Hub.
- Dependencies set (Integration tasks blocked by Implementation epics).

**Role:** ObjectivePlanner (project-manager)

---

### Step 2: Integrated Execution (The Loop)

**Objective:** Execute implementation and integration tasks in the order dictated by the Beads graph.

**Instructions:**
1. Follow the **Context-Aware Branching** protocol in `AGENTS.md`.
2. Look for `Branch: feature/...` hints in task descriptions to manage your git state.
3. When kicking off a child epic (EpicCoordinator):
   - Check if a `Loop File` is referenced in the kickoff task.
   - If present, run `bun .devagent/plugins/ralph/tools/setup-loop.ts <loop-file>` to populate the child epic's tasks.
   - Trigger the `ralph.sh` loop for the child epic.
4. When working on an implementation task:
   - Stay on the feature branch.
   - Mark the **Epic itself** as `closed` once the last task is finished.
5. When working on an integration task (Merge):
   - Switch to the **Hub Branch**.
   - Merge the feature branch (`--no-ff`).
   - Rebase dependent branches if necessary.

**Acceptance Criteria:**
- Tasks executed in dependency order.
- Child epics initialized autonomously via `Loop File` references.
- Branches managed autonomously by agents.
- Implementation epics closed to unblock integration work.

---

### Step 3: Teardown Objective

**Objective:** Finalize the objective and generate the final report.

**Instructions:**
1. Verify all implementation epics and integration tasks are `closed`.
2. Merge the Hub branch into the primary base branch.
3. Generate the final objective summary report.

**Acceptance Criteria:**
- Objective marked `closed` in Beads.
- All code integrated into the base branch.

**Role:** EpicCoordinator (project-manager)

---

## Integration with Other Roles

**With ObjectivePlanner:**
- Defines the blueprint and sets the initial graph.

**With BranchManager:**
- Handles integration tasks (merges/rebases) on the hub branch.

**With Engineering/QA:**
- Execute implementation tasks on feature branches.

## Quality Standards

**Your Work Should:**
- Respect the Beads dependency graph.
- Manage git state (branching) autonomously based on task context.
- Close epics explicitly to signal flow progress.
- Document integration results (merges/conflicts) in task comments.

## Tools & Commands

**Beads Commands:**
```bash
bd ready --parent <OBJECTIVE_ID> --limit 200 --json  # Discover ready work
bd tree --parent <OBJECTIVE_ID>                      # View project graph
bd update <ID> --status closed                       # Mark task/epic closed
```

**Git Commands:**
```bash
git checkout -b <branch>                             # Context-aware branching
git merge <branch> --no-ff                           # Integration merge
```
