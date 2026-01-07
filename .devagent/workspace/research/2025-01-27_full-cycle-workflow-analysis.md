# Full-Cycle Workflow Analysis & Proposal

**Date:** 2025-01-27  
**Purpose:** Analyze existing workflows and design a complete end-to-end workflow process that can take a task from initial idea to completion in a single prompt, with full documentation of the thought process and plan.

## Current Workflow Chain Analysis

### Existing Workflow Sequence

The current DevAgent workflow system follows this typical sequence:

1. **`devagent new-task`** - Scaffolds task hub (stops after scaffolding)
2. **`devagent clarify-task`** - Validates requirements (interactive, optional for simple tasks)
3. **`devagent research`** - Gathers evidence and references (may be needed)
4. **`devagent create-plan`** - Creates implementation plan
5. **`devagent implement-plan`** - Executes the plan (coding work)
6. **`devagent mark-task-complete`** - Moves task to completed

### Workflow Characteristics

| Workflow | Execution Model | Stopping Behavior | Complexity |
|----------|----------------|-------------------|------------|
| `new-task` | Immediate | Stops after scaffolding | Simple |
| `clarify-task` | Interactive (multi-turn) | Stops after each Q&A batch | Complex |
| `research` | Immediate | Completes research packet | Medium |
| `create-plan` | Immediate | Completes plan document | Medium |
| `implement-plan` | Sequential (with pauses) | Pauses between tasks by default | Complex |
| `mark-task-complete` | Immediate | Completes move operation | Simple |

### Current Limitations

1. **Manual chaining required:** Each workflow must be invoked separately
2. **No intelligent routing:** User must decide which workflows to run
3. **Context loss between workflows:** Each workflow starts fresh
4. **No end-to-end documentation:** Thought process scattered across artifacts
5. **Stopping points:** Multiple workflows have explicit "STOP" directives

## Proposed Solution: `devagent full-cycle`

### Concept

A new orchestrator workflow that:
- Takes a task description (simple or complex)
- Intelligently routes through the workflow chain based on task complexity
- Documents the entire thought process and decision-making
- Executes all the way through to completion
- Handles both simple prompts and complex features

### Workflow Selection Logic

#### Simple Task Path (Minimal Workflow)
For tasks that are straightforward (e.g., "add a button", "fix a bug", "update documentation"):

```
new-task → research (if needed) → create-plan → implement-plan → mark-task-complete
```

**Skip:**
- `clarify-task` (requirements are clear from description)

#### Standard Task Path (Full Workflow)
For tasks that need validation (e.g., "add user authentication", "implement search feature"):

```
new-task → clarify-task → research → create-plan → implement-plan → mark-task-complete
```

**Include:**
- `clarify-task` (to validate requirements and surface assumptions)

#### Complex Task Path (Extended Workflow)
For major features or initiatives (e.g., "redesign the user dashboard", "build API v2"):

```
new-task → clarify-task → research → brainstorm (if needed) → create-plan → implement-plan → mark-task-complete
```

**Include:**
- `brainstorm` (if solution space needs exploration)
- Extended `research` phase
- Multiple `clarify-task` iterations if needed

### Decision Criteria

**Task Complexity Assessment:**

1. **Simple Task Indicators:**
   - Single file/component change
   - Clear, unambiguous description
   - No user-facing changes or minimal UX impact
   - No architectural decisions required
   - Examples: "fix typo", "update config", "add validation"

2. **Standard Task Indicators:**
   - Multiple files/components affected
   - User-facing changes
   - Some architectural decisions
   - May need requirement validation
   - Examples: "add login form", "implement search", "create API endpoint"

3. **Complex Task Indicators:**
   - Major feature or initiative
   - Multiple stakeholders
   - Significant architectural impact
   - Solution space exploration needed
   - Examples: "redesign dashboard", "build new module", "migrate to new framework"

### Proposed Workflow Structure

