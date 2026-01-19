# Epic Auto-Close on Final Subtask Progress Tracker

- Owner: Jake Ruesink
- Last Updated: 2026-01-18
- Status: Draft
- Task Hub: `.devagent/workspace/tasks/active/2026-01-18_epic-auto-close-on-final-subtask/`

## Summary
Implement (and document) a canonical mechanism to automatically transition a Beads epic to `closed` when its final subtask transitions to `closed`, so the monitoring kanban and Beads status remain consistent without manual cleanup. This task was split out of `2026-01-17_ralph-revisions-v4` to track the remaining gap separately after most v4 items were completed.

## Agent Update Instructions
- Always update "Last Updated" to today's date (ISO: YYYY-MM-DD) when editing this file. **Get the current date by explicitly running `date +%Y-%m-%d` first, then use the output for the "Last Updated" field.**
- Progress Log: Append a new entry at the end in the form `- [YYYY-MM-DD] Event: concise update, links to files`. Do not rewrite or delete prior entries. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- Implementation Checklist: Mark items as `[x]` when complete, `[~]` for partial with a short note. Add new items if discovered; avoid removing items—strike through only when obsolete.
- Key Decisions: Record important decisions as `- [YYYY-MM-DD] Decision: rationale, links`. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- References: Keep links current to latest spec, research, and tasks. Add additional references as they are created.
- Scope: Edits here should reflect coordination/progress only; do not include application code changes. Preserve history.

## Key Decisions
- [Date] Decision: Choose the canonical epic auto-close mechanism (router-driven vs PM final-review task), with rationale and links.
- [2026-01-18] Decision: Canonical epic close occurs only via the final “Generate Epic Revise Report” quality gate task; no router-driven auto-close backstop; keep epic open when blocked children exist. (Ref: `.devagent/workspace/tasks/active/2026-01-18_epic-auto-close-on-final-subtask/clarification/2026-01-18_initial-clarification.md`)

## Progress Log
- [2026-01-18] Event: Task hub created (split out of `2026-01-17_ralph-revisions-v4`) to track epic auto-close separately.
- [2026-01-18] Event: Research completed; recommend canonical epic close via final “Generate Epic Revise Report” quality gate task (treat as “final subtask”). (Ref: `.devagent/workspace/tasks/active/2026-01-18_epic-auto-close-on-final-subtask/research/2026-01-18_epic-auto-close-on-final-subtask-research.md`)
- [2026-01-18] Event: Implementation plan created for doc updates + epic-close semantics alignment. (Ref: `.devagent/workspace/tasks/active/2026-01-18_epic-auto-close-on-final-subtask/plan/2026-01-18_epic-auto-close-on-final-subtask-plan.md`)
- [2026-01-18] Event: Updated Ralph docs to match clarified epic-close semantics in setup workflow and plan-to-beads conversion skill. (Refs: `.devagent/plugins/ralph/workflows/setup-ralph-loop.md`, `.devagent/plugins/ralph/skills/plan-to-beads-conversion/SKILL.md`)
(Append new entries here, preserving historical entries to maintain a progress timeline.)

## Implementation Checklist
- [x] Decide: Canonical epic auto-close mechanism (router-driven vs PM final-review task); document decision + follow-ups.
- [ ] Implement: Epic auto-close trigger when final subtask closes (per decision) and ensure it does not fight manual status overrides.
- [ ] Verify: Epic status transitions correctly across edge cases (no children, blocked children, mixed status, reopen scenarios).
- [x] Document: Update the relevant Ralph/Beads workflow docs to describe the behavior and any manual override rules.
- [x] Plan: Create implementation plan covering doc updates and clarified epic-close semantics.

## Open Questions
- What is the canonical auto-close mechanism we want long-term (router-driven vs PM final-review task)?
- How should reopen behavior work (if a closed epic gains a new open subtask)?

## References
- [2026-01-18] v4 task hub: `.devagent/workspace/tasks/active/2026-01-17_ralph-revisions-v4/AGENTS.md` — source checklist item “Auto-close epics when final subtask completes”.
- [2026-01-18] v4 plan: `.devagent/workspace/tasks/active/2026-01-17_ralph-revisions-v4/plan/2026-01-17_ralph-revisions-v4-plan.md` — implementation guidance + decision framing for epic auto-close.
- [2026-01-18] v4 research: `.devagent/workspace/tasks/active/2026-01-17_ralph-revisions-v4/research/2026-01-17_ralph-revisions-v4-research.md` — background on prior dead code and desired behavior.
- [2026-01-18] Ralph router: `.devagent/plugins/ralph/tools/ralph.ts` — current execution loop + epic context (potential integration point if router-driven).
- [2026-01-18] Research: `.devagent/workspace/tasks/active/2026-01-18_epic-auto-close-on-final-subtask/research/2026-01-18_epic-auto-close-on-final-subtask-research.md` — canonical mechanism recommendation + edge cases.
- [2026-01-18] Clarification: `.devagent/workspace/tasks/active/2026-01-18_epic-auto-close-on-final-subtask/clarification/2026-01-18_initial-clarification.md` — decision record for canonical epic-close semantics + blocked-task behavior.

## Next Steps
- `devagent clarify-task`
- `devagent research`
- `devagent create-plan`
