#!/bin/bash
set -Eeuo pipefail

# DevAgent Plugin Update Script
# Installs/updates plugins listed in .devagent/plugins.json from the upstream repository.

REPO_URL="https://github.com/lambda-curry/devagent.git"
PLUGINS_CONFIG=".devagent/plugins.json"
PROJECT_ROOT="$(pwd -P)"
TEMP_DIR=$(mktemp -d)

# Ensure config exists
if [ ! -f "$PLUGINS_CONFIG" ]; then
  echo "No plugin configuration found at $PLUGINS_CONFIG."
  echo "Create this file with {\"plugins\": [{\"name\": \"plugin-name\"}]} to enable plugins."
  exit 0
fi

# Get list of enabled plugins
PLUGINS=$(jq -r '.plugins[].name' "$PLUGINS_CONFIG")

if [ -z "$PLUGINS" ]; then
  echo "No plugins enabled in configuration."
  exit 0
fi

echo "Updating plugins: $(echo "$PLUGINS" | tr '\n' ' ')"

# Sparse checkout setup
cd "$TEMP_DIR"
git init --quiet
git remote add origin "$REPO_URL"
git config core.sparseCheckout true
git config index.sparse true

# Add plugin paths to sparse checkout
for PLUGIN in $PLUGINS; do
  echo ".devagent/plugins/$PLUGIN/" >> .git/info/sparse-checkout
done

echo "Fetching plugins from upstream..."
git pull origin main --quiet --depth=1 || {
  echo "Error fetching plugins from upstream."
  rm -rf "$TEMP_DIR"
  exit 1
}

# Ensure sparse checkout applied
git sparse-checkout reapply 2>/dev/null || true

cd "$PROJECT_ROOT"

# Install/Update and Sync each plugin
for PLUGIN in $PLUGINS; do
  SOURCE_DIR="$TEMP_DIR/.devagent/plugins/$PLUGIN"
  DEST_DIR=".devagent/plugins/$PLUGIN"
  
  if [ -d "$SOURCE_DIR" ]; then
    echo "Installing/Updating plugin: $PLUGIN"
    mkdir -p "$DEST_DIR"
    rsync -a "$SOURCE_DIR/" "$DEST_DIR/"
    
    # Run sync script
    # We need to make sure sync script exists and is executable.
    SYNC_SCRIPT=".devagent/core/scripts/sync-plugin-assets.sh"
    if [ -f "$SYNC_SCRIPT" ]; then
        chmod +x "$SYNC_SCRIPT"
        "$SYNC_SCRIPT" "$PLUGIN"
    else
        echo "Warning: Sync script not found at $SYNC_SCRIPT. Wiring skipped."
    fi
  else
    echo "Warning: Plugin '$PLUGIN' not found in upstream repository."
  fi
done

# Cleanup
rm -rf "$TEMP_DIR"

echo "Plugin update complete."
