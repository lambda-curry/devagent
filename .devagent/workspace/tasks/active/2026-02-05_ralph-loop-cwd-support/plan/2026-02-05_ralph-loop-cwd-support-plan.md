# Ralph Loop CWD Support - Implementation Plan

- Owner: Jake Ruesink
- Last Updated: 2026-02-05
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/active/2026-02-05_ralph-loop-cwd-support/`

## Summary

Add first-class support for running Ralph loops against a target repository directory while invoking the tool from a different cwd. Then extract only useful PR #100 artifacts into clean, reviewable commits.

## Objectives

1. Support explicit target cwd/repo-root for loop execution.
2. Preserve existing behavior when cwd is not provided.
3. Keep extraction from PR #100 selective and scope-safe.

## Implementation Tasks

### Task 1: Design cwd control contract

- Decide and document config/CLI contract:
  - Option A: `--cwd <path>`
  - Option B: run-file field (e.g. `run.execution.cwd`)
  - Option C: both with clear precedence
- Acceptance criteria:
  - Contract documented in this plan + tracker.
  - Backwards compatibility defined.

### Task 2: Implement target-cwd execution path

- Update loop startup in `.devagent/plugins/ralph/tools/ralph.sh` (and router integration as needed) so git/beads/log resolution uses target cwd when configured.
- Acceptance criteria:
  - `git rev-parse`, branch checks, and repo-root dependent paths work in target cwd.
  - Existing invocation without cwd behaves unchanged.

### Task 3: Validate and test

- Add or update tests/scripts for cross-directory behavior.
- Include one practical verification command showing loop execution from non-target cwd.
- Acceptance criteria:
  - Verification command is reproducible.
  - Failure mode is clear when cwd is invalid/non-git.

### Task 4: Extract useful PR #100 bits

- Apply selective extraction strategy from research doc.
- Fix known script fragility during extraction (repo-root resolution assumptions).
- Acceptance criteria:
  - Extracted changes are narrow and independently reviewable.
  - No unrelated bulk docs/task artifacts included.

## Risks

- Path resolution regressions for existing single-repo flows.
- Hidden assumptions in helper scripts that still rely on current process cwd.
- Accidental scope creep while extracting from mixed PR.

## Validation Checklist

- [ ] Run targeted loop command with explicit cwd.
- [ ] Confirm branch and epic checks execute in target repository.
- [ ] Confirm logs and artifact paths are deterministic.
- [ ] Confirm extraction PR diff matches title/scope.
