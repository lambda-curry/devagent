#!/bin/bash

# Git Progress Integration for Ralph Autonomous Execution
# Provides durable progress tracking, checkpointing, and rollback capabilities

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load Git configuration if available
GIT_CONFIG_FILE="${SCRIPT_DIR}/../../tools/config.json"
if [ -f "$GIT_CONFIG_FILE" ]; then
    AUTO_COMMIT=$(jq -r '.git.auto_commit // true' "$GIT_CONFIG_FILE")
    AUTO_MERGE_EPICS=$(jq -r '.git.auto_merge_epics // false' "$GIT_CONFIG_FILE")
    CHECKPOINT_INTERVAL=$(jq -r '.git.checkpoint_interval // 10' "$GIT_CONFIG_FILE")
    CREATE_TAGS=$(jq -r '.git.create_tags // true' "$GIT_CONFIG_FILE")
    BRANCH_PREFIX=$(jq -r '.git.branch_prefix // "ralph/"' "$GIT_CONFIG_FILE")
else
    # Default settings
    AUTO_COMMIT=true
    AUTO_MERGE_EPICS=false
    CHECKPOINT_INTERVAL=10
    CREATE_TAGS=true
    BRANCH_PREFIX="ralph/"
fi

# Git repository validation
validate_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo "Error: Not in a git repository"
        return 1
    fi
    
    if [ -n "$(git status --porcelain)" ] && [ "$1" != "force" ]; then
        echo "Warning: Uncommitted changes detected"
        echo "Commit or stash changes before starting Ralph execution"
        return 1
    fi
    
    return 0
}

# Create Ralph execution branch
create_ralph_branch() {
    local branch_name="${BRANCH_PREFIX}$(date +%Y%m%d-%H%M%S)"
    echo "Creating Ralph branch: $branch_name"
    git checkout -b "$branch_name"
    git config branch.mainBranch protection
    echo "$branch_name"
}

# Commit completed task
git_commit_task() {
    local task_id="$1"
    local task_title="$2"
    local quality_status="$3"
    local iteration="$4"
    
    if [ "$AUTO_COMMIT" != "true" ]; then
        echo "Auto-commit disabled, skipping commit for task $task_id"
        return 0
    fi
    
    # Stage all changes
    git add .
    
    # Generate commit message
    local commit_msg="ralph: Complete task $task_id - $task_title

Task: $task_id
Acceptance Criteria: See task description
Quality Gates: $quality_status
Iteration: $iteration

Co-authored-by: Ralph <ralph@autonomous>"
    
    # Commit changes
    if git commit -m "$commit_msg"; then
        echo "✓ Completed task $task_id"
        
        # Create task completion tag if quality gates passed
        if [ "$CREATE_TAGS" = "true" ] && [ "$quality_status" = "passed" ]; then
            git tag "task/$task_id/complete" -m "Complete $task_title"
            echo "✓ Created tag: task/$task_id/complete"
        fi
        
        return 0
    else
        echo "✗ Failed to commit task $task_id"
        # Stash changes on failure
        git stash push -m "ralph-failed-commit-$task_id"
        return 1
    fi
}

# Mark epic completion
git_complete_epic() {
    local epic_id="$1"
    local epic_title="$2"
    
    if [ "$CREATE_TAGS" != "true" ]; then
        echo "Tag creation disabled, skipping epic completion tag"
        return 0
    fi
    
    git tag "epic/$epic_id/complete" -m "Complete epic: $epic_title"
    echo "✓ Created tag: epic/$epic_id/complete"
    
    # Optionally merge to main
    if [ "$AUTO_MERGE_EPICS" = "true" ]; then
        local current_branch=$(git branch --show-current)
        git checkout main
        
        if git merge "$current_branch" --no-ff -m "Merge Ralph completion: $epic_title"; then
            git tag "epic/$epic_id/merged" -m "Merged epic: $epic_title"
            echo "✓ Merged epic $epic_id to main"
        else
            echo "✗ Merge conflicts detected - manual resolution required"
            git merge --abort
            return 1
        fi
    fi
}

