# Epic Revise Report - Audit Design System Improvements Plan

**Date:** 2026-01-20  
**Epic ID:** devagent-07a7  
**Status:** closed  
**Completion Rate:** 100% (6/6 tasks closed)

## Executive Summary

This epic completed a design-system sweep for `apps/ralph-monitoring`, establishing an explicit design language, updating core theme tokens, refactoring shared UI primitives with Storybook coverage, and applying the new language across golden-path product surfaces. All child tasks were closed and traceability is present for the implementation tasks via commit comments. The primary follow-up is to ensure the reference screenshot asset exists at the documented path to enable direct visual alignment checks in future design sweeps.

## Traceability Matrix

| Task ID | Title | Status | Commit |
| :--- | :--- | :--- | :--- |
| devagent-07a7.0 | Run Setup & PR Finalization (PM/Coordinator) | closed | `33bf9f45` - chore(run): scaffold sweep run folder (devagent-07a7.0) [skip ci] |
| devagent-07a7.1 | Enumerate design system source-of-truth + baseline inventory | closed | `8ee3c8ea` - docs(design-system): add inventory (devagent-07a7.1) [skip ci] |
| devagent-07a7.2 | Define design language + update core tokens | closed | `4817507d` - style(ralph-monitoring): update theme tokens (devagent-07a7.2) [skip ci] |
| devagent-07a7.3 | Refactor shared UI components to new tokens + Storybook coverage set | closed | `aeb07074` - feat(ralph-monitoring): storybook primitives (devagent-07a7.3) [skip ci] |
| devagent-07a7.4 | Update composite components + product surfaces (golden paths) | closed | `e8756771` - style(ralph-monitoring): tokenize golden paths (devagent-07a7.4) [skip ci] |
| devagent-07a7.5 | Generate Epic Revise Report | closed | *Report-only task (this file)* |

## Evidence & Screenshots

- **Run folder**: `.devagent/workspace/tasks/active/2026-01-20_audit-design-system-improvements/run/`
- **Screenshot Directory (reviews convention)**: `.devagent/workspace/reviews/devagent-07a7/screenshots/`
- **Screenshots Captured**: 0 screenshot(s) referenced via task comments

## Improvement Recommendations

### Documentation

- [ ] **[Medium]** Plan/task descriptions referenced workspace paths for artifacts that didn’t exist yet (clarification, Storybook, docs), causing churn chasing stale paths. - Prefer linking to existing artifacts, or create placeholders immediately (e.g. `apps/ralph-monitoring/docs/`, `apps/ralph-monitoring/.storybook/`). Use the epic run folder as the canonical evidence index. - `.devagent/workspace/tasks/active/2026-01-20_audit-design-system-improvements/plan/2026-01-20_design-system-sweep-plan.md` (from devagent-07a7.1)

### Process

- [ ] **[High]** Epic scaffolding assumptions (missing `active/<task-slug>/plan` + `run` directories) caused early friction, and linting was sensitive to generated output folders. - Scaffold expected task folders up-front for new epics, and ensure lint tooling excludes generated build artifacts (`**/build/**`, `**/dist/**`) to avoid false failures. - `biome.json`, Ralph planning/scaffolding assumptions (from devagent-07a7.0)
- [ ] **[High]** The reference screenshot path was documented but the asset was missing, blocking direct UI-to-token translation and visual verification. - Add the screenshot to `.devagent/workspace/tasks/active/2026-01-20_audit-design-system-improvements/references/reference.png` (or fix the referenced filename) and add a lightweight preflight check that fails fast when the reference asset is absent. - `.devagent/workspace/tasks/active/2026-01-20_audit-design-system-improvements/references/` + task descriptions (from devagent-07a7.2)
- [ ] **[High]** Storybook build initially failed/hung due to React Router Vite plugin requirements and an interactive telemetry prompt. - In Storybook Vite config, avoid React Router plugins for primitive stories and ensure scripts include `--disable-telemetry` to prevent CI/harness hangs. - `apps/ralph-monitoring/.storybook/main.ts`, `apps/ralph-monitoring/package.json` (from devagent-07a7.3)

### Tech Architecture

- [ ] **[High]** Production prerender crashed due to unsafe indexing with an assumed status union (`grouped[status].push` on unexpected values). - Don’t cast external/DB values to narrow unions for indexing; guard with explicit checks and provide a safe fallback bucket so SSR/prerender can’t crash on unexpected values. - `apps/ralph-monitoring/app/routes/_index.tsx` (from devagent-07a7.4)

## Action Items

1. [ ] **[High]** Add a preflight check (or placeholder) to ensure the reference screenshot asset exists before starting token/surface alignment. - [Process] (from devagent-07a7.2)
2. [ ] **[High]** Prevent Storybook runs from hanging: remove RR Vite plugins from Storybook config (when not needed) and keep telemetry disabled in scripts. - [Process] (from devagent-07a7.3)
3. [ ] **[High]** Harden SSR/prerender against unexpected DB/status values by avoiding unsafe union casts and adding guards/fallback buckets. - [Tech Architecture] (from devagent-07a7.4)
4. [ ] **[High]** Standardize epic scaffolding + lint exclusions for generated artifacts to avoid early execution friction and false lint failures. - [Process] (from devagent-07a7.0)
5. [ ] **[Medium]** Update planning docs to only reference existing artifact paths (or create placeholders immediately) and treat the run folder as the canonical evidence index. - [Documentation] (from devagent-07a7.1)

