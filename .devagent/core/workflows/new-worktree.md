# New Worktree

## Mission
- Primary goal: Create a new git worktree and optionally migrate uncommitted work from the current worktree to the new worktree, enabling concurrent feature development without context switching or stashing conflicts.
- Boundaries / non-goals: Do not automatically remove worktrees, commit changes, or integrate with CI/CD systems. This workflow focuses on worktree creation and safe work migration only.
- Success signals: A new worktree exists at the specified path with the correct branch checked out, uncommitted work (if migrated) is preserved in the new worktree, the main worktree state is appropriate (clean if migration occurred, unchanged if no migration), and the current working directory is switched to the new worktree.

## Standard Instructions Reference
Before executing this workflow, review standard instructions in `.devagent/core/AGENTS.md` → Standard Workflow Instructions for:
- Date handling
- Metadata retrieval
- Context gathering order
- Standard guardrails
- Storage patterns

## Execution Directive
Follow standard execution directive in `.devagent/core/AGENTS.md` → Standard Workflow Instructions.

## Inputs
- Required: None (workflow can proceed with defaults)
- Optional:
  - Branch name (if not provided, derive from path or use default pattern)
  - Worktree path (if not provided, use default pattern: `.devagent/worktrees/<branch-name>`)
  - Base branch/commit (default: current HEAD)
- Missing info protocol: Proceed with sensible defaults if optional inputs are missing. If critical information is ambiguous (e.g., path conflicts), pause and request clarification. If uncommitted work is detected, prompt user for intent (migrate, leave, or abort).

## Resource Strategy
- Target worktree: New git worktree at specified or derived path
- Git operations: Use `git worktree` commands following research recommendations (`.devagent/workspace/tasks/active/2026-01-14_git-workspace-setup-workflow/research/2026-01-14_workspace-best-practices-research.md`)
- Uncommitted work migration: Use stash → create worktree → apply stash pattern (safest, preserves git history)

