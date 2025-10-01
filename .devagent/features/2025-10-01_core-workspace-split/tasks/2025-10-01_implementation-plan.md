# Core-Workspace Split Implementation Plan

- Owner: #TaskPlanner / @jaruesink
- Last Updated: 2025-10-01
- Status: Draft
- Related Spec: `.devagent/features/2025-10-01_core-workspace-split/spec/2025-10-01_core-workspace-split-spec.md`
- Notes: Tasks are sequenced to maintain working state throughout migration. Each phase completes before next begins.
- File Location: `.devagent/features/2025-10-01_core-workspace-split/tasks/2025-10-01_implementation-plan.md`

## Summary

Restructure `.devagent/` directory into `core/` (portable agent kit) and `workspace/` (project-specific artifacts) to enable sub-5-minute DevAgent setup across new projects. The plan executes in 4 phases: (1) directory structure creation and file moves, (2) agent path reference updates across 12 agent files with 79+ path references, (3) documentation and validation, (4) rollout support. Critical constraint: maintain backward compatibility during migration to avoid breaking existing workflows.

## Scope & Assumptions

- **Scope focus:** DevAgent repository restructure only; migration guide for external adopters
- **Key assumptions:**
  - Existing feature hub artifacts (`.devagent/features/2025-10-01_core-workspace-split/`) preserved in current location during migration
  - All 12 agent instruction sheets require path updates (detected 79 references via grep)
  - Validation against one Lambda Curry project (TBD which project) post-migration
  - Big-bang reorg approach for DevAgent repo (dogfooding the change)
- **Out of scope:**
  - Automated sync CLI tooling (future work)
  - Tool-specific implementations under `.devagent/tools/`
  - Migration of historical feature hub artifacts (preserve in place)

## Tasks

### Task 1: Create New Directory Structure & Move Core Files

- **Objective:** Establish `core/` and `workspace/` directories and relocate all portable agent kit files to `core/` without breaking current paths
- **Dependencies:** None (kickoff task)
- **Subtasks:**
  1. `Create core/ and workspace/ directories` — Establishes new top-level structure per spec lines 156-211
     - Acceptance: `.devagent/core/` and `.devagent/workspace/` exist
  2. `Create core/ subdirectories (agents/, templates/)` — Portable kit structure
     - Acceptance: `.devagent/core/agents/`, `.devagent/core/agents/codegen/`, `.devagent/core/templates/` exist
  3. `Create workspace/ subdirectories` — Project-specific artifact structure per spec lines 186-210
     - Acceptance: `.devagent/workspace/product/`, `.devagent/workspace/memory/`, `.devagent/workspace/features/`, `.devagent/workspace/research/`, `.devagent/workspace/tasks/` exist
  4. `Move all agent files to core/agents/` — Relocate 12 agent instruction sheets from `.devagent/agents/` to `.devagent/core/agents/`
     - Entry points: AgentBuilder.md, FeatureBrainstormAgent.md, FeatureClarifyAgent.md, ProductMissionPartner.md, ResearchAgent.md, SpecArchitect.md, TaskExecutor.md, TaskPlanner.md, TaskPromptBuilder.md, TechStackAgent.md, UpdateConstitution.md, codegen/CodegenBackgroundAgent.md
     - Acceptance: All 12 files moved, codegen subdirectory preserved
  5. `Move all template files to core/templates/` — Relocate 10 template files from `.devagent/templates/` to `.devagent/core/templates/`
     - Entry points: agent-brief-template.md, brainstorm-packet-template.md, clarification-packet-template.md, clarification-questions-framework.md, constitution-template.md, research-packet-template.md, spec-document-template.md, task-plan-template.md, task-prompt-template.md, tech-stack-template.md
     - Acceptance: All 10 files moved, templates directory removed
  6. `Move product/ to workspace/product/` — Relocate mission.md, roadmap.md, guiding-questions.md
     - Entry points: `.devagent/product/` → `.devagent/workspace/product/`
     - Acceptance: All 3 product files moved
  7. `Move memory/ to workspace/memory/` — Relocate constitution.md, decision-journal.md, tech-stack.md, overview.md, _archive/
     - Entry points: `.devagent/memory/` → `.devagent/workspace/memory/`
     - Acceptance: All memory files moved, _archive/ preserved
  8. `Move features/ to workspace/features/` — Relocate feature hub directory including current feature
     - Entry points: `.devagent/features/` → `.devagent/workspace/features/`
     - Acceptance: All feature hubs moved, README.md and _template/ preserved
  9. `Move research/ to workspace/research/` — Relocate cross-cutting research files
     - Entry points: `.devagent/research/` → `.devagent/workspace/research/`
     - Acceptance: All research files moved
  10. `Delete old empty directories` — Clean up `.devagent/agents/`, `.devagent/templates/`, `.devagent/product/`, `.devagent/memory/`, `.devagent/features/`, `.devagent/research/`
     - Acceptance: Old directories removed, only `core/` and `workspace/` remain under `.devagent/`
