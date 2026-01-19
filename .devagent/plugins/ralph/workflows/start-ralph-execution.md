# Start Ralph Execution (Ralph Plugin)

## Mission
Start Ralph's autonomous execution loop. This workflow assumes Ralph is already configured (see `setup-ralph-loop.md` for full setup) and focuses on launching execution.

## Prerequisites
- Ralph configuration exists at `.devagent/plugins/ralph/tools/config.json` with required `git` section:
  - `git.base_branch`: Base branch name (e.g., "main")
  - `git.working_branch`: Working branch name (e.g., "ralph-<plan-title-slug>")
- Beads tasks have been imported (completed in `setup-ralph-loop.md`)
- AI tool is configured and available
- Epic ID is available
- Working branch exists locally and current branch matches `git.working_branch` in config
- **Note:** `setup-ralph-loop.md` does **not** create or switch git branches. Ensure your working branch is created/checked out before starting.

## Standard Instructions Reference
Before executing this workflow, review standard instructions in `.devagent/core/AGENTS.md` → Standard Workflow Instructions for date handling, metadata retrieval, context gathering order, and storage patterns.

## Workflow Steps

### Step 1: Start Ralph

**Objective:** Launch Ralph's autonomous execution loop.

**Instructions:**
1. Navigate to the project root directory.
2. Execute the Ralph script with the required Epic ID:
   ```bash
   # Run for a specific Epic (Required)
   # Pipe through cat to prevent interactive pager from opening
   .devagent/plugins/ralph/tools/ralph.sh --epic <epic-id> 2>&1 | cat
   ```
   - Alternative (with logging): `.devagent/plugins/ralph/tools/ralph.sh --epic <epic-id> > logs/ralph/<epic-id>.log 2>&1`
   - Do NOT run without piping to `cat` or logging, as output may trigger an interactive pager that's difficult to exit
3. The script will:
   - Load configuration from `.devagent/plugins/ralph/tools/config.json`
   - Validate required `git` section (base_branch, working_branch)
   - Validate Epic exists in Beads database (`bd show <epic-id>`)
   - Validate working branch exists and current branch matches config
   - Enter an autonomous loop:
     - Select the next ready task from Beads (filtered by Epic)
     - Invoke the AI tool with task context
     - Wait for task completion
     - Run quality gates
     - Update task status in Beads
     - Repeat until all tasks are complete or max iterations reached

**Note:** No logging is needed - Ralph handles its own execution tracking through Beads comments and Git commits. Simply start the script and leave it running.

**Cleanup:**
Worktrees are created in `../ralph-worktrees/`. After the epic is complete and PR merged, you can delete the worktree manually:
```bash
git worktree remove ../ralph-worktrees/<epic-id> --force
```

## How the Autonomous Loop Works

Ralph operates in a continuous loop:

1. **Task Selection:** Query Beads for the next ready task (status `todo`, dependencies satisfied)
2. **AI Tool Invocation:** Call the configured AI tool (Cursor, OpenCode, etc.) with:
   - Full task context from Beads (`bd show <task-id>`)
   - Acceptance criteria
   - Related task dependencies
   - Agent instructions from `.devagent/plugins/ralph/AGENTS.md`
3. **Execution:** AI agent implements the task according to acceptance criteria
4. **Quality Gates:** Run configured quality gate commands (test, lint, typecheck, etc.)
5. **Status Update:** Update task status in Beads (`closed`, `blocked`, or `in_progress`)
6. **Repeat:** Continue with next ready task until completion or iteration limit

Monitor progress through:
- Beads comments: `bd show <task-id>` to see task progress
- Git history: Commits follow conventional commit format with task references
- Task status: `bd ready --parent <EPIC_ID> --limit 200` to see remaining tasks (default limit is 10)

## Error Handling

- **Configuration missing:** If `config.json` is not found at `.devagent/plugins/ralph/tools/config.json`, error and refer to `setup-ralph-loop.md` for setup
- **Git configuration missing:** If `git` section or required fields (`base_branch`, `working_branch`) are missing, script fails with clear error message
- **Working branch doesn't exist:** Script fails immediately if `working_branch` from config doesn't exist locally
- **Wrong branch:** Script fails immediately if current branch doesn't match `working_branch` from config
- **Epic not found:** Script fails immediately if Epic ID doesn't exist in Beads database
- **AI tool unavailable:** If the configured AI tool command is not found, pause and report error
- **Beads errors:** Task selection or status update failures are logged by Ralph script

## Output

Ralph runs continuously until:
- All tasks are completed (`status: closed`)
- Maximum iterations reached (configured in `config.json`)
- Manual interruption (Ctrl+C)

Execution artifacts (commits, Beads updates, comments) are tracked in the repository and Beads database respectively.
