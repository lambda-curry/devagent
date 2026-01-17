# Implement Bun-based label-driven task routing for Ralph Progress Tracker

- Owner: Jake Ruesink
- Last Updated: 2026-01-17
- Status: Draft
- Task Hub: `.devagent/workspace/tasks/active/DEV-34_implement-bun-based-label-driven-task-routing-for-ralph/`

## Summary

Replace current ad-hoc shell orchestration in the Ralph loop with a Bun-based, label-driven task router that assigns work to specialized agents.

**Scope / concept:**
- Tasks are units of work stored in the existing task system, with id, description, labels[], status, and comments/references.
- Labels act as routing and behavior signals (e.g. design, qa, review, architecture, implementation) and determine which agent profile processes a task.
- Agent profiles declare which labels they consume, model tier (cheap vs expensive), allowed actions, and output expectations.
- Bun scripts watch the task queue, match labels to agent profiles, execute agent runs, and persist outputs back onto tasks.
- Agents can comment on and reference other tasks to create cross-task communication (e.g. architecture agent leaving assumptions or edge cases on implementation/QA tasks) instead of relying on a single global memory.

**Design questions / constraints to clarify:**
- Are labels exclusive or composable (e.g. architecture + review on the same task)?
- Can multiple agents pick up the same task, and is task ownership transferred or shared?
- What happens if no agent matches a label?

**Clarification from Linear comment:**
- We don't need a router agent, beads acts as the router and as long as the agents are updating the statuses of their task that they're working on then beads helps keep track of what's ready. QA beads can also leave a comment of why a task failed and put it back to to do so that another agent can pick it up. A project management agent task could come in periodically to review progress and see if any new tasks are needed.

**Optional future extension:**
- Add a router agent that reads new tasks, suggests or auto-applies labels, and acts as the PM/triage brain of the loop.

## Agent Update Instructions
- Always update "Last Updated" to today's date (ISO: YYYY-MM-DD) when editing this file. **Get the current date by explicitly running `date +%Y-%m-%d` first, then use the output for the "Last Updated" field.**
- Progress Log: Append a new entry at the end in the form `- [YYYY-MM-DD] Event: concise update, links to files`. Do not rewrite or delete prior entries. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- Implementation Checklist: Mark items as `[x]` when complete, `[~]` for partial with a short note. Add new items if discovered; avoid removing items—strike through only when obsolete.
- Key Decisions: Record important decisions as `- [YYYY-MM-DD] Decision: rationale, links`. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- References: Keep links current to latest spec, research, and tasks. Add additional references as they are created.
- Scope: Edits here should reflect coordination/progress only; do not include application code changes. Preserve history.

## Key Decisions
(To be populated as work progresses)

## Progress Log
- [2026-01-17] Task hub created: Initial scaffolding with task details from Linear issue DEV-34
- [2026-01-17] Research completed: Created research packet on Bun-based label-driven task routing patterns, agent profiles, and implementation strategies
- [2026-01-17] Clarification completed: Clarified all critical requirements including agent profile structure, config structure, error handling, and migration approach
- [2026-01-17] Plan created: `.devagent/workspace/tasks/active/DEV-34_implement-bun-based-label-driven-task-routing-for-ralph/plan/2026-01-17_label-driven-routing-plan.md`

## Implementation Checklist
(To be populated after research and planning)

## Open Questions
- Are labels exclusive or composable (e.g. architecture + review on the same task)?
- Can multiple agents pick up the same task, and is task ownership transferred or shared?
- What happens if no agent matches a label?
- How should agent profiles be structured (labels consumed, model tier, allowed actions, output expectations)?
- What is the Bun script architecture for watching task queue and matching labels to agent profiles?
- How should agents persist outputs back onto tasks (comments, references, status updates)?

## References
- Linear Issue: [DEV-34](https://linear.app/lambdacurry/issue/DEV-34/implement-bun-based-label-driven-task-routing-for-ralph) (2026-01-17)
- Research: `.devagent/workspace/tasks/active/DEV-34_implement-bun-based-label-driven-task-routing-for-ralph/research/2026-01-17_bun-label-driven-task-routing-research.md` (2026-01-17)
- Clarification: `.devagent/workspace/tasks/active/DEV-34_implement-bun-based-label-driven-task-routing-for-ralph/clarification/2026-01-17_initial-clarification.md` (2026-01-17)
- Ralph Autonomous Execution Flow: `.devagent/plugins/ralph/autonomous-execution-flow.md` - Current Ralph execution architecture with shell orchestration
- Ralph Plugin Instructions: `.devagent/plugins/ralph/AGENTS.md` - Current Ralph agent instructions and Beads integration
- Ralph Script: `.devagent/plugins/ralph/tools/ralph.sh` - Current shell-based Ralph execution script
- Beads Labels Documentation: `.beads/docs/LABELS.md` - Label system capabilities and usage patterns
- Beads Integration Skill: `.devagent/plugins/ralph/skills/beads-integration/SKILL.md` - Current Beads CLI integration patterns
- Ralph Integration Research: `.devagent/workspace/research/2026-01-10_ralph-integration-research.md` - Previous research on Ralph architecture
- Ralph Improvements Task: `.devagent/workspace/tasks/completed/2026-01-13_ralph-improvements/AGENTS.md` - Previous improvements to Ralph system
- DevAgent Constitution: `.devagent/workspace/memory/constitution.md` - Delivery principles and guardrails (C1-C6)
- DevAgent Product Mission: `.devagent/workspace/product/mission.md` - Product context and mission alignment

## Next Steps

Recommended follow-up workflows:

1. **Create plan:** `devagent create-plan` - Develop implementation plan using the clarified requirements
