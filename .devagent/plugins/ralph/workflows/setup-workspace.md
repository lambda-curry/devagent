# Setup Ralph Workspace

## Mission
- Primary goal: Validate the execution environment, prepare the git workspace, and ensure the correct branch is set up before a Ralph autonomous execution cycle begins.
- Boundaries / non-goals: Do not execute implementation tasks, generate PRs, modify task statuses beyond `in_progress` validation, or create git worktrees (user is responsible for worktree setup if needed).
- Success signals: The agent correctly identifies the Epic, creates or switches to the `ralph-<epic-id>` branch (dash-separated, in the current worktree), ensures the workspace is clean or stashed, and confirms the repository is ready for the main execution loop.

## Standard Instructions Reference
Before executing this workflow, review standard instructions in `.devagent/core/AGENTS.md` → Standard Workflow Instructions for:
- Metadata retrieval (get git config user.name)
- Context gathering order
- Standard guardrails

## Execution Directive
- Execute immediately without human-in-the-loop confirmation.
- If validation fails (e.g., Epic not found), report the error and stop the workflow to prevent `ralph.sh` from continuing.

## Inputs
- Required: Epic ID (e.g., `bd-1234`).
- Optional: Config file path (default: `.devagent/plugins/ralph/tools/config.json`).

## Workflow

### 1. Environment Validation
- Validate the Epic ID using `bd show <EPIC_ID> --json`. If the Epic does not exist, fail fast.
- Verify that `gh` CLI is installed and authenticated if remote push is expected.
- Check current git status. If there are uncommitted changes that are NOT part of the Ralph branch, decide whether to stash or fail based on project safety rules.

### 2. Git Branch Management
- Determine target branch: `ralph-<EPIC_ID>` (use dash, not slash, to avoid GitHub "fatal error in commit_refs" issue).
- **Important:** This workflow runs in the current worktree. The user is responsible for creating worktrees beforehand if isolation is desired.
- **Note**: Branch names with slashes (e.g., `ralph/<EPIC_ID>`) frequently fail to push with GitHub server errors. Use dash-separated names instead.
- If the branch does not exist:
  - Create it from the `main` branch (or configured base branch).
  - Push it to the remote origin to establish tracking.
- If the branch exists:
  - Switch to it.
  - Pull latest changes if tracking is configured.
- Ensure the branch is pushed/upstreamed so other agents or processes can see it.
- **Note:** Ralph will validate that the current branch is not `main` before proceeding with execution.

### 3. Workspace Preparation
- Ensure `beads.db` path is accessible and correctly exported in the environment.
- Confirm that the `AGENTS.md` instructions are readable and up-to-date for the main loop.
- Log a "Setup Complete" message with the current branch and Epic status.

## Failure Handling
- **Missing Epic:** Fail and report "Epic <ID> not found in Beads."
- **Dirty Workspace:** If uncommitted changes exist on a non-Ralph branch, fail and ask the user to clean up or stash manually.
- **Git Error:** Report the specific git error (e.g., "Permission denied on push") and stop.

## Expected Output
- A prepared git branch `ralph-<EPIC_ID>` (dash-separated, not slash).
- A "Setup Successful" report in the terminal.
- Workspace switched to the target branch.
