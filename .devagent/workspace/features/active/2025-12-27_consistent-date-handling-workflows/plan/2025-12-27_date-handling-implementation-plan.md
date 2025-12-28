# Consistent Date Handling in Workflows Plan

- Owner: Jake Ruesink
- Last Updated: 2025-12-27
- Status: Draft
- Related Feature Hub: `.devagent/workspace/features/completed/2025-12-27_consistent-date-handling-workflows/`
- Stakeholders: Jake Ruesink (Owner, Decision Maker)
- Notes: Simple workflow improvement to ensure AI assistants always retrieve current date explicitly.

---

## PART 1: PRODUCT CONTEXT

### Summary
AI assistants executing DevAgent workflows sometimes use incorrect dates (randomly increment dates or use wrong dates) when creating filenames or logs. This plan implements explicit date retrieval instructions across all workflows and templates, ensuring AI assistants always run `date +%Y-%m-%d` before creating dated documents. This preventive consistency improvement reduces date-related errors and aligns with Constitution C2 requirements for ISO-date prefixes.

### Context & Problem
**Current state:** Workflows reference dates in filenames and document headers but use vague instructions like "use today's date" or "current date" without specifying how to retrieve it. AI assistants infer dates incorrectly, leading to wrong dates in practice (see `research/2025-12-27_date-handling-audit.md`).

**User pain:** AI assistants must guess or infer dates, resulting in incorrect dates in filenames and document headers. Developers using workflows receive artifacts with wrong dates, causing confusion about when work was actually completed.

**Business trigger:** Making workflows better through preventive consistency improvements. No blocking issues, but accuracy and consistency improvements enhance workflow reliability.

**Evidence:** Research audit identified 8 workflows and 3+ templates requiring updates. In practice, workflows create filenames or logs with wrong dates.

### Objectives & Success Metrics
**Product metrics:**
- Baseline: 0/8 workflows have explicit date retrieval instructions
- Target: 8/8 workflows updated with explicit `date +%Y-%m-%d` instructions
- Metric: All workflows that create dated documents include explicit date retrieval step

**Business metrics:**
- Consistency: All workflows follow same date retrieval pattern
- Accuracy: Dates in created documents match actual creation date

**User experience metrics:**
- AI assistants have clear, explicit instructions for date retrieval
- Reduced date-related errors in workflow execution

### Users & Insights
**Primary users:** AI assistants executing workflows. They need clear, explicit instructions to retrieve current date using `date +%Y-%m-%d` rather than inferring it.

**Secondary users:** Developers using workflows benefit from accurate dates in artifacts.

**Key insights:**
- Simple change to encourage AI to remember to get the date
- Explicit instructions reduce ambiguity and errors
- Standard Unix command (`date +%Y-%m-%d`) is tool-agnostic and widely available

**Demand signals:** In practice, workflows create filenames or logs with wrong dates, indicating need for explicit instructions.

### Solution Principles
**Quality bars:**
- Consistency: All workflows use same date retrieval pattern
- Clarity: Instructions are explicit and unambiguous
- Simplicity: Use standard Unix command, no additional dependencies

**Architecture principles:**
- Tool-agnostic: `date +%Y-%m-%d` works across Unix-like systems (per Constitution C4)
- Maintainability: Clear, explicit instructions reduce ambiguity
- Alignment: Follows Constitution C2 (ISO-date prefixes for chronological artifacts)

**UX principles:**
- Explicit over implicit: Always specify how to get date
- Verification: Include format verification where appropriate
- Documentation: Update templates with clear instructions

### Scope Definition
- **In Scope:**
  - Update 8 workflows with explicit date retrieval instructions (research, create-plan, new-feature, review-progress, brainstorm, compare-prs, review-pr, clarify-feature)
  - Update 3+ templates with date field population instructions (feature-agents-template, plan-document-template, research-packet-template)
  - Add date retrieval step before creating any dated document
  - Replace vague date instructions with explicit `date +%Y-%m-%d` command
  - Add verification steps where appropriate

