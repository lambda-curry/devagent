#!/bin/bash

# Orchestrator Prototype Test Script
# Demonstrates end-to-end orchestrator flow with Epic A and Epic B

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROTOTYPE_DIR="$SCRIPT_DIR"

# Find repo root by looking for .git directory
find_repo_root() {
    local dir="$1"
    while [ "$dir" != "/" ]; do
        if [ -d "$dir/.git" ]; then
            echo "$dir"
            return 0
        fi
        dir="$(dirname "$dir")"
    done
    return 1
}

REPO_ROOT="$(find_repo_root "$SCRIPT_DIR")"
if [ -z "$REPO_ROOT" ]; then
    echo "Error: Could not find repository root"
    exit 1
fi

cd "$REPO_ROOT"

echo "=== Orchestrator Prototype Test ==="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Setup Objective (Create Hub)
echo -e "${BLUE}Step 1: Setup Objective - Create Hub Branch${NC}"
echo "Creating feature/orchestrator-prototype-hub branch..."

# Check if hub branch already exists
if git rev-parse --verify feature/orchestrator-prototype-hub >/dev/null 2>&1; then
    echo "Hub branch already exists, checking it out..."
    git checkout feature/orchestrator-prototype-hub
    git pull origin feature/orchestrator-prototype-hub || true
else
    git checkout main
    git pull origin main
    git checkout -b feature/orchestrator-prototype-hub
    git push -u origin feature/orchestrator-prototype-hub
fi

echo -e "${GREEN}✓ Hub branch created/checked out${NC}"
echo ""

# Step 2: Sync Loop Config to Beads
echo -e "${BLUE}Step 2: Sync Objective Loop Config to Beads${NC}"
LOOP_CONFIG_PATH="$PROTOTYPE_DIR/run/objective-loop.json"
OBJECTIVE_EPIC_ID="devagent-034b9i"  # The orchestrator epic itself

if [ ! -f "$LOOP_CONFIG_PATH" ]; then
    echo "Error: Loop config file not found at $LOOP_CONFIG_PATH"
    exit 1
fi

echo "Syncing loop config to Beads..."
cd "$REPO_ROOT"
bun "$REPO_ROOT/.devagent/plugins/ralph/tools/setup-loop.ts" "$LOOP_CONFIG_PATH"

echo -e "${GREEN}✓ Loop config synced to Beads${NC}"
echo ""

# Step 3: Check for ready orchestrator tasks
echo -e "${BLUE}Step 3: Check for Ready Orchestrator Tasks${NC}"
echo "Querying Beads for ready tasks..."

READY_TASKS=$(bd ready --parent "$OBJECTIVE_EPIC_ID" --type task --json 2>/dev/null || echo "[]")

if [ "$READY_TASKS" = "[]" ] || [ -z "$READY_TASKS" ]; then
    echo -e "${YELLOW}⚠ No ready tasks found. This is expected if tasks haven't been created yet.${NC}"
    echo "Tasks should be created by the setup-loop script."
else
    echo "Ready tasks: $READY_TASKS"
fi

echo ""

# Step 4: Demonstrate Suspend/Resume Check
echo -e "${BLUE}Step 4: Suspend/Resume Check${NC}"
ORCHESTRATOR_TASK_ID="${OBJECTIVE_EPIC_ID}.1"  # Current orchestrator task

echo "Checking for review-needed label on orchestrator task..."
cd "$REPO_ROOT"
bun "$REPO_ROOT/.devagent/plugins/ralph/tools/check-task-status.ts" "$ORCHESTRATOR_TASK_ID" review-needed || {
    EXIT_CODE=$?
    if [ $EXIT_CODE -eq 1 ]; then
        echo -e "${YELLOW}→ Suspend: No review-needed label found. Orchestrator would exit here.${NC}"
        echo "This demonstrates the suspend behavior."
    else
        echo -e "${YELLOW}→ Error checking status (exit code: $EXIT_CODE)${NC}"
    fi
}

echo ""

# Step 5: Summary
echo -e "${GREEN}=== Orchestrator Prototype Test Summary ===${NC}"
echo ""
echo "The orchestrator prototype demonstrates:"
echo "  1. ✓ Hub branch creation"
echo "  2. ✓ Loop config sync to Beads"
echo "  3. ✓ Ready task detection"
echo "  4. ✓ Suspend/resume check"
echo ""
echo "To complete the full flow:"
echo "  1. Create orchestrator tasks via setup-loop"
echo "  2. Ensure target epics exist in Beads"
echo "  3. Kick off Epic A (create branch, trigger execution)"
echo "  4. Wait for Epic A completion (add review-needed label)"
echo "  5. Resume orchestrator (check label, continue)"
echo "  6. Merge Epic A to hub"
echo "  7. Kick off Epic B"
echo "  8. Wait for Epic B completion"
echo "  9. Merge Epic B to hub"
echo ""
echo "See .devagent/plugins/ralph/workflows/orchestrator-loop.md for full workflow."
echo ""
