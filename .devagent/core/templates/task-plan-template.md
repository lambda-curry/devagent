# <Feature / Project Name> Task Plan

- Owner: <TaskPlanner or DRI>
- Last Updated: <YYYY-MM-DD>
- Status: <Draft | In Review | Approved>
- Related Spec: `.devagent/workspace/features/YYYY-MM-DD_feature-slug/spec/<spec-file>.md`
- Notes: Keep backlog slices to five tasks or fewer; duplicate backlog sections as needed.
- File Location: `.devagent/workspace/features/YYYY-MM-DD_feature-slug/tasks/<YYYY-MM-DD>_<descriptor>.md`

## Summary
Brief synopsis of the spec goal, key constraints, and planning focus.

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
  <!-- Note: Favor practical, behavior-focused criteria (e.g., "component renders correctly") over performance metrics (e.g., "loads in <500ms") unless performance is a documented requirement. Follow project testing standards (check docs/testing.md, .cursor/rules/testing-*.mdc, or similar). -->
- Subtasks (optional):
  1. `<Task title>` — Rationale / impacted modules / spec section
     - Acceptance: <Expected validation or test hook following project testing standards>
  2. `<Task title>` — ...
- Validation plan: <Tests, instrumentation, or review gate following project testing standards>

// Note: If no subtasks are needed for this task, omit the "Subtasks" section entirely.

### Task <2>
<Repeat structure>
