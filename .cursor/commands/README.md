# DevAgent Commands

This directory contains command files that provide a standardized interface for executing DevAgent workflows.

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

## Available Commands

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

## How to Use

1. Copy the desired command file
2. Replace the "Input Context:" section with your specific requirements
3. Execute the command using your preferred AI agent or workflow system

## Integration

These command files are automatically updated when running the DevAgent core update script (`devagent update-core.sh`), ensuring they stay synchronized with the latest workflow definitions.

## Cursor Integration

To make these commands available in Cursor, you can create symlinks from the `.cursor/commands` directory to this directory:

### Setup Symlinks

1. **Create the .cursor/commands directory** (if it doesn't exist):
   ```bash
   mkdir -p .cursor/commands
   ```

2. **Create symlinks for all commands**:
   ```bash
   # From the project root directory
   ln -sf ../.agents/commands/* .cursor/commands/
   ```

3. **Verify the symlinks were created**:
   ```bash
   ls -la .cursor/commands/
   ```

### Alternative: Single Symlink to Directory

If you prefer to symlink the entire directory instead of individual files:

```bash
# From the project root directory
ln -sf .agents/commands .cursor/commands
```

### Usage in Cursor

Once symlinked, you can:
- Access commands through Cursor's command palette
- Use them in Cursor's AI chat interface
- Reference them in Cursor rules or configurations

### Updating Symlinks

When new commands are added, you may need to recreate the symlinks:

```bash
# Remove existing symlinks
rm .cursor/commands/*

# Recreate symlinks
ln -sf ../.agents/commands/* .cursor/commands/
```
