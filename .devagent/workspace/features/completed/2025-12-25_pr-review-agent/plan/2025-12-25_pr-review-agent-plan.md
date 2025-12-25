# PR Review Agent Plan

- Owner: Jake Ruesink
- Last Updated: 2025-12-25
- Status: Complete
- Related Feature Hub: `.devagent/workspace/features/completed/2025-12-25_pr-review-agent/`
- Stakeholders: Jake Ruesink (Developer, Decision Maker)
- Notes: This plan implements a DevAgent workflow for reviewing pull requests that integrates GitHub and Linear for requirements validation and code quality assessment.

---

## PART 1: PRODUCT CONTEXT

### Summary
Create a `devagent review-pr` workflow that reviews pull requests by analyzing code changes, validating against Linear issue requirements, and checking code quality against project standards. The workflow produces structured review artifacts in `.devagent/workspace/reviews/` for traceability, integrates with existing GitHub CLI and Linear MCP skills for tool operations, and follows DevAgent's structured workflow model to ensure all reviews are documented and linkable to feature hubs and Linear issues.

### Context & Problem
Currently, PR reviews in DevAgent projects lack structured integration with Linear issue tracking and don't produce traceable artifacts. When reviewing PRs, developers must manually:
- Extract Linear issue references from PR descriptions
- Fetch issue requirements separately
- Compare code changes against requirements
- Document findings in an ad-hoc manner

This leads to inconsistent review quality, lost traceability between PRs and requirements, and difficulty tracking review history. The PR review agent addresses this by providing a structured workflow that automates the integration between GitHub PRs and Linear issues while producing traceable review artifacts that align with DevAgent's delivery principles (C3).

Research completed:
- GitHub/Linear integration options analyzed (`.devagent/workspace/features/completed/2025-12-25_pr-review-agent/research/2025-12-25_github-linear-integration-skills.md`)
- PR review approach and architecture determined (`.devagent/workspace/features/completed/2025-12-25_pr-review-agent/research/2025-12-25_pr-review-approach.md`)
- Decision: DevAgent workflow approach (not skill) for structured artifact production

### Objectives & Success Metrics

**Product Objectives:**
- Enable structured PR reviews that validate code against Linear issue requirements
- Produce traceable review artifacts that link to feature hubs and Linear issues
- Integrate seamlessly with existing DevAgent workflow roster
- Support PRs with and without Linear issues

**Success Metrics:**
- Workflow can be invoked via `devagent review-pr <pr-number>`
- Review artifacts are created in `.devagent/workspace/reviews/` for all PRs
- Workflow successfully extracts Linear issue references from PRs
- Workflow validates PR changes against Linear issue requirements when present
- Workflow assesses code quality against AGENTS.md and Cursor rules
- Review artifacts include requirements checklist, code quality assessment, and gaps identified
- Workflow integrates with existing GitHub CLI and Linear MCP skills

**Baseline:** No structured PR review workflow exists; reviews are ad-hoc
**Target:** Workflow produces consistent, traceable review artifacts for all PRs

### Users & Insights

**Primary Users:**
- Developers reviewing PRs in DevAgent projects
- Engineering managers tracking PR review quality and requirements coverage
- Teams using Linear for issue tracking and GitHub for version control

**Key Insights:**
- Developers need quick validation that PRs address all Linear issue requirements
- Traceability between PRs, Linear issues, and feature hubs is critical for auditability (C3)
- Code quality validation should be consistent across all reviews
- Reviews should work even when Linear issues aren't linked (focus on code quality)
- Human-in-the-loop confirmation required for all external actions (C3)

### Solution Principles

1. **Structured Artifacts First:** Always produce review artifacts in `.devagent/workspace/reviews/` regardless of Linear issue presence (C3: traceable artifacts)
2. **Human-in-the-Loop:** All external actions (PR comments, Linear comments, issue updates) require explicit human confirmation (C3)
3. **Tool-Agnostic Workflow:** Workflow design is tool-agnostic (C4), leveraging tool-specific skills for operations
4. **Integration with Existing Skills:** Reuse existing GitHub CLI and Linear MCP skills rather than duplicating functionality
5. **Consistent Review Format:** All reviews follow the same structure for readability and traceability
6. **Graceful Degradation:** Workflow functions fully even when Linear issues aren't present (focuses on code quality)

### Scope Definition

