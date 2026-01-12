#!/bin/bash

# Ralph Autonomous Execution Loop
# Reads AI tool configuration from config.json and executes tasks

set -e
set -o pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/config.json"
OUTPUT_FILE="${SCRIPT_DIR}/.ralph_last_output.txt"

# Load configuration
if [ ! -f "$CONFIG_FILE" ]; then
  echo "Error: config.json not found at $CONFIG_FILE"
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

# Initialize Git for progress tracking
echo "Setting up Git progress tracking..."
git checkout -b ralph/execution 2>/dev/null || git checkout ralph/execution 2>/dev/null || echo "Continuing on existing Ralph branch"
git add . 2>/dev/null || true

# Check if AI command is available
if ! command -v "$AI_COMMAND" &> /dev/null; then
  echo "Error: AI command '$AI_COMMAND' not found"
  echo "Please install $AI_TOOL or update config.json"
  exit 1
fi

ITERATION=1
LAST_TASK=""
LAST_GATES_FAILED=false
LAST_GATE_OUTPUT=""

while [ $ITERATION -le $MAX_ITERATIONS ]; do
  echo "=== Iteration $ITERATION ==="

  READY_TASK=""

  # Retry Logic: If last task failed gates, prioritize retrying it unless agent marked it blocked/closed
  if [ -n "$LAST_TASK" ] && [ "$LAST_GATES_FAILED" = true ]; then
      # Check if agent manually blocked or closed it (despite failure)
      LAST_TASK_STATE=$(bd show "$LAST_TASK" --json 2>/dev/null)
      STATUS=$(echo "$LAST_TASK_STATE" | jq -r .status)
      
      if [ "$STATUS" != "blocked" ] && [ "$STATUS" != "closed" ]; then
          echo "Retrying task $LAST_TASK due to previous quality gate failure..."
          READY_TASK="$LAST_TASK"
      else
          echo "Last task $LAST_TASK was marked as $STATUS by agent despite failure. Moving on."
          LAST_GATES_FAILED=false
          LAST_GATE_OUTPUT=""
      fi
  fi

  # Get next ready task from Beads if no retry
  if [ -z "$READY_TASK" ]; then
      READY_TASK=$(bd ready --json 2>/dev/null | jq -r 'if type=="array" then (.[0].id? // empty) else (.id // empty) end')
  fi

  if [ "$READY_TASK" = "empty" ] || [ -z "$READY_TASK" ]; then
    echo "No more ready tasks. Execution complete."
    break
  fi

  # Epic Status Check
  EPIC_ID=$(bd show "$READY_TASK" --json 2>/dev/null | jq -r .parent_id)
  if [ -n "$EPIC_ID" ] && [ "$EPIC_ID" != "null" ]; then
      EPIC_STATUS=$(bd show "$EPIC_ID" --json 2>/dev/null | jq -r .status)
      if [ "$EPIC_STATUS" = "blocked" ] || [ "$EPIC_STATUS" = "done" ]; then
           echo "Parent Epic $EPIC_ID is $EPIC_STATUS. Stopping execution."
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
Parent Epic ID: $EPIC_ID

Acceptance Criteria:
$TASK_ACCEPTANCE

${QUALITY_INFO}
CONTEXT:
You are working on task $READY_TASK which is part of Epic $EPIC_ID.
You can view the epic details and other tasks using: bd show $EPIC_ID

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

  # Inject Failure Context if applicable
  if [ "$LAST_GATES_FAILED" = true ] && [ "$READY_TASK" == "$LAST_TASK" ]; then
      PROMPT="$PROMPT

PREVIOUS FAILURE CONTEXT:
The previous attempt failed project quality gates.
Errors:
$LAST_GATE_OUTPUT