- **Validation plan:** Verify directory structure matches spec diagram (lines 156-211) using `tree` or `ls -R`

### Task 2: Update Agent Instruction Sheet Path References

- **Objective:** Update all 79+ path references across 12 agent files to use new `core/` and `workspace/` conventions
- **Dependencies:** Task 1 complete (files must be in new locations)
- **Subtasks:**
  1. `Update AgentBuilder.md paths` — Replace `.devagent/agents/` → `.devagent/core/agents/`, `.devagent/templates/` → `.devagent/core/templates/`
     - Entry point: `.devagent/core/agents/AgentBuilder.md` line 19, 26
     - Spec reference: Lines 215-227 (path reference conventions)
     - Acceptance: All path references updated, agent invocation test passes
  2. `Update FeatureBrainstormAgent.md paths` — Update template and feature hub references
     - Entry point: `.devagent/core/agents/FeatureBrainstormAgent.md`
     - Acceptance: Template paths use `core/`, feature paths use `workspace/`
  3. `Update FeatureClarifyAgent.md paths` — Update template and feature hub references
     - Entry point: `.devagent/core/agents/FeatureClarifyAgent.md`
     - Acceptance: Template paths use `core/`, feature paths use `workspace/`
  4. `Update ProductMissionPartner.md paths` — Update product/ and memory/ references
     - Entry point: `.devagent/core/agents/ProductMissionPartner.md` lines 18, 24-28
     - Acceptance: `.devagent/product/` → `.devagent/workspace/product/`, `.devagent/memory/` → `.devagent/workspace/memory/`
  5. `Update ResearchAgent.md paths` — Update template, research/, and features/ references
     - Entry point: `.devagent/core/agents/ResearchAgent.md` lines 15-18
     - Acceptance: Template uses `core/templates/`, research uses `workspace/research/`, features use `workspace/features/`
  6. `Update SpecArchitect.md paths` — Update template and feature hub references
     - Entry point: `.devagent/core/agents/SpecArchitect.md`
     - Acceptance: Template paths use `core/`, feature paths use `workspace/`
  7. `Update TaskPlanner.md paths` — Update template and feature hub references
     - Entry point: `.devagent/core/agents/TaskPlanner.md` lines 14-17
     - Acceptance: Template uses `core/templates/`, features use `workspace/features/`
  8. `Update TaskExecutor.md paths` — Update feature hub and task references
     - Entry point: `.devagent/core/agents/TaskExecutor.md`
     - Acceptance: Feature paths use `workspace/features/`
  9. `Update TaskPromptBuilder.md paths` — Update template and feature hub references
     - Entry point: `.devagent/core/agents/TaskPromptBuilder.md` lines 14-16
     - Acceptance: Template uses `core/templates/`, features use `workspace/features/`
  10. `Update TechStackAgent.md paths` — Update template and memory/ references
     - Entry point: `.devagent/core/agents/TechStackAgent.md` line 29
     - Acceptance: Template uses `core/templates/`, memory uses `workspace/memory/`
  11. `Update UpdateConstitution.md paths` — Update memory/ references
     - Entry point: `.devagent/core/agents/UpdateConstitution.md`
     - Acceptance: Memory paths use `workspace/memory/`
  12. `Update CodegenBackgroundAgent.md paths` — Update template and feature hub references
     - Entry point: `.devagent/core/agents/codegen/CodegenBackgroundAgent.md`
     - Acceptance: Template paths use `core/`, feature paths use `workspace/`
- **Validation plan:** Run `grep -r "\.devagent/\(agents\|templates\|features\|memory\|product\|research\)" .devagent/core/agents/` to verify no old path patterns remain

