# Plugin Setup and Update Command Improvements Progress Tracker

- Owner: Jake Ruesink
- Last Updated: 2026-01-13
- Status: Complete
- Task Hub: `.devagent/workspace/tasks/completed/2026-01-12_plugin-setup-update-command-improvements/`

## Summary
Review and improve the setup and update commands for DevAgent's plugin system. The setup and update commands should only install or update plugins when they are explicitly listed in a plugin configuration file. When plugins are present in the configuration, the commands should ensure that plugin skills and commands are properly symlinked to their correct locations. Use `.cursor` folder as source of truth (Cursor + Codex shop at core), symlink to `.codex` for most things, and document the ability to symlink to `.claude` or other folders if needed. This task involves auditing the current plugin system infrastructure, understanding how plugins are discovered and registered, and implementing a configuration-driven approach to plugin management with proper symlink handling.

## Agent Update Instructions
- Always update "Last Updated" to today's date (ISO: YYYY-MM-DD) when editing this file. **Get the current date by explicitly running `date +%Y-%m-%d` first, then use the output for the "Last Updated" field.**
- Progress Log: Append a new entry at the end in the form `- [YYYY-MM-DD] Event: concise update, links to files`. Do not rewrite or delete prior entries. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- Implementation Checklist: Mark items as `[x]` when complete, `[~]` for partial with a short note. Add new items if discovered; avoid removing items—strike through only when obsolete.
- Key Decisions: Record important decisions as `- [YYYY-MM-DD] Decision: rationale, links`. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- References: Keep links current to latest spec, research, and tasks. Add additional references as they are created.
- Scope: Edits here should reflect coordination/progress only; do not include application code changes. Preserve history.

## Key Decisions
- [2026-01-12] Decision: Use `.cursor` folder as source of truth for skills and commands (Cursor + Codex shop at core). Symlink to `.codex/skills/` for Codex compatibility, and document optional symlink to `.claude/skills/` or other folders for users who need them. Rationale: DevAgent is fundamentally a Cursor + Codex tool, so `.cursor` should be the canonical location. See `research/2026-01-12_plugin-setup-update-command-research.md` for details.
- [2026-01-12] Decision: Setup scripts should only copy files and create symlinks - dependencies handled separately via AI instruction. Delete scripts should remove files and symlinks. Scripts live in plugin directory. Rationale: Keep scripts simple, let AI agent handle complex dependency checking and error recovery. See `clarification/2026-01-12_initial-clarification.md` for details.

## Progress Log
- [2026-01-12] Event: Task hub created. Initial context gathering completed. Ready for research phase.
- [2026-01-12] Event: Research phase completed. Created research packet documenting current plugin system, symlink patterns, Anthropic skills specification, and design recommendations. See `research/2026-01-12_plugin-setup-update-command-research.md`.
- [2026-01-12] Event: Design decision updated - changed from `.claude/skills/` to `.cursor/skills/` as source of truth, with symlinks to `.codex/skills/` and optional `.claude/skills/` documented. Research packet updated to reflect this decision.
- [2026-01-12] Event: Clarification phase completed. All 8 dimensions clarified and validated. Created clarification packet at `clarification/2026-01-12_initial-clarification.md`. Requirements ready for plan work.
- [2026-01-12] Event: Plan created. See `plan/2026-01-12_plugin-setup-update-command-improvements-plan.md`.
- [2026-01-12] Event: Task 1 complete. Created `.devagent/plugins.json` and updated plugin system docs.
- [2026-01-12] Event: Task 2 and 3 complete. Implemented `sync-plugin-assets.sh` and `update-plugins.sh`, and updated update workflow.
- [2026-01-12] Event: Task 4 and 5 complete. Standardized `setup.sh`/`delete.sh` for ralph and finalized documentation.
- [2026-01-12] Event: Task 6 complete. Added `verify-plugins` script, workflow, and command.
- [2026-01-12] Event: Phase 2 complete. Migrated core skills to `.cursor/skills/`, updated `update-core.sh`, and added compatibility documentation for Claude/Codex.
- [2026-01-13] Event: Task moved to completed. Updated all status references and file paths from active/ to completed/ throughout task directory.

