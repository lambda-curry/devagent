# Mark Task Complete

## Mission
- Primary goal: Move a completed task (task hub) from `active/` to `completed/` status, updating all status references and path references throughout the task directory. Includes a validation step to check for incomplete work or gaps before moving.
- Boundaries / non-goals: Do not modify application code or commit changes. Do not block completion if user confirms "good enough" status despite gaps.
- Success signals: Task directory moved to `completed/`, all status references updated to "Complete", all path references updated from `active/` to `completed/`, completion log entry added. User has been informed of any gaps and confirmed proceeding.

## Standard Instructions Reference
Before executing this workflow, review standard instructions in `.devagent/core/AGENTS.md` → Standard Workflow Instructions for:
- Date handling
- Metadata retrieval
- Context gathering order
- Standard guardrails
- Storage patterns

## Execution Directive
Follow standard execution directive in `.devagent/core/AGENTS.md` → Standard Workflow Instructions, with the following workflow-specific customization:
- After the completeness spot check, if gaps are found, pause and present findings to the user for confirmation before proceeding. If no gaps are found or user confirms proceeding, continue with updating files and moving the directory.

## Inputs
- Required: Task (task hub) directory path (e.g., `.devagent/workspace/tasks/active/2025-12-27_task-slug/`) or task slug (will search in `active/` directory).
- Optional: Completion notes (will be added to progress log).
- Missing info protocol: If task path/slug not provided, list available active tasks and request selection. If task not found in `active/`, report error and stop.

## Resource Strategy
- Task (task hub) directory: Located at `.devagent/workspace/tasks/active/<task_prefix>_<task_slug>/` (source) and `.devagent/workspace/tasks/completed/<task_prefix>_<task_slug>/` (destination).
- Files to update: `AGENTS.md`, and any other files in the task directory that reference paths (plan documents, research packets, clarification packets, etc.).

## Knowledge Sources
- Internal: Task directory structure (`.devagent/workspace/tasks/README.md`), AGENTS.md template patterns, existing completed tasks for reference.

## Workflow
1. **Task identification:**
   - If task path provided: validate it exists in `active/` directory.
   - If task slug provided: search for matching directory in `active/` directory.
   - Extract task prefix and slug from directory name.
   - If not found: list available active tasks and request selection, or report error.

2. **Pre-move validation:**
   - Verify task directory exists in `active/`.
   - Check that `AGENTS.md` exists in task directory.
   - Verify `completed/` directory exists (create if needed).

3. **Completeness spot check:**
   - Read `AGENTS.md` and extract:
     - Implementation Checklist section (check for items marked `[ ]` or `[~]` indicating incomplete or partial work)
     - Open Questions section (check for unresolved items)
     - Progress Log (review recent entries for blockers or incomplete work)
   - Check for common gaps:
     - Missing plan document (if plan/ directory exists but is empty or missing expected files)
     - Missing research (if research/ directory exists but is empty)
     - Incomplete implementation tasks (checklist items not marked complete)
     - Unresolved open questions
     - Recent blockers mentioned in progress log
   - Compile findings into a summary:
     - List any incomplete checklist items
     - List any unresolved open questions
     - Note any obvious missing artifacts (plan, research, etc.)
     - Flag any recent blockers mentioned in progress log
   - **Present findings to user:**
     - If gaps found: Report findings clearly and ask "Do you want to proceed with marking this task as complete despite these gaps? (Some tasks may be 'good enough' even if not 100% complete.)"
     - If no gaps found: Report "Completeness check passed - no obvious gaps found. Proceeding with move."
     - **Pause for user confirmation** if gaps are found. Only proceed after user confirms they want to mark as complete despite gaps, or after gaps are addressed.
   - If user wants to address gaps first: Stop workflow and recommend addressing gaps before re-running.

4. **Update AGENTS.md:**
   - Read current `AGENTS.md`.
   - Update status from "Active" to "Complete".
   - Update Task Hub path from `active/` to `completed/`.
   - Append completion log entry: `- [YYYY-MM-DD] Event: Task moved to completed. Updated all status references and file paths from active/ to completed/ throughout task directory.`
   - Update "Last Updated" date to today (ISO: YYYY-MM-DD).
   - Write updated `AGENTS.md`.

5. **Update path references:**
   - Search all markdown files in task directory for references to `active/2025-12-27_<task-slug>` (using actual task prefix and slug).
   - For each file found:
     - Read file content.
     - Replace all occurrences of `active/<task_prefix>_<task_slug>` with `completed/<task_prefix>_<task_slug>`.
     - Write updated file.
   - Common files to check: `plan/*.md`, `research/*.md`, `clarification/*.md`, `AGENTS.md` (already updated).

