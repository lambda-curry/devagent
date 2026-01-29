# Handoff (Command)

## Instructions

1. Using only `.devagent/**`, follow the `.devagent/core/workflows/handoff.md` workflow to generate a draft handoff prompt for manual copy/paste.

2. Required: intent (the goal for the new agent). If the user includes `/handoff <intent>`, treat `/handoff` as a command prefix and do not include it in the generated prompt.

3. Optional: task hub path, specific references to include, workflow to continue, Epic ID (for linking improvement reports and screenshots).

---

**Input Context:**
Intent: "<intent>"

(Optional: Task hub path, additional references to include, workflow continuation instructions, Epic ID.)
