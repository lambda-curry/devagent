#!/usr/bin/env bash
# Verify marker.txt contains the expected text from wake-hook-test task 1.
# Exit 0 if match, 1 otherwise.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MARKER_FILE="${SCRIPT_DIR}/marker.txt"
EXPECTED="Wake hook test - task 1 complete"

if [[ ! -f "$MARKER_FILE" ]]; then
  echo "marker.txt not found at $MARKER_FILE" >&2
  exit 1
fi

content=$(cat "$MARKER_FILE")
if [[ "$content" == "$EXPECTED" ]]; then
  exit 0
fi

echo "marker.txt content mismatch. expected: $EXPECTED" >&2
exit 1
