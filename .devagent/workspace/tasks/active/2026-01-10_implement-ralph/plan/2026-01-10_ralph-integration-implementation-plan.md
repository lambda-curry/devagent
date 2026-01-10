# Ralph Integration Implementation Plan

- Owner: PlanAuthor
- Last Updated: 2026-01-10
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/active/2026-01-10_implement-ralph/`
- Stakeholders: AgentBuilder (Technical Lead), ProductMissionPartner (Product Alignment)
- Notes: Remove sections marked (Optional) if they do not apply.

---

## PART 1: PRODUCT CONTEXT

### Summary
Implement Ralph as an optional DevAgent plugin to provide autonomous execution capabilities that complement DevAgent's workflow orchestration system. This plugin architecture will enhance DevAgent's delivery speed while maintaining core simplicity and constitutional alignment.

### Context & Problem
DevAgent currently lacks autonomous execution capabilities - all workflows require manual step-by-step execution. Ralph provides a proven autonomous execution loop that can accelerate delivery while maintaining quality through automated testing and verification. Research shows strong architectural compatibility and constitutional alignment, with the main challenge being plugin architecture design that preserves DevAgent's core simplicity and human-in-the-loop defaults.

Ralph operates as a **guidance layer** that leverages existing project infrastructure rather than replacing development tools. Projects maintain responsibility for their own git setup, linting configurations, testing frameworks, and CI/CD pipelines, while Ralph provides intelligent orchestration and Beads-based task management.

### Objectives & Success Metrics
- **Product Objective:** Enable autonomous execution of DevAgent plans while maintaining quality standards
- **Business Objective:** Accelerate delivery speed for teams using DevAgent workflows
- **Success Metrics:**
  - Ralph successfully converts DevAgent plans to Beads hierarchical structure
  - Autonomous execution leverages Beads' native memory and state management (comments, audit trail, status tracking)
  - Ralph uses `bd ready` for task selection and Beads comments for progress tracking
  - Integration preserves DevAgent's workflow orchestration clarity
  - Tool-agnostic design supports multiple AI CLI tools

### Users & Insights
**Primary Users:** Engineering teams using DevAgent workflows who want accelerated execution
**Key Insights:**
- Teams want faster delivery without sacrificing quality
- Autonomous execution should complement, not replace, human oversight
- Tool-agnostic design is essential for diverse development environments
- Quality gates must be configurable per project type

### Solution Principles
- **Constitutional Alignment:** Maintain DevAgent's delivery principles, especially human-in-the-loop defaults (C3.1)
- **Tool-Agnostic Design:** Support multiple AI CLI tools per C4 principles
- **Plugin Architecture:** Implement Ralph as optional DevAgent plugin, preserving core simplicity
- **Clear Separation:** Preserve distinction between strategic orchestration (DevAgent) and specialized capabilities (plugins)
- **Quality Preservation:** Ensure autonomous output meets or exceeds manual quality standards
- **Forward Evolution:** Design without backwards compatibility constraints per C5

### Scope Definition
- **In Scope:** 
  - Plugin system foundation (`.devagent/core/plugin-system/`)
  - Ralph as optional plugin (`.devagent/plugins/ralph/`)
  - Plugin manager with installation/management capabilities
  - Plan-to-Beads conversion utility with hierarchical task structure
  - Quality gate configuration templates
  - Ralph-Beads integration (replacing file-based memory with Beads' native system)
  - Plugin workflow (`execute-autonomous`) that uses Beads for memory/state management
- **Out of Scope / Future:** 
  - Complete replacement of manual workflow execution
  - Real-time collaboration features
  - Multi-agent coordination systems
  - Third-party plugin marketplace (future consideration)

### Functional Narrative

#### Flow 1: Plugin Installation and Discovery
- **Trigger:** User runs `devagent plugin install ralph`
- **Experience narrative:** Plugin manager downloads and installs Ralph plugin, registers it in plugin registry, makes new workflows and commands available
- **Acceptance criteria:** Plugin installs successfully, new capabilities are discoverable, core DevAgent remains unaffected

#### Flow 2: Plan to Autonomous Execution
- **Trigger:** User runs `devagent execute-autonomous` with a completed plan (available only after plugin installed)
- **Experience narrative:** Plugin workflow converts plan to Beads-compatible tasks, launches Ralph execution loop, monitors progress through Beads, and reports results back to DevAgent task tracking
- **Acceptance criteria:** Plan successfully converts to Beads tasks, Ralph executes autonomously using existing project tooling, progress is tracked, results feed back into DevAgent

#### Flow 3: Quality Gate Integration
- **Trigger:** Ralph completes task implementation
- **Experience narrative:** Plugin runs project-specific quality gates (tests, linting, type checking), validates results, and reports success/failure through DevAgent's tracking system
- **Acceptance criteria:** Quality gates run automatically, failures block progress, successes enable next task

#### Flow 4: Plugin Management and Updates
- **Trigger:** User manages installed plugins
- **Experience narrative:** Users can list, update, or remove plugins through plugin manager, with clear visibility into what capabilities each plugin adds
- **Acceptance criteria:** Plugin lifecycle management works seamlessly, users understand installed capabilities

### Experience References (Optional)
- Ralph repository: [snarktank/ralph](https://github.com/snarktank/ralph)
- DevAgent Constitution: C1-C5 clauses for alignment requirements
- Existing task patterns in `.devagent/workspace/tasks/`

### Technical Notes & Dependencies
- **Data Needs:** Plan-to-Beads conversion, Ralph-Beads API integration for autonomous execution, Beads SQLite for memory/state management
- **Integrations:** AI CLI tools (Amp, Claude Code, etc.), GitHub CLI for PR/comment access, Beads SQLite for AI task management
- **Performance Considerations:** Context window management for large tasks
- **Platform Impacts:** Tool-agnostic design ensures cross-platform compatibility

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- **Scope focus:** Plugin system foundation and Ralph plugin implementation
- **Key assumptions:** 
  - Projects have existing test coverage for quality gates
  - Users understand autonomous execution risks and benefits
  - AI CLI tools are properly configured in user environment
- **Out of scope:** Real-time collaboration, multi-agent coordination, custom AI model training

### Implementation Tasks

#### Task 1: Create Plugin System Foundation
- **Objective:** Establish core plugin management framework and plugin interface
- **Impacted Modules/Files:** 
  - `.devagent/core/plugin-system/` (new directory)
  - `.devagent/core/plugin-system/plugin-manager.py` (Plugin lifecycle management)
  - `.devagent/core/plugin-system/plugin-interface.py` (Plugin contract definition)
  - `.devagent/core/plugin-system/plugin-registry.json` (Installed plugins registry)
- **Dependencies:** None
- **Acceptance Criteria:** 
  - Plugin system can discover, load, and manage plugins
  - Plugin interface defines clear contract for extensions
  - Plugin registry tracks installation state
  - Core DevAgent functionality unaffected when no plugins installed
- **Subtasks (optional):**
  1. Create directory structure following `.devagent/tools/` patterns — Rationale: Establishes tool-agnostic organization per C4
     - Validation: Verify structure matches DevAgent tooling conventions
  2. Integrate Ralph core files (ralph.sh, prompt.md) — Rationale: Provides autonomous execution engine
     - Validation: Test basic Ralph functionality in isolation
  3. Create configuration schema for DevAgent integration — Rationale: Enables project-specific customization
     - Validation: Configuration loads and validates correctly
- **Validation Plan:** Unit tests for configuration loading, integration tests for Ralph invocation

#### Task 2: Create Ralph Plugin Structure
- **Objective:** Establish `.devagent/plugins/ralph/` directory and core plugin files
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/` (new plugin directory)
  - `.devagent/plugins/ralph/plugin.json` (Plugin manifest)
  - `.devagent/plugins/ralph/tools/ralph.sh` (Ralph execution script)
  - `.devagent/plugins/ralph/tools/prompt.md` (Ralph instruction template)
  - `.devagent/plugins/ralph/tools/config.json` (Configuration schema)