### Task 3: Update Core Documentation & Create Migration Guide

- **Objective:** Update AGENTS.md with new paths, create core/README.md with setup instructions, and provide migration guide for external adopters
- **Dependencies:** Tasks 1-2 complete (structure and agent paths updated)
- **Subtasks:**
  1. `Update AGENTS.md agent references` — Change all agent paths from `.devagent/agents/...` to `.devagent/core/agents/...`
     - Entry point: `AGENTS.md` lines 18-27
     - Spec reference: Lines 183, 226-227
     - Acceptance: All 10 agent references updated with `core/agents/` paths
  2. `Create core/README.md with setup guide` — Document how to copy `core/` into new projects and initialize `workspace/`
     - Spec reference: Lines 87-103 (Flow 1: Initialize DevAgent)
     - Content: Setup steps, directory structure diagram, initialization checklist, version/changelog section
     - Acceptance: README includes 5-minute setup instructions, structure diagram, changelog placeholder
  3. `Create core/AGENTS.md copy` — Move AGENTS.md into `core/` for portability
     - Rationale: Agent roster should be part of portable kit
     - Acceptance: `AGENTS.md` copied to `.devagent/core/AGENTS.md`, root `AGENTS.md` updated to reference core version or removed
  4. `Create migration guide in core/README.md` — Add section for existing DevAgent projects
     - Spec reference: Lines 136-151 (Flow 4: Migrate Existing Project)
     - Content: File-by-file move instructions, validation checklist, estimated time (under 15 minutes)
     - Acceptance: Migration steps documented, includes validation test command
  5. `Update root README.md` — Update main project README to reference new structure
     - Entry point: `/Users/jaruesink/projects/devagent/README.md`
     - Acceptance: README explains `core/` vs `workspace/` distinction, links to `core/README.md`
  6. `Update template self-references` — Update file path placeholders in templates
     - Entry points: All files in `.devagent/core/templates/` that reference their own location
     - Example: task-plan-template.md line 8 references file location pattern
     - Acceptance: Templates reference `workspace/` for output locations, `core/` for template source
- **Validation plan:** Review all documentation for path accuracy, test setup instructions via dry-run with fresh checkout

### Task 4: Validation Testing & Edge Case Handling

- **Objective:** Validate new structure against real agent workflows and identify/fix edge cases
- **Dependencies:** Tasks 1-3 complete (structure, paths, and docs updated)
- **Subtasks:**
  1. `Test ProductMissionPartner workflow` — Invoke agent, verify it reads/writes to `workspace/product/`
     - Validation: Agent successfully accesses mission.md, roadmap.md from workspace/product/
     - Acceptance: No path errors, outputs written to correct workspace/ locations
  2. `Test ResearchAgent workflow` — Invoke agent in general mode, verify template access and output location
     - Validation: Agent reads from `core/templates/research-packet-template.md`, writes to `workspace/research/`
     - Acceptance: Template loaded correctly, output in workspace/research/ with correct timestamp
  3. `Test SpecArchitect workflow` — Invoke agent for spec creation, verify full template → workspace flow
     - Validation: Reads template from `core/templates/spec-document-template.md`, writes to `workspace/features/.../spec/`
     - Acceptance: Spec created in correct feature hub location under workspace/
  4. `Test TaskPlanner workflow` — Self-validate by checking this task plan's references
     - Validation: Verify this task plan correctly references core/ templates and workspace/ features
     - Acceptance: All paths in this document follow new conventions
  5. `Test TaskExecutor workflow` — Invoke agent with task from workspace, verify code access
     - Validation: Agent reads tasks from `workspace/features/.../tasks/`, executes against codebase
     - Acceptance: No path resolution errors
  6. `Test CodegenBackgroundAgent workflow` — Verify API integration and path handling
     - Validation: Agent accesses templates from core/, generates prompts correctly
     - Acceptance: Background agent deployment succeeds with new paths
  7. `Audit for hardcoded path assumptions` — Search codebase for any missed `.devagent/agents` or `.devagent/templates` references
     - Command: `grep -r "\.devagent/agents\|\.devagent/templates" . --exclude-dir=.git`
     - Acceptance: Only references in this task plan (documenting old paths) or migration guide
  8. `Test edge case: nested feature hub references` — Verify agent-to-agent handoffs work with new paths
     - Example: #ResearchAgent → #SpecArchitect → #TaskPlanner chain
     - Acceptance: Each agent correctly reads predecessor's outputs from workspace/
  9. `Validate template rendering` — Ensure template placeholders updated for workspace/ outputs
     - Check: All templates with file location placeholders reference workspace/ paths
     - Acceptance: No templates instruct users to write to `.devagent/templates/` or `.devagent/agents/`
