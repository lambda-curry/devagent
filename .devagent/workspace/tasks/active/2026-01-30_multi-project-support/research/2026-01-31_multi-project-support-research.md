# Multi-Project Support Research

- **Classification:** Implementation design
- **Task:** 2026-01-30_multi-project-support (PR #91)
- **Date:** 2026-01-31

## Inferred Problem Statement

The Ralph monitoring app currently assumes a single Beads database path (via `BEADS_DB` or `.beads/beads.db` relative to repo root). Users need to monitor multiple codebases or Beads instances from one interface, with: (1) project registration, (2) project switching, (3) a combined view across projects, and (4) clear project attribution on task cards.

**Assumptions [INFERRED]:**
- "Project" = one Beads DB path (filesystem path to a `.beads/beads.db` or equivalent).
- Combined view = aggregated task list from multiple DBs with disambiguation.
- No requirement to run multiple Ralph instances; single app serves multiple project paths.

## Research Plan (What Was Validated)

1. **Current state:** How the app resolves DB path and where single-DB assumptions live.
2. **Persistence:** Where to store registered project paths (config file vs localStorage vs app DB).
3. **Switching semantics:** How "active project" or "view mode" (single vs combined) should drive loaders and UI.
4. **Combined view:** How to aggregate tasks from multiple DBs without ID collisions; attribution requirements.
5. **Attribution:** What metadata to show on cards (project label, path snippet, color/icon).

## Sources

### Internal (project)

- `apps/ralph-monitoring/app/db/beads.server.ts` — `getDatabasePath()`, `getDatabase()`, single global `db`; `BEADS_DB`, `REPO_ROOT`; no project parameter in API.
- `apps/ralph-monitoring/app/routes/_index.tsx` — loader calls `getAllTasks(filters)` with no project context.
- `apps/ralph-monitoring/app/routes/tasks.$taskId.tsx` — loader calls `getTaskById(id)` with no project context.
- `.devagent/workspace/tasks/active/2026-01-30_multi-project-support/AGENTS.md` — requirements: registration, switching, combined view, attribution.
- `.devagent/workspace/product/guiding-questions.md` — open question on Beads multi-repo / `BEADS_DIR` semantics.
- `.devagent/workspace/memory/tech-stack.md` — "Cross-project memory" as future roadmap; no current multi-DB design.

### External (patterns)

- **Multi-workspace / project switching:** Common pattern: persisted list of "workspaces" (paths or configs), active selection in URL or session, UI switcher (dropdown/tabs). No single standard; app-specific.
- **Combined views:** Aggregate queries across sources; require a stable "source" or "project" identifier per item to avoid collision (e.g., task ID alone can repeat across DBs; key becomes `(projectId, taskId)` or namespaced display ID).
- **Persistence:** Config file (e.g. `ralph-projects.json` in app or user dir) is portable and editable; localStorage is browser-only and per-origin; DB adds schema but fits if app already has server-side state. For a monitoring app that may run against local filesystem paths, a **config file** or **env + config** is often preferred so paths survive restarts and can be shared/versioned.

## Findings & Tradeoffs

### Current state

- **Single DB path:** `getDatabasePath()` returns one path from `BEADS_DB` or `join(repoRoot, '.beads', 'beads.db')`. `getDatabase()` opens one connection and caches it in a module-level `db`.
- **No project in API:** `getAllTasks(filters)`, `getTaskById(id)`, comments, logs all assume that single DB. No parameter for "which project" or "which DB path."
- **Routes:** Index and task detail loaders do not receive or pass project context; URL has no project segment.

### Persistence options

| Option | Pros | Cons |
|--------|------|------|
| **Config file** (e.g. `projects.json` or in app config dir) | Portable, editable, can be versioned; works for CLI/server usage | Need to define path (cwd, env, app dir) and schema |
| **localStorage** | No server change; quick to implement for "current project" | Browser-only; not suitable if app is used across machines or by scripts |
| **App-owned SQLite/DB** | Single source of truth; can store project metadata | New schema and migration; may be overkill for "list of paths + labels" |

**Recommendation:** Config file for **project list** (paths + optional labels). Optional **default/primary** project in same config or derived (e.g. first in list). For "last selected" project or view mode, URL query/session or localStorage is sufficient if UX is browser-only.

### Switching and combined view

- **Switching:** Introduce a notion of "active project" (one selected path) when in single-project mode. All loaders that today call beads.server use that path (or a request-scoped project key derived from URL/query/session). Alternative: project in path (e.g. `/projects/:projectId/tasks`) for bookmarkability.
- **Combined view:** When "view = combined," loaders query all registered DB paths (or a subset), merge task lists, and attach a **project identifier** to each task (e.g. `projectId` or `projectPath`). Task IDs are only unique per DB, so display/keys must be `(projectId, taskId)` to avoid collisions. Filtering and sorting can remain; attribution column/badge shows project.
- **Conflict handling:** No semantic "conflict" between projects—each DB is independent. Overlapping task IDs across projects are disambiguated by project attribution; no merge of records.

### Attribution on cards

- **Minimum:** Project label (user-defined or derived from path, e.g. basename of parent dir).
- **Optional:** Path snippet (e.g. truncated path), icon/color per project for quick scan.
- **Technical:** Every task in combined view must carry `projectId` (or equivalent) so detail view and logs open the correct project context.

## Recommendation

1. **Project registration:** Persist a list of projects (path + optional label) in a **config file** (path TBD: e.g. `RALPH_PROJECTS_FILE` or under app/user config). Allow add/remove via UI and/or env.
2. **Default/primary:** Support a "default" project (e.g. first in list or explicit `default: true`). Use it when no project is selected (e.g. first visit).
3. **Project switching:** Represent active project in URL (e.g. `/projects/:projectId` or `?project=id`) so state is bookmarkable. Loaders accept project id and resolve path from config; beads.server (or a wrapper) must support "get DB for path X" instead of a single global path.
4. **Combined view:** Add a view mode (e.g. "All projects" in nav or toggle). When active, loaders open each registered DB, run existing task queries, attach project id to each row, merge and sort. Use composite key `(projectId, taskId)` for routing and deduplication.
5. **Attribution:** Add `projectId` (and display label) to task payloads in combined view; on cards show a badge or label. On task detail, show project context and ensure log/comment APIs receive project so they hit the correct DB.
6. **beads.server evolution:** Refactor from "single global DB" to "get DB by path" (or get read-only connection by project id). Cache connections by path if needed; respect readonly. All existing `getAllTasks`/`getTaskById` call sites eventually take an optional project context (or active project from request).

## Repo Next Steps

- [ ] Define config file schema and location for project list (paths + labels).
- [ ] Refactor `beads.server` to support "database by path" and optional project-scoped APIs.
- [ ] Add project resolution in loaders (from URL/query + config).
- [ ] Implement project switcher UI and combined-view mode.
- [ ] Add project attribution to task cards and detail view; ensure logs/comments use correct project.

## Risks & Open Questions

| Item | Type | Mitigation / Next Step |
|------|------|-------------------------|
| Config file path differs by deployment (dev vs prod, CLI vs server) | Risk | Define convention (env `RALPH_PROJECTS_FILE`, fallback to cwd or app dir); document in README. |
| Many registered projects → combined view slow or heavy | Risk | Limit combined view to N projects or lazy-load; add pagination if needed. |
| Should "default" project be required? | Question | Recommend: yes, with fallback to first in list if not set. |
| Task detail URL in combined view: include projectId? | Question | Yes—use e.g. `/projects/:projectId/tasks/:taskId` so deep links and back navigation preserve context. |
