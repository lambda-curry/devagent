# PR Epic Run Review Report Slash Command Progress Tracker

- Owner: Jake Ruesink
- Last Updated: 2026-01-20
- Status: Completed
- Task Hub: `.devagent/workspace/tasks/active/2026-01-20_pr-epic-run-review-report-slash-command/`

## Summary
Establish a repeatable “run review report” workflow and slash command that evaluates any PR + Beads epic run against the canonical `ralph-e2e` expectations rubric. The workflow produces a `run-report.md` artifact, posts an epic summary, and updates the PR description with a run summary so Ralph loops get tighter feedback and run outcomes are traceable.

## Agent Update Instructions
- Always update "Last Updated" to today's date (ISO: YYYY-MM-DD) when editing this file. **Get the current date by explicitly running `date +%Y-%m-%d` first, then use the output for the "Last Updated" field.**
- Progress Log: Append a new entry at the end in the form `- [YYYY-MM-DD] Event: concise update, links to files`. Do not rewrite or delete prior entries. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- Implementation Checklist: Mark items as `[x]` when complete, `[~]` for partial with a short note. Add new items if discovered; avoid removing items—strike through only when obsolete.
- Key Decisions: Record important decisions as `- [YYYY-MM-DD] Decision: rationale, links`. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- References: Keep links current to latest spec, research, and tasks. Add additional references as they are created.
- Scope: Edits here should reflect coordination/progress only; do not include application code changes. Preserve history.

## Key Decisions
- [2026-01-20] Task created: Build a run review report generator + `revise-report` workflow grounded in `ralph-e2e` expectations to improve iteration quality across runs.
- [2026-01-20] Decision: Loop-wide preamble should be configurable via `config.json` (path-based).
- [2026-01-20] Decision: Role signatures are mandatory on every Beads comment.
- [2026-01-20] Decision: `working_branch` must never be `main` (fail-fast enforcement).
- [2026-01-20] Decision: Allow `run-report.md` in run folders (updated policy).

## Progress Log
- [2026-01-20] Event: Task created and seeded with initial references to the canonical `ralph-e2e` expectations + run artifact policies.
- [2026-01-20] Event: Draft plan created at `.devagent/workspace/tasks/active/2026-01-20_pr-epic-run-review-report-slash-command/plan/2026-01-20_pr-epic-run-review-report-plan.md`.
- [2026-01-20] Event: Phase 1 complete: updated `config.json`, `ralph.ts`, `ralph.sh`, and policy docs. Created `preamble.md`.
- [2026-01-20] Event: Phase 2 complete: implemented `run-review-report.md` workflow and slash command. Updated `setup-ralph-loop.md` and `expectations.md`.
- [2026-01-20] Event: Workflow fully implemented and verified against plan.

## Implementation Checklist
- [x] Create implementation plan
- [x] Define the review report format and where it should be published (Beads epic + PR description + run folder)
- [x] Design the slash command interface (inputs: PR reference, Beads epic id)
- [x] Create a `revise-report` workflow (`run-review-report.md`) that evaluates a run against `ralph-e2e` expectations
- [x] Specify how to gather evidence sources (PR metadata, Beads comments, run folder screenshots)
- [x] Add guidance for “next run improvements” output in the report
- [x] Enforce `working_branch` guardrails and per-task push behavior
- [x] Add PM/Coordinator setup task requirement to `setup-ralph-loop.md`

## Open Questions
- None.

## References
- `/.devagent/workspace/tests/ralph-e2e/expectations/expectations.md` — canonical per-stage evaluation rubric.
- `/.devagent/plugins/ralph/workflows/run-review-report.md` — new evaluation workflow.
- `/.agents/commands/run-review-report.md` — new slash command.
- `/.devagent/plugins/ralph/prompts/preamble.md` — new loop-wide agent preamble.
- `/.devagent/plugins/ralph/tools/config.json` — updated Ralph configuration.

## Next Steps
- Task complete.