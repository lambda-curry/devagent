# Slash Command Audit Requirements

- Owner: Jake Ruesink
- Last Updated: 2026-01-02
- Status: Research
- Related Task Hub: `.devagent/workspace/tasks/completed/2026-01-02_audit-slash-commands/`

## Classification & Assumptions

**Classification:** Implementation design audit

**Assumptions:**
- Commands should function as snippets/templates that get inserted into chat (per command-structure.md)
- Commands should align with their associated workflow's input requirements
- Commands should provide clear guidance for agents executing workflows
- Some workflows may have specific input requirements that differ from the standard template (e.g., implement-plan)

## Research Plan (What Was Validated)

1. **Command Structure Alignment**
   - Verify all commands follow snippet/template model (single input context area)
   - Check that commands provide workflow-specific guidance in instructions when needed
   - Confirm commands avoid complex multi-field forms

2. **Workflow Reference Accuracy**
   - Validate that each command references the correct workflow file
   - Verify workflow file paths are correct and files exist
   - Check for any commands missing workflow references

3. **Input Requirements Alignment**
   - Compare command input guidance with workflow input requirements
   - Identify workflows with special input needs (e.g., implement-plan's plan document path requirement)
   - Verify commands provide adequate guidance for required vs optional inputs

4. **Instruction Clarity**
   - Review instructions for clarity and completeness
   - Verify instructions guide agents correctly to execute workflows
   - Check for workflows with execution-specific guidance needs (e.g., continuous execution vs pausing)

5. **Command-to-Workflow Mapping**
   - Create complete mapping of commands to workflows
   - Identify any commands without corresponding workflows
   - Identify any workflows without corresponding commands

## Sources

- Command Structure Reference: `.codex/skills/create-slash-command/references/command-structure.md` (2026-01-02) - Defines snippet/template model and structure guidelines
- Slash Command Best Practices: `.devagent/workspace/research/2025-12-25_slash-command-best-practices.md` (2025-12-25) - Historical best practices for command structure
- Commands Directory: `.agents/commands/` - All 16 command files (excluding README.md)
- Workflows Directory: `.devagent/core/workflows/` - All 14 workflow definition files
- Example Command: `.agents/commands/implement-plan.md` (2026-01-02) - Example of workflow-specific command structure
- AGENTS.md: `.devagent/core/AGENTS.md` - Standard workflow instructions and execution directives

## Findings & Tradeoffs

### Command Structure Patterns

**Standard Pattern (Most Commands):**
- Simple structure with generic instructions
- Single "Input Context:" placeholder
- Workflow reference in instructions
- Examples: `create-plan.md`, `research.md`, `clarify-task.md`, `review-progress.md`

**Workflow-Specific Pattern (implement-plan):**
- Enhanced instructions with workflow-specific guidance
- Single "Input Context:" placeholder with example/template text
- Clearer guidance about required vs optional inputs
- Execution behavior guidance (continuous execution, when to pause)

### Command-to-Workflow Mapping

**Commands with Workflows (15 commands):**
- `brainstorm.md` → `brainstorm.md`
- `build-workflow.md` → `build-workflow.md`
- `clarify-task.md` → `clarify-task.md`
- `compare-prs.md` → `compare-prs.md`
- `create-plan.md` → `create-plan.md`
- `implement-plan.md` → `implement-plan.md`
- `mark-task-complete.md` → `mark-task-complete.md`
- `new-task.md` → `new-task.md`
- `research.md` → `research.md`
- `review-pr.md` → `review-pr.md`
- `review-progress.md` → `review-progress.md`
- `update-constitution.md` → `update-constitution.md`
- `update-devagent.md` → `update-devagent.md`
- `update-product-mission.md` → `update-product-mission.md`
- `update-tech-stack.md` → `update-tech-stack.md`

**Workflows without Commands:**
- None identified (all workflows have corresponding commands)

### Input Requirements Analysis

**Workflows with Standard Input Requirements:**
- `research.md`: Problem statement (required), optional context
- `create-plan.md`: Mission summary/research packets (required), optional artifacts
- `clarify-task.md`: Feature concept (required), optional materials
- `review-progress.md`: Task directory or feature slug (required), optional scope
- `new-task.md`: Title or description (minimum), optional owners/slug
- Most workflows follow standard pattern: required inputs + optional inputs

**Workflows with Special Input Requirements:**
- `implement-plan.md`: Plan document path (required), task range (optional), skip confirmations (optional) - **Already addressed in command**
- `clarify-task.md`: Interactive session model - may benefit from guidance about starting session
- `brainstorm.md`: Interactive session model - may benefit from guidance about starting session

### Instruction Quality

**Standard Instructions Pattern:**
- Generic "You will receive a prompt or context for this workflow"
- Standard workflow execution guidance
- Workflow file reference

**Potential Improvements:**
- Commands for interactive workflows (`clarify-task`, `brainstorm`) could mention they start interactive sessions
- Commands could provide more specific guidance about what inputs are expected
- Commands following standard pattern are adequate but could be enhanced for clarity

## Recommendation

**Audit Approach:**
1. **Systematic Review:** Review each command file against its workflow to verify:
   - Workflow reference is correct
   - Instructions align with workflow input requirements
   - Command structure follows snippet/template model
   - Workflow-specific guidance is included where needed

2. **Priority Focus Areas:**
   - **Interactive workflows** (`clarify-task`, `brainstorm`): Verify commands mention interactive session model
   - **Special input workflows** (`implement-plan`): Verify commands provide adequate input guidance (already done for implement-plan)
   - **Standard workflows**: Verify basic alignment (most appear adequate)

3. **Enhancement Opportunities:**
   - Consider adding workflow-specific guidance to interactive workflow commands
   - Consider adding example input context templates for workflows with specific requirements
   - Maintain consistency with snippet/template model (single input area, clear instructions)

4. **Missing Workflows:**
   - Resolved by defining `update-devagent` as a core workflow and aligning the command

## Repo Next Steps

- [ ] Review all 15 command files systematically
- [ ] Verify workflow references are correct for each command
- [ ] Check interactive workflow commands (`clarify-task`, `brainstorm`) for session model guidance
- [ ] Verify standard workflow commands have adequate input guidance
- [ ] Update commands as needed to improve alignment with workflows
- [ ] Document any commands that need workflow-specific enhancements
- [ ] Create implementation plan for fixes and enhancements

## Risks & Open Questions

**Risks:**
- Over-engineering commands with too much guidance (violates snippet simplicity principle)
- Missing workflow-specific requirements that cause confusion during execution
- Inconsistency between commands making it harder for users to know what to expect

**Open Questions:**
- Should interactive workflow commands (`clarify-task`, `brainstorm`) explicitly mention they start interactive sessions?
- Do any workflows have input requirements that aren't adequately communicated in their commands?
- Are there workflows that would benefit from example input context templates (like implement-plan)?
