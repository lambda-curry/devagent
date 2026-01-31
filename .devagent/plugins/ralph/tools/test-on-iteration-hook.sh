#!/usr/bin/env bash
# Test hook for --on-iteration: reads JSON payload from stdin and appends one line to a file.
# Usage: use as --on-iteration path; output file is first arg or OUT_FILE env var.
#
# E2E verification (one iteration, then check file):
#   rm -f /tmp/ralph-iter-e2e.jsonl
#   RALPH_MAX_ITERATIONS=1 OUT_FILE=/tmp/ralph-iter-e2e.jsonl \
#     .devagent/plugins/ralph/tools/ralph.sh --run .devagent/plugins/ralph/runs/ralph-iteration-hooks-2026-01-31.json \
#     --on-iteration .devagent/plugins/ralph/tools/test-on-iteration-hook.sh
#   cat /tmp/ralph-iter-e2e.jsonl  # should show one JSON line with epicId, iteration, taskId, etc.

set -e
OUT="${1:-${OUT_FILE:-/tmp/ralph-iteration-payloads.jsonl}}"
cat >> "$OUT"
