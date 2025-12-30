# Implement Plan Workflow Plan

- Owner: Jake Ruesink
- Last Updated: 2025-12-27
- Status: Draft
- Related Feature Hub: `.devagent/workspace/features/completed/2025-12-27_implement-plan-workflow/`
- Stakeholders: Jake Ruesink (Owner, Decision Maker)
- Notes: This plan implements a DevAgent workflow for executing implementation tasks from plan documents created by `devagent create-plan`.

---

## PART 1: PRODUCT CONTEXT

### Summary

Create a new `devagent implement-plan` workflow that reads plan documents, parses implementation tasks, executes coding tasks sequentially, and tracks progress in AGENTS.md files. This workflow fills a critical gap in the DevAgent workflow roster by providing structured guidance for executing tasks from plans, reducing manual prompt creation and ensuring consistent progress tracking.

### Context & Problem

**Current state:**
Engineers using DevAgent workflows must manually type implementation instructions each time they want to execute tasks from a plan document. This creates friction:
- No standardized guidance on how to keep AGENTS.md files updated as progress is made
- Some engineers struggle with creating effective prompts for task execution
- Confusion about how to follow workflows properly
- Missing recommended next steps that would help guide execution

**User pain:**
- Manual task execution without structured guidance
- Inconsistent progress tracking across features
- Lack of clear workflow execution patterns

**Business trigger:**
Missing `/implement plan` command creates friction that slows down feature delivery and reduces consistency in how engineers use DevAgent workflows. Having a slash command provides solid recommended next steps and reduces confusion about workflow execution.

**Evidence:**
- Confusion observed about how to follow workflows
- Need for commands and recommended next steps in outputs to guide users
- Pattern of manual task execution without structured guidance

**References:**
- Research packet: `.devagent/workspace/features/completed/2025-12-27_implement-plan-workflow/research/2025-12-27_implement-plan-workflow-research.md` (2025-12-27)
- Clarification packet: `.devagent/workspace/features/completed/2025-12-27_implement-plan-workflow/clarification/2025-12-27_initial-clarification.md` (2025-12-27)

### Objectives & Success Metrics

**Product objectives:**
- Engineers can execute plan tasks using a standardized command (`/implement plan`)
- Progress is automatically tracked in AGENTS.md files (checklist + progress log)
- Workflow provides clear guidance and recommended next steps
- Task execution follows consistent patterns aligned with DevAgent principles

**Success metrics:**
- Workflow successfully reads plan documents and parses Implementation Tasks section
- Workflow executes coding tasks sequentially without manual intervention (for executable tasks)
- AGENTS.md files are updated accurately after each task completion
- Engineers report reduced friction when executing plan tasks

**Definition of "good enough":**
- Workflow can execute coding tasks from plan documents
- AGENTS.md updates work correctly
- Non-coding tasks are skipped gracefully
- Workflow pauses appropriately for truly ambiguous decisions

**What would indicate failure:**
- Workflow cannot parse plan documents correctly
- AGENTS.md updates are inaccurate or incomplete
- Workflow fails to execute tasks that should be executable
- Engineers still need to manually create prompts for task execution

### Users & Insights

**Primary users:**
- Engineers using DevAgent workflows who need to execute tasks from plan documents

**User goals:**
- Execute implementation tasks from plans efficiently
- Maintain accurate progress tracking in AGENTS.md
- Follow structured workflow patterns without manual prompt creation

**Key insights:**
- Engineers need structured guidance for workflow execution
- Commands and recommended next steps in outputs help reduce confusion
- Automatic progress tracking reduces manual overhead

**Decision authority:**
- Jake Ruesink (Owner) has final say on user requirements and workflow design

### Solution Principles

**Quality bars:**
- Follow existing DevAgent workflow patterns and structure
- Align with Constitution C3 (Delivery Principles): human-in-the-loop defaults, traceable artifacts
- Tool-agnostic design (C4): workflow works across any AI development tool
- Maintain consistency with other DevAgent workflows

**Architecture principles:**
- Workflow follows standard DevAgent workflow structure (Mission, Execution Directive, Inputs, Resource Strategy, Workflow steps, Expected Output)
- Command file follows established pattern in `.agents/commands/`
- Progress tracking uses AGENTS.md as source of truth (established pattern)

**UX principles:**
- Execute as much as possible without stopping (only pause for truly ambiguous decisions)
- Provide clear status updates and progress tracking
- Leave changes as open for review (no auto-commit)

**Performance expectations:**
- Workflow should execute tasks efficiently without unnecessary pauses
- AGENTS.md updates should be atomic and accurate

### Scope Definition

