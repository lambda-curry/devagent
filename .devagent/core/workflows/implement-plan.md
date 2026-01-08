# Implement Plan

## Mission
- Primary goal: Execute implementation tasks from plan documents created by `devagent create-plan`, performing coding work sequentially and tracking progress in AGENTS.md files.
- Boundaries / non-goals: Do not execute non-coding tasks (e.g., "decide on architecture approach"), commit changes (leave as open changes for review), execute tasks requiring external approvals or manual steps, or automatically retry failed tasks. Do not modify the plan document itself—it is read-only.
- Success signals: Coding tasks execute successfully in dependency order, AGENTS.md updates accurately reflect progress (checklist + progress log), non-blocking non-coding tasks are skipped gracefully, and workflow pauses only for truly ambiguous decisions or blockers.

## Standard Instructions Reference
Before executing this workflow, review standard instructions in `.devagent/core/AGENTS.md` → Standard Workflow Instructions for:
- Date handling
- Metadata retrieval
- Context gathering order
- Standard guardrails
- Storage patterns

## Execution Directive
Follow standard execution directive in `.devagent/core/AGENTS.md` → Standard Workflow Instructions, with the following workflow-specific customization:
- Execute as much as possible without stopping; only pause for missing REQUIRED inputs, blocking errors, or truly ambiguous decisions requiring human input.
- If the user’s input expresses an intent to review between tasks or to run only a subset before reviewing, honor that intent (see Workflow step 1).

## Inputs
- Required: Plan document path (or plan document content provided in input context), task directory path (for AGENTS.md location).
- Optional: Task range specification (e.g., "tasks 1-3" or "task 2,4,5"), specific task filter criteria, user intent to pause/review after certain tasks (infer from input context).
- Missing info protocol: If plan document path is not provided, request it. If task directory path cannot be inferred from plan document location, request explicit path. Proceed best-effort if optional inputs are missing.

## Resource Strategy
- Plan document (read-only) — located at `.devagent/workspace/tasks/{status}/<task_prefix>_<task_slug>/plan/` or path provided in input. Parse the "Implementation Tasks" section to extract tasks.
- Task AGENTS.md — located at `.devagent/workspace/tasks/{status}/<task_prefix>_<task_slug>/AGENTS.md`. Update Implementation Checklist and Progress Log after each task completion.
- Codebase — execute coding tasks (file creation, code changes, tests) as specified in task objectives and impacted modules/files.
- Quality validation scripts — detect from project configuration files (package.json, package.yaml, Makefile, etc.) to find available linting and typechecking commands. If no quality validation scripts are found, skip checks (non-blocking).
- Related workflows: devagent review-progress (for resuming after context loss), devagent create-plan (predecessor that creates plans).

## Knowledge Sources
- Internal: Plan document structure (`.devagent/core/templates/plan-document-template.md`), AGENTS.md template (`.devagent/core/templates/task-agents-template.md`), existing workflow patterns (`.devagent/core/workflows/`), constitution delivery principles (`.devagent/workspace/memory/constitution.md` C3).
- External: Project codebase structure, testing standards (from project documentation or `.cursor/rules/`), file organization patterns.

