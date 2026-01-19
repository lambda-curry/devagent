# Epic Revise Report - Storybook Setup for `apps/ralph-monitoring` Plan

**Date:** 2026-01-19  
**Epic ID:** devagent-20e9  
**Status:** closed (after final quality gate)

## Executive Summary
This epic added a Storybook setup for `apps/ralph-monitoring` (React Router v7 + Vite + Tailwind v4) with initial story coverage, interaction tests, and a review rubric. The work produced a repeatable UI review surface and clarified QA verification patterns (router stubs, deterministic theme, keyboard coverage), while highlighting a few process/documentation gaps around command ergonomics and warning noise.

## Task Status

| Task ID | Status | Title |
| :--- | :--- | :--- |
| devagent-20e9.1 | closed | Add Storybook deps, scripts, and Turbo tasks |
| devagent-20e9.2 | closed | Create Storybook config aligned to Vite + Tailwind v4 |
| devagent-20e9.3 | closed | Add router/theme decorators and router-level stubs |
| devagent-20e9.4 | closed | Add initial stories + interaction tests |
| devagent-20e9.5 | closed | Update Storybook skill runbook (agent feedback loop) |
| devagent-20e9.6 | closed | Generate Epic Revise Report |
| devagent-20e9.7 | closed | Design: define Storybook review rubric + story standards |
| devagent-20e9.8 | closed | QA: verify Storybook dev/build works with Tailwind + router stubs |
| devagent-20e9.9 | closed | QA: run Storybook interaction tests and report results |
| devagent-20e9.10 | closed | Design review: audit initial stories for UX/accessibility consistency |
| devagent-20e9.11 | closed | Add Storybook story rendering react-router Link |
| devagent-20e9.12 | closed | Storybook: add keyboard play coverage for ui/Select + ui/Input |
| devagent-20e9.13 | closed | Storybook: add forced theme parameter + dark variants |
| devagent-20e9.14 | closed | Storybook: clarify/align rubric for smoke stories |

## Traceability Matrix

| Task ID | Title | Status | Commit |
| :--- | :--- | :--- | :--- |
| devagent-20e9.1 | Add Storybook deps, scripts, and Turbo tasks | closed | `121fed84` - chore(storybook): expose interaction-test via turbo (devagent-20e9.1) |
| devagent-20e9.2 | Create Storybook config aligned to Vite + Tailwind v4 | closed | `1c2906f5` - chore(storybook): add tailwind + ts paths (devagent-20e9.2) |
| devagent-20e9.3 | Add router/theme decorators and router-level stubs | closed | `554e7be2` - feat(storybook): add theme+router stubs (devagent-20e9.3) |
| devagent-20e9.4 | Add initial stories + interaction tests | closed | `4ab71cf6` - feat(storybook): add initial stories + play tests (devagent-20e9.4) |
| devagent-20e9.5 | Update Storybook skill runbook (agent feedback loop) | closed | `af743cf5` - docs(storybook): document interaction-test evidence (devagent-20e9.5) |
| devagent-20e9.6 | Generate Epic Revise Report | closed | *See this report commit* |
| devagent-20e9.7 | Design: define Storybook review rubric + story standards | closed | `f6152b8a` - docs(storybook): add story review checklist (devagent-20e9.7) |
| devagent-20e9.8 | QA: verify Storybook dev/build works with Tailwind + router stubs | closed | `01685432` - chore(beads): sync issues.jsonl (devagent-20e9.8) |
| devagent-20e9.9 | QA: run Storybook interaction tests and report results | closed | `96896e11` - chore(beads): sync issues.jsonl (devagent-20e9.9) |
| devagent-20e9.10 | Design review: audit initial stories for UX/accessibility consistency | closed | *None (audit-only; no repo changes)* |
| devagent-20e9.11 | Add Storybook story rendering react-router Link | closed | `aba7302b` - feat(storybook): add Link smoke story (devagent-20e9.11) |
| devagent-20e9.12 | Storybook: add keyboard play coverage for ui/Select + ui/Input | closed | `18ec4721` - test(storybook): add keyboard focus coverage (devagent-20e9.12) |
| devagent-20e9.13 | Storybook: add forced theme parameter + dark variants | closed | `2035bc80` - feat(storybook): deterministic theme + dark variants (devagent-20e9.13) |
| devagent-20e9.14 | Storybook: clarify/align rubric for smoke stories | closed | `d8734145` - docs(storybook): allow smoke titles (devagent-20e9.14) |

## Evidence & Screenshots

- **Screenshot Directory (preferred)**: `.devagent/workspace/reviews/devagent-20e9/screenshots/`
- **Screenshots Captured**: 0 (no screenshots recorded in task comments)

## Improvement Recommendations

### Documentation
- [ ] **[High] Document Storybook + RR7 Vite integration gotcha**: Storybook’s Vite builder behavior can break `@react-router/dev` plugin expectations during `storybook dev` unless a minimal SB Vite config is used.  
  - **Recommendation**: Document the required `.storybook/vite.config.ts` pattern and `framework.options.builder.viteConfigPath` override in Storybook guidance.
  - **Files**: `.cursor/rules/storybook.mdc`, `apps/ralph-monitoring/.storybook/main.ts`
  - **Source**: devagent-20e9.2
- [ ] **[Medium] Clarify Vitest environment expectations**: New component-ish tests can fail under a node environment with confusing `document is not defined` errors.  
  - **Recommendation**: Document when to add `/** @vitest-environment jsdom */` (or establish a default jsdom environment and opt into node where needed).
  - **Files**: `.cursor/rules/testing-best-practices.mdc`, `apps/ralph-monitoring/vitest.config.ts` (optional)
  - **Source**: devagent-20e9.3
