#!/bin/bash

# Ralph Autonomous Execution Loop
# Reads AI tool configuration from config.json and executes tasks

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/config.json"

# Load configuration
if [ ! -f "$CONFIG_FILE" ]; then
    echo "Error: config.json not found at $CONFIG_FILE"
    exit 1
fi

# Load Git integration
GIT_INTEGRATION_SCRIPT="${SCRIPT_DIR}/../skills/git-integration/git-progress.sh"

AI_TOOL=$(jq -r '.ai_tool.name' "$CONFIG_FILE")
AI_COMMAND=$(jq -r '.ai_tool.command' "$CONFIG_FILE")
MAX_ITERATIONS=$(jq -r '.execution.max_iterations' "$CONFIG_FILE")

if [ "$AI_TOOL" = "null" ] || [ -z "$AI_TOOL" ]; then
    echo "Error: No AI tool configured in config.json"
    echo "Set ai_tool.name in config.json"
    exit 1
fi

if [ "$AI_COMMAND" = "null" ] || [ -z "$AI_COMMAND" ]; then
    echo "Error: No command configured for AI tool: $AI_TOOL"
    echo "Set ai_tool.command in config.json"
    exit 1
fi

echo "Starting Ralph execution loop..."
echo "AI Tool: $AI_TOOL"
echo "Command: $AI_COMMAND"
echo "Max iterations: $MAX_ITERATIONS"

# Initialize Git integration
if [ -f "$GIT_INTEGRATION_SCRIPT" ]; then
    echo "Initializing Git integration..."
    if "$GIT_INTEGRATION_SCRIPT" init; then
        echo "✓ Git integration initialized"
    else
        echo "✗ Git integration initialization failed"
        exit 1
    fi
else
    echo "Warning: Git integration script not found"
fi

# Check if AI command is available
if ! command -v "$AI_COMMAND" &> /dev/null; then
    echo "Error: AI command '$AI_COMMAND' not found"
    echo "Please install $AI_TOOL or update config.json"
    exit 1
fi

ITERATION=1

while [ $ITERATION -le $MAX_ITERATIONS ]; do
    echo "=== Iteration $ITERATION ==="
    
    # Get next ready task from Beads
    READY_TASK=$(bd ready --json 2>/dev/null | jq -r '.id // empty')
    
    if [ "$READY_TASK" = "empty" ] || [ -z "$READY_TASK" ]; then
        echo "No more ready tasks. Execution complete."
        break
    fi
    
    echo "Processing task: $READY_TASK"
    
    # Mark task as in progress
    bd update "$READY_TASK" --status in_progress
    
    # Get task details
    TASK_DETAILS=$(bd show "$READY_TASK" --json)
    TASK_DESCRIPTION=$(echo "$TASK_DETAILS" | jq -r '.description // ""')
    TASK_ACCEPTANCE=$(echo "$TASK_DETAILS" | jq -r '.acceptance_criteria | join("; ")')
    TASK_TITLE=$(echo "$TASK_DETAILS" | jq -r '.title // ""')
    
    # Build prompt for AI tool
    PROMPT="Task: $TASK_DESCRIPTION
    
Acceptance Criteria:
$TASK_ACCEPTANCE

Please implement this task following the project's coding standards and patterns."
    
    echo "Executing task with $AI_TOOL..."
    
    # Execute AI tool with the prompt
    if $AI_COMMAND "$PROMPT"; then
        echo "Task implementation completed successfully"
        
        # Run quality gates if configured
        QUALITY_TEMPLATE=$(jq -r '.quality_gates.template' "$CONFIG_FILE")
        if [ "$QUALITY_TEMPLATE" != "null" ] && [ -n "$QUALITY_TEMPLATE" ]; then
            echo "Running quality gates..."
            
            # Load quality gate commands
            QUALITY_CONFIG="${SCRIPT_DIR}/../quality-gates/${QUALITY_TEMPLATE}.json"
            if [ -f "$QUALITY_CONFIG" ]; then
                TEST_CMD=$(jq -r '.commands.test // empty' "$QUALITY_CONFIG")
                LINT_CMD=$(jq -r '.commands.lint // empty' "$QUALITY_CONFIG")
                TYPECHECK_CMD=$(jq -r '.commands.typecheck // empty' "$QUALITY_CONFIG")
                
                QUALITY_PASSED=true
                
                if [ "$TEST_CMD" != "null" ] && [ -n "$TEST_CMD" ]; then
                    echo "Running: $TEST_CMD"
                    if ! eval "$TEST_CMD"; then
                        QUALITY_PASSED=false
                    fi
                fi
                
                if [ "$LINT_CMD" != "null" ] && [ -n "$LINT_CMD" ]; then
                    echo "Running: $LINT_CMD"
                    if ! eval "$LINT_CMD"; then
                        QUALITY_PASSED=false
                    fi
                fi
                
                if [ "$TYPECHECK_CMD" != "null" ] && [ -n "$TYPECHECK_CMD" ]; then
                    echo "Running: $TYPECHECK_CMD"
                    if ! eval "$TYPECHECK_CMD"; then
                        QUALITY_PASSED=false
                    fi
                fi
                
                if [ "$QUALITY_PASSED" = true ]; then
                    echo "Quality gates passed"
                    bd update "$READY_TASK" --status closed
                    bd comment "$READY_TASK" --body "Task completed successfully with all quality gates passing"
                    
                    # Commit task completion with Git integration
                    if [ -f "$GIT_INTEGRATION_SCRIPT" ]; then
                        "$GIT_INTEGRATION_SCRIPT" commit-task "$READY_TASK" "$TASK_TITLE" "passed" "$ITERATION"
                    fi
                else
                    echo "Quality gates failed - marking for revision"
                    bd comment "$READY_TASK" --body "Quality gates failed - needs revision"
                    
                    # Commit failed task with Git integration
                    if [ -f "$GIT_INTEGRATION_SCRIPT" ]; then
                        "$GIT_INTEGRATION_SCRIPT" commit-task "$READY_TASK" "$TASK_TITLE" "failed" "$ITERATION"
                    fi
                fi
            else
                echo "Warning: Quality gate template not found: $QUALITY_CONFIG"
                bd update "$READY_TASK" --status closed
                bd comment "$READY_TASK" --body "Task completed (quality gates not available)"
            fi
        else
            echo "No quality gates configured - marking task complete"
            bd update "$READY_TASK" --status closed
            bd comment "$READY_TASK" --body "Task completed"
            
            # Commit task completion with Git integration
            if [ -f "$GIT_INTEGRATION_SCRIPT" ]; then
                "$GIT_INTEGRATION_SCRIPT" commit-task "$READY_TASK" "$TASK_TITLE" "no-quality-gates" "$ITERATION"
            fi
        fi
    else
        echo "Task implementation failed"
        bd comment "$READY_TASK" --body "Task implementation failed - AI tool returned error"
    fi
    
    # Create periodic checkpoint
    if [ -f "$GIT_INTEGRATION_SCRIPT" ]; then
        "$GIT_INTEGRATION_SCRIPT" checkpoint "$ITERATION"
    fi
    
    ITERATION=$((ITERATION + 1))
done

echo "Ralph execution loop completed after $((ITERATION-1)) iterations"

# Show final Git progress summary
if [ -f "$GIT_INTEGRATION_SCRIPT" ]; then
    echo ""
    echo "=== Final Git Progress ==="
    "$GIT_INTEGRATION_SCRIPT" progress
fi