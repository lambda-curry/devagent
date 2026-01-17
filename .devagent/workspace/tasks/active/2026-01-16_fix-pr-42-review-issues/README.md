# Fix PR #42 Review Issues

- **Status:** Active
- **Owner:** Jake Ruesink
- **Created:** 2026-01-16
- **Related PR:** https://github.com/lambda-curry/devagent/pull/42
- **Related Review:** `.devagent/workspace/reviews/2026-01-16_pr-42-review.md`

## Overview

This task addresses all actionable code review feedback from CodeRabbit for PR #42 (Test Database Seed Data Setup epic). The review identified 9 actionable issues (3 critical, 2 major, 4 minor) that should be addressed before merge.

## Issues to Fix

### Critical (3)
1. WAL mode pragma on readonly database connection (`apps/ralph-monitoring/app/db/beads.server.ts:59`)
2. `devagent-46a9` should be `issue_type: "epic"` not `"task"` (`.beads/issues.jsonl:9`)
3. `devagent-4a61` should be `issue_type: "epic"` not `"task"` (`.beads/issues.jsonl:14`)

### Major (2)
4. PID files committed to version control (`logs/ralph/devagent-*.pid`)
5. Incorrect documentation path (`.devagent/plugins/ralph/tools/.ralph_last_output.txt:19`)

### Minor (4)
6. Status should be "closed" not "open" (`.devagent/workspace/reviews/2026-01-15_devagent-4a61-improvements.md:5`)
7. Misleading test name (`apps/ralph-monitoring/app/db/__tests__/beads.server.test.ts:95`)
8. Test error assertion (`apps/ralph-monitoring/app/db/__tests__/seed-data.test.ts:97`)
9. Test isolation issue (`apps/ralph-monitoring/app/db/__tests__/beads.server.test.ts:329-343`)

## Plan

See `plan/2026-01-16_fix-pr-42-review-issues-plan.md` for detailed implementation plan.

## Progress

Track progress in `AGENTS.md`.
