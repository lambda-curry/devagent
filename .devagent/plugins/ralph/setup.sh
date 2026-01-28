#!/bin/bash
set -e

# Setup script for Ralph plugin.
# Usage: ./setup.sh
#
# This uses Option D: sync to ai-rules/ then run ai-rules generate.
# Benefits: Ralph stays modular, ai-rules handles all agent output.

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_NAME="ralph"

# Locate repo root (assuming plugin is in .devagent/plugins/ralph)
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

# Option D: Sync to ai-rules/ (preferred)
AI_RULES_SYNC="$REPO_ROOT/.devagent/core/scripts/sync-plugin-to-ai-rules.sh"

# Legacy: Direct sync to .cursor/ etc (fallback)
LEGACY_SYNC="$REPO_ROOT/.devagent/core/scripts/sync-plugin-assets.sh"

cd "$REPO_ROOT"

if [ -f "$AI_RULES_SYNC" ]; then
    echo "Syncing $PLUGIN_NAME to ai-rules/..."
    bash "$AI_RULES_SYNC" "$PLUGIN_NAME"
    
    # Run ai-rules generate if available
    if command -v ai-rules &> /dev/null; then
        echo ""
        echo "Running ai-rules generate..."
        ai-rules generate
    else
        echo ""
        echo "Note: 'ai-rules' not found. Run 'ai-rules generate' manually to update agent files."
    fi
elif [ -f "$LEGACY_SYNC" ]; then
    echo "Using legacy sync (ai-rules sync not found)..."
    bash "$LEGACY_SYNC" "$PLUGIN_NAME"
else
    echo "Error: No sync script found."
    exit 1
fi

echo ""
echo "Ralph plugin setup complete."
