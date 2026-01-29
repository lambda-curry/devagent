# DevAgent Commands

This directory contains symlinks to DevAgent command files. The **source of truth** for all core commands is in `.devagent/core/commands/`.

## Architecture

**Multi-agent consistency** is maintained through the ai-rules system:

- **Source**: `.devagent/core/commands/` — Core DevAgent commands (20 files)
- **Symlinks in `.cursor/commands/`** — Point to core source (direct access for Cursor)
- **Symlinks in `ai-rules/commands/`** — Consumed by `ai-rules generate`
- **Generated outputs**:
  - `.claude/commands/ai-rules/` — Generated for Claude Code (21 commands)
  - `.cursor/commands/ai-rules/` — Generated for Cursor (20 commands)

When you run `ai-rules generate`, all commands from `ai-rules/commands/` are copied to agent-specific directories, making them available as agent capabilities.

## Usage

Each command file follows the same structure:

1. **Command Name** - The name of the workflow being executed
2. **Instructions** - Standard instructions for execution
3. **Input Context** - Placeholder for the specific input to be provided

## Important Note for AI Agents

When you encounter a reference to a command file (e.g., `@.agents/commands/research.md` or `.agents/commands/create-plan.md`), **DO NOT attempt to execute it as a shell command**. These are instructional markdown files.

**Correct Protocol:**
1. **Read**: Use the `read_file` tool to retrieve the content of the referenced markdown file
2. **Interpret**: Analyze the steps and workflows defined within the file
3. **Execute**: Autonomously perform the actions described in the file using your standard toolset (e.g., `write_file`, `run_terminal_cmd`, `search_replace`)

Command files are templates that reference workflows in `.devagent/core/workflows/` and provide structured input placeholders. They are meant to be read and followed, not executed as commands.

## Available Commands (Core DevAgent)

- `brainstorm.md` - Facilitates structured ideation to generate, cluster, and prioritize idea candidates
- `build-workflow.md` - Designs high-quality agent prompts and instruction sheets
- `clarify-task.md` - Validates requirement completeness through structured clarification sessions
- `create-plan.md` - Synthesizes research into comprehensive plans combining product context and implementation tasks
- `execute-full-task.md` - Executes a full task lifecycle end-to-end with complexity-based routing
- `implement-plan.md` - Executes implementation tasks from plan documents, performing coding work sequentially and tracking progress in AGENTS.md files
- `handoff.md` - Generates a structured handoff prompt for starting a new agent thread while preserving current context
- `mark-task-complete.md` - Moves a completed task (task hub) from active/ to completed/ status, updating all status references and path references
- `new-task.md` - Scaffolds a minimal task hub from a short description
- `new-worktree.md` - Creates a new git worktree and optionally migrates uncommitted work
- `research.md` - Maps open questions and gathers vetted references
- `review-progress.md` - Reviews progress on active tasks
- `review-pr.md` - Reviews pull requests by analyzing code changes, validating against Linear issue requirements, and checking code quality
- `compare-prs.md` - Compares multiple pull requests accomplishing the same task to determine which is better to work with
- `update-constitution.md` - Updates the project constitution and related governance documents
- `update-devagent.md` - Updates DevAgent core files, commands, and skills from the repository and provides a summary of changes
- `update-product-mission.md` - Co-creates the product mission and supporting assets
- `update-tech-stack.md` - Creates or updates comprehensive tech stack documentation
- `verify-plugins.md` - Verifies plugin installation and wiring

## Adding New Core Commands

To add a new core DevAgent command:

1. **Create the source file** in `.devagent/core/commands/`:
   ```bash
   touch .devagent/core/commands/my-new-command.md
   ```

2. **Create symlinks** in both locations:
   ```bash
   ln -s ../../.devagent/core/commands/my-new-command.md .cursor/commands/my-new-command.md
   ln -s ../../.devagent/core/commands/my-new-command.md ai-rules/commands/my-new-command.md
   ```

3. **Run ai-rules generate** to create agent-specific versions:
   ```bash
   ai-rules generate
   ```

4. **Commit both source and generated files**:
   ```bash
   git add .devagent/core/commands/ ai-rules/commands/ .claude/commands/ .cursor/commands/
   git commit -m "feat: add new command (my-new-command)"
   ```

## Ralph Plugin Commands

Ralph-specific commands remain in `.devagent/plugins/ralph/commands/` and are NOT migrated to the core:
- `setup-ralph-loop.md` - Setup Ralph execution loop
- `start-ralph-execution.md` - Start Ralph execution
- `ralph-e2e-setup.md` - Ralph E2E setup
- `ralph-e2e-orchestration-setup.md` - Ralph E2E orchestration
- `run-review-report.md` - Generate review report

These plugin commands follow the same symlink pattern but stay plugin-scoped.

## Syncing Commands Across Agents

Commands are kept in sync across all agents using the ai-rules system:

```bash
# Check sync status
ai-rules status

# Regenerate all agent-specific commands
ai-rules generate

# Verify sync is complete
ai-rules status
```

**Important:** Always commit both source files (`.devagent/core/commands/`) and generated files (`.claude/commands/ai-rules/`, `.cursor/commands/ai-rules/`, etc.) together to ensure multi-agent consistency.
