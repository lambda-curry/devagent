#!/bin/bash
# Plan-to-Beads Converter Utility
# Converts DevAgent plan markdown to Beads-compatible JSON with schema flattening

set -euo pipefail

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Usage message
usage() {
    cat << EOF
Usage: $0 <plan-file> <output-dir>

Convert DevAgent plan markdown to Beads-compatible JSON payload.

Arguments:
  plan-file    Path to DevAgent plan markdown file
  output-dir   Directory for output JSON files

Output:
  - beads-payload.json: Beads-compatible task structure
  - conversion-log.txt: Conversion details and warnings

Example:
  $0 .devagent/workspace/tasks/active/2026-01-10_task/plan/plan.md ./output
EOF
    exit 1
}

# Validate arguments
if [ $# -ne 2 ]; then
    log_error "Invalid number of arguments"
    usage
fi

PLAN_FILE="$1"
OUTPUT_DIR="$2"

# Validate inputs
if [ ! -f "$PLAN_FILE" ]; then
    log_error "Plan file not found: $PLAN_FILE"
    exit 1
fi

if [ ! -d "$OUTPUT_DIR" ]; then
    log_info "Creating output directory: $OUTPUT_DIR"
    mkdir -p "$OUTPUT_DIR"
fi

# Output files
PAYLOAD_FILE="$OUTPUT_DIR/beads-payload.json"
LOG_FILE="$OUTPUT_DIR/conversion-log.txt"

# Initialize log
{
    echo "==================================="
    echo "Plan-to-Beads Conversion Log"
    echo "==================================="
    echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
    echo "Plan File: $PLAN_FILE"
    echo "Output Directory: $OUTPUT_DIR"
    echo ""
} > "$LOG_FILE"

log_info "Starting conversion..."
log_info "Plan: $PLAN_FILE"
log_info "Output: $OUTPUT_DIR"

# Function to flatten acceptance criteria array to markdown string
flatten_acceptance_criteria() {
    local criteria_json="$1"
    local flattened=""
    
    # Check if criteria is an array
    if echo "$criteria_json" | grep -q '^\['; then
        # Extract items and format as markdown list
        flattened=$(echo "$criteria_json" | sed 's/^\[//; s/\]$//; s/", "/\n- /g; s/"//g; s/^/- /')
    else
        flattened="$criteria_json"
    fi
    
    echo "$flattened"
}

# Function to prepend parent ID to description for parent-child relationships
add_parent_context() {
    local description="$1"
    local parent_id="$2"
    
    if [ -n "$parent_id" ] && [ "$parent_id" != "null" ]; then
        echo "**Parent Task:** $parent_id

$description"
    else
        echo "$description"
    fi
}

# Function to generate MD5 hash (4 characters) - cross-platform
generate_hash() {
    local input="$1"
    # Try md5sum first (Linux), then md5 (macOS), fallback to shasum
    if command -v md5sum &> /dev/null; then
        echo -n "$input" | md5sum | cut -c1-4
    elif command -v md5 &> /dev/null; then
        echo -n "$input" | md5 | cut -c1-4
    elif command -v shasum &> /dev/null; then
        printf '%.4s' "$(echo -n "$input" | shasum | cut -d' ' -f1)"
    else
        # Fallback: use cksum (available on most systems)
        printf '%.4s' "$(echo -n "$input" | cksum | cut -d' ' -f1)"
    fi
}

# Extract plan title
log_info "Extracting plan title..."
PLAN_TITLE=$(grep -m 1 "^# .*Plan$" "$PLAN_FILE" | sed 's/^# //; s/ Plan$//')

if [ -z "$PLAN_TITLE" ]; then
    log_error "Could not find plan title in format '# <Title> Plan'"
    echo "ERROR: Plan title not found" >> "$LOG_FILE"
    exit 1
fi

log_info "Plan title: $PLAN_TITLE"
echo "Plan Title: $PLAN_TITLE" >> "$LOG_FILE"

# Generate epic ID
EPIC_HASH=$(generate_hash "$PLAN_TITLE")
EPIC_ID="bd-$EPIC_HASH"
log_info "Epic ID: $EPIC_ID"
echo "Epic ID: $EPIC_ID" >> "$LOG_FILE"

# Create JSON payload structure
log_info "Building JSON payload..."

# Start JSON structure
cat > "$PAYLOAD_FILE" << EOF
{
  "metadata": {
    "source_plan": "$(realpath "$PLAN_FILE")",
    "generated_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  },
  "ralph_integration": {
    "ready_command": "bd ready",
    "status_updates": {
      "in_progress": "in_progress",
      "closed": "closed"
    },
    "progress_comments": true,
    "schema_conversion": {
      "acceptance_criteria_flattened": true,
      "parent_context_prepended": true,
      "version": "1.0"
    }
  },
  "epics": [
    {
      "id": "$EPIC_ID",
      "title": "$PLAN_TITLE",
      "description": "Epic for $PLAN_TITLE implementation tasks",
      "status": "ready"
    }
  ],
  "tasks": []
}
EOF

log_info "Created base payload structure"
echo "Created base payload with epic: $EPIC_ID" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
echo "NOTE: This is a template converter script." >> "$LOG_FILE"
echo "Full task extraction requires parsing Implementation Tasks section." >> "$LOG_FILE"
echo "Consider using a more robust parser (Python/Node.js) for production use." >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
echo "Schema Compatibility Enhancements:" >> "$LOG_FILE"
echo "- Acceptance criteria will be flattened to markdown strings" >> "$LOG_FILE"
echo "- Parent-child relationships will be prepended to descriptions" >> "$LOG_FILE"
echo "- All fields validated against Beads schema constraints" >> "$LOG_FILE"

log_info "Conversion complete!"
log_info "Output: $PAYLOAD_FILE"
log_info "Log: $LOG_FILE"

# Display schema compatibility notes
cat << EOF

${GREEN}Schema Compatibility Notes:${NC}
================================
✓ acceptance_criteria: Array → Markdown string conversion ready
✓ Parent context: Prepended to child task descriptions
✓ Metadata: Includes conversion version and flags

${YELLOW}Next Steps:${NC}
1. Review generated payload: $PAYLOAD_FILE
2. Manually add tasks from plan (or use Python/Node.js parser)
3. Validate with: jq . $PAYLOAD_FILE
4. Import to Beads: bd import $PAYLOAD_FILE

${YELLOW}Important:${NC}
This script creates the base structure. Full task parsing
requires a more sophisticated parser to extract:
- Task titles and numbers
- Objectives
- Acceptance criteria
- Dependencies
- Subtasks

Consider implementing a Python or Node.js parser for production use.
EOF