```markdown
# Full Cycle

## Mission
- Primary goal: Execute a complete task lifecycle from initial idea to completion, intelligently routing through appropriate workflows based on task complexity, with full documentation of thought process and decisions.
- Boundaries / non-goals: Do not skip critical validation steps for complex tasks, do not proceed without user confirmation for high-risk changes, do not commit changes automatically.
- Success signals: Task completed and moved to `completed/`, all artifacts documented, thought process traceable, user can review all decisions made.

## Execution Model
- **Autonomous execution:** Execute workflows sequentially without stopping between workflows (unless blocking error or explicit user pause requested)
- **Intelligent routing:** Assess task complexity and route through appropriate workflow chain
- **Progress documentation:** Create a "Full Cycle Log" that documents all decisions, workflow selections, and thought process
- **User control:** Allow user to specify workflow preferences or pause points via input context

## Inputs
- Required: Task description (title or 1-3 sentences)
- Optional: 
  - Workflow preferences (e.g., "skip clarify-task", "pause after plan")
  - Complexity hint (e.g., "simple", "standard", "complex")
  - Pause points (e.g., "review after plan", "confirm before implementation")
  - Task metadata (owners, tags, issue slug)

## Workflow

1. **Task Analysis & Complexity Assessment**
   - Parse task description
   - Assess complexity using decision criteria
   - Determine workflow chain
   - Create Full Cycle Log document

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

## Full Cycle Log Structure

- **Task Overview:** Original description, complexity assessment, selected workflow chain
- **Workflow Execution Log:** For each workflow:
  - Workflow name and rationale
  - Key decisions made
  - Artifacts created
  - Blockers encountered (if any)
  - Next workflow decision
- **Final Summary:** Completed work, artifacts, decisions, any open questions

## Adaptation Notes
- **Simple tasks:** Fast-track through minimal workflow chain
- **Standard tasks:** Include clarify-task for requirement validation
- **Complex tasks:** Extended workflow with brainstorm if needed
- **User overrides:** Honor explicit workflow preferences from input
- **Pause points:** Respect user-specified pause points (e.g., "review after plan")
```

## Implementation Approach

### Option 1: New Orchestrator Workflow (Recommended)

Create a new workflow file: `.devagent/core/workflows/full-cycle.md`

**Pros:**
- Clean separation of concerns
- Reusable orchestrator pattern
- Can be invoked as `devagent full-cycle`
- Maintains existing workflow independence

**Cons:**
- Requires new workflow file
- Need to handle workflow invocation semantics

### Option 2: Enhanced `new-task` Workflow

Modify `new-task` to optionally continue through the chain.

**Pros:**
- Single entry point
- No new workflow needed

**Cons:**
- Violates single-responsibility principle
- `new-task` currently has explicit "STOP" directive
- Would require significant refactoring

### Option 3: Command-Level Orchestration

Create a new command file that orchestrates workflows.

**Pros:**
- Keeps workflows independent
- Command-level logic

**Cons:**
- Commands are meant to reference workflows, not orchestrate
- Less discoverable

## Recommended Approach: Option 1

Create `devagent full-cycle` as a new orchestrator workflow that:

1. **Assesses task complexity** using clear criteria
2. **Selects appropriate workflow chain** based on complexity
3. **Executes workflows sequentially** without stopping (unless blocking error)
4. **Documents everything** in a Full Cycle Log
5. **Respects user preferences** (pause points, workflow overrides)

## Example Prompts

### Simple Task
```
/devagent full-cycle

Task: Add a "Copy" button to the user profile page that copies the user's ID to clipboard.
```

**Expected behavior:**
- Assesses as "simple"
- Routes: new-task → research (quick) → create-plan → implement-plan → mark-task-complete
- Skips clarify-task
- Completes in single execution

### Standard Task
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

### Complex Task
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

## Documentation Requirements

### Full Cycle Log Template

```markdown
# Full Cycle Log: [Task Name]

**Date:** YYYY-MM-DD
**Task Description:** [Original description]
**Complexity Assessment:** Simple / Standard / Complex
**Selected Workflow Chain:** [List of workflows]

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
[Similar structure]

## Final Summary
- **Completed Work:** [Summary]
- **Artifacts:** [List of all artifacts]
- **Key Decisions:** [Summary of major decisions]
- **Open Questions:** [If any]
```

## Next Steps

1. **Create workflow file:** `.devagent/core/workflows/full-cycle.md`
2. **Create command file:** `.agents/commands/full-cycle.md`
3. **Update AGENTS.md:** Add full-cycle to workflow roster
4. **Test with examples:** Simple, standard, and complex tasks
5. **Iterate based on feedback**

## Questions for Discussion

1. **Should full-cycle always execute to completion, or should it respect pause points by default?**
   - Recommendation: Execute to completion by default, but honor explicit pause requests

2. **How should we handle workflow failures mid-cycle?**
   - Recommendation: Pause, document error in Full Cycle Log, report to user, allow resumption

3. **Should full-cycle be the default entry point, or should individual workflows still be available?**
   - Recommendation: Keep individual workflows available; full-cycle is an option for complete automation

4. **How detailed should the Full Cycle Log be?**
   - Recommendation: Document key decisions and rationale, link to detailed artifacts