- **Validation plan:** Document test results in feature hub, create checklist of passed/failed workflows, escalate blockers to @jaruesink

### Task 5: External Project Validation & Rollout Prep

- **Objective:** Test structure with one Lambda Curry project and prepare for team rollout
- **Dependencies:** Task 4 complete (all workflows validated)
- **Acceptance Criteria:**
  - [ ] One Lambda Curry project adopts new structure within 5 minutes
  - [ ] Setup process measured and meets <5 minute target
  - [ ] Zero clarification questions during setup
  - [ ] All agent workflows function in external project
  - [ ] Rollout announcement drafted with migration guide link
- **Subtasks:**
  1. `Select Lambda Curry validation project` — Choose project for testing (coordinate with @jaruesink)
     - Criteria: Active development, uses DevAgent or willing to adopt
     - Acceptance: Project identified and stakeholder confirmed availability
  2. `Copy core/ to validation project` — Test portable kit hypothesis
     - Steps: Copy `.devagent/core/` directory to target project
     - Acceptance: Copy completes without errors
  3. `Initialize workspace/ in validation project` — Create project-specific structure
     - Steps: Create workspace/ subdirectories, initialize mission.md with project context
     - Timing: Start stopwatch for 5-minute target
     - Acceptance: Workspace structure created, mission.md customized
  4. `Invoke first agent in validation project` — Test end-to-end workflow
     - Suggested: #ProductMissionPartner or #ResearchAgent (low-risk starting points)
     - Acceptance: Agent executes without path errors, outputs to correct workspace/ location
  5. `Measure setup time and friction points` — Collect validation metrics
     - Track: Actual time, clarification questions asked, manual path adjustments needed
     - Acceptance: Setup time recorded, friction log created
  6. `Iterate on documentation based on validation` — Update core/README.md with learnings
     - Address: Any clarification questions, missing steps, unclear instructions
     - Acceptance: README updated, validation friction eliminated
  7. `Draft rollout announcement` — Prepare communication for Lambda Curry team
     - Content: Benefits summary, setup instructions link, migration guide link, support contact
     - Channel: Determine communication medium (Slack, email, etc.)
     - Acceptance: Announcement drafted and ready for @jaruesink review
  8. `Prepare rollback plan documentation` — Document reversion steps if validation fails
     - Content: Git revert commands, symlink bridge approach, support escalation
     - Acceptance: Rollback procedure documented in feature hub
- **Validation plan:** Setup time under 5 minutes with zero blockers gates Task 6 kickoff; escalate to @jaruesink if target missed

### Task 6: Merge & Rollout Support

- **Objective:** Merge changes to main branch and support early adopters through migration
- **Dependencies:** Task 5 complete (external validation passed)
- **Acceptance Criteria:**
  - [ ] Changes merged to DevAgent main branch
  - [ ] Rollout announcement sent to Lambda Curry team
  - [ ] Migration guide accessible and tested
  - [ ] Support monitoring active for 48 hours post-rollout
  - [ ] At least one adoption signal within 30 days (tracked separately)
- **Subtasks:**
  1. `Pre-merge validation checklist` — Final checks before merge
     - Verify: All tests passed (Task 4), external validation successful (Task 5), documentation complete (Task 3)
     - Acceptance: All validation gates passed, no blocking issues
  2. `Create feature branch and PR` — Prepare changes for review
     - Branch: `feature/core-workspace-split`
     - PR description: Link to spec, summarize changes, highlight validation results
     - Acceptance: PR created with complete context
  3. `Self-review for path consistency` — Final audit of all changed files
     - Check: Agent files, templates, documentation, root files
     - Acceptance: No old path patterns detected
  4. `Merge to main branch` — Deploy restructure
     - Gate: @jaruesink approval
     - Acceptance: Changes merged, main branch updated
  5. `Send rollout announcement` — Communicate change to team
     - Content: Benefits, setup link, migration guide, support contact
     - Acceptance: Announcement sent via agreed channel
  6. `Monitor support channels for 48 hours` — Proactive issue resolution
     - Track: Questions, blockers, setup failures
     - Response time: Within 4 hours for blockers
     - Acceptance: All questions answered, blockers resolved or escalated
  7. `Update decision journal` — Log migration completion
     - Entry: Decision to restructure, rationale, validation results, post-rollout status
     - Location: `.devagent/workspace/memory/decision-journal.md`
     - Acceptance: Journal entry created with migration summary
  8. `Create 30-day adoption tracking task` — Set up metric monitoring
     - Metric: At least 2 Lambda Curry projects adopt new structure
     - Tracking: Create follow-up task to check adoption in 30 days
     - Acceptance: Tracking task created, responsible party assigned
