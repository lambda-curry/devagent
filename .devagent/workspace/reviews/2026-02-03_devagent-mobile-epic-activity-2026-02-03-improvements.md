# Epic Revise Report — Mobile Epic Activity View

**Date:** 2026-02-03  
**Epic ID:** devagent-mobile-epic-activity-2026-02-03  
**Status:** closed  
**Branch:** codex/2026-02-03-mobile-epic-activity-view  

---

## Executive Summary

The Mobile Epic Activity View epic delivered a mobile-friendly epic detail surface in ralph-monitoring: aggregated activity feed (execution, comment, status), epic metadata (PR + repo links), Activity/Commits/PR cards, and epic-level log access. All 11 implementation, QA, design, and final-review tasks closed successfully. Quality gates (typecheck, lint, test) pass. Key learnings center on process: isolating typecheck for task-scoped validation, handling pre-existing gate failures via blocker tasks, documenting URLSearchParams/Request realm issues in Vitest, and keeping docs in sync with features.

---

## Traceability Matrix

| Task ID | Title | Status | Commit |
| :--- | :--- | :--- | :--- |
| devagent-mobile-epic-activity-2026-02-03.1 | Aggregate Epic Activity Data | closed | `cb53ab3e` - feat(ralph-monitoring): add epic activity feed (execution, comment, status) |
| devagent-mobile-epic-activity-2026-02-03.1-qa | QA: Aggregate Epic Activity Data | closed | `d6f8decd` - fix(ralph-monitoring): guard vitest init for typecheck |
| devagent-mobile-epic-activity-2026-02-03.2 | Surface Epic Metadata (PR + Repo Links) | closed | `82b013c0` - feat(ralph-monitoring): expose pr_url and repo URL in epic loader |
| devagent-mobile-epic-activity-2026-02-03.2-qa | QA: Epic Metadata (PR + Repo Links) | closed | (see task comments) |
| devagent-mobile-epic-activity-2026-02-03.3 | Add Mobile-Friendly Epic Activity UI | closed | `cbc16ee5` - feat(ralph-monitoring): add Activity, Commits, and PR cards to epic detail |
| devagent-mobile-epic-activity-2026-02-03.3-design | Design Review: Epic Activity UI | closed | (doc/design only) |
| devagent-mobile-epic-activity-2026-02-03.3-qa | QA: Epic Activity UI | closed | (see task comments) |
| devagent-mobile-epic-activity-2026-02-03.4 | Add Epic-Level Log Access | closed | `a695afb9` - feat(ralph-monitoring): add epic log panel for task logs |
| devagent-mobile-epic-activity-2026-02-03.4-qa | QA: Epic-Level Log Access | closed | `ca5499b5` - chore(qa): verify epic-level log access |
| devagent-mobile-epic-activity-2026-02-03.5 | Fix ralph-monitoring typecheck, lint, and failing tests | closed | `708632eb` - fix(ralph-monitoring): resolve typecheck, lint, and test gate failures |
| devagent-mobile-epic-activity-2026-02-03.final-review | Final Review & Documentation | closed | `65cbcc5c` - docs(ralph-monitoring): final review and documentation update |
| devagent-mobile-epic-activity-2026-02-03.close | Wrap up & Close Epic | closed | `48bada06` - chore: update lockfile |
| devagent-mobile-epic-activity-2026-02-03.setup-pr | Run Setup & PR Finalization | open → closed | N/A (prerequisites met) |
| devagent-mobile-epic-activity-2026-02-03.teardown-report | Generate Epic Revise Report | open → closed | This report |

---

## Evidence & Screenshots

- **Screenshot directory:** No dedicated screenshot directory was required for this epic; QA used component and route tests plus DOM assertions.
- **Evidence:** Implementation in `apps/ralph-monitoring/app/utils/epic-activity.server.ts`, `epic-metadata.server.ts`, `EpicActivity.tsx`, `EpicCommitList.tsx`, `EpicMetaCard.tsx`, `EpicLogPanel.tsx`; tests in `app/utils/__tests__/epic-activity.server.test.ts`, `EpicLogPanel.test.tsx`, `epics.$epicId.test.tsx`.

---

## Improvement Recommendations

### Process (Low–Medium)

