# Reviews

This directory contains structured review artifacts for various review types including PR reviews and Ralph revise reports.

## Structure

### PR Reviews
Stored with the naming pattern:
- `YYYY-MM-DD_pr-<number>-review.md`

Example: `2025-12-25_pr-123-review.md`

### Ralph Revise Reports
Stored with the naming pattern:
- `YYYY-MM-DD_revise-report-session-<id>.md`

Example: `2026-01-10_revise-report-session-ralph-2026-01-10-A7B2.md`



## Review Artifacts

### PR Reviews
- PR metadata (number, URL, author, date)
- Requirements validation against Linear issues (when present)
- Code quality assessment against project standards
- Identified gaps and issues
- Review summary and next steps
- Links to related task hubs and Linear issues

### Ralph Revise Reports
- Session metadata and context
- Issues identified by category (Systems, Workflows, Documentation, Skills, Infrastructure)
- Executive summary with key metrics
- Actionable recommendations with priorities
- System improvement opportunities
- Follow-up requirements and integration points

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
devagent ralph-revise-report "session context description"
```

See `.devagent/core/workflows/review-pr.md` for PR review documentation.
See `.devagent/plugins/ralph/workflows/generate-revise-report.md` for revise report documentation.
