# Ralph Monitoring UI MVP Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-14
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/completed/2026-01-13_ralph-monitoring-ui/`
- Stakeholders: Jake Ruesink (Owner, Decision Maker)

---

## PART 1: PRODUCT CONTEXT

### Summary
Build a dedicated Ralph Monitoring UI that surfaces active Beads tasks, streams Ralph execution logs in real-time, and allows the user to stop a running task. This MVP focuses on single-user monitoring and safe intervention to increase confidence in autonomous execution.

### Context & Problem
Ralph currently runs without real-time visibility or intervention controls; logs are written to a single `.ralph_last_output.txt` file and there is no UI to track task progress. This creates friction for human-in-the-loop workflows and slows adoption. (Sources: `clarification/2026-01-14_initial-clarification.md`, `research/2026-01-13_ralph-monitoring-ui-research.md`)

### Objectives & Success Metrics
- **Real-time visibility:** Active tasks show streaming logs in the UI (baseline: only `.ralph_last_output.txt`).
- **Intervention capability:** User can stop an active Ralph task from the UI (baseline: no stop capability).
- **MVP success:** User can view active tasks with real-time logs and can stop a running task. (Source: `clarification/2026-01-14_initial-clarification.md`)

### Users & Insights
- **Primary user:** Jake Ruesink, monitoring his own Ralph executions.
- **Key insight:** Real-time visibility + stop controls are the top priorities for MVP. (Source: `clarification/2026-01-14_initial-clarification.md`)

### Solution Principles
- Build a new React Router 7 app (not a beads-ui fork), but reuse beads-ui patterns for SQLite access and Kanban UI.
- Prefer simple file-based log capture and SSE streaming.
- Graceful error handling with fallback to static log view.
- Desktop-first UI for MVP; accessibility basics (keyboard navigation, clear errors). (Source: `clarification/2026-01-14_initial-clarification.md`)

### Scope Definition
- **In Scope:**
  - Task list/Kanban view of active Beads tasks.
  - Real-time log streaming for active tasks.
  - Stop control to terminate an active Ralph task.
  - Fallback to static log view when streaming fails.
- **Out of Scope / Future:**
  - Multi-user support.
  - Pause/resume controls (stop-only for MVP).
  - Advanced analytics, diff views, mobile-first UI.
  - Log parsing/structured output beyond raw text.

### Functional Narrative

#### Flow 1: View Active Tasks and Real-Time Logs
- Trigger: User opens the monitoring UI.
- Experience narrative:
  - UI loads active tasks from Beads SQLite and renders list/Kanban view.
  - User selects an active task to view details.
  - UI starts streaming logs for the selected task via SSE.
  - If streaming fails, UI shows an error and falls back to static log view.
- Acceptance criteria:
  - Active tasks render within the UI.
  - Selecting a task shows log output and updates as new lines arrive.
  - Streaming failures show an error message and load static log content.

#### Flow 2: Stop Active Task
- Trigger: User clicks Stop on an active task.
- Experience narrative:
  - UI sends a stop request to the backend.
  - Backend signals the running Ralph process and updates task status if needed.
  - UI reflects stop state or errors.
- Acceptance criteria:
  - Clicking Stop sends a request and terminates the active process.
  - UI shows confirmation or error state (idempotent if already stopped).

### Technical Notes & Dependencies
- **Beads SQLite** access is required for tasks and status.
- **Ralph script** must write task-specific logs and record PID for stop control.
- **Streaming** via React Router 7 resource routes (SSE) using file tailing.
- **Platform:** macOS primary; Linux compatible.
- **Log location:** Define a single log directory shared between `ralph.sh` and the UI (e.g., `logs/ralph/`) and store task-specific logs as `logs/ralph/<taskId>.log`.

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- Scope focus: MVP UI + log streaming + stop control for single-user monitoring.
- Key assumptions:
  - Cursor CLI `--output-format text` is sufficient for MVP (validate during implementation).
  - React Router 7 resource routes work reliably for SSE streaming.
  - File-based log capture (`tee -a`) scales for typical task output volumes.
  - Process signal handling works reliably on macOS.
- Out of scope: Pause/resume, multi-user, advanced log parsing/metrics.

### Implementation Tasks

#### Task 1: Scaffold React Router 7 app + Beads task list
- **Objective:** Create a new React Router 7 app as a monorepo with Bun, following the structure and patterns from https://github.com/lambda-curry/react-router-starter. Set up routes/layouts and implement Beads task list/Kanban view for active tasks. This will be built as a standalone app within the repo (not part of the plugin structure), eventually to be bundled and delivered separately.
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/` (new app root, monorepo structure at repo root)
  - `apps/ralph-monitoring/app/routes/*`
  - `apps/ralph-monitoring/app/components/*`
  - `apps/ralph-monitoring/app/db/*` (SQLite access helpers)
  - `packages/` (shared packages directory at repo root, similar to react-router-starter structure)
  - `package.json` (root workspace config with Bun, if not already exists)
  - `bun.lockb` (Bun lockfile at repo root)
  - `turbo.json` (Turbo config for monorepo at repo root)
  - `.cursorrules` (copied from react-router-starter, at repo root)
  - `apps/ralph-monitoring/app/globals.css` (Tailwind config, copied from react-router-starter)
