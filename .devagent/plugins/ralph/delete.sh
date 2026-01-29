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

# Remove ai-rules symlinks (only symlinks, not real files/dirs)
echo "  Removing ai-rules symlinks..."
find ai-rules/skills -maxdepth 1 -type l -name "${PLUGIN_NAME}-*" -delete 2>/dev/null || true
find ai-rules/commands -maxdepth 1 -type l -name "${PLUGIN_NAME}-*" -delete 2>/dev/null || true

# Regenerate agent files (removes ralph from generated output)
if command -v ai-rules &> /dev/null; then
    echo "  Regenerating ai-rules..."
    ai-rules generate
else
    echo "  Note: 'ai-rules' not found. Run 'ai-rules generate' manually."
fi

echo ""
echo "Ralph plugin removed."
