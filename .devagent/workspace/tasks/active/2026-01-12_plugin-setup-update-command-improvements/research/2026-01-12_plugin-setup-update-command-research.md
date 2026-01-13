# Research Packet — Plugin Setup and Update Command Improvements

- Mode: Task
- Requested By: Jake Ruesink
- Last Updated: 2026-01-12 (updated with `.cursor` as source of truth decision)
- Related Plan: (not yet created)
- Storage Path: `.devagent/workspace/tasks/active/2026-01-12_plugin-setup-update-command-improvements/research/2026-01-12_plugin-setup-update-command-research.md`
- Stakeholders: DevAgent maintainers

## Request Overview
Review and improve the setup and update commands for DevAgent's plugin system. The commands should:
1. Only install/update plugins when they're explicitly listed in a plugin configuration file
2. When plugins are in the configuration, ensure plugin skills and commands are properly symlinked to their correct locations
3. Use `.cursor` folder as source of truth (Cursor + Codex shop at core), symlink to `.codex` for most things, and document the ability to symlink to `.claude` or other folders if needed

**Desired Outcome**: Configuration-driven plugin management with automatic symlink creation for plugin assets, using `.cursor` as the canonical source.

## Context Snapshot
- Task summary: Improve plugin setup/update commands to be configuration-driven with proper symlink handling
- Task reference: `.devagent/workspace/tasks/active/2026-01-12_plugin-setup-update-command-improvements/`
- Existing decisions: 
  - Plugin system uses file-based discovery (from `.devagent/workspace/tasks/active/2026-01-10_implement-ralph/`)
  - Plugins are stored in `.devagent/plugins/` with `plugin.json` manifests
  - Commands are symlinked from `.agents/commands/` to `.cursor/commands/`

## Research Questions

| ID | Question | Status | Notes |
| --- | --- | --- | --- |
| RQ1 | What is the current plugin discovery and installation mechanism? | Answered | File-based discovery by scanning `.devagent/plugins/*/` for `plugin.json` files |
| RQ2 | How does the current update script (`update-core.sh`) work? | Answered | Uses git sparse checkout to fetch core files, commands, and skills; doesn't handle plugins |
| RQ3 | What symlink patterns are currently used in the codebase? | Answered | Commands symlinked from `.agents/commands/` to `.cursor/commands/` using relative paths |
| RQ4 | What is the Anthropic `.claude/skills` specification? | Answered | Skills are directories with `SKILL.md` files; should be stored in `.claude/skills/` |
| RQ5 | Where should the plugin configuration file be located? | Follow-up | Needs design decision - likely `.devagent/plugins.json` or `.devagent/plugin-config.json` |
| RQ6 | What should the plugin configuration file structure look like? | Follow-up | Needs design decision - should include plugin names, versions, enabled status |

## Key Findings

1. **Current plugin system uses automatic discovery** - Plugins in `.devagent/plugins/` are automatically discoverable by scanning for `plugin.json` files. There's a registry file (`plugin-registry.json`) but it's currently empty and not actively used.

2. **No setup script exists** - Only `update-core.sh` exists, which handles core DevAgent updates but doesn't touch plugins. There's no equivalent setup script for initial installation.

3. **Symlink patterns are established** - The codebase has a clear pattern for symlinking commands: relative symlinks from `.cursor/commands/` to `.agents/commands/`. A Python script (`create_symlink.py`) exists to automate this.

4. **Skills directory strategy updated** - **DECISION**: Use `.cursor/skills/` as source of truth (Cursor + Codex shop at core), symlink to `.codex/skills/` for Codex compatibility, and document ability to symlink to `.claude/skills/` or other folders if needed.

5. **Plugin manifest structure is well-defined** - Plugins use `plugin.json` with clear structure for workflows, commands, tools, and skills. The ralph plugin serves as a reference implementation.

## Detailed Findings

### RQ1: Current Plugin Discovery and Installation

**Answer**: Plugin discovery is file-based and automatic. The system:
- Scans `.devagent/plugins/*/` directories for `plugin.json` manifest files
- Validates manifest structure (requires `name`, `version`, `description`)
- Can register plugins in `plugin-registry.json` but this is currently manual

**Evidence**:
- `.devagent/core/plugin-system/README.md` documents the discovery process
- `.devagent/core/plugin-system/plugin-registry.json` exists but is empty
- `.devagent/plugins/ralph/plugin.json` shows example manifest structure

