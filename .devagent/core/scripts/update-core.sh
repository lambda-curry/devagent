#!/bin/bash
set -Eeuo pipefail

# DevAgent Core Update Script
# This script updates the .devagent/core/ directory from the latest main branch
# of the DevAgent repository (https://github.com/lambda-curry/devagent)

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

echo "Updating DevAgent core files..."

# Ensure project has .devagent folder
mkdir -p "$PROJECT_ROOT/.devagent"

# Backup existing core if it exists
if [ -d "$PROJECT_ROOT/$CORE_PATH" ]; then
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
echo "$CORE_PATH/" >> .git/info/sparse-checkout
git pull origin main --quiet --depth=1

# Merge updated core into project; overwrite upstream files, keep local additions
mkdir -p "$PROJECT_ROOT/$CORE_PATH"
rsync -a "$TEMP_DIR/$CORE_PATH/" "$PROJECT_ROOT/$CORE_PATH/"

# Cleanup temp dir
cd "$PROJECT_ROOT"
rm -rf "$TEMP_DIR"

# Remove backup after success unless asked to keep it
if [ -n "${BACKUP_DIR:-}" ] && [ $KEEP_BACKUP -eq 0 ]; then
  rm -rf "$BACKUP_DIR"
  echo "Removed backup directory."
fi

echo "DevAgent core files updated successfully!"
if [ -n "${BACKUP_DIR:-}" ] && [ $KEEP_BACKUP -eq 1 ]; then
  echo "Backup kept at: ${BACKUP_DIR#"$PROJECT_ROOT/"}"
fi

# Hint to use git for backup/history
if command -v git >/dev/null 2>&1; then
  echo "Tip: commit the updated core to git:"
  echo "  git add $CORE_PATH && git commit -m 'chore(devagent): update core'"
fi
