# Research Packet: Ralph Monitoring UI

- **Date:** 2026-01-13
- **Author:** Jake Ruesink
- **Classification:** Implementation Design
- **Status:** Draft
- **Source Context:** Migrated from combined task `2026-01-13_ralph-quality-gates-and-monitoring-ui`

## Problem Statement
Create a dedicated dashboard to visualize active Ralph agents, view real-time logs, and allow human intervention (pause/stop).

## Findings & Tradeoffs

### 1. Monitoring UI (Beads UI Fork vs. New App)
- **Current State:** `mantoni/beads-ui` is a Node.js app that monitors the Beads SQLite database and provides a Kanban view.
- **Opportunity:** Forking `beads-ui` allows us to leverage the existing database monitoring and Kanban views.
- **Required Enhancements:**
  - **Log View:** Each task should have a corresponding log file (e.g., `logs/bd-xxxx.log`). The UI needs to stream these logs in real-time.
  - **Intervention:** The UI needs a way to stop an active agent. This requires `ralph.sh` to record the PID of the current AI tool execution.
  - **Epic View:** Better visualization of progress across multiple tasks in an epic.

### 2. Log Streaming Strategy
- **Mechanism:** `ralph.sh` should append all AI tool output to a task-specific log file instead of overwriting a single `.ralph_last_output.txt`.
- **Implementation:** 
  - Use `stdbuf` to ensure unbuffered output.
  - Pipe output to `tee -a logs/${TASK_ID}.log`.
  - UI can use a Node.js stream (e.g., `tail -f` pattern) to push log updates to the browser via WebSockets or Server-Sent Events (SSE).

### 3. Intervention (Kill/Pause)
- **Mechanism:** `ralph.sh` writes the PID of the active AI command to a `.ralph_current_pid` file or a `sessions` table in the Beads database.
- **UI Action:** When a user clicks "Stop", the UI sends `SIGTERM` (and later `SIGKILL` if needed) to the PID or the entire process group.
- **Recovery:** Ralph loop should detect the killed process, update the task status to `todo` or `blocked`, and stop the loop.

## Recommendations

1.  **UI Development:** Fork `mantoni/beads-ui` and add a "Log Viewer" component that reads from a project-relative `logs/` directory.
2.  **Ralph Script Update:** Modify `ralph.sh` to:
    -   Generate task-specific log files.
    -   Record the PID of the AI tool process.
    -   Handle termination signals gracefully.
3.  **Logging Enhancement:** Ensure AI tool output is captured with enough verbosity to be useful in the UI.

## Repo Next Steps
- [ ] Fork or clone `beads-ui` into a subdirectory (e.g., `.devagent/plugins/ralph/ui/`).
- [ ] Update `ralph.sh` to support task-specific logging.
- [ ] Design a simple "Log Streaming" server or integrate it into the `beads-ui` backend.

## Risks & Open Questions
- **Log Verbosity:** Some AI tools (like Cursor) might have limited control over terminal output formatting.
- **Permissions:** Killing processes from a web UI requires the Node.js process to have appropriate permissions.
