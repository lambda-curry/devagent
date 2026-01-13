#!/bin/bash
set -e

# Syncs plugin assets (commands and skills) to their expected locations.
# Usage: ./sync-plugin-assets.sh <plugin-name>

PLUGIN_NAME="$1"

if [ -z "$PLUGIN_NAME" ]; then
  echo "Usage: $0 <plugin-name>"
  exit 1
fi

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

echo "Syncing assets for plugin: $PLUGIN_NAME"

# Create directories if they don't exist
mkdir -p .agents/commands
mkdir -p .cursor/commands
mkdir -p .cursor/skills
mkdir -p .codex/skills

# --- Sync Commands ---
# Commands are defined in 'commands' array in plugin.json

# Read commands from manifest
COMMANDS=$(jq -r '.commands[]? // empty' "$PLUGIN_MANIFEST")

for CMD_PATH in $COMMANDS; do
  # CMD_PATH is relative to plugin root, e.g. "commands/my-command.md"
  FULL_CMD_PATH="$PLUGIN_DIR/$CMD_PATH"
  CMD_FILENAME=$(basename "$CMD_PATH")
  
  if [ -f "$FULL_CMD_PATH" ]; then
    # 1. Symlink to .agents/commands/
    # Target: .agents/commands/<filename>
    # Link: ../../.devagent/plugins/<plugin>/<path>
    
    REL_PATH="../../$PLUGIN_DIR/$CMD_PATH"
    
    ln -sf "$REL_PATH" ".agents/commands/$CMD_FILENAME"
    echo "  Linked command: .agents/commands/$CMD_FILENAME -> $REL_PATH"
    
    # 2. Symlink from .cursor/commands/ to .agents/commands/
    # .cursor/commands -> ../../.agents/commands
    REL_AGENT_PATH="../../.agents/commands/$CMD_FILENAME"
    ln -sf "$REL_AGENT_PATH" ".cursor/commands/$CMD_FILENAME"
    echo "  Linked cursor command: .cursor/commands/$CMD_FILENAME -> $REL_AGENT_PATH"
  else
    echo "  Warning: Command file '$FULL_CMD_PATH' referenced in manifest not found."
  fi
done

# --- Sync Skills ---
# Skills are defined in 'skills' array in plugin.json
# Usually "skills/<skill-name>/SKILL.md"

SKILLS=$(jq -r '.skills[]? // empty' "$PLUGIN_MANIFEST")

for SKILL_PATH in $SKILLS; do
  # SKILL_PATH is e.g. "skills/my-skill/SKILL.md"
  # We want the skill root directory, which is usually the parent of SKILL.md
  
  FULL_SKILL_FILE="$PLUGIN_DIR/$SKILL_PATH"
  
  if [ -f "$FULL_SKILL_FILE" ]; then
    SKILL_DIR_NAME=$(dirname "$SKILL_PATH") # "skills/my-skill"
    SKILL_NAME=$(basename "$SKILL_DIR_NAME") # "my-skill"
    
    # Target: .cursor/skills/<skill-name>
    # Link: ../../.devagent/plugins/<plugin>/skills/<skill-name>
    
    REL_SKILL_PATH="../../$PLUGIN_DIR/$SKILL_DIR_NAME"
    
    # Remove existing directory/link if it exists to replace it
    rm -rf ".cursor/skills/$SKILL_NAME"
    ln -sf "$REL_SKILL_PATH" ".cursor/skills/$SKILL_NAME"
    echo "  Linked skill: .cursor/skills/$SKILL_NAME -> $REL_SKILL_PATH"
    
    # Compat: .codex/skills/<skill-name> -> .cursor/skills/<skill-name>
    # .codex/skills -> ../../.cursor/skills/<skill-name>
    REL_CURSOR_PATH="../../.cursor/skills/$SKILL_NAME"
    
    rm -rf ".codex/skills/$SKILL_NAME"
    ln -sf "$REL_CURSOR_PATH" ".codex/skills/$SKILL_NAME"
    echo "  Linked codex skill: .codex/skills/$SKILL_NAME -> $REL_CURSOR_PATH"
    
  else
     echo "  Warning: Skill file '$FULL_SKILL_FILE' referenced in manifest not found."
  fi
done

echo "Plugin '$PLUGIN_NAME' synced successfully."
