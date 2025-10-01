# Core-Workspace Split: Portable Agent Kit Structure

- Owner: @jaruesink / #SpecArchitect
- Last Updated: 2025-10-01
- Status: Draft
- Related Feature Hub: `.devagent/features/2025-10-01_core-workspace-split/`
- Stakeholders: @jaruesink (DRI, Approval)
- Related Clauses: C2 (Chronological Feature Artifacts), C4 (Tool-Agnostic Design)

## Summary

Restructure the `.devagent/` directory to separate portable, reusable agent definitions and templates (`core/`) from project-specific working artifacts (`workspace/`). This enables teams to copy a proven agent kit into new projects instantly while maintaining clean boundaries between template logic and project state. The change eliminates current ambiguity around what files are "framework" vs. "project data" and supports the mission goal of making DevAgent adoption friction-free across Lambda Curry projects.

## Context & Problem

**Current State:**
The `.devagent/` directory mixes reusable components (agents, templates, AGENTS.md) with project-specific state (features, memory, product mission). When starting a new project, developers must manually identify which files to copy, which to customize, and which to ignore. This friction slows adoption and creates maintenance drift when agent definitions are updated—teams must manually sync changes across projects.

**User Pain:**
- New project setup requires careful file selection and risks missing core agent definitions
- Agent updates must be manually propagated to each project using DevAgent
- Unclear which artifacts should be version-controlled vs. gitignored
- Onboarding teammates requires explaining the implicit boundary between "kit" and "project"

**Business Trigger:**
The mission targets "30 days: Daily coding in DevAgent prompts feels natural for the founders, and at least one additional teammate adopts the workflow." Current structure friction delays that adoption. Solving this unblocks faster experimentation across Lambda Curry's client projects.

## Objectives & Success Metrics

**Product Outcomes:**
1. Developers can initialize a new project with DevAgent agents in under 5 minutes
2. Agent definition updates propagate to all projects without manual file hunting
3. Team members immediately understand what's portable vs. project-specific

**Business Outcomes:**
- Accelerates the "30-day adoption" mission metric by removing setup friction
- Increases likelihood of cross-project agent reuse, compounding velocity gains

**Experience Outcomes:**
- Onboarding docs shrink from "which files to copy" to "copy `core/`, initialize `workspace/`"
- Clear mental model: `core/` = readonly template kit, `workspace/` = living project context

**Metrics:**
- **Baseline:** Current setup requires ~15-20 minutes and 3+ rounds of clarification
- **Target:** Setup in under 5 minutes with zero clarification questions
- **Signal:** At least two Lambda Curry projects adopt the new structure within 30 days

## Users & Insights

**Target Users:**
1. **Lambda Curry developers** starting new client projects or internal tools
2. **Engineering managers** introducing AI workflows to teams with mixed AI proficiency
3. **Open-source contributors** (future) who want to fork DevAgent for their own org

**Key Insights:**
- Developers expect "framework" code to be clearly separated from "application" code (standard pattern in Rails, Django, Next.js)
- Teams value incremental adoption—ability to copy agents selectively without carrying unused scaffolding
- Clear directory naming ("core" vs. "workspace") reduces cognitive load during setup

**Demand Signals:**
- Initial DevAgent usage revealed confusion about which files to edit vs. preserve
- Current conversation explicitly requested "a folder I can copy and paste into any project"

## Solution Principles

1. **Maximize portability:** `core/` must work in any project without modification
2. **Preserve tool-agnosticism:** No vendor lock-in (aligns with C4)
3. **Support incremental adoption:** Projects can use a subset of agents without breaking references
4. **Maintain backwards compatibility during migration:** Existing `.devagent/` projects should continue working
5. **Optimize for onboarding clarity:** New developers should immediately grasp the structure

## Scope Definition

### In Scope
- Reorganize `.devagent/` into `core/` and `workspace/` subdirectories
- Update all agent instruction sheets to reference new paths (`.devagent/core/templates/...`, `.devagent/workspace/features/...`)
- Update AGENTS.md and create a new `core/README.md` with setup instructions
- Create a migration guide for existing DevAgent projects
- Test the new structure against at least one real Lambda Curry project

### Out of Scope / Future
- Automated sync tools to pull `core/` updates from a central repo (future: DevAgent CLI)
- Versioning or release tagging for `core/` kit snapshots (defer until multi-project usage confirms need)
- Tool-specific implementations under `.devagent/tools/` (separate future work per C4)
- Migration of existing feature hubs' historical artifacts (preserve in place, new work uses new paths)

## Functional Narrative

### Flow 1: Initialize DevAgent in a New Project

**Trigger:** Developer starts a greenfield project or wants to add DevAgent to an existing codebase

**Experience Narrative:**
1. Developer copies `.devagent/core/` directory from the DevAgent repository into their project root
2. Developer runs initialization (manual steps or future script) to create `.devagent/workspace/` skeleton
3. Developer customizes `.devagent/workspace/product/mission.md` with project-specific mission
4. Developer invokes first agent (e.g., `#ProductMissionPartner`) using standard syntax—no path customization required

