# Utilize All Agents Well (Ralph Loop Improvements) Progress Tracker

- Owner: Jake Ruesink
- Last Updated: 2026-01-20
- Status: Draft
- Task Hub: `.devagent/workspace/tasks/active/2026-01-19_utilize-all-agents-well/`

## Summary
Improve Ralph loop setup and final review coordination so design work is created when plans are UI-sensitive, design intent is captured as actionable artifacts, agents consistently read the latest task comments, and PR review feedback results in follow-up tasks before revise reports are generated.

## Agent Update Instructions
- Always update "Last Updated" to today's date (ISO: YYYY-MM-DD) when editing this file. **Get the current date by explicitly running `date +%Y-%m-%d` first, then use the output for the "Last Updated" field.**
- Progress Log: Append a new entry at the end in the form `- [YYYY-MM-DD] Event: concise update, links to files`. Do not rewrite or delete prior entries. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- Implementation Checklist: Mark items as `[x]` when complete, `[~]` for partial with a short note. Add new items if discovered; avoid removing items—strike through only when obsolete.
- Key Decisions: Record important decisions as `- [YYYY-MM-DD] Decision: rationale, links`. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- References: Keep links current to latest spec, research, and tasks. Add additional references as they are created.
- Scope: Edits here should reflect coordination/progress only; do not include application code changes. Preserve history.

## Key Decisions
- [2026-01-19] Decision: Only add design tasks when the setup agent judges a plan as UI-sensitive.
- [2026-01-19] Decision: Design tasks must capture intent + observable acceptance, component inventory/reuse with code refs, Storybook stories when available, and lightweight mockups/screenshots when needed (design output lives in the design task comments + links).
- [2026-01-19] Decision: QA may reopen a task to `open` for high-confidence improvements when it can provide concrete fix direction; out-of-scope improvements should be logged for revise report follow-up.
- [2026-01-19] Decision: Final review should create new child tasks for PR review comments (engineering/qa labeled), keep the final review task open, and only run the revise report after the new tasks are closed.

## Progress Log
- [2026-01-19] Event: Task hub scaffolded from handoff summary; plan creation started.
- [2026-01-19] Event: Created plan `.devagent/workspace/tasks/active/2026-01-19_utilize-all-agents-well/plan/2026-01-19_utilize-all-agents-well-plan.md`.
- [2026-01-19] Event: Implemented plan updates across Ralph workflows and agent instructions (setup loop UI-sensitivity, design deliverables, comment-reading baseline, PR-review follow-ups).
- [2026-01-20] Event: Addressed PR review feedback (design label mapping example, PR review thread triage guidance, metadata refresh).

## Implementation Checklist
- [x] Research completed (agent collaboration contract research packet).
- [x] Clarification completed (initial clarification packet).
- [x] Create plan for setup-ralph-loop + final review updates (this task).
- [x] Update setup-ralph-loop + plan-to-beads conversion with UI-sensitivity + design task rules.
- [x] Standardize \"read latest comments\" + QA reopen semantics in Ralph agent docs.
- [x] Update final review workflow to create follow-up tasks before revise report generation.

## Open Questions
- What is the exact UI-sensitivity heuristic for the setup agent to apply? [NEEDS CLARIFICATION]
- What is the crisp baseline wording for "agents read latest comments" so it is enforceable but not nitpicky? [NEEDS CLARIFICATION]
- When Storybook is missing, what is the minimum acceptable design artifact (screenshot vs lightweight mockup)? [NEEDS CLARIFICATION]

## References
- `.devagent/workspace/tasks/active/2026-01-19_utilize-all-agents-well/research/2026-01-19_agent-collaboration-contract-research.md`
- `.devagent/workspace/tasks/active/2026-01-19_utilize-all-agents-well/clarification/2026-01-19_initial-clarification.md`
- `.devagent/workspace/tasks/active/2026-01-19_utilize-all-agents-well/plan/2026-01-19_utilize-all-agents-well-plan.md`
- `.devagent/plugins/ralph/workflows/setup-ralph-loop.md`
- `.devagent/plugins/ralph/agents/design-agent-instructions.md`
- `.devagent/plugins/ralph/agents/qa-agent-instructions.md`
- `.devagent/plugins/ralph/agents/project-manager-agent-instructions.md`
- `.devagent/plugins/ralph/workflows/final-review.md`
- `.devagent/plugins/ralph/tools/config.json`

## Next Steps
- Run: `devagent create-plan`
