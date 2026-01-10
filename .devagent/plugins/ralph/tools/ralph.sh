#!/usr/bin/env bash
set -euo pipefail

CONFIG_PATH=${1:-""}

if [[ -z "$CONFIG_PATH" ]]; then
  echo "Usage: ralph.sh <config.json>" >&2
  exit 1
fi

if [[ ! -f "$CONFIG_PATH" ]]; then
  echo "Config not found: $CONFIG_PATH" >&2
  exit 1
fi

echo "Ralph plugin scaffold: config loaded from $CONFIG_PATH"
exit 0
