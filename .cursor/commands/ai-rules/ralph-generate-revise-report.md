# Generate Revise Report

## Mission
Generate a comprehensive improvement report for a Beads Epic, aggregating traceability data, revision learnings, and screenshots from child tasks. The report focuses on actionable improvements across Documentation, Process, Rules & Standards, and Tech Architecture.

## Inputs
- Required: Epic ID (e.g., `bd-1a2b`)
- Optional: Output directory (default: `.devagent/workspace/reviews/`)

**Usage:** Follow `.devagent/plugins/ralph/workflows/generate-revise-report.md` step-by-step.

## Output
- Report file: `YYYY-MM-DD_<epic-id>-improvements.md` in `.devagent/workspace/reviews/`
- Includes: Executive summary, traceability matrix, evidence & screenshots, improvement recommendations by category, prioritized action items