- **In Scope:**
  - Execute coding tasks from plan documents (file creation, code changes, tests)
  - Update AGENTS.md with progress (checklist + progress log) after each task
  - Support sequential task execution
  - Skip non-blocking tasks that can't be executed (non-coding tasks)
  - Only stop for truly ambiguous decisions that need human input
  - Try to execute as much as possible without stopping and asking
  - Handle task dependencies and validate completion
  - Support task range specification (e.g., "execute tasks 1-3")

- **Out of Scope / Future:**
  - Executing non-coding tasks (e.g., "decide on architecture approach")
  - Tasks requiring external approvals or manual steps
  - Automatic task retry on failure
  - Committing changes (leave as open changes for review)
  - Resume from specific task after pause (future enhancement)
  - Parallel execution for independent tasks (future enhancement)

### Functional Narrative

#### Flow: Execute Plan Tasks

**Trigger:**
Engineer invokes `/implement plan` command with plan document path (or plan document is provided in input context).

**Experience narrative:**
1. Workflow reads plan document and parses "Implementation Tasks" section
2. Workflow validates task dependencies against AGENTS.md Implementation Checklist
3. Workflow executes tasks sequentially:
   - For each task, determines if it's a coding task (can be executed by AI agent)
   - If coding task: executes task, updates AGENTS.md with progress
   - If non-coding task: skips if non-blocking, pauses if blocking
   - If ambiguous: pauses and asks for clarification
4. After each task: updates AGENTS.md Implementation Checklist and Progress Log
5. Continues until all executable tasks are complete or blocker encountered
6. If blocker encountered: updates AGENTS.md with blocker, reports status to engineer

**Acceptance criteria:**
- Workflow successfully parses plan document structure
- Tasks execute in correct dependency order
- AGENTS.md updates accurately reflect progress
- Non-coding tasks are handled appropriately (skip or pause)
- Blocker reporting is clear and actionable

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions

- **Scope focus:** Initial implementation of `devagent implement-plan` workflow with core functionality
- **Key assumptions:**
  - Plan documents follow unified template structure (`.devagent/core/templates/plan-document-template.md`)
  - Tasks have structured format: Objective, Impacted Modules/Files, Dependencies, Acceptance Criteria, optional Subtasks
  - AGENTS.md files exist in feature directories and follow standard template
  - Workflow will be invoked by AI agents (not standalone script)
- **Out of scope:**
  - Executing non-coding tasks
  - Auto-committing changes
  - Task retry logic
  - Parallel task execution

### Implementation Tasks

#### Task 1: Create Implement Plan Workflow Definition
- **Objective:** Create the core workflow definition file that orchestrates plan task execution
- **Impacted Modules/Files:**
  - `.devagent/core/workflows/implement-plan.md` (new file)
- **Dependencies:** None
- **Acceptance Criteria:**
  - Workflow follows DevAgent workflow structure (Mission, Execution Directive, Inputs, Resource Strategy, Workflow steps, Expected Output, Follow-up Hooks)
  - Workflow specifies how to read plan documents and parse Implementation Tasks section
  - Workflow defines task execution logic (coding vs non-coding, dependency validation)
  - Workflow specifies AGENTS.md update patterns (checklist + progress log)
  - Workflow handles error cases (blockers, ambiguous decisions)
  - Workflow aligns with Constitution C3 (human-in-the-loop defaults)
  - Workflow follows tool-agnostic design principles (C4)
- **Subtasks:**
  1. Create workflow file with standard DevAgent structure
     - Validation: File exists and follows workflow template structure
  2. Define mission, execution directive, and inputs
     - Validation: Workflow clearly states purpose, execution model, and required inputs
  3. Define resource strategy (plan document parsing, AGENTS.md updates)
     - Validation: Workflow specifies artifact locations and parsing approach
  4. Implement workflow steps: plan parsing, task execution, progress tracking
     - Validation: Workflow steps cover full execution process
  5. Add error handling for blockers and ambiguous decisions
     - Validation: Workflow gracefully handles edge cases
  6. Define expected output and follow-up hooks
     - Validation: Workflow specifies outputs and integration points
- **Validation Plan:** Review workflow against research recommendations and clarification requirements

#### Task 2: Create Implement Plan Command File
- **Objective:** Create command file that provides standardized interface for invoking the implement-plan workflow
- **Impacted Modules/Files:**
  - `.agents/commands/implement-plan.md` (new file)
- **Dependencies:** Task 1 (workflow definition)
- **Acceptance Criteria:**
  - Command file follows DevAgent command structure
  - Command file references workflow definition (`.devagent/core/workflows/implement-plan.md`)
  - Command file includes input context placeholder
  - Command file is properly formatted for agent execution
- **Subtasks:**
  1. Create command file with standard structure
     - Validation: File exists and follows command template
  2. Add workflow reference and instructions
     - Validation: Command file correctly references workflow
  3. Add input context placeholder
     - Validation: Command file includes placeholder for plan document path/context
- **Validation Plan:** Verify command file structure matches other command files in `.agents/commands/`

