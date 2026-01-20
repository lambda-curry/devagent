# Epic Revise Report - Fix Beads Live Log Viewing

**Date:** 2026-01-20  
**Epic ID:** devagent-300b  
**Status:** open  

## Executive Summary
This epic delivered reliable task log viewing by aligning log writer + viewer contracts and improving the inactive/active streaming UX with actionable missing-log diagnostics. The work was completed with green repo quality gates (test/lint/typecheck), with a minor process hiccup from an intermittent AI tool transport cancel that was retried successfully.

## Traceability Matrix

| Task ID | Title | Status | Commit |
| :--- | :--- | :--- | :--- |
| devagent-300b.1 | Harden log path resolution + structured log-not-found diagnostics | closed | `21b1bafc` - fix(logs): add safe missing-log diagnostics (devagent-300b.1) [skip ci] |
| devagent-300b.2 | Gate streaming by active/inactive + add waiting-for-logs UX | closed | `fa671a17` - fix(logs): gate stream + wait for logs (devagent-300b.2) [skip ci] |
| devagent-300b.3 | Align log writer + log viewer contract (dir, filename, sanitization) | closed | `e27ea761` - fix(logs): align writer+viewer path (devagent-300b.3) [skip ci] |
| devagent-300b.4 | Add regression coverage for log streaming (missing logs + inactive gating) | closed | `8bf57a44` - test(ralph-monitoring): cover log not-found regressions (devagent-300b.4) [skip ci] |
| devagent-300b.5 | Generate Epic Revise Report | in_progress | *Pending* |

## Evidence & Screenshots

- **Screenshot Directory**: `.devagent/workspace/reviews/devagent-300b/screenshots/`
- **Screenshots Captured**: 0 screenshots across 0 tasks
- **Notes**:
  - Task `devagent-300b.2` reports: “Screenshots captured: none (ran Storybook build as UI sanity check).”

## Improvement Recommendations

### Documentation
- [ ] **[Medium] Testing notes**: Document “bounded backoff UI tests” guidance (drive timers explicitly; avoid deadlocking `waitFor` under fake timers). **Source:** devagent-300b.2

### Process
- [ ] **[High] RR7 route typegen before tsc**: `apps/ralph-monitoring` uses `tsc --noEmit` for typecheck, which won’t generate `app/routes/+types/*`; add a pre-step (e.g. `react-router typegen`) and document it. **Source:** devagent-300b.1
- [ ] **[Medium] Fake timers + Testing Library**: Prefer explicit `advanceTimersByTime` and synchronous UI markers over `waitFor/findBy*` polling when using fake timers. **Source:** devagent-300b.2
- [ ] **[Medium] Shell quoting discipline (backticks)**: Avoid backticks in shell-invoked `bd comments add` strings (or escape them) to prevent command substitution bugs. **Source:** devagent-300b.3
- [ ] **[Medium] Shell quoting discipline ($ in filenames)**: Always quote/escape RR route filenames containing `$` (e.g. `api.logs.$taskId.test.ts`) in shell commands to avoid expansion. **Source:** devagent-300b.4

### Rules & Standards
- [ ] **[High] Update RR7 rule**: Extend `.cursor/rules/react-router-7.mdc` to call out that `tsc --noEmit` doesn’t generate route types, and point to the canonical typegen command to run before typecheck. **Source:** devagent-300b.1

### Tech Architecture
- [ ] **[High] Log writing is part of the contract**: Treat per-task log writing as core Ralph execution behavior; keep task-id → filename sanitization in a single shared resolver used by both writer and viewer, and preserve the contract test. **Source:** devagent-300b.3

## Action Items
1. [ ] **[High]** Add a `react-router typegen` (or equivalent) step before `tsc --noEmit` in `apps/ralph-monitoring` `typecheck`, and document the workflow. *(Process / Rules & Standards)*
2. [ ] **[High]** Ensure “writer + viewer log path contract” remains centralized (shared resolver) and keep the contract test as a guardrail. *(Tech Architecture)*
3. [ ] **[Medium]** Add/extend testing guidance for fake timers + backoff flows (explicit timer advancement; avoid `waitFor` deadlocks). *(Documentation / Process)*
4. [ ] **[Medium]** Add a short “shell quoting pitfalls” note for `$` filenames and backticks when posting `bd comments add`. *(Process)*

