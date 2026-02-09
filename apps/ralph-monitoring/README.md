# Ralph Monitoring

A React Router v7 app for monitoring and controlling [Ralph](https://github.com/steveyegge/beads) agent execution. View epics and tasks, stream logs, and control loop runs (start, pause, resume, skip) from the UI.

## Features

- **Epic list** (`/epics`) — Bird’s-eye view of all epics with status and progress (X/Y tasks complete).
- **Epic detail** (`/epics/:epicId`) — Per-epic dashboard with:
  - **Epic progress** — Progress bar and metric cards (tasks complete, in progress, duration).
  - **Agent activity timeline** — Chronological view of agent work across tasks (with time-range filter).
  - **Loop control panel** — Start, pause, resume, and skip tasks for the active loop.
- **Task list & detail** — Home page task list and task detail with streaming logs, comments, and stop.
- **Execution logging** — Task duration and execution events stored in SQLite for timeline and metrics.
- **Light/dark theme** — Theme toggle with persisted preference.

### Mobile monitoring flow (Loop Monitor)

Optimized for checking loop status on the go:

1. **Loop dashboard** (`/epics`) — List of active loops (epics) with status (Running / Paused / Idle), completed/total tasks, current task line, and last activity. Tap a card to open that loop.
2. **Loop detail** (`/epics/:epicId`) — Live status, "Now" card (current task or last completed), recent activity feed, loop controls (start/pause/resume), and collapsible all-steps list. **Back** returns to the dashboard. When a task is running, **Watch Live** opens the full-screen log viewer.
3. **Live log** (`/epics/:epicId/live`) — Full-screen streaming log for the current task (SSE). Tap to pause/resume auto-scroll. **Back** returns to loop detail.
4. **Back navigation** — Every screen has a clear back path: Live → Detail → Dashboard. No dead ends.

Loading and empty states: dashboard shows a loading bar during navigation; empty states for "no epics", "no activity", "no active task", and "no steps" use consistent copy. Failed data loads are handled by the root error boundary.

## Tech stack

- **Framework:** React Router v7
- **UI:** React 19, Tailwind CSS v4, shadcn-style components, Tremor (progress/charts)
- **Data:** better-sqlite3 (Beads DB + execution log)
- **Testing:** Vitest, @testing-library/react

## Scripts

From `apps/ralph-monitoring/`:

| Command | Description |
|--------|-------------|
| `bun run dev` | Start dev server |
| `bun run build` | Production build |
| `bun run start` | Serve production build |
| `bun run test` | Run tests |
| `bun run typecheck` | Type-check |
| `bun run lint` | Lint with Biome |
| `bun run storybook` | Storybook on port 6006 |

## Project layout

- `app/routes/` — Routes (epics, tasks, API for logs and loop control).
- `app/components/` — UI (EpicProgress, AgentTimeline, LoopControlPanel, LogViewer, etc.).
- `app/db/` — Beads DB access and execution log queries.
- `app/utils/` — Log streaming, loop control, process helpers.
- `docs/` — Design language, component specs, performance, Storybook rubric.

## Design & docs

- [Design language](docs/DESIGN_LANGUAGE.md) — Tokens, surfaces, typography.
- [Component specs](docs/component-specs.md) — ProgressBar, MetricCard, AgentTimeline, ControlPanel.
- [AGENTS.md](AGENTS.md) — Context for AI agents working in this app.

## Configuration

- **`RALPH_PROJECTS_FILE`** — Optional. Path to the projects config JSON file. When unset, the app uses `<repoRoot>/.ralph/projects.json`. The config schema: `{ "projects": [ { "id": string, "path": string, "label?": string } ], "defaultId?": string }`. Each `path` is a repo root (directory containing `.beads/beads.db`). The app validates that each project path exists and the Beads DB is readable.
- **`BEADS_DB`** — Optional. Path to the Beads SQLite database when using a single project (legacy). See `app/db/beads.server.ts`.
- **`REPO_ROOT`** — Optional. Repo root used to resolve default paths for Beads DB and projects config.

## Loop control

Loop control uses file-based signals (see `.devagent/plugins/ralph/`). The UI calls:

- `POST /api/loop/start` — Start loop (orchestrator must be running).
- `POST /api/loop/pause` — Request pause.
- `POST /api/loop/resume` — Request resume.
- `POST /api/loop/skip/:taskId` — Skip a task (with confirmation in UI).

Execution events (start/end per task) are written by Ralph and read from the execution log for the timeline and duration metrics.
