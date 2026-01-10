# DevAgent Plugin System

This directory contains the plugin system infrastructure for DevAgent. Plugins extend DevAgent's capabilities with optional features while preserving core simplicity.

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

## Plugin Registry

The plugin registry (`plugin-registry.json`) tracks installed plugins:

```json
{
  "installed": [
    {
      "name": "<plugin-name>",
      "version": "<version>",
      "path": "<absolute-path-to-plugin>"
    }
  ]
}
```

### Manual Registry Management

The registry is a simple JSON file that can be edited directly:

1. **Register Plugin:**
   - Add entry to `installed` array with name, version, and path
   - Sort entries alphabetically by name

2. **Unregister Plugin:**
   - Remove entry from `installed` array

3. **Update Plugin:**
   - Update `version` field in registry entry

### Automatic Discovery

To discover all plugins in `.devagent/plugins/`:

1. Scan `.devagent/plugins/` for directories
2. Check each directory for `plugin.json` file
3. Validate manifest (check required fields)
4. Register or update in `plugin-registry.json`

## Plugin Installation

**Manual Installation:**
1. Copy plugin directory to `.devagent/plugins/<plugin-name>/`
2. Verify `plugin.json` exists and is valid
3. Add entry to `plugin-registry.json` manually

**Automatic Discovery:**
- Plugins in `.devagent/plugins/` are automatically discoverable
- Registry can be synced to reflect all discovered plugins

## Plugin Skills

Plugins can include skills in `skills/` directory following the skill structure:

- `skills/<skill-name>/SKILL.md` - Skill definition
- `skills/<skill-name>/references/` - Reference documentation

Skills are only available when the plugin is installed and should be copied to `.codex/skills/` during installation.

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
- **Skill Patterns**: See `.codex/skills/` for skill structure
