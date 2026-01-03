# Audit Slash Commands Progress Tracker

- Owner: Jake Ruesink
- Last Updated: 2026-01-02
- Status: Active
- Feature Hub: `.devagent/workspace/features/active/2026-01-02_audit-slash-commands/`

## Summary
Audit each slash command in `.agents/commands/` to ensure they work logically with their associated workflows in `.devagent/core/workflows/`. Review command structure, input requirements, and alignment with workflow expectations to identify and fix any inconsistencies.

## Agent Update Instructions
- Always update "Last Updated" to today's date (ISO: YYYY-MM-DD) when editing this file. **Get the current date by explicitly running `date +%Y-%m-%d` first, then use the output for the "Last Updated" field.**
- Progress Log: Append a new entry at the end in the form `- [YYYY-MM-DD] Event: concise update, links to files`. Do not rewrite or delete prior entries. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- Implementation Checklist: Mark items as `[x]` when complete, `[~]` for partial with a short note. Add new items if discovered; avoid removing items—strike through only when obsolete.
- Key Decisions: Record important decisions as `- [YYYY-MM-DD] Decision: rationale, links`. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- References: Keep links current to latest spec, research, and tasks. Add additional references as they are created.
- Scope: Edits here should reflect coordination/progress only; do not include application code changes. Preserve history.

## Key Decisions
- [2026-01-02] Decision: Create audit task to systematically review all slash commands for logical alignment with their workflows, following the snippet/template model for commands established in recent updates.

## Progress Log
- [2026-01-02] Event: Feature hub created. Task initialized to audit all slash commands in `.agents/commands/` for logical alignment with their associated workflows.
- [2026-01-02] Event: Research completed. Created research packet documenting audit requirements, command-to-workflow mapping, and findings. Research packet: `.devagent/workspace/features/active/2026-01-02_audit-slash-commands/research/2026-01-02_slash-command-audit-requirements.md`

## Implementation Checklist
- [ ] Review all command files in `.agents/commands/` and their associated workflow files
- [ ] Verify commands follow snippet/template format (single input context area, clear instructions)
- [ ] Check that command instructions align with workflow input requirements
- [ ] Verify workflow references are correct (command references correct workflow file)
- [ ] Identify any commands that need updates to better align with their workflows
- [ ] Update commands as needed to ensure logical alignment

## Open Questions
- Which commands (if any) have special input requirements that differ from the standard template?

## References
- Research: `.devagent/workspace/research/2025-12-25_slash-command-best-practices.md` (2025-12-25) - Best practices for slash command structure
- Research: `.devagent/workspace/features/active/2026-01-02_audit-slash-commands/research/2026-01-02_slash-command-audit-requirements.md` (2026-01-02) - Audit requirements and findings
- Command Structure Reference: `.codex/skills/create-slash-command/references/command-structure.md` (2026-01-02) - Reference documentation for command structure
- Commands Directory: `.agents/commands/` - All slash command files
- Workflows Directory: `.devagent/core/workflows/` - All workflow definitions
- Recent Example: `.agents/commands/implement-plan.md` (2026-01-02) - Example of snippet-style command with workflow-specific guidance

## Next Steps
- Begin audit by reviewing command files and their associated workflows
- Use `devagent research` if additional context is needed about specific workflows
- Use `devagent create-plan` to create a detailed implementation plan for fixing any issues found