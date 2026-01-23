# Orchestrator Loop Workflow (Ralph Plugin)

## Mission
Execute the orchestrator loop to coordinate multiple dependent epics for a multi-epic objective. This workflow manages the lifecycle of child epics, handles suspend/resume logic, and coordinates git branching and merging.

## Prerequisites
- Orchestrator configuration exists at `.devagent/plugins/ralph/tools/config.json`
- Objective plan document (`objective-plan.md`) exists
- Beads epic tasks have been created (via `sync-objective.ts` or manually)
- Git access is available and working branch is configured

## Standard Instructions Reference
Before executing this workflow, review standard instructions in `.devagent/core/AGENTS.md` → Standard Workflow Instructions for date handling, metadata retrieval, context gathering order, and storage patterns.

## Workflow Overview

The orchestrator loop follows this pattern:
1. **Setup Objective** - Initialize hub branch and validate plan
2. **Sync Plan** - Synchronize objective-plan.md to Beads tasks
3. **Kickoff Epic** - Start the next ready epic
4. **Suspend/Resume Check** - Check for completion signal from child epic
5. **Review Epic** - Verify epic completion and quality
6. **Merge Epic** - Merge epic to hub branch
7. **Teardown Objective** - Finalize and cleanup

## Workflow Steps

### Step 1: Setup Objective

**Objective:** Create the feature/hub branch, validate the objective-plan.md, and initialize the orchestrator state.

**Instructions:**
1. Read the objective-plan.md file
2. Validate the plan structure and content
3. Create the `feature/hub` branch (or use existing if present)
4. Update config.json with hub branch information
5. Verify all prerequisites (base branch exists, git access confirmed)

**Acceptance Criteria:**
- feature/hub branch created and checked out
- objective-plan.md validated and parsed
- Orchestrator state initialized (config.json updated with hub branch)
- All prerequisites verified (base branch exists, git access confirmed)

**Role:** ObjectivePlanner (project-manager)

---

### Step 2: Sync Objective Plan to Beads

**Objective:** Read the objective-plan.md file and synchronize it with Beads tasks.

**Instructions:**
1. Run the sync-objective script:
   ```bash
   bun .devagent/plugins/ralph/tools/sync-objective.ts <plan-path> <objective-epic-id>
   ```
2. Verify all epics from plan are created/updated in Beads
3. Verify dependencies between epics are correctly set
4. Ensure task structure matches plan document structure

**Acceptance Criteria:**
- objective-plan.md parsed successfully
- All epics from plan created/updated in Beads
- Dependencies between epics correctly set in Beads
- Task structure matches plan document structure

**Role:** ObjectivePlanner (project-manager)

---

### Step 3: Kickoff Next Epic

**Objective:** Identify the next ready epic, create its feature branch, and trigger its execution.

**Instructions:**
1. Query Beads for ready epics (no blockers, dependencies satisfied):
   ```bash
   bd ready --parent <objective-epic-id> --type epic --json
   ```
2. Select the next ready epic
3. Create feature branch off hub (or appropriate parent branch for stacking):
   ```bash
   bun .devagent/plugins/ralph/tools/git-manager.ts checkout-feature <epic-branch-name> <hub-branch>
   ```
4. Update config.json with epic's working branch
5. Trigger the epic's Ralph loop execution:
   ```bash
   .devagent/plugins/ralph/tools/ralph.sh --epic <epic-id> 2>&1 | cat
   ```
6. After kickoff, proceed to Suspend/Resume Check step

**Acceptance Criteria:**
- Next ready epic identified (no blockers, dependencies satisfied)
- Feature branch created off hub (or parent branch for stacking)
- config.json updated with epic's working branch
- Epic's Ralph loop execution triggered
- Orchestrator loop suspended (waiting for epic completion)

**Role:** EpicCoordinator (project-manager)

---

### Step 4: Suspend/Resume Check (Critical Step)

**Objective:** Check if the child epic has signaled completion by adding the `review-needed` label to the orchestrator task. If the label is missing, suspend (exit). If present, resume (continue).

**Instructions:**
1. Identify the orchestrator task ID (current task being executed)
2. Run the check-child-status tool:
   ```bash
   bun .devagent/plugins/ralph/tools/check-child-status.ts <orchestrator-task-id> review-needed
   ```
3. **If exit code is 0 (label found - Resume):**
   - Continue to Step 5: Review Epic
   - Remove the `review-needed` label to prevent re-triggering:
     ```bash
     bd label remove <orchestrator-task-id> review-needed
     ```
4. **If exit code is 1 (label missing - Suspend):**
   - Exit the orchestrator loop
   - The loop will be re-triggered later (via cron, webhook, or manual trigger)
   - When re-triggered, this step will run again to check for the signal
5. **If exit code is 2 (error):**
   - Log the error
   - Mark orchestrator task as blocked with error details
   - Exit workflow

