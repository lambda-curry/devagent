# Research: Beads Status Terminology Alignment (Ralph)

**Date:** 2026-01-18  
**Task Hub:** `.devagent/workspace/tasks/completed/2026-01-18_handling-sub-issues-in-ralph-loop/`  

## Classification & Assumptions
- **Classification:** Terminology audit (internal alignment for Beads status values + user-facing wording in prompts/comments).
- **Problem statement (derived):** Confirm the canonical Beads status values and the correct language Ralph should use (e.g. “closed” vs “done”) so prompts and completion comments are traceable and consistent.

## Research Plan (what was validated)
- Identify canonical status values used by Ralph’s Beads integration docs and tooling.
- Confirm how `bd update --status ...` is used in existing Ralph tooling and instructions.
- Define a “machine vs human wording” rule so prompts stay simple but accurate.

## Sources (internal)
- `.devagent/plugins/ralph/AGENTS.md` (freshness: 2026-01-18)
  - Explicitly: Beads uses `open`/`closed` (not `todo`/`done`) and also `in_progress`, `blocked`.
- `.devagent/plugins/ralph/skills/beads-integration/SKILL.md` (freshness: 2026-01-18)
  - Examples: `bd update <task-id> --status closed`, `open`, and guidance that `ready` is not settable (use `open`).
- `.devagent/plugins/ralph/tools/ralph.ts` (freshness: 2026-01-18)
  - Uses status strings `"open" | "in_progress" | "blocked" | "closed"` in logic and instructs `bd update ... --status closed`.
- `.devagent/plugins/ralph/tools/import-beads.cjs` (freshness: 2026-01-18)
  - Maps `ready`/`todo` → `open`.

## Findings & Tradeoffs
### Canonical status values in our Ralph + Beads integration
Across Ralph’s integration docs and tools, the canonical status tokens are consistently:
- `open`
- `in_progress`
- `blocked`
- `closed`

And we explicitly warn **not** to use:
- `todo`
- `done`
- `ready` (as a settable status)

### Machine tokens vs human phrasing (to keep prompts simple)
- The CLI/API token should remain lowercase (`--status closed`).
- In prose (prompt instructions / completion comments), the simplest consistent phrasing is:
  - “mark as **closed**” (or “set status to **closed**”)

**Tradeoff:** Some UIs may display “Closed” with capitalization; we should avoid mixing UI presentation text with CLI tokens inside instructions. Prefer showing the token exactly as expected by `bd`.

## Recommendation
### Adopt a single terminology rule
- **When telling the agent what to run:** always use exact tokens in code blocks and commands:
  - `bd update <id> --status closed`
- **When describing state in plain language:** say “closed” (not “done”) and avoid introducing synonyms.

### Update completion-comment guidance (for this task)
When prompting Ralph to leave the completion comment on a sub-issue, include a short, C6-friendly suggested structure:
- Summary
- Struggles (useful input for revise reports / improvements)
- Verification

## Repo Next Steps (checklist)
- [ ] In any new/updated prompt text: use “closed” (not “done”), and show the exact `bd update ... --status closed` command where relevant.
- [ ] If any existing prompts/docs say “done/todo/ready” in a Beads-status context, align them to `closed/open`.

## Risks & Open Questions
- **External canonical source:** This audit is internal-to-repo. If we want a primary source check, verify against Beads docs/CLI help output (out of scope for this note).
