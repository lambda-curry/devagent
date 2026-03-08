# Ralph Loop CWD Support Progress Tracker

- Owner: Jake Ruesink
- Last Updated: 2026-02-05
- Status: Active
- Task Hub: `.devagent/workspace/tasks/active/2026-02-05_ralph-loop-cwd-support/`

## Summary

Support running Ralph loops from an explicit target repository directory, even when the orchestration command is started from another directory. In parallel, preserve useful ideas from PR #100 by extracting only high-value artifacts into clean, scoped changes.

## Problem Statement

Current loop tooling assumes the process runs inside the target git repository. That assumption blocks use cases where DevAgent is invoked from one workspace while executing loops in another repository. Separately, PR #100 mixes useful material with unrelated large-scope changes, so merge is undesirable.

## Objectives

1. Add an explicit cwd/repo-root mechanism for Ralph loop execution.
2. Ensure git/beads/log path behaviors are correct in the target repository context.
3. Extract useful PR #100 artifacts without inheriting unrelated scope.

## Agent Update Instructions

- Always update "Last Updated" using ISO date.
- Progress Log: append entries; do not rewrite history.
- Implementation Checklist: mark `[x]` for complete, `[~]` for partial.
- Key Decisions: add dated decisions with rationale.

## Key Decisions

- [2026-02-05] Decision: Treat this as a new active task hub focused on loop `cwd` support plus selective PR #100 extraction (no direct merge).

## Progress Log

- [2026-02-05] Initiated: Task hub created with research + plan stubs for loop cwd support and PR #100 extraction strategy.

## Implementation Checklist

- [ ] Define API for target working directory (`--cwd`, run file field, or both).
- [ ] Update loop startup flow to resolve repo root from target cwd.
- [ ] Validate branch and Beads DB behaviors with target cwd.
- [ ] Add/adjust tests for cross-directory execution behavior.
- [ ] Extract useful PR #100 pieces in isolated commits/PR(s).

## Open Questions

- Should CLI override config (`--cwd` > run file), and what is the final precedence order?
- Should hooks receive both `repoRoot` and `processCwd` in payloads for observability?
- Which PR #100 artifacts are worth keeping versus recreating cleanly?

## References

- PR under review: `https://github.com/lambda-curry/devagent/pull/100`
- Ralph runner: `.devagent/plugins/ralph/tools/ralph.sh`
- Ralph router: `.devagent/plugins/ralph/tools/ralph.ts`
- Current e2e hook verifier: `.devagent/plugins/ralph/tools/verify-on-iteration-e2e.sh`
