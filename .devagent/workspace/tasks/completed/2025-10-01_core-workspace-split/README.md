# Core-Workspace Split

- **Status:** planning-complete
- **Owners:** @jaruesink
- **Summary:** Restructure `.devagent/` into portable `core/` (reusable agents & templates) and project-specific `workspace/` (features, memory, product artifacts) to enable cross-project agent reuse and clearer separation of concerns.
- **Related missions:** Advances mission metric "30 days: Daily coding in DevAgent prompts feels natural" by making agent adoption in new projects friction-free.
- **Latest spec:** spec/2025-10-01_core-workspace-split-spec.md
- **Latest task plan:** tasks/2025-10-01_implementation-plan.md
- **Latest research:** N/A (internal refactor, no external research required)

## Changelog

| Date | Update | Agent/Owner |
|------|--------|-------------|
| 2025-10-01 | Created feature hub and initial spec | #SpecArchitect / @jaruesink |
| 2025-10-01 | Task planning complete with 6-phase implementation plan | #TaskPlanner / @jaruesink |

## Open Decisions

- Migration strategy: big-bang reorg vs. incremental rollout?
- Backwards compatibility: maintain symlinks or update all agent references at once?
- Setup automation: shell script vs. documented manual steps for new projects?

## Research Artifacts

_None required—this is an internal tooling refactor grounded in existing usage patterns._

## Spec Artifacts

- `spec/2025-10-01_core-workspace-split-spec.md` — Full specification with scope, functional flows, and migration plan.

## Task Artifacts

- `tasks/2025-10-01_implementation-plan.md` — 6-phase implementation plan with 33 subtasks covering directory restructure, path updates across 12 agent files, documentation, validation, and rollout.