- **In Scope:**
  - DevAgent workflow (`devagent review-pr`) for manual PR review invocation
  - Integration with GitHub CLI skill for PR operations
  - Integration with Linear MCP skill for issue operations
  - Review artifact creation in `.devagent/workspace/reviews/`
  - Requirements validation against Linear issues (when present)
  - Code quality assessment against AGENTS.md and Cursor rules
  - Support for PRs with and without Linear issues
  - Optional GitHub PR comment posting (with human confirmation)
  - Optional Linear issue comment posting (with human confirmation)
  - Review artifact template creation

- **Out of Scope / Future:**
  - Automated/CI integration (manual invocation only for initial version)
  - Batch PR reviews (single PR per invocation)
  - Automatic Linear issue creation from PRs
  - Integration with other issue tracking systems beyond Linear
  - Visual regression testing or performance benchmarking
  - Automated PR approval/rejection

### Functional Narrative

#### Flow: Review PR with Linear Issue

- **Trigger:** Developer invokes `devagent review-pr <pr-number>` or `devagent review-pr <pr-url>`
- **Experience narrative:**
  1. Workflow fetches PR details using GitHub CLI skill
  2. Workflow extracts Linear issue references from PR title/body
  3. If Linear issues found: Workflow fetches issue details using Linear MCP skill
  4. Workflow analyzes PR diff and changed files
  5. Workflow compares PR changes against Linear issue requirements (if present)
  6. Workflow validates code quality against AGENTS.md and Cursor rules
  7. Workflow creates structured review artifact in `.devagent/workspace/reviews/`
  8. Workflow presents optional actions (post to GitHub PR, post to Linear issue) requiring human confirmation
- **Acceptance criteria:**
  - Review artifact is created with requirements validation section (when Linear issues present)
  - Review artifact includes code quality assessment
  - Review artifact links to PR, Linear issues, and feature hub (if applicable)
  - Human confirmation required before posting to GitHub or Linear

#### Flow: Review PR without Linear Issue

- **Trigger:** Developer invokes `devagent review-pr <pr-number>` for PR without Linear issue references
- **Experience narrative:**
  1. Workflow fetches PR details using GitHub CLI skill
  2. Workflow detects no Linear issue references in PR
  3. Workflow analyzes PR diff and changed files
  4. Workflow validates code quality against AGENTS.md and Cursor rules
  5. Workflow creates structured review artifact noting absence of Linear issues
  6. Workflow optionally suggests creating/attaching Linear issue
  7. Workflow presents optional action (post to GitHub PR) requiring human confirmation
- **Acceptance criteria:**
  - Review artifact is created with code quality assessment
  - Review artifact notes absence of Linear issues
  - Review artifact optionally suggests creating Linear issue
  - Review artifact links to PR and feature hub (if applicable)

### Technical Notes & Dependencies

**Dependencies:**
- GitHub CLI (`gh`) must be installed and authenticated
- Linear MCP server must be configured and available
- **GitHub CLI Operations Skill**: `.claude/skills/github-cli-operations/` (✅ Keep - referenced in workflow for PR operations)
- **Linear MCP Integration Skill**: `.claude/skills/linear-mcp-integration/` (✅ Keep - referenced in workflow for issue operations)
- **PR Review Integration Skill**: `.claude/skills/pr-review-integration/` (❌ Remove - replaced by this workflow)
- DevAgent workflow structure and templates

**Technical Considerations:**
- Workflow must handle PRs with multiple Linear issues
- Workflow must gracefully handle missing Linear issues
- Review artifact format must be consistent and parseable
- Integration with feature hubs requires detecting feature associations from PR context
- Human confirmation mechanism for external actions (C3 requirement)

**File Structure:**
- Workflow definition: `.devagent/core/workflows/review-pr.md`
- Command file: `.agents/commands/review-pr.md`
- Review artifact template: `.devagent/core/templates/review-artifact-template.md`
- Review artifacts: `.devagent/workspace/reviews/YYYY-MM-DD_pr-<number>-review.md`

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions

- **Scope focus:** Initial implementation of `devagent review-pr` workflow with core functionality
- **Key assumptions:**
  - GitHub CLI and Linear MCP are available and configured
  - Existing GitHub CLI and Linear MCP skills are functional
  - PRs may or may not have Linear issue references
  - Feature hub associations can be inferred from PR context or manually specified
- **Out of scope:**
  - Automated CI integration
  - Batch PR processing
  - Automatic Linear issue creation
  - Integration with other issue tracking systems

### Implementation Tasks