**Freshness**: 2026-01-12

**Implication**: Need to add configuration-driven filtering so only configured plugins are installed/updated.

### RQ2: Current Update Script Behavior

**Answer**: `update-core.sh` handles core DevAgent updates via git sparse checkout:
- Fetches `.devagent/core/`, `.agents/commands/`, and `.codex/skills/` from repository
- Creates backups before updates
- Uses `rsync` to merge updates while preserving local additions
- Does NOT handle plugins at all

**Evidence**:
- `.devagent/core/scripts/update-core.sh` lines 54-109 show sparse checkout and file copying logic
- No plugin-related code exists in the script

**Freshness**: 2026-01-12

**Implication**: Need to add plugin handling logic to setup/update scripts, or create separate plugin management commands.

### RQ3: Symlink Patterns

**Answer**: Established pattern for command symlinks:
- Source: `.agents/commands/<command>.md`
- Target: `.cursor/commands/<command>.md`
- Method: Relative symlinks using `../../.agents/commands/<command>.md`
- Automation: Python script `create_symlink.py` handles creation with error checking

**Evidence**:
- `.codex/skills/create-slash-command/scripts/create_symlink.py` shows symlink creation logic
- `.agents/commands/README.md` documents symlink setup process
- Multiple task references show symlink patterns (grep results show 105 matches)

**Freshness**: 2026-01-12

**Implication**: Can reuse this pattern for plugin commands and skills. Need to create similar logic for:
- Plugin commands: `.devagent/plugins/<plugin>/commands/` → `.agents/commands/` → `.cursor/commands/`
- Plugin skills: `.devagent/plugins/<plugin>/skills/` → `.cursor/skills/` → `.codex/skills/` (with optional `.claude/skills/` symlink documented)

### RQ4: Anthropic `.claude/skills` Specification

**Answer**: Anthropic's Claude Skills specification:
- Skills are directories containing a `SKILL.md` file
- Skills should be stored in `.claude/skills/` directory
- `SKILL.md` has YAML frontmatter with `name` (max 64 chars, lowercase, numbers, hyphens) and `description` (max 1024 chars)
- Skills can include additional files like references, scripts, assets

**Evidence**:
- Web search results from Anthropic documentation
- Current codebase uses `.codex/skills/` which appears to be Codex-specific

**Freshness**: 2026-01-12 (web search)

**Implication**: While Anthropic uses `.claude/skills/`, the decision is to use `.cursor/skills/` as source of truth (Cursor + Codex shop), symlink to `.codex/skills/`, and document optional `.claude/skills/` symlink for users who need it.

### RQ5 & RQ6: Plugin Configuration File Design

**Status**: Needs design decision

**Options Considered**:
1. **Location**: `.devagent/plugins.json` or `.devagent/plugin-config.json` (in `.devagent/` to keep plugin-related config together)
2. **Structure**: Should include:
   - List of enabled plugins (by name)
   - Optional version pinning
   - Optional enabled/disabled flags

**Recommendation**: 
- Location: `.devagent/plugins.json` (simple, clear naming)
- Structure: 
  ```json
  {
    "plugins": [
      {
        "name": "ralph",
        "enabled": true,
        "version": "0.1.0"  // optional, for version pinning
      }
    ]
  }
  ```

## Comparative / Alternatives Analysis

### Alternative 1: Opt-in Configuration (Recommended)
- **Approach**: Only plugins listed in config are installed/updated
- **Pros**: Explicit control, prevents accidental plugin installation, clear intent
- **Cons**: Requires manual configuration for each plugin
- **Use Case**: Production environments, teams wanting strict control

### Alternative 2: Opt-out Configuration
- **Approach**: All discovered plugins are installed unless disabled in config
- **Pros**: Easier initial setup, plugins "just work"
- **Cons**: Less control, potential for unwanted plugins
- **Use Case**: Development environments, rapid prototyping

### Alternative 3: Hybrid (Default + Override)
- **Approach**: Default to installing all discovered plugins, but config can disable specific ones
- **Pros**: Balance of convenience and control
- **Cons**: More complex logic
- **Use Case**: General purpose

**Recommendation**: Start with **Alternative 1 (Opt-in)** for explicit control and safety. Can add opt-out mode later if needed.

### Skills Directory Strategy

