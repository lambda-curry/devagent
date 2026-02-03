# Epic Revise Report — Multi-Project Support

**Date:** 2026-01-31  
**Epic ID:** devagent-multi-project-support  
**Status:** open (6/8 child tasks closed; 1 in_progress, 1 open)

## Executive Summary

The Multi-Project Support epic delivered project config schema, Beads DB-by-path refactor, project-scoped routes and API, project switcher and registration UI, combined view with project attribution on cards, and QA verification. Six implementation and QA tasks are closed with full traceability; one task (Setup & PR Finalization) remains open. Quality gates (lint, typecheck, test) passed on all closed tasks. Revision learnings focus on process (research/plan path clarity, action return types, E2E strategy), architecture (DB path semantics, route-structure test strategy), and rules (task description file paths). No Critical or High priority issues; recommendations are Low–Medium for documentation, workflow, and test coverage improvements.

## Traceability Matrix

| Task ID | Title | Status | Commit |
| :--- | :--- | :--- | :--- |
| devagent-multi-project-support.1 | Project config schema and loader | closed | `131dea8e` — feat(ralph-monitoring): project list schema and server loader |
| devagent-multi-project-support.2 | Beads server refactor — DB by path | closed | `c43d05e7` — refactor(beads): DB by path and optional project context |
| devagent-multi-project-support.3 | Route and API project context | closed | `f5217a03` — feat(routes): add project to URL and loaders; combined view |
| devagent-multi-project-support.4 | Project switcher and registration UI | closed | `d21a8af7` — feat(ralph-monitoring): project switcher and registration UI |
| devagent-multi-project-support.5 | Combined view and project attribution on cards | closed | `5b34169e` — feat(ralph-monitoring): combined view project attribution and task detail context |
| devagent-multi-project-support.6 | QA: Multi-project support verification | closed | `b773de72` — test(ralph-monitoring): add loadProjectsConfig invalid JSON case |
| devagent-multi-project-support.7 | Generate Epic Revise Report | in_progress | *Pending* |
| devagent-multi-project-support.setup-pr | Run Setup & PR Finalization | open | *N/A* |

## Evidence & Screenshots

- **Screenshot directory:** No epic- or task-level screenshot directories were created for this epic.
- **Screenshots captured:** 0 (QA verification was test-suite only; no browser/agent-browser run).
- **Key screenshots:** None. QA task (devagent-multi-project-support.6) documented verification via existing unit/route tests only.

## Improvement Recommendations

### Documentation

- [ ] **[Low]** Clarify research/plan path semantics in task templates — When tasks reference `research/<name>` or `plan/<name>`, specify whether paths are repo-relative or task-folder-relative, or link the full path in the task description. *Source: devagent-multi-project-support.1*

### Process

- [ ] **[Low]** Research/plan path in task descriptions — When creating Beads tasks for epics with research/plan docs, use full paths (e.g. `.devagent/workspace/tasks/active/YYYY-MM-DD_slug/research/...`) or document convention in AGENTS/task template. *Source: devagent-multi-project-support.1*
- [ ] **[Low]** Action return types for fetcher consumers — When returning error payloads from route actions, use a discriminated union (e.g. `{ ok: true; id?: string } | { ok: false; error: string }`) and export it so fetcher consumers get correct inference without `'error' in data` casts. *Source: devagent-multi-project-support.4* | *Files: apps/ralph-monitoring/app/routes/settings.projects.tsx*
- [ ] **[Low]** E2E step for UI-heavy QA tasks — For tasks labeled `e2e` and `qa`, consider a dedicated E2E step (e.g. agent-browser or Playwright against a running dev server) to cover integration flows (root redirect → project layout → switcher → task detail) that unit tests may not cover. *Source: devagent-multi-project-support.6*

### Rules & Standards

- [ ] **[Low]** Align "Impacted Modules/Files" with current route layout — When task descriptions list impacted files, use current route file names (e.g. `projects.$projectId._index.tsx`, `projects.$projectId.tasks.$taskId.tsx`) or note "see plan for actual route file names" so agents don’t look at legacy redirect-only routes. *Source: devagent-multi-project-support.5* | *Files/Rules: Beads task description templates; epic plan file paths*

### Tech Architecture

- [ ] **[Low]** Document DB path semantics in beads.server — Document that "path" for `getDatabasePathForProject` can be a repo root or a direct path to any `.db` file (e.g. test DBs like `beads-test-xxx.db`). *Source: devagent-multi-project-support.2* | *Files: apps/ralph-monitoring/app/db/beads.server.ts*
- [ ] **[Medium]** Test strategy when changing route structure — When adding path segments (e.g. `/projects/:projectId`), decide up front: keep legacy route tests plus redirect tests, or migrate all tests to the new route in one go to avoid partial coverage and duplicate test files. *Source: devagent-multi-project-support.3* | *Files: app/routes/__tests__/_index.test.tsx, app/routes/__tests__/projects.$projectId._index.test.tsx*

## Action Items

1. [ ] **[Low]** Clarify research/plan path convention in task templates or AGENTS (Documentation / Process) — *Source: devagent-multi-project-support.1*
2. [ ] **[Low]** Export discriminated union for settings.projects action return type (Process) — *Source: devagent-multi-project-support.4*
3. [ ] **[Low]** Document DB path semantics (repo root vs direct .db) in beads.server (Tech Architecture) — *Source: devagent-multi-project-support.2*
4. [ ] **[Low]** Align epic/task "Impacted Modules/Files" with project-scoped route file names (Rules & Standards) — *Source: devagent-multi-project-support.5*
5. [ ] **[Low]** Add optional E2E step to QA workflow for e2e/qa-labeled tasks (Process) — *Source: devagent-multi-project-support.6*
6. [ ] **[Medium]** Document route-structure test strategy (legacy + redirect vs full migration) for future route refactors (Tech Architecture) — *Source: devagent-multi-project-support.3*
