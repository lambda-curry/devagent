# Auto-Scaling Agent Workflow - File Updates Task Plan

- Owner: TaskPlanner (Jake Ruesink)
- Last Updated: 2025-09-30
- Status: Draft
- Related Spec: `.devagent/features/auto-scaling-agent-workflow/spec/2025-09-30_auto-scaling-agent-workflow.md`
- Reviewers: Jake Ruesink (Executing Developer)
- Notes: Focused on existing file updates only. No new systems or complex code.

## Summary

Update existing DevAgent documentation and agent prompts to implement the auto-scaling workflow model. This removes the "simple vs complex" classification system and embeds self-assessment logic directly into each agent prompt. All work is documentation/prompt engineering on existing files.

## Scope & Assumptions

- **Scope focus**: Update existing `.md` files only - no code changes, no new systems
- **Key assumptions**: 
  - Solo developer execution (Jake)
  - Manual agent invocation workflow remains unchanged
  - No tooling or CLI modifications needed
  - Changes are incremental and testable per file
- **Out of scope**: 
  - New automation or CLI tools
  - Multi-developer coordination patterns
  - Analytics dashboards
  - External integrations

## Backlog Slices

### Slice 1: Core Agent Entry Point (1 task)
**Objective**: Update the main agent documentation to present the new single-workflow model

**Tasks**:

1. **Update `AGENTS.md` with auto-scaling model**
   - **Rationale**: This is the primary entry point for understanding how to use agents. Must clearly communicate the single workflow and remove lane-based confusion.
   - **Impacted files**: `AGENTS.md`
   - **Changes needed**:
     - Remove all "simple vs complex" and lane-based language
     - Add new "How Agents Self-Determine" section explaining auto-invocation
     - Document that agents use risk triggers, not user classification
     - Add manual override guidance (using agent hash like `#ResearchAgent`)
     - Emphasize default lightweight path with escalation when needed
   - **Spec sections**: "Solution Principles", "Technical Design" (Agent Prompt Structure)
   - **Acceptance**: 
     - No mention of "lanes" or "classify your work"
     - Clear explanation of how agents decide to run
     - Single workflow narrative from user perspective
     - Manual override mechanism documented

**Validation plan**: Read through from user perspective - does it feel like one simple workflow?

---

### Slice 2: Agent Self-Assessment Logic (4 tasks)
**Objective**: Embed decision trees into each core agent prompt so they can self-determine necessity

**Dependencies**: Should reference the updated `AGENTS.md` model

**Tasks**:

2. **Add self-assessment logic to `ResearchAgent.md`**
   - **Rationale**: ResearchAgent needs clear triggers for when research is actually needed vs when to skip
   - **Impacted files**: `.devagent/agents/ResearchAgent.md`
   - **Changes needed**:
     - Add "Should I Run?" section with decision tree
     - List run triggers: new tech/patterns, compliance/security keywords, explicit research requests, missing evidence
     - List skip conditions: routine maintenance, context already documented, research provided
     - Remove assumptions about mandatory stakeholder reviews
     - Adjust tone from "team workshops" to "async decision capture"
   - **Spec sections**: "Agent Self-Assessment: #ResearchAgent" (lines 88-112)
   - **Acceptance**:
     - Clear trigger list with examples
     - Skip conditions equally clear
     - No default assumption of team/stakeholder involvement
     - Lightweight solo-dev tone

3. **Add self-assessment logic to `SpecArchitect.md`**
   - **Rationale**: SpecArchitect handles high-impact work but should skip for simple changes
   - **Impacted files**: `.devagent/agents/SpecArchitect.md`
   - **Changes needed**:
     - Add "Should I Run?" section
     - Run triggers: >3 files, database changes, irreversible decisions, compliance/security, explicit spec request, research flags high impact
     - Skip conditions: single-file changes, reversible/low-risk work, context fits in task prompt
     - Remove default approval gates and mandatory reviewer language
     - Solo developer as default, team coordination as exception
   - **Spec sections**: "Agent Self-Assessment: #SpecArchitect" (lines 113-139)
   - **Acceptance**:
     - Quantifiable triggers (file count, etc.)
     - Clear differentiation between high-impact and routine work
     - No ceremony by default

