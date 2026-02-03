Revision Learning:
**Category**: Process
**Priority**: Low
**Issue**: QA cannot close a task when the feature under test is fully verified but project-wide gates (typecheck, lint, full test suite) fail in unrelated code. Strict interpretation of "all validation gates pass" forces a blocker for pre-existing failures.
**Recommendation**: Consider allowing QA to close with "Verified with scope: <feature>; full project gates blocked by <task>" when the implemented feature's tests and code paths pass and failures are clearly outside the changed area. Alternatively, run feature-scoped gates (e.g. only tests under app/utils/__tests__/epic-activity*, typecheck limited to touched files) for targeted QA.
**Files/Rules Affected**: Ralph validation checklist, QA workflow.

Signed: QA Agent — Bug Hunter
