## Summary

Adds **multi-project support** to the Ralph monitoring app: users can register multiple Beads project paths, switch between a single project and a combined view, and see project attribution on every task card.

**Epic:** `devagent-multi-project-support` (Beads)

### Delivered

- **Project config:** Schema and server loader for project list (`id`, `path`, `label`); config path via `RALPH_PROJECTS_FILE` or default.
- **Beads server:** DB-by-path refactor; all data access supports optional project id/path; single-DB behavior preserved when one project or `BEADS_DB` is set.
- **Routes & API:** Project in URL and loaders; combined view aggregates tasks from all projects; logs, comments, and stop APIs are project-scoped.
- **UI:** Project switcher and registration (add/remove projects with path validation); combined view with project badges on cards; task detail shows project context.

### Verification

- Lint, typecheck, and tests pass per repo scripts.
- QA verification task (devagent-multi-project-support.6) completed.

---

<!-- This is an auto-generated comment: release notes by coderabbit.ai -->
## Summary by CodeRabbit

* **Documentation**
  * Added planning, research, and run-plan docs for multi-project support; README updated with project configuration guidance.
* **New Features**
  * Multi-project mode: register/manage projects, switch single/combined views, project-scoped routes, project badges on task cards, and project-aware logs.
  * New Kanban board and per-task detail pages honoring project context, with stop actions and live revalidation.
* **Tests**
  * Expanded tests for project config, path resolution, multi-DB access, routing, and UI flows.

<sub>✏️ Tip: You can customize this high-level summary in your review settings.</sub>
<!-- end of auto-generated comment: release notes by coderabbit.ai -->