# Create periodic checkpoint
git_create_checkpoint() {
    local current_iteration="$1"
    
    if [ $((current_iteration % CHECKPOINT_INTERVAL)) -ne 0 ]; then
        return 0
    fi
    
    if [ "$AUTO_COMMIT" != "true" ]; then
        echo "Auto-commit disabled, skipping checkpoint"
        return 0
    fi
    
    echo "Creating checkpoint at iteration $current_iteration"
    
    git add .
    local checkpoint_msg="ralph: Checkpoint - iteration $current_iteration

Auto-checkpoint created by Ralph autonomous execution
Iteration: $current_iteration
Timestamp: $(date -Iseconds)"
    
    if git commit -m "$checkpoint_msg"; then
        if [ "$CREATE_TAGS" = "true" ]; then
            local checkpoint_tag="checkpoint/$(date +%Y-%m-%d)-$current_iteration"
            git tag "$checkpoint_tag" -m "Ralph checkpoint after $current_iteration iterations"
            echo "✓ Created checkpoint tag: $checkpoint_tag"
        fi
    else
        echo "✗ Failed to create checkpoint"
        return 1
    fi
}

# Rollback to specific point
git_rollback() {
    local target="$1"
    
    echo "Rolling back to: $target"
    
    if git checkout "$target"; then
        echo "✓ Rolled back to: $target"
        echo "Available ready tasks:"
        bd ready --json 2>/dev/null | jq -r '.id // "None"'
    else
        echo "✗ Failed to rollback to: $target"
        return 1
    fi
}

# Show execution progress
git_show_progress() {
    echo "=== Ralph Execution Progress ==="
    
    echo "Recent commits:"
    git log --oneline --grep="ralph:" --since="1 week ago"
    
    echo ""
    echo "Available checkpoints:"
    if [ "$CREATE_TAGS" = "true" ]; then
        git tag -l "checkpoint/*" 2>/dev/null | sort -r || echo "No checkpoints found"
    fi
    
    echo ""
    echo "Completed tasks:"
    if [ "$CREATE_TAGS" = "true" ]; then
        git tag -l "task/*/complete" 2>/dev/null | sort || echo "No completed tasks"
    fi
}

# Resume from last checkpoint
git_resume_checkpoint() {
    local last_checkpoint
    if [ "$CREATE_TAGS" = "true" ]; then
        last_checkpoint=$(git tag -l "checkpoint/*" 2>/dev/null | sort -r | head -1)
    fi
    
    if [ -n "$last_checkpoint" ]; then
        echo "Resuming from checkpoint: $last_checkpoint"
        git checkout "$last_checkpoint"
        return 0
    else
        echo "No checkpoints found - starting fresh"
        return 1
    fi
}

# Initialize Git integration
git_init_integration() {
    if validate_git_repo; then
        echo "✓ Git repository validated"
        create_ralph_branch
        return 0
    else
        echo "✗ Git repository validation failed"
        return 1
    fi
}

# Command line interface
case "${1:-}" in
    "init")
        git_init_integration
        ;;
    "commit-task")
        git_commit_task "$2" "$3" "$4" "$5"
        ;;
    "complete-epic")
        git_complete_epic "$2" "$3"
        ;;
    "checkpoint")
        git_create_checkpoint "$2"
        ;;
    "rollback")
        git_rollback "$2"
        ;;
    "progress")
        git_show_progress
        ;;
    "resume")
        git_resume_checkpoint
        ;;
    *)
        echo "Usage: $0 {init|commit-task|complete-epic|checkpoint|rollback|progress|resume}"
        echo ""
        echo "Commands:"
        echo "  init                    - Initialize Git for Ralph execution"
        echo "  commit-task <id> <title> <quality> <iteration> - Commit completed task"
        echo "  complete-epic <id> <title> - Mark epic as complete"
        echo "  checkpoint <iteration>    - Create checkpoint at iteration"
        echo "  rollback <tag>          - Rollback to specific tag/commit"
        echo "  progress                - Show execution progress"
        echo "  resume                  - Resume from last checkpoint"
        exit 1
        ;;
esac