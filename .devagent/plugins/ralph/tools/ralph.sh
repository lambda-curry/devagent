#!/bin/bash

# Ralph Autonomous Execution Loop
# Reads AI tool configuration from config.json and executes tasks

set -e
set -o pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/config.json"

# Fallback to output/ralph-config.json if config.json doesn't exist
if [ ! -f "$CONFIG_FILE" ]; then
    FALLBACK_CONFIG="${SCRIPT_DIR}/../output/ralph-config.json"
    if [ -f "$FALLBACK_CONFIG" ]; then
        CONFIG_FILE="$FALLBACK_CONFIG"
    fi
fi

OUTPUT_FILE="${SCRIPT_DIR}/.ralph_last_output.txt"

# Parse arguments
EPIC_ID=""
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --epic) EPIC_ID="$2"; shift ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

# Check ENV var if flag not set
if [ -z "$EPIC_ID" ] && [ -n "$RALPH_EPIC_ID" ]; then
    EPIC_ID="$RALPH_EPIC_ID"
fi

if [ -z "$EPIC_ID" ]; then
    echo "Error: Epic ID is required."
    echo "Usage: ./ralph.sh --epic <epic-id>"
    echo "   or: export RALPH_EPIC_ID=<epic-id>; ./ralph.sh"
    exit 1
fi

# Load configuration
if [ ! -f "$CONFIG_FILE" ]; then
  echo "Error: config.json not found at $CONFIG_FILE"
  echo "Please run the setup workflow or ensure config exists."
  exit 1
fi

AI_TOOL=$(jq -r '.ai_tool.name' "$CONFIG_FILE")
AI_COMMAND=$(jq -r '.ai_tool.command' "$CONFIG_FILE")
MAX_ITERATIONS=$(jq -r '.execution.max_iterations' "$CONFIG_FILE")

# Set extended timeout for OpenCode bash commands (1 hour) - only if using opencode
if [ "$AI_TOOL" = "opencode" ]; then
  export OPENCODE_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS=3600000
fi

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

# Setup Git Environment (Worktree or Branch)
REPO_ROOT="$(git rev-parse --show-toplevel)"

