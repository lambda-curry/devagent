# AI-Rules Managed Skills

This document describes skills managed by the `ai-rules` tool in the `ai-rules/skills/` directory.

## Current Skills

### Standalone Skills
- **coderabbit-cli** - CodeRabbit CLI for automated code review and iterative improvement
- **ai-rules-cli** - AI Rules CLI for managing and synchronizing AI coding rules across multiple agents

### Ralph Plugin Skills (manual setup required, not committed)

These skills are provided by the Ralph plugin but require manual setup. Run `bash .devagent/plugins/ralph/setup.sh` to create symlinks and generate agent files:
- **ralph-agent-browser** - Browser automation for Ralph execution
- **ralph-beads-integration** - Beads issue tracking integration
- **ralph-issue-logging** - Issue logging patterns
- **ralph-plan-to-beads-conversion** - Convert plans to Beads tasks
- **ralph-quality-gate-detection** - Quality gate detection and validation
- **ralph-revise-report-generation** - Generate revision reports
- **ralph-storybook** - Storybook integration for UI documentation

> **Note:** Ralph symlinks are gitignored. They only appear after running the plugin setup.

## How It Works

1. Skills are defined in `ai-rules/skills/<skill-name>/` with a `SKILL.md` file
2. Run `ai-rules generate` to create symlinks in agent directories:
   - `.claude/skills/ai-rules-generated-<skill-name>` → `../../ai-rules/skills/<skill-name>`
   - `.codex/skills/ai-rules-generated-<skill-name>` → `../../ai-rules/skills/<skill-name>`
   - `.cursor/skills/ai-rules-generated-<skill-name>` → `../../ai-rules/skills/<skill-name>` (manual symlinks)

## Adding New Skills

1. Create a new directory: `ai-rules/skills/my-new-skill/`
2. Add `SKILL.md` with proper frontmatter:
   ```markdown
   ---
   name: my-new-skill
   description: Clear description of what this skill does and when to use it
   ---
   ```
3. Run `ai-rules generate` to create symlinks for Claude and Codex
4. Manually create Cursor symlink if needed:
   ```bash
   ln -sf ../../ai-rules/skills/my-new-skill .cursor/skills/ai-rules-generated-my-new-skill
   ```

## Skill Format

Skills follow the standard Claude Skills format:
- Required: `SKILL.md` with YAML frontmatter (`name` and `description`)
- Optional: `scripts/`, `references/`, `assets/` directories

See the skill-creator skill (`.cursor/skills/skill-creator/SKILL.md`) for detailed guidelines on creating effective skills.

## Plugin Integration

DevAgent plugins (like Ralph) integrate their skills and commands with ai-rules using a sync approach that keeps plugins self-contained while letting ai-rules handle agent-specific output.

### How it works

1. **Plugin is source of truth**: Skills/commands stay in `.devagent/plugins/<plugin>/`
2. **Sync creates symlinks**: The generic sync script creates symlinks in `ai-rules/` pointing to the plugin
3. **ai-rules generates output**: `ai-rules generate` creates `.cursor/rules/`, `CLAUDE.md`, etc.

### Command sequence

For the Ralph plugin, run:
```bash
# This runs sync + ai-rules generate in one step:
bash .devagent/plugins/ralph/setup.sh
```

Or manually:
```bash
# Step 1: Sync plugin to ai-rules/
bash .devagent/core/scripts/sync-plugin-to-ai-rules.sh ralph

# Step 2: Generate agent-specific files
ai-rules generate
```

### Benefits

- Plugin stays modular and portable (can be copied to other repos)
- ai-rules handles all agent-specific output (.cursor/rules, CLAUDE.md, etc.)
- Single `ai-rules generate` command for all assets
- Symlinks mean edits to plugin files are immediately reflected

## Notes

- Skills are the source of truth in `ai-rules/skills/` (or plugin directories for synced skills)
- Never edit the symlinked versions in agent directories
- Always edit skills in `ai-rules/skills/` (or the plugin) and regenerate
- Skills are automatically prefixed with `ai-rules-generated-` in agent directories to avoid conflicts
- Cursor symlinks may need to be created manually in some ai-rules releases (check current behavior with `ai-rules generate`)
