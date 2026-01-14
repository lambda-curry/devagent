# Consolidate Ralph Plugin Config Files and Add Validation [DERIVED] Progress Tracker

- Owner: Jake Ruesink
- Last Updated: 2026-01-13
- Status: Draft
- Task Hub: `.devagent/workspace/tasks/active/2026-01-13_ralph-config-consolidation/`

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

## Progress Log
- [2026-01-13] Event: Task hub created with initial summary and context gathering.

## Implementation Checklist
- [ ] Research current config file usage and dependencies
- [ ] Determine optimal location for consolidated config file
- [ ] Design validation strategy for config file requirements
- [ ] Update `ralph.sh` to use single config location
- [ ] Add config validation logic to `ralph.sh`
- [ ] Update plugin setup workflows to preserve existing config
- [ ] Update documentation to reflect new config structure
- [ ] Test config consolidation and validation

## Open Questions
- Where should the single config file be located? (output/ directory vs tools/ directory)
- What fields are required for config validation?
- How should plugin updates handle existing config files?
- Should we migrate existing configs automatically?

## References
- Ralph plugin config template: `.devagent/plugins/ralph/tools/config.json` (2026-01-13)
- Ralph execution script: `.devagent/plugins/ralph/tools/ralph.sh` (2026-01-13)
- Ralph setup workflow: `.devagent/plugins/ralph/workflows/execute-autonomous.md` (2026-01-13)
- Ralph plugin documentation: `.devagent/plugins/ralph/AGENTS.md` (2026-01-13)
- Plugin structure: `.devagent/plugins/ralph/plugin.json` (2026-01-13)

## Next Steps
Recommended follow-up workflows:
- `devagent research` — Research current config file usage patterns, validation requirements, and best practices for plugin configuration management
- `devagent clarify-task` — Clarify scope and requirements for config consolidation and validation
- `devagent create-plan` — Create implementation plan for consolidating config files and adding validation
