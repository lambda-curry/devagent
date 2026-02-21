# Ralph Loop CWD Support

- **Status:** active
- **Owners:** Jake Ruesink
- **Summary:** Add explicit support for running Ralph loops against a target repository directory (different from the DevAgent repo cwd), and extract only the useful artifacts from PR #100 without merging the full mixed-scope PR.
- **Related missions:** Reliable autonomous loop execution, safer PR scoping
- **Latest plan:** plan/2026-02-05_ralph-loop-cwd-support-plan.md
- **Latest research:** research/2026-02-05_pr100-extraction-notes.md

## Changelog

| Date | Update | Agent/Owner |
|------|--------|-------------|
| 2026-02-05 | Created task hub | Codex |

## Open Decisions

- Should run config use `run.execution.cwd`, a CLI flag `--cwd`, or both?
- Should branch and Beads validations always run in the target cwd when provided?
- Should relative paths in run/config files resolve from the target cwd or the current process cwd?

## Research Artifacts

- Store discovery packets in `research/` using ISO date prefixes and concise suffixes.

## Plan Artifacts

- Publish implementation plans in `plan/` with matching ISO date prefixes.
