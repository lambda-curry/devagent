# Ralph Branching Flow Progress Tracker

- Owner: Jake Ruesink
- Last Updated: 2026-01-16
- Status: Draft
- Task Hub: `.devagent/workspace/tasks/active/DEV-32_ralph-branching-flow/`

## Summary
Currently Ralph has a setup agent that makes sure everything is good to go and that a new branch is created. This task involves removing the setup agent and the ending agent for now. If we need to bring back this concept we can. Instead, we should add more to our configuration that we setup beforehand - similar to how we say which agent command we should run, we should also setup in the config the base branch that we're working from and the name of our working branch so we can pass that as context to our main ralph loop agent. Right now our setup agent is responsible for making a new branch at the beginning of the flow and sometimes it doesn't go well, so removing the before and after agents for now should help simplify our flow.

## Agent Update Instructions
- Always update "Last Updated" to today's date (ISO: YYYY-MM-DD) when editing this file. **Get the current date by explicitly running `date +%Y-%m-%d` first, then use the output for the "Last Updated" field.**
- Progress Log: Append a new entry at the end in the form `- [YYYY-MM-DD] Event: concise update, links to files`. Do not rewrite or delete prior entries. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- Implementation Checklist: Mark items as `[x]` when complete, `[~]` for partial with a short note. Add new items if discovered; avoid removing items—strike through only when obsolete.
- Key Decisions: Record important decisions as `- [YYYY-MM-DD] Decision: rationale, links`. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- References: Keep links current to latest spec, research, and tasks. Add additional references as they are created.
- Scope: Edits here should reflect coordination/progress only; do not include application code changes. Preserve history.

## Key Decisions
- [2026-01-16] Decision: Remove setup agent and ending agent from Ralph flow to simplify execution. Move branch configuration to config.json instead of dynamic branch creation.

## Progress Log
- [2026-01-16] Event: Task hub created for DEV-32 Ralph Branching Flow.
- [2026-01-16] Event: Research completed on current setup agent and final review agent implementation. Research packet created with findings and recommendations.
- [2026-01-16] Event: Clarification session completed. All key requirements clarified: configuration schema, error handling, execute-autonomous integration, branch naming convention.
- [2026-01-16] Event: Implementation plan created at `.devagent/workspace/tasks/active/DEV-32_ralph-branching-flow/plan/2026-01-16_ralph-branching-flow-plan.md`.

## Implementation Checklist
- [x] Research current setup agent and ending agent implementation
- [x] Design new configuration structure for base branch and working branch
- [x] Create implementation plan for branching flow simplification
- [ ] Update config.json schema to include branch configuration
- [ ] Remove setup agent workflow invocation from ralph.sh
- [ ] Remove ending agent workflow invocation from ralph.sh
- [ ] Update main ralph loop agent to use branch configuration from config
- [ ] Test simplified flow with new configuration approach

## Open Questions
- Question: Should we preserve any validation logic from the setup agent? Owner: TBD, due date: TBD.
- Question: What should happen if the configured working branch doesn't exist? Owner: TBD, due date: TBD.

## References
- Linear Issue: [DEV-32](https://linear.app/lambdacurry/issue/DEV-32/ralph-branching-flow) (2026-01-16)
- Research: `.devagent/workspace/tasks/active/DEV-32_ralph-branching-flow/research/2026-01-16_ralph-branching-flow-research.md` (2026-01-16) - Comprehensive research on setup agent, final review agent, branch creation issues, and configuration design
- Plan: `.devagent/workspace/tasks/active/DEV-32_ralph-branching-flow/plan/2026-01-16_ralph-branching-flow-plan.md` (2026-01-16) - Implementation plan for simplifying branching flow
- Ralph Setup Agent: `.devagent/plugins/ralph/workflows/setup-workspace.md` (2026-01-16) - Current implementation that creates/switches branches
- Ralph Execution Flow: `.devagent/plugins/ralph/autonomous-execution-flow.md` (2026-01-16) - Documents current flow with setup and final review agents
- Ralph Script: `.devagent/plugins/ralph/tools/ralph.sh` (2026-01-16) - Main execution script that invokes setup and final review agents
- Ralph Configuration: `.devagent/plugins/ralph/tools/config.json` (2026-01-16) - Configuration file that needs to be extended with branch settings
- Clarification: `.devagent/workspace/tasks/active/DEV-32_ralph-branching-flow/clarification/2026-01-16_initial-clarification.md` (2026-01-16) - Complete requirement clarification with all key decisions documented

## Next Steps
Recommended follow-up workflows:

1. **Research current implementation:**
   ```bash
   devagent research
   ```
   Focus on understanding the setup agent's branch creation logic and the ending agent's responsibilities.

2. **Clarify scope and design:**
   ```bash
   devagent clarify-task
   ```
   Define the exact configuration schema and behavior for branch management.

3. **Create implementation plan:**
   ```bash
   devagent create-plan
   ```
   After research and clarification, create a detailed plan for removing agents and adding configuration.
