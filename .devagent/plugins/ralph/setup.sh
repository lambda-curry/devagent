#!/bin/bash
set -e

# Setup script for Ralph plugin.
# Usage: ./setup.sh

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_NAME="ralph"

# Locate repo root (assuming plugin is in .devagent/plugins/ralph)
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

SYNC_SCRIPT="$REPO_ROOT/.devagent/core/scripts/sync-plugin-assets.sh"

if [ -f "$SYNC_SCRIPT" ]; then
    echo "Running asset sync for $PLUGIN_NAME..."
    cd "$REPO_ROOT"
    bash "$SYNC_SCRIPT" "$PLUGIN_NAME"
else
    echo "Error: Sync script not found at $SYNC_SCRIPT"
    exit 1
fi

echo "Ralph plugin setup complete."
