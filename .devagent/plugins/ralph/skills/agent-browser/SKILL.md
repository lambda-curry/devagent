---
name: Agent Browser Integration
description: >-
  Use Vercel's agent-browser CLI for automated browser testing and UI
  verification. Use when: (1) browser-based quality gates are required,
  (2) verifying UI behavior in the browser, (3) gathering screenshots or DOM
  evidence during Ralph execution. This replaces Playwriter MCP usage.
---

# Agent Browser Integration

Use the Vercel agent-browser CLI to drive browser interactions and collect evidence for UI validation. Ralph should rely on this skill for browser testing instead of Playwriter.

## Prerequisites

- Agent Browser CLI installed and available in PATH
- Browser available for automation (Chrome or Chromium)
- Task context that specifies browser validation requirements

## Setup Checklist

1. Confirm `agent-browser` is available in the shell environment.
2. Ensure the browser instance is running and accessible to the CLI.
3. Capture the target URL(s), expected UI state, and any required credentials.

## Execution Flow

1. **Open target context:** Use agent-browser CLI to open the required URL or route.
2. **Perform UI steps:** Execute interactions described in the task (clicks, form entry, navigation).
3. **Verify outcomes:** Collect evidence (DOM snapshots, screenshots, or text assertions) for each acceptance criteria item.
4. **Report results:** Summarize observations in Ralph task notes and attach evidence locations.

## Evidence Guidelines

- Capture at least one screenshot for each browser requirement.
- Record the final URL and any relevant DOM selectors used.
- Log failures with expected vs. actual behavior.

## Error Handling

- If the CLI is unavailable, log an issue and pause browser testing.
- If UI actions fail, attempt a single retry before logging a blocker.
- If credentials are missing, request them explicitly rather than guessing.

## References

- Agent Browser repo: `https://github.com/vercel-labs/agent-browser`
- Quality gate templates: `quality-gates/typescript.json`
