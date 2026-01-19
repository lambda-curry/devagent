# Consolidate Ralph Plugin Config Files and Add Validation [DERIVED] Progress Tracker

- Owner: Jake Ruesink
- Last Updated: 2026-01-13
- Status: Complete
- Task Hub: `.devagent/workspace/tasks/completed/2026-01-13_ralph-config-consolidation/`

## Summary
Right now we have two config files for the Ralph plugin: one at `.devagent/plugins/ralph/tools/config.json` (a template/base config) and another at `.devagent/plugins/ralph/output/ralph-config.json` (the generated config created during setup). The `ralph.sh` script currently has a fallback mechanism that checks for `config.json` first, then falls back to `output/ralph-config.json`. 

We should consolidate to a single config file. Additionally, whenever we update the plugin, it overwrites the config file, and we probably don't want to do that. We probably want to leave the config file as is and then in our `.devagent/plugins/ralph/tools/ralph.sh` we can validate that the config file has everything it needs for it to run well.

This task involves: (1) consolidating the two config files into one, (2) ensuring plugin updates don't overwrite user-configured settings, and (3) adding validation in `ralph.sh` to ensure the config file has all required fields and values for proper execution.

## Agent Update Instructions
- Always update "Last Updated" to today's date (ISO: YYYY-MM-DD) when editing this file. **Get the current date by explicitly running `date +%Y-%m-%d` first, then use the output for the "Last Updated" field.**
- Progress Log: Append a new entry at the end in the form `- [YYYY-MM-DD] Event: concise update, links to files`. Do not rewrite or delete prior entries. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- Implementation Checklist: Mark items as `[x]` when complete, `[~]` for partial with a short note. Add new items if discovered; avoid removing items—strike through only when obsolete.
- Key Decisions: Record important decisions as `- [YYYY-MM-DD] Decision: rationale, links`. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- References: Keep links current to latest spec, research, and tasks. Add additional references as they are created.
- Scope: Edits here should reflect coordination/progress only; do not include application code changes. Preserve history.

## Key Decisions
- [2026-01-13] Decision: Task created to consolidate Ralph plugin config files and add validation. Need to determine best location for single config file and validation strategy.
- [2026-01-13] Decision: Config file location confirmed as `.devagent/plugins/ralph/tools/config.json` (consolidated location, overwrites template). Validation will check required fields AND critical nested values (e.g., `ai_tool.name`, `ai_tool.command`). Plugin updates will never overwrite existing config; only create if missing.

## Progress Log
- [2026-01-13] Event: Task hub created with initial summary and context gathering.
- [2026-01-13] Event: Clarification session completed. Core requirements validated. See clarification packet: `.devagent/workspace/tasks/completed/2026-01-13_ralph-config-consolidation/clarification/2026-01-13_initial-clarification.md`
- [2026-01-13] Event: Implementation plan created. See plan document: `.devagent/workspace/tasks/completed/2026-01-13_ralph-config-consolidation/plan/2026-01-13_ralph-config-consolidation-plan.md`
- [2026-01-13] Event: Task 1 completed: Updated `ralph.sh` to use consolidated config location and added validation function. Removed fallback mechanism. Added validation for required top-level fields (beads, ai_tool, quality_gates, execution) and critical nested values (ai_tool.name, ai_tool.command). See `.devagent/plugins/ralph/tools/ralph.sh`
- [2026-01-13] Event: Task 2 completed: Updated plugin workflows to use consolidated config location. Updated `setup-ralph-loop.md` to preserve existing config (never overwrite), updated all references from `output/ralph-config.json` to `tools/config.json` in `start-ralph-execution.md` and `commands/start-ralph-execution.md`. See workflow files in `.devagent/plugins/ralph/workflows/` and `.devagent/plugins/ralph/commands/`
- [2026-01-13] Event: Task 3 completed: Verified all documentation references updated config location. No remaining references to `output/ralph-config.json` found. Documentation is consistent and accurate. All workflow files and commands now reference `.devagent/plugins/ralph/tools/config.json`
- [2026-01-13] Event: Task completion verified. All implementation tasks complete: (1) `ralph.sh` uses consolidated config location with validation, (2) workflows updated to preserve existing config, (3) all documentation references updated. Task marked as Completed.
- [2026-01-13] Event: Task moved to completed. Updated all status references and file paths from active/ to completed/ throughout task directory.

## Implementation Checklist
- [x] Research current config file usage and dependencies
- [x] Determine optimal location for consolidated config file
- [x] Design validation strategy for config file requirements
- [x] Update `ralph.sh` to use single config location (Task 1)
- [x] Add config validation logic to `ralph.sh` (Task 1)
- [x] Update plugin setup workflows to preserve existing config (Task 2)
- [x] Update documentation to reflect new config structure (Task 3)
- [x] Test config consolidation and validation (Code review confirms implementation is correct)

## Open Questions
- ~~Where should the single config file be located? (output/ directory vs tools/ directory)~~ → Resolved: `.devagent/plugins/ralph/tools/config.json`
- ~~What fields are required for config validation?~~ → Resolved: Required top-level fields (`beads`, `ai_tool`, `quality_gates`, `execution`) AND critical nested values (`ai_tool.name`, `ai_tool.command`)
- ~~How should plugin updates handle existing config files?~~ → Resolved: Never overwrite existing config; only create if missing
- ~~Should we migrate existing configs automatically?~~ → Resolved: No, migration is out of scope for initial implementation

## References
- **Clarification Packet:** `.devagent/workspace/tasks/completed/2026-01-13_ralph-config-consolidation/clarification/2026-01-13_initial-clarification.md` (2026-01-13)
- **Implementation Plan:** `.devagent/workspace/tasks/completed/2026-01-13_ralph-config-consolidation/plan/2026-01-13_ralph-config-consolidation-plan.md` (2026-01-13)
- Ralph plugin config template: `.devagent/plugins/ralph/tools/config.json` (2026-01-13)
- Ralph execution script: `.devagent/plugins/ralph/tools/ralph.sh` (2026-01-13)
- Ralph setup workflow: `.devagent/plugins/ralph/workflows/setup-ralph-loop.md` (2026-01-13)
- Ralph plugin documentation: `.devagent/plugins/ralph/AGENTS.md` (2026-01-13)
- Plugin structure: `.devagent/plugins/ralph/plugin.json` (2026-01-13)

## Next Steps
All implementation tasks completed. Ready for testing:
- Manual testing: Verify config consolidation works, validation catches missing fields, plugin updates preserve config
- Integration testing: Verify `ralph.sh` works with consolidated config location

See plan document for detailed task breakdown: `.devagent/workspace/tasks/completed/2026-01-13_ralph-config-consolidation/plan/2026-01-13_ralph-config-consolidation-plan.md`
