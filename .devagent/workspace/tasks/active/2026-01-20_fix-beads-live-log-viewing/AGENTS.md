# Fix Beads Live Log Viewing Progress Tracker

- Owner: Jake Ruesink
- Last Updated: 2026-01-20
- Status: Draft
- Task Hub: `.devagent/workspace/tasks/active/2026-01-20_fix-beads-live-log-viewing/`

## Summary
Beads live log viewing when viewing a task isn’t working (it consistently shows “can’t find the log files”), and it’s unclear if it ever worked reliably. The goal is to make **live logs available while a task is actively running** so we can see what the agent is doing; if a task is not active, it’s acceptable to hide logs or show a clear “no live logs” state instead of an error.

## Agent Update Instructions
- Always update "Last Updated" to today's date (ISO: YYYY-MM-DD) when editing this file. **Get the current date by explicitly running `date +%Y-%m-%d` first, then use the output for the "Last Updated" field.**
- Progress Log: Append a new entry at the end in the form `- [YYYY-MM-DD] Event: concise update, links to files`. Do not rewrite or delete prior entries. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- Implementation Checklist: Mark items as `[x]` when complete, `[~]` for partial with a short note. Add new items if discovered; avoid removing items—strike through only when obsolete.
- Key Decisions: Record important decisions as `- [YYYY-MM-DD] Decision: rationale, links`. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- References: Keep links current to latest spec, research, and tasks. Add additional references as they are created.
- Scope: Edits here should reflect coordination/progress only; do not include application code changes. Preserve history.

## Key Decisions
- [2026-01-20] Task created: Focus on reliable live log viewing for active tasks; avoid noisy errors for inactive tasks.

## Progress Log
- [2026-01-20] Research complete: Created research packet and identified likely causes (branch/environment mismatch vs logs not being written where the viewer expects). See `.devagent/workspace/research/2026-01-20_beads-live-log-viewing-file-not-found.md`.
- [2026-01-20] Plan created: Drafted an execution-focused plan under `plan/2026-01-20_beads-live-log-viewing-plan.md`.
(Append new entries here, preserving historical entries to maintain a progress timeline.)

## Implementation Checklist
- [ ] Implement server-side diagnostics + hardening for log stream “not found” cases (include expected path/config hints without leaking secrets)
- [ ] Implement UI gating for active vs inactive tasks + “waiting for logs” UX for active tasks
- [ ] Verify log producer path + task-id sanitization contract matches log viewer expectations; fix mismatches
- [ ] Add/repair regression tests for log streaming behaviors

## Open Questions
- What is the canonical definition of “active” (Beads status? agent runtime state? both)?
- Where should logs be written in each environment (local, CI, prod), and which environment variables are canonical (`RALPH_LOG_DIR`, `REPO_ROOT`)?
- Is the current behavior due to missing fix commits, misconfiguration, missing log creation, or regression?

## References
- Plan: `plan/2026-01-20_beads-live-log-viewing-plan.md`
- Research: `.devagent/workspace/research/2026-01-20_beads-live-log-viewing-file-not-found.md`
- Related prior work: `.devagent/workspace/tasks/active/2026-01-17_fix-comments-visibility-and-realtime-log-view/`
