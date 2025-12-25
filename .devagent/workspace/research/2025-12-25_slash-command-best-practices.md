# Slash Command Best Practices

- Owner: DevAgent Team
- Last Updated: 2025-12-25
- Status: Research
- Related Feature Hub: Skill creation for slash command generation

## Summary

Best practices for creating effective slash commands in Cursor IDE, based on DevAgent's command structure and industry standards.

## Command File Structure

DevAgent commands follow a standardized structure:

1. **Command Name** - Title of the workflow being executed
2. **Instructions** - Standard execution instructions
3. **Input Context** - Placeholder for specific input

### Example Structure

```markdown
# Command Name (Command)

## Instructions

1. You will receive a prompt or context for this workflow.

2. Using only `.devagent/**`, follow the workflow steps and write outputs under `.devagent/workspace/` as the workflow specifies.

3. Follow the `.devagent/core/workflows/[workflow-name].md` workflow and execute it based on the following input:

---

**Input Context:**
```

## Best Practices

### 1. Command Naming

- **Descriptive and Action-Oriented**: Use clear names that convey the command's purpose
  - Good: `create-plan.md`, `research.md`, `clarify-feature.md`
  - Avoid: Generic names like `help.md` or `test.md`

- **Kebab-Case**: Use lowercase with hyphens for multi-word commands
  - Example: `run-codegen-background-agent.md`

- **Consistent Formatting**: Match naming conventions across all commands

### 2. Command Structure

- **Clear Directives**: Begin with straightforward instructions
- **Structured Format**: Use consistent sections (Instructions, Input Context)
- **Focused Scope**: Each command should address a single, well-defined task
- **Workflow Reference**: Always reference the corresponding workflow file in `.devagent/core/workflows/`

### 3. Symlink Management

Commands must be symlinked from `.agents/commands/` to `.cursor/commands/` for Cursor IDE integration:

```bash
# Create symlink for a single command
ln -sf ../../.agents/commands/[command-name].md .cursor/commands/[command-name].md

# Create symlinks for all commands
ln -sf ../.agents/commands/* .cursor/commands/
```

### 4. Integration Requirements

- **Workflow Correspondence**: Every command should have a corresponding workflow in `.devagent/core/workflows/`
- **README Updates**: Add new commands to `.agents/commands/README.md`
- **Symlink Verification**: Ensure symlinks are created and working correctly

### 5. Command Content Guidelines

- **Reference Workflow**: Always reference the specific workflow file path
- **Input Context Placeholder**: Provide a clear placeholder for user input
- **Execution Instructions**: Include standard instructions for workflow execution
- **Scope Limitation**: Specify that only `.devagent/**` should be used

## Command Creation Workflow

When creating a new command:

1. Create command file in `.agents/commands/[command-name].md`
2. Follow the standard template structure
3. Reference the corresponding workflow file
4. Create symlink to `.cursor/commands/[command-name].md`
5. Update `.agents/commands/README.md` with the new command

## Common Patterns

### Pattern 1: Simple Workflow Command
```markdown
# Research (Command)

## Instructions

1. You will receive a prompt or context for this workflow.

2. Using only `.devagent/**`, follow the workflow steps and write outputs under `.devagent/workspace/` as the workflow specifies.

3. Follow the `.devagent/core/workflows/research.md` workflow and execute it based on the following input:

---

**Input Context:**
```

### Pattern 2: Command with Additional Context
Some commands may include additional setup or context requirements, but should still follow the base structure.

## Validation Checklist

- [ ] Command file exists in `.agents/commands/`
- [ ] Command follows standard structure
- [ ] Workflow file is referenced correctly
- [ ] Symlink exists in `.cursor/commands/`
- [ ] Command is listed in `.agents/commands/README.md`
- [ ] Command name is descriptive and kebab-case
- [ ] Input Context placeholder is present
