# Cursor Checkpoint Duplicate Issue Research

**Date:** 2026-01-06  
**Context:** Investigation into duplicate directory creation during `mark-task-complete` workflow execution

## Problem Statement

When executing the `mark-task-complete` workflow, a duplicate directory was created in `active/` after the directory was moved to `completed/`. The workflow follows this order:

1. Update AGENTS.md (in `active/` directory)
2. Update path references in other files (in `active/` directory)
3. Move directory from `active/` to `completed/`

After the move, the directory reappeared in `active/`, creating a duplicate.

## Root Cause Hypothesis

**Cursor IDE's checkpoint mechanism** appears to be the culprit. Cursor automatically creates checkpoints before editing files. When files are edited in the `active/` directory and then the directory is moved, Cursor's checkpoint system may restore the files to their original location (`active/`) based on the checkpoint created before the edits.

### Evidence

1. **Web research findings:**
   - Cursor creates checkpoints before editing files
   - Users have reported Cursor restoring files/deleting files unexpectedly
   - Checkpoint mechanism can restore files to original locations after moves

2. **Workflow execution pattern:**
   - Files were edited in `active/` directory (steps 4-5)
   - Directory was moved to `completed/` (step 6)
   - Directory reappeared in `active/` after move
   - The reappeared directory only contained `AGENTS.md` (the file that was edited)

3. **Timing correlation:**
   - The duplicate appeared with the same timestamp as the file edits
   - This suggests Cursor restored the edited file from checkpoint

## Proposed Solution

**Reorder workflow steps to move directory BEFORE editing files:**

### Current Order (Problematic):
1. Update AGENTS.md in `active/`
2. Update path references in `active/`
3. Move directory to `completed/`
4. Verify move

### Proposed Order (Fixed):
1. Move directory to `completed/` (with minimal validation)
2. Update AGENTS.md in `completed/`
3. Update path references in `completed/`
4. Verify all updates

### Benefits:
- Cursor's checkpoint mechanism will operate on files in the `completed/` location
- If checkpoints restore files, they'll restore to `completed/` (correct location)
- No risk of restoring files to `active/` after move
- Simpler mental model: move first, then edit

### Considerations:
- Need to ensure we can still validate task exists before move
- Path references need to be updated after move (but that's fine - they'll be in the right location)
- May need to read AGENTS.md from `active/` before move to get current content, but edit it in `completed/` after move

## Implementation Notes

1. **Pre-move validation** can still happen (check task exists, check destination doesn't exist)
2. **Read current state** from `active/` before move (for completeness check, reading AGENTS.md content)
3. **Move directory** to `completed/`
4. **Update files** in `completed/` location
5. **Verify** no duplicates exist

## Related Workflow Sections to Update

- Step 4: Update AGENTS.md → Move to after step 6
- Step 5: Update path references → Move to after step 6
- Step 6: Move directory → Move to before step 4
- Step 7: Post-move verification → Keep as-is, but now verifies edits happened in correct location

## References

- Cursor IDE checkpoint behavior (web research)
- `.devagent/core/workflows/mark-task-complete.md` - Current workflow definition
- Incident: 2026-01-06_add-exit-instructions-brainstorm-clarify task completion

## Status

**Recommendation:** Update workflow to move directory before editing files to prevent Cursor checkpoint restoration issues.
