# Research Packet — Utilize All Agents Well (Ralph Loop Improvements)

- Mode: Task
- Requested By: Jake Ruesink
- Last Updated: 2026-01-19
- Related Plan: `.devagent/workspace/tasks/active/2026-01-19_utilize-all-agents-well/plan/2026-01-19_utilize-all-agents-well-plan.md`
- Storage Path: `.devagent/workspace/tasks/active/2026-01-19_utilize-all-agents-well/research/2026-01-19_agent-collaboration-contract-research.md`
- Stakeholders: Jake Ruesink (Decision Maker)
- Notes: Reconstructed from handoff summary; validate against original research packet if it exists elsewhere.

## Request Overview
Define improvements to the Ralph loop so that design, QA, and final review behaviors are used consistently. Focus on setup-ralph-loop improvements that apply to any plan, plus final review behavior that turns PR review comments into follow-up tasks before revise reports are generated.

## Research Questions
| ID | Question | Status (Planned / Answered / Follow-up) | Notes |
| --- | --- | --- | --- |
| R1 | When should setup-ralph-loop create design tasks? | Answered | Only when the plan is UI-sensitive. |
| R2 | What design deliverables are expected? | Answered | Intent + observable acceptance, component inventory/reuse with code refs, Storybook when available, lightweight mockups/screenshots when needed. |
| R3 | How should QA reopening work? | Answered | QA can reopen tasks to `open` with concrete fix guidance; out-of-scope items go to revise report. |
| R4 | What should final review do with PR review comments? | Answered | Create new child tasks (engineering/qa), keep final review open, defer revise report until new tasks closed. |
| R5 | What are the open items for planning? | Follow-up | UI-sensitivity heuristic, baseline "read latest comments" wording, minimum design artifact when Storybook is missing. |

## Key Findings
- Design work should only be added when a plan is UI-sensitive; otherwise keep setup lightweight.
- Design tasks must explicitly capture intent, observable acceptance, component inventory/reuse with code references, Storybook stories when available, and lightweight mockups/screenshots when needed.
- QA is allowed to reopen tasks to `open` when it has high-confidence fixes with concrete directions; out-of-scope improvements should be logged for revise report.
- Final review must translate PR review comments into new child tasks and defer revise report generation until those tasks are closed.
- Planning must define a simple UI-sensitivity heuristic, a baseline "read latest comments" rule, and a minimum design artifact when Storybook is unavailable.

## Detailed Findings
### R1: When should setup-ralph-loop create design tasks?
- Summary: Only when the plan is judged UI-sensitive.
- Evidence: Handoff decisions (2026-01-19) in task context.
- Freshness: 2026-01-19.

### R2: What design deliverables are expected?
- Summary: Design tasks must include intent + observable acceptance, component inventory/reuse with code refs, Storybook stories when available, and lightweight mockups/screenshots when needed. Output must live in the design task comments with links.
- Evidence: Handoff decisions (2026-01-19).
- Freshness: 2026-01-19.

### R3: How should QA reopening work?
- Summary: QA can reopen tasks to `open` when it can provide concrete fix guidance; out-of-scope improvements should be logged for revise report follow-up.
- Evidence: Handoff decisions (2026-01-19).
- Freshness: 2026-01-19.

### R4: Final review behavior for PR review comments?
- Summary: Create new child tasks from PR review comments (engineering/qa labeled), keep final review open, and run revise report only after those tasks close.
- Evidence: Handoff decisions (2026-01-19).
- Freshness: 2026-01-19.

### R5: Open items for planning
- Summary: UI-sensitivity heuristic, baseline "read latest comments" wording, and minimum design artifact definition need to be decided during planning.
- Evidence: Handoff deferred items (2026-01-19).
- Freshness: 2026-01-19.

## Implications for Implementation
- Update `setup-ralph-loop` workflow to include a UI-sensitivity heuristic and to create a dedicated design task when triggered.
- Encode design deliverables into the design task metadata/comments so downstream agents know what to produce.
- Update agent instructions to ensure they read the latest task comments before execution and to align QA reopen semantics.
- Update final review flow to create child tasks from PR review comments and defer revise report generation until those tasks close.

## Risks & Open Questions
| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Define a UI-sensitivity heuristic | Question | Jake Ruesink | Decide in plan and document in setup-ralph-loop | 2026-01-19 |
| Define baseline "read latest comments" requirement | Question | Jake Ruesink | Decide wording and enforcement location in plan | 2026-01-19 |
| Minimum design artifact when Storybook is missing | Question | Jake Ruesink | Decide requirement and document in plan | 2026-01-19 |

## Recommended Follow-ups
- Validate the UI-sensitivity heuristic against recent Ralph plans to ensure it is not overly broad or narrow.
- Confirm the exact Beads CLI command for listing task comments and encode it in agent instructions.

## Sources
| Reference | Type | Freshness | Access Notes |
| --- | --- | --- | --- |
| Handoff summary (2026-01-19) | Internal | 2026-01-19 | Reconstructed; verify against original packet if available. |
