# Ralph Browser Testing Gap - Feedback for Maintainers

**Date:** 2026-01-14  
**Epic:** devagent-a884 (Ralph Monitoring UI MVP)  
**Issue:** Ralph did not use `agent-browser` for UI verification despite instructions

## Summary

During the Ralph Monitoring UI MVP epic execution, Ralph completed all 4 tasks successfully but **skipped browser testing** for all UI-related tasks, even though the AGENTS.md instructions explicitly require it as part of the 7-Point Checklist.

## What Happened

### Tasks Affected
- **Task 1** (`devagent-a884.1`): Scaffold React Router 7 app + Beads task list
- **Task 3** (`devagent-a884.3`): Implement SSE log streaming + fallback static log view  
- **Task 4** (`devagent-a884.4`): Stop control endpoint + UI integration

### Evidence

1. **Epic Revise Report** explicitly states:
   - "Screenshots Captured: 0 screenshots (no screenshots were captured during this epic)"
   - "Key Screenshots: None"

2. **Task Comments**: No comments mention browser testing, agent-browser usage, or screenshots

3. **Commit Messages** show only manual testing:
   - Task 1: "Manual: bun dev runs successfully, server starts on port 5173"
   - Task 3: No browser testing mentioned
   - Task 4: No browser testing mentioned

4. **No Screenshot Directories**: No screenshot directories were created at:
   - `.devagent/workspace/reviews/devagent-a884/screenshots/`
   - Task-specific screenshot directories

## What Should Have Happened

According to `.devagent/plugins/ralph/AGENTS.md` → Quality Gates & Verification → The 7-Point Checklist:

**Step 5. UI Verification** (for frontend changes):
- Run `agent-browser` to visit the local URL
- Perform DOM assertions to verify elements
- Capture Failure Screenshots if assertions fail
- Capture Success Screenshots ONLY if visual design review is expected

**Step 6** also states: "If UI changed, ensure browser checks cover it"

## Impact

### Positive
- All tasks completed successfully
- Quality gates passed (typecheck, lint, tests)
- Code was functional (verified manually)

### Negative
- No automated browser verification
- No visual regression testing
- No screenshots for documentation/review
- Potential UI bugs may have been missed
- Process compliance gap

## Root Cause Analysis

Possible reasons Ralph skipped browser testing:

1. **Instruction Clarity**: The instruction says "IF frontend changes" - maybe Ralph didn't recognize these as frontend changes?
2. **Tool Availability**: Maybe `agent-browser` wasn't available or Ralph couldn't detect it?
3. **Priority**: Ralph may have prioritized other quality gates over browser testing
4. **Process Enforcement**: The script doesn't enforce browser testing, only suggests it

## Recommendations

### For Ralph Maintainers

1. **Enhance Instruction Clarity**
   - Make browser testing requirement more explicit
   - Add examples of what constitutes "frontend changes"
   - Clarify when browser testing is mandatory vs optional

2. **Add Process Enforcement**
   - Consider adding a check in `ralph.sh` that verifies browser testing was performed for UI tasks
   - Add validation that screenshots exist (if required) before marking task complete

3. **Improve Detection**
   - Add logic to detect UI-related tasks (e.g., files changed include `.tsx`, `.css`, `.html`)
   - Automatically flag UI tasks for browser testing requirement

4. **Better Feedback Loop**
   - Add explicit reminder in task prompt when UI files are detected
   - Include browser testing in the mandatory checklist that agents must verify

5. **Tool Availability Check**
   - Add pre-flight check that `agent-browser` is available
   - Provide clear error if tool is missing but required

### For Future Epics

- Consider making browser testing a blocking requirement for UI tasks
- Add browser testing status to task comments automatically
- Include browser test results in commit messages

## Related Files

- `.devagent/plugins/ralph/AGENTS.md` - Contains the 7-Point Checklist
- `.devagent/plugins/ralph/tools/ralph.sh` - Execution script
- `.devagent/workspace/reviews/2026-01-14_devagent-a884-improvements.md` - Epic revise report

## Questions for Maintainers

1. Is browser testing intended to be mandatory for all UI tasks, or optional?
2. Should `ralph.sh` enforce browser testing completion?
3. How should Ralph detect when browser testing is required?
4. What should happen if `agent-browser` is not available?
5. Should browser testing failures block task completion?

---

**Submitted by:** Jake Ruesink  
**Epic:** devagent-a884  
**Date:** 2026-01-14
