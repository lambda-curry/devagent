# <Task / Project Name> Task Plan

- Owner: <TaskPlanner or DRI>
- Last Updated: <YYYY-MM-DD>
- Status: <Draft | In Review | Approved>
- Related Plan: `.devagent/workspace/tasks/{status}/YYYY-MM-DD_task-slug/plan/<plan-file>.md`
- Notes: Keep backlog slices to five tasks or fewer; duplicate backlog sections as needed.
- File Location: `.devagent/workspace/tasks/{status}/YYYY-MM-DD_task-slug/tasks/<YYYY-MM-DD>_<descriptor>.md`

## Summary
Brief synopsis of the plan goal, key constraints, and planning focus.

## Scope & Assumptions
- Scope focus: <Phase / Component / Platform>
- Key assumptions: <List>
- Out of scope: <Items>

## Tasks
### Task <1>
- Objective: <What this task slice delivers>
- Dependencies: <Refs>
- <!-- 
    If there are no subtasks, provide top-level acceptance criteria here.
    If there are subtasks, move acceptance criteria to each subtask.
-->
- Acceptance Criteria: <List top-level criteria if no subtasks, otherwise omit>
<!-- Note: Strictly avoid performance metrics (e.g., load times, response times) unless explicitly documented as a business requirement in mission or research artifacts. Favor practical, behavior-focused criteria (e.g., "component does [enter specific requirement]" rather than "loads in <500ms"). Follow project testing standards (check docs/testing.md, .cursor/rules/testing-*.mdc, or similar). -->
- Subtasks (optional):
  1. `<Task title>` — Rationale / impacted modules / plan section
     - Acceptance: <Expected validation or test hook following project testing standards>
  2. `<Task title>` — ...
- Validation plan: <Tests, instrumentation, or review gate following project testing standards>

// Note: If no subtasks are needed for this task, omit the "Subtasks" section entirely.

### Task <2>
<Repeat structure>

## Progress Tracking
Refer to the AGENTS.md file in the task directory for instructions on tracking and reporting progress during implementation.
