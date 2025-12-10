# Research: Consolidating Create-Spec and Plan-Tasks into Create-Plan

- Date: 2025-12-10
- Classification: Workflow refactoring / architecture review
- Assumptions: DevAgent's delivery principles (C3) prioritize iterative, human-in-the-loop work with thin slices; removal of `create-spec` is viable if planning artifacts can capture all necessary guardrails.

---

## Research Plan

What was validated:
1. **Mission & scope overlap** between `create-spec` and `plan-tasks` workflows
2. **Cost/benefit of maintaining two distinct stages** vs. a unified `create-plan` workflow
3. **Information flow** from research → spec → planning and whether it can be collapsed
4. **Downstream dependencies** on spec artifacts and how they would adapt

---

## Findings & Traceoffs

### 1. Current Workflow Sequence

**Today's flow:**
```
research → create-spec → plan-tasks → create-task-prompt
```

- **create-spec** (source: `.devagent/core/workflows/create-spec.md`):
  - Primary goal: Convert validated missions + research into review-ready specs
  - Outputs: High-level guardrails, acceptance criteria, user context, solution principles, risks
  - Audience: Reviewers, executing developers (pre-implementation clarity)
  - Success metric: Executing developer signs off with minor edits

- **plan-tasks** (source: `.devagent/core/workflows/plan-tasks.md`):
  - Primary goal: Translate approved specs into execution-focused work packets
  - Outputs: Concrete tasks (files, modules, tests), ordered backlog, technical validation
  - Audience: Executing developers, test authors
  - Success metric: Executor can implement without major clarifications

### 2. Functional Overlap

**Shared responsibilities:**
- Both validate completeness of upstream inputs (research)
- Both produce "review-ready" artifacts requiring sign-off
- Both track risks, open questions, and unresolved dependencies
- Both reference the same spec template structure (objectives, constraints, users, scope)

**Distinct responsibilities:**
- **Spec** focuses on *business/product guardrails*: Why? Who benefits? What principles guide implementation?
- **Plan** focuses on *engineering breakdown*: Which files change? What tests validate? How are dependencies sequenced?

### 3. Design Tradeoff: Remove Spec vs. Enhance Planning

#### Option A: Remove `create-spec`, consolidate into `create-plan`

**Advantages:**
- Developers move faster from research directly to planning
- Reduces review steps (one artifact vs. two) per C3 delivery principle ("iterate in thin slices")
- Unifies template structure, avoiding redundant sections (both cite objectives, risks, users)
- Fewer workflow invocations = lower cognitive load on teams

**Disadvantages:**
- Loss of explicit "product guardrails" review stage (some teams rely on spec sign-off to validate requirements)
- Task plans may conflate business context with engineering breakdown, making cross-functional review harder
- Specs serve as project memory; without them, onboarding new team members lacks a business-focused artifact

#### Option B: Keep both (status quo)

**Advantages:**
- Clear separation: Product clarity vs. engineering clarity
- Specs serve as project documentation and historical record
- Multi-stakeholder reviews have a dedicated stage (business, PM, design before engineering commits)

**Disadvantages:**
- Higher overhead for small/simple features
- Two sign-off cycles can delay execution
- Template duplication (both cover objectives, risks, users)

#### Recommendation

**Consolidate into a unified `create-plan` workflow** with the following design:

1. **New `create-plan` workflow** that outputs a single, comprehensive artifact covering both business and engineering context
   - Sections: Mission alignment, Users/Context, Objectives, Solution Principles, Scope, Implementation tasks (files, modules, tests), Risks, Decisions
   - One sign-off stage (executing developer + optional cross-functional reviewer)
   - Supports "thin slices" delivery (C3)

2. **Retire `create-spec` workflow** as a distinct stage
   - Archive `.devagent/core/workflows/create-spec.md`
   - Document deprecation in AGENTS.md with migration guidance

3. **Update workflow recommendations** in feature hubs and downstream references
   - Change: `research → create-spec → plan-tasks` 
   - To: `research → create-plan`

### 4. Risk Mitigation

**Concern:** Loss of product/business guardrails clarity
- **Mitigation:** New `create-plan` template explicitly includes "Product Context" and "Solution Principles" sections to preserve business-focused review criteria

**Concern:** Onboarding and project memory
- **Mitigation:** Task plans become living project memory; index them in feature hubs with dates and decision summaries for discoverability

**Concern:** Breaking existing downstream workflows
- **Mitigation:** `devagent create-task-prompt` already references task plans as primary input; no breaking changes if specs are removed

### 5. Validation Path

To confirm this approach:
1. Draft the new `create-plan.md` workflow specification
2. Apply it to an existing feature (e.g., retrospectively on a completed feature)
3. Collect feedback on whether the consolidated artifact is clearer or more confusing
4. Update AGENTS.md roster and all downstream references

---

## Sources

- `.devagent/core/workflows/create-spec.md` — Current spec workflow definition [2025-12-10]
- `.devagent/core/workflows/plan-tasks.md` — Current planning workflow definition [2025-12-10]
- `.devagent/workspace/memory/constitution.md` (Clause C3: Delivery Principles) — Emphasizes thin slices and human-in-the-loop defaults [2025-12-10]
- `.devagent/core/AGENTS.md` — Current workflow roster and sequencing [2025-12-10]

---

## Recommendation

**Proceed with consolidation:**

1. Design and implement the new `create-plan` workflow that unifies spec + planning concerns
2. Archive `create-spec` with clear deprecation guidance for teams currently using it
3. Update the workflow roster (AGENTS.md) and feature templates
4. Validate the approach on 1–2 existing features before rollout

**Expected benefits:**
- Shorter time-to-implementation (one workflow vs. two)
- Clearer ownership of planning artifacts
- Alignment with C3 delivery principle (thin slices, fewer review gates)

---

## Open Questions

- Should the new `create-plan` template include an optional "Spec Review" subsection for teams that need explicit business validation before engineering starts?
- Which features currently depend on `create-spec` output, and how should their artifacts be migrated?
- Should archived specs be moved to a `.devagent/workspace/features/*/spec/_archive/` directory for reference?

---

## Repo Next Steps

- [ ] Review this research packet and confirm direction
- [ ] Draft the `create-plan.md` workflow specification (use `devagent build-workflow`)
- [ ] Test on 1–2 existing features (apply retroactively to validate)
- [ ] Update `.devagent/core/AGENTS.md` with new roster
- [ ] Archive or deprecate `create-spec.md`
- [ ] Update feature templates to reference `create-plan` instead
