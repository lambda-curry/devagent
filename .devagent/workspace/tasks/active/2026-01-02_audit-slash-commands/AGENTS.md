# Audit Slash Commands Progress Tracker

- Owner: Jake Ruesink
- Last Updated: 2026-01-02
- Status: Active
- Task Hub: `.devagent/workspace/tasks/active/2026-01-02_audit-slash-commands/`

## Summary
Audit each slash command in `.agents/commands/` to ensure they work logically with their associated workflows in `.devagent/core/workflows/`. Review command structure, input requirements, and alignment with workflow expectations to identify and fix any inconsistencies. Implementation plan: `.devagent/workspace/tasks/active/2026-01-02_audit-slash-commands/plan/2026-01-02_slash-command-audit-plan.md`.

## Agent Update Instructions
- Always update "Last Updated" to today's date (ISO: YYYY-MM-DD) when editing this file. **Get the current date by explicitly running `date +%Y-%m-%d` first, then use the output for the "Last Updated" field.**
- Progress Log: Append a new entry at the end in the form `- [YYYY-MM-DD] Event: concise update, links to files`. Do not rewrite or delete prior entries. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- Implementation Checklist: Mark items as `[x]` when complete, `[~]` for partial with a short note. Add new items if discovered; avoid removing items—strike through only when obsolete.
- Key Decisions: Record important decisions as `- [YYYY-MM-DD] Decision: rationale, links`. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- References: Keep links current to latest spec, research, and tasks. Add additional references as they are created.
- Scope: Edits here should reflect coordination/progress only; do not include application code changes. Preserve history.

## Key Decisions
- [2026-01-02] Decision: Create audit task to systematically review all slash commands for logical alignment with their workflows, following the snippet/template model for commands established in recent updates.
- [2026-01-02] Decision: Remove the obsolete command and related references until a new workflow is defined.
- [2026-01-02] Decision: Promote `update-devagent` into a core workflow and align the command to the workflow roster.

## Progress Log
- [2026-01-02] Event: Feature hub created. Task initialized to audit all slash commands in `.agents/commands/` for logical alignment with their associated workflows.
- [2026-01-02] Event: Research completed. Created research packet documenting audit requirements, command-to-workflow mapping, and findings. Research packet: `.devagent/workspace/tasks/active/2026-01-02_audit-slash-commands/research/2026-01-02_slash-command-audit-requirements.md`
- [2026-01-02] Event: Created implementation plan: `.devagent/workspace/tasks/active/2026-01-02_audit-slash-commands/plan/2026-01-02_slash-command-audit-plan.md`
- [2026-01-02] Event: Task 1 completed: created command audit matrix `.devagent/workspace/tasks/active/2026-01-02_audit-slash-commands/plan/command-audit-matrix.md`.
- [2026-01-02] Event: Task 2 completed: verified workflow references + structure compliance; updated audit matrix `.devagent/workspace/tasks/active/2026-01-02_audit-slash-commands/plan/command-audit-matrix.md`.
- [2026-01-02] Event: Task 3 completed: aligned command instructions with workflow input requirements; updated `.agents/commands/*.md` and audit matrix.
- [2026-01-02] Event: Task 4 completed: resolved missing workflow mappings; updated audit matrix and `.agents/commands/README.md`.
- [2026-01-02] Event: Task 5 completed: published audit outcomes and refreshed task hub checklist, references, and open questions.
- [2026-01-02] Event: Removed obsolete command and scrubbed references; updated audit artifacts and docs.
- [2026-01-02] Event: Added `update-devagent` workflow and aligned command + roster references.

## Implementation Checklist
- [x] Create implementation plan for audit work
- [x] Review all command files in `.agents/commands/` and their associated workflow files
- [x] Verify commands follow snippet/template format (single input context area, clear instructions)
- [x] Check that command instructions align with workflow input requirements
- [x] Verify workflow references are correct (command references correct workflow file)
- [x] Identify any commands that need updates to better align with their workflows
- [x] Update commands as needed to ensure logical alignment
- [x] Task 1: Build command→workflow audit matrix
- [x] Task 2: Verify workflow references + structure compliance
- [x] Task 3: Align command instructions with workflow inputs
- [x] Task 4: Resolve missing workflow mappings
- [x] Task 5: Publish audit outcomes and update task hub
- [x] Remove obsolete command and references
- [x] Add `update-devagent` workflow and align command/roster

## Open Questions
- ~~Which commands (if any) have special input requirements that differ from the standard template?~~ Resolved in audit matrix (interactive + required-input workflows noted).
- No open questions currently.

## References
- Research: `.devagent/workspace/research/2025-12-25_slash-command-best-practices.md` (2025-12-25) - Best practices for slash command structure
- Research: `.devagent/workspace/tasks/active/2026-01-02_audit-slash-commands/research/2026-01-02_slash-command-audit-requirements.md` (2026-01-02) - Audit requirements and findings
- Plan: `.devagent/workspace/tasks/active/2026-01-02_audit-slash-commands/plan/2026-01-02_slash-command-audit-plan.md` (2026-01-02) - Implementation plan for audit work
- Audit Matrix: `.devagent/workspace/tasks/active/2026-01-02_audit-slash-commands/plan/command-audit-matrix.md` (2026-01-02) - Command/workflow alignment matrix
- Command Structure Reference: `.codex/skills/create-slash-command/references/command-structure.md` (2026-01-02) - Reference documentation for command structure
- Commands Directory: `.agents/commands/` - All slash command files
- Workflows Directory: `.devagent/core/workflows/` - All workflow definitions
- Recent Example: `.agents/commands/implement-plan.md` (2026-01-02) - Example of snippet-style command with workflow-specific guidance

## Next Steps
- Optional: Review the new `update-devagent` workflow definition for desired scope and guardrails.
