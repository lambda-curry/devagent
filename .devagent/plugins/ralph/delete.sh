#!/bin/bash
set -e

# Delete script for Ralph plugin.
# Removes ai-rules symlinks and regenerates agent files.
# Usage: ./delete.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_NAME="ralph"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

cd "$REPO_ROOT"

echo "Removing Ralph plugin assets..."

# Remove ai-rules symlinks
echo "  Removing ai-rules symlinks..."
rm -f ai-rules/skills/ralph-*
rm -f ai-rules/commands/ralph-*

# Regenerate agent files (removes ralph from generated output)
if command -v ai-rules &> /dev/null; then
    echo "  Regenerating ai-rules..."
    ai-rules generate
else
    echo "  Note: 'ai-rules' not found. Run 'ai-rules generate' manually."
fi

echo ""
echo "Ralph plugin removed."