- **Out of Scope / Future:**
  - Changing date format (must remain ISO 8601 YYYY-MM-DD)
  - Adding date validation libraries or dependencies
  - Modifying existing dated documents (only updating workflow instructions)
  - Comprehensive template audit (focus on identified templates first)

### Functional Narrative
**Flow: AI assistant executes workflow that creates dated document**

**Trigger:** AI assistant invokes workflow that creates dated document (research, plan, feature hub, checkpoint, brainstorm packet, review artifact, etc.)

**Experience narrative:**
1. Workflow instructs AI assistant to run `date +%Y-%m-%d` first to get current date
2. AI assistant runs command and captures output (e.g., `CURRENT_DATE=$(date +%Y-%m-%d)`)
3. AI assistant uses date in filename (e.g., `YYYY-MM-DD_descriptor.md`)
4. AI assistant uses date in document header (e.g., `**Date**: YYYY-MM-DD` or `Last Updated: YYYY-MM-DD`)
5. If updating AGENTS.md, AI assistant updates "Last Updated" field with same date
6. Date matches actual creation date, ensuring accuracy

**Acceptance criteria:**
- Workflow explicitly instructs running `date +%Y-%m-%d` before creating dated document
- Date is used consistently in filename and document header
- No vague date instructions remain (e.g., "use today's date" without method)
- Date format matches ISO 8601 (YYYY-MM-DD) pattern

### Technical Notes & Dependencies
**Technical dependencies:**
- Unix-like system with `date` command (standard on macOS, Linux)
- No external dependencies required
- No performance impact (date command is fast)

**Platform considerations:**
- `date +%Y-%m-%d` works on Unix-like systems (macOS, Linux)
- Tool-agnostic approach aligns with Constitution C4

**Data needs:**
- None (date command uses system time)

**Integration requirements:**
- None (standalone workflow improvements)

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- **Scope focus:** Update all identified workflows and templates with explicit date retrieval instructions
- **Key assumptions:**
  - `date +%Y-%m-%d` command is available on all target systems (validated - standard Unix command)
  - ISO 8601 format (YYYY-MM-DD) is sufficient for all use cases (validated - Constitution C2 requirement)
  - Explicit instructions will reduce date errors (to be validated post-launch)
- **Out of scope:** Changing date format, adding dependencies, modifying existing documents

### Implementation Tasks

#### Task 1: Update Core Workflows (research, create-plan, new-feature)
- **Objective:** Add explicit date retrieval instructions to three core workflows that create dated documents
- **Impacted Modules/Files:**
  - `.devagent/core/workflows/research.md`
  - `.devagent/core/workflows/create-plan.md`
  - `.devagent/core/workflows/new-feature.md`
- **Dependencies:** None
- **Acceptance Criteria:**
  - Each workflow includes explicit step: "Get current date: Run `date +%Y-%m-%d`"
  - Vague date instructions (e.g., "use today's date") replaced with explicit command
  - Date retrieval step appears before creating any dated document
  - Workflow sections that mention dates reference `date +%Y-%m-%d` output
  - Verification checklist includes date format validation
- **Subtasks:**
  1. Update `research.md` — Add date retrieval step in "Output packaging" section before creating research documents
     - Validation: Review workflow for explicit `date +%Y-%m-%d` instruction
  2. Update `create-plan.md` — Add date retrieval step in "Output packaging" section before creating plan documents
     - Validation: Review workflow for explicit `date +%Y-%m-%d` instruction
  3. Update `new-feature.md` — Add date retrieval step in "Kickoff" section before determining feature_prefix and in "AGENTS.md population" section
     - Validation: Review workflow for explicit `date +%Y-%m-%d` instruction
- **Validation Plan:** Manual review of each workflow file to confirm explicit date retrieval instructions are present and vague instructions are removed

