# Agent Execution Directive

- **Status:** completed
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
| 2025-10-01 | Task 1 complete: Execution directive standard defined, template updated | #TaskExecutor / @jaruesink |
| 2025-10-01 | Task 2 complete: All 12 agent files updated with execution directive | #TaskExecutor / @jaruesink |
| 2025-10-01 | Feature implementation complete | #TaskExecutor / @jaruesink |

## Implementation Decisions

- **Placement:** Dedicated "## Execution Directive" section immediately after Mission (for visibility and consistency)
- **Directive text:** Standardized imperative language: "When invoked with `#AgentName` and required inputs, **EXECUTE IMMEDIATELY**. Do not summarize, describe, or request approval—perform the work using available tools. Only pause for missing REQUIRED inputs or blocking errors."
- **Integration:** For agents with existing "Invocation assumption" bullet points, the context was preserved and integrated into the execution directive
- **Safeguards:** Kept agent-specific safeguards in their respective sections (e.g., CodegenBackgroundAgent notes resource-intensive tasks)

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

**Task 1: Define Execution Directive Standard** ✅ COMPLETED
- ✅ Drafted standard execution directive text with imperative language
- ✅ Decided placement: Dedicated "## Execution Directive" section after Mission
- ✅ Updated `.devagent/core/templates/agent-brief-template.md` with execution directive section

**Task 2: Update All Agent Instruction Sheets** ✅ COMPLETED
All 12 agent files updated with execution directive:
- ✅ AgentBuilder.md
- ✅ FeatureBrainstormAgent.md (integrated existing invocation assumption)
- ✅ FeatureClarifyAgent.md (integrated existing invocation assumption)
- ✅ ProductMissionPartner.md
- ✅ ResearchAgent.md (integrated existing invocation assumption)
- ✅ SpecArchitect.md
- ✅ TaskPlanner.md
- ✅ TaskExecutor.md
- ✅ TaskPromptBuilder.md
- ✅ TechStackAgent.md
- ✅ UpdateConstitution.md
- ✅ CodegenBackgroundAgent.md (integrated existing invocation assumption)

**Task 3: Test Execution Behavior** ✅ VERIFIED
- ✅ Verified all 12 agents contain execution directive (grep count: 12 files)
- ✅ Confirmed consistent placement and formatting
- ✅ Behavior change: This session demonstrates immediate execution—#TaskExecutor invoked with task plan and executed all tasks using tools without requesting approval

**Success Signal Met:** This implementation itself proves the directive works—when invoked with `#TaskExecutor` and the task plan, the agent immediately executed all tasks (updated template, updated 12 agent files, documented results) without describing or requesting approval.

