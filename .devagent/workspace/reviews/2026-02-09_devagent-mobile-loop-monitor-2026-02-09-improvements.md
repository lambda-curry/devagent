# Epic Revise Report — Mobile-First Loop Monitor

**Date:** 2026-02-09  
**Epic ID:** devagent-mobile-loop-monitor-2026-02-09  
**Status:** open (11/13 closed, 1 in_progress, 1 blocked)

## Executive Summary

The Mobile-First Loop Monitor epic delivered the three-screen flow (Loop Dashboard, Loop Detail, Live Log) with design spec, prototype components, and full implementation. Eleven of 13 child tasks are closed; one task (Setup & PR Finalization) remains blocked on GitHub API availability (502s), and the teardown report task is in progress. Quality gates were satisfied after targeted fixes: fetcher tests in jsdom (AbortSignal), test:ci (better-sqlite3 exclude, settings form encoding, tasks route tests). Revision learnings center on **Process** (scoped test runs, CI/env consistency, PR retry flow) and **Rules** (hooks order, EventSource mock typing), with no Critical or High priorities.

## Traceability Matrix

| Task ID | Title | Status | Commit |
| :--- | :--- | :--- | :--- |
| devagent-mobile-loop-monitor-2026-02-09.0-design | Design Exploration — Mobile Loop Monitor Layout & Components | closed | `e61f9bf1` — feat(ralph-monitoring): mobile loop monitor design spec and prototype components [skip ci] |
| devagent-mobile-loop-monitor-2026-02-09.1 | Loop Dashboard — Mobile Epic List | closed | `0dc8bda3` — feat(ralph-monitoring): mobile-first loop dashboard (epics index) |
| devagent-mobile-loop-monitor-2026-02-09.1-qa | QA: Loop Dashboard | closed | `ecd5c032` — fix(ralph-monitoring): typecheck/lint + QA loop dashboard |
| devagent-mobile-loop-monitor-2026-02-09.2 | Loop Detail — Live Status + Activity Feed | closed | `a2452686` — feat(ralph-monitoring): loop detail view mobile-first redesign |
| devagent-mobile-loop-monitor-2026-02-09.2-design | Design Review: Loop Detail | closed | `dba0aea4` — fix(loop-detail): design review — tokens, touch targets, status chips [skip ci] |
| devagent-mobile-loop-monitor-2026-02-09.2-qa | QA: Loop Detail | closed | `2d5cfb4d` — fix(lint): remove unused imports and forEach callback return |
| devagent-mobile-loop-monitor-2026-02-09.3 | Live Log — Streaming Log Viewer | closed | `1b22da6f` — feat(ralph-monitoring): full-screen live log view at /epics/:epicId/live [skip ci] |
| devagent-mobile-loop-monitor-2026-02-09.3-qa | QA: Live Log Viewer | closed | `b0c3fe0d` — fix(ralph-monitoring): type EventSource mock in live log test [skip ci] |
| devagent-mobile-loop-monitor-2026-02-09.4 | Integration Polish + Final Review | closed | `ab1ee8f7` — feat(ralph-monitoring): polish mobile loop flow and final review |
| devagent-mobile-loop-monitor-2026-02-09.5 | Fix fetcher tests in jsdom (LoopControlPanel, storybook router) | closed | `4101824e` — fix(tests): use jsdom-node-abort env so fetcher tests pass in jsdom |
| devagent-mobile-loop-monitor-2026-02-09.6 | Fix test:ci (better-sqlite3 in workers, AbortSignal in tasks route, settings form) | closed | `0366a5bd` — fix(tests): make test:ci pass (sqlite exclude, settings form, tasks route) |
| devagent-mobile-loop-monitor-2026-02-09.setup-pr | Run Setup & PR Finalization | blocked | *Blocked* — PR body prepared; creation failed (502). Retry when GitHub available. |
| devagent-mobile-loop-monitor-2026-02-09.teardown-report | Generate Epic Revise Report | in_progress | *This report* |

## Evidence & Screenshots

- **Screenshot directory:** `.devagent/workspace/reviews/devagent-mobile-loop-monitor-2026-02-09/screenshots/` (referenced in QA; no screenshots captured this run)
- **Screenshots captured:** 0 (verification via unit/integration tests and code review)
- **Key evidence:** Implementation verified via test suites (epics._index, epics.$epicId, epics.$epicId.live, NowCard, ActivityFeed, StepsList, LoopControlPanel, router stub); design compliance per `apps/ralph-monitoring/docs/mobile-loop-monitor-design.md` and DESIGN_LANGUAGE.md

## Improvement Recommendations

### Documentation

- [ ] **[Low] Outdated / gap:** Pre-existing typecheck failures in `settings.projects.tsx` block branch-level typecheck; design task did not touch that file. Consider a follow-up task to fix so CI/typecheck is green for the branch. *Source: .0-design*

### Process

