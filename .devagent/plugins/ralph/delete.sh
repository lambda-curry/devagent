#!/bin/bash
set -e

# Delete script for Ralph plugin.
# Removes symlinks and installed assets.
# Usage: ./delete.sh

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_NAME="ralph"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

echo "Removing assets for plugin: $PLUGIN_NAME"

# Remove commands (cursor-first: remove from .cursor/commands/ first, then .agents/commands/)
rm -f "$REPO_ROOT/.cursor/commands/execute-autonomous.md"
rm -f "$REPO_ROOT/.cursor/commands/start-ralph-execution.md"
rm -f "$REPO_ROOT/.agents/commands/execute-autonomous.md"
rm -f "$REPO_ROOT/.agents/commands/start-ralph-execution.md"

# Remove skills
rm -rf "$REPO_ROOT/.cursor/skills/plan-to-beads-conversion"
rm -rf "$REPO_ROOT/.cursor/skills/quality-gate-detection"
rm -rf "$REPO_ROOT/.cursor/skills/beads-integration"

rm -rf "$REPO_ROOT/.codex/skills/plan-to-beads-conversion"
rm -rf "$REPO_ROOT/.codex/skills/quality-gate-detection"
rm -rf "$REPO_ROOT/.codex/skills/beads-integration"

echo "Ralph assets removed."