**Acceptance Criteria:**
- [ ] `core/` directory contains all agent definitions, templates, and AGENTS.md
- [ ] Copying `core/` alone allows immediate agent invocation without errors
- [ ] `workspace/` skeleton includes empty directories for `product/`, `memory/`, `features/`, `research/`
- [ ] Setup completes in under 5 minutes for a developer unfamiliar with DevAgent

### Flow 2: Update Agent Definitions Across Projects

**Trigger:** Agent logic improves in the DevAgent repository and teams want to adopt updates

**Experience Narrative:**
1. Developer pulls latest DevAgent repository changes
2. Developer copies updated `core/` directory into their project, overwriting existing `core/`
3. All agent references continue working because `workspace/` paths remain unchanged
4. Developer reviews changelog in `core/README.md` to understand what changed

**Acceptance Criteria:**
- [ ] Overwriting `core/` never touches `workspace/` artifacts
- [ ] Agent path references are stable—no per-project customization needed
- [ ] `core/README.md` includes version/changelog guidance

### Flow 3: Agent Executes Feature Work in Restructured Environment

**Trigger:** Developer invokes `#SpecArchitect` to draft a spec

**Experience Narrative:**
1. Developer references feature context: `.devagent/workspace/features/2025-10-01_example/`
2. Agent reads spec template from: `.devagent/core/templates/spec-document-template.md`
3. Agent writes output to: `.devagent/workspace/features/2025-10-01_example/spec/2025-10-01_spec.md`
4. All references and links work as expected—no manual path corrections needed

**Acceptance Criteria:**
- [ ] Agent instruction sheets correctly reference `.devagent/core/...` for templates
- [ ] Agent instruction sheets correctly reference `.devagent/workspace/...` for working artifacts
- [ ] No hardcoded assumptions about directory depth or project name
- [ ] Agent workflows function identically to pre-restructure behavior

### Flow 4: Migrate Existing DevAgent Project

**Trigger:** Existing DevAgent project wants to adopt new structure

**Experience Narrative:**
1. Developer reads migration guide in `core/README.md`
2. Developer creates `core/` and `workspace/` directories
3. Developer moves agents and templates to `core/`, features and memory to `workspace/`
4. Developer updates custom agent extensions (if any) to reference new paths
5. Developer validates by running one agent workflow end-to-end

**Acceptance Criteria:**
- [ ] Migration guide provides file-by-file move instructions
- [ ] Migration preserves all existing feature hub history and decision logs
- [ ] Agent invocations work after migration without syntax changes
- [ ] Migration time under 15 minutes for a standard DevAgent setup

## Technical Notes & Dependencies

### Directory Structure Detail

```
.devagent/
├── core/                              # PORTABLE - Copy to any project
│   ├── agents/                        # Agent instruction sheets
│   │   ├── ProductMissionPartner.md
│   │   ├── FeatureClarifyAgent.md
│   │   ├── FeatureBrainstormAgent.md
│   │   ├── ResearchAgent.md
│   │   ├── SpecArchitect.md
│   │   ├── TaskPlanner.md
│   │   ├── TaskExecutor.md
│   │   ├── TechStackAgent.md
│   │   ├── AgentBuilder.md
│   │   └── codegen/
│   │       └── CodegenBackgroundAgent.md
│   ├── templates/                     # Reusable document templates
│   │   ├── agent-brief-template.md
│   │   ├── brainstorm-packet-template.md
│   │   ├── clarification-packet-template.md
│   │   ├── clarification-questions-framework.md
│   │   ├── constitution-template.md
│   │   ├── research-packet-template.md
│   │   ├── spec-document-template.md
│   │   ├── task-plan-template.md
│   │   ├── task-prompt-template.md
│   │   └── tech-stack-template.md
│   ├── AGENTS.md                      # Agent roster documentation
│   └── README.md                      # Core kit usage & setup instructions
│
└── workspace/                         # PROJECT-SPECIFIC - Changes per project
    ├── product/                       # Product mission & strategy
    │   ├── mission.md
    │   ├── roadmap.md
    │   └── guiding-questions.md
    ├── memory/                        # Project constitution & decisions
    │   ├── constitution.md
    │   ├── decision-journal.md
    │   ├── tech-stack.md
    │   ├── overview.md
    │   └── _archive/                  # Historical constitution snapshots
    ├── features/                      # Feature hubs with research & specs
    │   ├── README.md
    │   ├── _template/
    │   │   └── README.md
    │   └── YYYY-MM-DD_feature-slug/
    │       ├── README.md
    │       ├── research/
    │       │   └── YYYY-MM-DD_topic.md
    │       └── spec/
    │           └── YYYY-MM-DD_spec.md
    ├── research/                      # Cross-cutting research
    │   └── YYYY-MM-DD_topic.md
    └── tasks/                         # Task execution logs (future)
        └── YYYY-MM-DD_task-id.md
```

