#!/bin/bash
set -euo pipefail

# Syncs plugin assets (commands and skills) to ai-rules/ for unified generation.
# Usage: ./sync-plugin-to-ai-rules.sh <plugin-name>
#
# Benefits:
# - Plugin stays modular and self-contained
# - ai-rules handles all agent-specific output (.cursor/rules, CLAUDE.md, etc.)
# - Single source of truth for generation

PLUGIN_NAME="${1:-}"

if [ -z "$PLUGIN_NAME" ]; then
  echo "Usage: $0 <plugin-name>"
  exit 1
fi

# Anchor to repo root (script is in .devagent/core/scripts/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$REPO_ROOT"

PLUGIN_DIR=".devagent/plugins/$PLUGIN_NAME"
PLUGIN_MANIFEST="$PLUGIN_DIR/plugin.json"

if [ ! -d "$PLUGIN_DIR" ]; then
  echo "Error: Plugin directory '$PLUGIN_DIR' not found."
  exit 1
fi

if [ ! -f "$PLUGIN_MANIFEST" ]; then
  echo "Error: Plugin manifest '$PLUGIN_MANIFEST' not found."
  exit 1
fi

echo "Syncing plugin '$PLUGIN_NAME' to ai-rules/..."

# Create ai-rules directories if they don't exist
mkdir -p ai-rules/skills
mkdir -p ai-rules/commands

# --- Sync Commands ---
COMMANDS=$(jq -r '.commands[]? // empty' "$PLUGIN_MANIFEST")

while IFS= read -r CMD_PATH; do
  [ -n "$CMD_PATH" ] || continue
  FULL_CMD_PATH="$PLUGIN_DIR/$CMD_PATH"
  CMD_BASENAME=$(basename "$CMD_PATH" .md)
  
  if [ -f "$FULL_CMD_PATH" ]; then
    # Symlink to ai-rules/commands/<plugin>-<command>.md
    TARGET_CMD="ai-rules/commands/${PLUGIN_NAME}-${CMD_BASENAME}.md"
    
    if [ -e "$TARGET_CMD" ] && [ ! -L "$TARGET_CMD" ]; then
      echo "  Warning: File exists and is not a symlink: $TARGET_CMD. Removing."
      rm -f "$TARGET_CMD"
    fi
    
    # Calculate relative path from ai-rules/commands/ to plugin
    REL_PATH="../../$FULL_CMD_PATH"
    ln -sf "$REL_PATH" "$TARGET_CMD"
    echo "  ✓ Command: $TARGET_CMD -> $REL_PATH"
  else
    echo "  ⚠ Command file '$FULL_CMD_PATH' not found."
  fi
done <<< "$COMMANDS"

# --- Sync Skills ---
SKILLS=$(jq -r '.skills[]? // empty' "$PLUGIN_MANIFEST")

while IFS= read -r SKILL_PATH; do
  [ -n "$SKILL_PATH" ] || continue
  FULL_SKILL_FILE="$PLUGIN_DIR/$SKILL_PATH"
  
  if [ -f "$FULL_SKILL_FILE" ]; then
    SKILL_DIR_NAME=$(dirname "$SKILL_PATH") # "skills/my-skill"
    SKILL_NAME=$(basename "$SKILL_DIR_NAME") # "my-skill"
    
    # Symlink to ai-rules/skills/<plugin>-<skill>/
    TARGET_SKILL="ai-rules/skills/${PLUGIN_NAME}-${SKILL_NAME}"
    SOURCE_SKILL_DIR="$PLUGIN_DIR/$SKILL_DIR_NAME"
    
    if [ -e "$TARGET_SKILL" ] && [ ! -L "$TARGET_SKILL" ]; then
      echo "  Warning: Directory exists and is not a symlink: $TARGET_SKILL. Removing."
      rm -rf "$TARGET_SKILL"
    fi
    
    # Calculate relative path from ai-rules/skills/ to plugin skill directory
    REL_PATH="../../$SOURCE_SKILL_DIR"
    ln -sf "$REL_PATH" "$TARGET_SKILL"
    echo "  ✓ Skill: $TARGET_SKILL -> $REL_PATH"
  else
    echo "  ⚠ Skill file '$FULL_SKILL_FILE' not found."
  fi
done <<< "$SKILLS"

echo ""
echo "Plugin '$PLUGIN_NAME' synced to ai-rules/."
echo ""
echo "Next step: Run 'ai-rules generate' to update agent-specific files."
