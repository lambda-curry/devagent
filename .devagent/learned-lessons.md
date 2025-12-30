# DevAgent Learned Lessons: First-Time User Experience

**Author:** Antony Duran  
**Date:** 2025-11-13  
**Context:** First implementation using DevAgent workflows for "Simple Datatable to View Data" feature

---

## Table of Contents

1. [Initial Impressions & Confusion](#initial-impressions--confusion)
2. [How Workflows Work in Practice](#how-workflows-work-in-practice)
3. [The Iterative Process & DEVELOPER-GUIDE.md](#the-iterative-process--developer-guidemd)
4. [Common Questions & Solutions](#common-questions--solutions)
5. [Best Practices & Recommendations](#best-practices--recommendations)

---

## Initial Impressions & Confusion

### The Overwhelming First Look

When first encountering DevAgent, the structure can feel overwhelming. There are multiple directories (`.devagent/core/`, `.devagent/workspace/`, `.agents/commands/`), workflows, templates, and documentation scattered across different locations.

**Key Confusion Points:**
- **`.agents/commands/` vs `.devagent/core/workflows/`** — What's the difference? How do they relate?
- **Where to start?** — The `.devagent/core/README.md` exists but isn't immediately obvious
- **Workflow vs Command** — Are these the same thing? How do they interact?

### The Discovery Process

Through actual usage, the structure became clearer:
- **`.devagent/core/`** = Portable agent kit (workflows, templates) that can be copied to any project
- **`.devagent/workspace/`** = Project-specific artifacts (features, research, specs, decisions)
- **`.agents/commands/`** = Command files that trigger workflows (symlinked to `.cursor/commands/`)

**The Missing Piece:** A high-level "Getting Started" guide that explains:
- The relationship between commands and workflows
- Where to start for different types of work
- How workflows chain together
- A glossary of terms

---

## How Workflows Work in Practice

### The Actual Workflow Sequence

Based on the datatable feature implementation, here's how workflows were used in practice:

```
1. devagent new-feature "Add datatable to view dataset data"
   → Creates feature hub with AGENTS.md and folder structure
   → Recommends next steps (research, clarify)

2. devagent research "table components and data access patterns"
   → Investigates codebase, finds existing patterns
   → Creates research packet with findings
   → Identifies gaps requiring clarification

3. devagent clarify-feature
   → Validates requirements across 8 dimensions
   → Creates clarification packet
   → Identifies missing information (4/8 complete initially)

4. devagent clarify-feature (re-run after gap-fill)
   → Updates clarification packet with new information
   → Improves completeness (7/8 complete)

5. devagent create-plan
   → Synthesizes research + clarification into comprehensive plan
   → Creates plan document with product context and implementation tasks
   → Note: This workflow consolidates the previous create-spec and plan-tasks workflows

6. devagent implement-plan
   → Executes tasks from plan document sequentially
   → Tracks progress in AGENTS.md automatically
   → Validates dependencies before execution

7. devagent clarify-feature (re-run for major direction change)
   → Scope changed: migrate to @lambdacurry/forms
   → Creates comprehensive clarification document
   → Updates completeness (8/8 complete)

8. devagent create-plan (re-run for migration)
   → Creates new plan reflecting migration requirements

9. devagent implement-plan (re-run for migration)
   → Executes migration tasks from updated plan
```

### Key Insights

**1. Workflows Can Be Re-Run**
- If something changes, you can re-call the same command to update previous documents
- This is powerful but can create confusion about which document is "current"
- **Solution:** Use clear versioning in filenames (e.g., `plan-v2.md`) and update `AGENTS.md` references

**2. Workflows Chain Naturally**
- Each workflow produces artifacts that feed into the next
- Research → Clarification → Plan → Implementation
- **But:** You can skip steps for simple features (research → create-plan → implement-plan)
- **Note:** The workflow has been simplified - `create-spec` and `plan-tasks` were consolidated into `create-plan`

**3. Iteration is Expected**
- The datatable feature went through multiple clarification cycles
- Initial implementation (TanStack Table) was later migrated to @lambdacurry/forms
- **Lesson:** Don't be afraid to re-run workflows when scope changes

**4. Workflows Don't Execute Automatically**
- After `/new-feature`, you must manually call the next workflow
- Workflows are **tools**, not autonomous agents
- **You remain the coordinator** — workflows don't talk to each other

---

## The Iterative Process & DEVELOPER-GUIDE.md

### Why DEVELOPER-GUIDE.md Was Created

After the first few workflow executions, several issues emerged:

1. **Lost after research** — Research recommended `/clarify-feature`, but it didn't ask clarifying questions as expected
2. **Unclear next steps** — After each workflow, it wasn't always clear what to do next
3. **No examples** — Workflow descriptions were abstract; real examples were needed
4. **Gap handling** — When research or clarification found gaps, the process wasn't clear

### How DEVELOPER-GUIDE.md Helped

The DEVELOPER-GUIDE.md was created to:
- **Provide step-by-step examples** — Real interactions showing how workflows chain together
- **Explain gap handling** — What to do when research finds `[NEEDS CLARIFICATION]` tags
- **Clarify decision points** — When to proceed with assumptions vs. filling gaps
- **Show iteration patterns** — How to handle scope changes and re-runs

### The Iterative Learning Process

```
Initial Confusion
    ↓
First Workflow Execution (/new-feature)
    ↓
Second Workflow Execution (/research)
    ↓
Confusion: "What do I do with gaps?"
    ↓
Third Workflow Execution (/clarify-feature)
    ↓
Confusion: "It didn't ask questions?"
    ↓
Manual Clarification (gap-fill document)
    ↓
Re-run /clarify-feature
    ↓
Continue with /create-spec
    ↓
Realization: "I need examples and guidance"
    ↓
Create DEVELOPER-GUIDE.md
    ↓
Use DEVELOPER-GUIDE.md for remaining workflows
    ↓
Much smoother experience
```

**Key Takeaway:** The DEVELOPER-GUIDE.md emerged from **actual pain points** during first-time usage. It's not theoretical—it's a practical guide based on real experience.

---

## Common Questions & Solutions

### Q1: How do I feed `/new-feature` output to `/research`?

**The Question:** After `/new-feature` creates a feature hub, how do I pass that context to `/research`?

**Solution A: Reference the Feature Hub Path**
```
You: devagent research "What table components exist in the codebase? 
     How do we query organization database tables?"
     
     Feature: .devagent/workspace/features/active/2025-11-06_simple-datatable-to-view-data/
```

**Solution B: Reference the AGENTS.md File**
```
You: devagent research "table components and data access patterns"
     
     Context: See .devagent/workspace/features/active/2025-11-06_simple-datatable-to-view-data/AGENTS.md
```

**Best Practice:** Always include the feature hub path or `AGENTS.md` reference when chaining workflows. Workflows read from the workspace, but explicit references help ensure context is captured.

---

### Q2: How do I resume a task after switching contexts?

**The Question:** If I stop working and come back later, how do I let the LLM know what to continue working on?

**Solution A: Use `devagent review-progress`**
```
You: devagent review-progress
     Plan: plan/2025-11-06_datatable-plan.md
     Completed: Task 1 (DataTable component created)
     In Progress: Task 2 (Server pagination endpoint)
     Blocked: Need clarification on pagination API format
```

This creates a checkpoint file and updates `AGENTS.md` with progress state.

**Solution B: Reference AGENTS.md and Plan Document**
```
You: [Open feature hub AGENTS.md]
     [Review "Progress Log" and "Implementation Checklist"]
     [Open plan document]
     
     Continue from Task 2: Implement server-side pagination endpoint
     See: plan/2025-11-06_datatable-plan.md, Task 2
     Context: Feature hub AGENTS.md shows Task 1 complete
```

**Best Practice:** Use `devagent review-progress` when stopping work. When resuming, reference both `AGENTS.md` (for overall progress) and the plan document (for task details). If using `devagent implement-plan`, it will automatically resume from where it left off.

---

### Q3: What if I disagree with research findings?

**The Question:** After `/research` execution, I don't agree with the outcome or proposed solution. What's the proper way to proceed?

**Solution A: Document Disagreement in Clarification**
```
You: devagent clarify-feature
     
     Note: Research recommended TanStack Table, but I want to use 
     @lambdacurry/forms instead. See research/2025-11-06_datatable-research.md 
     for historical record, but we're proceeding with @lambdacurry/forms.
```

The clarification packet will document this decision, and future workflows will use the clarified approach.

**Solution B: Re-run Research with Different Focus**
```
You: devagent research "How do we implement data tables with @lambdacurry/forms?
     What are the server-side pagination patterns?"
     
     Note: Previous research focused on TanStack Table (see 
     research/2025-11-06_datatable-research.md), but we're exploring 
     @lambdacurry/forms as an alternative.
```

This creates a new research packet that can be referenced in the spec.

**Best Practice:** Research packets are **historical records**. If you disagree, either:
1. Document the disagreement in clarification (recommended for stakeholder decisions)
2. Create new research with different focus (recommended for technical alternatives)
3. Keep old research for historical context, but proceed with clarified approach

---

### Q4: How does `devagent implement-plan` work?

**The Question:** Does `devagent implement-plan` execute all tasks automatically, or do I need to run it multiple times?

**Answer:** `devagent implement-plan` **executes tasks automatically** from the plan document. It:
- Parses the plan document to extract implementation tasks
- Validates task dependencies against AGENTS.md
- Executes tasks sequentially in dependency order
- Updates AGENTS.md after each task completion
- Skips non-coding tasks gracefully
- Pauses only for truly ambiguous decisions or blockers

**Usage Pattern:**
```
1. devagent create-plan (creates plan/2025-11-06_feature-plan.md)
2. devagent implement-plan (executes all tasks from plan)
3. Review AGENTS.md to see progress
4. Manually validate: bun run lint && bun run typecheck && bun run test
```

**Best Practice:** The workflow executes as much as possible without stopping. Review progress in AGENTS.md after execution. For partial execution, you can specify a task range (e.g., "tasks 1-3").

---

### Q5: How do I handle major direction changes?

**The Question:** What if the current feature state is "good enough" but requirements change significantly?

**Solution A: Start New Feature (Recommended if Current State is Good)**
```
Current State: TanStack Table implementation complete and functional
New Requirement: Migrate to @lambdacurry/forms

Decision: Keep current feature as-is (it's functional)
          Create new feature: "Migrate datatable to @lambdacurry/forms"
          New feature can reference old feature's artifacts
```

**Solution B: Re-run Workflows in Current Feature (Recommended if Current State Needs Changes)**
```
Current State: TanStack Table implementation, but needs major refactor
New Requirement: Migrate to @lambdacurry/forms

Decision: Re-run devagent clarify-feature (update scope)
          Re-run devagent create-plan (create v2 plan)
          Re-run devagent implement-plan (execute migration tasks)
```

**Decision Criteria:**
- **Current state is functional and acceptable?** → Start new feature
- **Current state needs major changes anyway?** → Re-run workflows in current feature
- **Unclear?** → Document decision in `AGENTS.md` Key Decisions section

**Best Practice:** For the datatable feature, we used **Solution B** because:
1. The TanStack Table implementation was complete but needed migration
2. The migration was a natural evolution, not a separate feature
3. Re-running workflows kept all context in one place

---

### Q6: Should I use best models for planning and auto for implementation?

**The Question:** Is DevAgent designed to work with different models for planning vs. implementation?

**Answer:** DevAgent workflows are **model-agnostic**. They work with any LLM that can:
- Follow structured instructions
- Read and write markdown files
- Reference context from workspace

**Current Usage Pattern:**
- **Planning workflows** (`devagent research`, `devagent create-plan`) → Use best available model (e.g., Claude Sonnet 4.5)
- **Implementation** (`devagent implement-plan`) → Use best available model for automated execution

**Potential Enhancement:**
- **Background agents** (Codegen) → Can run implementation tasks asynchronously
- See `.devagent/core/workflows/codegen/run-codegen-background-agent.md` for details

**Best Practice:** 
- Use best models for **planning** (research, spec, tasks) — these benefit from reasoning
- Use auto or best models for **implementation** — depends on token budget and complexity
- Consider background agents for **independent tasks** that can run in parallel

---

## Best Practices & Recommendations

### 1. Start with `devagent new-feature`, Then Research

**Don't skip the feature hub.** Even for simple features, creating a feature hub provides:
- Centralized progress tracking (`AGENTS.md`)
- Organized artifact storage (research/, clarification/, plan/)
- Clear ownership and status

**Workflow:**
```
devagent new-feature "Brief description"
  ↓
devagent research "Specific questions"
  ↓
[Continue based on complexity]
```

### 2. Always Reference Feature Hub in Workflows

When chaining workflows, always include the feature hub path:

```
devagent research "question"
  Feature: .devagent/workspace/features/active/YYYY-MM-DD_feature-slug/
```

This ensures workflows can:
- Read existing artifacts (research, clarification, spec)
- Update `AGENTS.md` with progress
- Maintain context across workflow executions

### 3. Use AGENTS.md as Your North Star

`AGENTS.md` is the **single source of truth** for feature progress:
- **Progress Log** — Chronological history of what happened
- **Implementation Checklist** — What's done, in progress, or pending
- **Key Decisions** — Important choices with rationale
- **References** — Links to all artifacts (research, spec, tasks)

**Check `AGENTS.md` before:**
- Starting a new workflow
- Resuming work after context switch
- Making scope changes
- Creating new artifacts

### 4. Document Assumptions Explicitly

When proceeding with incomplete information:
1. **Document in clarification packet** — Mark as `[ASSUMPTION]` with validation plan
2. **Update AGENTS.md** — Add to Key Decisions section
3. **Include in spec** — Document in Risks & Open Questions section
4. **Schedule validation** — Set a date/owner for assumption validation

**Never proceed with undocumented assumptions.**

### 5. Re-Run Workflows When Scope Changes

If requirements change significantly:
1. **Re-run `devagent clarify-feature`** — Update requirements and completeness
2. **Re-run `devagent create-plan`** — Create new plan version (use `-v2` suffix)
3. **Re-run `devagent implement-plan`** — Execute updated tasks
4. **Update `AGENTS.md`** — Document the change in Progress Log

**Don't try to manually update old artifacts.** Re-running workflows ensures consistency.

### 6. Use `devagent implement-plan` for Automated Execution

The `devagent implement-plan` workflow executes tasks automatically:
1. Parses plan document for implementation tasks
2. Validates dependencies before execution
3. Executes tasks sequentially
4. Updates AGENTS.md after each task
5. Pauses only for blockers or ambiguous decisions

**For manual implementation:** You can still work through tasks manually by referencing the plan document, but `devagent implement-plan` automates the process.

### 7. Use `/review-progress` for Context Switches

When stopping work (end of day, switching features, interruptions):
```
devagent review-progress
  Plan: plan/YYYY-MM-DD_feature-plan.md
  Completed: Task 1, 2
  In Progress: Task 3 (50% complete)
  Blocked: Need clarification on API format
```

This creates a checkpoint for easy resumption. When resuming, `devagent implement-plan` will automatically continue from where it left off.

### 8. Keep Artifacts Organized

**File Naming:**
- Research: `research/YYYY-MM-DD_topic.md`
- Clarification: `clarification/YYYY-MM-DD_description.md`
- Plan: `plan/YYYY-MM-DD_feature-plan.md` (use `-v2` for major revisions)

**Versioning:**
- Major revisions: Use `-v2`, `-v3` suffixes
- Minor updates: Re-run workflow (overwrites old file, but history in `AGENTS.md`)

### 9. Validate Early and Often

After `devagent implement-plan` execution or manual implementation:
```
bun run lint && bun run typecheck && bun run test
```

This runs:
- `bun run lint` — Linting errors
- `bun run typecheck` — TypeScript errors
- `bun run test` — Test failures

**Fix errors immediately** before moving to the next task. Note: There is no `/validate-code` workflow - validation is done manually.

### 10. Don't Be Afraid to Iterate

The datatable feature went through:
- Initial research → TanStack Table approach
- Implementation → TanStack Table complete
- Scope change → Migrate to @lambdacurry/forms
- Re-clarification → Updated requirements
- Re-plan → v2 plan document
- Re-implementation → Migration tasks executed

**This is normal.** Workflows are designed to be re-run when scope changes. The workflow has been simplified - `create-spec` and `plan-tasks` were consolidated into `create-plan`, and `implement-plan` automates task execution.

---

## Summary

### Key Takeaways

1. **DevAgent is a tool, not an autonomous agent** — You remain the coordinator
2. **Workflows can be re-run** — Don't be afraid to iterate when scope changes
3. **AGENTS.md is your north star** — Check it before starting, update it as you progress
4. **Workflows chain naturally** — Research → Clarify → Plan → Implement
5. **Document assumptions** — Never proceed with undocumented assumptions
6. **Use `devagent review-progress`** — For context switches and resumption
7. **Validate early and often** — Run lint/typecheck/test manually after implementation
8. **Iteration is expected** — Complex features will go through multiple cycles
9. **Workflow consolidation** — `create-spec` and `plan-tasks` merged into `create-plan`
10. **Automated implementation** — `devagent implement-plan` executes tasks automatically

### For New Devs

**Start Here:**
1. Read `.devagent/core/README.md` (overview)
2. Read `.devagent/core/AGENTS.md` (workflow roster)
3. Read `DEVELOPER-GUIDE.md` (this document's companion)
4. Start with `devagent new-feature` for your first feature
5. Follow the workflow sequence, referencing examples in DEVELOPER-GUIDE.md

**Common Mistakes to Avoid:**
- Skipping feature hub creation
- Not referencing feature hub in workflow calls
- Using old workflow names (`/create-spec`, `/plan-tasks` instead of `devagent create-plan`)
- Not using `devagent implement-plan` for automated task execution
- Proceeding with undocumented assumptions
- Not checking `AGENTS.md` before starting work

### For DevAgent Creators

**Potential Enhancements:**
1. **Getting Started Guide** — High-level overview explaining commands → workflows relationship
2. **Workflow Chaining Hints** — After each workflow, suggest next steps with ready-to-run commands
3. **Gap Handling Guidance** — When research finds `[NEEDS CLARIFICATION]`, provide clear next steps
4. **Progress Resumption** — Better tooling for resuming work after context switches (partially addressed by `devagent implement-plan`)
5. **Model Recommendations** — Guidance on which models to use for which workflows
6. **Validation Integration** — Consider adding automated validation step to `devagent implement-plan`

---

**Last Updated:** 2025-12-27  
**Related Documents:**
- `DEVELOPER-GUIDE.md` — Comprehensive workflow guide with examples
- `.devagent/core/README.md` — Core kit setup and usage
- `.devagent/core/AGENTS.md` — Workflow roster and reference

