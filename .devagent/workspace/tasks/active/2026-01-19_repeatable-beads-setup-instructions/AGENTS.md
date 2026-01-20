# Document Repeatable Beads Setup Instructions [DERIVED] Progress Tracker

- Owner: Jake Ruesink
- Last Updated: 2026-01-20
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
- [2026-01-20] Event: Completed first clarification pass for “low-noise Beads sync” (target: `.beads/` as submodule; bundled-only pointer bumps; hooks/setup needed): `.devagent/workspace/tasks/active/2026-01-19_repeatable-beads-setup-instructions/clarification/2026-01-20_initial-clarification.md`.
- [2026-01-20] Event: Added updated research packet reflecting clarified submodule target + decision tree and unresolved validations: `.devagent/workspace/tasks/active/2026-01-19_repeatable-beads-setup-instructions/research/2026-01-20_low-noise-beads-submodule-setup-research.md`.
- [2026-01-20] Event: Drafted plan document for low-noise Beads setup instructions: `.devagent/workspace/tasks/active/2026-01-19_repeatable-beads-setup-instructions/plan/2026-01-20_repeatable-beads-setup-instructions-plan.md`.
- [2026-01-20] Event: Task 1 completed: created `.devagent/core/docs/beads-setup.md` draft and linked from `.devagent/core/README.md`.
- [2026-01-20] Event: Task 2 completed: added evidence-tagged decision tree and recommended defaults to `.devagent/core/docs/beads-setup.md`.
- [2026-01-20] Event: Task 3 completed: recorded submodule validation results in `.devagent/workspace/tasks/active/2026-01-19_repeatable-beads-setup-instructions/research/2026-01-20_beads-submodule-validation.md` and updated core doc notes.
- [2026-01-20] Event: Task 4 completed: documented drift mitigation, hook strategy, and fresh-clone setup steps in `.devagent/core/docs/beads-setup.md`.
- [2026-01-20] Event: Task 5 completed: added troubleshooting + verification checklist and recorded fresh-clone validation in `.devagent/workspace/tasks/active/2026-01-19_repeatable-beads-setup-instructions/research/2026-01-20_fresh-clone-validation.md`.
- [2026-01-20] Event: Ran `bd doctor` and attempted `bd doctor --fix` + hook refresh; fixes blocked by `.git/` write permissions in this environment. Updated `.devagent/core/docs/beads-setup.md` with doctor/health check guidance and hook refresh notes.

## Implementation Checklist
- [x] Create plan document for low-noise Beads setup instructions (task-local plan).
- [x] Task 1: Define core doc location + outline portable Beads setup guide (`.devagent/core/docs/beads-setup.md`) and link from core README.
- [x] Task 2: Document decision tree and recommended defaults with evidence labels.
- [x] Task 3: Validate submodule feasibility and record results.
- [x] Task 4: Define drift-mitigation + hook strategy across repo boundaries.
- [x] Task 5: Add troubleshooting + verification checklist and run fresh-clone validation.
- [x] Define target setup patterns to document (single-repo, sync-branch, separate repo via `BEADS_DIR`, multi-repo routing/hydration).
- [ ] Add E2E variant: isolate Ralph E2E runs using a dedicated Beads directory/repo (via `BEADS_DIR`) and point Ralph/monitoring DB reads to an E2E SQLite (`BEADS_DB` / `beads.database_path`).
- [~] Draft step-by-step instructions with prerequisites and verification commands. (Partial: core setup + fresh-clone steps added; per-mode walkthroughs still light.)
- [x] Add troubleshooting/FAQ (common misconfigs, worktree notes, sync expectations).
- [x] Validate instructions on a fresh clone/new machine and refine.
- [~] Run `bd doctor --fix` + hook refresh in a fully-permissioned environment to clear sync-branch drift + git index flags. (Blocked by `.git/` write permissions here; requires local run.)

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
