# Changelog — `ralph-e2e` expectations

This changelog tracks **meaningful changes** to the evaluation expectations for the resettable `ralph-e2e` loop.

## Versioning

- **Format:** CalVer (`vYYYY-MM-DD`)
- **Bump when:** evaluation meaning changes (new/removed gates, evidence requirements, changed “pass” criteria)
- **Do not bump when:** formatting/spelling-only edits

## v2026-01-18

- Initial canonical expectations document:
  - Established per-stage expectations (setup, execution, QA, post-run).
  - Defined run review mechanism: screenshots-only run folders + Beads epic comment header referencing expectations version (and recommended commit hash).

## v2026-01-19

- Updated evaluation meaning to require full multi-agent participation:
  - Added Stage 0 roles + collaboration/handoff contract (Coordinator, Design, Implementation, QA).
  - Strengthened Stage 1 to require role representation in the epic task breakdown.
  - Added Stage 5 PR-level “definition of done” and epic closure rule.