#### Task 1: Create Review Artifact Template
- **Objective:** Create a reusable template for PR review artifacts that supports both Linear issue validation and code quality assessment
- **Impacted Modules/Files:**
  - `.devagent/core/templates/review-artifact-template.md` (new file)
- **Dependencies:** None
- **Acceptance Criteria:**
  - Template includes sections for PR metadata, Linear issue requirements validation, code quality assessment, review summary, and next steps
  - Template supports both scenarios: with and without Linear issues
  - Template includes placeholders for all required information
  - Template follows DevAgent markdown structure conventions
- **Subtasks:**
  1. Create template file with proper structure
     - Validation: Template file exists and follows markdown conventions
  2. Add sections for PR metadata (PR number, URL, author, date)
     - Validation: Template includes all required metadata fields
  3. Add requirements validation section with conditional Linear issue content
     - Validation: Template handles both Linear issue present and absent scenarios
  4. Add code quality assessment section
     - Validation: Template includes code quality checklist and issues tracking
  5. Add review summary and next steps sections
     - Validation: Template includes summary and action items sections
- **Validation Plan:** Review template against research document requirements and test with sample data

#### Task 2: Create Review PR Workflow Definition
- **Objective:** Create the core workflow definition file that orchestrates PR review process using GitHub CLI and Linear MCP skills
- **Impacted Modules/Files:**
  - `.devagent/core/workflows/review-pr.md` (new file)
- **Dependencies:** Task 1 (template), existing GitHub CLI and Linear MCP skills
- **Acceptance Criteria:**
  - Workflow follows DevAgent workflow structure (Mission, Execution Directive, Inputs, Resource Strategy, Workflow steps)
  - Workflow references GitHub CLI skill for PR operations
  - Workflow references Linear MCP skill for issue operations
  - Workflow handles PRs with and without Linear issues
  - Workflow produces review artifacts in `.devagent/workspace/reviews/`
  - Workflow requires human confirmation for external actions (C3)
  - Workflow follows tool-agnostic design principles (C4)
- **Subtasks:**
  1. Create workflow file with standard DevAgent structure
     - Validation: File exists and follows workflow template structure
  2. Define mission, execution directive, and inputs
     - Validation: Workflow clearly states purpose, execution model, and required inputs
  3. Define resource strategy (artifact storage, skill references)
     - Validation: Workflow specifies artifact location and skill dependencies
  4. Implement workflow steps: context gathering, analysis, artifact creation
     - Validation: Workflow steps cover full review process
  5. Add human confirmation gates for external actions
     - Validation: Workflow explicitly requires confirmation before posting to GitHub/Linear
  6. Add error handling for missing Linear issues or GitHub access
     - Validation: Workflow gracefully handles edge cases
- **Validation Plan:** Review workflow against research recommendations and test with sample PR scenarios

#### Task 3: Create Review PR Command File
- **Objective:** Create command file that provides standardized interface for invoking the review-pr workflow
- **Impacted Modules/Files:**
  - `.agents/commands/review-pr.md` (new file)
- **Dependencies:** Task 2 (workflow definition)
- **Acceptance Criteria:**
  - Command file follows DevAgent command structure
  - Command file references workflow definition
  - Command file includes input context placeholder
  - Command file is properly formatted for agent execution
- **Subtasks:**
  1. Create command file with standard structure
     - Validation: File exists and follows command template
  2. Add workflow reference and instructions
     - Validation: Command file correctly references workflow
  3. Add input context placeholder
     - Validation: Command file includes placeholder for PR number/URL
- **Validation Plan:** Verify command file structure matches other command files in `.agents/commands/`

#### Task 4: Update Workflow Roster Documentation
- **Objective:** Add review-pr workflow to DevAgent workflow roster documentation
- **Impacted Modules/Files:**
  - `.devagent/core/AGENTS.md` (update existing file)
- **Dependencies:** Task 2 (workflow definition)
- **Acceptance Criteria:**
  - Workflow is added to workflow roster with description
  - Workflow follows naming convention (review-pr)
  - Workflow description includes usage guidance
  - Documentation is consistent with other workflow entries
- **Subtasks:**
  1. Add review-pr entry to workflow roster
     - Validation: Entry exists in correct location
  2. Write workflow description and usage guidance
     - Validation: Description matches workflow purpose and usage
  3. Verify consistency with other workflow entries
     - Validation: Format and style match existing entries
- **Validation Plan:** Review updated AGENTS.md for consistency and completeness

