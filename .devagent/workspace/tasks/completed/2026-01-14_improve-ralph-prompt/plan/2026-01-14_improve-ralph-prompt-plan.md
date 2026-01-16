# Improve Ralph Prompt Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-14
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/completed/2026-01-14_improve-ralph-prompt/`
- Stakeholders: Jake Ruesink (Owner, Decision Maker)
- Notes: Plan focuses on restructuring AGENTS.md to be more concise and better-guided while maintaining effectiveness.

---

## PART 1: PRODUCT CONTEXT

### Summary
Restructure Ralph's AGENTS.md prompt to be more concise, better-guided for high-level task execution, and effective at ensuring Ralph executes work fully and passes quality gates before marking tasks complete. The goal is to enable single-agent execution (execution + review) rather than requiring separate execution and review agents through better prompting. Key principle: prefer simpler, more natural flows over rigid, prescriptive structures.

### Context & Problem
Review of PR #31 changes to Ralph's AGENTS.md revealed that the current prompt (140 lines) is:
- Too verbose and not concise
- Not well-guided for high-level task execution
- Doesn't effectively guide Ralph to execute work fully and pass quality gates before marking tasks complete

This prevents effective single-agent execution and may require separate execution and review agents, adding complexity. Research into prompting best practices for autonomous AI agents (see `.devagent/workspace/tasks/completed/2026-01-14_improve-ralph-prompt/research/2026-01-14_ralph-prompting-best-practices.md`) identified specific improvements needed.

### Objectives & Success Metrics
- **Product metrics:**
  - AGENTS.md reduced from 140 lines to approximately 80-100 lines (more concise)
  - High-level execution strategy section added at the top
  - Quality gates reframed as mandatory validation checkpoints
- **User experience metrics:**
  - Ralph completes tasks end-to-end (implementation + quality gates + commit) without separate review agents
  - Fewer tasks left in `in_progress` or `blocked` due to incomplete verification
- **Definition of "good enough":**
  - AGENTS.md restructured with hierarchical organization (high-level strategy first)
  - Quality gates explicitly block task completion until verified
  - Prompt tested with 2-3 real Ralph execution tasks to validate effectiveness

### Users & Insights
- **Primary users:** Developers using Ralph for autonomous execution who need reliable, well-guided task execution with built-in quality verification
- **Key insight:** Current prompt lacks high-level guidance, making it difficult for Ralph to understand the overall approach before diving into detailed steps
- **Demand signal:** PR #31 review identified specific concerns about verbosity and lack of high-level guidance

### Solution Principles
- **Key principle:** Prefer simpler, more natural flows over rigid, prescriptive structures. Avoid dictating overly precise processes when concise, flexible prompting achieves the same goal. Favor natural progression (e.g., analyze → act → validate) over artificial phase boundaries. Use checklists and frameworks as guides for completeness, not mandates for systematic coverage.
- **Quality bars:** Maintain all existing functionality while improving clarity and guidance
- **Architecture principles:** Keep prompt structure hierarchical (high-level first, then details), maintain backward compatibility with existing Ralph execution flow
- **UX principles:** Make prompt scannable and actionable, with clear progression from strategy to execution

### Scope Definition
- **In Scope:**
  - Restructure AGENTS.md with hierarchical organization
  - Add high-level execution strategy section
  - Reframe quality gates as mandatory validation checkpoints
  - Enhance status management with explicit completion criteria
  - Simplify verbose sections (commit messaging, task commenting)
  - Test restructured prompt with real tasks
- **Out of Scope / Future:**
  - Changes to `ralph.sh` prompt construction logic (unless needed for structure)
  - Changes to Ralph execution workflow or agent architecture
  - Configurable quality gates per task type (deferred to future work)

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- Scope focus: Restructure `.devagent/plugins/ralph/AGENTS.md` to improve clarity and guidance
- Key assumptions:
  - Current 7-point checklist approach is sound but needs reframing as mandatory blockers
  - Existing commit messaging and task commenting guidance is valuable but too verbose
  - High-level strategy section will help Ralph understand overall approach before details
- Out of scope: Changes to Ralph execution scripts, workflow definitions, or agent architecture

### Implementation Tasks

#### Task 1: Analyze Current AGENTS.md Structure and Identify Improvements
- **Objective:** Review current AGENTS.md structure, identify verbose sections, and map research recommendations to specific changes needed
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/AGENTS.md` (read and analyze)
  - `.devagent/workspace/tasks/completed/2026-01-14_improve-ralph-prompt/research/2026-01-14_ralph-prompting-best-practices.md` (reference for recommendations)
- **References:**
  - Research document: `.devagent/workspace/tasks/completed/2026-01-14_improve-ralph-prompt/research/2026-01-14_ralph-prompting-best-practices.md`
  - Current implementation: `.devagent/plugins/ralph/AGENTS.md`
  - Prompt construction: `.devagent/plugins/ralph/tools/ralph.sh` (lines 231-280)
- **Dependencies:** None
- **Acceptance Criteria:**
  - Document current structure with line counts per section
  - Identify specific verbose sections (commit messaging, task commenting, etc.)
  - Map research recommendations to concrete changes needed
  - Create outline of new hierarchical structure
- **Testing Criteria:** Review outline against research recommendations to ensure all key improvements are addressed
- **Validation Plan:** Self-review of analysis document against research findings

