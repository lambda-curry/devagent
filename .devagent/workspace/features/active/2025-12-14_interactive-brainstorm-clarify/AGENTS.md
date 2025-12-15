# Interactive Brainstorm and Clarify Workflows Progress Tracker

- Owner: Jake Ruesink
- Last Updated: 2025-12-14
- Status: Draft
- Feature Hub: `.devagent/workspace/features/active/2025-12-14_interactive-brainstorm-clarify/`

## Summary
Transform the `devagent brainstorm` and `devagent clarify-feature` workflows to use interactive, question-driven conversations as their default behavior. Instead of immediately creating output files, these workflows will engage users with a few thoughtful questions at a time (2-3 per batch) that help them think about their feature or brainstorm topic from different angles. The questions progressively build toward a complete brainstorm document or clarification document, avoiding user overwhelm while ensuring comprehensive coverage.

## Agent Update Instructions
- Always update "Last Updated" to today's date (ISO: YYYY-MM-DD) when editing this file.
- Progress Log: Append a new entry at the end in the form `- [YYYY-MM-DD] Event: concise update, links to files`. Do not rewrite or delete prior entries.
- Implementation Checklist: Mark items as `[x]` when complete, `[~]` for partial with a short note. Add new items if discovered; avoid removing items—strike through only when obsolete.
- Key Decisions: Record important decisions as `- [YYYY-MM-DD] Decision: rationale, links`.
- References: Keep links current to latest spec, research, and tasks. Add additional references as they are created.
- Scope: Edits here should reflect coordination/progress only; do not include application code changes. Preserve history.

## Key Decisions
- [2025-12-14] Decision: Feature created to address user need for more interactive, question-driven workflows that help users think through brainstorm and clarification tasks incrementally rather than generating files immediately.

## Progress Log
- [2025-12-14] Event: Feature hub scaffolded with initial summary and context gathering. Ready for research and planning workflows.
- [2025-12-14] Event: Research phase completed. Research packet created with findings on prompt engineering patterns for interactive conversations, question sequencing, and progressive disclosure. Focus: modifying workflow prompts to guide AI to ask questions incrementally rather than generating files immediately. See `research/2025-12-14_interactive-workflow-patterns.md`.
- [2025-12-14] Event: Plan created. Implementation plan ready for execution. Plan focuses on prompt engineering modifications to workflow files (no code changes). See `plan/2025-12-14_interactive-workflows-plan.md`.

## Implementation Checklist
- [x] Research: Understand current workflow execution patterns and identify interaction points
- [x] Design: Define question sequencing and pacing strategy for interactive sessions (2-3 questions per batch)
- [x] Design: Plan integration with existing templates (brainstorm-packet-template.md, clarification-packet-template.md)
- [x] Planning: Create implementation plan with concrete tasks
- [ ] Implementation: Add Interactive Mode section to clarify-feature workflow
- [ ] Implementation: Add Interactive Mode section to brainstorm workflow
- [ ] Implementation: Update feature hub documentation
- [ ] Testing: Validate that interactive sessions produce equivalent quality outputs to file-based approach

## Open Questions
- ~~What's the optimal number of questions per interaction to avoid overwhelm?~~ **RESEARCHED:** 2-3 questions per interaction recommended, explicitly instructed in prompts
- ~~Should interactive mode be the default, or opt-in via a flag?~~ **DECIDED:** Interactive conversation is the only mode; workflows updated to use this as default behavior
- ~~How do we ensure interactive sessions maintain the same completeness standards as file-based workflows?~~ **RESEARCHED:** Explicit completion checklists in prompts; verify all dimensions/phases covered before generating document (including open questions)
- ~~What happens if a user wants to switch from interactive to file-based mode mid-session?~~ **RESEARCHED:** Prompt instruction to generate document with current answers and mark incomplete sections and open questions if user requests early completion (no mode switching needed since interactive is the only mode)
- ~~How to handle unanswered or unimportant questions?~~ **RESEARCHED:** Use specific status labels: ❓ unknown (user doesn't know - can be resolved by person executing or AI agent), 🔍 needs research (requires evidence - route to devagent research), ⚠️ not important (user decided not relevant - explicitly out of scope), 🚫 not applicable (question doesn't fit context), ⏭️ deferred (address later), 🚧 blocked (can't answer due to dependencies). See `research/2025-12-14_question-status-labels.md` for full reference.
- How to structure prompts to ensure AI asks exactly 2-3 questions (not 1, not 5)? (Need explicit counting instructions)

## References
- Product Mission: `.devagent/workspace/product/mission.md` (2025-12-14) — DevAgent provides reusable agent-ready prompts and workflows for engineering teams
- Brainstorm Workflow: `.devagent/core/workflows/brainstorm.md` (2025-12-14) — Current workflow that generates brainstorm packets
- Clarify Feature Workflow: `.devagent/core/workflows/clarify-feature.md` (2025-12-14) — Current workflow that generates clarification packets
- Clarification Questions Framework: `.devagent/core/templates/clarification-questions-framework.md` (2025-12-14) — Systematic question sets for requirement clarification
- Constitution C3: `.devagent/workspace/memory/constitution.md` (2025-12-14) — Delivery principles including human-in-the-loop defaults
- Brainstorm Packet Template: `.devagent/core/templates/brainstorm-packet-template.md` (2025-12-14) — Template structure for brainstorm outputs
- Clarification Packet Template: `.devagent/core/templates/clarification-packet-template.md` (2025-12-14) — Template structure for clarification outputs
- Research: Interactive Workflow Patterns: `research/2025-12-14_interactive-workflow-patterns.md` (2025-12-14) — Prompt engineering research on question sequencing, progressive disclosure, and conversation patterns for interactive workflows
- Research: Question Status Labels: `research/2025-12-14_question-status-labels.md` (2025-12-14) — Reference guide for question status labels (answered, unknown, needs research, not important, not applicable, deferred, blocked)
- Plan: Interactive Workflows Implementation: `plan/2025-12-14_interactive-workflows-plan.md` (2025-12-14) — Implementation plan with concrete tasks for updating brainstorm and clarify-feature workflows to use interactive conversation as default behavior

## Next Steps

Recommended workflows to proceed:

1. **Research phase:** Run `devagent research` to explore:
   - Best practices for interactive AI workflows and question sequencing
   - Patterns for progressive disclosure in conversation-based systems
   - State management approaches for multi-turn workflows

2. **Clarification phase:** Run `devagent clarify-feature` to validate:
   - User experience requirements for interactive mode
   - Technical constraints and integration points
   - Success criteria for interactive vs. file-based workflows

3. **Planning phase:** Run `devagent create-plan` to synthesize research and clarification into an implementation plan
