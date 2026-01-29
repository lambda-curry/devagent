# AI-Rules Managed Skills

This document describes skills managed by the `ai-rules` tool in the `ai-rules/skills/` directory.

## Current Skills

### Standalone Skills
- **coderabbit-cli** - CodeRabbit CLI for automated code review and iterative improvement
- **ai-rules-cli** - AI Rules CLI for managing and synchronizing AI coding rules across multiple agents

### Ralph Plugin Skills (generated on plugin install, not committed)

When the ralph plugin is installed, run `bash .devagent/plugins/ralph/setup.sh` to sync these skills:
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

## Plugin Integration (Option D)

DevAgent plugins (like Ralph) can integrate their skills and commands with ai-rules using the sync approach:

1. **Plugin source of truth**: Skills/commands stay in `.devagent/plugins/<plugin>/`
2. **Sync to ai-rules**: Run `.devagent/core/scripts/sync-plugin-to-ai-rules.sh <plugin>`
3. **Generate agent files**: Run `ai-rules generate`

This creates symlinks in `ai-rules/skills/` and `ai-rules/commands/` that point back to the plugin source. Benefits:
- Plugin stays modular and portable
- ai-rules handles all agent-specific output (.cursor/rules, CLAUDE.md, etc.)
- Single `ai-rules generate` command for all assets

To sync ralph and regenerate:
```bash
bash .devagent/plugins/ralph/setup.sh
```

## Notes

- Skills are the source of truth in `ai-rules/skills/` (or plugin directories for synced skills)
- Never edit the symlinked versions in agent directories
- Always edit skills in `ai-rules/skills/` (or the plugin) and regenerate
- Skills are automatically prefixed with `ai-rules-generated-` in agent directories to avoid conflicts
- Cursor symlinks may need to be created manually in some ai-rules releases (check current behavior with `ai-rules generate`)