1. **Typecheck isolation (Low)**  
   - **Issue:** Repo typecheck fails in unrelated modules (Comments.tsx, settings.projects.tsx). Engineering could not run full typecheck as a gate for backend-only task .1.  
   - **Recommendation:** Fix or isolate typecheck (e.g. typecheck only under `app/db` and `app/utils`) or document that typecheck is not a required gate for backend-only changes until root cause is fixed.  
   - **Files/Rules:** apps/ralph-monitoring package.json, tsconfig, CI quality gates.

2. **QA close when feature verified but project gates fail (Low)**  
   - **Issue:** QA cannot close when the feature under test is fully verified but project-wide gates fail in unrelated code.  
   - **Recommendation:** Allow QA to close with "Verified with scope: <feature>; full project gates blocked by <task>" when the implemented feature's tests pass and failures are outside the changed area; or run feature-scoped gates.  
   - **Files/Rules:** Ralph validation checklist, QA workflow.

3. **Test setup files in typecheck (Low)**  
   - **Issue:** Full project typecheck can fail on test setup files (e.g. vitest.setup.ts) with strict TS options.  
   - **Recommendation:** Include test setup in typecheck scope and fix narrow type issues (optional chaining, conditional spread).  
   - **Files/Rules:** apps/ralph-monitoring/vitest.setup.ts, Ralph validation checklist.

4. **URLSearchParams / Request realm in Vitest (Medium)**  
   - **Issue:** In Node (undici), `new Request(url, { body: urlSearchParams })` fails when urlSearchParams comes from a different realm (e.g. Vite bundle), with "Expected init.body to be an instance of URLSearchParams".  
   - **Recommendation:** Document in testing-best-practices or ralph-monitoring README: use vitest.setup.ts to patch/normalize URLSearchParams body to string; do not normalize FormData so route actions using request.formData() keep working.  
   - **Files/Rules:** apps/ralph-monitoring/vitest.setup.ts, ai-rules/testing-best-practices.md.

5. **Documentation sync with features (Low)**  
   - **Issue:** Final review combined "final review" with "documentation update"; README and component-specs were updated in one batch at the end.  
   - **Recommendation:** Add a doc-update checkpoint after each feature task (or a single "docs: update README/component-specs" subtask) so docs stay in sync with code.  
   - **Files/Rules:** README.md, docs/component-specs.md; Ralph task-setup / final-review workflow.

6. **Epic close vs setup-pr / teardown-report (Low)**  
   - **Issue:** Epic close task assumes setup-pr may be deferred when branch is already in use; teardown-report is blocked by .close.  
   - **Recommendation:** Clarify in setup-ralph-loop or epic templates whether setup-pr must be closed before "Wrap up & Close Epic" or can be closed as "prerequisites met".  
   - **Files/Rules:** Ralph epic lifecycle, task dependency ordering.

### Tech Architecture / Testing (Low)

7. **Radix Select in jsdom (Low)**  
   - **Issue:** Opening the dropdown (userEvent.click(combobox)) triggers hasPointerCapture errors; options live in a portal, so "switch task via select" was not asserted with real interaction.  
   - **Recommendation:** For components that only need "selector present + default value" verified, avoid testing full open/click-option in jsdom; rely on default-selection tests and QA for interaction.  
   - **Files/Rules:** EpicLogPanel.test.tsx.

8. **Epic-level log QA scope (Low)**  
   - **Issue:** Epic-level log access QA relied on DOM assertions on epic detail URL; full task-switcher interaction was not exercised in browser.  
   - **Recommendation:** DOM assertions on epic detail URL as primary evidence; task-switcher behavior covered by EpicLogPanel unit tests; optional agent-browser click/select only if needed for regression.  
   - **Files/Rules:** .devagent/plugins/ralph/skills/agent-browser/SKILL.md, QA workflow for epic log panel.

---

## Action Items

| Priority | Action |
| :--- | :--- |
| Medium | Document Vitest URLSearchParams/Request realm workaround in testing-best-practices or ralph-monitoring README. |
| Low | Consider typecheck isolation or feature-scoped gates for backend-only tasks. |
| Low | Consider QA close semantics when feature is verified but project gates fail elsewhere. |
| Low | Add doc-update checkpoint after feature tasks in epic plans. |
| Low | Clarify epic lifecycle: setup-pr and teardown-report ordering relative to "Wrap up & Close Epic". |

---

*Report generated by Project Manager Agent (Chaos Coordinator) for epic devagent-mobile-epic-activity-2026-02-03. Signed: Project Manager Agent — Chaos Coordinator*