- **Validation plan:** Successful merge without main branch breakage, first external adoption within 7 days signals success

## Risk Register

| Risk | Impact | Mitigation | Owner |
| --- | --- | --- | --- |
| Agent path updates incomplete (79+ references) | High - broken workflows | Automated grep validation in Task 2, comprehensive testing in Task 4 | @jaruesink |
| External validation project unavailable | Medium - delays Phase 3 | Identify backup project upfront, confirm availability before Task 5 | @jaruesink |
| Setup time exceeds 5-minute target | Medium - adoption friction | Iterate on documentation in Task 5.6, simplify steps if needed | @jaruesink |
| Existing DevAgent users break on update | High - production impact | Clear migration guide (Task 3.4), announcement timing (Task 6.5), rollback plan (Task 5.8) | @jaruesink |
| Template self-references missed | Low - user confusion | Comprehensive template audit in Task 3.6 | @jaruesink |
| Agent-to-agent handoffs fail with new paths | Medium - workflow breakage | Chain testing in Task 4.8 | @jaruesink |

## Dependencies

**Upstream (Blocking This Work):**
- None - greenfield restructure

**Downstream (Blocked By This Work):**
- Future DevAgent CLI tooling for `core/` sync (out of scope)
- Multi-project adoption tracking (starts post-rollout)

**Parallel Work:**
- Constitution updates (C2, C4) may need path reference updates if modified during implementation

## Success Signals

- [ ] All 12 agent files moved to `core/agents/` with updated paths
- [ ] All 10 template files moved to `core/templates/`
- [ ] All workspace artifacts moved to `workspace/` subdirectories
- [ ] Zero old path patterns detected in `grep` audit
- [ ] All 6+ agent workflows tested successfully
- [ ] External validation project setup in under 5 minutes
- [ ] Migration guide tested by @jaruesink
- [ ] Changes merged to main without rollback
- [ ] Rollout announcement sent
- [ ] 48-hour support window completed with all blockers resolved

## Open Questions

| Question | Impact | Owner | Target Resolution |
| --- | --- | --- | --- |
| Which Lambda Curry project for validation? | Medium - affects Task 5 timing | @jaruesink | Before Task 5 start |
| Should root AGENTS.md remain or move entirely to core/? | Low - documentation organization | @jaruesink | Task 3.3 |
| Do any agents have implicit path assumptions in logic? | Medium - hidden breakage | #TaskExecutor during Task 4 | Task 4 completion |
| Should we create workspace/.gitkeep files for empty dirs? | Low - git tracking | @jaruesink | Task 1 |

## Implementation Notes

- **Sequencing rationale:** Tasks 1-2 are tightly coupled (move then update references), Task 3 requires stable paths, Task 4 validates everything, Task 5 tests externally, Task 6 ships
- **Rollback trigger:** If Task 4 reveals >3 broken workflows or Task 5 setup exceeds 10 minutes, pause and escalate to @jaruesink
- **Incremental commits:** Commit after each major task (1, 2, 3) to enable granular rollback if needed
- **Testing coverage:** 6 agent workflows (ProductMissionPartner, ResearchAgent, SpecArchitect, TaskPlanner, TaskExecutor, CodegenBackgroundAgent) provide representative coverage of path usage patterns

## Next Steps

1. Review this task plan with @jaruesink for approval
2. Confirm Lambda Curry validation project for Task 5
3. Begin Task 1 execution with directory structure creation
4. Maintain task status updates in this document during implementation
5. Update feature hub README with task plan link and status tracking

