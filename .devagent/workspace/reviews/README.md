# Reviews

This directory contains structured review artifacts for various review types including PR reviews and Ralph revise reports.

## Structure

### PR Reviews
Stored with the naming pattern:
- `YYYY-MM-DD_pr-<number>-review.md`

Example: `2025-12-25_pr-123-review.md`

### Ralph Revise Reports (Improvement Reports)
Stored with the naming pattern:
- `YYYY-MM-DD_<epic-id>-improvements.md` (preferred, improvement-focused)
- `YYYY-MM-DD_revise-report-epic-<epic-id>.md` (legacy naming)

Examples:
- `2026-01-10_bd-ad57-improvements.md`
- `2026-01-10_revise-report-epic-bd-ad57.md` (legacy)

**Screenshot Organization:**
- Epic-level screenshots: `.devagent/workspace/reviews/<epic-id>/screenshots/`
- Task-specific screenshots: `.devagent/workspace/reviews/<epic-id>/<task-id>/screenshots/`



## Review Artifacts

### PR Reviews
- PR metadata (number, URL, author, date)
- Requirements validation against Linear issues (when present)
- Code quality assessment against project standards
- Identified gaps and issues
- Review summary and next steps
- Links to related task hubs and Linear issues

### Ralph Revise Reports (Improvement Reports)
- Epic metadata and traceability matrix
- Evidence & screenshots directory references
- Improvement recommendations by category:
  - **Documentation:** Missing docs, outdated content, onboarding gaps
  - **Process:** Workflow friction, automation opportunities, quality gate improvements
  - **Rules & Standards:** Cursor rules updates, coding standards violations, pattern inconsistencies
  - **Tech Architecture:** Code structure issues, dependency concerns, technical debt, performance
- Prioritized action items (Critical, High, Medium, Low)
- Executive summary with key metrics

## Workflows

### PR Reviews
```
devagent review-pr <pr-number>
```

or

```
devagent review-pr <pr-url>
```

### Ralph Revise Reports
```
devagent ralph-revise-report <epic-id>
```

**Recent Reports:**
- [2026-01-17_devagent-a8fa-improvements.md](2026-01-17_devagent-a8fa-improvements.md) - Implement Bun-based label-driven task routing for Ralph Plan
- [2026-01-15_devagent-4a61-improvements.md](2026-01-15_devagent-4a61-improvements.md) - Test Database Seed Data Setup
- [2026-01-15_devagent-a217-improvements.md](2026-01-15_devagent-a217-improvements.md) - Adopt Reportory Cursor Rules & Best Practices
- [2026-01-14_devagent-157f-improvements.md](2026-01-14_devagent-157f-improvements.md) - Ralph-Monitoring UI Enhancements
- [2026-01-14_devagent-a884-improvements.md](2026-01-14_devagent-a884-improvements.md) - Ralph Monitoring UI MVP

See `.devagent/core/workflows/review-pr.md` for PR review documentation.
See `.devagent/plugins/ralph/workflows/generate-revise-report.md` for revise report documentation.
