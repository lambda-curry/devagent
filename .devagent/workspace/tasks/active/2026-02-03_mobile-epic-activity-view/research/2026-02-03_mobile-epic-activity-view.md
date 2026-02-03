# Research: Mobile Epic Activity View (Ralph Monitoring)

## Classification & Assumptions
- Classification: Implementation design
- Assumptions:
  - [INFERRED] Use existing Beads DB (issues/comments + ralph_execution_log) as the primary data source for epic activity.
  - [INFERRED] The mobile view should be additive to the current `/epics` and `/epics/:epicId` routes, not a separate app.
  - [INFERRED] A PR link can be stored in epic metadata (Ralph run file) rather than inferred at runtime if GitHub API access is unavailable.
  - [NEEDS CLARIFICATION] Should epic views be project-scoped (multi-project) or remain single-project default DB?

## Research Plan (Validation Targets)
1. Confirm current epic list/detail UI and data sources.
2. Identify where “recent actions” and commit metadata can be sourced (execution logs, comments).
3. Confirm existing real-time log UX (API + LogViewer) and how to surface it at epic level.
4. Identify existing PR metadata (run file) and options to resolve PR for commit via GitHub API/CLI (confirm endpoint later if needed).
5. Note constraints from design system and existing UI patterns for mobile-friendly layout.

## Sources
- `.devagent/workspace/product/mission.md` (mission context) — 2026-02-03.
- `.devagent/workspace/memory/constitution.md` (traceable artifacts, human-in-loop) — 2026-02-03.
- `apps/ralph-monitoring/app/routes/epics._index.tsx` (epic list route) — 2026-02-03.
- `apps/ralph-monitoring/app/routes/epics.$epicId.tsx` (epic detail route w/ timeline + polling) — 2026-02-03.
- `apps/ralph-monitoring/app/components/EpicProgress.tsx` (epic summary + tasks list) — 2026-02-03.
- `apps/ralph-monitoring/app/components/AgentTimeline.tsx` (agent timeline visual) — 2026-02-03.
- `apps/ralph-monitoring/app/db/beads.server.ts` (getEpics/getTasksByEpicId/getExecutionLogs/getTaskCommentsDirect) — 2026-02-03.
- `apps/ralph-monitoring/app/components/Comments.tsx` + `apps/ralph-monitoring/app/components/__tests__/Comments.test.tsx` (commit comment format) — 2026-02-03.
- `apps/ralph-monitoring/app/components/LogViewer.tsx` + `apps/ralph-monitoring/app/routes/api.logs.$taskId.ts` (logs API + streaming) — 2026-02-03.
- `.devagent/plugins/ralph/runs/ralph-monitoring-dashboard-2026-01-30.json` (epic `pr_url` in run file) — 2026-02-03.

## Findings & Tradeoffs
1. **Epic list/detail already exist but lack “activity + commit + PR” views.**
   - `/epics` lists epics with status/progress; `/epics/:epicId` shows progress, tasks, and timeline with 5s polling. No activity feed, commit history, PR link, or log access at epic level. (`epics._index.tsx`, `epics.$epicId.tsx`, `EpicProgress.tsx`, `AgentTimeline.tsx`)
2. **Execution logs are available but only as “timeline blocks.”**
   - `getExecutionLogs(epicId)` returns ralph_execution_log rows (task_id, agent_type, started_at, ended_at, status, iteration). These give recency and status but do not include human-readable action/commit text. (`beads.server.ts`, `AgentTimeline.tsx`)
3. **Commit metadata appears in comments, not structured tables.**
   - Comments render markdown and tests include “Commit: <sha> - <message>” format, indicating commit entries are posted as Beads comments. This can be parsed for a commit feed but depends on consistent formatting. (`Comments.tsx`, `Comments.test.tsx`, `beads.server.ts`)
4. **Real-time logs are per-task and already robust.**
   - Logs load via `/api/logs/:taskId` and SSE at `/api/logs/:taskId/stream`, with retries and diagnostics. This can be embedded in an epic view by selecting the active task or linking to its detail page. (`LogViewer.tsx`, `api.logs.$taskId.ts`)
5. **PR URL is already stored in some run files (epic metadata), but not first-class.**
   - Example run file includes `epic.pr_url`, which could be surfaced as the quick PR link. This is simple and avoids API calls but relies on the setup agent consistently writing `pr_url` to run files. (`ralph-monitoring-dashboard-2026-01-30.json`)
6. **Commit → PR resolution is possible but adds complexity.**
   - GitHub’s API/CLI can likely map a commit SHA to associated PRs, but it requires repo metadata, auth, and network access. This is a good fallback but increases setup complexity vs. storing `pr_url` in epic metadata. (Endpoint confirmation needed if pursued.)

## Recommendation
**Build a mobile-optimized “Epic Activity” surface as an additive section to `/epics/:epicId`,** with:
- **Recent activity feed** combining:
  - Latest execution logs (run start/end/status),
  - Most recent comments (commit entries + revision learnings),
  - Task status changes via `updated_at` or inferred from recent comments.
- **Commit history block** sourced from parsed comment entries with “Commit: <sha> - <message>”. Provide GitHub links using repo metadata (config) or explicit URL fields.
- **PR quick link** using `epic.pr_url` from the run file; add a small fallback UI for “link PR” if missing.
- **Realtime logs panel** driven by a “current/active task” selector; embed `LogViewer` or link to task detail.

This keeps the solution inside the existing data model while offering a clean mobile-friendly experience.

## Repo Next Steps (Checklist)
- [ ] Decide whether epics should be project-scoped (`/projects/:projectId/epics`) or stay single-project.
- [ ] Define an “Activity” DTO derived from execution logs + comments + task updates.
- [ ] Parse commit comments into structured items (sha, message, timestamp).
- [ ] Surface `epic.pr_url` from run files in the epic detail loader; add UI link.
- [ ] Add an epic-level log panel with “current task” selection (prefers `in_progress`).
- [ ] Add a mobile-friendly layout mode for epic detail (stacked cards, compress filters, minimal chrome).

## Risks & Open Questions
- **Multi-project scope:** current epics routes are not project-aware; deciding project scoping changes routing and DB access patterns.
- **Commit parsing reliability:** comment format must be consistent; otherwise we need a structured metadata store.
- **PR discovery:** GitHub API lookup adds auth + rate limit complexity; storing `pr_url` in epic metadata is simpler but requires process discipline.
- **Repo URL source:** we need a canonical GitHub repo URL for commit/PR links (project config or env). Where should it live?
