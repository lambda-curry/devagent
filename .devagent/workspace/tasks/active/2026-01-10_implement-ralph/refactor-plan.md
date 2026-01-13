# Refactor Plan: Remove Python Scripts from Ralph Plugin

## Problem Statement

The Ralph plugin currently uses Python scripts to:
1. Parse markdown plans and convert to Beads JSON (`convert-plan.py`)
2. Detect project type and select quality gates (`configure-quality-gates.py`)
3. Manage plugin registry (`plugin-manager.py`)
4. Wrap Beads CLI commands (`ralph-beads-bridge.py`)
5. Orchestrate the workflow (`workflow-bridge.py`)

**However**, DevAgent's execution model is that AI agents read markdown instructions and perform actions directly. Python scripts are unnecessary and conflict with this model.

From `.agents/commands/README.md`:
> **DO NOT attempt to execute it as a shell command**. These are instructional markdown files.
> 
> **Correct Protocol:**
> 1. **Read**: Use the `read_file` tool to retrieve the content
> 2. **Interpret**: Analyze the steps and workflows defined within the file
> 3. **Execute**: Autonomously perform the actions using your standard toolset

## What Can Be Replaced

| Python Script | What It Does | Replacement |
|--------------|--------------|-------------|
| `convert-plan.py` | Parses markdown with regex, extracts tasks, generates JSON | Markdown instructions + skill for plan-to-Beads conversion |
| `configure-quality-gates.py` | Checks for `pyproject.toml`, `tsconfig.json`, etc., selects template | Markdown instructions: check for files, read matching quality gate JSON |
| `plugin-manager.py` | Manages `plugin-registry.json`, discovers plugins | JSON file + markdown instructions for reading/discovering plugins |
| `ralph-beads-bridge.py` | Wraps `bd` CLI commands with error handling | Markdown instructions: run `bd` commands directly with error handling |
| `workflow-bridge.py` | Orchestrates conversion → quality gates → config → execution | Enhanced workflow markdown with step-by-step instructions |

## Proposed Solution

### 1. Enhanced Workflow Markdown
Replace script references in `.devagent/plugins/ralph/workflows/execute-autonomous.md` with detailed step-by-step instructions that the AI agent can follow.

### 2. Create Skills
- **Plan-to-Beads Conversion Skill**: Instructions for reading a DevAgent plan markdown and generating Beads-compatible JSON
- **Quality Gate Detection Skill**: Instructions for detecting project type and selecting appropriate quality gate template
- **Beads Integration Skill**: Instructions for using the `bd` CLI commands

### 3. Keep Reference JSON Files
- Quality gate templates (`quality-gates/*.json`) - as reference data
- Beads schema (`templates/beads-schema.json`) - as reference structure
- Plugin manifest (`plugin.json`) - for plugin metadata
- Config template (`tools/config.json`) - as example/reference

### 4. Simplify Plugin System
- Remove `plugin-manager.py` and `plugin_interface.py` Python code
- Replace with markdown instructions for reading `plugin.json` files
- Keep `plugin-registry.json` as a simple JSON file that can be edited directly

## Benefits

1. **Consistency**: Aligns with DevAgent's markdown-based execution model
2. **Simplicity**: No Python dependencies or execution overhead
3. **Transparency**: All logic visible in markdown, easier to understand and modify
4. **Flexibility**: AI agents can adapt instructions based on context
5. **Maintainability**: Easier to update workflows by editing markdown

## Migration Steps

1. Create detailed workflow instructions replacing script calls
2. Create skills for plan conversion, quality gate detection, and Beads integration
3. Update plugin system to use markdown-based discovery
4. Remove Python scripts
5. Update documentation and plugin manifest