**DECISION**: Use `.cursor/skills/` as source of truth, symlink to `.codex/skills/`, document optional `.claude/skills/` symlink.

**Rationale**: 
- DevAgent is a Cursor + Codex shop at core, so `.cursor` should be the canonical location
- Symlink to `.codex/skills/` for Codex compatibility (primary use case)
- Document ability to create additional symlinks to `.claude/skills/` or other folders for users who need them

**Implementation**:
- Source of truth: `.cursor/skills/` (where plugin skills are installed)
- Primary symlink: `.cursor/skills/` → `.codex/skills/` (for Codex)
- Optional symlink: `.cursor/skills/` → `.claude/skills/` (documented, user can create if needed)

## Implications for Implementation

### Scope Adjustments
1. **Create plugin configuration file** - New file `.devagent/plugins.json` with plugin list
2. **Modify/Extend setup script** - Create or update setup script to:
   - Read plugin configuration
   - Install/update only configured plugins
   - Create symlinks for plugin commands and skills
3. **Update update script** - Extend `update-core.sh` or create separate plugin update logic
4. **Skills directory migration** - Consider migration path for existing `.codex/skills/` → `.cursor/skills/` + symlink back to `.codex/skills/`

### Acceptance Criteria Impacts
- Setup/update commands must respect plugin configuration
- Plugin skills must be installed to `.cursor/skills/` and symlinked to `.codex/skills/`
- Optional symlink to `.claude/skills/` should be documented (user can create if needed)
- Plugin commands must be symlinked: `.agents/commands/` → `.cursor/commands/`
- Configuration file must be validated (JSON schema, required fields)
- Error handling for missing plugins, invalid configs, symlink failures

### Validation Needs
- Test plugin installation with valid configuration
- Test plugin update with version changes
- Test symlink creation for skills and commands
- Test error cases (missing plugins, invalid config, permission errors)
- Verify backward compatibility with existing plugin installations

## Risks & Open Questions

| Item | Type | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Plugin config file location | Question | Design team | Decide between `.devagent/plugins.json` vs root-level config | Before implementation |
| Migration path for existing skills | Risk | Implementation | Create migration script or document manual steps | During implementation |
| Backward compatibility | Risk | Implementation | Ensure existing plugins continue to work during transition | Testing phase |
| Symlink permission errors | Risk | Implementation | Add error handling and clear error messages | Implementation |
| Config file validation | Question | Design team | Define validation rules and error messages | Before implementation |
| Version pinning strategy | Question | Design team | Decide if versions should be pinned or allow latest | Before implementation |

## Recommended Follow-ups

1. **Design plugin configuration file structure** - Finalize JSON schema, location, and validation rules
2. **Create setup script** - New script or extend existing update script to handle initial plugin installation
3. **Implement symlink creation logic** - Reuse patterns from `create_symlink.py` for plugin commands and skills
4. **Skills directory migration** - Plan migration from `.codex/skills/` to `.cursor/skills/` + symlink back to `.codex/skills/`
5. **Document optional symlinks** - Document how users can create additional symlinks (e.g., to `.claude/skills/`) if needed
6. **Testing strategy** - Define test cases for plugin installation, updates, and symlink creation
7. **Documentation updates** - Update plugin system README with new configuration-driven approach and `.cursor` as source of truth

## Sources

| Reference | Type | Freshness | Access Notes |
| --- | --- | --- | --- |
| `.devagent/core/plugin-system/README.md` | Internal docs | 2026-01-12 | Plugin discovery and manifest structure |
| `.devagent/core/plugin-system/plugin-registry.json` | Internal config | 2026-01-12 | Current registry (empty) |
| `.devagent/plugins/ralph/plugin.json` | Internal example | 2026-01-12 | Reference plugin manifest |
| `.devagent/core/scripts/update-core.sh` | Internal script | 2026-01-12 | Current update script implementation |
| `.codex/skills/create-slash-command/scripts/create_symlink.py` | Internal script | 2026-01-12 | Symlink creation pattern |
| `.agents/commands/README.md` | Internal docs | 2026-01-12 | Command symlink documentation |
| Anthropic Skills Documentation | External spec | 2026-01-12 | Web search - `.claude/skills/` specification |
| `.devagent/workspace/tasks/active/2026-01-10_implement-ralph/` | Internal context | 2026-01-12 | Plugin design decisions |