- **Dependencies:** Task 1 (Plugin System Foundation)
- **Acceptance Criteria:**
  - Plugin directory follows DevAgent plugin conventions
  - Plugin manifest is valid and loads correctly
  - Core Ralph files are properly integrated and configured
  - Plugin can be discovered and loaded by plugin system
- **Subtasks (optional):**
  1. Create plugin directory structure — Rationale: Establishes standard plugin organization
     - Validation: Structure matches plugin system expectations
  2. Create plugin manifest with metadata — Rationale: Enables plugin discovery and registration
     - Validation: Manifest validates against plugin schema
  3. Integrate Ralph core files — Rationale: Provides autonomous execution engine
     - Validation: Ralph files are properly placed and accessible
- **Validation Plan:** Test plugin loading, verify Ralph files are correctly integrated

#### Task 3: Plan-to-Beads Conversion Utility
- **Objective:** Build utility to convert DevAgent plans into Beads SQLite database format for AI task management with full integration of Beads' native memory and state capabilities
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/tools/convert-plan.py` (Conversion script)
  - `.devagent/plugins/ralph/templates/beads-schema.json` (Beads task template)
  - `.devagent/plugins/ralph/tests/test-convert.py` (Conversion tests)
- **Dependencies:** Task 2 (Ralph Plugin Structure)
- **Acceptance Criteria:**
  - DevAgent plan sections map correctly to Beads task fields (Title, Description, AcceptanceCriteria, Priority)
  - Task hierarchy created as Epic → Task → Sub-task using Beads hierarchical IDs (bd-a3f8, bd-a3f8.1, bd-a3f8.1.1)
  - Dependencies established as Beads dependency relationships (blocks, parent-child)
  - Ralph integration points defined: Ralph calls `bd ready` to get next task, updates status to `in_progress`, uses Beads comments for progress tracking
  - Error handling for malformed plans
- **Subtasks (optional):**
  1. Design plan-to-beads mapping schema — Rationale: Leverages Beads' superior memory/state system vs simple file-based approaches
     - Validation: Schema handles all plan sections correctly, creates proper hierarchical structure
  2. Implement conversion script with Ralph integration — Rationale: Provides reliable transformation to Beads SQLite with Ralph workflow hooks
     - Validation: All test cases pass, edge cases handled, Ralph can read/write Beads database
  3. Create Ralph-Beads integration utilities — Rationale: Enables Ralph's autonomous loop using Beads' native capabilities instead of custom memory files
     - Validation: Ralph can successfully use `bd ready` for task selection, update task status, use comments for progress tracking
  4. Test with Beads API integration — Rationale: Ensures Ralph leverages Beads' built-in memory, audit trail, and state management
     - Validation: Template produces valid Beads task records, Ralph workflow integrates seamlessly
- **Validation Plan:** Test with multiple plan formats, validate Beads database integration, verify Ralph can execute autonomous loop using Beads commands

#### Task 4: Quality Gate Configuration Templates
- **Objective:** Create configurable quality gate templates for different project types with browser testing capabilities
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/quality-gates/` (new directory)
  - `.devagent/plugins/ralph/quality-gates/javascript.json` (JS/Node.js template)
  - `.devagent/plugins/ralph/quality-gates/python.json` (Python template)
  - `.devagent/plugins/ralph/quality-gates/typescript.json` (TypeScript template)
  - `.devagent/plugins/ralph/quality-gates/browser-testing.json` (Browser testing template)
  - `.devagent/plugins/ralph/tools/configure-quality-gates.py` (Setup script)
