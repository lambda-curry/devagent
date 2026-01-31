# Ralph Monitoring Dashboard Enhancements Plan

- Owner: Jake
- Last Updated: 2026-01-30
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/active/2026-01-30_ralph-monitoring-dashboard-enhancements/`
- Stakeholders: Jake (Lead, Approver)

---

## PART 1: PRODUCT CONTEXT

### Summary

Transform the ralph-monitoring app from a task viewer into a comprehensive loop management dashboard by adding three major features: Epic Progress Dashboard (bird's-eye view of loop runs), Loop Control Panel (start/pause/control loops from UI), and Agent Activity Timeline (chronological visualization of agent work). These features address the gap between running loops via CLI and understanding/controlling their execution.

### Context & Problem

**Current State:**
- Ralph loops run via CLI (`ralph.sh --epic <id>`)
- ralph-monitoring app shows task list and individual task details
- No epic-level progress view or estimated completion
- No way to start/pause/control loops from UI
- No cross-task timeline view of agent activity

**Pain Points:**
- Developers must watch terminal output or check logs manually
- No quick "how is my loop doing?" view
- Can't share loop progress with stakeholders
- Must kill the entire process to pause or intervene

**Business Trigger:**
- Increased use of Ralph loops for larger epics
- Need for better observability and control as loops run autonomously

### Objectives & Success Metrics

| Objective | Success Metric |
|-----------|----------------|
| Epic-level visibility | User can see X/Y tasks complete, estimated time remaining |
| Loop control | User can start, pause, and resume loops from UI |
| Agent timeline | User can see chronological view of agent work across tasks |
| Improved debugging | User can identify slow/failing tasks at a glance |

### Users & Insights

**Primary User:** Developer running Ralph loops
- Wants quick status check without reading logs
- Needs to share progress with team/stakeholders
- Wants to intervene when things go wrong

**Secondary User:** Tech lead / PM
- Wants overview of loop progress
- Needs to understand time-per-task patterns

### Solution Principles

1. **Progressive enhancement** - Each feature builds on existing architecture
2. **Real-time by default** - Updates should feel live (polling acceptable, WebSocket preferred)
3. **Minimal disruption** - Don't break existing task list/detail views
4. **Data-driven** - Expose execution data that enables future analytics

### Scope Definition

**In Scope:**
- Epic Progress Dashboard (new route)
- Loop Control Panel (start, pause, skip, retry)
- Agent Activity Timeline (visualization component)
- Schema additions for execution logging

**Out of Scope / Future:**
- Multi-loop management (concurrent loops)
- Historical analytics across runs
- External alerting/notifications
- Mobile-responsive timeline (desktop-first)

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions

- **Scope focus:** All three features delivered in phases
- **Key assumptions:**
  - Ralph process can be controlled via file signals or WebSocket
  - Execution timing can be logged to SQLite without performance impact
  - Tremor library works with React 19 + Tailwind v4
- **Out of scope:** Authentication, multi-user, cloud deployment

### Implementation Tasks

---

#### Phase 1: Data Foundation

##### Task 1.1: Add Execution Log Schema

- **Objective:** Create database schema to track execution timing and agent data
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/tools/lib/beads.types.ts` - Add types
  - `.devagent/plugins/ralph/tools/ralph.ts` - Log execution events
  - `apps/ralph-monitoring/app/db/beads.server.ts` - Add query functions
- **Dependencies:** None
- **Acceptance Criteria:**
  - [ ] `ralph_execution_log` table created with: task_id, agent_type, started_at, ended_at, status, iteration
  - [ ] Ralph logs execution start/end for each task
  - [ ] Query function `getExecutionLogs(epicId)` returns logs
- **Testing Criteria:**
  - Unit test for schema creation
  - Integration test: run a task, verify log entry created

##### Task 1.2: Add Duration to Task Queries

