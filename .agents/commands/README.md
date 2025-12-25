# DevAgent Commands

This directory contains command files that provide a standardized interface for executing DevAgent workflows.

## Usage

Each command file follows the same structure:

1. **Command Name** - The name of the workflow being executed
2. **Instructions** - Standard instructions for execution
3. **Input Context** - Placeholder for the specific input to be provided

## Available Commands

- `brainstorm.md` - Facilitates structured ideation to generate, cluster, and prioritize feature candidates
- `build-workflow.md` - Designs high-quality agent prompts and instruction sheets
- `clarify-feature.md` - Validates requirement completeness through structured clarification sessions
- `create-plan.md` - Synthesizes research into comprehensive plans combining product context and implementation tasks
- `create-task-prompt.md` - Converts plans or backlog issues into AI-ready task prompts
- `new-feature.md` - Scaffolds a minimal feature hub from a short description
- `research.md` - Maps open questions and gathers vetted references
- `review-progress.md` - Reviews progress on active features and tasks
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
