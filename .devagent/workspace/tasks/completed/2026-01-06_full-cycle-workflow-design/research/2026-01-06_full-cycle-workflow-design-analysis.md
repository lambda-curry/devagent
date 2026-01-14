# Full Cycle Workflow Design Analysis

**Date:** 2026-01-06  
**Purpose:** Comprehensive analysis of workflow sequencing and design of end-to-end full-cycle orchestration workflow

## Executive Summary

This analysis reviews existing DevAgent workflows and designs a `devagent full-cycle` orchestrator workflow that can execute a complete task lifecycle from initial idea to completion in a single prompt, with intelligent routing based on task complexity and full documentation of the thought process.

## Current Workflow Analysis

### Workflow Execution Models

| Workflow | Execution Model | Stopping Behavior | Complexity | Key Characteristics |
|----------|----------------|-------------------|------------|-------------------|
| `new-task` | Immediate | Stops after scaffolding | Simple | Creates directory structure only, no file edits |
| `clarify-task` | Interactive (multi-turn) | Stops after each Q&A batch | Complex | Progressive disclosure, 2-3 questions per turn |
| `research` | Immediate | Completes research packet | Medium | Evidence gathering, creates dated research files |
| `create-plan` | Immediate | Completes plan document | Medium | Synthesizes research into implementation plan |
| `implement-plan` | Sequential (with pauses) | Pauses between tasks by default | Complex | Executes coding tasks, updates AGENTS.md |
| `mark-task-complete` | Immediate | Completes move operation | Simple | Moves task to completed/ directory |

### Workflow Dependencies & Sequencing

**Standard Sequence:**
```
new-task → [clarify-task] → [research] → create-plan → implement-plan → mark-task-complete
```

**Key Observations:**
1. **`new-task`** is always the entry point (creates task hub structure)
2. **`clarify-task`** is optional (interactive, can be skipped for simple tasks)
3. **`research`** is optional (may not be needed for straightforward tasks)
4. **`create-plan`** is typically required (converts requirements into implementation tasks)
5. **`implement-plan`** executes the plan (can pause between tasks)
6. **`mark-task-complete`** is the exit point (archives completed work)

### Current Limitations

1. **Manual chaining required:** Each workflow must be invoked separately
2. **No intelligent routing:** User must decide which workflows to run
3. **Context loss between workflows:** Each workflow starts fresh
4. **No end-to-end documentation:** Thought process scattered across artifacts
5. **Multiple stopping points:** Workflows have explicit "STOP" directives
6. **No complexity assessment:** User must manually determine which workflows are needed

## Proposed Solution: `devagent full-cycle`

### Core Concept

A new orchestrator workflow that:
- Takes a task description (simple or complex)
- Assesses task complexity automatically
- Intelligently routes through the workflow chain based on complexity
- Documents the entire thought process and decision-making
- Executes all the way through to completion (unless user requests pause)
- Handles both simple prompts and complex features

### Complexity Assessment Criteria

#### Simple Task Indicators
- Single file/component change
- Clear, unambiguous description
- No user-facing changes or minimal UX impact
- No architectural decisions required
- Examples: "fix typo", "update config", "add validation", "add button to page"

**Workflow Chain:**
```
new-task → research (quick, if needed) → create-plan → implement-plan → mark-task-complete
```

**Skip:**
- `clarify-task` (requirements are clear from description)

#### Standard Task Indicators
- Multiple files/components affected
- User-facing changes
- Some architectural decisions
- May need requirement validation
- Examples: "add login form", "implement search", "create API endpoint", "add authentication"

**Workflow Chain:**
```
new-task → clarify-task → research → create-plan → implement-plan → mark-task-complete
```

**Include:**
- `clarify-task` (to validate requirements and surface assumptions)

#### Complex Task Indicators
- Major feature or initiative
- Multiple stakeholders
- Significant architectural impact
- Solution space exploration needed
- Examples: "redesign dashboard", "build new module", "migrate to new framework", "redesign user experience"

