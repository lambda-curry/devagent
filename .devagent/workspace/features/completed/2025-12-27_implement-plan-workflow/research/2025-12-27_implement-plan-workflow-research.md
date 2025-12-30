# Research Packet — Implement Plan Workflow

- Mode: Spec
- Requested By: Jake Ruesink
- Last Updated: 2025-12-27
- Related Feature Hub: `.devagent/workspace/features/completed/2025-12-27_implement-plan-workflow/`
- Storage Path: `.devagent/workspace/features/completed/2025-12-27_implement-plan-workflow/research/2025-12-27_implement-plan-workflow-research.md`
- Stakeholders: Jake Ruesink (Owner)

## Request Overview

We're missing an `/implement plan` command. Need to create a new devagent workflow and corresponding command that reads plan documents, parses implementation tasks, executes them sequentially, and tracks progress. AGENTS.md files should always be the source of truth for what's remaining and updates for the feature.

**Desired outcomes:**
- Workflow that can read a plan document and execute its implementation tasks
- Progress tracking that updates AGENTS.md as the source of truth
- Support for task dependencies and sequential execution
- Integration with existing DevAgent workflow patterns

## Context Snapshot

- Feature summary: Create `devagent implement-plan` workflow that executes tasks from plan documents created by `devagent create-plan`
- Existing decisions: 
  - AGENTS.md is the central progress tracker (established in review-progress workflow and templates)
  - Plans use unified template with "Implementation Tasks" section (`.devagent/core/templates/plan-document-template.md`)
  - Tasks have structure: Objective, Impacted Modules/Files, Dependencies, Acceptance Criteria, Subtasks (optional), Validation Plan
  - Workflows follow execution directive pattern: "EXECUTE IMMEDIATELY" when invoked

## Research Questions

| ID | Question | Status | Notes |
| --- | --- | --- | --- |
| RQ1 | How are plan documents currently structured and where are tasks defined? | Answered | Plans use unified template with "Implementation Tasks" section; tasks have Objective, Dependencies, Acceptance Criteria, Subtasks |
| RQ2 | How should task dependencies be handled during execution? | Answered | Tasks list dependencies explicitly; workflow should respect dependency order |
| RQ3 | Should tasks execute automatically or require confirmation between tasks? | Answered | Constitution C3 requires human-in-the-loop defaults; confirmation between tasks aligns with delivery principles |
| RQ4 | How should progress be tracked in AGENTS.md vs the plan document? | Answered | AGENTS.md is source of truth; plan document is read-only reference; workflow updates AGENTS.md Implementation Checklist and Progress Log |
| RQ5 | Should the workflow support partial execution (e.g., "execute task 1-3")? | Answered | Yes, for flexibility and resumability; workflow should allow task range specification |
| RQ6 | What happens when a task fails or has blocking dependencies? | Answered | Workflow should pause, update AGENTS.md with blocker, and allow resumption after resolution |
| RQ7 | How should subtasks be handled within main tasks? | Answered | Subtasks are optional; if present, execute sequentially within parent task; validation occurs at subtask level |

## Key Findings

1. **Plan Structure:** Plans use unified template (`.devagent/core/templates/plan-document-template.md`) with "Implementation Tasks" section containing numbered tasks (Task 1, Task 2, etc.). Each task has: Objective, Impacted Modules/Files, Dependencies, Acceptance Criteria, optional Subtasks, and Validation Plan.

2. **Progress Tracking Pattern:** AGENTS.md is the established source of truth for feature progress. Templates (task-prompt, plan-document, review-progress) all reference AGENTS.md for progress tracking. Implementation Checklist items should be marked `[x]` when complete, `[~]` for partial progress.

3. **Human-in-the-Loop Requirement:** Constitution C3 (Delivery Principles) requires "human-in-the-loop defaults" - every agent interaction produces drafts requiring explicit confirmation before downstream automation. This means workflow should pause between tasks for confirmation, not execute all tasks automatically.

4. **Task Dependencies:** Tasks explicitly list dependencies (e.g., "Dependencies: Task 1"). Workflow must respect dependency order and validate dependencies are complete before executing a task.

