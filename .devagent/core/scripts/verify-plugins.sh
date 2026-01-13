#!/bin/bash
set -e

# Verify Plugins Script
# Checks that configured plugins are installed, valid, and properly wired.

PLUGINS_CONFIG=".devagent/plugins.json"
EXIT_CODE=0

echo "Verifying plugin configuration..."

if [ ! -f "$PLUGINS_CONFIG" ]; then
  echo "❌ Config file not found: $PLUGINS_CONFIG"
  exit 1
fi

# Get configured plugins
PLUGINS=$(jq -r '.plugins[].name' "$PLUGINS_CONFIG")

if [ -z "$PLUGINS" ]; then
  echo "⚠️  No plugins configured."
  exit 0
fi

for PLUGIN in $PLUGINS; do
  echo "Checking plugin: $PLUGIN"
  PLUGIN_DIR=".devagent/plugins/$PLUGIN"
  MANIFEST="$PLUGIN_DIR/plugin.json"
  
  # 1. Check Directory
  if [ ! -d "$PLUGIN_DIR" ]; then
    echo "  ❌ Directory missing: $PLUGIN_DIR"
    echo "     -> Run 'devagent update-devagent' to install."
    EXIT_CODE=1
    continue
  fi

  # 2. Check Manifest
  if [ ! -f "$MANIFEST" ]; then
    echo "  ❌ Manifest missing: $MANIFEST"
    EXIT_CODE=1
    continue
  fi

  # 3. Check Commands
  COMMANDS=$(jq -r '.commands[]? // empty' "$MANIFEST")
  for CMD_PATH in $COMMANDS; do
    CMD_FILENAME=$(basename "$CMD_PATH")
    
    # Check .agents/commands symlink
    AGENT_LINK=".agents/commands/$CMD_FILENAME"
    if [ ! -L "$AGENT_LINK" ] && [ ! -f "$AGENT_LINK" ]; then
       echo "  ❌ Missing agent command: $AGENT_LINK"
       EXIT_CODE=1
    fi

    # Check .cursor/commands symlink
    CURSOR_LINK=".cursor/commands/$CMD_FILENAME"
    if [ ! -L "$CURSOR_LINK" ]; then
       echo "  ❌ Missing cursor command link: $CURSOR_LINK"
       EXIT_CODE=1
    fi
  done

  # 4. Check Skills
  SKILLS=$(jq -r '.skills[]? // empty' "$MANIFEST")
  for SKILL_PATH in $SKILLS; do
    SKILL_DIR_NAME=$(dirname "$SKILL_PATH")
    SKILL_NAME=$(basename "$SKILL_DIR_NAME")
    
    # Check .cursor/skills (Canonical)
    CURSOR_SKILL=".cursor/skills/$SKILL_NAME"
    if [ ! -d "$CURSOR_SKILL" ]; then
      echo "  ❌ Missing cursor skill: $CURSOR_SKILL"
      EXIT_CODE=1
    fi

    # Check .codex/skills (Compat)
    CODEX_SKILL=".codex/skills/$SKILL_NAME"
    if [ ! -L "$CODEX_SKILL" ]; then
      echo "  ❌ Missing codex skill link: $CODEX_SKILL"
      EXIT_CODE=1
    fi
  done
  
  echo "  ✅ Plugin '$PLUGIN' structure looks correct."
done

if [ $EXIT_CODE -eq 0 ]; then
  echo "All configured plugins verified successfully."
else
  echo "Verification failed. Run 'devagent update-devagent' or './.devagent/plugins/<plugin>/setup.sh' to attempt repair."
fi

exit $EXIT_CODE
