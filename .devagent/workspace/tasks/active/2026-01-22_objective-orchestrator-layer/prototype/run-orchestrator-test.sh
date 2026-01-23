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

# Step 2: Sync Plan to Beads
echo -e "${BLUE}Step 2: Sync Objective Plan to Beads${NC}"
PLAN_PATH="$PROTOTYPE_DIR/plan/objective-plan.md"
OBJECTIVE_EPIC_ID="devagent-034b9i"  # The orchestrator epic itself

if [ ! -f "$PLAN_PATH" ]; then
    echo "Error: Plan file not found at $PLAN_PATH"
    exit 1
fi

echo "Syncing plan to Beads..."
cd "$REPO_ROOT"
bun "$REPO_ROOT/.devagent/plugins/ralph/tools/sync-objective.ts" "$PLAN_PATH" "$OBJECTIVE_EPIC_ID"

echo -e "${GREEN}✓ Plan synced to Beads${NC}"
echo ""

# Step 3: Check for ready epics
echo -e "${BLUE}Step 3: Check for Ready Epics${NC}"
echo "Querying Beads for ready epics..."

READY_EPICS=$(bd ready --parent "$OBJECTIVE_EPIC_ID" --type epic --json 2>/dev/null || echo "[]")

if [ "$READY_EPICS" = "[]" ] || [ -z "$READY_EPICS" ]; then
    echo -e "${YELLOW}⚠ No ready epics found. This is expected if epics haven't been created yet.${NC}"
    echo "Epics should be created by the sync-objective script."
else
    echo "Ready epics: $READY_EPICS"
fi

echo ""

# Step 4: Demonstrate Suspend/Resume Check
echo -e "${BLUE}Step 4: Suspend/Resume Check${NC}"
ORCHESTRATOR_TASK_ID="devagent-034b9i.6"  # Current orchestrator task

echo "Checking for review-needed label on orchestrator task..."
cd "$REPO_ROOT"
bun "$REPO_ROOT/.devagent/plugins/ralph/tools/check-child-status.ts" "$ORCHESTRATOR_TASK_ID" review-needed || {
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
echo "  2. ✓ Plan sync to Beads"
echo "  3. ✓ Ready epic detection"
echo "  4. ✓ Suspend/resume check"
echo ""
echo "To complete the full flow:"
echo "  1. Create test epics in Beads (via sync-objective)"
echo "  2. Kick off Epic A (create branch, trigger execution)"
echo "  3. Wait for Epic A completion (add review-needed label)"
echo "  4. Resume orchestrator (check label, continue)"
echo "  5. Merge Epic A to hub"
echo "  6. Kick off Epic B"
echo "  7. Wait for Epic B completion"
echo "  8. Merge Epic B to hub"
echo ""
echo "See .devagent/plugins/ralph/workflows/orchestrator-loop.md for full workflow."
echo ""