#### Task 3: Update Workflow Roster Documentation
- **Objective:** Add implement-plan workflow to DevAgent workflow roster documentation
- **Impacted Modules/Files:**
  - `.devagent/core/AGENTS.md` (update existing file)
- **Dependencies:** Task 1 (workflow definition)
- **Acceptance Criteria:**
  - Workflow is added to workflow roster with description
  - Workflow follows naming convention (implement-plan)
  - Workflow description includes usage guidance
  - Documentation is consistent with other workflow entries
- **Subtasks:**
  1. Add implement-plan entry to workflow roster
     - Validation: Entry exists in correct location
  2. Write workflow description and usage guidance
     - Validation: Description matches workflow purpose and usage
  3. Verify consistency with other workflow entries
     - Validation: Format and style match existing entries
- **Validation Plan:** Review updated AGENTS.md for consistency and completeness

#### Task 4: Test Workflow with Existing Plan Documents
- **Objective:** Validate workflow functionality with real plan documents
- **Impacted Modules/Files:**
  - Test execution (no file changes)
  - `.devagent/workspace/features/completed/2025-12-27_implement-plan-workflow/AGENTS.md` (progress updates)
- **Dependencies:** Tasks 1-3 (all workflow components)
- **Acceptance Criteria:**
  - Workflow can be invoked successfully
  - Workflow reads plan documents correctly
  - Workflow parses Implementation Tasks section accurately
  - Workflow executes coding tasks sequentially
  - AGENTS.md updates are accurate (checklist + progress log)
  - Workflow handles task dependencies correctly
  - Workflow skips non-blocking non-coding tasks appropriately
  - Workflow pauses for truly ambiguous decisions
  - Workflow updates AGENTS.md when stopping for blockers
- **Subtasks:**
  1. Test workflow with plan document containing multiple tasks
     - Validation: All executable tasks complete successfully
  2. Test task dependency validation
     - Validation: Tasks execute in correct order based on dependencies
  3. Test AGENTS.md update accuracy
     - Validation: Checklist and progress log reflect actual task completion
  4. Test error handling with ambiguous tasks
     - Validation: Workflow pauses appropriately and reports blocker
  5. Test skipping non-coding tasks
     - Validation: Non-coding tasks are skipped without blocking execution
- **Validation Plan:** Execute workflow with real plan documents and verify all acceptance criteria are met

### Release & Delivery Strategy

**Milestone 1: Core Workflow Implementation**
- Complete Tasks 1-3: Workflow definition, command file, documentation
- Validation: All files created and workflow structure complete

**Milestone 2: Testing and Validation**
- Complete Task 4: End-to-end testing with real plan documents
- Validation: Workflow functions correctly with actual usage scenarios

---

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Plan document parsing complexity | Risk | Jake Ruesink | Use markdown parsing to extract tasks; validate against template structure | During Task 1 |
| Task dependency graph complexity | Risk | Jake Ruesink | Start with simple linear dependencies; handle complex graphs in future iteration | During Task 1 |
| AGENTS.md update conflicts | Risk | Jake Ruesink | Read AGENTS.md, update in-memory, write atomically; handle merge conflicts gracefully | During Task 1 |
| Subtask validation granularity | Question | Jake Ruesink | Determine if subtask failures should block parent task or allow partial completion | During Task 1 |
| External dependency detection | Question | Jake Ruesink | How to detect if external dependencies (e.g., "existing GitHub CLI") are available? | During Task 1 |
| Task execution context preservation | Question | Jake Ruesink | How to preserve context between tasks for resumption? Store in AGENTS.md or separate checkpoint? | During Task 1 |

---

## Progress Tracking

Refer to the AGENTS.md file in the feature directory (`.devagent/workspace/features/completed/2025-12-27_implement-plan-workflow/AGENTS.md`) for instructions on tracking and reporting progress during implementation.

---

## Appendices & References

- **Research Packet:** `.devagent/workspace/features/completed/2025-12-27_implement-plan-workflow/research/2025-12-27_implement-plan-workflow-research.md` (2025-12-27)
- **Clarification Packet:** `.devagent/workspace/features/completed/2025-12-27_implement-plan-workflow/clarification/2025-12-27_initial-clarification.md` (2025-12-27)
- **Plan Template:** `.devagent/core/templates/plan-document-template.md` (2025-12-27)
- **Create Plan Workflow:** `.devagent/core/workflows/create-plan.md` (2025-12-27)
- **Product Mission:** `.devagent/workspace/product/mission.md` (2025-12-27)
- **Constitution:** `.devagent/workspace/memory/constitution.md` (2025-12-27)
- **Workflow Roster:** `.devagent/core/AGENTS.md` (2025-12-27)
- **Command Pattern:** `.agents/commands/README.md` (2025-12-27)