- [ ] **[Low] Workflow:** Full test:ci fails in ralph-monitoring due to better-sqlite3 native module (NODE_MODULE_VERSION mismatch). QA ran only epics._index tests to verify loop dashboard. Document in README or CI how to run route/component tests without native DB tests, or ensure CI uses matching Node version for native rebuild. *Source: .1-qa*
- [ ] **[Low] Workflow:** Full `npm run test` in ralph-monitoring hits DB/native and other suite failures; scoped test run (only touched files) is the reliable gate for epic-specific work. Document in CONTRIBUTING or Ralph runbook to run scoped tests when full suite has known env failures. *Source: .2*
- [ ] **[Low] Quality gate:** Full test:ci fails in unrelated tests (router/storybook fetcher tests); design changes only touched Loop Detail components and their tests pass. Run targeted tests for modified modules when verifying design/UI tasks, or fix flaky router.test.tsx so CI is green. *Source: .2-design*
- [ ] **[Medium] Quality gate:** test:ci fails in jsdom when tests trigger useFetcher.submit() or revalidator.revalidate() due to RequestInit/AbortSignal not being a real DOM AbortSignal instance in node/undici. Add test setup (e.g. vitest setup file or global) that polyfills or replaces AbortSignal for tests that use fetcher/actions, or document and skip these tests until React Router or test env supports it. *Source: .2-qa*
- [ ] **[Low] Workflow:** Epics layout had no loading indicator; empty states for "no steps" and "connected but no logs yet" were missing. For mobile-first flows, add a minimal global loading indicator (e.g. thin top bar) in the layout when `useNavigation().state === 'loading'`, and ensure every list/feed has an explicit empty-state message. *Source: .4*
- [ ] **[Low] Process:** Custom Vitest environments must not import from `vitest` at module load time (triggers "Vitest failed to access its internal state"); use dynamic `import('vitest/environments')` inside `setup()`. Document in testing docs or vitest-environment-jsdom-node-abort README. *Source: .5*
- [ ] **[Medium] Process:** better-sqlite3 native addon built with one Node version (e.g. Bun’s 127) fails when Vitest workers run with another (e.g. Node 137). Conditional exclude keeps CI green; run `bun run test:db` when runtime matches. In CI, either use a single Node version for install and test, or run `test:db` in a job that uses the same Node as the one used to install deps. *Source: .6*
- [ ] **[Low] Process:** PR creation step is dependent on GitHub API availability; 502s prevent completing setup-pr task programmatically. Consider idempotent "ensure PR exists" step: if `gh pr create` fails with 5xx, leave task in_progress or blocked with clear retry command; persist PR title and body to a known path (as done) for manual or retry execution. *Source: .setup-pr*

### Rules & Standards

- [ ] **[Low] Pattern:** Early return before hooks in epics.$epicId (for live child route) triggered useHookAtTopLevel lint; hooks must run unconditionally. When branching render (e.g. child route), call all hooks first, then `if (condition) return <Outlet />` before the main JSX. *Source: .3*
- [ ] **[Low] Pattern:** EventSource global mock in jsdom tests must satisfy TypeScript's constructor type (static CONNECTING, OPEN, CLOSED). When replacing globalThis.EventSource in tests, use `Object.assign(mockImpl, { CONNECTING: 0, OPEN: 1, CLOSED: 2 })` as `typeof EventSource` so the mock is assignable to the global. *Source: .3-qa*

### Tech Architecture

- [ ] **[Low] Test strategy:** Navigation test (click card → assert detail route) in route stub triggered React Router's navigate() which in jsdom caused Request/AbortSignal errors; full navigation in stub was unreliable. For route stubs, assert tap targets (button, aria-label) and that cards render; defer full navigation-to-detail to integration or QA when needed. *Source: .1*

## Action Items

1. [ ] **[Medium]** Add Vitest/CI setup so AbortSignal is valid for fetcher/action tests in jsdom (polyfill or env) — Process
2. [ ] **[Medium]** Align Node version for better-sqlite3 in CI (single version for install + test, or separate test:db job) — Process
3. [ ] **[Low]** Fix settings.projects.tsx type errors so branch typecheck is green — Documentation
4. [ ] **[Low]** Document scoped test commands and when to use them (CONTRIBUTING or Ralph runbook) — Process
5. [ ] **[Low]** Document how to run route/component tests without native DB tests (README or CI) — Process
6. [ ] **[Low]** Add global loading indicator in epics layout when navigation.state === 'loading' and explicit empty states for no steps / no logs — Process
7. [ ] **[Low]** Implement idempotent "ensure PR exists" with persisted body and retry command for setup-pr — Process
8. [ ] **[Low]** Document custom Vitest env pattern (no top-level vitest import) in testing docs — Process
9. [ ] **[Low]** Enforce hooks-before-return pattern in route components with child routes — Rules
10. [ ] **[Low]** Use typed EventSource mock (CONNECTING/OPEN/CLOSED) in tests that replace globalThis.EventSource — Rules