- **Dependencies:** Task 2 (Ralph Plugin Structure)
- **Acceptance Criteria:**
  - Templates cover common project types (JavaScript, Python, TypeScript)
  - Browser testing template requires Playwriter Chrome extension for front-end validation
  - Each template defines test, lint, type-checking, and browser testing commands
  - Configuration is extensible for new project types
  - Quality gates integrate with Ralph's execution loop
  - Ralph can autonomously test front-end changes through browser automation
- **Subtasks (optional):**
  1. Define quality gate schema and interface — Rationale: Standardizes gate configuration
     - Validation: Schema supports all required gate types including browser testing
  2. Create project-specific templates — Rationale: Provides ready-to-use configurations
     - Validation: Templates work on sample projects
  3. Document Playwriter setup requirements — Rationale: Enables Ralph to test front-end work autonomously using user's browser extension
     - Validation: Users can install Playwriter extension and configure MCP connection for browser testing
4. Add Linear summary capability — Rationale: Enables Ralph to provide completion summaries to human teams
     - Validation: Ralph can create optional Linear comments with task completion summaries
  4. Implement gate configuration detection — Rationale: Auto-selects appropriate template
     - Validation: Correct template selected for each project type
- **Validation Plan:** Test quality gates on sample projects, verify browser testing works for front-end changes, validate failure/success reporting

