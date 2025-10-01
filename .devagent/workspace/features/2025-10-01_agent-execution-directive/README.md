# Agent Execution Directive

- **Status:** planning
- **Owners:** @jaruesink
- **Summary:** Add explicit execution directives to all agent instruction sheets so agents execute immediately when invoked instead of describing what they would do. Fixes the "describe vs. do" behavior issue.
- **Related missions:** Enables agents to work autonomously without requiring approval for every action, accelerating DevAgent workflow velocity
- **Latest spec:** TBD - creating task plan first
- **Latest research:** N/A - internal tooling improvement based on observed behavior

## Changelog

| Date | Update | Agent/Owner |
|------|--------|-------------|
| 2025-10-01 | Created feature hub | @jaruesink |
| 2025-10-01 | Task planning complete (3 tasks, 17 subtasks) | #TaskPlanner / @jaruesink |

## Open Decisions

- Should execution directive be in Mission section or separate section?
- Do we need different directives for different agent types (creator vs. executor)?
- Should we add safeguards for destructive operations?

## Problem Statement

Current agent behavior: When invoked with `#AgentName`, agents default to **describing** what they would do rather than **executing** the workflow immediately. This causes friction and requires manual intervention to actually get work done.

**Root causes:**
1. Default AI assistant behavior (trained to be cautious and explain)
2. Missing explicit execution directive in agent instruction sheets
3. Ambiguous language ("Request missing info" sounds procedural, not imperative)
4. No clear "you are now executing" trigger

**Impact:** Every agent invocation requires follow-up to actually execute, slowing workflow velocity and reducing agent autonomy.

## Solution

Add explicit execution directive to all agent instruction sheets that tells the AI:
- Execute immediately when invoked with required inputs
- Do not summarize, describe, or request approval
- Only pause for missing REQUIRED inputs or blocking errors

## Task Artifacts

- `tasks/2025-10-01_execution-directive-task-plan.md` — Implementation task plan (3 tasks, 17 subtasks)

## Implementation Summary

**Task 1: Define Execution Directive Standard** (3 subtasks)
- Draft standard execution directive text
- Decide placement in agent files (recommendation: dedicated section after Mission)
- Update agent template

**Task 2: Update All Agent Instruction Sheets** (12 subtasks)
- Add execution directive to all 12 agent files
- Target: `.devagent/core/agents/*.md` (after restructure completes)

**Task 3: Test Execution Behavior** (3 subtasks)
- Test agents execute immediately
- Test agents pause for missing required inputs
- Document behavior change

**Blocked By:** Core-workspace-split restructure must complete first

**Success Signal:** Agents execute workflows immediately using tools instead of describing what they would do

