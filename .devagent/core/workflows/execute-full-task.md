# Execute Full Task

## Mission
- Primary goal: Execute a complete task lifecycle end-to-end in a single prompt by assessing complexity, routing through the appropriate workflow chain, and updating the task hub AGENTS.md with an execution summary.
- Boundaries / non-goals: Do not generate command chains, commit changes, or bypass explicit pause points. Do not create a Full Cycle Log template; use task hub AGENTS.md summary instead.
- Success signals: Appropriate workflow chain selected (with rationale), workflows executed sequentially without manual chaining, task hub AGENTS.md updated after each phase, and task completes through mark-task-complete unless a pause or blocker occurs.

## Standard Instructions Reference
Before executing this workflow, review standard instructions in `.devagent/core/AGENTS.md` -> Standard Workflow Instructions for:
- Date handling
- Metadata retrieval
- Context gathering order
- Standard guardrails
- Storage patterns

## Execution Directive
Follow standard execution directive in `.devagent/core/AGENTS.md` -> Standard Workflow Instructions, with the following workflow-specific customization:
- Execute the selected workflow chain end-to-end without pausing between workflows.
- Only pause for missing REQUIRED inputs, blocking errors, or explicit user pause points (e.g., "pause after plan").
- Execute workflows directly (no command generation).
- After each workflow phase, update the task hub AGENTS.md execution summary (see "Execution Summary Update Policy").

## Inputs
- Required: Task description (title or 1-3 sentences).
- Optional: Complexity hint (simple/standard/complex), workflow overrides (skip/include), pause points (e.g., "pause after plan"), task metadata (owner, tags, issue slug), existing task hub path (if already created).
- Missing info protocol: If task description is missing, request it. If task hub path is missing and cannot be inferred, run `devagent new-task` to create it and proceed with the generated path.

## Resource Strategy
- Workflow definitions: `.devagent/core/workflows/new-task.md`, `clarify-task.md`, `research.md`, `brainstorm.md`, `create-plan.md`, `implement-plan.md`, `mark-task-complete.md`.
- Task hub AGENTS.md: `.devagent/workspace/tasks/{status}/<task_prefix>_<task_slug>/AGENTS.md`.
- Task artifacts: `clarification/`, `research/`, `plan/` folders under the task hub (created on-demand when artifacts are written).

## Knowledge Sources
- Internal: `.devagent/core/AGENTS.md`, workflow definitions, task hub AGENTS.md, related task research/plan artifacts.
- External: Only when required by downstream workflows (use their guidance).

## Complexity Assessment Heuristics
Use heuristic assessment with user override. Document rationale in the task hub execution summary.

### Simple Indicators
- Single file or narrow change scope
- Clear, unambiguous request
- Minimal or no user-facing impact
- No architectural decisions

**Default chain:** `new-task -> research (quick, if needed) -> create-plan -> implement-plan -> mark-task-complete`
**Skip:** `clarify-task`

### Standard Indicators
- Multiple files/components affected
- User-facing changes or API changes
- Some requirement validation needed
- Moderate architectural decisions

**Default chain:** `new-task -> clarify-task -> research -> create-plan -> implement-plan -> mark-task-complete`

### Complex Indicators
- Major feature or initiative
- Multiple stakeholders or significant product impact
- Solution space exploration required
- High architectural impact or migration

**Default chain:** `new-task -> clarify-task -> research -> brainstorm -> create-plan -> implement-plan -> mark-task-complete`

### User Override
- If the user specifies a complexity level or workflow overrides, honor them and capture the rationale.

## Workflow
1. **Kickoff / readiness checks:** Parse task description, pause points, workflow overrides, and complexity hint. If no task hub exists, run `devagent new-task` to create one and capture the path.
2. **Complexity assessment:** Apply heuristics, respect user override, select the workflow chain, and document the rationale in the task hub execution summary.
3. **Execute workflow chain:** For each workflow in order:
   - Execute the workflow directly (per its execution directive).
   - Capture key outputs and decisions.
   - Update the task hub execution summary with what was executed, high-impact areas, and links to artifacts.
   - Honor explicit pause points after the specified workflow completes.
4. **Error handling:** If a workflow fails, attempt a best-effort workaround and document it. If truly blocked, skip the blocking workflow, document the block, and continue as far as possible.
5. **Completion:** When all workflows execute without pause or blockers, complete with `mark-task-complete` and provide a final summary of outcomes.

## Execution Summary Update Policy
Update the task hub AGENTS.md after each workflow phase. If the section does not exist, add it under the Summary area.

**Format:**
```
### Execution Summary
**What Was Executed:**
- [workflow] - brief outcome

**High-Impact Areas:**
- [file/path or system area] - reason

**Links to Files:**
- [path to artifact]
```

- Keep entries concise and additive; do not remove prior summary items.
- If a workflow is skipped or blocked, record it and why.

## High-Impact Areas Heuristics
Use these heuristics when filling the "High-Impact Areas" list in the execution summary:
- **File location:** Changes under `.devagent/core/workflows/`, `.devagent/core/templates/`, `.devagent/core/AGENTS.md`, `.agents/commands/`, or `.cursor/commands/` are high-impact by default.
- **Change magnitude:** Large diffs, multi-file refactors, or updates that alter workflow sequencing/guardrails are high-impact.
- **User-facing scope:** Changes that affect task orchestration behavior, task routing, or summary/traceability requirements are high-impact.
- **Irreversible actions:** Moves, deletes, or structural changes to task hubs or workspace directories are high-impact.

## Failure & Escalation
- Missing required input: pause and request it.
- Ambiguous routing or unclear overrides: pause and ask for clarification.
- Blocking errors: document in execution summary and task hub progress log, then stop unless a safe skip is possible.

## Expected Output
- Task hub created (if needed) and updated AGENTS.md execution summary.
- Workflow artifacts created in standard task folders.
- Final status report with links to key artifacts and the task hub AGENTS.md.

## Related Workflows
- **Entry:** devagent new-task
- **Validation:** devagent clarify-task
- **Discovery:** devagent research
- **Ideation:** devagent brainstorm
- **Planning:** devagent create-plan
- **Implementation:** devagent implement-plan
- **Completion:** devagent mark-task-complete
