# Standard Workflow Instructions Centralization Plan

- Owner: Jake Ruesink
- Last Updated: 2025-12-27
- Status: Draft
- Related Feature Hub: `.devagent/workspace/features/completed/2025-12-27_standard-workflow-instructions-centralization/`
- Stakeholders: Jake Ruesink (Owner, Decision Maker)
- Notes: This is a workflow architecture improvement to reduce duplication and improve consistency across DevAgent workflows.

---

## PART 1: PRODUCT CONTEXT

### Summary
DevAgent workflows currently repeat common instructions (execution directives, date retrieval, context gathering patterns, guardrails) across all 14 workflow files, creating maintenance burden and inconsistency risks. Research identifies that Builder.io and similar tools centralize common AI agent instructions in AGENTS.md files. This plan implements a hybrid centralization approach: add a "Standard Workflow Instructions" section to `.devagent/core/AGENTS.md` containing common patterns, then update workflows to reference these standards while preserving workflow-specific details. This reduces duplication, improves maintainability, aligns with industry patterns, and enables gradual adoption without breaking existing workflows.

### Context & Problem

**Current State:**
- All 14 workflow files repeat similar execution directive language with minor variations
- 8 workflows include identical date retrieval instructions (`date +%Y-%m-%d`)
- 14 workflows define similar context gathering patterns with slight variations
- Standard guardrails (redact secrets, tag uncertainties) are repeated across multiple workflows
- Git user retrieval pattern appears in 2 workflows but should be standardized
- Storage policy patterns (dated filenames, inline vs file rules) are repeated across all workflows

**User Pain:**
- When updating common patterns (like date handling), maintainers must update multiple workflow files
- Inconsistencies emerge when workflows are updated independently
- New workflow creators may not know standard patterns to follow
- AI agents executing workflows see slightly different instructions across workflows, reducing consistency

**Business Trigger:**
- Recent pattern standardization (date handling) highlighted the duplication problem
- Research reveals industry best practice (Builder.io AGENTS.md pattern) that matches DevAgent's needs
- Constitution C4 (Tool-Agnostic Design) and C5 (Evolution Without Backwards Compatibility) support this improvement
- Workflow roster is stable enough to identify common patterns

**Research Evidence:**
See `research/2025-12-27_workflow-pre-read-instructions-centralization.md` for detailed analysis of repeated patterns and tradeoff analysis.

### Objectives & Success Metrics

**Objectives:**
1. Reduce duplication of common workflow instructions across all 14 workflows
2. Establish single source of truth for standard workflow patterns in AGENTS.md
3. Improve consistency across workflows by referencing shared standards
4. Align with industry best practices (Builder.io AGENTS.md pattern)
5. Enable gradual adoption without breaking existing workflows

**Success Metrics:**
- **Baseline:** 14/14 workflows contain duplicated common instructions
- **Target:** 1 central "Standard Workflow Instructions" section in AGENTS.md + workflows reference it
- **Consistency:** All workflows follow same patterns for date handling, context gathering, guardrails
- **Maintainability:** Single update point for common patterns (AGENTS.md section)
- **Adoption:** New workflows automatically follow standard patterns via template

### Users & Insights

**Primary Users:**
- **AI agents executing workflows** — Need consistent, clear instructions for common operations (date retrieval, context gathering, execution behavior)
- **Workflow maintainers** — Need single update point for common patterns to reduce maintenance burden
- **New workflow creators** — Need clear reference for standard patterns to follow

**Key Insights:**
- Patterns are already standardized in practice (e.g., date handling was recently unified)
- Research shows Builder.io pattern is successful for similar use cases
- All workflows should be updated immediately to ensure consistency across the entire roster
- Template updates ensure new workflows automatically follow standards

**Demand Signals:**
- Completed feature `2025-12-27_consistent-date-handling-workflows` demonstrates pattern standardization need
- Completed feature `2025-10-01_agent-execution-directive` shows execution directive standardization pattern
- Research document identifies clear duplication opportunities

### Solution Principles

1. **Centralize common, standardize specific:** Common instructions go in AGENTS.md, workflow-specific details stay in workflows
2. **Reference, don't replace:** Workflows reference AGENTS.md standards rather than removing all instructions (maintains readability)
3. **Complete implementation:** Update all 14 workflows immediately to ensure full consistency
4. **Backward compatible:** Existing workflows continue to work; references are additive
5. **Single source of truth:** AGENTS.md becomes authoritative reference for standard patterns
6. **Tool-agnostic:** Follows Constitution C4—no tool-specific dependencies

### Scope Definition