- **Objective:** Expose task duration in existing queries
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/db/beads.server.ts` - Modify `getAllTasks`, `getTaskById`
  - `apps/ralph-monitoring/app/db/beads.types.ts` - Add duration fields
- **Dependencies:** Task 1.1
- **Acceptance Criteria:**
  - [ ] Tasks include `started_at`, `ended_at`, `duration_ms` from execution log
  - [ ] Existing views continue to work
- **Testing Criteria:**
  - Unit test for duration calculation
  - Snapshot test for task list with duration

---

#### Phase 2: Epic Progress Dashboard

##### Task 2.1: Create Epic List Route

- **Objective:** Add `/epics` route showing all epics with progress
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/routes/epics._index.tsx` (new)
  - `apps/ralph-monitoring/app/db/beads.server.ts` - Add `getEpics()` query
- **Dependencies:** Task 1.1
- **Acceptance Criteria:**
  - [ ] `/epics` shows list of epics (parent tasks with no parent_id)
  - [ ] Each epic shows: title, status, task count, completed count, progress %
  - [ ] Click epic navigates to detail view
- **Testing Criteria:**
  - Loader test with mock epics
  - Component test for progress display

##### Task 2.2: Create Epic Detail Route

- **Objective:** Add `/epics/$epicId` route with detailed progress
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/routes/epics.$epicId.tsx` (new)
  - `apps/ralph-monitoring/app/components/EpicProgress.tsx` (new)
- **Dependencies:** Task 2.1
- **Acceptance Criteria:**
  - [ ] Shows epic title, description, overall progress bar
  - [ ] Lists tasks with status icons, duration, agent type
  - [ ] Shows estimated time remaining (based on avg task duration)
  - [ ] Real-time updates via polling (5s interval)
- **Testing Criteria:**
  - Loader test with mock epic and tasks
  - Component test for progress bar calculations

##### Task 2.3: Add Tremor Progress Components

- **Objective:** Integrate Tremor for progress visualization
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/package.json` - Add tremor dependency
  - `apps/ralph-monitoring/app/components/ProgressBar.tsx` (new)
  - `apps/ralph-monitoring/app/components/MetricCard.tsx` (new)
- **Dependencies:** None (can parallel)
- **Acceptance Criteria:**
  - [ ] Tremor installed and configured with Tailwind v4
  - [ ] ProgressBar component with customizable colors
  - [ ] MetricCard for stats (tasks complete, time elapsed, etc.)
- **Testing Criteria:**
  - Storybook stories for both components
  - Visual snapshot tests

---

#### Phase 3: Agent Activity Timeline

##### Task 3.1: Create Timeline Component

- **Objective:** Build horizontal timeline visualization component
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/components/AgentTimeline.tsx` (new)
  - `apps/ralph-monitoring/app/components/AgentTimeline.stories.tsx` (new)
- **Dependencies:** Task 1.1
- **Acceptance Criteria:**
  - [ ] Horizontal timeline showing task blocks per agent type
  - [ ] Blocks colored by status (success=green, failed=red, in_progress=blue)
  - [ ] Block width proportional to duration
  - [ ] Hover shows task details tooltip
  - [ ] Click navigates to task detail
- **Testing Criteria:**
  - Storybook with mock data
  - Interaction test for click/hover

##### Task 3.2: Integrate Timeline in Epic Detail

- **Objective:** Add timeline to epic detail view
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/routes/epics.$epicId.tsx`
- **Dependencies:** Task 3.1, Task 2.2
- **Acceptance Criteria:**
  - [ ] Timeline appears below task list
  - [ ] Syncs with task list (same data source)
  - [ ] Filter controls: by agent type, time range
- **Testing Criteria:**
  - Integration test with timeline + task list

---

#### Phase 4: Loop Control Panel

##### Task 4.1: Add Control Signal Mechanism

