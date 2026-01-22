# AI Rules Consolidation Research

- Classification: Implementation Design
- Date: 2026-01-21
- Researcher: Jake Ruesink

## Assumptions
- [INFERRED] We want to adopt a structure similar to `block/ai-rules` to unify our guidelines.
- [INFERRED] We need to support `opencode`, `cursor`, `claude`, `gemini`, `codex`, and `github` specifically.
- [INFERRED] We should leverage existing `.cursor/rules/` and `.devagent/plugins/ralph/agents/` as the baseline.

## Research Plan
- [x] Analyze `block/ai-rules` core concepts and structure.
- [x] Audit internal rules in `.cursor/rules/`.
- [x] Audit internal agent instructions in `.devagent/plugins/ralph/agents/`.
- [ ] Determine how to map `block/ai-rules` patterns to our multi-agent support requirements.
- [ ] Investigate platform-specific entry points for gemini, codex, and github.

## Sources
- [block/ai-rules](https://github.com/block/ai-rules) (Primary external source)
- Internal: `.cursor/rules/`
- Internal: `.devagent/plugins/ralph/agents/`
- Internal: `.devagent/core/AGENTS.md`

## Findings

### block/ai-rules Patterns
1. **Single Source of Truth:** Uses an `ai-rules/` directory containing rules (`.md`), commands (`commands/*.md`), and skills (`skills/SKILL.md`).
2. **Generation/Symlinking:** A CLI tool generates agent-specific files (e.g., `CLAUDE.md`, `.cursor/rules/*.mdc`) from the source.
3. **Frontmatter Metadata:** Uses YAML frontmatter to control when/where rules apply (e.g., `fileMatching`, `alwaysApply`).
4. **Command/Skill Abstraction:** Standardizes slash commands and skills across platforms.

### Internal Baseline
1. **Cursor Rules:** We have 6 granular `.mdc` files in `.cursor/rules/` (storybook, useEffect, testing, error-handling, react-router-7, cursor-rules).
2. **Ralph Agent Instructions:** We have 4 instruction files for specific roles (qa, engineering, project-manager, design) in `.devagent/plugins/ralph/agents/`.
3. **Redundancy:** There is significant overlap between Cursor rules and Agent instructions (e.g., testing best practices, RR7 patterns).

### Platform Support Requirements
- **Opencode (this tool):** Uses `AGENTS.md` and standard workflow instructions.
- **Cursor:** Uses `.cursor/rules/*.mdc`.
- **Claude (Code):** Uses `CLAUDE.md` and `.claude/skills/`.
- **Gemini / Github / Codex:** These often rely on system prompts or specific file conventions (like `.github/copilot-instructions.md` for Copilot/Github).

## Recommendation
1. **Adopt `ai-rules/` Source Directory:** Move/consolidate all rules into a central `ai-rules/` folder.
2. **Standardize on Frontmatter:** Use frontmatter to define applicability (e.g., `agent: ["cursor", "opencode"]`).
3. **Create a "Rules Hub" for Opencode:** Integrate these rules into the Opencode workflow prompts (perhaps by reading the `ai-rules/` dir during context gathering).
4. **Scaffold Platform Entry Points:**
   - `CLAUDE.md` for Claude Code.
   - `.cursor/rules/` (syncing from source).
   - `.github/copilot-instructions.md` (for Github Copilot).
   - `AI.md` or similar as a general fallback for Gemini/Codex.

## Repo Next Steps
- [ ] Map internal rules to `ai-rules/` structure.
- [ ] Design the "Sync/Generate" mechanism (even if manual at first).
- [ ] Create templates for `gemini`, `codex`, and `github` instructions.

## Risks & Open Questions
- **Risk:** Maintaining sync between the source and multiple platform files manually.
- **Question:** Should we implement a lightweight script to automate the generation of these files?
- **Question:** How do we handle "Skills" vs "Rules" in our context?