#### Task 2: Update Progress and Review Workflows (review-progress, compare-prs, review-pr)
- **Objective:** Add explicit date retrieval instructions to workflows that create progress checkpoints and review artifacts
- **Impacted Modules/Files:**
  - `.devagent/core/workflows/review-progress.md`
  - `.devagent/core/workflows/compare-prs.md`
  - `.devagent/core/workflows/review-pr.md`
- **Dependencies:** None
- **Acceptance Criteria:**
  - Each workflow includes explicit step: "Get current date: Run `date +%Y-%m-%d`"
  - Date retrieval step appears before creating checkpoint/review artifacts
  - Checkpoint document structure template includes date population instruction
  - Storage patterns section references explicit date retrieval
- **Subtasks:**
  1. Update `review-progress.md` — Add date retrieval step in "Synthesize checkpoint" section before creating checkpoint document
     - Validation: Review workflow for explicit `date +%Y-%m-%d` instruction
  2. Update `compare-prs.md` — Add date retrieval step in "Save comparison artifact" section before creating artifact
     - Validation: Review workflow for explicit `date +%Y-%m-%d` instruction
  3. Update `review-pr.md` — Add date retrieval step in "Save review artifact" section before creating artifact
     - Validation: Review workflow for explicit `date +%Y-%m-%d` instruction
- **Validation Plan:** Manual review of each workflow file to confirm explicit date retrieval instructions are present

#### Task 3: Update Ideation and Clarification Workflows (brainstorm, clarify-feature)
- **Objective:** Add explicit date retrieval instructions to workflows that create brainstorm packets and clarification artifacts
- **Impacted Modules/Files:**
  - `.devagent/core/workflows/brainstorm.md`
  - `.devagent/core/workflows/clarify-feature.md`
- **Dependencies:** None
- **Acceptance Criteria:**
  - Each workflow includes explicit step: "Get current date: Run `date +%Y-%m-%d`"
  - Date retrieval step appears before creating brainstorm/clarification packets
  - Storage patterns section references explicit date retrieval
- **Subtasks:**
  1. Update `brainstorm.md` — Add date retrieval step in "Package outputs" section before creating brainstorm packet
     - Validation: Review workflow for explicit `date +%Y-%m-%d` instruction
  2. Update `clarify-feature.md` — Verify date usage and add date retrieval step if clarification packets are dated
     - Validation: Review workflow for date usage patterns and add explicit instruction if needed
- **Validation Plan:** Manual review of each workflow file to confirm explicit date retrieval instructions are present

#### Task 4: Update Core Templates (feature-agents-template, plan-document-template, research-packet-template)
- **Objective:** Add explicit date field population instructions to templates that include date fields
- **Impacted Modules/Files:**
  - `.devagent/core/templates/feature-agents-template.md`
  - `.devagent/core/templates/plan-document-template.md`
  - `.devagent/core/templates/research-packet-template.md`
- **Dependencies:** None
- **Acceptance Criteria:**
  - Each template includes instruction: "Populate date fields by running `date +%Y-%m-%d` first"
  - "Last Updated" field instructions specify date retrieval method
  - Agent Update Instructions section references explicit date retrieval
- **Subtasks:**
  1. Update `feature-agents-template.md` — Update "Agent Update Instructions" section to specify `date +%Y-%m-%d` for "Last Updated" field
     - Validation: Review template for explicit date retrieval instruction
  2. Update `plan-document-template.md` — Add instruction for populating "Last Updated" field using `date +%Y-%m-%d`
     - Validation: Review template for explicit date retrieval instruction
  3. Update `research-packet-template.md` — Add instruction for populating "Last Updated" field using `date +%Y-%m-%d`
     - Validation: Review template for explicit date retrieval instruction
- **Validation Plan:** Manual review of each template file to confirm explicit date retrieval instructions are present

