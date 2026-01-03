# Create Plan Prompt: Audit Slash Commands

Use this prompt with `devagent create-plan` to generate an implementation plan for auditing slash commands.

---

**Plan Request:**
Create an implementation plan to systematically audit all slash commands in `.agents/commands/` to ensure they work logically with their associated workflows in `.devagent/core/workflows/`. The audit should verify command structure, input requirements alignment, workflow references, and identify any commands that need updates.

**Research Packet:**
`.devagent/workspace/tasks/completed/2026-01-02_audit-slash-commands/research/2026-01-02_slash-command-audit-requirements.md`

**Task Slug:**
`2026-01-02_audit-slash-commands`

**Key Findings from Research:**
- 15 command files exist (excluding README.md)
- 14 workflows exist in `.devagent/core/workflows/`
- All commands now have workflow mappings (including `update-devagent.md`)
- Commands should follow snippet/template model (single input context area)
- `implement-plan.md` is an example of workflow-specific command structure
- Interactive workflows (`clarify-task`, `brainstorm`) may need session model guidance
- All commands currently use standard template structure except `implement-plan.md`

**Audit Requirements:**
1. Review all 15 command files against their workflows
2. Verify workflow references are correct and files exist
3. Check command structure follows snippet/template model
4. Verify instructions align with workflow input requirements
5. Identify commands needing workflow-specific enhancements
6. Update commands as needed to ensure logical alignment

**Technical Constraints:**
- Commands must remain simple snippets/templates (not complex forms)
- Changes should maintain consistency with existing command structure
- Commands are symlinked to `.cursor/commands/` for Cursor IDE integration
- Reference `.codex/skills/create-slash-command/references/command-structure.md` for structure guidelines

**Target Outcome:**
A complete implementation plan with concrete tasks to audit and update slash commands, ensuring all commands properly align with their workflows while maintaining the snippet/template model.
