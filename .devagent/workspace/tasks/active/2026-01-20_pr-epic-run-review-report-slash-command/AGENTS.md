# PR Epic Run Review Report Slash Command Progress Tracker

- Owner: Jake Ruesink
- Last Updated: 2026-01-20
- Status: Draft
- Task Hub: `.devagent/workspace/tasks/active/2026-01-20_pr-epic-run-review-report-slash-command/`

## Summary
Based on our Ralph E2E test flow expectations document, create a slash command that can generate a review report from **any PR + Beads epic run** and evaluate how well the run performed against the documented expectations. This should include creating a `revise-report` workflow that explicitly points to the expectations document as the evaluation rubric, and produces actionable insights about what we should change to improve the next run.

## Agent Update Instructions
- Always update "Last Updated" to today's date (ISO: YYYY-MM-DD) when editing this file. **Get the current date by explicitly running `date +%Y-%m-%d` first, then use the output for the "Last Updated" field.**
- Progress Log: Append a new entry at the end in the form `- [YYYY-MM-DD] Event: concise update, links to files`. Do not rewrite or delete prior entries. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- Implementation Checklist: Mark items as `[x]` when complete, `[~]` for partial with a short note. Add new items if discovered; avoid removing items—strike through only when obsolete.
- Key Decisions: Record important decisions as `- [YYYY-MM-DD] Decision: rationale, links`. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- References: Keep links current to latest spec, research, and tasks. Add additional references as they are created.
- Scope: Edits here should reflect coordination/progress only; do not include application code changes. Preserve history.

## Key Decisions
- [2026-01-20] Task created: Build a run review report generator + `revise-report` workflow grounded in `ralph-e2e` expectations to improve iteration quality across runs.

## Progress Log
- [2026-01-20] Event: Task created and seeded with initial references to the canonical `ralph-e2e` expectations + run artifact policies.
(Append new entries here, preserving historical entries to maintain a progress timeline.)

## Implementation Checklist
- [ ] Define the review report format and where it should be published (e.g., PR comment, Beads epic comment, both)
- [ ] Design the slash command interface (inputs: PR reference, Beads epic/run id, expectations version/commit)
- [ ] Create a `revise-report` workflow that evaluates a run against `ralph-e2e` expectations and outputs suggested expectation/workflow improvements
- [ ] Specify how to gather evidence sources (PR metadata, Beads comments, screenshots-only run folder pointers)
- [ ] Add guidance for “next run improvements” output (what to change in plan, expectations, agent handoffs, quality gates)

## Open Questions
- What is the canonical input for “PR” (GitHub PR URL/number, branch name, or commit SHA)?
- What is the canonical input for “epic run” (Beads epic id, run folder name, or both)?
- Where should the generated report live to match the “screenshots-only run folders” policy (likely Beads comments and/or PR comments)?
- Should the report also propose concrete edits to `expectations/expectations.md` (and `CHANGELOG.md`) when gaps are identified?

## References
- `/.devagent/workspace/tests/ralph-e2e/expectations/expectations.md` (freshness: 2026-01-20) — canonical per-stage evaluation rubric for runs + run header format.
- `/.devagent/workspace/tests/ralph-e2e/expectations/CHANGELOG.md` (freshness: 2026-01-20) — expectations versioning policy (CalVer) and change tracking.
- `/.devagent/workspace/tests/ralph-e2e/README.md` (freshness: 2026-01-20) — overview of the resettable loop + “source of truth” policy.
- `/.devagent/workspace/tests/ralph-e2e/runs/README.md` (freshness: 2026-01-20) — screenshots-only run artifact policy and run folder conventions.
- `/.devagent/workspace/tests/ralph-e2e/plan/README.md` (freshness: 2026-01-20) — canonical plan and rules for updating expectations alongside plan changes.
- `/.devagent/workspace/product/brainstorms/2026-01-10_ralph-integration-capabilities_FINAL.md` (freshness: 2026-01-20) — relevant notes on E2E automation + status/reporting integrations.
- `/.devagent/workspace/product/mission.md` (freshness: 2026-01-20) — DevAgent mission context for reusable workflows and quality expectations.

## Next Steps
- `devagent brainstorm` — explore report formats, data sources, and “revise-report” workflow outputs.
- `devagent clarify-task` — lock inputs/outputs, constraints, and publication targets (PR vs Beads).
- `devagent research` — review existing `ralph-e2e` loop artifacts and prior run review patterns.
- `devagent create-plan` — break work into executable steps and define acceptance criteria for the new command/workflow.
