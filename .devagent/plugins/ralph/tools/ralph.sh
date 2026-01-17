#!/bin/bash

# Ralph Autonomous Execution Loop
# Reads AI tool configuration from config.json and executes tasks

set -o pipefail
# Note: We do NOT use 'set -e' globally because we need to handle agent execution failures gracefully
# Instead, we use explicit error checking where needed

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/config.json"

OUTPUT_FILE="${SCRIPT_DIR}/.ralph_last_output.txt"

# Load log directory from config (default: logs/ralph/)
LOG_DIR_REL=$(jq -r '.execution.log_dir // "logs/ralph"' "$CONFIG_FILE" 2>/dev/null || echo "logs/ralph")

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

# Validate configuration
validate_config() {
  local config_file="$1"
  local errors=0
  
  # Check required top-level fields
  local required_fields=("beads" "ai_tool" "quality_gates" "execution" "git")
  for field in "${required_fields[@]}"; do
    if ! jq -e ".${field}" "$config_file" > /dev/null 2>&1; then
      echo "Error: Required field '${field}' is missing from config.json" >&2
      errors=$((errors + 1))
    fi
  done
  
  # Check critical nested fields
  local ai_tool_name=$(jq -r '.ai_tool.name // ""' "$config_file")
  if [ -z "$ai_tool_name" ] || [ "$ai_tool_name" = "null" ]; then
    echo "Error: Required field 'ai_tool.name' is missing or empty in config.json" >&2
    errors=$((errors + 1))
  fi
  
  local ai_tool_command=$(jq -r '.ai_tool.command // ""' "$config_file")
  if [ -z "$ai_tool_command" ] || [ "$ai_tool_command" = "null" ]; then
    echo "Error: Required field 'ai_tool.command' is missing or empty in config.json" >&2
    errors=$((errors + 1))
  fi
  
  # Check git configuration
  local base_branch=$(jq -r '.git.base_branch // ""' "$config_file")
  if [ -z "$base_branch" ] || [ "$base_branch" = "null" ]; then
    echo "Error: Required field 'git.base_branch' is missing or empty in config.json" >&2
    errors=$((errors + 1))
  fi
  
  local working_branch=$(jq -r '.git.working_branch // ""' "$config_file")
  if [ -z "$working_branch" ] || [ "$working_branch" = "null" ]; then
    echo "Error: Required field 'git.working_branch' is missing or empty in config.json" >&2
    errors=$((errors + 1))
  fi
  
  if [ $errors -gt 0 ]; then
    echo "Configuration validation failed. Please fix the errors above and try again." >&2
    return 1
  fi
  
  return 0
}

# Validate config before proceeding
if ! validate_config "$CONFIG_FILE"; then
  exit 1
fi

AI_TOOL=$(jq -r '.ai_tool.name' "$CONFIG_FILE")
AI_COMMAND=$(jq -r '.ai_tool.command' "$CONFIG_FILE")
MAX_ITERATIONS=$(jq -r '.execution.max_iterations' "$CONFIG_FILE")
BASE_BRANCH=$(jq -r '.git.base_branch' "$CONFIG_FILE")
WORKING_BRANCH=$(jq -r '.git.working_branch' "$CONFIG_FILE")

# Set extended timeout for OpenCode bash commands (1 hour) - only if using opencode
if [ "$AI_TOOL" = "opencode" ]; then
  export OPENCODE_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS=3600000
fi

# Note: ai_tool.name and ai_tool.command are already validated by validate_config function above

# Setup Git Environment
REPO_ROOT="$(git rev-parse --show-toplevel)"

echo "Starting Ralph execution loop..."
echo "AI Tool: $AI_TOOL"
echo "Command: $AI_COMMAND"
echo "Max iterations: $MAX_ITERATIONS"

