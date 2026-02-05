#!/usr/bin/env bash
# E2E verification for --on-iteration and --on-complete: run ralph with both hooks
# (same script appends all payloads to one file) and verify iteration + completion payloads.
#
# Requires:
#   - Git repo with .git and branch feature/ralph-iteration-hooks
#   - Beads DB with epic devagent-iteration-hooks and at least one ready task
#   - RALPH_MAX_ITERATIONS=1 is used (env override) so one iteration + completion run
# Usage: .devagent/plugins/ralph/tools/verify-hooks-e2e.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if ! REPO_ROOT="$(git -C "${SCRIPT_DIR}/../../../../.." rev-parse --show-toplevel 2>/dev/null)"; then
  echo "Error: Unable to resolve repo root from ${SCRIPT_DIR}" >&2
  exit 1
fi
cd "$REPO_ROOT"

OUT_FILE="$(mktemp)"
trap 'rm -f "$OUT_FILE"' EXIT

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

echo "Running ralph with --on-iteration and --on-complete (max_iterations=1)..."
(cd "$REPO_ROOT" && "${SCRIPT_DIR}/ralph.sh" --run "$RUN_FILE" --on-iteration "$HOOK_SCRIPT" --on-complete "$HOOK_SCRIPT") || true

# Ralph may exit non-zero; we only care that both hook types were called
if [ ! -s "$OUT_FILE" ]; then
  echo "Error: Hook output file is empty or missing." >&2
  exit 1
fi

# Require at least one iteration payload (epicId, iteration, taskId, ...)
ITERATION_KEYS="epicId iteration maxIterations taskId taskTitle taskStatus tasksCompleted tasksRemaining iterationDurationSec"
found_iteration=0
while IFS= read -r line; do
  [ -z "$line" ] && continue
  if echo "$line" | jq -e '.taskId and .iteration' >/dev/null 2>&1; then
    for key in epicId iteration maxIterations taskId taskTitle taskStatus tasksCompleted tasksRemaining iterationDurationSec; do
      if ! echo "$line" | jq -e ".$key" >/dev/null 2>&1; then
        echo "Error: Iteration payload missing key '$key': $line" >&2
        exit 1
      fi
    done
    found_iteration=1
    break
  fi
done < "$OUT_FILE"

if [ "$found_iteration" -eq 0 ]; then
  echo "Error: No iteration payload found. Ensure epic has at least one ready task." >&2
  exit 1
fi

# Require at least one completion payload (status, exitReason, durationSec, ...)
COMPLETION_KEYS="status epicId iterations maxIterations exitReason durationSec branch logTail"
found_completion=0
while IFS= read -r line; do
  [ -z "$line" ] && continue
  if echo "$line" | jq -e '.exitReason and .status' >/dev/null 2>&1; then
    for key in status epicId iterations maxIterations exitReason durationSec branch logTail; do
      if ! echo "$line" | jq -e ".$key" >/dev/null 2>&1; then
        echo "Error: Completion payload missing key '$key': $line" >&2
        exit 1
      fi
    done
    found_completion=1
    break
  fi
done < "$OUT_FILE"

if [ "$found_completion" -eq 0 ]; then
  echo "Error: No completion payload found." >&2
  exit 1
fi

echo "OK: Both hooks were called; iteration and completion payloads contain all expected fields."
echo "  Iteration keys: $ITERATION_KEYS"
echo "  Completion keys: $COMPLETION_KEYS"