#### Task 2: Restructure AGENTS.md with Hierarchical Organization
- **Objective:** Restructure AGENTS.md following hierarchical organization: high-level execution strategy first, then detailed steps, with quality gates reframed as mandatory validation checkpoints
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/AGENTS.md` (restructure and rewrite)
- **References:**
  - Research document recommendations (sections 1-5 of "Implications for Implementation")
  - Current AGENTS.md structure
  - Key principle: simpler, natural flows over rigid structures
- **Dependencies:** Task 1 (analysis complete)
- **Acceptance Criteria:**
  - New structure starts with "High-Level Execution Strategy" section explaining Ralph's role and approach
  - "Task Execution Flow" section added with natural progression (read context → plan → implement → verify → review → commit → update status)
  - Quality gates section reframed as "Validation Gates" that explicitly block task completion
  - Status management section enhanced with explicit criteria for each status (`closed`, `blocked`, `in_progress`)
  - Commit messaging and task commenting sections simplified and consolidated
  - Total length reduced from 140 lines to approximately 80-100 lines
  - All existing functionality preserved (no information lost, just reorganized)
- **Testing Criteria:**
  - Verify all sections from current AGENTS.md are represented in new structure
  - Check that quality gates are explicitly framed as mandatory blockers
  - Ensure high-level strategy section provides clear guidance before detailed steps
  - Confirm verbosity reduced while maintaining essential information
- **Subtasks:**
  1. Create "High-Level Execution Strategy" section — Explain Ralph's role, approach, and key principle
  2. Create "Task Execution Flow" section — Natural progression from context reading to status update
  3. Reframe "Quality Gates & Verification" as "Validation Gates" — Make explicit that gates block completion
  4. Enhance "Status Management" section — Add explicit criteria for each status
  5. Simplify "Commit Messaging Guidelines" — Consolidate to concise rules with examples
  6. Simplify "Task Commenting for Traceability" — Reduce to essential requirements
  7. Review and remove redundancy — Ensure no duplicate information across sections
- **Validation Plan:** Self-review against research recommendations and current functionality checklist

#### Task 3: Test Restructured AGENTS.md with Real Ralph Execution Tasks
- **Objective:** Validate that restructured AGENTS.md works effectively by testing with 2-3 real Ralph execution tasks
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/AGENTS.md` (may need minor adjustments based on testing)
  - Test execution logs and task outcomes
- **References:**
  - Restructured AGENTS.md from Task 2
  - Ralph execution workflow: `.devagent/plugins/ralph/workflows/execute-autonomous.md`
- **Dependencies:** Task 2 (restructure complete)
- **Acceptance Criteria:**
  - Run Ralph with restructured AGENTS.md on 2-3 real tasks
  - Verify Ralph follows high-level execution strategy
  - Confirm quality gates are treated as mandatory validation checkpoints
  - Check that tasks complete end-to-end (implementation + verification + commit + status update)
  - Document any issues or needed adjustments
- **Testing Criteria:**
  - Monitor Ralph execution for adherence to new prompt structure
  - Verify quality gates block task completion until verified
  - Check that status updates follow explicit criteria
  - Compare outcomes with previous execution patterns (if available)
- **Validation Plan:** Review execution logs, task comments, and commit messages to assess prompt effectiveness

### Implementation Guidance

**From `.devagent/core/AGENTS.md` → Standard Workflow Instructions:**
- Date handling: Always run `date +%Y-%m-%d` first to get current date in ISO format
- Metadata retrieval: Run `git config user.name` to determine owner/author
- Standard guardrails: Prefer authoritative sources, never expose secrets, tag uncertainties with `[NEEDS CLARIFICATION]`
- Storage patterns: Use `YYYY-MM-DD_<descriptor>.md` format for dated artifacts

**From research document → Key Principle:**
- Prefer simpler, more natural flows over rigid, prescriptive structures
- Avoid dictating overly precise processes when concise, flexible prompting achieves the same goal
- Favor natural progression (e.g., analyze → act → validate) over artificial phase boundaries
- Use checklists and frameworks as guides for completeness, not mandates for systematic coverage

**From `.devagent/plugins/ralph/AGENTS.md` → Current Structure:**
- Commit Messaging Guidelines (lines 3-21): Detailed but verbose
- Task Context & Beads Integration (lines 23-41): Detailed, keep but simplify
- Quality Gates & Verification (lines 55-77): Needs reframing as mandatory blockers
- Task Commenting for Traceability (lines 79-111): Very detailed, needs simplification
- Status Management (lines 118-124): Brief, needs enhancement with explicit criteria

---

## Risks & Open Questions

| Item | Type | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Will single-agent approach miss issues that separate review agent would catch? | Risk | Jake Ruesink | Test with real tasks and compare outcomes; iterate based on results | TBD |
| How to balance conciseness with completeness? | Question | Jake Ruesink | Iterate on structure during Task 2, test in Task 3, refine as needed | TBD |
| Should quality gates be configurable per task type? | Question | Jake Ruesink | Defer to future work; focus on current improvement first | Future |

---

## Progress Tracking
Refer to `.devagent/workspace/tasks/completed/2026-01-14_improve-ralph-prompt/AGENTS.md` for progress updates and implementation status.

---

## Appendices & References

- **Research:** `.devagent/workspace/tasks/completed/2026-01-14_improve-ralph-prompt/research/2026-01-14_ralph-prompting-best-practices.md` — Comprehensive research on prompting best practices
- **Current Implementation:** `.devagent/plugins/ralph/AGENTS.md` — Current Ralph agent instructions (140 lines)
- **Related PR:** https://github.com/lambda-curry/devagent/pull/31/changes — PR that triggered this improvement work
- **Agent Documentation:** 
  - `AGENTS.md` (root) — Root agent documentation
  - `.devagent/core/AGENTS.md` — Core workflow instructions
- **Ralph Execution:** 
  - `.devagent/plugins/ralph/tools/ralph.sh` — Prompt construction logic
  - `.devagent/plugins/ralph/workflows/execute-autonomous.md` — Execution workflow documentation