**Workflow Chain:**
```
new-task → clarify-task → research → [brainstorm] → create-plan → implement-plan → mark-task-complete
```

**Include:**
- `brainstorm` (if solution space needs exploration)
- Extended `research` phase
- Multiple `clarify-task` iterations if needed

### Workflow Design Structure

#### Mission
- **Primary goal:** Execute a complete task lifecycle from initial idea to completion, intelligently routing through appropriate workflows based on task complexity, with full documentation of thought process and decisions.
- **Boundaries / non-goals:** 
  - Do not skip critical validation steps for complex tasks
  - Do not proceed without user confirmation for high-risk changes
  - Do not commit changes automatically
  - Do not bypass user-specified pause points
- **Success signals:** 
  - Task completed and moved to `completed/`
  - All artifacts documented
  - Thought process traceable
  - User can review all decisions made

#### Execution Model
- **Autonomous execution:** Execute workflows sequentially without stopping between workflows (unless blocking error or explicit user pause requested)
- **Intelligent routing:** Assess task complexity and route through appropriate workflow chain
- **Progress documentation:** Create a "Full Cycle Log" that documents all decisions, workflow selections, and thought process
- **User control:** Allow user to specify workflow preferences or pause points via input context

#### Inputs
- **Required:** Task description (title or 1-3 sentences)
- **Optional:** 
  - Workflow preferences (e.g., "skip clarify-task", "pause after plan")
  - Complexity hint (e.g., "simple", "standard", "complex")
  - Pause points (e.g., "review after plan", "confirm before implementation")
  - Task metadata (owners, tags, issue slug)

#### Workflow Steps

1. **Task Analysis & Complexity Assessment**
   - Parse task description
   - Assess complexity using decision criteria
   - Determine workflow chain
   - Create Full Cycle Log document
   - Document assessment rationale

2. **Execute Workflow Chain**
   - For each workflow in chain:
     - Document workflow selection rationale in Full Cycle Log
     - Execute workflow (following its execution directive)
     - Capture outputs and decisions
     - Update Full Cycle Log with results
     - Continue to next workflow (unless blocking error or user pause)

3. **Completion & Documentation**
   - Finalize Full Cycle Log
   - Move task to completed (via mark-task-complete)
   - Generate summary report

### Full Cycle Log Structure

**Location:** `.devagent/workspace/tasks/{status}/<task_prefix>_<task_slug>/full-cycle-log.md`

**Template:**
```markdown
# Full Cycle Log: [Task Name]

**Date:** YYYY-MM-DD
**Task Description:** [Original description]
**Complexity Assessment:** Simple / Standard / Complex
**Selected Workflow Chain:** [List of workflows]
**Total Execution Time:** [if tracked]

## Complexity Assessment

**Rationale:** [Why this complexity level was selected]
**Key Indicators:**
- [Indicator 1]
- [Indicator 2]

## Workflow Execution

### 1. new-task
**Rationale:** [Why this workflow was selected]
**Key Decisions:**
- [Decision 1]
- [Decision 2]
**Artifacts Created:**
- [Path to artifacts]
**Next:** [Next workflow]

### 2. [Next Workflow]
[Similar structure for each workflow]

## Final Summary
- **Completed Work:** [Summary]
- **Artifacts:** [List of all artifacts]
- **Key Decisions:** [Summary of major decisions]
- **Open Questions:** [If any]
- **Lessons Learned:** [If any]
```

## Implementation Approach

### Recommended: New Orchestrator Workflow

Create a new workflow file: `.devagent/core/workflows/full-cycle.md`

**Pros:**
- Clean separation of concerns
- Reusable orchestrator pattern
- Can be invoked as `devagent full-cycle`
- Maintains existing workflow independence
- Follows existing workflow naming conventions

**Cons:**
- Requires new workflow file
- Need to handle workflow invocation semantics
- Must coordinate between multiple workflows

### Workflow Invocation Strategy

**Option 1: Direct Execution (Recommended)**
- Full-cycle workflow directly executes each workflow in sequence
- Reads workflow definitions and follows their execution directives
- Maintains context between workflows through Full Cycle Log

