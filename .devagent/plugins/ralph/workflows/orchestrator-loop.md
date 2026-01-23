# Orchestrator Loop Workflow (Ralph Plugin)

## Mission
Execute the orchestrator loop to coordinate multiple dependent epics for a multi-epic objective. This workflow manages the lifecycle of target epics, handles suspend/resume logic, and coordinates git branching and merging.

## Prerequisites
- Orchestrator configuration exists at `.devagent/plugins/ralph/tools/config.json`
- Objective loop config JSON exists (created by setup workflow)
- Beads tasks can be created via `setup-loop.ts`
- Git access is available and working branch is configured

## Standard Instructions Reference
Before executing this workflow, review standard instructions in `.devagent/core/AGENTS.md` → Standard Workflow Instructions for date handling, metadata retrieval, context gathering order, and storage patterns.

## Workflow Overview

The orchestrator loop follows this pattern:
1. **Setup Objective** - Initialize hub branch and validate loop config
2. **Sync Loop Config** - Synchronize loop config JSON to Beads tasks
3. **Kickoff Epic** - Start the target epic referenced by the task
4. **Suspend/Resume Check** - Check for completion signal from target epic
5. **Review Epic** - Verify epic completion and quality
6. **Merge Epic** - Merge epic to hub branch
7. **Teardown Objective** - Finalize and cleanup

## Workflow Steps

### Step 1: Setup Objective

**Objective:** Create the feature/hub branch, validate the objective loop config, and initialize the orchestrator state.

**Instructions:**
1. Locate the objective loop config JSON (created by setup workflow)
2. Validate the loop config against the schema
3. Create the `feature/hub` branch (or use existing if present)
4. Update config.json with hub branch information
5. Verify all prerequisites (base branch exists, git access confirmed)

**Acceptance Criteria:**
- feature/hub branch created and checked out
- objective loop config validated
- Orchestrator state initialized (config.json updated with hub branch)
- All prerequisites verified (base branch exists, git access confirmed)

**Role:** ObjectivePlanner (project-manager)

---

### Step 2: Sync Objective Loop Config to Beads

**Objective:** Sync the objective loop config JSON into Beads tasks.

**Instructions:**
1. Run the loop setup script (loop config only):
   ```bash
   bun .devagent/plugins/ralph/tools/setup-loop.ts <loop-config.json>
   ```
2. Verify all tasks from the loop config exist in Beads
3. Verify dependencies are correctly set
4. Ensure task structure matches the loop config

**Acceptance Criteria:**
- Loop config validated and synced
- All tasks from loop config created/updated in Beads
- Dependencies correctly set in Beads
- Task structure matches loop config

**Role:** ObjectivePlanner (project-manager)

---

### Step 3: Kickoff Target Epic

**Objective:** Use the current orchestrator task to kick off the target epic, create its feature branch, and trigger its execution.

**Instructions:**
1. Read the orchestrator task and extract the target epic ID:
   ```bash
   bd show <orchestrator-task-id> --json
   ```
   - Look for `Target Epic: <id>` in the description/notes.
   - If metadata exists, `metadata.target_epic_id` is acceptable too.
2. Verify the target epic exists and dependencies are closed (if listed in the task details):
   ```bash
   bd show <epic-id> --json
   ```
3. Create feature branch off hub (or appropriate parent branch for stacking):
   ```bash
   git checkout <hub-branch>
   git pull origin <hub-branch>
   git checkout -b <epic-branch-name>
   git push -u origin <epic-branch-name>
   ```
4. Update config.json with the epic's working branch
5. Trigger the epic's Ralph loop execution:
   ```bash
   .devagent/plugins/ralph/tools/ralph.sh --epic <epic-id> 2>&1 | cat
   ```
6. After kickoff, proceed to Suspend/Resume Check step

**Acceptance Criteria:**
- Target epic identified from the orchestrator task
- Feature branch created off hub (or parent branch for stacking)
- config.json updated with epic's working branch
- Epic's Ralph loop execution triggered
- Orchestrator loop suspended (waiting for epic completion)

**Role:** EpicCoordinator (project-manager)

---

### Step 4: Suspend/Resume Check (Critical Step)

**Objective:** Check if the **Target Epic** has reached a specific state (status or label). If the signal is missing, suspend (exit). If present, resume (continue).

**Instructions:**
1. Identify the **Target Epic ID** from the current task's description.
2. Run the check-task-status tool on the **Target Epic ID**:
   ```bash
   # Use 'ready-for-review' label or 'closed' status as the signal
   bun .devagent/plugins/ralph/tools/check-task-status.ts <target-epic-id> ready-for-review
   ```
3. **If exit code is 0 (Signal found - Resume):**
   - Continue to Step 5: Review Epic.
4. **If exit code is 1 (Signal missing - Suspend):**
   - Exit the orchestrator loop. The loop will be re-triggered later.
5. **If exit code is 2 (Error):**
   - Mark orchestrator task as blocked and log the error.

**Acceptance Criteria:**
- Workflow exits if the target epic isn't ready.
- Workflow continues if the target epic is `closed` or has the `ready-for-review` label.

**Role:** EpicCoordinator (project-manager)

---

### Step 5: Review Epic Completion

**Objective:** Check the status of the target epic, verify completion, and determine next steps.

**Instructions:**
1. Check epic status in Beads:
   ```bash
   bd show <epic-id> --json
   ```
2. Verify epic completion:
   - Check if epic status is "closed" or all tasks are closed
   - Review all child tasks:
     ```bash
     bd list --parent <epic-id> --json
     ```