- **In Scope:**
  - Add "Standard Workflow Instructions" section to `.devagent/core/AGENTS.md`
  - Update `.devagent/core/templates/agent-brief-template.md` with reference pattern
  - Update all 14 workflows to reference standards (research.md, create-plan.md, new-feature.md, implement-plan.md, review-progress.md, review-pr.md, compare-prs.md, brainstorm.md, clarify-feature.md, update-product-mission.md, update-tech-stack.md, update-constitution.md, build-workflow.md, mark-feature-complete.md)
  - Standardize: date handling, metadata retrieval, context gathering order, guardrails, execution directive language, storage patterns

- **Out of Scope / Future:**
  - Creating separate WORKFLOW-STANDARDS.md file (keeps AGENTS.md as single reference)
  - Changing workflow-specific paths or storage locations (those remain in individual workflows)
  - Tool-specific instructions (per Constitution C4)

### Functional Narrative

**Flow 1: Adding Standard Instructions to AGENTS.md**
- **Trigger:** Plan approval
- **Experience narrative:**
  1. Developer opens `.devagent/core/AGENTS.md`
  2. Adds new "## Standard Workflow Instructions" section after "How Workflows Work in This Project"
  3. Populates section with standardized common instructions (date handling, metadata retrieval, context gathering, guardrails, execution directive, storage patterns)
  4. Uses exact language from research document recommendations
  5. Saves file
- **Acceptance criteria:**
  - AGENTS.md contains "Standard Workflow Instructions" section with all 6 subsections
  - Instructions use clear, imperative language
  - Section is discoverable (clear heading, logical placement)
  - Instructions match research document recommendations

**Flow 2: Updating Workflow Template**
- **Trigger:** After AGENTS.md section added
- **Experience narrative:**
  1. Developer opens `.devagent/core/templates/agent-brief-template.md`
  2. Adds "Standard Instructions Reference" section after "Purpose & Scope"
  3. Updates "Execution Directive" section to reference AGENTS.md standard
  4. Saves template
- **Acceptance criteria:**
  - Template includes reference to AGENTS.md standard instructions
  - Template Execution Directive references standard directive
  - Template provides clear guidance for workflow creators

**Flow 3: Updating All Workflows**
- **Trigger:** After template update
- **Experience narrative:**
  1. Developer opens each workflow file (all 14 workflows)
  2. Adds "Standard Instructions Reference" section referencing AGENTS.md (after "Purpose & Scope")
  3. Simplifies "Execution Directive" section to reference standard directive from AGENTS.md
  4. Simplifies date retrieval instructions to reference standard (where applicable)
  5. Simplifies context gathering section to reference standard order (where applicable)
  6. Preserves workflow-specific instructions that don't match standards
  7. Verifies all workflows still read correctly and reference standards
- **Acceptance criteria:**
  - All 14 workflows include reference to AGENTS.md standard instructions
  - Execution Directive sections reference standard directive (with workflow-specific customizations noted)
  - Date retrieval instructions reference standard (where applicable)
  - Context gathering sections reference standard order (where applicable)
  - All workflows remain functional and readable

**Flow 4: AI Agent Execution**
- **Trigger:** AI agent executes a workflow with standard instructions reference
- **Experience narrative:**
  1. AI agent reads workflow file
  2. Encounters "Standard Instructions Reference" section
  3. Reads referenced section in AGENTS.md
  4. Follows standard instructions for common operations (date retrieval, context gathering, etc.)
  5. Follows workflow-specific instructions for workflow-specific operations
- **Acceptance criteria:**
  - AI agents successfully reference AGENTS.md standards
  - Common operations follow standard patterns consistently
  - Workflow-specific operations still work correctly
  - No confusion from dual instruction sources

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- **Scope focus:** Add standard instructions section to AGENTS.md, update template, update all 14 workflows
- **Key assumptions:**
  - AGENTS.md structure can accommodate new section without breaking existing references
  - Workflow files can reference AGENTS.md sections without breaking workflow execution
  - All 14 workflows should be updated immediately to ensure full consistency
  - Template update ensures new workflows follow pattern automatically
- **Out of scope:** Changing workflow-specific storage paths, tool-specific instructions

### Implementation Tasks

#### Task 1: Add Standard Workflow Instructions Section to AGENTS.md
- **Objective:** Create centralized "Standard Workflow Instructions" section in `.devagent/core/AGENTS.md` containing all common workflow patterns identified in research.
- **Impacted Modules/Files:**
  - `.devagent/core/AGENTS.md` — Add new section after "How Workflows Work in This Project"
- **Dependencies:** None
- **Acceptance Criteria:**
  - AGENTS.md contains new "## Standard Workflow Instructions" section
  - Section includes 6 subsections: Date Handling, Metadata Retrieval, Context Gathering (Standard Order), Standard Guardrails, Execution Directive (Standard), Storage Patterns
  - Instructions use clear, imperative language matching research recommendations
  - Section placement is logical and discoverable
  - Existing AGENTS.md content remains intact
