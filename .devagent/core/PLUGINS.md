# DevAgent Plugin System

Plugins extend DevAgent's capabilities with optional features while preserving core simplicity.

## Plugin Discovery

Plugins are discovered automatically by reading `plugin.json` manifest files in `.devagent/plugins/*/` directories.

### Plugin Manifest Structure

Each plugin must have a `plugin.json` file in its root directory:

```json
{
  "name": "<plugin-name>",
  "version": "<version>",
  "description": "<description>",
  "workflows": [
    "workflows/<workflow-name>.md"
  ],
  "commands": [
    "commands/<command-name>.md"
  ],
  "tools": [
    "tools/<tool-file>"
  ],
  "skills": [
    "skills/<skill-name>/SKILL.md"
  ]
}
```

### Required Fields

- `name`: Plugin identifier (alphanumeric, lowercase, hyphens allowed)
- `version`: Semantic version string (e.g., "0.1.0")
- `description`: Human-readable description

### Optional Fields

- `workflows`: Array of workflow markdown file paths (relative to plugin root)
- `commands`: Array of command markdown file paths (relative to plugin root)
- `tools`: Array of tool file paths (reference data, configs, etc.)
- `skills`: Array of skill markdown file paths (relative to plugin root)

## Plugin Configuration

The plugin configuration file (`.devagent/plugins.json`) is the source of truth for enabled plugins. Only plugins listed in this file are installed, updated, and wired into the environment.

### Configuration Structure

The configuration file is a simple JSON object with a `plugins` array:

```json
{
  "plugins": [
    {
      "name": "ralph"
    },
    {
      "name": "another-plugin"
    }
  ]
}
```

### Configuration Rules

- **Source of Truth:** Plugins not listed in `.devagent/plugins.json` will be ignored by install/update tools.
- **Opt-in:** You must explicitly add a plugin to this file to enable it.
- **Name Format:** Plugin names must match the directory name in `.devagent/plugins/<name>/` and the `name` field in the plugin's `plugin.json`.
- **Validation:** 
  - The file must be valid JSON.
  - Duplicate plugin names are not allowed.
  - Plugins listed must eventually exist (though the system will report missing plugins rather than crash).

## Plugin Management

**Enabling a Plugin:**
1. Add the plugin object `{"name": "<plugin-name>"}` to `.devagent/plugins.json`.
2. Run the DevAgent update command (e.g., `devagent update-devagent`).
3. The system will install/update the plugin and wire its commands and skills.

**Disabling/Removing a Plugin:**
1. Remove the plugin entry from `.devagent/plugins.json`.
2. Run the DevAgent update command.
3. Use the plugin deletion flow (if implemented) or manually remove artifacts if needed (future automation will handle cleanup).

**Plugin Wiring:**
- **Commands:** Plugin commands are symlinked to `.cursor/commands/`.
- **Skills:** Plugin skills are installed to `.cursor/skills/<skill-name>/`. You can manually create symlinks to other directories (like `.codex/skills/` or `.claude/skills/`) if your environment requires them.

### Compatibility Symlinks

If you need your skills to be available in other directories for compatibility with different tools, you can create symlinks pointing to the canonical `.cursor/skills/` location:

**Codex Compatibility:**
```bash
# Create the directory if it doesn't exist
mkdir -p .codex/skills
# Symlink a specific skill
ln -sf "../../.cursor/skills/<skill-name>" ".codex/skills/<skill-name>"
```

**Claude/Anthropic Compatibility:**
```bash
# Create the directory if it doesn't exist
mkdir -p .claude/skills
# Symlink a specific skill
ln -sf "../../.cursor/skills/<skill-name>" ".claude/skills/<skill-name>"
```

### Asset Synchronization

The `sync-plugin-assets.sh` script handles the wiring of plugin assets. It reads the `plugin.json` manifest and creates the necessary symlinks.

```bash
# Usage
./.devagent/core/scripts/sync-plugin-assets.sh <plugin-name>
```

## Plugin Lifecycle Scripts

Plugins can provide lifecycle scripts to handle setup and cleanup.

### setup.sh

Located at `.devagent/plugins/<plugin>/setup.sh`.
- **Purpose:** Perform local setup for the plugin.
- **Behavior:** Should be idempotent. Typically calls `sync-plugin-assets.sh` to wire assets.
- **Dependencies:** Should NOT install system dependencies (apt, brew, npm global) without explicit user confirmation/instructions.

### delete.sh

Located at `.devagent/plugins/<plugin>/delete.sh`.
- **Purpose:** Clean up plugin assets.
- **Behavior:** Removes symlinks and artifacts created by the plugin.
- **Scope:** Should only remove what it installed.

## Troubleshooting

**Plugin not showing up:**
- Check if it is listed in `.devagent/plugins.json`.
- Run `devagent update-devagent` to force a sync.
- Check if `plugin.json` exists and is valid.

**Symlinks broken:**
- Run `./.devagent/plugins/<plugin>/setup.sh` or the update command to repair symlinks.
- Verify paths in `plugin.json`.

**Dependency errors:**
- Plugins may require external tools (e.g., `jq`, `gh`). Check the plugin's documentation or `plugin.json` description.

## Plugin Skills

Plugins can include skills in `skills/` directory following the skill structure:

- `skills/<skill-name>/SKILL.md` - Skill definition
- `skills/<skill-name>/references/` - Reference documentation

Skills are only available when the plugin is installed and should be symlinked to `.cursor/skills/` during installation.

## Plugin Workflows and Commands

Plugin workflows and commands follow the same structure as core DevAgent workflows:

- Workflows: `.devagent/plugins/<plugin>/workflows/<name>.md`
- Commands: `.devagent/plugins/<plugin>/commands/<name>.md`

These are referenced from the plugin manifest and integrated into DevAgent's workflow system.

## Error Handling

**Invalid Manifest:**
- If `plugin.json` is missing required fields, skip plugin
- Report error with plugin name and missing fields

**Duplicate Plugins:**
- If multiple plugins have same name, use first discovered
- Log warning for duplicate names

**Missing Files:**
- If workflow/command/skill files referenced in manifest don't exist, log warning
- Skip missing files, continue with available files

## Reference Documentation

- **Plugin Examples**: See `.devagent/plugins/ralph/` for example plugin structure
- **Workflow Patterns**: See `.devagent/core/workflows/` for workflow structure
- **Command Patterns**: See `.agents/commands/` for command structure
- **Skill Patterns**: See `.cursor/skills/` for skill structure