# Ensure Beads DB path is absolute and exported, so it works inside worktree
BEADS_DB_REL=$(jq -r '.beads.database_path // ".beads/beads.db"' "$CONFIG_FILE")
# Check if path is already absolute
if [[ "$BEADS_DB_REL" = /* ]]; then
    export BEADS_DB="$BEADS_DB_REL"
else
    export BEADS_DB="$REPO_ROOT/$BEADS_DB_REL"
fi

echo "Running in Epic mode for: $EPIC_ID"
WORKTREE_DIR="ralph-worktrees/$EPIC_ID"
WORKTREE_ABS_PATH="$REPO_ROOT/../$WORKTREE_DIR"
BRANCH_NAME="ralph/$EPIC_ID"

if [ ! -d "$WORKTREE_ABS_PATH" ]; then
    echo "Creating worktree at $WORKTREE_ABS_PATH..."
    # Try to fetch origin to ensure we have latest refs (optional, might fail if no origin)
    git fetch origin 2>/dev/null || true
    
    # Create worktree
    git worktree add -f "$WORKTREE_ABS_PATH" -b "$BRANCH_NAME" 2>/dev/null || \
    git worktree add -f "$WORKTREE_ABS_PATH" "$BRANCH_NAME"
    
    echo "Worktree created."
else
    echo "Reusing existing worktree at $WORKTREE_ABS_PATH"
fi

# Switch to worktree
cd "$WORKTREE_ABS_PATH"
echo "Switched to worktree: $(pwd)"

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
  # Filter ready tasks by Epic ID prefix (for subtasks) or direct parent match
  # This relies on hierarchical IDs (bd-xxxx.1.1) from plan-to-beads
  READY_TASK=$(bd list --status ready --json 2>/dev/null | jq -r --arg EPIC "$EPIC_ID" '
      map(select(
        (.id | tostring | startswith($EPIC + ".")) or 
        (.parent_id == $EPIC)
      )) | .[0].id // empty
  ')

  if [ "$READY_TASK" = "empty" ] || [ -z "$READY_TASK" ]; then
    echo "No more ready tasks. Execution complete."
    STOP_REASON="Completed (No ready tasks)"
    break
  fi

  # Epic Status Check
  TASK_EPIC_ID=$(bd show "$READY_TASK" --json 2>/dev/null | jq -r 'if type=="array" then .[0].parent_id else .parent_id end')
  
  # Ensure we are working on the correct epic (double check)
  if [ "$TASK_EPIC_ID" != "$EPIC_ID" ] && [ "$TASK_EPIC_ID" != "null" ]; then
      echo "Warning: Selected task $READY_TASK belongs to $TASK_EPIC_ID, but we are targeting $EPIC_ID. Skipping."
      break
  fi

  if [ -n "$TASK_EPIC_ID" ] && [ "$TASK_EPIC_ID" != "null" ]; then
      EPIC_STATUS=$(bd show "$TASK_EPIC_ID" --json 2>/dev/null | jq -r 'if type=="array" then .[0].status else .status end')
      if [ "$EPIC_STATUS" = "blocked" ] || [ "$EPIC_STATUS" = "done" ]; then
           echo "Parent Epic $TASK_EPIC_ID is $EPIC_STATUS. Stopping execution."
           STOP_REASON="Epic Stopped ($EPIC_STATUS)"
           break
      fi
  fi

  echo "Processing task: $READY_TASK"

  # Mark task as in progress (if not already)
  bd update "$READY_TASK" --status in_progress

  # Get task details
  TASK_DETAILS=$(bd show "$READY_TASK" --json)
  TASK_DESCRIPTION=$(echo "$TASK_DETAILS" | jq -r 'if type=="array" then .[0].description else .description end // ""')
  TASK_ACCEPTANCE=$(echo "$TASK_DETAILS" | jq -r '((if type=="array" then .[0].acceptance_criteria else .acceptance_criteria end) // []) | (if type=="string" then [.] elif type=="array" then . else [] end) | join("; ")')
  TASK_TITLE=$(echo "$TASK_DETAILS" | jq -r 'if type=="array" then .[0].title else .title end // ""')

  # Load Agent Instructions from AGENTS.md
  AGENT_INSTRUCTIONS=""
  AGENTS_MD_FILE="${SCRIPT_DIR}/../AGENTS.md"
  if [ -f "$AGENTS_MD_FILE" ]; then
      AGENT_INSTRUCTIONS=$(cat "$AGENTS_MD_FILE")
  fi

  # Get quality gate info for context
  QUALITY_TEMPLATE=$(jq -r '.quality_gates.template' "$CONFIG_FILE")
  QUALITY_INFO=""
  if [ "$QUALITY_TEMPLATE" != "null" ] && [ -n "$QUALITY_TEMPLATE" ]; then
    QUALITY_CONFIG="${SCRIPT_DIR}/../quality-gates/${QUALITY_TEMPLATE}.json"
    if [ -f "$QUALITY_CONFIG" ]; then
      TEST_CMD=$(jq -r '.commands.test // empty' "$QUALITY_CONFIG")
      LINT_CMD=$(jq -r '.commands.lint // empty' "$QUALITY_CONFIG")
      TYPECHECK_CMD=$(jq -r '.commands.typecheck // empty' "$QUALITY_CONFIG")
      
      QUALITY_INFO="
Quality Gates:
"
      [ -n "$TEST_CMD" ] && QUALITY_INFO="${QUALITY_INFO}- Test: $TEST_CMD\n"
      [ -n "$LINT_CMD" ] && QUALITY_INFO="${QUALITY_INFO}- Lint: $LINT_CMD\n"
      [ -n "$TYPECHECK_CMD" ] && QUALITY_INFO="${QUALITY_INFO}- Typecheck: $TYPECHECK_CMD\n"
    fi
  fi

  # Build prompt for AI tool
  PROMPT="Task: $TASK_DESCRIPTION
Task ID: $READY_TASK
Parent Epic ID: $TASK_EPIC_ID

Acceptance Criteria:
$TASK_ACCEPTANCE

${QUALITY_INFO}
CONTEXT:
You are working on task $READY_TASK which is part of Epic $TASK_EPIC_ID.
You can view the epic details and other tasks using: bd show $TASK_EPIC_ID

### AGENT OPERATING INSTRUCTIONS
$AGENT_INSTRUCTIONS

### EXECUTION INSTRUCTIONS
Please implement this task following the instructions above and the project's coding standards.

FAILURE MANAGEMENT & STATUS UPDATES:
1. You are responsible for verifying your work. Run tests/lints if possible.
2. If you complete the task successfully, YOU MUST run: bd update $READY_TASK --status closed
3. If you cannot fix the task, mark it blocked: bd update $READY_TASK --status blocked
4. If you need to retry, leave it in_progress.

After completing the implementation, you must add comments to this task (bd-$READY_TASK):
1. Document revision learnings (see \".devagent/plugins/ralph/AGENTS.md\" for format)
2. Document any screenshots captured (if applicable)
3. Add commit information after quality gates pass

See \".devagent/plugins/ralph/AGENTS.md\" → Task Commenting for Traceability for detailed requirements."

  echo "Executing task with $AI_TOOL..."
  echo "--- Agent Output (streaming) ---"

  # Execute AI tool with the prompt and stream output in real-time
  if [ "$AI_TOOL" = "cursor" ] || [ "$AI_TOOL" = "agent" ]; then
    # Cursor/Agent CLI with text output format
    # Use PIPESTATUS to capture the actual agent command exit code, not tee's
    if command -v stdbuf >/dev/null 2>&1; then
      stdbuf -oL -eL "$AI_COMMAND" -p --force --output-format text "$PROMPT" | tee "$OUTPUT_FILE"
      EXIT_CODE=${PIPESTATUS[0]}
    else
      "$AI_COMMAND" -p --force --output-format text "$PROMPT" | tee "$OUTPUT_FILE"
      EXIT_CODE=${PIPESTATUS[0]}
    fi
  else
    # Legacy OpenCode pattern
    # Use PIPESTATUS to capture the actual command exit code, not tee's
    if command -v stdbuf >/dev/null 2>&1; then
      stdbuf -oL -eL OPENCODE_CLI=1 "$AI_COMMAND" run "$PROMPT" | tee "$OUTPUT_FILE"
      EXIT_CODE=${PIPESTATUS[0]}
    else
      OPENCODE_CLI=1 "$AI_COMMAND" run "$PROMPT" | tee "$OUTPUT_FILE"
      EXIT_CODE=${PIPESTATUS[0]}
    fi
  fi

  echo "--- End Agent Output ---"

  if [ $EXIT_CODE -eq 0 ]; then
    echo "Task implementation completed successfully"
  else
    echo "Task implementation failed (exit code: $EXIT_CODE)"
    # If agent crashed, we should probably log it.
    bd comments add "$READY_TASK" "Task implementation failed - AI tool returned error (exit code: $EXIT_CODE)"
    bd update "$READY_TASK" --status todo
  fi

  ITERATION=$((ITERATION + 1))
done

if [ $ITERATION -gt $MAX_ITERATIONS ]; then
    echo "Max iterations ($MAX_ITERATIONS) reached. Stopping."
    STOP_REASON="Max Iterations Reached"
elif [ -z "$STOP_REASON" ]; then
    STOP_REASON="Execution Stopped (Unknown Reason)"
fi

echo "Ralph execution loop completed. Reason: $STOP_REASON"

# Show Git progress summary
echo ""
echo "=== Git Progress Summary ==="
git log --oneline --grep="ralph:" -n 10

# --- Automatic PR Creation ---
if command -v gh &> /dev/null; then
    echo "Generating Execution Report and PR..."
    
    # 1. Push Branch
    CURRENT_BRANCH=$(git branch --show-current)
    if [ -z "$CURRENT_BRANCH" ]; then
        echo "Error: Could not determine current branch. Skipping PR."
    else
        echo "Pushing branch $CURRENT_BRANCH..."
        git push origin "$CURRENT_BRANCH" --force || echo "Warning: Push failed."
        
        # 2. Generate Report Content
        REPORT_FILE="${SCRIPT_DIR}/.ralph_pr_body.md"
        echo "# Ralph Execution Report" > "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        echo "**Status:** $STOP_REASON" >> "$REPORT_FILE"
        echo "**Date:** $(date)" >> "$REPORT_FILE"
        echo "**Branch:** $CURRENT_BRANCH" >> "$REPORT_FILE"
        
        if [ -n "$EPIC_ID" ]; then
            EPIC_TITLE=$(bd show "$EPIC_ID" --json 2>/dev/null | jq -r 'if type=="array" then .[0].title else .title end')
            echo "**Epic:** $EPIC_TITLE ($EPIC_ID)" >> "$REPORT_FILE"
            PR_TITLE="Ralph Execution: $EPIC_TITLE ($EPIC_ID)"
        else
            PR_TITLE="Ralph Execution: $CURRENT_BRANCH"
        fi
        
        echo "" >> "$REPORT_FILE"
        echo "## Execution Summary" >> "$REPORT_FILE"
        echo "Iterations run: $((ITERATION-1))" >> "$REPORT_FILE"
        
        # Task Status Summary (using bd list if possible, otherwise skip)
        if [ -n "$EPIC_ID" ]; then
            echo "" >> "$REPORT_FILE"
            echo "### Task Status" >> "$REPORT_FILE"
            echo "| Task | Status | Title |" >> "$REPORT_FILE"
            echo "| --- | --- | --- |" >> "$REPORT_FILE"
            bd list --parent "$EPIC_ID" --json 2>/dev/null | jq -r '.[] | "| \(.id) | \(.status) | \(.title) |"' >> "$REPORT_FILE" || echo "Could not list tasks." >> "$REPORT_FILE"
            
            # 3. Check for Revise Report (if Epic is Done or we just want to include it)
            # Pattern: YYYY-MM-DD_revise-report-epic-<EpicID>.md or YYYY-MM-DD_<epic-id>-improvements.md
            # We look in .devagent/workspace/reviews/
            REVIEWS_DIR="${REPO_ROOT}/.devagent/workspace/reviews"
            LATEST_REPORT=$(ls -t "$REVIEWS_DIR"/*"$EPIC_ID"* 2>/dev/null | head -n 1)
            
            if [ -n "$LATEST_REPORT" ] && [ -f "$LATEST_REPORT" ]; then
                echo "" >> "$REPORT_FILE"
                echo "## Revise Report" >> "$REPORT_FILE"
                echo "Found report: $(basename "$LATEST_REPORT")" >> "$REPORT_FILE"
                echo "" >> "$REPORT_FILE"
                # Append the Executive Summary and Action Items if possible
                # Simple extraction: First 50 lines? Or just the whole thing if small?
                # Github PR body limit is 65536 chars.
                # Let's append the whole report for now, but maybe truncated?
                cat "$LATEST_REPORT" >> "$REPORT_FILE"
            fi
        fi
        
        # 4. Create PR
        echo "Creating/Updating PR..."
        # Check if PR exists
        EXISTING_PR=$(gh pr list --head "$CURRENT_BRANCH" --json url -q '.[0].url')
        
        if [ -n "$EXISTING_PR" ]; then
            echo "PR already exists: $EXISTING_PR"
            echo "Updating PR body..."
            gh pr edit "$EXISTING_PR" --body-file "$REPORT_FILE" || echo "Failed to update PR."
        else
            gh pr create --title "$PR_TITLE" --body-file "$REPORT_FILE" --base main || echo "Failed to create PR."
        fi
        
        rm "$REPORT_FILE"
    fi
else
    echo "GitHub CLI (gh) not found. Skipping PR creation."
fi