- **Subtasks:**
  1. Read current `.devagent/core/AGENTS.md` structure — Understand current organization
     - Validation: Verify section placement point
  2. Add "## Standard Workflow Instructions" section — Insert after "How Workflows Work in This Project" section
     - Validation: Verify section appears in correct location
  3. Add "### Date Handling" subsection — Include: run `date +%Y-%m-%d` first, use output for YYYY-MM-DD, do not infer date
     - Validation: Instructions match research document exactly
  4. Add "### Metadata Retrieval" subsection — Include: run `git config user.name` for owner/author metadata
     - Validation: Instructions are clear and actionable
  5. Add "### Context Gathering (Standard Order)" subsection — Include numbered list of context sources in standard order
     - Validation: Order matches research document recommendations
  6. Add "### Standard Guardrails" subsection — Include: prefer internal sources, redact secrets, tag uncertainties, cite file paths
     - Validation: Guardrails match research document
  7. Add "### Execution Directive (Standard)" subsection — Include standard execution directive language
     - Validation: Language matches common pattern across workflows
  8. Add "### Storage Patterns" subsection — Include: dated filenames format, inline vs file rules, standard paths
     - Validation: Patterns match research document recommendations
- **Validation Plan:** Manual review of AGENTS.md to verify section structure, content accuracy, and placement. Verify section is discoverable and well-organized.

#### Task 2: Update Workflow Template with Standard Instructions Reference
- **Objective:** Update `.devagent/core/templates/agent-brief-template.md` to include reference pattern to AGENTS.md standard instructions, ensuring new workflows automatically follow the pattern.
- **Impacted Modules/Files:**
  - `.devagent/core/templates/agent-brief-template.md` — Add "Standard Instructions Reference" section, update Execution Directive section
- **Dependencies:** Task 1 (AGENTS.md section must exist first)
- **Acceptance Criteria:**
  - Template includes "## Standard Instructions Reference" section after "Purpose & Scope"
  - Section references `.devagent/core/AGENTS.md` → Standard Workflow Instructions
  - Template "Execution Directive" section references standard directive from AGENTS.md
  - Template provides clear guidance for workflow creators
  - Existing template sections remain intact
- **Subtasks:**
  1. Read current template structure — Understand current organization
     - Validation: Identify insertion point for reference section
  2. Add "## Standard Instructions Reference" section — Insert after "Purpose & Scope", before "Operating Role & Execution Directive"
     - Validation: Section placement is logical
  3. Populate reference section — Include note about reviewing AGENTS.md standard instructions for: date handling, metadata retrieval, context gathering order, standard guardrails, storage patterns
     - Validation: References are clear and actionable
  4. Update "Execution Directive" section — Reference standard directive from AGENTS.md with note about workflow-specific customizations
     - Validation: Reference is clear and maintains template flexibility
- **Validation Plan:** Manual review of template to verify reference section structure and Execution Directive update. Verify template remains usable and clear.

#### Task 3: Update All Workflows to Reference Standard Instructions
- **Objective:** Update all 14 workflows to reference AGENTS.md standard instructions, ensuring full consistency across the workflow roster.
- **Impacted Modules/Files:**
  - `.devagent/core/workflows/research.md`
  - `.devagent/core/workflows/create-plan.md`
  - `.devagent/core/workflows/new-feature.md`
  - `.devagent/core/workflows/implement-plan.md`
  - `.devagent/core/workflows/review-progress.md`
  - `.devagent/core/workflows/review-pr.md`
  - `.devagent/core/workflows/compare-prs.md`
  - `.devagent/core/workflows/brainstorm.md`
  - `.devagent/core/workflows/clarify-feature.md`
  - `.devagent/core/workflows/update-product-mission.md`
  - `.devagent/core/workflows/update-tech-stack.md`
  - `.devagent/core/workflows/update-constitution.md`
  - `.devagent/core/workflows/build-workflow.md`
  - `.devagent/core/workflows/mark-feature-complete.md`
- **Dependencies:** Task 1 (AGENTS.md section), Task 2 (template pattern)
- **Acceptance Criteria:**
  - All 14 workflows include "## Standard Instructions Reference" section after "Purpose & Scope"
  - Execution Directive sections reference standard directive from AGENTS.md (with workflow-specific customizations noted where applicable)
  - Date retrieval instructions reference standard (where applicable)
  - Context gathering sections reference standard order from AGENTS.md (where applicable)
  - All workflows remain functional and readable
  - Workflow-specific instructions are preserved
