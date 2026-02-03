#!/usr/bin/env bash
# E2E verification for --on-iteration: run ralph with the test hook and verify the output file.
# Requires: repo root, epic devagent-iteration-hooks exists, branch feature/ralph-iteration-hooks,
#           at least one ready task for the hook to be called.
# Usage: from repo root: .devagent/plugins/ralph/tools/verify-on-iteration-e2e.sh

set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../../../.." && pwd)"
cd "$REPO_ROOT"

OUT_FILE="$(mktemp)"
trap 'rm -f "$OUT_FILE"' EXIT

SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
RUN_FILE="${SCRIPT_DIR}/../runs/ralph-iteration-hooks-2026-01-31.json"
HOOK_SCRIPT="${SCRIPT_DIR}/test-on-iteration-hook.sh"

if [ ! -f "$RUN_FILE" ]; then
  echo "Error: Run file not found at $RUN_FILE" >&2
  exit 1
fi
if [ ! -x "$HOOK_SCRIPT" ]; then
  echo "Error: Hook script not executable at $HOOK_SCRIPT" >&2
  exit 1
fi

export OUT_FILE
export RALPH_MAX_ITERATIONS=1

echo "Running ralph with --on-iteration (max_iterations=1)..."
"${SCRIPT_DIR}/ralph.sh" --run "$RUN_FILE" --on-iteration "$HOOK_SCRIPT" || true

# Ralph may exit non-zero (e.g. no ready tasks, or agent failure); we only care that the hook was called
if [ ! -s "$OUT_FILE" ]; then
  echo "Error: Hook output file is empty or missing. Ensure epic has at least one ready task." >&2
  exit 1
fi

EXPECTED_KEYS='epicId,iteration,maxIterations,taskId,taskTitle,taskStatus,tasksCompleted,tasksRemaining,iterationDurationSec'
while IFS= read -r line; do
  [ -z "$line" ] && continue
  for key in epicId iteration maxIterations taskId taskTitle taskStatus tasksCompleted tasksRemaining iterationDurationSec; do
    if ! echo "$line" | jq -e ".$key" >/dev/null 2>&1; then
      echo "Error: Payload missing key '$key': $line" >&2
      exit 1
    fi
  done
done < "$OUT_FILE"

echo "OK: Hook was called; payload(s) contain all expected fields ($EXPECTED_KEYS)."
