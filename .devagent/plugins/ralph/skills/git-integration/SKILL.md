---
name: Git Progress Integration
description: >-
  Use when: (1) Saving Ralph autonomous execution progress to Git for
  checkpointing and rollback capability, (2) Creating commit history of task
  completion, (3) Managing autonomous execution state across Ralph loop iterations, (4)
  Providing ability to revert changes or go back to specific points in time. This skill
  enables Ralph to use Git as the durable persistence layer for all execution progress.
---

# Git Progress Integration

Manage Git operations for Ralph autonomous execution to provide durable progress tracking, checkpointing, and rollback capabilities.

## Prerequisites

- Git repository initialized in project directory
- Ralph execution loop with access to file system
- Configurable Git settings for commit behavior

## Git Integration Strategy

### Progress Checkpointing

**Automatic Commits per Task:**
- Commit after each successful task completion
- Include task metadata in commit messages
- Create tags for significant milestones

**Commit Message Format:**
```
ralph: Complete task <task-id> - <task-title>

Task: <task-id>
Acceptance Criteria: <completed-criteria>
Quality Gates: <passed/failed>
Iteration: <iteration-number>

Co-authored-by: Ralph <ralph@autonomous>
```

**Tagging Strategy:**
```bash
# Task completion tags
git tag "task/<task-id>/complete" -m "Complete <task-title>"

# Epic completion tags  
git tag "epic/<epic-id>/complete" -m "Complete <epic-title>"

# Checkpoint tags
git tag "checkpoint/<date>-<iteration>" -m "Ralph checkpoint after <iteration> iterations"
```

## Git Operations

### Step 1: Initialize Git Integration

**Check Git Repository Status:**
```bash
# Verify git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "Error: Not in a git repository"
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "Warning: Uncommitted changes detected"
    echo "Commit or stash changes before starting Ralph execution"
    exit 1
fi
```

### Step 2: Create Ralph Branch

**Isolate Autonomous Work:**
```bash
# Create dedicated Ralph branch
RALPH_BRANCH="ralph/$(date +%Y%m%d-%H%M%S)"
git checkout -b "$RALPH_BRANCH"

# Set up branch protection for main branches
git config branch.mainBranch protection
```

### Step 3: Task Completion Commit

**Commit After Successful Task:**
```bash
# Stage all changes
git add .

# Generate commit message
TASK_ID="$1"
TASK_TITLE="$2"
QUALITY_STATUS="$3"
ITERATION="$4"

COMMIT_MSG="ralph: Complete task $TASK_ID - $TASK_TITLE

Task: $TASK_ID
Acceptance Criteria: See task description
Quality Gates: $QUALITY_STATUS
Iteration: $ITERATION

Co-authored-by: Ralph <ralph@autonomous>"

git commit -m "$COMMIT_MSG"

# Create task completion tag
if [ "$QUALITY_STATUS" = "passed" ]; then
    git tag "task/$TASK_ID/complete" -m "Complete $TASK_TITLE"
fi
```

### Step 4: Epic Completion

**Mark Epic Completion:**
```bash
# When all tasks in epic are complete
EPIC_ID="$1"
EPIC_TITLE="$2"

git tag "epic/$EPIC_ID/complete" -m "Complete epic: $EPIC_TITLE"

# Optionally merge to main
if [ "$AUTO_MERGE" = "true" ]; then
    git checkout main
    git merge "$RALPH_BRANCH" --no-ff -m "Merge Ralph completion: $EPIC_TITLE"
    git tag "epic/$EPIC_ID/merged" -m "Merged epic: $EPIC_TITLE"
fi
```

### Step 5: Checkpoint Creation