### Path Reference Updates

All agent instruction sheets must be updated to use new path conventions:

**Template References (read-only):**
- Old: `.devagent/templates/spec-document-template.md`
- New: `.devagent/core/templates/spec-document-template.md`

**Working Artifact References:**
- Old: `.devagent/features/YYYY-MM-DD_slug/`
- New: `.devagent/workspace/features/YYYY-MM-DD_slug/`

**Agent References:**
- Old: See `.devagent/agents/ResearchAgent.md`
- New: See `.devagent/core/agents/ResearchAgent.md`

### Platform Considerations

- **Version Control:** `core/` should be tracked; `workspace/` tracking is project-dependent
- **Portability:** All paths must use relative references from `.devagent/` root
- **OS Compatibility:** Use forward slashes in documentation; scripts should detect OS

### Data Migration

Existing DevAgent projects have artifacts at legacy paths. Migration options:

1. **Big-bang reorg:** Move files atomically, update all references at once
2. **Symlink bridge:** Create symlinks at old paths pointing to new locations during transition
3. **Dual-path support:** Agents check both old and new paths with deprecation warnings

**Recommendation:** Big-bang reorg for DevAgent repo itself (dogfooding), symlink bridge for external adopters.

## Risks & Open Questions

| Item | Type | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Existing projects break if they pull updates without migrating | Risk | @jaruesink | Provide clear migration guide + changelog in README | Before merge |
| Agents reference old paths in examples or error messages | Risk | @jaruesink | Audit all agent `.md` files for hardcoded paths | During implementation |
| Teams may want different `workspace/` layouts per project type | Question | @jaruesink | Start with opinionated default, document customization in FAQ | Post-launch |
| Should `core/README.md` include setup script or just manual steps? | Question | @jaruesink | Manual steps for v1, script if 3+ projects adopt | Post-validation |
| Do we version `core/` (e.g., `core-v1.0/`) or rely on git tags? | Question | @jaruesink | Defer until multi-project usage reveals need | Post-validation |

## Delivery Plan

### Milestones

**Phase 1: Structure & Documentation (Week 1)**
- Create `core/` and `workspace/` directories in DevAgent repo
- Move files to new locations
- Update `AGENTS.md` and create `core/README.md` with setup guide
- Draft migration guide

**Phase 2: Agent Reference Updates (Week 1)**
- Audit all agent instruction sheets for path references
- Update agent `.md` files to use new paths
- Update templates to reference new structure
- Test agent invocations end-to-end

**Phase 3: Validation & Documentation (Week 2)**
- Apply new structure to one Lambda Curry project
- Time setup process and iterate on friction points
- Document edge cases and FAQs
- Update constitution (C2) if needed

**Phase 4: Rollout & Iteration (Week 3+)**
- Merge changes to DevAgent main branch
- Announce to Lambda Curry team with migration guide
- Support early adopters through migration
- Collect feedback for v2 improvements

### Review Gates

- **Pre-implementation:** Design review with @jaruesink (this spec)
- **Post-migration:** Validation with one real project (sign-off: successful agent run)
- **Pre-announce:** Documentation completeness check (setup guide, migration guide, FAQ)

### Analytics & QA Requirements

**Validation Signals:**
- Setup time measured via stopwatch during test runs
- Zero clarification questions needed during setup by unfamiliar developer
- All agents execute successfully in migrated structure
- At least one Lambda Curry project adopts within 30 days

**Rollback Plan:**
If validation fails, revert to flat `.devagent/` structure and document lessons learned in feature hub.

## Approval & Ops Readiness

### Required Approvals
- [x] Product: @jaruesink (aligned with mission metric)
- [ ] Implementation: @jaruesink (sign-off after validation phase)

### Operational Checklist
- [ ] Update onboarding documentation with new structure
- [ ] Add setup instructions to DevAgent repository README
- [ ] Create migration guide for existing projects
- [ ] Announce change in Lambda Curry team channel
- [ ] Monitor adoption and address blockers within 48 hours

## Appendices & References

### Related Artifacts
- Mission: `.devagent/workspace/product/mission.md` (30-day adoption metric)
- Constitution: Clause C2 (Chronological Feature Artifacts), C4 (Tool-Agnostic Design)
- Agent Roster: `.devagent/core/AGENTS.md`
- Feature Hub: `.devagent/workspace/features/2025-10-01_core-workspace-split/`

### Precedent Research
- GitHub Spec Kit uses similar separation of `docs/` templates and project-specific content
- Rails convention: `lib/` (framework) vs. `app/` (project)
- Next.js: `node_modules/` (portable) vs. `src/` (project-specific)

## Change Log

| Date | Change | Author |
| --- | --- | --- |
| 2025-10-01 | Initial spec draft | #SpecArchitect / @jaruesink |

---

**Related Clauses:** C2, C4