**Option 2: Command Chaining**
- Full-cycle workflow generates command sequence
- User executes commands (not fully automated)
- Less ideal for "single prompt" goal

**Recommendation:** Option 1 - Direct execution maintains the "single prompt" goal and provides seamless experience.

## Example Prompts & Expected Behavior

### Simple Task Example
```
/devagent full-cycle

Task: Add a "Copy" button to the user profile page that copies the user's ID to clipboard.
```

**Expected behavior:**
- Assesses as "simple"
- Routes: new-task → research (quick) → create-plan → implement-plan → mark-task-complete
- Skips clarify-task
- Completes in single execution
- Creates Full Cycle Log documenting all steps

### Standard Task Example
```
/devagent full-cycle

Task: Implement user authentication with email/password login and JWT tokens. Include password reset flow.

Pause after: plan (I want to review the plan before implementation)
```

**Expected behavior:**
- Assesses as "standard"
- Routes: new-task → clarify-task → research → create-plan → [PAUSE] → implement-plan → mark-task-complete
- Includes clarify-task for requirement validation
- Pauses after plan as requested
- Completes after user approval
- Full Cycle Log captures all decisions

### Complex Task Example
```
/devagent full-cycle

Task: Redesign the user dashboard to improve engagement metrics. Current dashboard has low user retention.

Complexity: complex
```

**Expected behavior:**
- Assesses as "complex"
- Routes: new-task → clarify-task → research → brainstorm → create-plan → implement-plan → mark-task-complete
- Includes brainstorm for solution exploration
- Extended research phase
- Full documentation throughout
- Full Cycle Log provides complete traceability

## Design Decisions

### 1. Complexity Assessment
**Decision:** Use heuristic-based assessment with user override capability
**Rationale:** Most tasks can be automatically classified, but users should be able to override if needed

### 2. Pause Points
**Decision:** Execute to completion by default, but honor explicit pause requests
**Rationale:** Balances automation with user control

### 3. Workflow Failure Handling
**Decision:** Pause on blocking errors, document in Full Cycle Log, report to user, allow resumption
**Rationale:** Maintains traceability and allows recovery

### 4. Full Cycle Log Detail Level
**Decision:** Document key decisions and rationale, link to detailed artifacts
**Rationale:** Provides traceability without duplicating all content

### 5. Individual Workflow Availability
**Decision:** Keep individual workflows available; full-cycle is an option for complete automation
**Rationale:** Maintains flexibility for users who want to run workflows individually

## Open Questions

1. **Should full-cycle always execute to completion, or should it respect pause points by default?**
   - **Recommendation:** Execute to completion by default, but honor explicit pause requests

2. **How should we handle workflow failures mid-cycle?**
   - **Recommendation:** Pause, document error in Full Cycle Log, report to user, allow resumption

3. **Should full-cycle be the default entry point, or should individual workflows still be available?**
   - **Recommendation:** Keep individual workflows available; full-cycle is an option for complete automation

4. **How detailed should the Full Cycle Log be?**
   - **Recommendation:** Document key decisions and rationale, link to detailed artifacts

5. **How should full-cycle handle interactive workflows like clarify-task?**
   - **Recommendation:** Execute clarify-task in full-cycle context, but maintain interactive nature; document Q&A in Full Cycle Log

## Next Steps

1. **Create workflow file:** `.devagent/core/workflows/full-cycle.md`
2. **Create command file:** `.agents/commands/full-cycle.md`
3. **Update AGENTS.md:** Add full-cycle to workflow roster
4. **Create Full Cycle Log template:** Add to `.devagent/core/templates/`
5. **Test with examples:** Simple, standard, and complex tasks
6. **Iterate based on feedback**

## References

- Research: `.devagent/workspace/research/2025-01-27_full-cycle-workflow-analysis.md` (2025-01-27)
- Workflow Definitions: `.devagent/core/workflows/`
- Workflow Roster: `.devagent/core/AGENTS.md`
- Product Mission: `.devagent/workspace/product/mission.md`