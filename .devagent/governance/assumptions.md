# Assumption Audit Log

- **Purpose:** Track team-structure assumptions, delivery rituals, and validation expectations so they remain accurate for a single-developer default.
- **How to use:**
  - Log each assumption as a table row when discovered (source file, line, description, required change, status, owner, date).
  - Update status to `Cleared` once the language is neutral or the assumption is documented as an explicit opt-in.
  - Review this file every two months or when onboarding a new workflow to ensure guidance stays execution-focused.

| Date | Source | Assumption | Planned Fix | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| 2025-09-30 | .devagent/features/simple-vs-complex-feature-workflows/spec/2025-09-30_simple-vs-complex-feature-workflows.md | Added Governance section to require periodic audits | Maintain log going forward | Executing Developer | Cleared |
