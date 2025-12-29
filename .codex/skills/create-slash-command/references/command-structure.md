# Slash Command Structure Reference

## Standard Command Template

All DevAgent commands follow this standardized structure:

```markdown
# Command Name (Command)

## Instructions

1. You will receive a prompt or context for this workflow.

2. Using only `.devagent/**`, follow the workflow steps and write outputs under `.devagent/workspace/` as the workflow specifies.

3. Follow the `.devagent/core/workflows/[workflow-name].md` workflow and execute it based on the following input:

---

**Input Context:**
```

## Command File Location

- **Source**: `.agents/commands/[command-name].md`
- **Symlink**: `.cursor/commands/[command-name].md` (symlinked from source)

## Naming Conventions

- **Format**: Kebab-case (lowercase with hyphens)
- **Examples**: `create-plan.md`, `research.md`, `clarify-feature.md`
- **Avoid**: Generic names like `help.md` or `test.md`

## Required Components

1. **Command Title**: Title case version of command name with "(Command)" suffix
2. **Instructions Section**: Standard execution instructions
3. **Workflow Reference**: Path to corresponding workflow in `.devagent/core/workflows/`
4. **Input Context Placeholder**: Placeholder for user input

## Workflow Correspondence

Every command must reference a corresponding workflow file:
- Workflow location: `.devagent/core/workflows/[workflow-name].md`
- Default: Workflow name matches command name
- Override: Can specify different workflow name if needed

## Symlink Requirements

Commands must be symlinked to `.cursor/commands/` for Cursor IDE integration:

```bash
# Relative symlink path
../../.agents/commands/[command-name].md → .cursor/commands/[command-name].md
```

## Integration Checklist

When creating a new command:

- [ ] Command file created in `.agents/commands/[command-name].md`
- [ ] Command follows standard template structure
- [ ] Workflow file referenced correctly
- [ ] Symlink created in `.cursor/commands/[command-name].md`
- [ ] Command added to `.agents/commands/README.md`

## Example: Complete Command Creation

```bash
# 1. Create command file
python3 scripts/create_command.py my-new-command

# 2. Create symlink
python3 scripts/create_symlink.py my-new-command

# 3. Update README (manual step)
# Add entry to .agents/commands/README.md
```