#### Task 5: Create Reviews Directory Structure and Test Workflow
- **Objective:** Ensure reviews directory exists and test workflow end-to-end with sample PR
- **Impacted Modules/Files:**
  - `.devagent/workspace/reviews/` (directory creation)
  - Test review artifacts (sample files)
- **Dependencies:** Tasks 1-4 (all workflow components)
- **Acceptance Criteria:**
  - Reviews directory exists at `.devagent/workspace/reviews/`
  - Workflow can be invoked successfully
  - Review artifact is created with correct format
  - Workflow handles PRs with Linear issues correctly
  - Workflow handles PRs without Linear issues correctly
  - Human confirmation gates work as expected
- **Subtasks:**
  1. Create reviews directory if it doesn't exist
     - Validation: Directory exists at correct path
  2. Test workflow with PR that has Linear issue
     - Validation: Review artifact created with requirements validation
  3. Test workflow with PR without Linear issue
     - Validation: Review artifact created with code quality focus
  4. Verify artifact format matches template
     - Validation: Artifact structure matches template
  5. Test human confirmation gates
     - Validation: External actions require confirmation
- **Validation Plan:** Execute workflow with real PRs and verify all acceptance criteria are met

### Release & Delivery Strategy

**Milestone 1: Core Workflow Implementation**
- Complete Tasks 1-4: Template, workflow definition, command file, documentation
- Validation: All files created and workflow structure complete

**Milestone 2: Testing and Validation**
- Complete Task 5: Directory setup and end-to-end testing
- Validation: Workflow functions correctly with real PRs

**Review Gates:**
- Workflow definition review against DevAgent patterns
- Template review against research requirements
- End-to-end testing with sample PRs
- Documentation review for completeness

### Approval & Ops Readiness

**Required Approvals:**
- Workflow design alignment with DevAgent constitution (C3, C4)
- Template structure approval
- Documentation completeness review

**Operational Checklist:**
- GitHub CLI and Linear MCP availability confirmed
- Reviews directory structure established
- Workflow roster updated
- Command file integrated

---

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| GitHub CLI or Linear MCP unavailable | Risk | Jake Ruesink | Verify prerequisites before workflow execution; add error handling | Before Task 2 |
| Feature hub association detection | Question | Jake Ruesink | Determine if automatic detection is needed or manual specification is sufficient | During Task 2 |
| Review artifact format changes | Risk | Jake Ruesink | Use template to ensure consistency; version template if needed | Ongoing |
| Workflow performance with large PRs | Risk | Jake Ruesink | Test with large PRs; optimize if needed | During Task 5 |
| CI/CD integration future needs | Question | Jake Ruesink | Document as future enhancement; keep workflow design extensible | Post-MVP |
| Handling PRs spanning multiple features | Question | Jake Ruesink | Determine approach: single review or multiple reviews | During Task 2 |

---

## Progress Tracking

Refer to the AGENTS.md file in the feature directory (`.devagent/workspace/features/completed/2025-12-25_pr-review-agent/AGENTS.md`) for instructions on tracking and reporting progress during implementation.

---

## Appendices & References

**Research Artifacts:**
- GitHub/Linear Integration Skills Research: `.devagent/workspace/features/completed/2025-12-25_pr-review-agent/research/2025-12-25_github-linear-integration-skills.md`
- PR Review Approach Research: `.devagent/workspace/features/completed/2025-12-25_pr-review-agent/research/2025-12-25_pr-review-approach.md`
- Skills Review: `.devagent/workspace/features/completed/2025-12-25_pr-review-agent/research/2025-12-25_skills-review.md`

**Related Workflows:**
- Review Progress Workflow: `.devagent/core/workflows/review-progress.md` (reference pattern)
- Research Workflow: `.devagent/core/workflows/research.md` (workflow structure reference)

**Skills:**
- GitHub CLI Operations: `.claude/skills/github-cli-operations/SKILL.md` (✅ Keep - referenced in workflow)
- Linear MCP Integration: `.claude/skills/linear-mcp-integration/SKILL.md` (✅ Keep - referenced in workflow)
- PR Review Integration: `.claude/skills/pr-review-integration/SKILL.md` (❌ Remove - replaced by workflow)

**Constitution References:**
- C3: Delivery Principles (human-in-the-loop, traceable artifacts) — `.devagent/workspace/memory/constitution.md`
- C4: Tool-Agnostic Design — `.devagent/workspace/memory/constitution.md`

**Product Mission:**
- DevAgent Product Mission: `.devagent/workspace/product/mission.md`