5. **Execution Directive Pattern:** All workflows follow "EXECUTE IMMEDIATELY" pattern when invoked with required inputs. Implement-plan should execute immediately but pause for human confirmation between tasks.

6. **Workflow Structure:** Workflows follow standard structure: Mission, Execution Directive, Inputs, Resource Strategy, Knowledge Sources, Workflow steps, Expected Output, Follow-up Hooks. Implement-plan should follow this pattern.

7. **Command Pattern:** Every workflow has a corresponding command file in `.agents/commands/` that references the workflow. Command files follow simple template with workflow reference and input context placeholder.

## Detailed Findings

### RQ1: Plan Document Structure

**Summary:** Plans use a unified template with a clear "Implementation Tasks" section. Tasks are numbered sequentially and contain structured information.

**Supporting evidence:**
- Plan template: `.devagent/core/templates/plan-document-template.md` (2025-12-27)
- Example plan: `.devagent/workspace/features/completed/2025-12-25_pr-review-agent/plan/2025-12-25_pr-review-agent-plan.md` (2025-12-25)
- Create-plan workflow: `.devagent/core/workflows/create-plan.md` (2025-12-27) — specifies tasks should have Objective, Impacted Modules/Files, Acceptance Criteria

**Task structure:**
- Task number and title (e.g., "#### Task 1: Create Review Artifact Template")
- **Objective:** What the task delivers
- **Impacted Modules/Files:** Concrete list of files/modules to modify
- **Dependencies:** References to other tasks or external dependencies
- **Acceptance Criteria:** Behavior-focused criteria
- **Subtasks (optional):** Numbered list of subtasks with validation
- **Validation Plan:** Tests, instrumentation, review gates

**Freshness:** Template and workflow are current (2025-12-27)

### RQ2: Task Dependency Handling

**Summary:** Tasks explicitly list dependencies. Workflow must parse dependencies, validate completion, and execute in correct order.

**Supporting evidence:**
- Plan template shows "Dependencies: <Refs to other tasks or external dependencies>"
- Example plan shows dependencies like "Dependencies: Task 1 (template), existing GitHub CLI and Linear MCP skills"
- Create-plan workflow: `.devagent/core/workflows/create-plan.md` (2025-12-27) — specifies dependency mapping in step 7

**Implementation approach:**
- Parse task dependencies from plan document
- Check AGENTS.md Implementation Checklist to verify dependency completion
- Build dependency graph and execute tasks in topological order
- Handle external dependencies (e.g., "existing GitHub CLI") as blockers if not available

**Freshness:** Current (2025-12-27)

### RQ3: Automatic vs Confirmation Execution

**Summary:** Constitution C3 requires human-in-the-loop defaults. Workflow should execute tasks sequentially with confirmation between tasks, not automatically execute all tasks.

**Supporting evidence:**
- Constitution: `.devagent/workspace/memory/constitution.md` (2025-12-27) — C3: "Human-in-the-loop defaults: Every agent interaction produces drafts that require explicit human confirmation before downstream automation proceeds"
- Review-progress workflow: `.devagent/core/workflows/review-progress.md` (2025-12-27) — shows pattern of pausing for confirmation
- Execution directive pattern: All workflows execute immediately but pause for missing inputs or blocking errors

**Implementation approach:**
- Execute one task at a time
- After task completion, pause and request confirmation before proceeding to next task
- Update AGENTS.md after each task completion
- Allow user to skip remaining tasks or resume later

**Freshness:** Current (2025-12-27)

### RQ4: Progress Tracking (AGENTS.md vs Plan)

**Summary:** AGENTS.md is the source of truth. Plan document is read-only. Workflow updates AGENTS.md Implementation Checklist and Progress Log.

