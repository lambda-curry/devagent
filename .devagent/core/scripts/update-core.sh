#!/bin/bash
set -e

# DevAgent Core Update Script
# This script updates the .devagent/core/ directory from the latest main branch
# of the DevAgent repository (https://github.com/lambda-curry/devagent)

REPO_URL="https://github.com/lambda-curry/devagent.git"
CORE_PATH=".devagent/core"
TEMP_DIR=$(mktemp -d)

echo "Updating DevAgent core files..."

# Check if we're in a project with .devagent
if [ ! -d ".devagent" ]; then
    echo "Error: No .devagent directory found. Are you in a DevAgent-enabled project?"
    exit 1
fi

# Backup existing core if it exists
if [ -d "$CORE_PATH" ]; then
    BACKUP_DIR="${CORE_PATH}.backup.$(date +%Y%m%d_%H%M%S)"
    mv "$CORE_PATH" "$BACKUP_DIR"
    echo "Backed up existing core to $BACKUP_DIR"
fi

# Sparse checkout in temp dir
cd "$TEMP_DIR"
git init --quiet
git remote add origin "$REPO_URL"
git config core.sparseCheckout true
echo "$CORE_PATH/" >> .git/info/sparse-checkout
git pull origin main --quiet --depth=1

# Move updated core to project
mv "$CORE_PATH" "../$CORE_PATH"
cd ..
rm -rf "$TEMP_DIR"

echo "DevAgent core files updated successfully!"
echo "You can find your backup at: $BACKUP_DIR (if it was created)"
