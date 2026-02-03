Revision Learning:
**Category**: Process
**Priority**: Low
**Issue**: Full project typecheck can fail on test setup files (e.g. vitest.setup.ts) with strict TS options (init possibly undefined). QA cannot close until all gates pass.
**Recommendation**: Include test setup files in typecheck scope and fix narrow type issues (optional chaining, conditional spread) so QA can close without creating a new blocker task when the only failure is outside the feature under test.
**Files/Rules Affected**: apps/ralph-monitoring/vitest.setup.ts, Ralph validation checklist.

Signed: QA Agent — Bug Hunter
