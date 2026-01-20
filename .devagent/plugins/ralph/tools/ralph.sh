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
export REPO_ROOT="$(git rev-parse --show-toplevel)"

# Align log producer (Ralph) with log viewer (ralph-monitoring app)
# - Viewer resolves via RALPH_LOG_DIR (preferred) or <REPO_ROOT|cwd>/logs/ralph
# - We export both so child processes (bun router + agents) agree on paths.
if [[ "$LOG_DIR_REL" = /* ]]; then
  export RALPH_LOG_DIR="$LOG_DIR_REL"
else
  export RALPH_LOG_DIR="$REPO_ROOT/$LOG_DIR_REL"
fi

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

# Check if Bun is available (required for router)
if ! command -v bun &> /dev/null; then
  echo "Error: Bun is required for label-driven routing but not found in PATH"
  echo "Please install Bun: https://bun.sh"
  exit 1
fi

# Route execution through Bun router
# The router handles sequential execution, agent selection, failure tracking, and blocking
RALPH_TS="${SCRIPT_DIR}/ralph.ts"

if [ ! -f "$RALPH_TS" ]; then
  echo "Error: Ralph router not found at $RALPH_TS"
  exit 1
fi

echo "Routing execution through Bun router..."
echo "Epic ID: $EPIC_ID"

# Execute Bun router with epic ID
# The router will handle:
# - Sequential agent execution
# - Label-based agent selection
# - Failure tracking and blocking after 5 failures
# - Re-checking ready tasks after each run
bun "$RALPH_TS" --epic "$EPIC_ID"

EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo "Error: Router execution failed (exit code: $EXIT_CODE)" >&2
  exit $EXIT_CODE
fi

# Show Git progress summary
echo ""
echo "=== Git Progress Summary ==="
git log --oneline --grep="ralph:" -n 10

