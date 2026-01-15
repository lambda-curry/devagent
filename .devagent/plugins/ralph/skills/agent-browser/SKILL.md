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

## Smart Defaults & Triggers

**When to Run Browser Tests:**
1. **Explicit Requirement:** Task description demands UI verification.
2. **Frontend Changes:** You modified `.tsx`, `.jsx`, `.css`, `.html`, or `tailwind` config.
3. **UI Logic:** You changed client-side state management or routing.

## Execution Flow

1. **Open target context:** Use agent-browser CLI to open the required URL (localhost or preview).
2. **Perform UI steps:** Execute interactions (clicks, form entry).
3. **DOM Assertions (REQUIRED):** Use `agent-browser` to assert that specific elements exist or contain text. Do NOT rely solely on visual inspection.
4. **Capture Evidence:**
   - **Failure:** IF an assertion fails, capture a screenshot immediately to document the state.
   - **Success:** Capture a screenshot ONLY if the task involves visual design changes that need human review.
5. **Report:** Summarize results in task comments.

## Evidence Guidelines

- **DOM Verification:** Primary method. Assert on IDs, text content, or accessibility labels.
- **Failure Screenshots (Mandatory):** Must be captured when a test fails.
- **Success Screenshots (Optional):** Only for visual features.

## Screenshot Management

**Directory Structure:**
- Screenshots must be saved to project-accessible locations, NOT `/tmp/` or agent-browser default locations.
- **Primary location (preferred):** Save to the task folder that initiated the Ralph cycle:
  - Extract task folder path from Epic's plan document reference (Epic description contains "Plan document: <path>")
  - Task folder pattern: `.devagent/workspace/tasks/active/YYYY-MM-DD_task-slug/`
  - Save screenshots to: `.devagent/workspace/tasks/active/YYYY-MM-DD_task-slug/screenshots/`
- **Fallback location:** If task folder cannot be determined:
  - Epic-level screenshots: `.devagent/workspace/reviews/[epic-id]/screenshots/`
  - Task-specific screenshots: `.devagent/workspace/reviews/[epic-id]/[task-id]/screenshots/` (if task-specific directory exists)
- Create screenshot directories automatically if they don't exist.

**Naming Convention:**
- Format: `[task-id]-[description]-[timestamp].png`
- Example: `bd-ad57.2-initial-load-20260112.png`
- Include timestamps for sequence tracking when multiple screenshots are captured.

**Integration with Task Comments:**
- When screenshots are captured, include the screenshot path in the task comment:
  ```
  Screenshots captured: .devagent/workspace/tasks/active/YYYY-MM-DD_task-slug/screenshots/[task-id]-*.png
  ```
  Or fallback:
  ```
  Screenshots captured: .devagent/workspace/reviews/[epic-id]/screenshots/[task-id]-*.png
  ```
- Document what each screenshot shows (e.g., "Initial page load", "After refresh", "Auto-refresh behavior").

**Agent-Browser Configuration:**
- Configure agent-browser to use project-relative paths instead of `/tmp/`.
- Use `--output-dir` or equivalent flag to specify the screenshot directory.
- Ensure screenshots are accessible for review after execution.

## Error Handling

- If the CLI is unavailable, log an issue and pause browser testing.
- If UI actions fail, attempt a single retry before logging a blocker.
- If credentials are missing, request them explicitly rather than guessing.

## References

- Agent Browser repo: `https://github.com/vercel-labs/agent-browser`