4. **Add self-assessment logic to `TaskPlanner.md`**
   - **Rationale**: Planning is only needed when complexity demands it
   - **Impacted files**: `.devagent/agents/TaskPlanner.md`
   - **Changes needed**:
     - Add "Should I Run?" section
     - Run triggers: >5 acceptance criteria, external dependencies, sequencing constraints, multi-phase work, explicit planning request
     - Skip conditions: straightforward single-phase work, fits in one session, executor can derive from spec
     - Remove default stakeholder/reviewer assumptions
     - Emphasize lightweight task prompts over formal plans when appropriate
   - **Spec sections**: "Agent Self-Assessment: #TaskPlanner" (lines 140-165)
   - **Acceptance**:
     - Clear complexity threshold (>5 criteria, etc.)
     - Acknowledges executor can work from spec directly when simple
     - Planning as exception, not default

5. **Add self-assessment logic to `TaskExecutor.md`**
   - **Rationale**: Executor always runs but needs to adapt to varying input quality
   - **Impacted files**: `.devagent/agents/TaskExecutor.md`
   - **Changes needed**:
     - Add note that TaskExecutor always runs (universal endpoint)
     - Document input flexibility: full chain, spec only, research only, or standalone
     - Execution rigor scales to available input
     - Add mid-stream escalation trigger awareness
     - Remove assumptions about mandatory review processes
   - **Spec sections**: "Agent Self-Assessment: #TaskExecutor" (lines 166-190), "Escalation During Execution" (lines 191-208)
   - **Acceptance**:
     - Clear that execution always happens
     - Documented input variations
     - Escalation triggers included
     - Adapts to lightweight or rigorous contexts

**Validation plan**: Each agent can independently assess whether to run based on request characteristics

---

### Slice 3: Governance Cleanup (1 task)
**Objective**: Remove lane-based assumptions and ceremony from governance documentation

**Dependencies**: Aligns with updated agent prompts

**Tasks**:

6. **Simplify `.devagent/governance/assumptions.md`**
   - **Rationale**: Governance doc likely contains lane-based assumptions that conflict with new model
   - **Impacted files**: `.devagent/governance/assumptions.md`
   - **Changes needed**:
     - Audit for any "simple vs complex" or lane references - remove them
     - Remove default assumptions about stakeholders, reviewers, approval gates
     - Add assumption: "Solo developer by default, team coordination when needed"
     - Add assumption: "Agents self-assess necessity based on risk triggers"
     - Ensure decision journal format is lightweight (no ceremony)
   - **Spec sections**: "Technical Design" (Governance Updates section, lines 282-286)
   - **Acceptance**:
     - No lane-based language
     - Matches agent self-assessment model
     - Lightweight decision capture format
     - Solo-dev-first assumptions

**Validation plan**: Governance assumptions don't contradict the new workflow model

---

## Risks & Open Questions

| Item | Type | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Agent prompts may have deeply embedded team/stakeholder language | Risk | Jake | Audit each file carefully during updates, test with solo-dev scenarios | 2025-10-02 |
| Self-assessment triggers might need tuning after real use | Risk | Jake | Initial conservative triggers, plan to adjust after Phase 3 validation in spec | 2025-10-07 |
| Governance doc might have more than just assumptions.md | Question | Jake | Check `.devagent/governance/` directory for other files during Slice 3 | 2025-10-02 |

## Decision Log

| Date | Change | Notes |
| --- | --- | --- |
| 2025-09-30 | Focused scope on existing file updates only | Per user request: "let's create tasks focusing on just changing our existing files" |
| 2025-09-30 | Split work into 6 discrete file-update tasks | Each task targets 1 specific file with clear acceptance criteria |

## Follow-ups & Hand-offs

**For Executor**:
- All tasks are documentation updates to existing `.md` files
- Each task is independent - can be done in any order (though Slice 1 first makes sense)
- Test by reading through from solo developer perspective after each update
- No code changes needed - pure prompt engineering work
- After completing all tasks, validate with 2-3 real scenarios per spec Phase 3

**Files to update**:
1. `AGENTS.md`
2. `.devagent/agents/ResearchAgent.md`
3. `.devagent/agents/SpecArchitect.md`
4. `.devagent/agents/TaskPlanner.md`
5. `.devagent/agents/TaskExecutor.md`
6. `.devagent/governance/assumptions.md`

**Success signal**: Can invoke any agent naturally without thinking about lanes or classification

## Change Log

| Date | Change | Author |
| --- | --- | --- |
| 2025-09-30 | Initial task plan - focused on existing file updates | TaskPlanner (Jake Ruesink) |