- **Subtasks:**
  1. Update `research.md` — Add "Standard Instructions Reference" section, simplify execution directive, date retrieval, context gathering
     - Validation: Reference section present, instructions simplified
  2. Update `create-plan.md` — Add "Standard Instructions Reference" section, simplify execution directive, date retrieval, context gathering
     - Validation: Reference section present, instructions simplified
  3. Update `new-feature.md` — Add "Standard Instructions Reference" section, simplify execution directive, date retrieval
     - Validation: Reference section present, instructions simplified
  4. Update `implement-plan.md` — Add "Standard Instructions Reference" section, simplify execution directive
     - Validation: Reference section present, execution directive simplified
  5. Update `review-progress.md` — Add "Standard Instructions Reference" section, simplify execution directive, date retrieval
     - Validation: Reference section present, instructions simplified
  6. Update `review-pr.md` — Add "Standard Instructions Reference" section, simplify execution directive
     - Validation: Reference section present, execution directive simplified
  7. Update `compare-prs.md` — Add "Standard Instructions Reference" section, simplify execution directive
     - Validation: Reference section present, execution directive simplified
  8. Update `brainstorm.md` — Add "Standard Instructions Reference" section, simplify execution directive, date retrieval
     - Validation: Reference section present, instructions simplified
  9. Update `clarify-feature.md` — Add "Standard Instructions Reference" section, simplify execution directive, date retrieval
     - Validation: Reference section present, instructions simplified
  10. Update `update-product-mission.md` — Add "Standard Instructions Reference" section, simplify execution directive
     - Validation: Reference section present, execution directive simplified
  11. Update `update-tech-stack.md` — Add "Standard Instructions Reference" section, simplify execution directive
     - Validation: Reference section present, execution directive simplified
  12. Update `update-constitution.md` — Add "Standard Instructions Reference" section, simplify execution directive
     - Validation: Reference section present, execution directive simplified
  13. Update `build-workflow.md` — Add "Standard Instructions Reference" section, simplify execution directive
     - Validation: Reference section present, execution directive simplified
  14. Update `mark-feature-complete.md` — Add "Standard Instructions Reference" section, simplify execution directive
     - Validation: Reference section present, execution directive simplified
  15. Review all workflows — Verify all workflows remain functional and readable, check consistency
     - Validation: All workflows are complete, clear, and consistent
- **Validation Plan:** Manual review of all 14 workflow files to verify reference sections, simplified instructions, and overall workflow completeness. Verify all workflows can still be executed correctly and maintain consistency.

### Release & Delivery Strategy

**Implementation Approach:**
- Sequential task execution (Task 1 → Task 2 → Task 3)
- All 14 workflows updated in Task 3 for complete consistency
- Template update ensures new workflows automatically follow pattern

**Validation Gates:**
- Task 1: AGENTS.md section review for structure and content accuracy
- Task 2: Template review for reference pattern clarity
- Task 3: All 14 workflow files reviewed for consistency, readability, and functionality

---

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Workflow readability with external references | Risk | Jake Ruesink | Keep workflow-specific details in workflows, references are additive. Test proof-of-concept workflows for readability. | 2025-12-27 |
| AI agent confusion from dual instruction sources | Risk | Jake Ruesink | Use clear reference language. Test with proof-of-concept workflows to verify agents successfully reference AGENTS.md. | 2025-12-27 |
| AGENTS.md structure changes affecting existing references | Risk | Jake Ruesink | Add new section without modifying existing structure. Test that existing AGENTS.md references still work. | 2025-12-27 |
| Should all workflows be required to reference AGENTS.md? | Question | Jake Ruesink | Make it recommended but not required for backward compatibility. New workflows should follow pattern via template. | Resolved in research |
| How to handle workflow-specific variations of standard instructions? | Question | Jake Ruesink | Keep variations in workflows, note as exceptions to standard. Standard should be default. | Resolved in research |

---

## Progress Tracking
Refer to the AGENTS.md file in the feature directory for instructions on tracking and reporting progress during implementation.

---

## Appendices & References

**Research:**
- `research/2025-12-27_workflow-pre-read-instructions-centralization.md` — Comprehensive analysis of repeated patterns and recommendations

**Related Artifacts:**
- `.devagent/core/AGENTS.md` — Target file for standard instructions section
- `.devagent/core/templates/agent-brief-template.md` — Template to update with reference pattern
- `.devagent/core/workflows/research.md` — Proof-of-concept workflow 1
- `.devagent/core/workflows/create-plan.md` — Proof-of-concept workflow 2
- `.devagent/core/workflows/**/*.md` — All 14 workflows (12 additional for future migration)

**Related Features:**
- `.devagent/workspace/features/completed/2025-10-01_agent-execution-directive/` — Example of execution directive standardization
- `.devagent/workspace/features/completed/2025-12-27_consistent-date-handling-workflows/` — Example of date handling standardization

**Constitution References:**
- C4: Tool-Agnostic Design — Standard instructions are tool-agnostic
- C5: Evolution Without Backwards Compatibility — This change improves workflows without maintaining backwards compatibility