- [ ] **[Medium] Keep Storybook verification runbook “copy/paste exact”**: Runbooks are most usable when they include the exact script, preconditions (ports/URLs), and an evidence template.  
  - **Files**: `.devagent/plugins/ralph/skills/storybook/SKILL.md`
  - **Source**: devagent-20e9.5
- [ ] **[Low] Explicitly allow infra smoke story naming**: Rubric guidance should permit `smoke/<Name>` for infra validation stories.  
  - **Files**: `apps/ralph-monitoring/docs/STORYBOOK_REVIEW_RUBRIC.md`
  - **Source**: devagent-20e9.14

### Process
- [ ] **[High] Provide a repo-local `ralph-revise-report` entrypoint**: This environment does not expose a `devagent` CLI in non-interactive shells, preventing `devagent ralph-revise-report <epic>` from running as documented.  
  - **Recommendation**: Add and document a repo-local executable command (e.g., `bun run ralph:revise-report <epic-id>` or similar) and update workflow docs to match.
  - **Files**: `.devagent/plugins/ralph/commands/generate-revise-report.md`, `.devagent/plugins/ralph/workflows/generate-revise-report.md`, `.devagent/plugins/ralph/skills/revise-report-generation/SKILL.md`
  - **Source**: devagent-20e9.6 (observed while executing this gate)
- [ ] **[High] Auto-block the revise-report gate until epic is ready**: The revise-report task should only be actionable once no sibling tasks remain `open`/`in_progress`.  
  - **Files**: revise-report task template/creator; `.devagent/plugins/ralph/skills/revise-report-generation/SKILL.md`
  - **Source**: devagent-20e9.6
- [ ] **[Medium] Reduce “pull --rebase” friction on non-tracking branches**: The “landing the plane” sequence can be interrupted by branches without upstream tracking.  
  - **Recommendation**: Use `git pull --rebase origin <base>` or ensure upstream is set before the required pull→sync→push.
  - **Files**: `AGENTS.md` (Landing the Plane section)
  - **Source**: devagent-20e9.1
- [ ] **[Medium] Make interaction tests less flaky by installing mocks early**: Storybook `play()` assertions can fail if mocks are installed after child `useEffect` runs.  
  - **Recommendation**: Prefer decorator `useLayoutEffect` for test-only mock installation when children start work in `useEffect`.
  - **Files**: `apps/ralph-monitoring/app/components/LogViewer.stories.tsx`
  - **Source**: devagent-20e9.4
- [ ] **[Medium] Standardize Beads comment entry to avoid shell pitfalls**: Inline markdown/backticks can break under zsh and `bd comment` vs `bd comments add` differ.  
  - **Recommendation**: Standardize on heredoc-backed `bd comments add <id> "$(cat <<'EOF' ... EOF)"` and document it.
  - **Files**: `.devagent/plugins/ralph/skills/beads-integration/SKILL.md`
  - **Source**: devagent-20e9.10
- [ ] **[Medium] Treat Storybook warning noise explicitly**: Non-fatal warnings (storybook/test patch mismatch; CJS→ESM `@tailwindcss/vite`; migration suggestions) add QA noise and can mask real failures.  
  - **Recommendation**: Align Storybook package versions (keep patch versions in sync) and document known non-fatal warnings in the runbook (or silence if appropriate).
  - **Files**: `apps/ralph-monitoring/package.json`, `.devagent/plugins/ralph/skills/storybook/SKILL.md`
  - **Source**: devagent-20e9.8, devagent-20e9.9
- [ ] **[Medium] Make smoke-test the default “fast verify” path**: `storybook --smoke-test` provides a fast, non-interactive verification pair with `build-storybook`.  
  - **Files**: `apps/ralph-monitoring/package.json`
  - **Source**: devagent-20e9.11
- [ ] **[Medium] Improve play function keyboard reliability for Radix Select**: Scope `userEvent` to the correct document and avoid timing assumptions.  
  - **Files**: `apps/ralph-monitoring/app/components/ui/select.stories.tsx`, `apps/ralph-monitoring/docs/STORYBOOK_REVIEW_RUBRIC.md`
  - **Source**: devagent-20e9.12
- [ ] **[Medium] Enforce deterministic theme defaults and parity stories**: Theme defaults that depend on OS settings make review inconsistent.  
  - **Files**: `apps/ralph-monitoring/app/lib/storybook/decorators.tsx`, `apps/ralph-monitoring/app/components/ui/*.stories.tsx`
  - **Source**: devagent-20e9.13

### Rules & Standards
- No cross-cutting rules issues recorded in this epic’s revision learnings.

### Tech Architecture
- No architecture issues recorded in this epic’s revision learnings.

## Action Items
1. [ ] **[High]** Add and document a repo-local revise-report entrypoint (no reliance on a `devagent` shell alias). *(Process)*
2. [ ] **[High]** Auto-block/unblock revise-report gate tasks until sibling tasks are all `closed|blocked`. *(Process)*
3. [ ] **[Medium]** Document Storybook+RR7 Vite integration requirements (`viteConfigPath` + minimal SB Vite config). *(Documentation)*
4. [ ] **[Medium]** Align Storybook package versions (avoid patch mismatch warnings) and document known non-fatal warning noise in QA runbooks. *(Process)*
5. [ ] **[Medium]** Document Beads comment heredoc pattern for zsh-safe, multi-line markdown comments. *(Process)*
6. [ ] **[Medium]** Document and/or standardize Vitest environments for component-ish tests to avoid `document is not defined` surprises. *(Documentation)*

