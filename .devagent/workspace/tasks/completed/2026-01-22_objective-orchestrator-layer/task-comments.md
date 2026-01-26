## Summary

Created the orchestrator loop template and three specialized role definitions for the Admin Loop:

1. **orchestrator-loop.json**: Defines the standard Admin Loop tasks:
   - Setup Objective (ObjectivePlanner)
   - Sync Plan to Beads (ObjectivePlanner)
   - Kickoff Next Epic (EpicCoordinator)
   - Review Epic Completion (EpicCoordinator)
   - Merge Epic to Hub (BranchManager)
   - Teardown Objective (EpicCoordinator)

2. **objective-planner.md**: Role instructions for managing objective plans and syncing to Beads, including detailed Plan Sync instructions

3. **branch-manager.md**: Role instructions for git operations including Hub + Stacking strategy, with detailed Git Stacking instructions

4. **epic-coordinator.md**: Role instructions for coordinating epic execution and suspend/resume logic

All files validated against schema and acceptance criteria met.

## Struggles

None - straightforward implementation following existing patterns from generic-ralph-loop.json and agent instruction files.

## Verification

- JSON validated against loop.schema.json schema ✅
- No linter errors ✅
- Manual review confirms Git Stacking and Plan Sync instructions are present and detailed ✅
- All acceptance criteria met ✅

---

Commit: 9d0cc2b1 - feat(ralph): add orchestrator loop template and role definitions [skip ci]

---

## Revision Learning

**Category**: Documentation
**Priority**: Medium
**Issue**: The role definition files are comprehensive but may need integration with the actual agent selection/routing mechanism. The metadata.specializedRole field in the loop template is defined, but the mechanism for routing tasks to these specialized roles needs to be implemented in the orchestrator execution logic.
**Recommendation**: When implementing the orchestrator execution logic (Task 4), ensure that tasks with metadata.specializedRole are routed to the appropriate role instructions file. Consider adding a mapping mechanism in the orchestrator script to load the correct role instructions based on metadata.specializedRole.
**Files/Rules Affected**: 
- `.devagent/plugins/ralph/templates/orchestrator-loop.json` (metadata.specializedRole field)
- `.devagent/plugins/ralph/roles/*.md` (role instruction files)
- Future: `.devagent/plugins/ralph/tools/orchestrator-execution.ts` (routing logic)
