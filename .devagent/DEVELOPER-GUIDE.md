# Developer Guide: Plan-Driven Feature Implementation

This guide walks you through implementing new tasks (including product features) using the DevAgent workflow system. Follow these steps to go from idea to implementation with proper documentation and validation.

**Note:** This guide has been updated to reflect the consolidated workflow system. The previous `create-spec` and `plan-tasks` workflows have been merged into `create-plan`, and `implement-plan` now automates task execution. All workflows use the `devagent [workflow-name]` invocation format.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Workflow Overview](#workflow-overview)
3. [Step-by-Step Process](#step-by-step-process)
4. [Command Reference](#command-reference)
5. [Example Interactions](#example-interactions)
6. [Best Practices](#best-practices)

---

## Quick Start

For a simple task (like a product feature), the typical flow is:

```bash
# 1. Scaffold task hub
devagent new-task "Add user profile editing"

# 2. Research existing patterns
devagent research "How do we handle form editing in this codebase?"

# 3. Clarify requirements
devagent clarify-task

# 4. Create plan (combines spec + task planning)
devagent create-plan

# 5. Implement tasks from plan
devagent implement-plan

# 6. Review progress (optional, when switching contexts)
devagent review-progress
```

---

## Workflow Overview

The DevAgent system uses a structured workflow to ensure tasks are well-researched, clearly specified, and properly implemented. Here's how the pieces fit together:

```
Feature Idea
    ↓
devagent new-task → Scaffold task hub
    ↓
devagent research → Investigate technical patterns & constraints
    ↓
devagent clarify-task → Validate requirements with stakeholders
    ↓
devagent create-plan → Create comprehensive plan (product context + implementation tasks)
    ↓
devagent implement-plan → Execute tasks from plan automatically
    ↓
Complete
```

**For complex tasks/features**, use the full workflow. **For simple enhancements**, you can skip directly to `devagent research` → `devagent create-plan` → `devagent implement-plan`.

---

## Step-by-Step Process

### Step 1: Scaffold Task Hub

**Command:** `devagent new-task`

**When to use:** Start here for any new task or feature, even if it's just an idea.

**Input:** Feature title or 1-2 sentence description

**What it does:**
- Creates task hub at `.devagent/workspace/tasks/YYYY-MM-DD_task-slug/`
- Generates `AGENTS.md` with task metadata
- Creates empty folders: `research/`, `spec/`, `tasks/`

**Example:**

```
You: /new-task "Add datatable to view dataset data"

AI: Creates .devagent/workspace/tasks/2025-11-06_simple-datatable-to-view-data/
     with AGENTS.md and folder structure.
     
     Recommended next steps:
     - /research "table components and data access patterns"
     - /clarify-task
```

**Output:** Task hub directory with `AGENTS.md` tracking progress

---

### Step 2: Research Technical Patterns

**Command:** `devagent research`

**When to use:** Before writing specs, investigate existing code patterns, libraries, and constraints.

**Input:** Research question or problem statement

**What it does:**
- Searches codebase for existing patterns
- Reviews documentation and prior research
- Synthesizes findings into actionable recommendations
- Creates research packet in `research/YYYY-MM-DD_topic.md`

**Example:**

```
You: /research "What table components exist in the codebase? 
     How do we query organization database tables? 
     What libraries are available for data tables?"

AI: Investigates codebase, finds:
     - Existing Table component in ai-elements
     - TanStack Table v8 installed but unused
     - Dataset access via getDatasetById() helper
     - Organization databases accessed via Turso client
     
     Creates: research/2025-11-06_datatable-components-and-tanstack-table-research.md
```

**Output:** Research packet with findings, recommendations, and code references

**⚠️ Handling Unclear Information in Research:**

If research finds gaps or unclear information, the research packet will tag them with `[NEEDS CLARIFICATION]`. Here's how to handle it:

**Example: Research Finds Gaps**

```
You: /research "How do we handle real-time data updates in tables?"

AI: Investigates codebase, finds:
     - No existing real-time update patterns
     - WebSocket infrastructure exists but unused
     - [NEEDS CLARIFICATION] Update frequency requirements?
     - [NEEDS CLARIFICATION] Should updates be push or pull?
     
     Creates: research/2025-11-06_realtime-updates-research.md
     with open questions section
```

**What to do:**
1. Review the research packet's "Risks & Open Questions" section
2. For **clarifiable questions** (stakeholder decisions): Add to clarification packet
3. For **researchable questions** (technical evidence): Run additional research
4. Document assumptions if proceeding without answers

**Example: Following Up on Research Gaps**

```
You: [Review research packet, see open questions]

You: /clarify-task
     [Include research questions in input]

AI: Adds research questions to clarification packet:
     - "What is the required update frequency for real-time data?"
     - "Should updates use WebSocket push or polling?"

You: [Meet with stakeholders, get answers]

You: /research "WebSocket vs polling performance for 1000+ concurrent users"

AI: [Provides technical evidence for decision]
```

---

### Step 3: Clarify Requirements

**Command:** `devagent clarify-task`

**When to use:** When requirements are unclear or you need stakeholder validation.

**Input:** Feature concept (can reference task hub)

**What it does:**
- Validates requirements across 8 dimensions:
  1. Problem Statement
  2. Success Criteria
  3. Users & Stakeholders
  4. Constraints
  5. Scope Boundaries
  6. Solution Principles
  7. Dependencies
  8. Acceptance Criteria
- Creates clarification packet in `clarification/YYYY-MM-DD_initial-clarification.md`
- Identifies gaps requiring stakeholder input

**Example:**

```
You: /clarify-task

AI: Reviews task hub and research, creates clarification packet.
     Identifies gaps:
     - Success metrics not defined
     - Performance benchmarks missing
     - Timeline unclear
     
     Creates: clarification/2025-11-06_initial-clarification.md
     
     Next: Schedule stakeholder meeting to fill gaps
```

**Output:** Clarification packet with validated requirements and identified gaps

**⚠️ Handling Clarification Gaps:**

The clarification packet will show completeness scores (e.g., "4/8 dimensions complete") and identify gaps. Here's how to handle them:

**Example: Clarification Identifies Missing Requirements**

```
You: /clarify-task

AI: Creates clarification packet with:
     ✓ Problem Statement: Complete
     ⚠️ Success Criteria: Partial (missing metrics)
     ✓ Users & Stakeholders: Complete
     ⚠️ Constraints: Partial (timeline unclear)
     ⚠️ Scope Boundaries: Partial (MVP vs full scope unclear)
     ✓ Solution Principles: Complete
     ⚠️ Dependencies: Partial (API availability unknown)
     ⚠️ Acceptance Criteria: Partial (edge cases missing)
     
     Completeness: 3/8 dimensions complete
     Status: More Clarification Needed
     
     Creates: clarification/2025-11-06_initial-clarification.md
```

**What to do next:**

**Option A: Fill Gaps with Stakeholders (Recommended)**

1. Review the clarification packet's "Gaps Requiring Research" and "Gaps Requiring Clarification" sections
2. Prepare specific questions for stakeholders
3. Schedule clarification session or async Q&A
4. Update clarification packet with answers

**Example: Filling Clarification Gaps**

```
You: [Review clarification packet, see gaps]

You: [Email stakeholder with specific questions]
     "Hi [Stakeholder],
     
     I'm clarifying requirements for the datatable feature. 
     Need your input on:
     
     1. Success Metrics: What % of users should use this feature?
        (Current: Not defined)
     
     2. Timeline: Is this needed for V1 launch or can it be post-launch?
        (Current: Unclear)
     
     3. Performance: What's acceptable load time for first page?
        (Current: No benchmark)
     
     See full clarification packet:
     .devagent/workspace/tasks/.../clarification/2025-11-06_initial-clarification.md
     "

[Stakeholder responds with answers]

You: [Update clarification packet manually or re-run clarify-task with new info]

You: /clarify-task
     [Include stakeholder answers in input]

AI: Updates clarification packet with new information:
     ✓ Success Criteria: Complete (50% adoption target)
     ✓ Constraints: Complete (Post-V1 launch acceptable)
     ✓ Scope Boundaries: Complete (MVP scope defined)
     
     Completeness: 6/8 dimensions complete
     Status: Ready for Spec (with assumptions)
```

**Option B: Proceed with Assumptions (For MVP)**

If stakeholders are unavailable or timeline is tight:

1. Document assumptions explicitly in clarification packet
2. Mark assumptions with "Validation Required: Yes"
3. Proceed to spec with clear assumption log
4. Schedule follow-up validation

**Example: Proceeding with Assumptions**

```
You: [Review clarification packet, stakeholders unavailable]

You: [Edit clarification packet manually, add assumptions section]

You: "Assumptions (to be validated):
     - Success metric: 50% adoption (assumed, needs validation)
     - Timeline: Post-V1 acceptable (assumed, needs validation)
     - Performance: < 3s load time (assumed, needs validation)
     "

You: /create-spec
     [Include note about assumptions]

AI: Creates spec with assumptions clearly documented in Risks section
```

**Option C: Escalate Mission Conflicts**

If requirements conflict with product mission:

```
You: /clarify-task

AI: Identifies mission conflict:
     "Feature requires real-time updates, but product mission 
     emphasizes simplicity and low infrastructure costs.
     
     [ESCALATION NEEDED] Mission alignment check required."

You: /update-product-mission
     [Include conflict details]

AI: [Reviews mission, provides guidance on alignment]
```

**Iterative Clarification Cycles:**

For complex tasks/features, expect multiple clarification cycles:

```
Cycle 1: Initial clarification (3/8 complete)
  ↓
[Fill gaps with stakeholders]
  ↓
Cycle 2: Updated clarification (6/8 complete)
  ↓
[Address remaining technical unknowns]
  ↓
Cycle 3: Final clarification (8/8 complete)
  ↓
Ready for spec
```

**Decision Point: When to Proceed?**

- **8/8 dimensions complete:** Proceed to spec
- **6-7/8 dimensions complete:** Proceed with documented assumptions
- **< 6/8 dimensions complete:** Fill gaps before proceeding
- **Mission conflicts:** Escalate before proceeding

---

### Step 4: Create Plan

**Command:** `devagent create-plan`

**When to use:** After research and clarification are complete (or sufficient for MVP).

**Input:** Task hub path and research/clarification references

**What it does:**
- Synthesizes research and requirements into a comprehensive plan
- Combines product context (objectives, users, solution principles) with implementation tasks
- Creates plan document in `plan/YYYY-MM-DD_task-plan.md`
- Links to research and clarification artifacts
- **Note:** This workflow consolidates the previous `create-spec` and `plan-tasks` workflows into a single step

**Example:**

```
You: devagent create-plan

AI: Reads research and clarification packets, creates comprehensive plan:
     - Product Context: Objectives, Users, Solution Principles
     - Implementation Tasks: Concrete files/modules to modify
     - Acceptance Criteria: Behavior-focused validation
     - Risks & Open Questions
     
     Creates: plan/2025-11-06_datatable-plan.md
```

**Output:** Review-ready plan document with both product context and implementation tasks

**⚠️ Handling Plan Gaps:**

If `create-plan` identifies missing information, it will flag gaps and recommend next steps:

**Example: Plan Identifies Missing Requirements**

```
You: devagent create-plan

AI: Reads clarification packet (6/8 complete), identifies gaps:
     
     "Cannot draft Technical Approach section:
     - [MISSING] API endpoint structure unclear
     - [MISSING] Error handling strategy undefined
     - [ASSUMPTION] Using TanStack Table (from research, needs validation)
     
     Recommendation: Run devagent research for API patterns
     or update clarification packet with technical decisions."

You: [Choose one:]
     Option A: devagent research "API endpoint patterns for pagination"
     Option B: [Update clarification packet with technical decisions]
     Option C: [Proceed with assumptions documented in Risks section]
```

**What to do:**
- **For technical gaps:** Run additional research
- **For requirement gaps:** Update clarification packet, re-run clarify-task
- **For assumptions:** Document in plan's Risks section, proceed with validation plan

---

### Step 5: Implement Plan

**Command:** `devagent implement-plan`

**When to use:** After plan is approved, ready to start implementation.

**Input:** Plan document path (or task hub path)

**What it does:**
- Reads implementation tasks from the plan document
- Executes tasks sequentially in dependency order
- Tracks progress in `AGENTS.md` (Implementation Checklist and Progress Log)
- Validates task dependencies before execution
- Skips non-coding tasks gracefully
- Pauses only for truly ambiguous decisions or blockers

**Example:**

```
You: devagent implement-plan
     Plan: plan/2025-11-06_datatable-plan.md

AI: Parses plan document, extracts implementation tasks:
     Task 1: Create DataTable component using TanStack Table
     Task 2: Implement server-side pagination endpoint
     Task 3: Add route for dataset viewing
     Task 4: Write tests for DataTable component
     Task 5: Write tests for pagination endpoint
     
     Executes Task 1: [Creates DataTable component]
     Updates AGENTS.md: Task 1 marked complete
     
     Executes Task 2: [Implements pagination endpoint]
     Updates AGENTS.md: Task 2 marked complete
     
     [Continues with remaining tasks...]
```

**Output:** Implemented code with progress tracked in `AGENTS.md`

**⚠️ Important Notes:**

- **Plan document is read-only** — the workflow does not modify the plan
- **Dependencies are validated** — tasks with incomplete dependencies are skipped
- **Non-coding tasks are skipped** — only coding tasks are executed
- **Progress is tracked** — `AGENTS.md` is updated after each task completion
- **Manual validation** — Run `bun run lint`, `bun run typecheck`, and `bun run test` manually after implementation

---

### Step 6: Review Progress (Optional)

**Command:** `devagent review-progress`

**When to use:** When switching contexts, at end of day, or after interruptions.

**Input:** Task prompt or spec path, current progress state

**What it does:**
- Captures what's completed, in progress, and blocked
- Identifies immediate next steps
- Updates `AGENTS.md` with progress
- Creates checkpoint file for easy resumption

**Example:**

```
You: /review-progress
     Task: tasks/2025-11-06_datatable-component-task.md
     Completed: Task 1.1 (DataTable component created)
     In Progress: Task 1.2 (Server pagination endpoint)
     Blocked: Need clarification on pagination API format

AI: Creates checkpoint:
     ✓ Completed: DataTable component with TanStack Table
     ⏳ In Progress: Pagination endpoint (50% complete)
     ⚠️ Blocked: API format clarification needed
     
     Next Steps:
     1. Clarify pagination API with team
     2. Complete pagination endpoint
     3. Write tests for endpoint
     
     Updates: AGENTS.md with progress log entry
```

**Output:** Progress checkpoint and updated `AGENTS.md`

---

## Command Reference

### Core Commands

| Command | Purpose | Input | Output |
|---------|---------|-------|--------|
| `devagent new-task` | Scaffold task hub | Title/description | Task hub with `AGENTS.md` |
| `devagent research` | Investigate technical patterns | Research question | Research packet |
| `devagent clarify-task` | Validate requirements | Task or feature concept | Clarification packet |
| `devagent create-plan` | Create comprehensive plan | Task hub path | Plan document (product context + tasks) |
| `devagent implement-plan` | Execute implementation tasks | Plan document path | Implemented code + progress updates |
| `devagent review-progress` | Capture progress state | Plan/task + progress | Checkpoint file |
| `devagent review-pr` | Review pull requests | PR number/URL | Review artifact |
| `devagent compare-prs` | Compare multiple PRs | PR numbers/URLs | Comparison artifact |
| `devagent mark-task-complete` | Archive completed task | Task hub path | Moved to completed/ with path updates |

### Additional Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `devagent brainstorm` | Generate idea candidates | Exploring solution space |
| `devagent update-product-mission` | Update product mission | Mission conflicts or updates |
| `devagent update-tech-stack` | Document tech stack | New project or major changes |
| `devagent update-constitution` | Update governance docs | Constitutional changes |
| `devagent build-workflow` | Create new workflows | Adding new agent capabilities |
| `devagent update-devagent` | Update DevAgent core | Syncing with latest DevAgent changes |

---

## Handling Unclear Information: Decision Tree

Use this decision tree when you encounter unclear information:

```
Encounter unclear information
    ↓
Is it a technical question?
    ├─ YES → /research "specific technical question"
    │         ↓
    │    Research provides answer?
    │    ├─ YES → Continue workflow
    │    └─ NO → Document as assumption, proceed with validation plan
    │
    └─ NO → Is it a stakeholder decision?
            ├─ YES → Add to clarification packet
            │         ↓
            │    Stakeholder available?
            │    ├─ YES → Schedule clarification session
            │    │         Fill gaps → Update clarification packet
            │    └─ NO → Document assumption with "Validation Required"
            │            Proceed to spec with assumption log
            │
            └─ NO → Is it a product mission question?
                    ├─ YES → /update-product-mission
                    │         Resolve conflict → Continue workflow
                    └─ NO → Document in Risks & Open Questions
                            Proceed with best-effort assumption
```

---

## Example Interactions

### Example 1: Simple Feature (Quick Path)

**Scenario:** Add a "Copy to Clipboard" button to dataset cards.

```
You: devagent new-task "Add copy dataset ID to clipboard button"

AI: [Creates task hub]

You: devagent research "How do we handle clipboard operations in React? 
     Are there existing copy buttons in the codebase?"

AI: [Finds existing clipboard patterns, creates research packet]

You: devagent create-plan

AI: [Creates plan with implementation tasks]

You: devagent implement-plan

AI: [Executes tasks from plan, implements feature]

You: [Manually run: bun run lint && bun run typecheck && bun run test]
```

**Result:** Feature implemented with minimal overhead.

---

### Example 2: Complex Feature (Full Workflow)

**Scenario:** Build a data visualization dashboard.

```
You: devagent new-task "Create data visualization dashboard"

AI: [Creates task hub]

You: devagent research "What chart libraries are available? 
     How do we structure dashboard layouts? 
     What's the data access pattern for aggregated queries?"

AI: [Investigates, creates comprehensive research packet]

You: devagent clarify-task

AI: [Creates clarification packet, identifies gaps]
     "Need stakeholder input on: chart types, refresh intervals, 
     user permissions"

You: [Meets with stakeholders, fills gaps]

You: devagent create-plan

AI: [Creates comprehensive plan with product context and 8 implementation tasks]

You: devagent implement-plan

AI: [Executes tasks sequentially, tracks progress in AGENTS.md]

You: [Manually validate after each task: bun run lint && bun run typecheck]

You: devagent review-progress

AI: [Captures progress, updates AGENTS.md]
```

**Result:** Well-documented, validated feature with full traceability.

---

### Example 3: Bug Fix (Minimal Workflow)

**Scenario:** Fix form validation error.

```
You: devagent research "Form validation error on email field - 
     what's the current validation logic?"

AI: [Finds validation code, identifies issue]

You: [Fixes bug directly]

You: [Manually run: bun run lint && bun run typecheck && bun run test]
```

**Result:** Quick fix without full workflow overhead.

---

### Example 4: Feature with Unclear Requirements (Iterative Clarification)

**Scenario:** Build export feature, but requirements are vague.

```
You: devagent new-task "Add data export functionality"

AI: [Creates task hub]

You: devagent research "What export formats are supported? 
     How do we handle large file exports?"

AI: Investigates, finds:
     - No existing export functionality
     - [NEEDS CLARIFICATION] Which formats? (CSV, Excel, PDF?)
     - [NEEDS CLARIFICATION] File size limits?
     
     Creates: research/2025-11-06_export-research.md

You: devagent clarify-task

AI: Creates clarification packet:
     ⚠️ Problem Statement: Partial (why export needed?)
     ⚠️ Success Criteria: Missing (adoption target?)
     ⚠️ Scope Boundaries: Unclear (which formats?)
     ⚠️ Constraints: Missing (file size limits?)
     
     Completeness: 2/8 dimensions complete
     Status: More Clarification Needed
     
     Creates: clarification/2025-11-06_initial-clarification.md

You: [Review clarification packet, prepare questions]

You: [Email product manager]
     "Hi [PM],
     
     Clarifying export feature requirements:
     
     1. Why do users need export? (use case)
     2. Which formats? (CSV, Excel, PDF, all?)
     3. File size limits? (10MB, 100MB, unlimited?)
     4. Success metric? (% of users who export)
     
     See: clarification/2025-11-06_initial-clarification.md
     "

[PM responds]:
- Use case: Users need to share data with external tools
- Formats: CSV and Excel (PDF later)
- File size: 50MB limit
- Success: 30% of active users export monthly

You: [Update clarification packet with answers]

You: devagent clarify-task
     [Include PM answers]

AI: Updates clarification packet:
     ✓ Problem Statement: Complete
     ✓ Success Criteria: Complete (30% monthly export rate)
     ✓ Scope Boundaries: Complete (CSV/Excel MVP, PDF later)
     ✓ Constraints: Complete (50MB limit)
     
     Completeness: 6/8 dimensions complete
     Status: Ready for Plan (with assumptions)

You: devagent create-plan

AI: Creates plan with documented assumptions:
     - Technical approach for 50MB file generation
     - CSV/Excel implementation (PDF deferred)
     - Success tracking for export usage
     
     Creates: plan/2025-11-06_export-plan.md
```

**Result:** Iterative clarification cycle fills gaps before spec work.

---

### Example 5: Research Finds Conflicting Information

**Scenario:** Research discovers conflicting patterns in codebase.

```
You: devagent research "How do we handle authentication in API routes?"

AI: Investigates, finds:
     - Pattern A: Uses session cookies (older routes)
     - Pattern B: Uses Bearer tokens (newer routes)
     - [CONFLICT] Two different patterns exist
     - [NEEDS CLARIFICATION] Which pattern should new feature use?
     
     Creates: research/2025-11-06_auth-patterns-research.md
     with conflict documented

You: [Review research, see conflict]

You: devagent clarify-task
     [Include auth pattern question]

AI: Adds to clarification packet:
     ⚠️ Solution Principles: Partial
     - [CONFLICT] Authentication pattern unclear
     - [RECOMMENDATION] Standardize on Bearer tokens (newer pattern)
     - [VALIDATION REQUIRED] Confirm with team lead

You: [Check with team lead]

Team Lead: "Use Bearer tokens for all new features"

You: [Update clarification packet]

You: devagent create-plan

AI: Uses Bearer token pattern in plan
```

**Result:** Conflict resolved through clarification, spec uses consistent pattern.

---

### Example 6: Stakeholder Unavailable (Proceeding with Assumptions)

**Scenario:** Need to proceed, but stakeholder is on vacation.

```
You: devagent clarify-task

AI: Creates clarification packet:
     ⚠️ Success Criteria: Missing (adoption target?)
     ⚠️ Timeline: Missing (deadline?)
     
     Completeness: 6/8 dimensions complete
     Status: More Clarification Needed
     
     Stakeholder: [Unavailable until next week]

You: [Document assumptions in clarification packet]

You: "Assumptions (to be validated with [Stakeholder] on return):
     - Success metric: 40% adoption (industry benchmark)
     - Timeline: Flexible, can adjust post-launch
     - Validation required: Yes
     - Validation date: [Stakeholder return date]
     "

You: devagent create-plan
     [Include note about assumptions]

AI: Creates plan with:
     - Assumptions clearly documented in Risks section
     - Validation plan included
     - Proceeds with best-effort assumptions
     
     Creates: plan/2025-11-06_task-plan.md

[Later, when stakeholder returns]

You: [Review assumptions with stakeholder]

Stakeholder: "Adoption target should be 50%, not 40%"

You: [Update clarification packet]

You: devagent create-plan
     [Re-run with updated requirements]

AI: Updates plan with corrected success metric
```

**Result:** Feature proceeds with documented assumptions, validated later.

---

## Clarification Scenarios & Solutions

### Scenario 1: Research Finds Gaps

**Problem:** Research identifies missing information or unclear patterns.

**Solution:**
1. Review research packet's "Risks & Open Questions" section
2. Classify gaps:
   - **Technical questions** → Additional research
   - **Stakeholder decisions** → Add to clarification
   - **Assumptions** → Document and proceed
3. Update research packet or create follow-up research

**Example:**
```
Research finds: "[NEEDS CLARIFICATION] Update frequency?"
→ Add to clarification packet
→ Get stakeholder answer
→ Update clarification packet
```

---

### Scenario 2: Clarification Incomplete

**Problem:** Clarification packet shows < 6/8 dimensions complete.

**Solution:**
1. Review "Gaps Requiring Clarification" section
2. Prepare specific questions for stakeholders
3. Schedule clarification session (sync or async)
4. Update clarification packet with answers
5. Re-run `/clarify-task` if needed

**Example:**
```
Clarification: 3/8 complete
→ Identify missing dimensions
→ Prepare stakeholder questions
→ Get answers
→ Update clarification packet
→ Re-run clarify-task
→ Now 7/8 complete, proceed with assumption
```

---

### Scenario 3: Stakeholder Conflicts

**Problem:** Different stakeholders have conflicting requirements.

**Solution:**
1. Document both positions in clarification packet
2. Identify decision maker
3. Escalate to decision maker or product mission
4. Do not proceed until resolved

**Example:**
```
Stakeholder A: "Feature must support real-time updates"
Stakeholder B: "Feature should be simple, no real-time"
→ Document both in clarification packet
→ Escalate to product manager (decision maker)
→ Get decision: "MVP without real-time, add later"
→ Update clarification packet
→ Proceed
```

---

### Scenario 4: Mission Conflicts

**Problem:** Requirements conflict with product mission.

**Solution:**
1. Document conflict in clarification packet
2. Escalate to `/update-product-mission`
3. Get alignment decision
4. Update clarification packet
5. Proceed with aligned requirements

**Example:**
```
Requirement: "Real-time updates for all users"
Mission: "Keep infrastructure costs low"
→ Conflict identified
→ Escalate to update-product-mission
→ Decision: "Real-time for premium users only"
→ Update clarification packet
→ Proceed
```

---

### Scenario 5: Technical Unknowns

**Problem:** Technical approach is unclear or risky.

**Solution:**
1. Document unknowns in research or clarification
2. Run additional research for technical evidence
3. Create spike/prototype if needed
4. Document assumptions and risks in spec
5. Proceed with validation plan

**Example:**
```
Unknown: "Can WebSocket handle 10k concurrent connections?"
→ Run research: "WebSocket scalability patterns"
→ Research finds: "Yes, with proper infrastructure"
→ Document in spec with infrastructure requirements
→ Proceed
```

---

### Scenario 6: Timeline Pressure

**Problem:** Need to proceed quickly, but requirements incomplete.

**Solution:**
1. Prioritize Must-have clarification (defer Should/Could)
2. Document assumptions explicitly
3. Mark assumptions as "Validation Required"
4. Proceed to MVP spec with assumption log
5. Schedule follow-up clarification for post-MVP features

**Example:**
```
Timeline: "Need MVP in 2 weeks"
Clarification: 5/8 complete (missing Should/Could items)
→ Document Must-have assumptions
→ Proceed to MVP spec
→ Defer Should/Could clarification to post-MVP
→ Schedule follow-up session
```

---

## Best Practices

### 1. Choose the Right Workflow Path

- **Complex features:** Use full workflow (new-task → research → clarify → spec → plan → prompt)
- **Simple enhancements:** Skip to research → create-plan
- **Bug fixes:** Research → fix → validate

### 2. Keep Artifacts Updated

- Update `AGENTS.md` as you progress
- Link related artifacts (research → spec → tasks)
- Document decisions in task hub

### 3. Use Context Effectively

- Always reference research and specs in task prompts
- Include file paths and code references
- Link to related tasks or ADRs

### 4. Validate Early and Often

- Run `/validate-code` after each task
- Fix linting/type errors immediately
- Write tests as you implement

### 5. Document Assumptions

- Use `[NEEDS CLARIFICATION]` tags in research/clarification
- Document assumptions in specs with "Validation Required" flag
- Track open questions in `AGENTS.md`
- **Never proceed with undocumented assumptions**

**Example of Good Assumption Documentation:**
```
Assumption: 50% feature adoption target
Validation Required: Yes
Validation Method: Stakeholder confirmation
Validation Date: 2025-11-15
Owner: Product Manager
Risk if Wrong: Medium (affects success metrics)
```

### 5a. Handle Clarification Gaps Systematically

- **< 6/8 dimensions complete:** Fill gaps before proceeding
- **6-7/8 dimensions complete:** Document assumptions, proceed with validation plan
- **8/8 dimensions complete:** Proceed to spec
- **Mission conflicts:** Escalate immediately, do not proceed

### 6. Progress Tracking

- Use `/review-progress` when switching contexts
- Update `AGENTS.md` Progress Log regularly
- Create checkpoints for complex tasks/features

### 7. Workflow Integration

- Commands are designed to work together
- Each workflow produces artifacts for the next
- Follow recommended "Next Steps" from each command

---

## Troubleshooting

### Missing Type Errors

**Problem:** TypeScript errors about missing `./+types/[routeName]` imports.

**Solution:** Run `bun run typecheck` to generate types. Never change import paths.

### Workflow Not Executing

**Problem:** Command returns description instead of executing.

**Solution:** Ensure you're using the exact command format: `/[workflow-name]`. Check `.agents/commands/` for available commands.

### Task Hub Already Exists

**Problem:** `/new-task` fails because folder exists.

**Solution:** The workflow will append a numeric suffix automatically. Or manually specify a different slug.

### Missing Context

**Problem:** Task prompts lack necessary context.

**Solution:** Ensure research and spec are complete. Use `/clarify-task` to fill gaps before creating task prompts.

### Clarification Incomplete

**Problem:** Clarification packet shows low completeness score (< 6/8).

**Solution:**
1. Review "Gaps Requiring Clarification" section
2. Prepare specific questions for stakeholders
3. Schedule clarification session
4. Update clarification packet with answers
5. Re-run `/clarify-task` if needed

**Example:**
```
Clarification: 3/8 complete
→ Review gaps: Success metrics, Timeline, Performance benchmarks
→ Prepare questions for stakeholder
→ Get answers via email/meeting
→ Update clarification packet manually or re-run clarify-task
→ Now 7/8 complete, proceed with documented assumption
```

### Research Finds Conflicting Patterns

**Problem:** Research discovers multiple conflicting approaches in codebase.

**Solution:**
1. Document conflict in research packet
2. Add conflict to clarification packet
3. Escalate to team lead or decision maker
4. Get decision on which pattern to use
5. Update clarification packet with decision
6. Proceed with consistent pattern

**Example:**
```
Research finds: Two auth patterns (session vs Bearer token)
→ Document conflict in research
→ Add to clarification: "Which pattern for new feature?"
→ Check with team lead
→ Decision: "Use Bearer tokens (newer pattern)"
→ Update clarification packet
→ Proceed
```

### Stakeholder Unavailable

**Problem:** Need clarification, but stakeholder is unavailable.

**Solution:**
1. Document assumptions explicitly
2. Mark assumptions with "Validation Required: Yes"
3. Include validation plan (who, when, how)
4. Proceed to spec with assumption log
5. Schedule follow-up validation when stakeholder returns

**Example:**
```
Stakeholder unavailable until next week
→ Document assumption: "50% adoption target (industry benchmark)"
→ Mark: "Validation Required: Yes, Owner: PM, Date: Next week"
→ Proceed to spec with assumption documented
→ Validate when stakeholder returns
→ Update spec if assumption was wrong
```

---

## File Structure Reference

```
.devagent/
├── core/
│   ├── workflows/          # Workflow definitions
│   └── templates/          # Templates for artifacts
└── workspace/
    └── tasks/
        └── active/
            └── YYYY-MM-DD_task-slug/
                ├── AGENTS.md              # Progress tracker
                ├── research/              # Research packets
                ├── clarification/         # Requirement clarification
                └── plan/                  # Plan documents (product context + tasks)

.agents/
└── commands/               # Command files (symlinked to .cursor/commands)
```

---

## Getting Help

- **Workflow questions:** Review `.devagent/core/workflows/[workflow-name].md`
- **Command reference:** Check `.agents/commands/[command-name].md`
- **Project patterns:** See `AGENTS.md` (root) and `.devagent/core/AGENTS.md`
- **Code standards:** Review `.cursor/rules/` for coding guidelines

---

## Quick Reference Card

```
New Feature Workflow:
1. devagent new-task "Title"
2. devagent research "Question"
3. devagent clarify-task
4. devagent create-plan
5. devagent implement-plan
6. devagent review-progress (optional)

Simple Enhancement:
1. devagent research "Question"
2. devagent create-plan
3. devagent implement-plan

Bug Fix:
1. devagent research "Problem"
2. [Fix manually]
3. [Run: bun run lint && bun run typecheck && bun run test]
```

---

*Last Updated: 2025-12-27*
