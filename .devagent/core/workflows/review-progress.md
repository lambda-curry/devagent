# Review Progress

## Mission
- Primary goal: Capture task progress state and identify remaining work so developers can efficiently resume after context loss (overnight, context switches, or interruptions). Update AGENTS.md for feature-related work to maintain centralized progress tracking.
- Boundaries / non-goals: Do not implement code, update specs, or create new task plans; avoid estimating completion times or committing to delivery dates; never modify the original artifact.
- Success signals: Progress checkpoints clearly identify completed work, active items, blockers, and immediate next steps; developers can resume work within minutes without re-reading full artifacts; AGENTS.md is updated with current status for feature continuity.

## Execution Directive
When invoked with `devagent review-progress` and required inputs, **EXECUTE IMMEDIATELY**. Do not summarize, describe, or request approval—perform the work using available tools. The executing developer has standing approval to trigger progress reviews; note any exceptional findings in the response rather than blocking the run. Only pause for missing REQUIRED inputs or blocking errors.

## Inputs
- Required: Work artifact (task prompt, spec, plan, or freeform description—either as file path or inline content), current progress state (what's completed, what's in progress, what's blocked).
- Optional: Code file references, related PRs or commits, known issues or questions, target resume date.
- Request missing info with a simple checklist (e.g., "What have you completed so far?" or "Are there any blockers?"); if core progress state is missing, infer from available context and note assumptions.

## Resource Strategy
- `.devagent/workspace/features/{status}/YYYY-MM-DD_feature-slug/progress/` — storage for feature-related progress checkpoints (format: `YYYY-MM-DD_checkpoint.md`).
- `.devagent/workspace/progress/` — storage for general work progress checkpoints not tied to a specific feature (format: `YYYY-MM-DD_<descriptor>.md`).
- `.devagent/workspace/features/{status}/YYYY-MM-DD_feature-slug/AGENTS.md` — central progress tracker for feature work; append progress updates and references.
- Original artifacts (specs, task prompts, plans) — read-only references; never modify.
- Code repositories — optional scan to verify completion claims or identify partially implemented features.
- Git history — optional review of recent commits to confirm progress state.

## Workflow
1. **Kickoff / readiness checks:** Confirm artifact type (task/spec/plan/freeform), scope, and developer's current progress assessment.
2. **Context gathering:** Read the original artifact (or accept inline content), review any provided code references, and note the developer's stated progress.
3. **Code verification:** Scan relevant codebase areas to verify claimed progress and identify implemented features:
   - Search for code implementation matching task requirements
   - Examine git history for commits related to the feature/work
   - Check file contents for expected code structures, functions, or configurations
   - Compare claimed completions against actual code presence
   - Identify any code-level blockers or incomplete implementations
4. **Progress analysis:**
   - Extract original goals/requirements from artifact
   - Map completed work against those requirements (verified via code inspection)
   - Identify in-progress items with current status
   - Flag blockers or open questions (including code-level issues)
   - Determine immediate next steps (1-3 actionable items)
5. **Synthesize checkpoint:** Create a dated progress checkpoint document with:
   - Reference to original artifact
   - Completed work summary
   - In-progress items with status
   - Blockers and open questions
   - Remaining work breakdown
   - Immediate next steps (prioritized)
6. **Update AGENTS.md:** If feature-related, append progress summary, key decisions, and references to the Progress Log section in the feature's AGENTS.md file. Include link to the checkpoint document.
7. **Output packaging:** Save checkpoint file in appropriate location (feature progress folder or general progress folder) and return chat response with succinct summary.
8. **Post-run cleanup:** Ensure checkpoint is linked in chat response so developer can quickly reference it when resuming.

## Storage Patterns
- **Feature work:** Save to `.devagent/workspace/features/{status}/YYYY-MM-DD_feature-slug/progress/YYYY-MM-DD_checkpoint.md`; update `.devagent/workspace/features/{status}/YYYY-MM-DD_feature-slug/AGENTS.md` with progress log entry
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

## Code Verification Techniques
When scanning codebase for implementation evidence, use these techniques:

- **Pattern Matching:** Search for specific function names, component names, or API endpoints mentioned in tasks
- **Structure Checks:** Verify expected file/directory structures exist (e.g., new routes, database tables, config files)
- **Integration Points:** Check for imports, dependencies, or connections between components
- **Test Coverage:** Look for corresponding test files when implementation claims are made
- **Configuration Changes:** Verify config files, environment variables, or build settings match requirements
- **Git Evidence:** Review recent commits for implementation work vs. planning/documentation only

## Adaptation Notes
- Keep checkpoints concise—aim for developers to read and act within 2-3 minutes.
- Prioritize actionable next steps over exhaustive status reports.
- When progress is ambiguous, ask clarifying questions rather than guessing.
- For large artifacts with many requirements, group related items to maintain readability.
- When code verification contradicts claimed progress, note the discrepancy and investigate further.

## Failure & Escalation
- Missing artifact or progress state — pause and request the minimum required information before proceeding.
- Conflicting progress reports (e.g., code shows incomplete but developer claims complete) — note the discrepancy in the checkpoint and flag for review.
- Unable to determine appropriate storage location — default to `.devagent/workspace/progress/` with clear naming.

## Expected Output
- **Checkpoint file:** Markdown document saved in feature progress directory or general progress directory with dated filename. Include code verification findings and evidence of implementation.
- **AGENTS.md update:** For feature work, appended progress entry in AGENTS.md Progress Log section. Note any discrepancies between claimed progress and code evidence.
- **Chat response:** Succinct summary including:
  - Brief completed work recap (verified via code inspection)
  - Remaining work bullets (3-5 key items)
  - Blockers (if any, including code-level issues)
  - Immediate next step (single most important action)
  - Link to saved checkpoint file

## Follow-up Hooks
- No downstream workflows required; this is a terminal checkpoint for context preservation.
- Developers may reference checkpoints or AGENTS.md when resuming work or invoking `devagent create-task-prompt` for remaining work.
- AGENTS.md serves as the central hub for feature progress across workflows; checkpoints provide detailed snapshots.
- Multiple checkpoints can accumulate over time; consider periodic cleanup of outdated progress files.