- **References:**
  - `research/2026-01-14_cursor-output-streaming-tech-validation.md`
  - `brainstorms/2026-01-14_ralph-monitoring-ui-tech-stack-ideas.md`
  - External: https://github.com/lambda-curry/react-router-starter (structure, tech stack, cursor rules, tailwind config)
- **Dependencies:** None.
- **Acceptance Criteria:**
  - App is set up as a Bun monorepo with structure similar to react-router-starter (apps/ and packages/ directories)
  - Cursor rules (`.cursorrules`) are copied from react-router-starter
  - Tailwind CSS v4 configuration is copied from react-router-starter (CSS-first approach with `@theme` directive)
  - Root `package.json` uses Bun workspaces
  - Turbo is configured for monorepo builds
  - UI renders a list/Kanban of active tasks from Beads SQLite.
  - Selecting a task navigates to a task detail route.
- **Testing Criteria:**
  - Manual: run `bun dev` from root, verify monorepo structure works
  - Manual: verify cursor rules are applied (check IDE behavior)
  - Manual: verify Tailwind styles work correctly
  - Manual: run dev server, verify tasks list renders and task navigation works.
  - If a test runner exists in the new app, add a basic loader test for task query.
- **Validation Plan:** Confirm monorepo structure matches react-router-starter pattern, cursor rules and Tailwind config are properly copied, DB query returns active tasks and UI renders without errors.

#### Task 2: Update `ralph.sh` for task-specific logs + PID tracking
- **Objective:** Capture per-task logs and write PID for stop controls.
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/tools/ralph.sh`
  - `.devagent/plugins/ralph/tools/config.json` (optional log dir config)
  - `logs/ralph/` (new log directory)
- **References:**
  - `research/2026-01-13_ralph-monitoring-ui-research.md`
  - `research/2026-01-14_cursor-output-streaming-tech-validation.md`
- **Dependencies:** Task 1 (log path shared with UI).
- **Acceptance Criteria:**
  - Each task run writes to `logs/ralph/<taskId>.log` (append mode).
  - PID (and optionally process group ID) is recorded per task for stop control.
  - Existing `.ralph_last_output.txt` remains available or is deprecated with migration note.
- **Testing Criteria:**
  - Manual: run a single Ralph iteration and confirm log file grows in real-time.
  - Manual: confirm PID file updates for the active task.
- **Validation Plan:** Tail the new log file and verify output lines match CLI output.

#### Task 3: Implement SSE log streaming + fallback static log view
- **Objective:** Stream logs via SSE resource route and render in UI with fallback.
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/routes/api.logs.$taskId.stream.ts`
  - `apps/ralph-monitoring/app/routes/tasks.$taskId.tsx`
  - `apps/ralph-monitoring/app/components/LogViewer.tsx`
  - `apps/ralph-monitoring/app/utils/logs.server.ts`
- **References:**
  - `research/2026-01-14_cursor-output-streaming-tech-validation.md`
