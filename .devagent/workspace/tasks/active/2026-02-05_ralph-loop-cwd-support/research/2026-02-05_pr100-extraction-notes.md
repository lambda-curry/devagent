# PR #100 Extraction Notes (Selective, No Merge)

## Context

PR #100 (`Setup wake hook E2E test loop`) is open, conflicting, and oversized for its title/scope. Goal is to extract helpful bits only.

## High-Value Candidates to Keep

1. **Loop hook verification patterns**
- Script pattern for validating hook payload keys end-to-end.
- Candidate source: `.devagent/plugins/ralph/tools/verify-on-iteration-e2e.sh` (requires path fix before reuse).

2. **Minimal wake-hook test fixture pattern**
- Marker file + verify script pattern for low-cost smoke validation.
- Candidate sources:
  - `.devagent/workspace/tests/wake-hook-test/marker.txt`
  - `.devagent/workspace/tests/wake-hook-test/verify.sh`

3. **Process learnings in revise report**
- Keep actionable learnings, especially around repeatable verification and avoiding mutation of shared files in tests.
- Candidate source: `.devagent/workspace/reviews/2026-02-03_devagent-wake-hook-test-improvements.md`

## Items to Avoid Carrying Over

- Massive cross-epic documentation payload not related to wake-hook/cwd objective.
- Local branch-specific config toggles in shared config files.
- Any change that broadens PR scope beyond loop-cwd and extraction objective.

## Extraction Strategy

1. Do **not** merge PR #100.
2. Create clean commits on a fresh branch for each retained idea.
3. Recreate or cherry-pick only the needed files; avoid mixed commits.
4. For each extracted item, add a short rationale in commit message/body.

## Initial Acceptance Criteria

- Extracted artifacts are self-contained and pass local verification.
- No unrelated task-hub/doc sweep included.
- Resulting PR title and changed files match actual scope.
