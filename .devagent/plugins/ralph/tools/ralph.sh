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
  READY_TASK=$(bd ready --json 2>/dev/null | jq -r 'if type=="array" then (.[0].id? // empty) else (.id // empty) end')

  if [ "$READY_TASK" = "empty" ] || [ -z "$READY_TASK" ]; then
    echo "No more ready tasks. Execution complete."
    break
  fi

  # Epic Status Check
  EPIC_ID=$(bd show "$READY_TASK" --json 2>/dev/null | jq -r 'if type=="array" then .[0].parent_id else .parent_id end')
  if [ -n "$EPIC_ID" ] && [ "$EPIC_ID" != "null" ]; then
      EPIC_STATUS=$(bd show "$EPIC_ID" --json 2>/dev/null | jq -r 'if type=="array" then .[0].status else .status end')
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

echo "Ralph execution loop completed after $((ITERATION-1)) iterations"

# Show Git progress summary
echo ""
echo "=== Git Progress Summary ==="
git log --oneline --grep="ralph:" | head -10
