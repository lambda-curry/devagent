# Ralph Integration Research

## Classification & Assumptions

**Classification:** Implementation Design - Researching autonomous AI agent loop integration with DevAgent workflow system  
**Assumptions:** Ralph should complement existing DevAgent workflows, not replace them; autonomous execution must align with DevAgent's human-in-the-loop principles

## Research Plan (Validated Targets)

1. **Ralph Architecture Analysis** - Understand core components (ralph.sh, prompt.md, prd.json, progress.txt) and execution patterns
2. **DevAgent Alignment Assessment** - Evaluate Ralph against DevAgent constitution clauses and delivery principles  
3. **Integration Strategy Development** - Determine optimal integration patterns (workflow, tooling, or separate project)
4. **Technical Implementation Considerations** - Identify technical requirements and potential friction points
5. **Workflow Synergy Opportunities** - Map Ralph's autonomous execution to DevAgent's existing workflow roster

## Sources

1. **Primary Ralph Repository** - [snarktank/ralph](https://github.com/snarktank/ralph) (1.2k stars, 199 forks, active as of 2026-01-08)
2. **Ralph Documentation** - Complete README, ralph.sh script, prompt.md instructions, and prd.json structure
3. **DevAgent Constitution** - `/Users/jake/projects/devagent/.devagent/workspace/memory/constitution.md` (Clauses C1-C5)
4. **DevAgent Product Mission** - `/Users/jake/projects/devagent/.devagent/workspace/product/mission.md`
5. **DevAgent Workflow Roster** - `/Users/jake/projects/devagent/.devagent/core/AGENTS.md`
6. **Existing Task Patterns** - Analysis of completed tasks in `/Users/jake/projects/devagent/.devagent/workspace/tasks/`

## Findings & Tradeoffs

### Ralph Architecture Overview
- **Core Loop:** ralph.sh bash script runs AI agents repeatedly until tasks complete
- **Memory Persistence:** git history + progress.txt + prd.json (task status tracking)
- **Fresh Context:** Each iteration spawns new AI instance with clean context
- **Task Granularity:** Small, atomic tasks that fit in single context window
- **Quality Gates:** Typecheck, tests, browser verification for UI changes
- **Learning System:** AGENTS.md updates and progress.txt pattern accumulation

### DevAgent Alignment Assessment

**Alignment with Constitution:**
- ✅ **C1 Mission & Stakeholder Fidelity:** Ralph accelerates delivery while maintaining quality standards
- ✅ **C2 Chronological Task Artifacts:** Ralph produces git commits and progress logs
- ⚠️ **C3 Delivery Principles:** Partially aligned - Ralph is autonomous but DevAgent defaults to human-in-the-loop
- ✅ **C4 Tool-Agnostic Design:** Ralph can work with any AI CLI (Amp, Claude Code, etc.)
- ✅ **C5 Evolution Without Backwards Compatibility:** Ralph's simple architecture supports forward evolution

**Strengths:**
- Provides autonomous execution capability missing from current DevAgent roster
- Reinforces DevAgent's emphasis on traceable artifacts via git history
- Complements existing workflows rather than replacing them
- Simple, portable architecture aligns with DevAgent's design principles

**Concerns:**
- Autonomous execution may conflict with DevAgent's human-in-the-loop defaults (C3.1)
- Quality gates depend on project-specific test coverage
- Task size estimation complexity - requires breaking work into context-window sized pieces

### Integration Strategy Options

#### Option 1: DevAgent Workflow Feature
**Approach:** Add `devagent execute-autonomous` workflow to existing roster
**Pros:** 
- Unified system, familiar interface
- Leverages existing workspace structure
- Direct access to DevAgent mission and constraints

**Cons:**
- Workflow complexity - autonomous execution spans multiple tool boundaries
- May blur distinction between coordination (DevAgent) and execution (Ralph)

#### Option 2: DevAgent Tooling Extension  
**Approach:** Ralph as `.devagent/tools/ralph/` with optional workflow integration
**Pros:**
- Clear separation of concerns
- Tool-agnostic design per C4
- Can work with multiple AI CLI tools

**Cons:**
- Requires new tooling management patterns
- Less integrated with workflow orchestration

#### Option 3: Separate Project Integration
**Approach:** Ralph as standalone project that consumes DevAgent outputs
**Pros:**
- Maintains Ralph's simplicity and focus
- Clear ownership boundaries
- Can evolve independently

**Cons:**
- Requires coordination mechanisms
- Potential duplication of context management

### Technical Implementation Considerations

#### DevAgent Workflow Integration Points
- **Task Input:** Ralph could consume `devagent create-plan` outputs as prd.json
- **Progress Tracking:** Ralph's progress.txt could feed into DevAgent's review patterns
- **Quality Gates:** Ralph could integrate with DevAgent's existing quality standards
- **Learning System:** AGENTS.md updates align perfectly with DevAgent's knowledge accumulation

#### Architecture Compatibility
- **Memory Systems:** Complementary - DevAgent (structured artifacts) + Ralph (git history + patterns)
- **Context Management:** DevAgent (workflow orchestration) + Ralph (iteration context)
- **Quality Assurance:** Shared emphasis on testing and code quality
- **Human Oversight:** DevAgent (strategic decisions) + Ralph (tactical implementation)

#### Friction Points
- **Task Size Translation:** DevAgent plans contain multi-week work, Ralph needs context-window sized tasks
- **Quality Gate Configuration:** Different projects have different testing/linting requirements
- **Branch Management:** Ralph creates feature branches, DevAgent workflows typically work on main/develop
- **Commit Message Standards:** Ralph's simple format vs DevAgent's structured commit expectations

## Recommendation

**Primary Recommendation:** **Option 2 - DevAgent Tooling Extension**

Implement Ralph as `.devagent/tools/ralph/` with optional workflow integration points:

1. **Core Integration:** Ralph consumes DevAgent plan outputs as prd.json
2. **Tool-agnostic Design:** Support multiple AI CLI tools per C4
3. **Workflow Bridge:** Add `devagent execute-autonomous` that sets up and launches Ralph
4. **Quality Gate Templates:** Configurable testing/linting patterns per project type
5. **Learning Synchronization:** Ralph progress feeds into DevAgent's review and update cycles

**Rationale:**
- Preserves DevAgent's workflow orchestration clarity
- Maintains Ralph's simple, focused architecture  
- Aligns with DevAgent's tool-agnostic design principles (C4)
- Provides clear separation between strategic (DevAgent) and tactical (Ralph) execution
- Supports evolution without backwards compatibility concerns (C5)

## Repo Next Steps

**Immediate (1-2 weeks):**
- [ ] Create `.devagent/tools/ralph/` directory structure
- [ ] Implement plan-to-prd.json conversion utility
- [ ] Add Ralph quality gate configuration templates
- [ ] Create `devagent execute-autonomous` workflow bridge

**Short-term (2-4 weeks):**
- [ ] Test Ralph integration with existing DevAgent task structure
- [ ] Implement AGENTS.md synchronization between Ralph and DevAgent
- [ ] Add project-specific quality gate patterns
- [ ] Create documentation and usage examples

**Medium-term (1-2 months):**
- [ ] Validate integration with multiple AI CLI tools
- [ ] Add progress tracking integration with DevAgent review workflows
- [ ] Implement task size estimation and breaking utilities
- [ ] Add continuous integration testing for Ralph scenarios

## Risks & Open Questions

**Technical Risks:**
- **Task Size Estimation:** Breaking complex DevAgent plans into Ralph-compatible atomic tasks
- **Quality Gate Configuration:** Ensuring reliable testing across diverse project types
- **Memory Synchronization:** Preventing conflicts between DevAgent and Ralph learning systems

**Organizational Risks:**
- **Autonomous Execution Acceptance:** Balancing automation with DevAgent's human-in-the-loop defaults (C3.1)
- **Quality Expectations:** Ensuring Ralph's autonomous output meets team quality standards
- **Integration Complexity:** Managing two systems with overlapping responsibilities

**Open Questions:**
- How should Ralph handle tasks that exceed single context window capabilities?
- What quality gate patterns should be required vs. optional for Ralph execution?
- How should progress from Ralph sessions be incorporated into DevAgent's task completion criteria?
- Should Ralph respect DevAgent's delivery principle of "human-in-the-loop defaults" or operate as an exception?

**Related Clauses:** C1, C3, C4, C5  
**Storage Path:** `/Users/jake/projects/devagent/.devagent/workspace/research/2026-01-10_ralph-integration-research.md`