**Supporting evidence:**
- Feature template: `.devagent/core/templates/feature-agents-template.md` (2025-12-27) — "Implementation Checklist: Mark items as `[x]` when complete, `[~]` for partial with a short note"
- Plan template: `.devagent/core/templates/plan-document-template.md` (2025-12-27) — "Refer to the AGENTS.md file in the feature directory for instructions on tracking and reporting progress"
- Task-prompt template: `.devagent/core/templates/task-prompt-template.md` (2025-12-27) — "Review the AGENTS.md file in the feature directory for current progress"
- Review-progress workflow: `.devagent/core/workflows/review-progress.md` (2025-12-27) — "Update AGENTS.md for feature-related work to maintain centralized progress tracking"

**Implementation approach:**
- Read plan document (read-only, never modify)
- Map plan tasks to AGENTS.md Implementation Checklist items
- After each task: Update checklist item to `[x]` or `[~]`, append Progress Log entry
- Plan document remains unchanged; all progress tracked in AGENTS.md

**Freshness:** Current (2025-12-27)

### RQ5: Partial Execution Support

**Summary:** Workflow should support task range specification (e.g., "execute task 1-3") for flexibility and resumability.

**Supporting evidence:**
- Review-progress workflow: `.devagent/core/workflows/review-progress.md` (2025-12-27) — designed for resumability after context loss
- Constitution C3: "Iterate in thin slices" — supports partial execution
- No existing workflow explicitly prevents partial execution

**Implementation approach:**
- Accept optional task range input (e.g., "tasks 1-3" or "task 2,4,5")
- If no range specified, execute all tasks sequentially
- Update AGENTS.md with partial progress
- Allow resumption from any task number

**Freshness:** Current (2025-12-27)

### RQ6: Task Failure and Blocking Dependencies

**Summary:** Workflow should pause on failure, update AGENTS.md with blocker, and allow resumption after resolution.

**Supporting evidence:**
- Review-progress workflow: `.devagent/core/workflows/review-progress.md` (2025-12-27) — handles blockers and open questions
- Plan template: `.devagent/core/templates/plan-document-template.md` (2025-12-27) — includes "Risks & Open Questions" section
- Execution directive pattern: "Only pause for missing REQUIRED inputs or blocking errors"

**Implementation approach:**
- If task fails: Pause execution, update AGENTS.md Open Questions with blocker, log failure in Progress Log
- If dependency missing: Check AGENTS.md Implementation Checklist; if dependency incomplete, pause and report blocker
- Allow workflow resumption after blocker resolution
- Track blockers in AGENTS.md for visibility

**Freshness:** Current (2025-12-27)

### RQ7: Subtask Handling

**Summary:** Subtasks are optional. If present, execute sequentially within parent task. Validation occurs at subtask level.

**Supporting evidence:**
- Plan template: `.devagent/core/templates/plan-document-template.md` (2025-12-27) — shows subtasks as numbered list with validation
- Example plan: Shows subtasks like "1. Create template file with proper structure - Validation: Template file exists"
- Create-plan workflow: `.devagent/core/workflows/create-plan.md` (2025-12-27) — specifies subtasks have validation

**Implementation approach:**
- If task has subtasks: Execute subtasks sequentially within task
- Validate each subtask before proceeding to next
- If all subtasks complete, mark parent task complete in AGENTS.md
- If subtask fails, pause and update AGENTS.md with partial progress

**Freshness:** Current (2025-12-27)

## Comparative / Alternatives Analysis

### Alternative 1: Fully Automatic Execution
**Approach:** Execute all tasks automatically without confirmation.
**Tradeoffs:**
- ❌ Violates Constitution C3 (human-in-the-loop defaults)
- ❌ High risk of unintended changes
- ✅ Faster execution
- ❌ Less control for developer

**Recommendation:** Reject - violates delivery principles.

### Alternative 2: Manual Task-by-Task Invocation
**Approach:** Require separate workflow invocation for each task.
**Tradeoffs:**
- ✅ Maximum control
- ❌ High friction (multiple invocations)
- ❌ No dependency tracking across invocations
- ❌ Progress tracking fragmented

**Recommendation:** Reject - too much friction, breaks dependency management.

### Alternative 3: Confirmation Between Tasks (Selected)
**Approach:** Execute tasks sequentially with confirmation between each task.
**Tradeoffs:**
- ✅ Aligns with Constitution C3
- ✅ Maintains control while reducing friction
- ✅ Supports dependency tracking
- ✅ Allows partial execution and resumption
- ⚠️ Slightly slower than automatic (acceptable tradeoff)

