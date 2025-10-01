# Agent Execution Directive Implementation Plan

- Owner: #TaskPlanner / @jaruesink
- Last Updated: 2025-10-01
- Status: Draft
- Related Feature: `.devagent/features/2025-10-01_agent-execution-directive/`
- Notes: Execute this AFTER core-workspace-split completes to avoid merge conflicts
- File Location: `.devagent/features/2025-10-01_agent-execution-directive/tasks/2025-10-01_execution-directive-task-plan.md`

## Summary

Add explicit execution directives to all 12 agent instruction sheets to fix "describe vs. do" behavior. When agents are invoked with `#AgentName` and required inputs, they should execute workflows immediately using available tools instead of describing what they would do. This single change dramatically improves agent autonomy and workflow velocity.

## Scope & Assumptions

- **Scope focus:** Update all agent instruction sheets with execution directive
- **Key assumptions:**
  - Agents are currently in `.devagent/agents/` but will move to `.devagent/core/agents/` (wait for restructure completion)
  - Execution directive should be prominent (Mission section or dedicated section)
  - Same directive pattern works for all agent types
- **Out of scope:**
  - Changing agent workflow logic
  - Adding new safeguards for destructive operations (handle per-agent if needed)
  - External documentation updates

## Tasks

### Task 1: Define Execution Directive Standard

- **Objective:** Create standard execution directive text and decide placement in agent files
- **Dependencies:** None
- **Subtasks:**
  1. `Draft execution directive text` — Create clear, imperative directive that tells AI to execute immediately
     - Template: "When invoked with `#AgentName` and required inputs, **EXECUTE IMMEDIATELY**. Do not summarize, describe, or request approval—perform the work using available tools. Only pause for missing REQUIRED inputs or blocking errors."
     - Acceptance: Directive is clear, concise, and uses imperative language
  2. `Decide placement in agent files` — Determine where directive appears (Mission section, separate Execution Directive section, or Expected Output)
     - Options: (a) Add to Mission section, (b) New section after Mission, (c) Add to Expected Output
     - Recommendation: New dedicated section "## Execution Directive" immediately after Mission for visibility
     - Acceptance: Placement decision documented with rationale
  3. `Create agent template update` — Update `.devagent/templates/agent-brief-template.md` to include execution directive section
     - Entry point: `.devagent/templates/agent-brief-template.md` (will be `.devagent/core/templates/agent-brief-template.md` after restructure)
     - Acceptance: Template includes execution directive section with standard text
- **Validation plan:** Review directive text with @jaruesink, confirm it addresses "describe vs. do" issue

### Task 2: Update All Agent Instruction Sheets

- **Objective:** Add execution directive to all 12 agent files
- **Dependencies:** Task 1 complete, core-workspace-split restructure complete (agents in `.devagent/core/agents/`)
- **Subtasks:**
  1. `Update AgentBuilder.md` — Add execution directive section
     - Entry point: `.devagent/core/agents/AgentBuilder.md`
     - Placement: After Mission section (line 6)
     - Acceptance: Execution directive added, no other content changed
  2. `Update FeatureBrainstormAgent.md` — Add execution directive section
     - Entry point: `.devagent/core/agents/FeatureBrainstormAgent.md`
     - Acceptance: Execution directive added
  3. `Update FeatureClarifyAgent.md` — Add execution directive section
     - Entry point: `.devagent/core/agents/FeatureClarifyAgent.md`
     - Acceptance: Execution directive added
  4. `Update ProductMissionPartner.md` — Add execution directive section
     - Entry point: `.devagent/core/agents/ProductMissionPartner.md`
     - Acceptance: Execution directive added
  5. `Update ResearchAgent.md` — Add execution directive section
     - Entry point: `.devagent/core/agents/ResearchAgent.md`
     - Note: Already has "Invocation assumption" line 7, integrate with execution directive
     - Acceptance: Execution directive added, invocation assumption preserved or merged
  6. `Update SpecArchitect.md` — Add execution directive section
     - Entry point: `.devagent/core/agents/SpecArchitect.md`
     - Acceptance: Execution directive added
  7. `Update TaskPlanner.md` — Add execution directive section
     - Entry point: `.devagent/core/agents/TaskPlanner.md`
     - Acceptance: Execution directive added
  8. `Update TaskExecutor.md` — Add execution directive section
     - Entry point: `.devagent/core/agents/TaskExecutor.md`
     - Acceptance: Execution directive added
  9. `Update TaskPromptBuilder.md` — Add execution directive section
     - Entry point: `.devagent/core/agents/TaskPromptBuilder.md`
     - Acceptance: Execution directive added
  10. `Update TechStackAgent.md` — Add execution directive section
     - Entry point: `.devagent/core/agents/TechStackAgent.md`
     - Acceptance: Execution directive added
  11. `Update UpdateConstitution.md` — Add execution directive section
     - Entry point: `.devagent/core/agents/UpdateConstitution.md`
     - Acceptance: Execution directive added
  12. `Update CodegenBackgroundAgent.md` — Add execution directive section
     - Entry point: `.devagent/core/agents/codegen/CodegenBackgroundAgent.md`
     - Note: Already has "Invocation assumption" line 7, integrate with execution directive
     - Acceptance: Execution directive added, invocation assumption preserved or merged