## Workflow
1. **Kickoff / readiness checks:** Confirm plan document path and task directory location. Parse task range specification if provided (e.g., "tasks 1-3" → execute only tasks 1, 2, 3). Infer intent to pause/review from input phrasing (e.g., "pause after each task", "review after task 2", "do tasks 1-3 then stop"). Verify plan document exists and is readable.
2. **Plan document parsing:** Read the plan document and extract:
   - "Implementation Tasks" section: Parse each task to extract:
     - Task number and title
     - Objective
     - Impacted Modules/Files
     - Dependencies (references to other tasks or external dependencies)
     - Acceptance Criteria
     - Subtasks (optional)
     - Validation Plan
   - "Implementation Guidance" section (if present): Review embedded snippets from agent documentation (AGENTS.md, `.devagent/core/AGENTS.md`), coding standards (cursor rules, workspace rules), and related documentation files (README.md, docs/**, etc.) that guide implementation. These snippets should inform code style, testing patterns, file organization, naming conventions, and other implementation decisions throughout task execution.
3. **Dependency validation:** For each task in execution order, check dependencies:
   - Parse dependency references (e.g., "Dependencies: Task 1" or "Dependencies: Task 1, Task 2")
   - Read AGENTS.md Implementation Checklist to verify dependency tasks are marked complete (`[x]`)
   - If dependencies are incomplete, skip the task and report as blocker (unless task is specified in range override)
   - If external dependencies are mentioned (e.g., "existing GitHub CLI"), note as potential blocker if not available
4. **Task execution loop:** For each task in order (respecting task range if specified):
   - **Task classification:** Determine if task is a coding task (can be executed by AI agent) or non-coding task (requires human decision, external approval, or manual step).
   - **Coding task execution:**
     - Review any relevant guidance from the plan's "Implementation Guidance" section that applies to this task
     - Execute the task objective: create/modify/delete files as specified in Impacted Modules/Files, following coding standards and patterns from the Implementation Guidance section (if present)
     - If subtasks are present, execute them sequentially within the parent task
     - **Quality checks:** After code changes, detect and run available quality validation scripts:
       - **Linting check:** Check project configuration files (package.json, package.yaml, Makefile, etc.) for lint-related scripts (e.g., scripts with "lint" in the name)
         - If a linting script is found, execute it. If linting fails:
           - Check if the lint tool supports auto-fix (e.g., check for `lint:fix`, `lint --fix`, or similar patterns)
           - If auto-fix is available, run it and re-check linting
           - If auto-fix resolves all issues, proceed to typechecking
           - If linting errors remain after auto-fix attempt, pause execution, update AGENTS.md with blocker, report linting errors to user, stop workflow
         - If no linting script is detected, log a note that linting check was skipped (non-blocking)
       - **Typechecking check:** Check project configuration files for typecheck-related scripts (e.g., scripts with "typecheck", "type-check", "tsc", or similar in the name)
         - If a typechecking script is found, execute it. If typechecking fails:
           - Typechecking errors typically cannot be auto-fixed, so pause execution, update AGENTS.md with blocker, report typechecking errors to user, stop workflow
         - If no typechecking script is detected, log a note that typechecking check was skipped (non-blocking)
       - If both linting and typechecking scripts are found and both pass (or are skipped), proceed to validation
     - Validate completion using acceptance criteria and validation plan
     - Leave changes as open (do not commit)
   - **Non-coding task handling:**
     - If non-blocking: skip the task, log skip in progress update, continue to next task
     - If blocking: pause execution, update AGENTS.md with blocker, report to user, stop workflow
   - **Ambiguous task handling:** If task classification is unclear or requirements are ambiguous, pause execution, update AGENTS.md with blocker, ask for clarification, stop workflow
   - **Error handling:** If task execution fails (including linting failures that cannot be auto-fixed), pause execution, update AGENTS.md with failure and blocker, report error to user, stop workflow
   - **Progress update:** After each task completion (or skip):
     - Read current AGENTS.md
     - Update Implementation Checklist: mark task as `[x]` (complete) or `[~]` (partial with note)
     - Append Progress Log entry: `- [YYYY-MM-DD] Event: Task X completed: brief summary, link to files changed`
     - Update "Last Updated" date to today (ISO: YYYY-MM-DD)
     - Write updated AGENTS.md atomically
   - **Continuation by default:** After updating AGENTS.md, report task completion and proceed to the next task. Only pause if the user’s input indicates they want to review between tasks or stop after a specified subset.
5. **Completion reporting:** After all executable tasks are complete (or workflow stopped for blocker):
   - Generate summary of completed tasks, skipped tasks, and blockers
   - Report final status to user with link to updated AGENTS.md
   - Note any remaining tasks that were not executed (due to range specification or blockers)

## Task Classification Guidelines
- **Coding tasks (execute):** File creation/modification/deletion, code changes, test writing, configuration updates, documentation updates that are straightforward.
- **Non-coding tasks (skip if non-blocking, pause if blocking):** Architecture decisions, external approvals, manual testing steps, user acceptance testing, rollout activities, announcements, support tasks.
- **Ambiguous tasks (pause and ask):** Tasks with unclear requirements, tasks requiring business/product decisions not specified in plan, tasks with conflicting acceptance criteria.

## Progress Tracking Pattern
When updating AGENTS.md:
1. Read current AGENTS.md file
2. Locate Implementation Checklist section
3. Find or add checklist item for current task (format: `- [ ] Task X: <task title>`)
4. Update checklist item: `[x]` for complete, `[~]` for partial (with brief note)
5. Append to Progress Log section: `- [YYYY-MM-DD] Event: <description>, links to files`
6. Update "Last Updated" date in header metadata
7. Write updated content atomically

## Adaptation Notes
- For plan documents with no task range specified, execute all tasks sequentially.
- For plans with complex dependency graphs, execute in topological order (dependencies before dependents).
- For partial execution (task range), still validate dependencies but allow override if user explicitly requests task range that includes tasks with incomplete dependencies.
- When resuming after a blocker, user can invoke workflow again with same plan document and appropriate task range to continue from where execution stopped.
- If AGENTS.md Implementation Checklist items don't match plan tasks, create new checklist items or update existing ones to align with plan structure.

## Failure & Escalation
- Plan document not found or unreadable: pause and request correct path.
- Cannot parse Implementation Tasks section: pause and report parsing error; suggest verifying plan document follows template structure.
- Task dependency not found in AGENTS.md: treat as incomplete dependency, skip dependent task, report blocker.
- Task execution fails (code error, file system error, etc.): pause, update AGENTS.md with failure details, report error to user, stop workflow.
- Linting failures: After each coding task, if a linting script is detected and linting fails (and cannot be auto-fixed), pause execution, update AGENTS.md with linting error details, report to user, stop workflow. If no linting script is found in project configuration, skip linting checks (non-blocking, log note only).
- Typechecking failures: After each coding task, if a typechecking script is detected and typechecking fails, pause execution, update AGENTS.md with typechecking error details, report to user, stop workflow. If no typechecking script is found in project configuration, skip typechecking checks (non-blocking, log note only).
- Ambiguous task requirements: pause, update AGENTS.md with clarification request, ask user for guidance, stop workflow.
- AGENTS.md update fails (write error, parse error): report error to user, suggest manual update, continue if possible or pause if atomic update required.

## Expected Output
- **Code changes:** Files created/modified/deleted as specified in task objectives and impacted modules/files. If linting or typechecking scripts are detected in the project, all code changes pass quality validation checks (linting and typechecking are verified after each coding task). Changes left as open (not committed) for review.
- **AGENTS.md updates:** Implementation Checklist marked with task completions, Progress Log entries appended for each task, "Last Updated" date refreshed.
- **Communication:** Status report after each task completion, final summary when all executable tasks complete or workflow stops for blocker. Summary includes:
  - Completed tasks list with brief descriptions
  - Skipped tasks list (non-coding, non-blocking)
  - Blockers (if any) with details
  - Link to updated AGENTS.md
  - Remaining tasks (if workflow stopped early)

## Follow-up Hooks
- **Resumption:** User can invoke workflow again with same plan document and task range to resume from where execution stopped.
- **Progress review:** Use `devagent review-progress` to capture state if stopping work for extended period.
- **Plan updates:** If plan document is updated after execution starts, re-read plan document on next invocation; workflow should handle plan changes gracefully (new tasks added, tasks removed, etc.).
- **Downstream workflows:** After implementation, the task may proceed to testing, review, or other workflows as specified in the plan or roadmap.

## Related Workflows
- **Predecessor:** devagent create-plan (creates plan documents with implementation tasks)
- **Companion:** devagent review-progress (captures progress state for resumption)
- **Successor:** Feature-specific workflows for testing, review, deployment as specified in plan or roadmap