- **Objective:** Enable UI to send control signals to ralph.ts
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/tools/ralph.ts` - Add signal file polling
  - `.devagent/plugins/ralph/tools/lib/control-signals.ts` (new)
- **Dependencies:** None
- **Acceptance Criteria:**
  - [ ] Ralph checks for signal files: `.ralph_pause`, `.ralph_resume`, `.ralph_skip_<taskId>`
  - [ ] Pause: complete current task, then wait
  - [ ] Resume: continue from paused state
  - [ ] Skip: mark task as skipped, move to next
- **Testing Criteria:**
  - Unit test for signal file parsing
  - Integration test: create pause file, verify ralph pauses

##### Task 4.2: Create Control API Routes

- **Objective:** Add API routes for loop control actions
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/routes/api.loop.pause.ts` (new)
  - `apps/ralph-monitoring/app/routes/api.loop.resume.ts` (new)
  - `apps/ralph-monitoring/app/routes/api.loop.skip.$taskId.ts` (new)
  - `apps/ralph-monitoring/app/routes/api.loop.start.ts` (new)
- **Dependencies:** Task 4.1
- **Acceptance Criteria:**
  - [ ] POST `/api/loop/pause` creates pause signal, returns status
  - [ ] POST `/api/loop/resume` removes pause signal
  - [ ] POST `/api/loop/skip/:taskId` creates skip signal
  - [ ] POST `/api/loop/start` spawns ralph.sh with epic ID
- **Testing Criteria:**
  - API route tests with mock file system

##### Task 4.3: Create Control Panel UI

- **Objective:** Build control panel component for epic detail view
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/components/LoopControlPanel.tsx` (new)
  - `apps/ralph-monitoring/app/routes/epics.$epicId.tsx`
- **Dependencies:** Task 4.2
- **Acceptance Criteria:**
  - [ ] Shows current loop status (running/paused/stopped)
  - [ ] Start button (if not running)
  - [ ] Pause/Resume toggle (if running)
  - [ ] Skip button per task (if in_progress)
  - [ ] Confirmation dialogs for destructive actions
- **Testing Criteria:**
  - Component test for all button states
  - Storybook stories

---

### Implementation Guidance

**From `apps/ralph-monitoring/AGENTS.md`:**
- Framework: React Router v7 with file-based routing
- UI: React 19, Tailwind CSS v4, shadcn/ui
- Testing: Vitest, @testing-library/react
- Types auto-generated in `./+types/[routeName]`

**From `apps/ralph-monitoring/docs/design-language.md`:**
- Use semantic tokens: `bg-background`, `border-border`, `text-muted-foreground`
- Control heights: compact (32px), default (36px), comfortable (40px)
- Spacing scale: 4px base (space-1 = 4px, space-2 = 8px, etc.)

**Coding patterns:**
- Loaders fetch data, components render
- Use `useFetcher` for mutations
- SSE for real-time updates (existing pattern in `api.logs.$taskId.stream.ts`)

---

## Risks & Open Questions

| Item | Type | Owner | Mitigation / Next Step | Due |
|------|------|-------|------------------------|-----|
| Ralph IPC complexity | Risk | Jake | Start with file signals, upgrade to WebSocket if needed | Phase 4 |
| Tremor + React 19 compatibility | Risk | Dev | Test early in Phase 2 | Task 2.3 |
| Large epic performance | Risk | Dev | Add pagination/virtualization if >100 tasks | Phase 2 |
| Concurrent loop handling | Question | Jake | Defer to future; single-loop focus initially | Future |
| Timeline library choice | Question | Dev | Start custom SVG, evaluate Visx if complex | Task 3.1 |

---

## Progress Tracking

Refer to the AGENTS.md file in the task directory for instructions on tracking and reporting progress during implementation.

---

## Appendices & References

- **Research:** `research/2026-01-30_dashboard-architecture-research.md`
- **App location:** `apps/ralph-monitoring/`
- **Design system:** `apps/ralph-monitoring/docs/design-language.md`
- **Ralph tools:** `.devagent/plugins/ralph/tools/`