## Knowledge Sources
- Internal: Research packet on workspace best practices, existing workflow patterns (`.devagent/core/workflows/`), constitution delivery principles (`.devagent/workspace/memory/constitution.md` C3, C4)
- External: Git worktree documentation (https://git-scm.com/docs/git-worktree)

## Workflow
1. **Kickoff / readiness checks**
   - Verify we're in a git repository: Run `git rev-parse --git-dir` to confirm
   - Check git version supports worktrees: Verify git 2.5+ (worktree support introduced in 2.5)
   - Get current date: Review Standard Workflow Instructions in `.devagent/core/AGENTS.md` for date handling
   - Determine owner: Review Standard Workflow Instructions in `.devagent/core/AGENTS.md` for metadata retrieval

2. **Input processing**
   - Ensure worktrees directory exists: Create `.devagent/worktrees/` directory if it doesn't exist
   - Parse optional inputs:
     - Branch name: Use provided name, or derive from path (e.g., `.devagent/worktrees/feature-x` → `feature-x`), or use default pattern `worktree-<timestamp>`
     - Worktree path: Use provided path, or derive from branch name (default: `.devagent/worktrees/<branch-name>`)
     - Base branch/commit: Use provided base or default to current HEAD
   - Validate inputs:
     - Check path doesn't already exist (if it does, pause and request alternative)
     - Verify branch name doesn't conflict with existing branches (if it does, pause and request alternative)
     - Ensure worktree path is within `.devagent/worktrees/` directory (if custom path provided, validate it's in this directory)

3. **Check for uncommitted work and prompt user**
   - Check git status: Run `git status --short` to detect uncommitted changes
   - If uncommitted work exists:
     - Display the uncommitted changes to the user (show `git status` output)
     - Prompt user with clear options:
       - **Migrate**: Stash the work and move it to the new worktree (recommended if work is related to the new feature)
       - **Leave**: Keep the work in the current worktree and create the new worktree clean (recommended if work is unrelated)
       - **Abort**: Cancel worktree creation and keep working in current location
     - Wait for user decision (per Constitution C3 - human-in-the-loop defaults)
     - If user chooses "Migrate": Set migration flag to true
     - If user chooses "Leave": Set migration flag to false, proceed with worktree creation
     - If user chooses "Abort": Stop workflow and return to current state
   - If no uncommitted work exists: Proceed directly to safety checks

4. **Safety checks**
   - Verify not attempting to remove main worktree (main worktree cannot be removed)
   - Check for existing worktrees at target path: Run `git worktree list` and verify path is not in use
   - If migrating uncommitted work:
     - Verify stash won't conflict: Check if there are existing stashes that might cause confusion
   - Check git worktree limits: Git typically allows 2-3 worktrees per repository (configurable); if limit reached, pause with clear error message

5. **Uncommitted work migration (if user chose to migrate)**
   - Stash current work: Run `git stash push -m "Migrating to worktree <branch-name>"`
   - Verify stash succeeded: Check `git stash list` to confirm stash was created
   - Note: Stash will be applied in new worktree in step 6

6. **Worktree creation**
   - Create worktree with branch: Run `git worktree add -b <branch-name> <path> [<base-commit>]`
     - If base-commit not provided, use current HEAD
     - If branch already exists, use `-B` to force or pause with error
   - Verify worktree creation: Run `git worktree list` to confirm new worktree appears
   - Switch to new worktree: Change to new worktree directory: `cd <path>` (this becomes the current working directory)
   - If user chose to migrate uncommitted work:
     - Apply stash: Run `git stash pop` (or `git stash apply` if you want to keep stash)
     - Verify work applied: Check `git status` in new worktree

7. **Validation and summary**
   - Verify worktree exists: Run `git worktree list` and confirm new worktree is listed
   - Verify branch is correct: Check `git branch` (we're now in the new worktree) to confirm branch name
   - Verify current directory: Confirm we're in the new worktree directory
   - If migration occurred:
     - Verify work is in new worktree: Run `git status` to confirm uncommitted work is present
   - Generate summary:
     - Worktree path: `<absolute-path>` (current working directory)
     - Branch name: `<branch-name>`
     - Uncommitted work migrated: Yes/No
     - Current directory: Now in new worktree (ready to work)

8. **Output packaging**
   - Print summary with worktree path, branch name, and migration status
   - Confirm current directory is the new worktree (user is ready to start working)
   - Provide next-step recommendations (start working, cleanup when done with `git worktree remove <path>`)
   - Note: Changes are left as open (worktree created, no commits made by workflow)

## Failure & Escalation
- Not in git repository: Stop and report error; user must be in a git repository to create worktrees
- Git version too old: Stop and report error; git 2.5+ required for worktree support
- Path already exists: Pause and request alternative path or confirmation to use existing
- Branch name conflict: Pause and request alternative branch name
- Worktree limit reached: Stop with clear error message explaining git's worktree limits
- Stash failure (if user chose to migrate): Stop and report error; user may need to commit or discard changes manually
- Worktree creation failure: Stop and report git error message
- Stash apply failure (if user chose to migrate): Report warning but don't fail; worktree created, user can manually resolve stash conflicts

## Expected Output
- **Artifact:** New git worktree at specified path with branch checked out
- **Communication:** Summary including worktree path, branch name, migration status, and confirmation that current directory is the new worktree
- **State changes:**
  - New worktree created and linked to repository
  - Current working directory switched to new worktree
  - If migration occurred: Main worktree clean, uncommitted work in new worktree
  - If no migration: Both worktrees unchanged (new worktree is empty checkout)

## Follow-up Hooks
- **Cleanup:** When done with worktree, user can run `git worktree remove <path>` to clean up
- **Stale metadata:** If worktree directory is manually deleted, run `git worktree prune` to clean up administrative files
- **Integration:** This workflow can be referenced by other workflows or tools that need worktree management

## Related Workflows
- **Companion:** Git-workspace skill (`.cursor/skills/git-workspace/SKILL.md`) provides automatic discovery of git worktree operations
- **Predecessor:** None (standalone workflow)
- **Successor:** Direct execution using the new worktree
