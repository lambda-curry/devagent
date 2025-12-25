# PR Reviews

This directory contains structured review artifacts for pull requests reviewed using the `devagent review-pr` workflow.

## Structure

Reviews are stored with the naming pattern:
- `YYYY-MM-DD_pr-<number>-review.md`

Example: `2025-12-25_pr-123-review.md`

## Review Artifacts

Each review artifact includes:
- PR metadata (number, URL, author, date)
- Requirements validation against Linear issues (when present)
- Code quality assessment against project standards
- Identified gaps and issues
- Review summary and next steps
- Links to related feature hubs and Linear issues

## Workflow

Reviews are created by invoking:
```
devagent review-pr <pr-number>
```

or

```
devagent review-pr <pr-url>
```

See `.devagent/core/workflows/review-pr.md` for complete workflow documentation.