**Recommendation:** **Selected** - balances control, safety, and efficiency.

### Alternative 4: Progress in Plan Document
**Approach:** Update plan document directly with progress.
**Tradeoffs:**
- ❌ Conflicts with established pattern (AGENTS.md as source of truth)
- ❌ Plan documents are read-only references
- ❌ Breaks consistency with other workflows
- ✅ Single source of truth

**Recommendation:** Reject - conflicts with established patterns.

## Implications for Implementation

### Scope Adjustments
- **Must have:** Sequential task execution with confirmation, AGENTS.md progress tracking, dependency validation, partial execution support
- **Should have:** Subtask execution, blocker handling, resumption support
- **Nice to have:** Task filtering by tags, parallel execution for independent tasks (future enhancement)

### Acceptance Criteria Impacts
- Workflow must read plan document and parse Implementation Tasks section
- Workflow must validate task dependencies against AGENTS.md Implementation Checklist
- Workflow must update AGENTS.md after each task (checklist + progress log)
- Workflow must pause for confirmation between tasks
- Workflow must support task range specification
- Workflow must handle task failures gracefully with blocker tracking

### Validation Needs
- Test with plan document containing multiple tasks with dependencies
- Test partial execution (task range)
- Test dependency validation (missing dependency scenario)
- Test task failure handling
- Test AGENTS.md update accuracy
- Test resumption after pause

## Risks & Open Questions

| Item | Type | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Plan document parsing complexity | Risk | Jake Ruesink | Use markdown parsing to extract tasks; validate against template structure | During implementation |
| Task dependency graph complexity | Risk | Jake Ruesink | Start with simple linear dependencies; handle complex graphs in future iteration | During implementation |
| AGENTS.md update conflicts | Risk | Jake Ruesink | Read AGENTS.md, update in-memory, write atomically; handle merge conflicts gracefully | During implementation |
| Subtask validation granularity | Question | Jake Ruesink | Determine if subtask failures should block parent task or allow partial completion | During design |
| External dependency detection | Question | Jake Ruesink | How to detect if external dependencies (e.g., "existing GitHub CLI") are available? | During design |
| Task execution context preservation | Question | Jake Ruesink | How to preserve context between tasks for resumption? Store in AGENTS.md or separate checkpoint? | During design |

## Recommended Follow-ups

1. **Design workflow structure:** Use `devagent build-workflow` to create the workflow definition following DevAgent patterns
2. **Create implementation plan:** Use `devagent create-plan` to break down workflow implementation into tasks
3. **Prototype task parsing:** Test markdown parsing of plan documents to extract tasks reliably
4. **Validate AGENTS.md update pattern:** Ensure atomic updates don't conflict with manual edits

## Sources

| Reference | Type | Freshness | Access Notes |
| --- | --- | --- | --- |
| `.devagent/core/templates/plan-document-template.md` | Internal template | 2025-12-27 | Plan document structure and task format |
| `.devagent/core/workflows/create-plan.md` | Internal workflow | 2025-12-27 | How plans are created and task structure |
| `.devagent/core/workflows/review-progress.md` | Internal workflow | 2025-12-27 | Progress tracking patterns and AGENTS.md updates |
| `.devagent/core/templates/feature-agents-template.md` | Internal template | 2025-12-27 | AGENTS.md structure and progress tracking format |
| `.devagent/workspace/memory/constitution.md` | Internal governance | 2025-12-27 | C3: Delivery Principles (human-in-the-loop defaults) |
| `.devagent/workspace/features/completed/2025-12-25_pr-review-agent/plan/2025-12-25_pr-review-agent-plan.md` | Example plan | 2025-12-25 | Real-world plan document structure |
| `.devagent/core/AGENTS.md` | Internal documentation | 2025-12-27 | Workflow roster and patterns |
| `.agents/commands/README.md` | Internal documentation | 2025-12-27 | Command file pattern and structure |
