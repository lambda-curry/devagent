#!/bin/bash
set -Eeuo pipefail

# DevAgent Core Install/Update Script
# This script installs or updates the .devagent/core/ directory from the latest main branch
# of the DevAgent repository (https://github.com/lambda-curry/devagent)
# Works for both fresh installations and updates to existing installations

REPO_URL="https://github.com/lambda-curry/devagent.git"
CORE_PATH=".devagent/core"
PROJECT_ROOT="$(pwd -P)"
TEMP_DIR=$(mktemp -d)
KEEP_BACKUP=0

# Flags/env overrides
for arg in "$@"; do
  case "$arg" in
    --keep-backup) KEEP_BACKUP=1 ;;
  esac
done
if [ "${DEVAGENT_KEEP_BACKUP:-0}" = "1" ]; then KEEP_BACKUP=1; fi

# Detect if this is an install or update
if [ -d "$PROJECT_ROOT/$CORE_PATH" ]; then
    IS_UPDATE=true
    echo "Updating DevAgent core files..."
else
    IS_UPDATE=false
    echo "Installing DevAgent core files..."
fi

# Ensure project has .devagent folder
mkdir -p "$PROJECT_ROOT/.devagent"

# Backup existing core if it exists
if [ "$IS_UPDATE" = true ]; then
    BACKUP_DIR="${PROJECT_ROOT}/${CORE_PATH}.backup.$(date +%Y%m%d_%H%M%S)"
    cp -a "$PROJECT_ROOT/$CORE_PATH" "$BACKUP_DIR"
    echo "Backed up existing core to ${BACKUP_DIR#"$PROJECT_ROOT/"}"
fi

restore_on_error() {
  status=$?
  if [ -n "${BACKUP_DIR:-}" ] && [ -d "${BACKUP_DIR}" ]; then
    echo "Update failed. Restoring previous core..."
    rm -rf "$PROJECT_ROOT/$CORE_PATH" || true
    mv "$BACKUP_DIR" "$PROJECT_ROOT/$CORE_PATH"
  fi
  rm -rf "$TEMP_DIR" || true
  exit $status
}
trap restore_on_error ERR

# Sparse checkout in temp dir
cd "$TEMP_DIR"
git init --quiet
git remote add origin "$REPO_URL"
git config core.sparseCheckout true
# Enable sparse index for better performance
git config index.sparse true
echo "$CORE_PATH/" >> .git/info/sparse-checkout
echo ".agents/" >> .git/info/sparse-checkout
echo ".cursor/skills/" >> .git/info/sparse-checkout
echo ".codex/skills/" >> .git/info/sparse-checkout
git pull origin main --quiet --depth=1

# Ensure sparse checkout is applied (sometimes needs explicit checkout)
git sparse-checkout reapply 2>/dev/null || true

# Debug: verify what was checked out
if [ ! -d "$TEMP_DIR/.cursor/skills" ] && [ ! -d "$TEMP_DIR/.codex/skills" ]; then
    echo "Warning: Skill directory not found in repository after checkout."
    echo "This may be expected if skills haven't been added to the repository yet."
fi

# Merge updated core into project; overwrite upstream files, keep local additions
mkdir -p "$PROJECT_ROOT/$CORE_PATH"
rsync -a "$TEMP_DIR/$CORE_PATH/" "$PROJECT_ROOT/$CORE_PATH/"

# Copy .agents/commands directory if it exists in the repository
if [ -d "$TEMP_DIR/.agents/commands" ]; then
    mkdir -p "$PROJECT_ROOT/.agents/commands"
    rsync -a "$TEMP_DIR/.agents/commands/" "$PROJECT_ROOT/.agents/commands/"
    echo "Updated .agents/commands directory from repository."
fi

# Merge skills directory if it exists in the repository
# Target is now .cursor/skills/
if [ -d "$TEMP_DIR/.cursor/skills" ] || [ -d "$TEMP_DIR/.codex/skills" ]; then
    mkdir -p "$PROJECT_ROOT/.cursor/skills"
    SKILLS_UPDATED=0
    
    # Check both potential sources in upstream
    for SOURCE_SKILLS in "$TEMP_DIR/.cursor/skills" "$TEMP_DIR/.codex/skills"; do
        if [ -d "$SOURCE_SKILLS" ]; then
            while IFS= read -r skill_dir; do
                [ -n "$skill_dir" ] || continue
                skill_name=$(basename "$skill_dir")
                rsync -a "$skill_dir/" "$PROJECT_ROOT/.cursor/skills/$skill_name/"
                SKILLS_UPDATED=$((SKILLS_UPDATED + 1))
                echo "  Updated skill: $skill_name"
            done < <(find "$SOURCE_SKILLS" -mindepth 1 -maxdepth 1 -type d 2>/dev/null)
        fi
    done

    if [ $SKILLS_UPDATED -gt 0 ]; then
        echo "Updated $SKILLS_UPDATED skill(s) in .cursor/skills directory."
    else
        echo "No skills found in repository to update."
    fi
else
    echo "Note: Skill directory not found in repository (may not exist yet)."
fi

# Cleanup temp dir
cd "$PROJECT_ROOT"
rm -rf "$TEMP_DIR"

# Remove backup after success unless asked to keep it
if [ "$IS_UPDATE" = true ] && [ -n "${BACKUP_DIR:-}" ] && [ $KEEP_BACKUP -eq 0 ]; then
  rm -rf "$BACKUP_DIR"
  echo "Removed backup directory."
fi

# Run ai-rules generate if available (non-fatal - core update already succeeded)
# Clear ERR trap so ai-rules failures don't trigger rollback
trap - ERR
if command -v ai-rules &> /dev/null && [ -d "$PROJECT_ROOT/ai-rules" ]; then
  echo ""
  echo "Generating ai-rules output..."
  cd "$PROJECT_ROOT"
  if ! ai-rules generate; then
    echo "  Warning: ai-rules generate failed (non-fatal, core update succeeded)"
  fi
fi

if [ "$IS_UPDATE" = true ]; then
  echo "DevAgent core files updated successfully!"
  if [ -n "${BACKUP_DIR:-}" ] && [ $KEEP_BACKUP -eq 1 ]; then
    echo "Backup kept at: ${BACKUP_DIR#"$PROJECT_ROOT/"}"
  fi
  # Hint to use git for backup/history
  if command -v git >/dev/null 2>&1; then
    echo "Tip: commit the updated core to git:"
    echo "  git add $CORE_PATH && git commit -m 'chore(devagent): update core'"
  fi
else
  echo "DevAgent core files installed successfully!"
  echo ""
  echo "Next steps:"
  echo "1. Create your workspace directory structure:"
  echo "   mkdir -p .devagent/workspace/{product,memory,tasks,research}"
  echo "   mkdir -p .devagent/workspace/memory/_archive"
  echo ""
  echo "2. Initialize your product mission:"
  echo "   See .devagent/core/README.md for setup instructions"
  echo ""
  echo "3. Review available workflows:"
  echo "   See .devagent/core/AGENTS.md for the workflow roster"
  # Hint to use git for backup/history
  if command -v git >/dev/null 2>&1; then
    echo ""
    echo "Tip: commit the installed core to git:"
    echo "  git add $CORE_PATH && git commit -m 'chore(devagent): install core'"
  fi
fi
