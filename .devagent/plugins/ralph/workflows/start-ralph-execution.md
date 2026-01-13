# Start Ralph Execution (Ralph Plugin)

## Mission
Start Ralph's autonomous execution loop. This workflow assumes Ralph is already configured (see `execute-autonomous.md` for full setup) and focuses on launching execution.

## Prerequisites
- Ralph configuration exists at `.devagent/plugins/ralph/output/ralph-config.json`
- Beads tasks have been imported (completed in `execute-autonomous.md`)
- AI tool is configured and available
- You're on a safe branch for autonomous work

## Standard Instructions Reference
Before executing this workflow, review standard instructions in `.devagent/core/AGENTS.md` → Standard Workflow Instructions for date handling, metadata retrieval, context gathering order, and storage patterns.

## Workflow Steps

### Step 1: Start Ralph

**Objective:** Launch Ralph's autonomous execution loop.

**Instructions:**
1. Navigate to the project root directory.
2. Execute the Ralph script:
   ```bash
   .devagent/plugins/ralph/tools/ralph.sh
   ```
3. The script will:
   - Load configuration from `.devagent/plugins/ralph/output/ralph-config.json`
   - Enter an autonomous loop:
     - Select the next ready task from Beads
     - Invoke the AI tool with task context
     - Wait for task completion
     - Run quality gates
     - Update task status in Beads
     - Repeat until all tasks are complete or max iterations reached

**Note:** No logging is needed - Ralph handles its own execution tracking through Beads comments and Git commits. Simply start the script and leave it running.

## How the Autonomous Loop Works

Ralph operates in a continuous loop:

1. **Task Selection:** Query Beads for the next ready task (status `ready`, dependencies satisfied)
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
- Task status: `bd ready` to see remaining tasks

## Error Handling

- **Configuration missing:** If `ralph-config.json` is not found, error and refer to `execute-autonomous.md` for setup
- **AI tool unavailable:** If the configured AI tool command is not found, pause and report error
- **Beads errors:** Task selection or status update failures are logged by Ralph script

## Output

Ralph runs continuously until:
- All tasks are completed (`status: closed`)
- Maximum iterations reached (configured in `ralph-config.json`)
- Manual interruption (Ctrl+C)

Execution artifacts (commits, Beads updates, comments) are tracked in the repository and Beads database respectively.
