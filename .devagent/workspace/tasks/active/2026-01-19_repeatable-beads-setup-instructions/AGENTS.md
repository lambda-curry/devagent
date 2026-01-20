# Document Repeatable Beads Setup Instructions [DERIVED] Progress Tracker

- Owner: Jake Ruesink
- Last Updated: 2026-01-19
- Status: Draft
- Task Hub: `.devagent/workspace/tasks/active/2026-01-19_repeatable-beads-setup-instructions/`

## Summary
To set this up with easy to replicate instructions for new setups.

This task will produce clear, copy/paste-friendly setup instructions for new environments so Beads can be configured cleanly and consistently (including options like keeping Beads state in a separate “sister” repo via `BEADS_DIR`, and/or using multi-repo routing/hydration where appropriate). The goal is a repeatable onboarding path that minimizes repo “noise” while keeping sync behavior reliable.

## Agent Update Instructions
- Always update "Last Updated" to today's date (ISO: YYYY-MM-DD) when editing this file. **Get the current date by explicitly running `date +%Y-%m-%d` first, then use the output for the "Last Updated" field.**
- Progress Log: Append a new entry at the end in the form `- [YYYY-MM-DD] Event: concise update, links to files`. Do not rewrite or delete prior entries. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- Implementation Checklist: Mark items as `[x]` when complete, `[~]` for partial with a short note. Add new items if discovered; avoid removing items—strike through only when obsolete.
- Key Decisions: Record important decisions as `- [YYYY-MM-DD] Decision: rationale, links`. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- References: Keep links current to latest spec, research, and tasks. Add additional references as they are created.
- Scope: Edits here should reflect coordination/progress only; do not include application code changes. Preserve history.

## Key Decisions
- [2026-01-19] Decision: Start by documenting existing Beads sync-branch + normal sync setups, then add “separate repo” (`BEADS_DIR`) and multi-repo routing/hydration variants for clean-code-repo workflows.

## Progress Log
- [2026-01-19] Event: Task hub scaffolded.
- [2026-01-19] Event: Added research packet on “separate repo” (`BEADS_DIR`) + multi-repo options, including what is (and is not yet) evidenced in `.devagent/**`: `.devagent/workspace/tasks/active/2026-01-19_repeatable-beads-setup-instructions/research/2026-01-19_beads-separate-repo-and-multi-repo-options.md`.
- [2026-01-19] Event: Add investigation note — consider a dedicated Beads setup for Ralph E2E runs (separate `BEADS_DIR` + E2E-specific `BEADS_DB`) to keep the main `.beads` database clean.

## Implementation Checklist
- [ ] Define target setup patterns to document (single-repo, sync-branch, separate repo via `BEADS_DIR`, multi-repo routing/hydration).
- [ ] Add E2E variant: isolate Ralph E2E runs using a dedicated Beads directory/repo (via `BEADS_DIR`) and point Ralph/monitoring DB reads to an E2E SQLite (`BEADS_DB` / `beads.database_path`).
- [ ] Draft step-by-step instructions with prerequisites and verification commands.
- [ ] Add troubleshooting/FAQ (common misconfigs, worktree notes, sync expectations).
- [ ] Validate instructions on a fresh clone/new machine and refine.

## Open Questions
- What is the desired output format/location for the “easy to replicate instructions” (task-local doc, core docs, or README additions)? [NEEDS CLARIFICATION]
- Should the default recommendation be “separate repo via `BEADS_DIR`” or “sync branch mode” for DevAgent-like projects? [NEEDS CLARIFICATION]

## References
- [2026-01-19] `.devagent/workspace/research/2026-01-14_beads-syncing-setup.md` — Existing DevAgent Beads syncing setup patterns and verification steps.
- [2026-01-19] `.devagent/workspace/research/2026-01-14_beads-sync-branch-setup.md` — Sync-branch mode architecture notes and daily workflow.
- [2026-01-19] `.devagent/workspace/research/2026-01-14_beads-setup-audit.md` — Audit notes; highlights common setup mismatches and verification gaps.
- [2026-01-19] `.devagent/workspace/research/2026-01-14_beads-best-practices-compliance.md` — Best-practices checklist and re-init guidance for reliable sync.

## Next Steps
- `devagent research` (focus: “separate beads repo via BEADS_DIR”, “multi-repo routing/hydration”, “recommended default for new setups”, verification + troubleshooting)
- `devagent create-plan` (turn research into a concrete doc plan + acceptance checklist)