6. **Move directory:**
   - **Pre-move validation:**
     - Check if destination directory already exists: `test -d .devagent/workspace/tasks/completed/<task_prefix>_<task_slug>/`
     - If destination exists: Report error "Destination directory already exists. This indicates a duplicate. The task may have been moved previously. Check both locations and resolve manually." and stop workflow.
   - Check if any files in the task directory are tracked by git (e.g., using `git ls-files` for the directory path).
   - If files are git-tracked:
     - **Pre-git-mv validation:** Check if destination exists in git index: `git ls-files .devagent/workspace/tasks/completed/<task_prefix>_<task_slug>/`
     - If destination exists in git index: Report error "Destination directory already exists in git index. This indicates a duplicate. The task may have been moved previously. Check both locations and resolve manually." and stop workflow.
     - Use `git mv` to move the directory from `.devagent/workspace/tasks/active/<task_prefix>_<task_slug>/` to `.devagent/workspace/tasks/completed/<task_prefix>_<task_slug>/`. This updates git's index to reflect the move (stages deletions from `active/` and additions at `completed/`), preventing git operations from restoring files to the old location.
   - If files are not git-tracked:
     - Use regular `mv` to move the directory from `.devagent/workspace/tasks/active/<task_prefix>_<task_slug>/` to `.devagent/workspace/tasks/completed/<task_prefix>_<task_slug>/`.
     - **Immediate post-mv verification:** Immediately after `mv`, verify source directory is gone: `test ! -d .devagent/workspace/tasks/active/<task_prefix>_<task_slug>/`
     - If source still exists: Report error "Move operation did not complete successfully. Source directory still exists, indicating a duplicate was created. Please remove the duplicate manually." and stop workflow.
   - Verify move was successful.

7. **Post-move verification:**
   - Confirm task directory exists in `completed/`.
   - **Explicit source existence check:** Immediately check if source directory still exists: `if [ -d ".devagent/workspace/tasks/active/<task_prefix>_<task_slug>/" ]; then echo "ERROR: Source still exists - duplicate created" && exit 1; fi`
   - If source still exists: Report error "Move operation did not complete successfully. Source directory still exists, indicating a duplicate was created. Please remove the duplicate manually." and stop workflow.
   - Confirm `AGENTS.md` in completed directory has status "Complete" and updated paths.
   - Verify all path references in completed directory point to `completed/` (not `active/`).
   - Report completion with summary of changes.

## Failure & Escalation
- Task not found in `active/`: List available tasks and request selection, or report error and stop.
- `AGENTS.md` missing: Report error and stop (required file).
- Path update fails: Report which files failed and continue with others.
- **Destination directory already exists:** Report error "Destination directory already exists. This indicates a duplicate. The task may have been moved previously. Check both locations and resolve manually." and stop workflow. Always require manual intervention for safety.
- **Destination exists in git index:** Report error "Destination directory already exists in git index. This indicates a duplicate. The task may have been moved previously. Check both locations and resolve manually." and stop workflow. Always require manual intervention for safety.
- Directory move fails: Report error and stop (critical operation).
- **Source directory still exists after move:** Report error "Move operation did not complete successfully. Source directory still exists, indicating a duplicate was created. Please remove the duplicate manually." and stop workflow. Always require manual intervention for safety.
- Git move fails for tracked files: If `git mv` fails and files are tracked, this may indicate git index issues; report error and stop (manual intervention may be required to resolve git state).
- `completed/` directory doesn't exist: Create it automatically.

## Expected Output
- **Completeness check:** Report of any incomplete tasks, unresolved questions, or missing artifacts found during spot check. User confirmation obtained if gaps found.
- **Directory moved:** Task directory now in `.devagent/workspace/tasks/completed/<task_prefix>_<task_slug>/`.
- **No copies in active/:** Verification confirms task directory no longer exists in `active/` directory. For git-tracked files, git's index is updated so git operations will not restore files to the old location.
- **Status updated:** `AGENTS.md` shows status "Complete" and updated Task Hub path.
- **Path references updated:** All files in task directory updated to reference `completed/` instead of `active/`.
- **Completion log:** Progress log entry added documenting the move.
- **Communication:** Summary of completeness check findings, user confirmation (if gaps found), and summary of changes including files updated and directory moved. Confirmation that no copies remain in active/.

## Follow-up Hooks
- Task is now archived in `completed/` for historical reference.
- No further action required unless a task needs to be reactivated (move back to `active/`).
