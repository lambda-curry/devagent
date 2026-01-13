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
    # Cursor-first: Symlink .cursor/commands/ directly to plugin files
    TARGET_CURSOR_CMD=".cursor/commands/$CMD_FILENAME"
    if [ -e "$TARGET_CURSOR_CMD" ] && [ ! -L "$TARGET_CURSOR_CMD" ]; then
      echo "  Error: File exists and is not a symlink: $TARGET_CURSOR_CMD. Skipping."
      continue
    fi
    
    REL_PATH="../../$PLUGIN_DIR/$CMD_PATH"
    ln -sf "$REL_PATH" "$TARGET_CURSOR_CMD"
    echo "  Linked cursor command: $TARGET_CURSOR_CMD -> $REL_PATH"
    
    # Backward compat: Symlink .agents/commands/ to .cursor/commands/
    TARGET_AGENT_CMD=".agents/commands/$CMD_FILENAME"
    if [ -e "$TARGET_AGENT_CMD" ] && [ ! -L "$TARGET_AGENT_CMD" ]; then
      echo "  Error: File exists and is not a symlink: $TARGET_AGENT_CMD. Skipping."
      continue
    fi
    
    REL_CURSOR_PATH="../../.cursor/commands/$CMD_FILENAME"
    ln -sf "$REL_CURSOR_PATH" "$TARGET_AGENT_CMD"
    echo "  Linked agent command (backward compat): $TARGET_AGENT_CMD -> $REL_CURSOR_PATH"
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
  FULL_SKILL_FILE="$PLUGIN_DIR/$SKILL_PATH"
  
  if [ -f "$FULL_SKILL_FILE" ]; then
    SKILL_DIR_NAME=$(dirname "$SKILL_PATH") # "skills/my-skill"
    SKILL_NAME=$(basename "$SKILL_DIR_NAME") # "my-skill"
    
    # 1. Target: .cursor/skills/<skill-name>
    TARGET_CURSOR_SKILL=".cursor/skills/$SKILL_NAME"
    if [ -e "$TARGET_CURSOR_SKILL" ] && [ ! -L "$TARGET_CURSOR_SKILL" ]; then
       echo "  Error: Directory/file exists and is not a symlink: $TARGET_CURSOR_SKILL. Skipping."
       continue
    fi
    
    REL_SKILL_PATH="../../$PLUGIN_DIR/$SKILL_DIR_NAME"
    rm -rf "$TARGET_CURSOR_SKILL"
    ln -sf "$REL_SKILL_PATH" "$TARGET_CURSOR_SKILL"
    echo "  Linked skill: $TARGET_CURSOR_SKILL -> $REL_SKILL_PATH"
    
    # 2. Compat: .codex/skills/<skill-name> -> .cursor/skills/<skill-name>
    TARGET_CODEX_SKILL=".codex/skills/$SKILL_NAME"
    if [ -e "$TARGET_CODEX_SKILL" ] && [ ! -L "$TARGET_CODEX_SKILL" ]; then
       echo "  Error: Directory/file exists and is not a symlink: $TARGET_CODEX_SKILL. Skipping."
       continue
    fi
    
    REL_CURSOR_PATH="../../.cursor/skills/$SKILL_NAME"
    rm -rf "$TARGET_CODEX_SKILL"
    ln -sf "$REL_CURSOR_PATH" "$TARGET_CODEX_SKILL"
    echo "  Linked codex skill: $TARGET_CODEX_SKILL -> $REL_CURSOR_PATH"
    
  else
     echo "  Warning: Skill file '$FULL_SKILL_FILE' referenced in manifest not found."
  fi
done

echo "Plugin '$PLUGIN_NAME' synced successfully."