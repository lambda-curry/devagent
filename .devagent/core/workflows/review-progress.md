# Review Progress

## Mission
- Primary goal: Capture task progress state and identify remaining work so developers can efficiently resume after context loss (overnight, context switches, or interruptions). Update AGENTS.md for task-related work to maintain centralized progress tracking.
- Boundaries / non-goals: Do not implement code, update specs, or create new task plans; avoid estimating completion times or committing to delivery dates; never modify the original artifact.
- Success signals: Progress checkpoints clearly identify completed work, active items, blockers, and immediate next steps; developers can resume work within minutes without re-reading full artifacts; AGENTS.md is updated with current status for task continuity.

## Standard Instructions Reference
Before executing this workflow, review standard instructions in `.devagent/core/AGENTS.md` → Standard Workflow Instructions for:
- Date handling
- Metadata retrieval
- Context gathering order
- Standard guardrails
- Storage patterns

## Execution Directive
Follow standard execution directive in `.devagent/core/AGENTS.md` → Standard Workflow Instructions.

## Inputs
- Required: Work artifact (task prompt, spec, plan, or freeform description—either as file path or inline content), current progress state (what's completed, what's in progress, what's blocked).
- Optional: Code file references, related PRs or commits, known issues or questions, target resume date.
- Request missing info with a simple checklist (e.g., "What have you completed so far?" or "Are there any blockers?"); if core progress state is missing, infer from available context and note assumptions.

## Resource Strategy
- `.devagent/workspace/tasks/{status}/YYYY-MM-DD_task-slug/progress/` — storage for task-related progress checkpoints (format: `YYYY-MM-DD_checkpoint.md`).
- `.devagent/workspace/progress/` — storage for general work progress checkpoints not tied to a specific task (format: `YYYY-MM-DD_<descriptor>.md`).
- `.devagent/workspace/tasks/{status}/YYYY-MM-DD_task-slug/AGENTS.md` — central progress tracker for task work; append progress updates and references.
- **Date retrieval:** Review Standard Workflow Instructions in `.devagent/core/AGENTS.md` for date handling.
- Original artifacts (task prompts, plans) — read-only references; never modify.
- Code repositories — optional scan to verify completion claims or identify partially implemented work.
- Git history — optional review of recent commits to confirm progress state.

## Workflow
1. **Kickoff / readiness checks:** Confirm artifact type (task/plan/freeform), scope, and developer's current progress assessment.
2. **Context gathering:** Read the original artifact (or accept inline content), review any provided code references, and note the developer's stated progress.
3. **Code verification:** Scan relevant codebase areas to verify claimed progress and identify implemented work:
   - Search for code implementation matching task requirements
   - Examine git history for commits related to the task/work
   - Check file contents for expected code structures, functions, or configurations
   - Compare claimed completions against actual code presence
   - Identify any code-level blockers or incomplete implementations
4. **Progress analysis:**
   - Extract original goals/requirements from artifact
   - Map completed work against those requirements (verified via code inspection)
   - Identify in-progress items with current status
   - Flag blockers or open questions (including code-level issues)
   - Determine immediate next steps (1-3 actionable items)
5. **Get current date:** Before creating the checkpoint document, review Standard Workflow Instructions in `.devagent/core/AGENTS.md` for date handling.
6. **Synthesize checkpoint:** Create a dated progress checkpoint document with:
   - Reference to original artifact
   - Completed work summary
   - In-progress items with status
   - Blockers and open questions
   - Remaining work breakdown
   - Immediate next steps (prioritized)
   - Use the date retrieved in step 5 for the "Date" field
7. **Update AGENTS.md:** If task-related, append progress summary, key decisions, and references to the Progress Log section in the task's AGENTS.md file. Include link to the checkpoint document.
8. **Output packaging:** Save checkpoint file in appropriate location (task progress folder or general progress folder) using the date retrieved in step 5 for the filename, and return chat response with succinct summary.
9. **Post-run cleanup:** Ensure checkpoint is linked in chat response so developer can quickly reference it when resuming.

## Storage Patterns
- **Task work:** Save to `.devagent/workspace/tasks/{status}/YYYY-MM-DD_task-slug/progress/YYYY-MM-DD_checkpoint.md`; update `.devagent/workspace/tasks/{status}/YYYY-MM-DD_task-slug/AGENTS.md` with progress log entry
- **General work:** Save to `.devagent/workspace/progress/YYYY-MM-DD_<descriptor>.md`
- **Checkpoint naming:** Review Standard Workflow Instructions in `.devagent/core/AGENTS.md` for storage patterns.
- **Directory creation:** Create progress directories as needed; they may not exist initially.

## Checkpoint Document Structure
```markdown
# Progress Checkpoint: [Task Name]
**Date:** YYYY-MM-DD
**Artifact:** [Link or reference to original task/plan]

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
- **Checkpoint file:** Markdown document saved in task progress directory or general progress directory with dated filename. Include code verification findings and evidence of implementation.
- **AGENTS.md update:** For task work, appended progress entry in AGENTS.md Progress Log section. Note any discrepancies between claimed progress and code evidence.
- **Chat response:** Succinct summary including:
  - Brief completed work recap (verified via code inspection)
  - Remaining work bullets (3-5 key items)
  - Blockers (if any, including code-level issues)
  - Immediate next step (single most important action)
  - Link to saved checkpoint file

## Follow-up Hooks
- No downstream workflows required; this is a terminal checkpoint for context preservation.
- Developers may reference checkpoints or AGENTS.md when resuming work or executing remaining tasks from the Implementation Plan section of a plan artifact.
- AGENTS.md serves as the central hub for task progress across workflows; checkpoints provide detailed snapshots.
- Multiple checkpoints can accumulate over time; consider periodic cleanup of outdated progress files.