#### Task 5: Plugin Workflow Implementation
- **Objective:** Create Ralph plugin's `execute-autonomous` workflow that integrates Ralph's autonomous execution loop with Beads' native memory and state management system
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/workflows/execute-autonomous.md` (Plugin workflow)
  - `.devagent/plugins/ralph/commands/execute-autonomous.md` (Command interface)
  - `.devagent/plugins/ralph/tools/workflow-bridge.py` (Bridge logic)
  - `.devagent/plugins/ralph/tools/ralph-beads-bridge.py` (Ralph-Beads integration utilities)
- **Dependencies:** Task 2, Task 3, Task 4
- **Acceptance Criteria:**
  - Workflow converts plan to Beads and launches Ralph autonomously
  - Ralph uses `bd ready` to select next available task (replacing manual task selection)
  - Ralph updates task status to `in_progress` during implementation (replacing passes: false field)
  - Ralph runs quality gates, then updates task status to `closed` with success/failure reason
  - Ralph uses Beads comments for progress tracking and learning (replacing progress.txt + AGENTS.md)
  - Progress tracked through Beads' audit trail and reported back to DevAgent
  - User can monitor execution status and interrupt if needed
  - Integration follows DevAgent workflow patterns
- **Subtasks (optional):**
  1. Create workflow definition following DevAgent patterns — Rationale: Ensures consistent user experience with Beads integration
     - Validation: Workflow follows standard structure, calls Ralph-Beads bridge
  2. Implement Ralph-Beads integration utilities — Rationale: Replaces Ralph's file-based memory with superior Beads system
     - Validation: Ralph can query tasks, update status, add comments, handle dependencies via Beads API
  3. Implement autonomous execution loop with Beads — Rationale: Maps Ralph's iterative pattern to Beads workflow
     - Validation: Loop successfully: select task → implement → verify → update status → repeat
  4. Add command interface and Cursor integration — Rationale: Provides multiple access methods per C4
     - Validation: Commands invoke workflow correctly from all interfaces
- **Validation Plan:** End-to-end test with sample plan, verify Ralph executes autonomously using Beads for all memory/state operations

### Implementation Guidance

**From `.devagent/core/AGENTS.md` → Standard Workflow Instructions:**
- **Date Handling:** Always run `date +%Y-%m-%d` first to get current date in ISO format for creating dated documents
- **Storage Patterns:** Use `YYYY-MM-DD_<descriptor>.md` format for dated artifacts, task-scoped artifacts in `.devagent/workspace/tasks/{status}/`
- **Execution Directive:** When workflows are invoked, EXECUTE IMMEDIATELY without requiring approval for standard tasks
- **Context Gathering Order:** Review internal agent documentation first, then workflow definitions, then DevAgent workspace context

**From Constitution.md → Delivery Principles (C3):**
- **C3.1 Human-in-the-loop defaults:** Every agent interaction produces drafts that require explicit human confirmation before downstream automation proceeds
- **C3.2 Traceable artifacts:** All agent outputs must link to mission metrics and cite research inputs so stakeholders can audit decisions
- **C3.4 Guardrails before generation:** Establish constraints (tools, permissions, review gates) prior to code generation to prevent scope drift

**From Constitution.md → Tool-Agnostic Design (C4):**
- Agents, workflows, and tooling must be designed to be tool-agnostic by default, enabling use across any AI development tool
- Tool-specific implementations must be organized under clearly labeled tool-specific directory structures (e.g., `.devagent/tools/ralph/`)

**From Constitution.md → Evolution Without Backwards Compatibility (C5):**
- DevAgent workflows and templates evolve to serve current best practices without maintaining backwards compatibility
- When a workflow is superseded or a template is revised, remove it entirely and update all documentation references

### Release & Delivery Strategy (Optional)

**Milestone 1: Plugin System Foundation**
- Complete Task 1 (Plugin System Foundation)
- Validate plugin loading and management capabilities
- Review point: Core plugin architecture validation

**Milestone 2: Ralph Plugin Core**
- Complete Tasks 2-3 (Ralph Plugin Structure, Plan-to-PRD Conversion)
- Validate Ralph plugin installation and basic functionality
- Review point: Plugin installation and Ralph integration validation

**Milestone 3: Ralph Plugin Completion**
- Complete Tasks 4-5 (Quality Gates, Plugin Workflow)
- End-to-end testing with sample DevAgent plans using plugin
- Review point: Full plugin experience and production readiness

**Milestone 4: Plugin Ecosystem (Future)**
- Plugin installation CLI (`devagent plugin install ralph`)
- Plugin discovery and documentation system
- Review point: Plugin distribution and user experience validation

### Approval & Ops Readiness (Optional)

**Required Approvals:**
- **Technical:** AgentBuilder (architecture and integration approach)
- **Product:** ProductMissionPartner (mission alignment and user experience)
- **Constitutional:** Verify compliance with C1-C5 clauses

**Operational Checklist:**
- Documentation updated in AGENTS.md and workflow roster
- Quality gate templates tested with sample projects
- Error handling and failure recovery procedures documented
- User training materials created for autonomous execution workflow

---

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
|------|------------------------|-------|------------------------|-----|
| Task size estimation complexity | Risk | AgentBuilder | Implement task breaking utility, provide guidelines for plan authors | Task 2 completion |
| Quality gate reliability across project types | Risk | AgentBuilder | Create extensible template system, validate with diverse sample projects | Task 3 completion |
| Autonomous execution acceptance (C3.1 compliance) | Risk | ProductMissionPartner | Design explicit confirmation gates, preserve human oversight options | Task 4 completion |
| Ralph-Beads integration complexity | Risk | AgentBuilder | Ensure Ralph properly leverages Beads' native memory/state system rather than reimplementing file-based approach | Task 3 completion |
| How should Ralph handle tasks exceeding context window? | Question | AgentBuilder | Research and implement task splitting strategies | Research phase |
| What quality gates should be required vs optional? | Question | AgentBuilder | Define minimum quality standards per project type | Task 3 completion |

---

## Progress Tracking
Refer to the AGENTS.md file in the task directory for instructions on tracking and reporting progress during implementation.

---

## Appendices & References (Optional)
- **Research packet:** `.devagent/workspace/research/2026-01-10_ralph-integration-research.md`
- **Brainstorm findings:** `.devagent/workspace/product/brainstorms/2026-01-10_ralph-integration-capabilities.md`
- **Constitution:** `.devagent/workspace/memory/constitution.md` (Clauses C1-C5)
- **Product mission:** `.devagent/workspace/product/mission.md`
- **Workflow roster:** `.devagent/core/AGENTS.md`
- **Plan template:** `.devagent/core/templates/plan-document-template.md`
- **Ralph repository:** https://github.com/snarktank/ralph