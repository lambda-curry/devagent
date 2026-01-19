# Improve Beads Task Labeling and Syncing [DERIVED] Progress Tracker

- Owner: Jake Ruesink [NEEDS CLARIFICATION]
- Last Updated: 2026-01-18
- Status: Draft
- Task Hub: `.devagent/workspace/tasks/active/2026-01-18_improve-beads-task-labeling-and-syncing/`

## Summary
I think I noticed in this last run is that we fell back to our project manager agent for all of the tasks, because I don't think we set up our labels properly in the workflow to set up the beads tasks. Um, so we should make sure that we're, including that as part of this process to set up the labels and make sure that we're thinking about the task set up from the perspective of wouldn't it be good to have each agent work on them. And also noting that the agents only work on the uh, one level deep, the, issues directly underneath the epic. The many subissues are used as context. So, um, for that agent. So the subissues don't need the labels, and we should think about it as each, um, epic, uh, issue one level under the epic, will be the main thread of work.

Another thing that's happening is, after every commit, we have a thinking issue with beads. And we need to figure out how to solve that because it has to then go make another commit to sink the beads and that's just a lot of unnecessary commits. So let's look through the Beads documentation, see how we can fix this issue.

Um, maybe we need to turn off our, um, beads daemon, and only do, um, manual syncing. That would be one option to look into.

And then also, finally, the project manager agent is getting tasks. I don't think it should be doing any of the work, maybe documentation work. But it should mostly be delegating, um, and making sure that there's tasks for execution that the coding agent has to do the work or the design agent has to look through the work. So, I should be reviewing the, um, the task list, making sure that's set up properly, and the documentation isn't a good place for the work to get done, um, by the other agents.

And that's kind of the goal of the project management agent. Rather than just being uh, a backup. It should be the fallback, but then also make sure that it is delegating well. And adding tasks where necessary.

## Agent Update Instructions
- Always update "Last Updated" to today's date (ISO: YYYY-MM-DD) when editing this file. **Get the current date by explicitly running `date +%Y-%m-%d` first, then use the output for the "Last Updated" field.**
- Progress Log: Append a new entry at the end in the form `- [YYYY-MM-DD] Event: concise update, links to files`. Do not rewrite or delete prior entries. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- Implementation Checklist: Mark items as `[x]` when complete, `[~]` for partial with a short note. Add new items if discovered; avoid removing items—strike through only when obsolete.
- Key Decisions: Record important decisions as `- [YYYY-MM-DD] Decision: rationale, links`. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- References: Keep links current to latest spec, research, and tasks. Add additional references as they are created.
- Scope: Edits here should reflect coordination/progress only; do not include application code changes. Preserve history.

## Key Decisions
- [2026-01-18] Decision: Default fallback behavior is delegation-first; use `general` as the routing fallback label and reserve `project-manager` for explicit coordination checkpoints. References: `.devagent/plugins/ralph/workflows/setup-ralph-loop.md`, `.devagent/plugins/ralph/agents/project-manager-agent-instructions.md`.

## Progress Log
- [Date] Event: Status update, key actions, references to files (spec, research, task plans, prompts).
(Append new entries here, preserving historical entries to maintain a progress timeline.)
- [2026-01-18] Event: Added research packet on label routing + post-commit Beads sync churn: `.devagent/workspace/tasks/active/2026-01-18_improve-beads-task-labeling-and-syncing/research/2026-01-18_beads-label-routing-and-post-commit-sync-churn.md`.
- [2026-01-18] Event: Tightened label assignment + verification rules, clarified PM delegation-first behavior, added Beads churn diagnostic, and improved router fallback logging. References: `.devagent/plugins/ralph/workflows/setup-ralph-loop.md`, `.devagent/plugins/ralph/skills/plan-to-beads-conversion/SKILL.md`, `.devagent/plugins/ralph/agents/project-manager-agent-instructions.md`, `.devagent/plugins/ralph/agents/general-agent-instructions.md`, `.devagent/plugins/ralph/README.md`, `.devagent/plugins/ralph/tools/ralph.ts`, `.devagent/workspace/tasks/active/2026-01-18_improve-beads-task-labeling-and-syncing/research/2026-01-18_beads-label-routing-and-post-commit-sync-churn.md`.

## Implementation Checklist
- [x] Define label taxonomy and assignment rules for Beads tasks so work routes to the correct execution agents (and avoids overusing the project manager).
- [x] Document the “one level under epic” rule: only direct children need labels; deeper sub-issues are context-only.
- [~] Investigate the “thinking issue after every commit” Beads behavior; identify root cause and mitigation. (Diagnostic checklist added; root cause still pending.)
- [ ] Evaluate turning off the Beads daemon in favor of manual syncing; document tradeoffs and recommended default.
- [x] Define updated responsibilities for the project manager agent (delegation-first; limit “doing” work).

## Open Questions
- What are the current labels used for task routing, and what are the desired agent label mappings? (Owner: [NEEDS CLARIFICATION])
- Which Beads sync mode is currently enabled (daemon vs manual), and what triggers the “thinking issue” after commit? (Owner: [NEEDS CLARIFICATION])

## References
- [2026-01-18] `.devagent/workspace/product/brainstorms/2026-01-10_ralph-integration-capabilities_FINAL.md` — notes Beads SQLite as PM foundation; calls out git hooks automation and Linear ↔ Beads sync as capability gaps.
- [2026-01-18] `.devagent/workspace/memory/constitution.md` — emphasizes traceable artifacts and consistent process/tooling.
- [2026-01-18] `.devagent/workspace/tasks/active/2026-01-18_improve-beads-task-labeling-and-syncing/research/2026-01-18_beads-label-routing-and-post-commit-sync-churn.md` — explains why tasks fall back to PM agent when labels are missing/mismatched; recommends `bd sync --flush-only` pre-commit to avoid extra beads-sync commits.
- [2026-01-18] `.devagent/workspace/tasks/active/2026-01-18_improve-beads-task-labeling-and-syncing/plan/2026-01-18_improve-beads-task-labeling-and-syncing-plan.md` — implementation plan to enforce one-level label routing and diagnose lingering post-commit `.beads/issues.jsonl` churn.

## Next Steps
- `devagent research`
- `devagent clarify-task`
- `devagent create-plan`
