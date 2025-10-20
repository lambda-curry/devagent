# Review Progress

## Mission
- Primary goal: Capture task progress state and identify remaining work so developers can efficiently resume after context loss (overnight, context switches, or interruptions).
- Boundaries / non-goals: Do not implement code, update specs, or create new task plans; avoid estimating completion times or committing to delivery dates; never modify the original artifact.
- Success signals: Progress checkpoints clearly identify completed work, active items, blockers, and immediate next steps; developers can resume work within minutes without re-reading full artifacts.

## Execution Directive
When invoked with `devagent review-progress` and required inputs, **EXECUTE IMMEDIATELY**. Do not summarize, describe, or request approval—perform the work using available tools. The executing developer has standing approval to trigger progress reviews; note any exceptional findings in the response rather than blocking the run. Only pause for missing REQUIRED inputs or blocking errors.

## Inputs
- Required: Work artifact (task prompt, spec, plan, or freeform description—either as file path or inline content), current progress state (what's completed, what's in progress, what's blocked).
- Optional: Code file references, related PRs or commits, known issues or questions, target resume date.
- Request missing info with a simple checklist (e.g., "What have you completed so far?" or "Are there any blockers?"); if core progress state is missing, infer from available context and note assumptions.

## Resource Strategy
- `.devagent/workspace/features/YYYY-MM-DD_feature-slug/progress/` — storage for feature-related progress checkpoints (format: `YYYY-MM-DD_checkpoint.md`).
- `.devagent/workspace/progress/` — storage for general work progress checkpoints not tied to a specific feature (format: `YYYY-MM-DD_<descriptor>.md`).
- Original artifacts (specs, task prompts, plans) — read-only references; never modify.
- Code repositories — optional scan to verify completion claims or identify partially implemented features.
- Git history — optional review of recent commits to confirm progress state.

## Workflow
1. **Kickoff / readiness checks:** Confirm artifact type (task/spec/plan/freeform), scope, and developer's current progress assessment.
2. **Context gathering:** Read the original artifact (or accept inline content), review any provided code references, and note the developer's stated progress.
3. **Progress analysis:** 
   - Extract original goals/requirements from artifact
   - Map completed work against those requirements
   - Identify in-progress items with current status
   - Flag blockers or open questions
   - Determine immediate next steps (1-3 actionable items)
4. **Synthesize checkpoint:** Create a dated progress checkpoint document with:
   - Reference to original artifact
   - Completed work summary
   - In-progress items with status
   - Blockers and open questions
   - Remaining work breakdown
   - Immediate next steps (prioritized)
5. **Output packaging:** Save checkpoint file in appropriate location (feature progress folder or general progress folder) and return chat response with succinct summary.
6. **Post-run cleanup:** Ensure checkpoint is linked in chat response so developer can quickly reference it when resuming.

## Storage Patterns
- **Feature work:** Save to `.devagent/workspace/features/YYYY-MM-DD_feature-slug/progress/YYYY-MM-DD_checkpoint.md`
- **General work:** Save to `.devagent/workspace/progress/YYYY-MM-DD_<descriptor>.md`
- **Checkpoint naming:** Use current date and optional descriptor (e.g., `2025-10-20_auth-implementation.md`)
- **Directory creation:** Create progress directories as needed; they may not exist initially.

## Checkpoint Document Structure
```markdown
# Progress Checkpoint: [Task/Feature Name]
**Date:** YYYY-MM-DD
**Artifact:** [Link or reference to original task/spec/plan]

## Summary
[1-2 sentence overview of current state]

## Completed
- [Completed item 1]
- [Completed item 2]

## In Progress
- [Active item 1] — [brief status note]
- [Active item 2] — [brief status note]

## Blockers
- [Blocker 1] — [impact note]
- [Blocker 2] — [impact note]

## Remaining Work
- [Remaining item 1]
- [Remaining item 2]
- [Remaining item 3]

## Next Steps (Prioritized)
1. [Immediate next action]
2. [Second priority]
3. [Third priority]

## Notes
[Any additional context, assumptions, or questions]
```

## Adaptation Notes
- Keep checkpoints concise—aim for developers to read and act within 2-3 minutes.
- Prioritize actionable next steps over exhaustive status reports.
- When progress is ambiguous, ask clarifying questions rather than guessing.
- For large artifacts with many requirements, group related items to maintain readability.

## Failure & Escalation
- Missing artifact or progress state — pause and request the minimum required information before proceeding.
- Conflicting progress reports (e.g., code shows incomplete but developer claims complete) — note the discrepancy in the checkpoint and flag for review.
- Unable to determine appropriate storage location — default to `.devagent/workspace/progress/` with clear naming.

## Expected Output
- **Checkpoint file:** Markdown document saved in feature progress directory or general progress directory with dated filename.
- **Chat response:** Succinct summary including:
  - Brief completed work recap
  - Remaining work bullets (3-5 key items)
  - Blockers (if any)
  - Immediate next step (single most important action)
  - Link to saved checkpoint file

## Follow-up Hooks
- No downstream workflows required; this is a terminal checkpoint for context preservation.
- Developers may reference checkpoints when resuming work or invoking `devagent create-task-prompt` for remaining work.
- Multiple checkpoints can accumulate over time; consider periodic cleanup of outdated progress files.

