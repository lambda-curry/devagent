#!/bin/bash

# Objective E2E Test Script
# Tests the separate loop file pattern and orchestrator flow.

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../../" && pwd)"
TEST_DIR="$REPO_ROOT/.devagent/workspace/tests/ralph-objective-e2e"

cd "$REPO_ROOT"

echo -e "${BLUE}=== Starting Objective E2E Test ===${NC}"

# 1. Setup Objective Hub
echo -e "\n${BLUE}Step 1: Setting up Objective Hub branch...${NC}"
HUB_BRANCH="feature/obj-e2e-hub"

if git rev-parse --verify "$HUB_BRANCH" >/dev/null 2>&1; then
    git checkout "$HUB_BRANCH"
else
    # Stay on current branch instead of main to keep local changes
    CURRENT_BRANCH=$(git branch --show-current)
    git checkout -b "$HUB_BRANCH"
fi

# 2. Sync Objective Loop
echo -e "\n${BLUE}Step 2: Syncing Objective Hub to Beads...${NC}"
bun .devagent/plugins/ralph/tools/setup-loop.ts "$TEST_DIR/objective-hub.json"

# 3. Simulate Epic A Kickoff
echo -e "\n${BLUE}Step 3: Simulating Epic A Kickoff (Coordinator)...${NC}"
# The coordinator would read the kickoff task, find the Loop File, and run setup-loop.
# We'll do it manually here to simulate the behavior.
bun .devagent/plugins/ralph/tools/setup-loop.ts "$TEST_DIR/epic-a.json"

echo -e "\n${GREEN}✓ Objective Hub and Epic A synced successfully.${NC}"
echo -e "${YELLOW}Next steps in a real flow:${NC}"
echo "1. Run Ralph loop for Epic A: Create data.json on feature/obj-e2e-a"
echo "2. Merge Epic A to Hub branch"
echo "3. Coordinator kicks off Epic B (runs setup-loop for epic-b.json)"
echo "4. Run Ralph loop for Epic B: Verify data.json on feature/obj-e2e-b"
echo "5. Merge Epic B to Hub branch"

echo -e "\n${BLUE}Current Objective Hub Tree:${NC}"
bd graph devagent-obj-e2e-hub

echo -e "\n${BLUE}Current Epic A Tree:${NC}"
bd graph devagent-obj-e2e-epic-a

echo -e "\n${GREEN}=== Objective E2E Setup Complete ===${NC}"
echo -e "\n${YELLOW}To run the full autonomous execution:${NC}"
echo "1. Switch to Hub branch: git checkout feature/obj-e2e-hub"
echo "2. The Coordinator will handle the rest when you run the orchestrator loop."
