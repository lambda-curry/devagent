# Ralph Monitoring Dashboard Enhancement Research

**Date:** 2026-01-30
**Classification:** Implementation Design
**Task:** 2026-01-30_ralph-monitoring-dashboard-enhancements

## Research Plan

1. Analyze existing ralph-monitoring architecture and data flow
2. Identify data available from Ralph execution for dashboards
3. Evaluate timeline/chart library options for React 19
4. Determine integration points for loop control

## Sources

- `apps/ralph-monitoring/` - Existing app codebase
- `apps/ralph-monitoring/AGENTS.md` - App context documentation
- `apps/ralph-monitoring/app/db/beads.server.ts` - Database layer
- `.devagent/plugins/ralph/tools/ralph.ts` - Ralph execution engine
- `.devagent/plugins/ralph/tools/config.json` - Ralph configuration

## Findings

### 1. Current Architecture

**Stack:**
- React Router v7 (file-based routing)
- React 19, Tailwind CSS v4, shadcn/ui components
- better-sqlite3 for Beads database access
- Vitest for testing

**Routes:**
| Route | Purpose |
|-------|---------|
| `_index.tsx` | Task list with filters (status, search, epics/tasks toggle) |
| `tasks.$taskId.tsx` | Task detail with logs, comments, stop action |
| `api.logs.$taskId.stream.ts` | SSE log streaming |
| `api.logs.$taskId.ts` | Static log fetch |
| `api.tasks.$taskId.comments.ts` | Async comments fetch |
| `api.tasks.$taskId.stop.ts` | Task stop action |

**Data Sources:**
1. **Beads SQLite DB** (`.beads/beads.db`) - Tasks, comments, dependencies
2. **Ralph execution metadata** (`ralph_execution_metadata` table) - Failure counts, timestamps, execution counts
3. **Log files** (`logs/ralph/<task-id>.log`) - Agent output

### 2. Data Available for Dashboards

**From Beads DB (`issues` table):**
- `id`, `title`, `description`, `status`, `priority`, `labels`
- `created_at`, `updated_at`
- Hierarchical IDs (e.g., `epic-name.1`, `epic-name.2`) → parent/child relationships

**From `ralph_execution_metadata` table:**
- `failure_count`, `execution_count`
- `last_failure_at`, `last_success_at`

**Currently NOT tracked (gaps for new features):**
- ❌ Task start/end timestamps (for duration)
- ❌ Agent type per execution
- ❌ Execution timing breakdown
- ❌ Loop-level metadata (which epic is running, iteration count)

### 3. Integration Points for New Features

**Feature 1: Epic Progress Dashboard**
- Data: Query tasks by parent_id (epic), aggregate status counts
- New data needed: Task duration (start_at/end_at in metadata table)
- Route: New `/epics` or `/epics.$epicId` route

**Feature 2: Loop Control Panel**
- Current: Can stop individual tasks via `api.tasks.$taskId.stop.ts`
- Needed: Start loop, pause loop, skip task, retry task
- Implementation: IPC or file-based signals to `ralph.ts`
- Options:
  1. **WebSocket server** in ralph.ts for bidirectional control
  2. **Signal files** (e.g., `.ralph_pause`, `.ralph_skip_<taskId>`)
  3. **SQLite table** for control commands (poll-based)

**Feature 3: Agent Activity Timeline**
- Data needed: Execution log with timestamps per agent
- Schema addition: `ralph_execution_log` table
  ```sql
  CREATE TABLE ralph_execution_log (
    id INTEGER PRIMARY KEY,
    task_id TEXT,
    agent_type TEXT,
    started_at DATETIME,
    ended_at DATETIME,
    status TEXT, -- success, failed, skipped
    iteration INTEGER
  );
  ```

### 4. Chart/Timeline Library Evaluation

| Library | Pros | Cons | Recommendation |
|---------|------|------|----------------|
| **Recharts** | Popular, React-native, good docs | Large bundle, some React 19 issues reported | ⚠️ Maybe |
| **Visx** | Low-level, flexible, from Airbnb | Steeper learning curve | ✅ Good for timeline |
| **Nivo** | Beautiful defaults, React-focused | Heavy bundle | ❌ Too heavy |
| **Custom SVG** | Full control, no deps | More work | ✅ For simple timeline |
| **Tremor** | Tailwind-native, nice defaults | Opinionated | ✅ Good for dashboards |

**Recommendation:** Use **Tremor** for progress bars/metrics (Tailwind-compatible), **custom SVG** or **Visx** for the timeline view.

### 5. Real-time Updates Strategy

**Current:** SSE for log streaming per task
**Needed:** Real-time updates for:
- Epic progress (tasks completing)
- Loop status (running/paused/stopped)
- Timeline updates

**Options:**
1. **Polling** - Simple, works with current architecture (5-10s interval)
2. **SSE broadcast** - Add a global SSE endpoint for loop status
3. **WebSocket** - More complex but bidirectional (needed for control panel)

**Recommendation:** Start with **polling** for progress, add **WebSocket** when implementing control panel.

## Recommendations

### Phase 1: Data Foundation
1. Add `ralph_execution_log` table for timing data
2. Update `ralph.ts` to log execution start/end with agent type
3. Add duration calculation to existing task queries

### Phase 2: Epic Progress Dashboard
1. Create `/epics` route with epic list + progress bars
2. Create `/epics.$epicId` route with detailed breakdown
3. Use Tremor for progress visualization

### Phase 3: Agent Activity Timeline
1. Create timeline component using Visx or custom SVG
2. Add to epic detail view
3. Implement filtering by agent/time range

### Phase 4: Loop Control Panel
1. Add WebSocket server to ralph.ts
2. Create control API routes (start, pause, skip, retry)
3. Build control panel UI component

## Repo Next Steps

- [ ] Create schema migration for `ralph_execution_log` table
- [ ] Update ralph.ts to log execution events
- [ ] Create Tremor-based progress components
- [ ] Design epic routes and loaders

## Risks & Open Questions

1. **Risk:** Ralph runs as separate process - IPC complexity for control panel
   - Mitigation: Start with file-based signals, upgrade to WebSocket later

2. **Risk:** Performance with large task counts
   - Mitigation: Add pagination, lazy loading, and query optimization

3. **Open Question:** Should timeline show all historical runs or just current?
   - Suggest: Current run by default, with history toggle

4. **Open Question:** How to handle multiple concurrent loops?
   - Suggest: Single-loop focus initially, multi-loop as future enhancement
