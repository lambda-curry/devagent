# AI-Rules Managed Skills

This document describes skills managed by the `ai-rules` tool in the `ai-rules/skills/` directory.

## Current Skills

- **coderabbit-cli** - CodeRabbit CLI for automated code review and iterative improvement
- **ai-rules-cli** - AI Rules CLI for managing and synchronizing AI coding rules across multiple agents

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

## Notes

- Skills are the source of truth in `ai-rules/skills/`
- Never edit the symlinked versions in agent directories
- Always edit skills in `ai-rules/skills/` and regenerate
- Skills are automatically prefixed with `ai-rules-generated-` in agent directories to avoid conflicts
- Cursor symlinks may need to be created manually in some ai-rules releases (check current behavior with `ai-rules generate`)