Please analyze these errors and fix them.
"
  fi

  echo "Executing task with $AI_TOOL..."
  echo "--- Agent Output (streaming) ---"

  # Execute AI tool with the prompt and stream output in real-time
  if [ "$AI_TOOL" = "cursor" ]; then
    # Cursor CLI with text output format
    if command -v stdbuf >/dev/null 2>&1; then
      if stdbuf -oL -eL "$AI_COMMAND" -p --force --output-format text "$PROMPT" | tee "$OUTPUT_FILE"; then
        EXIT_CODE=0
      else
        EXIT_CODE=$?
      fi
    else
      if "$AI_COMMAND" -p --force --output-format text "$PROMPT" | tee "$OUTPUT_FILE"; then
        EXIT_CODE=0
      else
        EXIT_CODE=$?
      fi
    fi
  else
    # Legacy OpenCode pattern
    if command -v stdbuf >/dev/null 2>&1; then
      if stdbuf -oL -eL OPENCODE_CLI=1 "$AI_COMMAND" run "$PROMPT" | tee "$OUTPUT_FILE"; then
        EXIT_CODE=0
      else
        EXIT_CODE=$?
      fi
    else
      if OPENCODE_CLI=1 "$AI_COMMAND" run "$PROMPT" | tee "$OUTPUT_FILE"; then
        EXIT_CODE=0
      else
        EXIT_CODE=$?
      fi
    fi
  fi

  echo "--- End Agent Output ---"

  if [ $EXIT_CODE -eq 0 ]; then
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
        GATE_OUTPUT_BUFFER=$(mktemp)

        if [ "$TEST_CMD" != "null" ] && [ -n "$TEST_CMD" ]; then
          echo "Running: $TEST_CMD" | tee -a "$GATE_OUTPUT_BUFFER"
          if ! eval "$TEST_CMD" >> "$GATE_OUTPUT_BUFFER" 2>&1; then
            QUALITY_PASSED=false
          fi
        fi

        if [ "$LINT_CMD" != "null" ] && [ -n "$LINT_CMD" ]; then
          echo "Running: $LINT_CMD" | tee -a "$GATE_OUTPUT_BUFFER"
          if ! eval "$LINT_CMD" >> "$GATE_OUTPUT_BUFFER" 2>&1; then
            QUALITY_PASSED=false
          fi
        fi

        if [ "$TYPECHECK_CMD" != "null" ] && [ -n "$TYPECHECK_CMD" ]; then
          echo "Running: $TYPECHECK_CMD" | tee -a "$GATE_OUTPUT_BUFFER"
          if ! eval "$TYPECHECK_CMD" >> "$GATE_OUTPUT_BUFFER" 2>&1; then
            QUALITY_PASSED=false
          fi
        fi
        
        # Capture output for next run if needed
        LAST_GATE_OUTPUT=$(cat "$GATE_OUTPUT_BUFFER")
        rm "$GATE_OUTPUT_BUFFER"

        if [ "$QUALITY_PASSED" = true ]; then
          echo "Quality gates passed"
          LAST_GATES_FAILED=false
          
          # Commit task completion with Git
          git add .
          git commit -m "ralph: Iteration $ITERATION for $READY_TASK - Gates Passed

Task: $READY_TASK
Quality Gates: passed
Iteration: $ITERATION

Co-authored-by: Ralph <ralph@autonomous>" || echo "Nothing to commit"

          # NOTE: Status update to CLOSED is now Agent's responsibility.
          # We do NOT auto-close here.
          
        else
          echo "Quality gates failed - errors captured for next iteration"
          LAST_GATES_FAILED=true
          
          # Commit failed task with Git
          git add .
          git commit -m "ralph: Iteration $ITERATION for $READY_TASK - Gates Failed

Task: $READY_TASK
Quality Gates: failed
Iteration: $ITERATION

Co-authored-by: Ralph <ralph@autonomous>" || echo "Nothing to commit"

          # NOTE: We do NOT auto-fail/comment here.
          # The agent will receive the error in the next iteration.
        fi
      else
        echo "Warning: Quality gate template not found: $QUALITY_CONFIG"
        LAST_GATES_FAILED=false
      fi
    else
      echo "No quality gates configured"
      LAST_GATES_FAILED=false
      
      git add .
      git commit -m "ralph: Iteration $ITERATION for $READY_TASK - No Gates

Task: $READY_TASK
Iteration: $ITERATION

Co-authored-by: Ralph <ralph@autonomous>" || echo "Nothing to commit"
    fi
  else
    echo "Task implementation failed (exit code: $EXIT_CODE)"
    # If agent crashed, we should probably log it.
    bd comments add "$READY_TASK" "Task implementation failed - AI tool returned error (exit code: $EXIT_CODE)"
    LAST_GATES_FAILED=false # Can't retry gates if tool failed
    bd update "$READY_TASK" --status ready
  fi

  # Periodic checkpoint
  if [ $((ITERATION % 5)) -eq 0 ]; then
    echo "Creating checkpoint at iteration $ITERATION"
    git add .
    git commit -m "ralph: Checkpoint - iteration $ITERATION

Auto-checkpoint created by Ralph autonomous execution
Iteration: $ITERATION
Timestamp: $(date -Iseconds)"
  fi

  LAST_TASK="$READY_TASK"
  ITERATION=$((ITERATION + 1))
done

echo "Ralph execution loop completed after $((ITERATION-1)) iterations"

# Show Git progress summary
echo ""
echo "=== Git Progress Summary ==="
git log --oneline --grep="ralph:" | head -10