## Implementation Checklist
- [x] Audit current plugin system infrastructure and discovery mechanisms
- [x] Review existing setup and update command implementations
- [x] Create comprehensive implementation plan (`plan/2026-01-12_plugin-setup-update-command-improvements-plan.md`)
- [x] Design plugin configuration file structure and location
- [x] Implement configuration-driven plugin installation/update logic
- [x] Implement symlink creation for plugin skills (`.cursor/skills/` → `.codex/skills/`, with optional `.claude/skills/` documented)
- [x] Implement symlink creation for plugin commands
- [x] Update setup and update commands to use configuration
- [x] Test plugin installation and symlink creation workflow
- [x] Document plugin configuration format and usage
- [x] Add a “verify plugins” command/workflow (Phase 2)
- [x] Migrate core skills to `.cursor/skills/` as canonical (Phase 2)
- [x] Add optional support for `.claude/skills/` via documentation (Phase 2)

## Open Questions
- What should the plugin configuration file be named and where should it live? → **Research recommendation: `.devagent/plugins.json`**
- Should the configuration file be in `.devagent/` or at the project root? → **Research recommendation: `.devagent/` directory**
- How should plugin versioning be handled in the configuration? → **Research recommendation: Optional version field for pinning**
- Should there be a default configuration that includes all discovered plugins, or should it be opt-in only? → **Research recommendation: Opt-in (explicit control)**
- Migration path for existing `.codex/skills/` to `.cursor/skills/` + symlink? → **DECISION: Migrate to `.cursor/skills/` as source, symlink back to `.codex/skills/`**

## References
- **Clarification Packet**: `.devagent/workspace/tasks/completed/2026-01-12_plugin-setup-update-command-improvements/clarification/2026-01-12_initial-clarification.md` (2026-01-12) - Complete requirement clarification with all 8 dimensions validated. Ready for plan work.
- **Research Packet**: `.devagent/workspace/tasks/completed/2026-01-12_plugin-setup-update-command-improvements/research/2026-01-12_plugin-setup-update-command-research.md` (2026-01-12) - Comprehensive research on plugin system, symlink patterns, Anthropic skills spec, and design recommendations
- Plugin System Documentation: `.devagent/core/plugin-system/README.md` (2026-01-12) - Plugin discovery, manifest structure, and registry management
- Plugin Registry: `.devagent/core/plugin-system/plugin-registry.json` (2026-01-12) - Current plugin registry structure (currently empty)
- Example Plugin: `.devagent/plugins/ralph/plugin.json` (2026-01-12) - Example plugin manifest showing skills, commands, workflows structure
- Update DevAgent Command: `.agents/commands/update-devagent.md` (2026-01-12) - Current update command interface
- Update Core Script: `.devagent/core/scripts/update-core.sh` (2026-01-12) - Core update script implementation
- Command Symlink Documentation: `.agents/commands/README.md` (2026-01-12) - Documentation on symlinking commands to `.cursor/commands/`
- Symlink Creation Script: `.codex/skills/create-slash-command/scripts/create_symlink.py` (2026-01-12) - Reference implementation for symlink creation
- Skill Structure: `.codex/skills/` (2026-01-12) - Current skill directory structure

## Next Steps
Recommended follow-up workflows:

1. ✅ **Research Discovery**: `devagent research` - Completed. See `research/2026-01-12_plugin-setup-update-command-research.md`
2. ✅ **Clarify Scope**: `devagent clarify-task` - Completed. See `clarification/2026-01-12_initial-clarification.md`
3. **Create Plan**: `devagent create-plan` - Ready to proceed. All requirements clarified and validated.
4. **Execute Implementation**: Use `devagent implement-plan` once a plan is approved