#### Task 5: Verification and Documentation
- **Objective:** Verify all updates are complete and document any additional considerations
- **Impacted Modules/Files:**
  - `.devagent/core/AGENTS.md` (update "Last Updated" when complete)
  - `.devagent/workspace/features/active/2025-12-27_consistent-date-handling-workflows/AGENTS.md` (update completion status)
- **Dependencies:** Tasks 1-4 must be complete
- **Acceptance Criteria:**
  - All 8 workflows verified to include explicit date retrieval instructions
  - All 3+ templates verified to include date field population instructions
  - No vague date instructions remain in workflows or templates
  - AGENTS.md updated with completion status
  - Feature hub AGENTS.md updated with completion status
- **Subtasks:**
  1. Verify all workflows — Review each workflow file to confirm updates are complete
     - Validation: Checklist verification that all workflows have explicit `date +%Y-%m-%d` instructions
  2. Verify all templates — Review each template file to confirm updates are complete
     - Validation: Checklist verification that all templates have explicit date retrieval instructions
  3. Update documentation — Update AGENTS.md files with completion status
     - Validation: Confirm AGENTS.md files reflect completed work
- **Validation Plan:** Complete verification checklist for all workflows and templates, update documentation

---

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Workflow updates may break existing patterns | Risk | Jake Ruesink | Test each workflow update before committing, review changes carefully | 2025-12-27 |
| Templates may need versioning if changes are breaking | Question | Jake Ruesink | Determine if template changes require migration guide (likely not needed for instruction-only changes) | 2025-12-27 |
| Timezone considerations for date retrieval | Question | Jake Ruesink | Document timezone behavior of `date +%Y-%m-%d` command (uses system timezone, which is acceptable) | 2025-12-27 |
| Should we add date format verification step? | Question | Jake Ruesink | Consider adding `date +%Y-%m-%d \| grep -E '^\d{4}-\d{2}-\d{2}$'` verification (should-have, not blocking) | 2025-12-27 |
| Other templates may have date fields | Question | Jake Ruesink | Audit other templates after core updates complete (should-have, not blocking) | Post-launch |

---

## Progress Tracking
Refer to the AGENTS.md file in the feature directory (`.devagent/workspace/features/active/2025-12-27_consistent-date-handling-workflows/AGENTS.md`) for instructions on tracking and reporting progress during implementation.

---

## Appendices & References

### Research Artifacts
- **Research:** `research/2025-12-27_date-handling-audit.md` — Comprehensive audit of date handling patterns across all workflows and templates
- **Clarification:** `clarification/2025-12-27_initial-clarification.md` — Validated requirements packet (8/8 dimensions complete)

### Related Workflows
- `.devagent/core/workflows/research.md` — Will use updated date handling patterns
- `.devagent/core/workflows/create-plan.md` — Will use updated date handling patterns
- `.devagent/core/workflows/new-feature.md` — Will use updated date handling patterns
- `.devagent/core/workflows/review-progress.md` — Will use updated date handling patterns
- `.devagent/core/workflows/brainstorm.md` — Will use updated date handling patterns
- `.devagent/core/workflows/compare-prs.md` — Will use updated date handling patterns
- `.devagent/core/workflows/review-pr.md` — Will use updated date handling patterns
- `.devagent/core/workflows/clarify-feature.md` — Will use updated date handling patterns

### Templates
- `.devagent/core/templates/feature-agents-template.md` — Will include explicit date retrieval instructions
- `.devagent/core/templates/plan-document-template.md` — Will include explicit date retrieval instructions
- `.devagent/core/templates/research-packet-template.md` — Will include explicit date retrieval instructions

### Constitution References
- **Constitution C2:** Chronological Feature Artifacts — Requires ISO-date prefixes (YYYY-MM-DD format)
- **Constitution C4:** Tool-Agnostic Design — `date +%Y-%m-%d` works across Unix-like systems