# Ensure Beads DB path is absolute and exported
BEADS_DB_REL=$(jq -r '.beads.database_path // ".beads/beads.db"' "$CONFIG_FILE")
# Check if path is already absolute
if [[ "$BEADS_DB_REL" = /* ]]; then
    export BEADS_DB="$BEADS_DB_REL"
else
    export BEADS_DB="$REPO_ROOT/$BEADS_DB_REL"
fi

echo "Running in Epic mode for: $EPIC_ID"

# Validate Epic exists
if ! bd show "$EPIC_ID" --json > /dev/null 2>&1; then
    echo "Error: Epic '$EPIC_ID' not found in Beads database." >&2
    echo "Please verify the Epic ID and ensure it exists in the database." >&2
    exit 1
fi

# Validate working branch exists
if ! git show-ref --verify --quiet "refs/heads/$WORKING_BRANCH"; then
    echo "Error: Working branch '$WORKING_BRANCH' does not exist." >&2
    echo "Please create the branch or update config.json with the correct working_branch." >&2
    exit 1
fi

# Validate current branch matches working branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "$WORKING_BRANCH" ]; then
    echo "Error: Current branch '$CURRENT_BRANCH' does not match configured working branch '$WORKING_BRANCH'." >&2
    echo "Please switch to the working branch: git checkout $WORKING_BRANCH" >&2
    exit 1
fi

echo "Running in current branch: $CURRENT_BRANCH"
echo "Working directory: $(pwd)"

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
  READY_TASK=$(bd ready --json 2>/dev/null | jq -r --arg EPIC "$EPIC_ID" '
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
      if [ "$EPIC_STATUS" = "blocked" ] || [ "$EPIC_STATUS" = "closed" ]; then
           echo "Parent Epic $TASK_EPIC_ID is $EPIC_STATUS. Stopping execution."
           STOP_REASON="Epic Stopped ($EPIC_STATUS)"
           break
      fi
  fi

  echo "Processing task: $READY_TASK"

  # Mark task as in progress (if not already)
  bd update "$READY_TASK" --status in_progress

  # Setup per-task logging
  # Determine log directory (relative to repo root, now that we're not switching directories)
  if [[ "$LOG_DIR_REL" = /* ]]; then
    TASK_LOG_DIR="$LOG_DIR_REL"
  else
    TASK_LOG_DIR="$REPO_ROOT/$LOG_DIR_REL"
  fi
  
  # Create log directory if it doesn't exist
  mkdir -p "$TASK_LOG_DIR"
  
  # Set task-specific log file (append mode)
  TASK_LOG_FILE="${TASK_LOG_DIR}/${READY_TASK}.log"
  TASK_PID_FILE="${TASK_LOG_DIR}/${READY_TASK}.pid"

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

  # Quality Gate Instruction (Hybrid Self-Diagnosis)
  QUALITY_INFO="
QUALITY GATES & VERIFICATION:
1. **Self-Diagnosis**: You MUST read 'package.json' scripts to determine the correct commands for testing, linting, and typechecking. Do NOT assume defaults like 'npm test' work unless verified.
2. **7-Point Checklist**: For every task, you must generate and verify a checklist covering:
   [ ] 1. Read task & context
   [ ] 2. Self-diagnose verification commands
   [ ] 3. Implementation
   [ ] 4. Run standard checks (test/lint/typecheck)
   [ ] 5. UI Verification (if applicable: agent-browser + screenshots)
   [ ] 6. Add/Update tests (if logic changed)
   [ ] 7. Commit & Push
"

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
  echo "Task log: $TASK_LOG_FILE"
  echo "PID file: $TASK_PID_FILE"
  
  # Agent timeout: 2 hours (7200 seconds) to prevent indefinite hangs while allowing for long-running tasks
  # If agent process exceeds this, it will be forcibly terminated
  AGENT_TIMEOUT=7200

  # Execute AI tool with the prompt and stream output in real-time
  # Write to both task-specific log (append) and legacy output file (overwrite)
  if [ "$AI_TOOL" = "cursor" ] || [ "$AI_TOOL" = "agent" ]; then
    # Agent CLI with text output format (command is "agent", not "cursor")
    # Note: "cursor" check kept for backward compatibility, but "agent" is the correct CLI command
    # Use PIPESTATUS to capture the actual agent command exit code, not tee's
    if command -v stdbuf >/dev/null 2>&1; then
      # Start command in background to capture PID, then wait for it
      stdbuf -oL -eL "$AI_COMMAND" -p --force --output-format text "$PROMPT" > >(tee -a "$TASK_LOG_FILE" > "$OUTPUT_FILE") 2>&1 &
      AI_PID=$!
      # Record PID and process group ID
      echo "$AI_PID" > "$TASK_PID_FILE"
      echo "$(ps -o pgid= -p $AI_PID 2>/dev/null | tr -d ' ' || echo '')" >> "$TASK_PID_FILE" || true
      # Wait for the process with timeout, capture exit code
      ( sleep $AGENT_TIMEOUT && kill -9 $AI_PID 2>/dev/null || true ) &
      KILLER_PID=$!
      wait $AI_PID 2>/dev/null
      EXIT_CODE=$?
      kill $KILLER_PID 2>/dev/null || true
    else
      "$AI_COMMAND" -p --force --output-format text "$PROMPT" > >(tee -a "$TASK_LOG_FILE" > "$OUTPUT_FILE") 2>&1 &
      AI_PID=$!
      # Record PID and process group ID
      echo "$AI_PID" > "$TASK_PID_FILE"
      echo "$(ps -o pgid= -p $AI_PID 2>/dev/null | tr -d ' ' || echo '')" >> "$TASK_PID_FILE" || true
      ( sleep $AGENT_TIMEOUT && kill -9 $AI_PID 2>/dev/null || true ) &
      KILLER_PID=$!
      wait $AI_PID 2>/dev/null
      EXIT_CODE=$?
      kill $KILLER_PID 2>/dev/null || true
    fi
  else
    # Legacy OpenCode pattern
    # Use PIPESTATUS to capture the actual command exit code, not tee's
    if command -v stdbuf >/dev/null 2>&1; then
      stdbuf -oL -eL OPENCODE_CLI=1 "$AI_COMMAND" run "$PROMPT" > >(tee -a "$TASK_LOG_FILE" > "$OUTPUT_FILE") 2>&1 &
      AI_PID=$!
      # Record PID and process group ID
      echo "$AI_PID" > "$TASK_PID_FILE"
      echo "$(ps -o pgid= -p $AI_PID 2>/dev/null | tr -d ' ' || echo '')" >> "$TASK_PID_FILE" || true
      ( sleep $AGENT_TIMEOUT && kill -9 $AI_PID 2>/dev/null || true ) &
      KILLER_PID=$!
      wait $AI_PID 2>/dev/null
      EXIT_CODE=$?
      kill $KILLER_PID 2>/dev/null || true
    else
      OPENCODE_CLI=1 "$AI_COMMAND" run "$PROMPT" > >(tee -a "$TASK_LOG_FILE" > "$OUTPUT_FILE") 2>&1 &
      AI_PID=$!
      # Record PID and process group ID
      echo "$AI_PID" > "$TASK_PID_FILE"
      echo "$(ps -o pgid= -p $AI_PID 2>/dev/null | tr -d ' ' || echo '')" >> "$TASK_PID_FILE" || true
      ( sleep $AGENT_TIMEOUT && kill -9 $AI_PID 2>/dev/null || true ) &
      KILLER_PID=$!
      wait $AI_PID 2>/dev/null
      EXIT_CODE=$?
      kill $KILLER_PID 2>/dev/null || true
    fi
  fi
  
  # Clean up PID file after execution completes
  rm -f "$TASK_PID_FILE"

  echo "--- End Agent Output ---"

  if [ $EXIT_CODE -eq 0 ]; then
    echo "Task implementation completed successfully"
  else
    echo "Task implementation failed (exit code: $EXIT_CODE)"
    echo "Log contents:"
    tail -20 "$TASK_LOG_FILE" 2>/dev/null || echo "(no log available)"
    # If agent crashed, we should probably log it.
    bd comment "$READY_TASK" --body "Task implementation failed - AI tool returned error (exit code: $EXIT_CODE)"
    bd update "$READY_TASK" --status open
    # Continue to next task instead of crashing
    ITERATION=$((ITERATION + 1))
    continue
  fi

  ITERATION=$((ITERATION + 1))
done

if [ $ITERATION -gt $MAX_ITERATIONS ]; then
    echo "Max iterations ($MAX_ITERATIONS) reached. Stopping."
    STOP_REASON="Max Iterations Reached"
elif [ -z "$STOP_REASON" ]; then
    STOP_REASON="Execution Stopped (Unknown Reason)"
fi

# Show Git progress summary
echo ""
echo "=== Git Progress Summary ==="
git log --oneline --grep="ralph:" -n 10