- **Validation plan:** Grep check that all 12 files contain execution directive text

### Task 3: Test Execution Behavior

- **Objective:** Verify agents execute immediately instead of describing
- **Dependencies:** Task 2 complete
- **Subtasks:**
  1. `Test simple agent invocation` — Invoke #ResearchAgent or #TaskPlanner and verify it executes workflow
     - Test: Invoke agent with complete inputs, observe if it executes immediately or describes
     - Acceptance: Agent uses tools (read_file, write, etc.) without requesting approval
  2. `Test agent with missing inputs` — Invoke agent without required inputs, verify it pauses appropriately
     - Test: Invoke agent without required spec path or feature slug
     - Acceptance: Agent pauses and requests missing REQUIRED inputs (not optional ones)
  3. `Document behavior change` — Update feature hub README with test results
     - Entry point: `.devagent/features/2025-10-01_agent-execution-directive/README.md`
     - Acceptance: Test results documented, behavior change confirmed
- **Validation plan:** Manual testing with 2-3 agents to confirm execution behavior change

## Risk Register

| Risk | Impact | Mitigation | Owner |
| --- | --- | --- | --- |
| Agents become too aggressive, execute destructive operations | Medium - data loss | Add safeguard note for destructive operations in directive | @jaruesink |
| Directive placement inconsistent across agents | Low - cosmetic | Standardize placement in Task 1 before updates | @jaruesink |
| Merge conflicts with restructure work | Medium - rework | Wait for restructure completion before executing | @jaruesink |
| Directive doesn't change behavior | High - wasted effort | Test with one agent first, iterate directive text if needed | @jaruesink |

## Dependencies

**Upstream (Blocking This Work):**
- Core-workspace-split restructure must complete first (agents move to `.devagent/core/agents/`)

**Downstream (Blocked By This Work):**
- None - this enables all future agent work to be more autonomous

**Parallel Work:**
- None - can execute independently after restructure completes

## Success Signals

- [ ] Execution directive standard defined and documented
- [ ] All 12 agent files updated with execution directive
- [ ] Agent template updated for future agents
- [ ] Test confirms agents execute immediately instead of describing
- [ ] No merge conflicts with restructure work
- [ ] Behavior change documented

## Open Questions

| Question | Impact | Owner | Target Resolution |
| --- | --- | --- | --- |
| Should directive be same for all agents or customized? | Low - consistency | @jaruesink | Task 1 |
| Do we need safeguards for destructive operations? | Medium - safety | @jaruesink | Task 1 or per-agent basis |
| Should we version agent files after this change? | Low - documentation | @jaruesink | Post-implementation |

## Implementation Notes

- **Sequencing rationale:** Define standard first (Task 1), then bulk-update all agents (Task 2), then validate (Task 3)
- **Timing:** Execute AFTER core-workspace-split merges to avoid conflicts
- **Testing approach:** Test with 1-2 agents first to validate directive effectiveness before updating all 12
- **Incremental commits:** Commit after each major task to enable rollback if directive doesn't work

## Next Steps

1. Wait for core-workspace-split to complete and merge
2. Review this task plan with @jaruesink for approval
3. Execute Task 1 to define execution directive standard
4. Test directive with one agent before bulk update
5. Execute Task 2 to update all agents
6. Test and document behavior change

---

**Related Feature:** `.devagent/features/2025-10-01_agent-execution-directive/`
**Blocked By:** `.devagent/features/2025-10-01_core-workspace-split/` completion