- **Dependencies:** Task 2 (log file creation).
- **Acceptance Criteria:**
  - EventSource connects to `/api/logs/:taskId/stream` and receives new log lines.
  - UI displays streaming logs with auto-scroll and a clear connection indicator.
  - If SSE fails, UI shows an error and loads static log content (last N lines).
- **Testing Criteria:**
  - Manual: start Ralph, open task detail, verify logs stream live.
  - Manual: disconnect SSE and confirm fallback to static log view.
- **Validation Plan:** Confirm stream closes cleanly on navigation and does not leak processes.

#### Task 4: Stop control endpoint + UI integration
- **Objective:** Add a backend endpoint to stop a task process and wire UI Stop button.
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/routes/api.tasks.$taskId.stop.ts`
  - `apps/ralph-monitoring/app/utils/process.server.ts`
  - `apps/ralph-monitoring/app/routes/tasks.$taskId.tsx`
  - `.devagent/plugins/ralph/tools/ralph.sh` (PID file naming convention)
- **References:**
  - `research/2026-01-14_cursor-output-streaming-tech-validation.md`
- **Dependencies:** Task 2 (PID tracking), Task 1 (task detail UI).
- **Acceptance Criteria:**
  - Stop button sends request and terminates the active process (SIGTERM → SIGKILL fallback).
  - UI reports success or a clear error if PID is missing/already stopped.
  - Task status updates in UI after stop action.
- **Testing Criteria:**
  - Manual: run a task, click Stop, confirm process terminates.
  - Manual: click Stop on completed task and confirm graceful error.
- **Validation Plan:** Verify process cleanup and no orphaned tail/SSE processes remain.

### Implementation Guidance (Optional)
- **From `.devagent/plugins/ralph/AGENTS.md` → Quality Gates & Verification:**
  - Follow the 7-point checklist and self-diagnose test/lint/typecheck commands before verifying changes. (Source: `.devagent/plugins/ralph/AGENTS.md`)
- **From `.devagent/plugins/ralph/AGENTS.md` → Commit Messaging Guidelines:**
  - Use Conventional Commits and include `[skip ci]` for incremental commits unless a preview is needed. (Source: `.devagent/plugins/ralph/AGENTS.md`)

---

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Cursor CLI output formats unknown | Risk | Jake Ruesink | Run `cursor --help` during implementation; proceed with text-only if no structured formats | During implementation |
| React Router 7 SSE reliability for long streams | Risk | Jake Ruesink | Prototype SSE resource route early and monitor reconnect behavior | During implementation |
| File-based log streaming performance | Risk | Jake Ruesink | Start with `tail -f`, monitor memory/CPU during longer runs | During implementation |
| Process signal handling on macOS | Risk | Jake Ruesink | Validate SIGTERM/SIGKILL on target machine | During implementation |
| Log directory path decision | Question | Jake Ruesink | Confirm shared log path between `ralph.sh` and UI (`logs/ralph/` vs plugin-local) | Before implementation |

---

## Progress Tracking
Refer to the AGENTS.md file in the task directory for instructions on tracking and reporting progress during implementation.

---

## Appendices & References (Optional)
- Task hub: `.devagent/workspace/tasks/completed/2026-01-13_ralph-monitoring-ui/AGENTS.md`
- Clarification: `.devagent/workspace/tasks/completed/2026-01-13_ralph-monitoring-ui/clarification/2026-01-14_initial-clarification.md`
- Research: `.devagent/workspace/tasks/completed/2026-01-13_ralph-monitoring-ui/research/2026-01-13_ralph-monitoring-ui-research.md`
- Research: `.devagent/workspace/tasks/completed/2026-01-13_ralph-monitoring-ui/research/2026-01-14_cursor-output-streaming-tech-validation.md`
- Brainstorm: `.devagent/workspace/tasks/completed/2026-01-13_ralph-monitoring-ui/brainstorms/2026-01-14_ralph-monitoring-ui-tech-stack-ideas.md`
- Ralph script: `.devagent/plugins/ralph/tools/ralph.sh`
