# Review Plan Workflow [DERIVED] Progress Tracker

- Owner: Jake Ruesink
- Last Updated: 2026-01-14
- Status: Draft
- Task Hub: `.devagent/workspace/tasks/active/2026-01-14_review-plan-workflow/`

## Summary
Create a review plan workflow that provides a high-level summary of a plan and allows users to interactively walk through plan steps in detail. The workflow should enable users to either review specific plan steps they're interested in or walk through the entire plan step-by-step, with thoughtful questions to ensure the plan aligns with their expectations and accomplishes what they want. This workflow will help validate plans before implementation, ensuring alignment between the plan's approach and the user's goals.

## Agent Update Instructions
- Always update "Last Updated" to today's date (ISO: YYYY-MM-DD) when editing this file. **Get the current date by explicitly running `date +%Y-%m-%d` first, then use the output for the "Last Updated" field.**
- Progress Log: Append a new entry at the end in the form `- [YYYY-MM-DD] Event: concise update, links to files`. Do not rewrite or delete prior entries. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- Implementation Checklist: Mark items as `[x]` when complete, `[~]` for partial with a short note. Add new items if discovered; avoid removing items—strike through only when obsolete.
- Key Decisions: Record important decisions as `- [YYYY-MM-DD] Decision: rationale, links`. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- References: Keep links current to latest spec, research, and tasks. Add additional references as they are created.
- Scope: Edits here should reflect coordination/progress only; do not include application code changes. Preserve history.

## Key Decisions
- [Date] Decision: Description, rationale, links to supporting docs.

## Progress Log
- [2026-01-14] Event: Research packet created. Investigated plan structure, interactive workflow patterns, review validation approaches, and question frameworks. Research packet: `research/2026-01-14_review-plan-workflow-research.md`
- [2026-01-14] Event: Clarification session completed. Validated requirements for review plan workflow. Key decisions: high-level summary + selective review + full walkthrough (must-have), update plan document during review, keep it simple. Clarification packet: `clarification/2026-01-14_initial-clarification.md`
- [2026-01-14] Event: Implementation plan created. Plan document: `plan/2026-01-14_review-plan-workflow-plan.md`. Three implementation tasks defined: create workflow file, create command file, update workflow roster.
(Append new entries here, preserving historical entries to maintain a progress timeline.)

## Implementation Checklist
- [ ] Task 1: Create Review Plan Workflow File — Create `.devagent/core/workflows/review-plan.md` with interactive session model and adaptive suggestions. Plan: `plan/2026-01-14_review-plan-workflow-plan.md`
- [ ] Task 2: Create Review Plan Command File — Create `.agents/commands/review-plan.md` command file. Plan: `plan/2026-01-14_review-plan-workflow-plan.md`
- [ ] Task 3: Update Workflow Roster Documentation — Update `.devagent/core/AGENTS.md` workflow roster. Plan: `plan/2026-01-14_review-plan-workflow-plan.md`

## Open Questions
- Question: Owner, due date.

## References
- Plan: `plan/2026-01-14_review-plan-workflow-plan.md` — Implementation plan for review plan workflow (2026-01-14)
- Research: `research/2026-01-14_review-plan-workflow-research.md` — Research on plan review patterns, interactive workflows, and validation approaches (2026-01-14)
- Clarification: `clarification/2026-01-14_initial-clarification.md` — Validated requirements for review plan workflow (2026-01-14)
- Tasks: [link]
- `.devagent/workspace/product/mission.md` — DevAgent product mission emphasizing structured workflows and AI support (2026-01-14)
- `.devagent/workspace/memory/constitution.md` — Constitution clauses including C3 (human-in-the-loop defaults) and C4 (tool-agnostic design) (2026-01-14)
- `.devagent/core/workflows/create-plan.md` — Plan creation workflow that produces plans for review (2026-01-14)
- `.devagent/core/workflows/implement-plan.md` — Implementation workflow that executes plans; review workflow would validate plans before this step (2026-01-14)
- `.devagent/core/workflows/clarify-task.md` — Interactive clarification workflow that uses question-driven conversations; similar pattern could inform review workflow design (2026-01-14)
- `.devagent/workspace/tasks/completed/2025-12-14_interactive-brainstorm-clarify/plan/2025-12-14_interactive-workflows-plan.md` — Example of interactive workflow design with incremental questions (2026-01-14)
- `.devagent/core/workflows/review-pr.md` — Review workflow for PRs; similar validation pattern could inform plan review approach (2026-01-14)

## Next Steps
Recommended follow-up workflows:
- `devagent research` — Research existing plan review patterns, interactive workflow designs, and validation approaches
- `devagent clarify-task` — Clarify requirements for the review workflow, including interaction patterns and validation criteria
- `devagent create-plan` — Create implementation plan for the review plan workflow
