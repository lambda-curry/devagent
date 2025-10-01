# Core-Workspace Split Implementation Plan

- Owner: #TaskPlanner / @jaruesink
- Last Updated: 2025-10-01
- Status: Draft
- Related Spec: `.devagent/features/2025-10-01_core-workspace-split/spec/2025-10-01_core-workspace-split-spec.md`
- Notes: Tasks are sequenced to maintain working state throughout migration. Each phase completes before next begins.
- File Location: `.devagent/features/2025-10-01_core-workspace-split/tasks/2025-10-01_implementation-plan.md`

## Summary

Restructure `.devagent/` directory into `core/` (portable agent kit) and `workspace/` (project-specific artifacts) to enable easy DevAgent setup across new projects. The plan executes in 3 phases: (1) directory structure creation and file moves, (2) agent path reference updates across 12 agent files with 79+ path references, (3) documentation updates. Clean cut approach - no backwards compatibility needed.

## Scope & Assumptions

- **Scope focus:** DevAgent repository restructure only
- **Key assumptions:**
  - All 12 agent instruction sheets require path updates (detected 79 references via grep)
  - Clean cut approach - no backwards compatibility or migration guides
  - All agent workflows will be tested in the new structure
- **Out of scope:**
  - Migration guides for existing projects
  - External project validation
  - Rollout planning and support
  - Automated sync CLI tooling (future work)
  - Tool-specific implementations under `.devagent/tools/`

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
  5b. `Move feature hub template to core/templates/feature-hub-template/` — Relocate `.devagent/features/_template/` to `.devagent/core/templates/feature-hub-template/`
     - Entry points: `.devagent/features/_template/` (README.md, research/, spec/)
     - Rationale: Feature hub template is reusable scaffold, should be part of portable core kit
     - Acceptance: _template moved to core/templates/feature-hub-template/, contains README.md and empty research/spec directories
  6. `Move product/ to workspace/product/` — Relocate mission.md, roadmap.md, guiding-questions.md
     - Entry points: `.devagent/product/` → `.devagent/workspace/product/`
     - Acceptance: All 3 product files moved
  7. `Move memory/ to workspace/memory/` — Relocate constitution.md, decision-journal.md, tech-stack.md, overview.md, _archive/
     - Entry points: `.devagent/memory/` → `.devagent/workspace/memory/`
     - Acceptance: All memory files moved, _archive/ preserved
  8. `Move features/ to workspace/features/` — Relocate feature hub directory (excluding _template which moves to core)
     - Entry points: `.devagent/features/` → `.devagent/workspace/features/`
     - Note: _template/ already moved to core/templates/feature-hub-template/ in step 5b
     - Acceptance: All feature hubs moved, README.md preserved, _template/ is in core not workspace
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

### Task 3: Update Core Documentation

- **Objective:** Update AGENTS.md with new paths, create core/README.md with setup instructions
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
  4. `Update root README.md` — Update main project README to reference new structure
     - Entry point: `/Users/jaruesink/projects/devagent/README.md`
     - Acceptance: README explains `core/` vs `workspace/` distinction, links to `core/README.md`
  5. `Update template self-references` — Update file path placeholders in templates
     - Entry points: All files in `.devagent/core/templates/` that reference their own location
     - Example: task-plan-template.md line 8 references file location pattern
     - Acceptance: Templates reference `workspace/` for output locations, `core/` for template source
- **Validation plan:** Review all documentation for path accuracy, verify with manual spot-checks


## Risk Register

| Risk | Impact | Mitigation | Owner |
| --- | --- | --- | --- |
| Agent path updates incomplete (79+ references) | High - broken workflows | Automated grep validation in Task 2, manual spot-checking | @jaruesink |
| Template self-references missed | Low - user confusion | Comprehensive template audit in Task 3.5 | @jaruesink |
| Agent-to-agent handoffs fail with new paths | Medium - workflow breakage | Manual verification when using agents post-merge | @jaruesink |

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
- [ ] Feature hub template moved to `core/templates/feature-hub-template/`
- [ ] All workspace artifacts moved to `workspace/` subdirectories
- [ ] Zero old path patterns detected in `grep` audit
- [ ] Documentation complete (`core/README.md`, updated `AGENTS.md`, root README)
- [ ] Structure validated and ready for use

## Open Questions

| Question | Impact | Owner | Target Resolution |
| --- | --- | --- | --- |
| Should root AGENTS.md remain or move entirely to core/? | Low - documentation organization | @jaruesink | Task 3.3 |
| Do any agents have implicit path assumptions in logic? | Medium - hidden breakage | Manual testing post-merge | Post-implementation |
| Should we create workspace/.gitkeep files for empty dirs? | Low - git tracking | @jaruesink | Task 1 |

## Implementation Notes

- **Sequencing rationale:** Tasks 1-2 are tightly coupled (move then update references), Task 3 adds documentation
- **Validation approach:** Manual spot-checking of agent workflows post-implementation to verify paths work correctly
- **Incremental commits:** Commit after each major task (1, 2, 3) to enable granular rollback if needed

## Next Steps

1. Review this task plan with @jaruesink for approval
2. Begin Task 1 execution with directory structure creation
3. Maintain task status updates in this document during implementation
4. Merge to main once all tasks complete