**Acceptance Criteria:**
- Workflow includes a step to check child task labels
- If label missing, workflow exits (Suspend)
- If label present, workflow continues (Resume)

**Role:** EpicCoordinator (project-manager)

**Resume Trigger Mechanism:**
- Child epic adds `review-needed` label to orchestrator task when it completes
- Orchestrator checks for this label on each loop iteration
- Label-based signaling enables event-driven suspend/resume without polling

---

### Step 5: Review Epic Completion

**Objective:** Check the status of the child epic, verify completion, and determine next steps.

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
- Child epic status checked (bd show <epic-id> --json)
- Epic completion verified (all tasks closed or blocked)
- Quality gates reviewed (commits, tests, lint status)
- Next action determined (merge, retry, or handle blocker)

**Role:** EpicCoordinator (project-manager)

---

### Step 6: Merge Epic to Hub

**Objective:** Merge the completed epic's feature branch to the hub branch and handle rebasing of dependent epics.

**Instructions:**
1. Merge epic's feature branch to hub:
   ```bash
   bun .devagent/plugins/ralph/tools/git-manager.ts merge-to-hub <epic-branch> <hub-branch>
   ```
2. Handle merge conflicts if any (using standard strategies)
3. If other epics are in progress, rebase them onto the updated hub:
   ```bash
   bun .devagent/plugins/ralph/tools/git-manager.ts rebase-branch <epic-branch> origin/<hub-branch>
   ```
4. Handle rebase conflicts autonomously (or pause if complex)
5. Push updated hub branch:
   ```bash
   git push origin <hub-branch>
   ```

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
1. Verify all child epics are completed or blocked:
   ```bash
   bd list --parent <objective-epic-id> --type epic --json
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
- All child epics completed or blocked
- Hub branch merged to base branch (if applicable)
- Final objective summary report generated
- Orchestrator state cleaned up

**Role:** EpicCoordinator (project-manager)

---

## Suspend/Resume Pattern

The orchestrator loop uses a suspend/resume pattern to efficiently wait for child epic completion:

**Suspend (Exit):**
- After kicking off an epic, the orchestrator checks for the `review-needed` label
- If the label is missing, the orchestrator exits (suspends)
- The orchestrator task remains in `in_progress` or `blocked` status
- No continuous polling occurs

**Resume (Continue):**
- Child epic adds `review-needed` label to orchestrator task when it completes
- Orchestrator loop is re-triggered (via cron, webhook, or manual trigger)
- On wake-up, orchestrator checks for the label again
- If label found, orchestrator continues to review and merge steps
- Label is removed after processing to prevent re-triggering

**Re-triggering Mechanisms:**
- **Manual**: User re-runs orchestrator loop
- **Cron**: Scheduled job checks and re-triggers if label present
- **Webhook**: Beads webhook triggers orchestrator on label addition (future)

## Error Handling

- **No ready epics**: Mark orchestrator task as blocked, document reason
- **Epic kickoff fails**: Retry, then block with error
- **Epic completion unclear**: Block and request clarification
- **Resume signal missing**: Remain suspended, document wait
- **Merge/rebase conflicts**: Handle autonomously or pause if complex

## Integration with Other Roles

**With ObjectivePlanner:**
- Use Beads epic tasks created by ObjectivePlanner
- Ensure epics exist before kickoff

**With BranchManager:**
- Coordinate branch creation for epics
- Coordinate merging epics to hub
- Handle rebasing when dependencies merge

**With Child Epics:**
- Trigger child epic execution
- Monitor child epic progress
- Respond to child epic completion signals

## Quality Standards

**Your Work Should:**
- Identify ready epics accurately (dependencies satisfied)
- Kick off epics with correct configuration
- Monitor epic status effectively
- Detect completion signals reliably
- Review epic quality thoroughly
- Coordinate sequencing correctly
- Handle suspend/resume gracefully

## Tools & Commands

**Beads Commands:**
```bash
bd list --parent <EPIC_ID> --json                    # List child tasks
bd list --parent <EPIC_ID> --type epic --json       # List child epics
bd show <ID> --json                                  # Get task/epic details
bd update <ID> --status <status>                    # Update status
bd label list <ID>                                   # List labels
bd label add <ID> <label>                            # Add label
bd label remove <ID> <label>                         # Remove label
bd comments add <ID> "<message>"                    # Add comment
```

**Orchestrator Tools:**
```bash
bun .devagent/plugins/ralph/tools/sync-objective.ts <plan-path> <epic-id>
bun .devagent/plugins/ralph/tools/check-child-status.ts <task-id> <label>
bun .devagent/plugins/ralph/tools/git-manager.ts <command> <args>
.devagent/plugins/ralph/tools/ralph.sh --epic <epic-id>
```