3. Review epic quality:
   - Verify quality gates passed (check task comments for test/lint/typecheck results)
   - Verify commits are present and linked to tasks
   - Check for unexpected blockers:
     ```bash
     bd list --parent <epic-id> --status blocked --json
     ```
4. Determine next action:
   - **Epic Complete**: Proceed to Step 6: Merge Epic
   - **Epic Blocked**: Mark orchestrator task as blocked, document reason
   - **Epic Incomplete**: Mark orchestrator task as blocked, document missing work

**Acceptance Criteria:**
- Target epic status checked (bd show <epic-id> --json)
- Epic completion verified (all tasks closed or blocked)
- Quality gates reviewed (commits, tests, lint status)
- Next action determined (merge, retry, or handle blocker)

**Role:** EpicCoordinator (project-manager)

---

### Step 6: Merge Epic to Hub

**Objective:** Merge the completed epic's feature branch to the hub branch and handle rebasing of dependent epics.

**Instructions:**
1. Checkout the hub branch and pull:
   ```bash
   git checkout <hub-branch>
   git pull origin <hub-branch>
   ```
2. Merge epic's feature branch to hub:
   ```bash
   git merge <epic-branch> --no-ff -m "Merge epic <epic-slug> to hub"
   ```
3. Handle merge conflicts if any (using standard strategies)
4. Push updated hub branch:
   ```bash
   git push origin <hub-branch>
   ```
5. If other epics are in progress, rebase them onto the updated hub:
   ```bash
   git checkout <other-epic-branch>
   git pull origin <other-epic-branch>
   git rebase origin/<hub-branch>
   git push --force-with-lease origin <other-epic-branch>
   ```
6. Handle rebase conflicts autonomously (or pause if complex)

**Acceptance Criteria:**
- Epic's feature branch merged to hub branch
- Merge conflicts resolved (if any) using standard strategies
- Other in-progress epic branches rebased onto updated hub
- Rebase conflicts handled autonomously (or paused if complex)
- Hub branch updated and pushed

**Role:** BranchManager (project-manager)

---

### Step 7: Teardown Objective

**Objective:** Finalize the objective execution, merge hub branch to base branch (if applicable), and generate final summary report.

**Instructions:**
1. Verify all target epics are completed or blocked:
   ```bash
   # Collect target epic IDs from the loop config
   jq -r '.tasks[].metadata.target_epic_id // empty' <loop-config.json> | sort -u
   
   # If IDs live in descriptions, read them manually from the loop config
   # (look for "Target Epic: <id>") and verify each epic is closed or blocked.
   bd show <epic-id> --json
   ```
2. If all epics complete, merge hub branch to base branch:
   ```bash
   git checkout <base-branch>
   git merge <hub-branch>
   git push origin <base-branch>
   ```
3. Generate final objective summary report
4. Clean up orchestrator state (config.json, temporary files)

**Acceptance Criteria:**
- All target epics completed or blocked
- Hub branch merged to base branch (if applicable)
- Final objective summary report generated
- Orchestrator state cleaned up

**Role:** EpicCoordinator (project-manager)

---

## Suspend/Resume Pattern

The orchestrator loop uses a suspend/resume pattern to efficiently wait for target epic completion:

**Suspend (Exit):**
- After kicking off an epic, the orchestrator checks for the `review-needed` label
- If the label is missing, the orchestrator exits (suspends)
- The orchestrator task remains in `in_progress` or `blocked` status
- No continuous polling occurs

**Resume (Continue):**
- Target epic adds `review-needed` label to orchestrator task when it completes
- Orchestrator loop is re-triggered (via cron, webhook, or manual trigger)
- On wake-up, orchestrator checks for the label again
- If label found, orchestrator continues to review and merge steps
- Label is removed after processing to prevent re-triggering

**Re-triggering Mechanisms:**
- **Manual**: User re-runs orchestrator loop
- **Cron**: Scheduled job checks and re-triggers if label present
- **Webhook**: Beads webhook triggers orchestrator on label addition (future)

## Error Handling

- **Missing target epic**: Mark orchestrator task as blocked, document reason
- **Epic kickoff fails**: Retry, then block with error
- **Epic completion unclear**: Block and request clarification
- **Resume signal missing**: Remain suspended, document wait
- **Merge/rebase conflicts**: Handle autonomously or pause if complex

## Integration with Other Roles

**With ObjectivePlanner:**
- Use Beads tasks created by ObjectivePlanner
- Ensure target epic IDs are included in the loop config

**With BranchManager:**
- Coordinate branch creation for epics
- Coordinate merging epics to hub
- Handle rebasing when dependencies merge

**With Target Epics:**
- Trigger target epic execution
- Monitor target epic progress
- Respond to target epic completion signals

## Quality Standards

**Your Work Should:**
- Identify target epics accurately from task details
- Kick off epics with correct configuration
- Monitor epic status effectively
- Detect completion signals reliably
- Review epic quality thoroughly
- Coordinate sequencing correctly
- Handle suspend/resume gracefully

## Tools & Commands

**Beads Commands:**
```bash
bd list --parent <EPIC_ID> --json                    # List epic tasks
bd show <ID> --json                                  # Get task/epic details
bd update <ID> --status <status>                    # Update status
bd label list <ID>                                   # List labels
bd label add <ID> <label>                            # Add label
bd label remove <ID> <label>                         # Remove label
bd comments add <ID> "<message>"                    # Add comment
```

**Orchestrator Tools:**
```bash
bun .devagent/plugins/ralph/tools/setup-loop.ts <loop-config.json>
bun .devagent/plugins/ralph/tools/check-task-status.ts <task-id> <label>
.devagent/plugins/ralph/tools/ralph.sh --epic <epic-id>
```
