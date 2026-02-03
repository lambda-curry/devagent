# Multi-Project Support Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-31
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/active/2026-01-30_multi-project-support/`
- Stakeholders: Jake Ruesink (Owner, DRI)
- Notes: Plan derived from research at `research/2026-01-31_multi-project-support-research.md`.

---

## PART 1: PRODUCT CONTEXT

### Summary

The Ralph monitoring app currently assumes a single Beads database path. Users need to monitor multiple codebases or Beads instances from one interface. This plan adds project registration (add/remove project paths), project switching (focus on one project), a combined view (see all projects’ tasks together), and clear project attribution on task cards so each item’s origin is obvious.

### Context & Problem

- **Current state:** `apps/ralph-monitoring/app/db/beads.server.ts` resolves one DB path via `BEADS_DB` or `.beads/beads.db` relative to `REPO_ROOT`/cwd. All loaders call `getAllTasks(filters)` or `getTaskById(id)` with no project context. There is no UI to add projects, switch between them, or view tasks from multiple projects.
- **User pain:** Teams running Ralph against multiple repos or Beads instances must run multiple app instances or switch env vars; there is no single pane of glass.
- **Business trigger:** PR #91 (feat/multi-project-support); product roadmap and guiding questions reference cross-project visibility and Beads multi-repo flow.

### Objectives & Success Metrics

- **Product:** Users can register multiple project paths, switch between a single project and a combined view, and see which project each task belongs to.
- **Experience:** Task list and detail work for both “single project” and “all projects” modes; URLs are bookmarkable (e.g. project in path or query).
- **Technical:** Beads data layer supports “DB by path” and request-scoped project; no breaking change to existing single-DB usage when one project is configured.

### Users & Insights

- **Target users:** Developers and leads who run Ralph against more than one repo or Beads instance and want one monitoring UI.
- **Insight:** Single-DB assumption is documented in beads.server and routes; guiding questions ask how Beads multi-repo/`BEADS_DIR` should behave.

### Solution Principles

- **Project = one Beads DB path:** A registered project is a path to a Beads DB (e.g. `path/.beads/beads.db`) plus optional display label.
- **Config file for registration:** Persist project list (paths + labels) in a config file (path via env or convention); no DB schema for project list in first iteration.
- **URL reflects project:** Active project (single-project mode) or “combined” is reflected in URL so state is bookmarkable and back/forward work.
- **Attribution on every task in combined view:** Every task in combined view carries a project identifier; cards and detail show which project it belongs to.
- **Backward compatible:** When only one project is configured (or BEADS_DB/REPO_ROOT used), behavior matches current single-DB app.

### Scope Definition

- **In Scope:** Project list config (schema + file location), add/remove projects via UI and/or env; project switcher UI; single-project and combined view; project attribution on cards and detail; refactor beads.server to “DB by path” and project-scoped loaders/APIs.
- **Out of Scope / Future:** Cross-project search/analytics, project-level permissions, syncing project list across devices (future config sync).

### Functional Narrative

#### Flow: Register a project

- **Trigger:** User adds a project (e.g. path to repo or explicit DB path).
- **Experience:** App appends to project list (config file); validates path (DB exists); optional label; list is persisted and available in switcher.
- **Acceptance criteria:** New project appears in project list; invalid path shows clear error; config file is updated.

#### Flow: Switch project (single-project view)

- **Trigger:** User selects a project from switcher (or lands on URL with project id).
- **Experience:** Task list and all downstream views (task detail, logs, comments) show only that project’s data; URL reflects selected project (e.g. `/projects/:projectId` or `?project=id`).
- **Acceptance criteria:** Switching project updates task list and detail; deep link to `/projects/:projectId/tasks/:taskId` loads correct project and task.

#### Flow: Combined view

- **Trigger:** User selects “All projects” (or equivalent).
- **Experience:** Task list shows tasks from all registered projects; each task shows project attribution (label/badge); sorting/filtering apply across merged list; task detail and logs/comments resolve project from task’s project id.
- **Acceptance criteria:** No duplicate key issues (composite key projectId + taskId); attribution visible on every card; detail view and APIs use correct project DB.

#### Flow: Project attribution on cards

- **Trigger:** Viewing task list (single or combined).
- **Experience:** In single-project view, optional small project label; in combined view, each card shows project label/badge so origin is clear at a glance.
- **Acceptance criteria:** User can distinguish which project each task belongs to without opening the task.

### Technical Notes & Dependencies

- **Config file:** Define schema (e.g. `{ projects: [{ id, path, label? }], defaultId? }`); location via `RALPH_PROJECTS_FILE` or default under app/user config; read at loader/request time or cached with invalidation.
- **beads.server:** Refactor from single global `db` to “get DB by path” (or by project id → path); cache connections by path; keep readonly. All existing exports that today use `getDatabase()` must accept optional project/path and resolve path from config when in multi-project mode.
- **Routes:** Introduce project into routing—e.g. `/projects/:projectId` (index and task list) and `/projects/:projectId/tasks/:taskId` (detail); or root with `?project=id` and combined with `?view=all`. APIs (logs, comments, stop) must receive project context (param or header) and use correct DB.
- **Task identity:** In combined view, task id alone is not unique; use `(projectId, taskId)` for routing and API calls.

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions

- **Scope focus:** Ralph monitoring app (apps/ralph-monitoring): config schema, beads.server refactor, route/loader/API project context, project switcher UI, combined view, attribution on cards.
- **Key assumptions:** Config file is sufficient for project list; one “default” or “first” project when none selected; combined view merges in-memory (no new DB).
- **Out of scope:** Beads CLI multi-repo changes; Ralph backend scaling for very large project counts (optimize later if needed).

### Implementation Tasks

#### Task 1: Project config schema and loader

- **Objective:** Define project list schema and file location; add server-side loader to read and validate project list; support env override for config path.
- **Impacted Modules/Files:** New: `apps/ralph-monitoring/app/lib/projects.server.ts` (or `app/config/projects.server.ts`). Possibly `apps/ralph-monitoring/app/root.tsx` or a root loader if project list is needed globally. Docs: README or `docs/` for `RALPH_PROJECTS_FILE`.
- **References:** Research: `research/2026-01-31_multi-project-support-research.md` (config file recommendation).
- **Dependencies:** None (first step).
- **Acceptance Criteria:** Schema supports `id`, `path`, `label`; optional `defaultId`; config file path from env or default; function to get project list and get path by project id; validation that path exists and is readable DB.
- **Testing Criteria:** Unit tests for parsing config, resolving path by id, handling missing/invalid file.
- **Validation Plan:** Vitest tests; manual check with sample config file.

#### Task 2: Beads server refactor — DB by path

- **Objective:** Refactor beads.server so that all data access can use a “project path” or “project id” instead of a single global DB. Keep backward compatibility when single project or BEADS_DB is used.
- **Impacted Modules/Files:** `apps/ralph-monitoring/app/db/beads.server.ts` (getDatabasePath → getDatabasePathForProject or getDatabase(path); optional projectId param in getAllTasks, getTaskById, comments, etc.). Call sites in routes and API routes (to be updated in Task 3).
- **References:** Current implementation: `getDatabasePath()`, `getDatabase()`; research: DB-by-path and caching.
- **Dependencies:** Task 1 (project config) so path can be resolved from project id.
- **Acceptance Criteria:** Beads.server exports support “get DB for path” and “get path for project id”; getAllTasks/getTaskById (and comment/log helpers) accept optional project id or path; single global DB behavior preserved when one project or BEADS_DB set.
- **Testing Criteria:** Existing beads.server tests updated; new tests for multi-path (two DBs, query by project).
- **Validation Plan:** Vitest; existing integration tests still pass with single project.

#### Task 3: Route and API project context

- **Objective:** Add project to URL structure and loaders; pass project id into all beads.server and log/comment API calls; support “combined” view mode in index loader.
- **Impacted Modules/Files:** `apps/ralph-monitoring/app/routes.ts` (e.g. `/projects/:projectId`, `/projects/:projectId/tasks/:taskId`, or query-based). `app/routes/_index.tsx`, `app/routes/tasks.$taskId.tsx`, `app/routes/api.logs.$taskId.ts`, `app/routes/api.logs.$taskId.stream.ts`, `app/routes/api.tasks.$taskId.comments.ts`, `app/routes/api.tasks.$taskId.stop.ts`. Root loader or layout if project list is needed for switcher.
- **References:** React Router v7 route params; research: URL reflects project, composite key (projectId, taskId).
- **Dependencies:** Task 1, Task 2.
- **Acceptance Criteria:** Index and task detail loaders receive project id (param or query) or “combined”; they call beads.server with correct project/path; API routes for logs/comments/stop receive project id and use correct DB; combined view loader aggregates tasks from all projects with project id attached.
- **Testing Criteria:** Loader tests with mock project config; combined view returns tasks from multiple projects with project id on each.
- **Validation Plan:** Vitest; manual navigation with multiple projects.

#### Task 4: Project switcher and registration UI

- **Objective:** UI to view project list, switch active project, and add/remove projects (with validation); persist changes to config file or show instructions if file is read-only.
- **Impacted Modules/Files:** `apps/ralph-monitoring/app/components/` (e.g. ProjectSwitcher, ProjectList, AddProjectForm). `app/routes/_index.tsx` or layout to host switcher; possibly `app/routes/settings.projects.tsx` or similar for add/remove. UI components: Select/dropdown or tabs for switcher; form for add project (path + label).
- **References:** DESIGN_LANGUAGE.md; existing Select/Button/Input patterns in app.
- **Dependencies:** Task 1, Task 3 (route/params so switcher can set project in URL).
- **Acceptance Criteria:** User can see current project and list of projects; selecting a project updates URL and task list; user can add project (path + optional label) and remove project; invalid path shows error; default project used when none selected.
- **Testing Criteria:** Component tests for switcher and add form (with mock project list); integration test for “select project updates list.”
- **Validation Plan:** Vitest; Storybook optional; manual E2E.

#### Task 5: Combined view and project attribution on cards

- **Objective:** Implement “All projects” view (merged task list with project id on each task) and show project attribution on every task card; ensure task detail and logs/comments use task’s project id.
- **Impacted Modules/Files:** `apps/ralph-monitoring/app/routes/_index.tsx` (combined view branch in loader; pass project id to card). `app/components/` (task card component: add badge/label for project; may need TaskCard receive projectId/label). `app/routes/tasks.$taskId.tsx` (detail page shows project context; link back to list includes project or “all”). Card/list components that render task title and metadata.
- **References:** Research: attribution on cards; composite key for detail links.
- **Dependencies:** Task 2, Task 3, Task 4.
- **Acceptance Criteria:** Combined view shows tasks from all projects with no key collision; each card displays project label/badge; clicking a task in combined view goes to detail with correct project so logs/comments load from correct DB; single-project view can show optional project label.
- **Testing Criteria:** Combined view loader returns merged tasks with project id; card component renders project badge; detail link uses projectId + taskId.
- **Validation Plan:** Vitest; manual check with 2+ projects.

### Implementation Guidance

- **From `.devagent/core/AGENTS.md` → Standard Workflow Instructions:** Use `date +%Y-%m-%d` for dated artifacts; store task-scoped artifacts under `.devagent/workspace/tasks/active/2026-01-30_multi-project-support/`.
- **From workspace rules (React Router v7):** Use `./+types/[routeName]` for route types; `href()` for type-safe URLs; loaders/actions use `Route.LoaderArgs`/`Route.ActionArgs`; throw `data()` for expected errors.
- **From workspace rules (testing):** Vitest and @testing-library/react; prefer `createRoutesStub` and route-level tests; mock beads.server where appropriate; test loader with project param and combined view.
- **From `apps/ralph-monitoring/app/db/beads.server.ts`:** Current DB path logic and readonly usage; preserve normalization and hierarchical id helpers when refactoring.

### Risks & Open Questions

| Item | Type | Owner | Mitigation / Next Step | Due |
|------|------|--------|------------------------|-----|
| Config file path differs by environment | Risk | Dev | Define env `RALPH_PROJECTS_FILE` and default (e.g. cwd or app dir); document in README. | With Task 1 |
| Many projects slow combined view | Risk | Dev | Limit or paginate combined view if needed; measure with 5–10 projects. | Post-MVP |
| Default project required? | Question | Product | Use first in list or explicit defaultId; document. | Task 1 |
| Write path for add/remove project (server vs client) | Risk | Dev | If config is on server, need API to update file or document manual edit; if client-only (e.g. localStorage), scope to browser. Research recommends config file—implement read in server; write via API or doc. | Task 4 |

---

## Progress Tracking

Refer to the AGENTS.md file in the task directory for instructions on tracking and reporting progress during implementation.

---

## Appendices & References

- **Research:** `.devagent/workspace/tasks/active/2026-01-30_multi-project-support/research/2026-01-31_multi-project-support-research.md`
- **Task hub:** `.devagent/workspace/tasks/active/2026-01-30_multi-project-support/AGENTS.md`
- **Agent documentation:** `AGENTS.md` (root), `.devagent/core/AGENTS.md`
- **Cursor rules:** `.cursorrules`, `.cursor/rules/*.mdc` (React Router v7, error handling, testing)
- **App entry points:** `apps/ralph-monitoring/app/routes.ts`, `apps/ralph-monitoring/app/db/beads.server.ts`, `apps/ralph-monitoring/app/routes/_index.tsx`