**Periodic Progress Save:**
```bash
# Create checkpoint every N iterations or on error
CHECKPOINT_INTERVAL="$1"
CURRENT_ITERATION="$2"

if [ $((CURRENT_ITERATION % CHECKPOINT_INTERVAL)) -eq 0 ]; then
    git add .
    git commit -m "ralph: Checkpoint - iteration $CURRENT_ITERATION

Auto-checkpoint created by Ralph autonomous execution
Iteration: $CURRENT_ITERATION
Timestamp: $(date -Iseconds)"

    git tag "checkpoint/$(date +%Y-%m-%d)-$CURRENT_ITERATION" \
        -m "Ralph checkpoint after $CURRENT_ITERATION iterations"
fi
```

### Step 6: Rollback Capability

**Revert to Previous State:**
```bash
# Rollback to specific checkpoint
ROLLBACK_TARGET="$1"  # tag name

git checkout "$ROLLBACK_TARGET"
echo "Rolled back to: $ROLLBACK_TARGET"
echo "Available tasks since rollback:"
bd ready --json
```

### Step 7: Progress Query

**Show Execution History:**
```bash
# Show Ralph execution progress
git log --oneline --grep="ralph:" --since="1 week ago"

# Show available checkpoints
git tag -l "checkpoint/*" | sort -r

# Show completed tasks
git tag -l "task/*/complete" | sort
```

## Error Handling with Git

### Git Failures

**Commit Failures:**
```bash
# If commit fails, stash changes and continue
if ! git commit -m "$COMMIT_MSG"; then
    git stash push -m "ralph-failed-commit-$TASK_ID"
    echo "Warning: Failed to commit $TASK_ID, changes stashed"
fi
```

**Merge Conflicts:**
```bash
# Handle merge conflicts during epic merge
if git merge "$RALPH_BRANCH" 2>&1 | grep -q "conflict"; then
    git merge --abort
    echo "Merge conflicts detected - manual resolution required"
    exit 1
fi
```

## Configuration Options

**Git Integration Settings:**
```json
{
  "git": {
    "auto_commit": true,
    "auto_merge_epics": false,
    "checkpoint_interval": 10,
    "create_tags": true,
    "branch_prefix": "ralph/"
  }
}
```

## Integration with Ralph Loop

**Add to Ralph Script:**
```bash
# After task completion and quality gates pass
if [ "$QUALITY_PASSED" = true ]; then
    # Call git integration
    source "${SCRIPT_DIR}/../skills/git-integration/git-progress.sh"
    git_commit_task "$READY_TASK" "$TASK_TITLE" "passed" "$ITERATION"
    
    # Update Beads and continue loop
    bd update "$READY_TASK" --status closed
fi

# Periodic checkpointing
if [ $((ITERATION % CHECKPOINT_INTERVAL)) -eq 0 ]; then
    git_create_checkpoint "$CHECKPOINT_INTERVAL" "$ITERATION"
fi
```

## Recovery Scenarios

### Resume After Crash
```bash
# Find last Ralph checkpoint
LAST_CHECKPOINT=$(git tag -l "checkpoint/*" | sort -r | head -1)

if [ -n "$LAST_CHECKPOINT" ]; then
    echo "Resuming from checkpoint: $LAST_CHECKPOINT"
    git checkout "$LAST_CHECKPOINT"
    
    # Restart Ralph loop
    ./ralph.sh
fi
```

### Partial Rollback
```bash
# Rollback specific task while keeping others
TASK_TO_ROLLBACK="$1"

# Reset to task completion tag
git reset --soft "task/$TASK_TO_ROLLBACK/complete"

# Re-open task in Beads
bd update "$TASK_TO_ROLLBACK" --status ready
```

## Benefits

1. **Durable Progress**: Git provides persistent storage outside Ralph loop
2. **Checkpointing**: Regular saves protect against crashes
3. **Rollback**: Easy revert to any previous state
4. **History**: Complete audit trail of autonomous execution
5. **Collaboration**: Team can review Ralph's work through Git
6. **Branching**: Isolate Ralph work from main development

## Safety Considerations

- Always start on clean branch to protect main
- Commit after each successful task, not before
- Use tags for permanent milestones
- Keep checkpoints frequent enough for safety
- Validate Git operations before proceeding