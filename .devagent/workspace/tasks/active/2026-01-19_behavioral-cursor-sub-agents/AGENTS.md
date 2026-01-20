# Behavioral Cursor Sub-Agents [DERIVED] Progress Tracker

- Owner: Jake Ruesink
- Last Updated: 2026-01-19
- Status: Draft
- Task Hub: `.devagent/workspace/tasks/active/2026-01-19_behavioral-cursor-sub-agents/`

## Summary
For using cursor sub agents in a behavioral manner (research, beads management, browser use, others?) this will help keep the context small for our main agent. This task aims to define and document those sub-agent behaviors (when to invoke them, the input/output contract, and how to distill results back into the main thread) so work stays bounded, context-light, and repeatable.

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
- [2026-01-19] Event: Task hub scaffolded.
(Append new entries here, preserving historical entries to maintain a progress timeline.)

## Implementation Checklist
- [ ] Define the initial set of “behavioral” sub-agent roles (e.g., research, beads management, browser use) and the boundaries of each role.
- [ ] Define the invocation + output contract (inputs, expected artifacts, how results are summarized back to the main agent).
- [ ] Define context-minimization rules (what information is forwarded, what stays in the sub-agent thread, how to cite sources/paths).
- [ ] Produce 1–2 concrete end-to-end examples (main agent delegates → sub-agent returns concise output → main agent proceeds).

## Open Questions
- What is the canonical set of sub-agent “behaviors” we want to support initially (and what do we explicitly exclude)? [NEEDS CLARIFICATION]
- What artifact formats should sub-agents return (bullets only, citations, diffs, runnable commands, etc.)? [NEEDS CLARIFICATION]
- How do we handle tool use boundaries safely (browser, filesystem edits, beads operations) while keeping the main context small? [NEEDS CLARIFICATION]

## References
- [2026-01-19] `.devagent/workspace/product/mission.md` — Mission emphasis on structured, adoptable agent workflows and compounding reusable knowledge.
- [2026-01-19] `.devagent/workspace/product/roadmap.md` — Highlights incremental adoption playbooks and adaptive agent selection.
- [2026-01-19] `.devagent/workspace/memory/constitution.md` — Tool-agnostic by default; tool-specific implementations should live under dedicated directories (e.g., `.devagent/tools/cursor/`).
- [2026-01-19] `.devagent/workspace/memory/tech-stack.md` — Captures agent orchestration and context persistence conventions in this repo.
- [2026-01-19] `.devagent/workspace/product/brainstorms/2026-01-10_ralph-integration-capabilities.md` — Mentions Cursor/Windsurf integration as an explicit capability area.
- [2026-01-19] `.devagent/workspace/tasks/active/2026-01-19_utilize-all-agents-well/AGENTS.md` — Related task hub focusing on collaboration contracts across roles/agents.

## Next Steps
- `devagent clarify-task` (lock down: which sub-agent behaviors exist, required I/O contract, “context-minimization” rules)
- `devagent research` (scan `.devagent/**` for existing agent-collaboration patterns; propose a minimal “behavioral sub-agent” spec)
- `devagent create-plan` (turn decisions into an adoptable, repeatable workflow + examples)

