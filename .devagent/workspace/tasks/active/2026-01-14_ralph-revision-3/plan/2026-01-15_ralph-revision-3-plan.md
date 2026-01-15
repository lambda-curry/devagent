# Ralph Revision #3 Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-15
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/active/2026-01-14_ralph-revision-3/`
- Stakeholders: Jake Ruesink (Owner, Decision Maker)
- Notes: Implementation plan for Ralph Revision #3 improvements based on video review. Tasks organized by priority based on blocking relationships.

---

## PART 1: PRODUCT CONTEXT

### Summary
Ralph Revision #3 addresses accumulated bugs, UI/accessibility issues, process gaps, and architectural complexity in the Ralph autonomous execution system. This revision implements 10 improvements across four categories: bug fixes, UI/accessibility enhancements, process improvements, and architectural simplifications. The primary goal is to improve reliability, accessibility, and maintainability for engineering managers/team leads who oversee Ralph cycles.

### Context & Problem
Ralph (autonomous execution system) has accumulated issues that impact engineering managers/team leads who oversee Ralph cycles. Specific problems include:
- **Bugs:** Beads UI epic display issues, pathing problems, git push errors
- **UI/Accessibility:** Keyboard navigation gaps, state management inefficiencies, UI testing blockers
- **Process:** Manual asset organization, missing retry logic for git operations, insufficient documentation
- **Architecture:** Overly complex git workflow with automated worktree setup causing pathing issues

**Evidence:** Video review at https://preview.screen.studio/share/ODS025Ds contains specific examples and requirements. Related improvement recommendations documented in `.devagent/workspace/reviews/2026-01-14_devagent-157f-improvements.md`.

### Objectives & Success Metrics
- **Product metrics:**
  - All items in the implementation checklist are completed and working
  - Error-free runs from a process perspective (Ralph cycles complete without process-level errors)
- **Definition of "good enough":** All must-have items from the implementation checklist are completed, and Ralph cycles run without process-level errors that block execution or review.
- **What would indicate failure:**
  - Critical bugs remain unresolved (blocking Ralph cycles)
  - Process-level errors persist after implementation
  - Implementation introduces regressions that break existing functionality

### Users & Insights
**Primary users:** Engineering managers/team leads who oversee Ralph cycles
- **Goals:** Successfully manage and review Ralph's autonomous execution, ensure quality outputs, track progress across epics and tasks
- **Current pain:** Experience bugs (Beads UI epic issues, pathing problems, git push errors), UI/accessibility gaps (keyboard navigation issues), process inefficiencies (manual asset organization), and architectural complexity (automated worktree setup causing pathing issues)
- **Expected benefit:** More reliable Ralph cycles, better accessibility, streamlined processes, simplified architecture that reduces bugs

### Solution Principles
- **Quality bars:** Follow existing DevAgent constitution and delivery principles (`.devagent/workspace/memory/constitution.md`)
- **Architecture principles:** Simplify workflows to reduce complexity and bugs (C6: Simplicity Over Rigidity)
- **UX principles:** Ensure keyboard accessibility and proper state management for better user experience
- **Performance expectations:** Maintain existing performance characteristics; avoid regressions

### Scope Definition
- **In Scope:**
  - Bug fixes (Beads UI epic issues, pathing problems, git push error investigation)
  - UI/Accessibility improvements (keyboard navigation, state management, UI testing pre-checks)
  - Process improvements (automatic asset organization, retry logic for git operations, documentation)
  - Architectural changes (simplify git workflow by removing automated worktree setup)
- **Out of Scope / Future:**
  - Input sanitization improvements (noted for future architectural consideration, lower priority)
  - Comprehensive SQL injection prevention (current implementation uses parameterized queries, safe)

### Functional Narrative

#### Flow: Simplified Git Workflow
- **Trigger:** User runs `ralph.sh --epic <epic-id>` or sets `RALPH_EPIC_ID` environment variable
- **Experience narrative:** Ralph runs in the current branch (provided it is not `main`). User is responsible for any necessary worktree setup beforehand. Setup workspace agent validates Epic and ensures correct branch, but does not create worktrees automatically.
- **Acceptance criteria:** Ralph cycles run without pathing issues, setup is simpler, user has control over worktree management

#### Flow: Improved Beads UI Epic Display
- **Trigger:** User views Epic in Ralph monitoring UI
- **Experience narrative:** Epics correctly display all sub-issues when they are present and linked. Issue-to-epic mapping uses a format that is correctly recognized by the UI.
- **Acceptance criteria:** Epics show sub-issues correctly, no "No issues found" when sub-issues exist

#### Flow: Keyboard Accessible Task Actions
- **Trigger:** User navigates to task card using keyboard
- **Experience narrative:** Quick action buttons (view details, stop task) are always keyboard accessible, even when visually hidden. Buttons use CSS visibility/opacity for visual hiding while maintaining `tabIndex=0`.
- **Acceptance criteria:** All task action buttons are keyboard accessible, focus indicators work correctly

#### Flow: Automatic Asset Organization
- **Trigger:** Ralph cycle completes or generates artifacts (reviews, findings, screenshots)
- **Experience narrative:** All cycle reviews, findings, and screenshots are automatically saved directly into the specific task folder that initiated the Ralph cycle (`.devagent/workspace/tasks/active/YYYY-MM-DD_task-slug/` or task-specific subdirectory).
- **Acceptance criteria:** Artifacts are organized by task, easy to locate for review

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- **Scope focus:** Full revision implementation across all four categories
- **Key assumptions:**
  - Video contains all requirements for this revision (validated)
  - Priority should be determined based on blocking relationships (validated)
  - Git workflow simplification may resolve pathing issues (to be validated)
- **Out of scope:** Input sanitization improvements (deferred to future architectural consideration)

### Implementation Tasks

#### Task 1: Simplify Git Workflow (Remove Automated Worktree Setup)
- **Objective:** Remove automated `git worktree` setup from Ralph cycle flow. The cycle should run within the current branch (provided it is not `main`). User is responsible for any necessary worktree setup beforehand. This change simplifies the setup flow and may resolve existing pathing bugs.
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/tools/ralph.sh` (remove worktree creation logic, lines 109-158)
  - `.devagent/plugins/ralph/workflows/setup-workspace.md` (update to reflect simplified workflow)
  - `.devagent/plugins/ralph/autonomous-execution-flow.md` (update diagram if needed)
- **References:**
  - Clarification packet: `.devagent/workspace/tasks/active/2026-01-14_ralph-revision-3/clarification/2026-01-14_initial-clarification.md`
  - Implementation checklist: `.devagent/workspace/tasks/active/2026-01-14_ralph-revision-3/AGENTS.md`
- **Dependencies:** None (this is a foundational change that may resolve pathing issues)
- **Acceptance Criteria:**
  - `ralph.sh` runs in current branch without creating worktrees automatically
  - Setup workspace agent validates Epic and branch but does not create worktrees
  - Pathing issues are resolved (or at least no longer caused by worktree setup)
  - Documentation updated to reflect user responsibility for worktree setup
- **Testing Criteria:**
  - Manual: Run `ralph.sh --epic <epic-id>` and verify it runs in current branch
  - Manual: Verify no worktree is created automatically
  - Manual: Test with existing branch and verify pathing works correctly
- **Validation Plan:** Verify Ralph cycles run without pathing errors, setup is simpler, and user can manage worktrees manually if needed.

#### Task 2: Validate Beads Setup and Improve Epic Display in Our UI
- **Objective:** Validate that our approach to setting up Beads (epic/issue relationships, parent-child mapping) is correct according to Beads documentation. Then ensure our Ralph monitoring UI app handles epic/sub-issue display better than bdui does.
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/skills/plan-to-beads-conversion/SKILL.md` (validate epic/issue setup approach)
  - `apps/ralph-monitoring/app/db/beads.server.ts` (add function to query epic children using correct Beads patterns, ensure proper parent-child queries)
  - `apps/ralph-monitoring/app/routes/_index.tsx` (update UI to display epic children correctly, better than bdui)
  - `apps/ralph-monitoring/app/routes/tasks.$taskId.tsx` (if epic detail view exists, update to show children)
- **References:**
  - Beads documentation: `.beads/docs/ARCHITECTURE.md` (parent-child relationships, dependency types)
  - Beads documentation: `.beads/docs/MOLECULES.md` (epic/sub-issue structure)
  - Beads documentation: `.beads/docs/QUICKSTART.md` (hierarchical issues examples)
  - bdui reference: `.beads/docs/COMMUNITY_TOOLS.md` (bdui mentioned as community tool)
  - Implementation checklist: `.devagent/workspace/tasks/active/2026-01-14_ralph-revision-3/AGENTS.md`
- **Dependencies:** Task 1 (may be independent, but investigate if pathing issues affect database access)
- **Acceptance Criteria:**
  - Our Beads setup approach (epic/issue relationships) is validated against Beads documentation
  - Our UI correctly queries and displays epic children using proper Beads parent-child relationships
  - Our UI handles epic/sub-issue display better than bdui (e.g., shows sub-issues when bdui shows "No issues found")
  - Issue-to-epic mapping follows Beads best practices
- **Testing Criteria:**
  - Manual: Review Beads documentation and validate our setup approach
  - Manual: Create epic with sub-issues using our plan-to-beads conversion, verify relationships are correct
  - Manual: Test UI displays epic children correctly, compare with bdui behavior
  - Manual: Verify our UI shows sub-issues in cases where bdui fails
- **Validation Plan:** Validate setup approach against Beads docs, test epic/sub-issue queries, compare UI behavior with bdui, ensure our implementation is better.

#### Task 3: Validate and Resolve Pathing Issues
- **Objective:** Validate that pathing issues have been resolved (they may already be fixed). If any pathing issues remain, investigate and fix them. This is primarily a validation task to ensure all file paths work correctly in Ralph cycles.
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/tools/ralph.sh` (path resolution logic - validate/fix if needed)
  - `.devagent/plugins/ralph/workflows/setup-workspace.md` (if pathing issues persist)
  - Any other files that use relative paths that may break
- **References:**
  - Implementation checklist: `.devagent/workspace/tasks/active/2026-01-14_ralph-revision-3/AGENTS.md`
  - Related reviews: `.devagent/workspace/reviews/2026-01-14_devagent-157f-improvements.md`
- **Dependencies:** Task 1 (git workflow simplification may resolve this, or pathing may already be fixed)
- **Acceptance Criteria:**
  - Pathing issues are validated (confirmed resolved or identified if still present)
  - All file paths work correctly in Ralph cycles
  - No pathing errors in logs or execution
  - Relative paths resolve correctly regardless of execution context
  - Any remaining pathing issues are fixed
- **Testing Criteria:**
  - Manual: Run Ralph cycle and verify all file paths resolve correctly
  - Manual: Test with different execution contexts (different directories, branches)
  - Manual: Verify log file paths, database paths, and other file references work
  - Manual: Validate that pathing issues are resolved (or document any remaining issues)
- **Validation Plan:** Run Ralph cycles and verify no pathing errors occur, test in various execution contexts. If pathing is already resolved, document validation. If issues remain, fix them.

#### Task 4: Improve Keyboard Accessibility for Buttons
- **Objective:** Refactor quick action buttons that currently rely on hover states for their `tabindex`. Keep `tabindex=0` at all times but use CSS `visibility` or `opacity` for visual hiding. Ensures buttons remain accessible to keyboard-only users.
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/routes/_index.tsx` (TaskCard component, lines 451-482)
- **References:**
  - Implementation checklist: `.devagent/workspace/tasks/active/2026-01-14_ralph-revision-3/AGENTS.md`
  - Related reviews: `.devagent/workspace/reviews/2026-01-14_devagent-157f-improvements.md`
- **Dependencies:** None
- **Acceptance Criteria:**
  - Quick action buttons have `tabIndex={0}` at all times
  - Buttons use CSS `visibility` or `opacity` for visual hiding (not `pointer-events-none` or conditional `tabIndex`)
  - Buttons are keyboard accessible even when visually hidden
  - Focus indicators work correctly
- **Testing Criteria:**
  - Manual: Navigate to task cards using keyboard (Tab key)
  - Manual: Verify buttons are focusable even when not hovered
  - Manual: Test focus indicators and keyboard activation
- **Validation Plan:** Test keyboard navigation, verify buttons are accessible, check focus indicators.

#### Task 5: Optimize State Management for Pause/Resume
- **Objective:** Refactor `pause/resume` functionality to avoid unnecessary `EventSource` recreations. Use `refs` for state that needs to be checked synchronously within event handlers (e.g., `isPaused`) rather than putting that state directly into the message handler.
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/components/LogViewer.tsx` (pause/resume logic, EventSource management)
- **References:**
  - Implementation checklist: `.devagent/workspace/tasks/active/2026-01-14_ralph-revision-3/AGENTS.md`
  - Related reviews: `.devagent/workspace/reviews/2026-01-14_devagent-157f-improvements.md`
- **Dependencies:** None
- **Acceptance Criteria:**
  - `isPaused` state is managed via ref for synchronous access in event handlers
  - EventSource is not recreated when `isPaused` state changes
  - Pause/resume functionality works correctly without connection issues
- **Testing Criteria:**
  - Manual: Test pause/resume functionality in log viewer
  - Manual: Verify EventSource is not recreated unnecessarily (check network tab or logs)
  - Manual: Test that pause/resume works smoothly without connection drops
- **Validation Plan:** Test pause/resume, verify EventSource stability, check for connection issues.

#### Task 6: Add UI Testing Pre-checks
- **Objective:** Address the bug where an empty string in the Select component blocked UI testing. Add a basic lint/typecheck or smoke test earlier in the flow to catch these blocking issues before UI verification begins.
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/AGENTS.md` (update quality gates section to include pre-checks)
  - `.devagent/plugins/ralph/tools/ralph.sh` (if pre-checks should be automated)
  - `apps/ralph-monitoring/app/routes/_index.tsx` (fix Select component empty string issue if still present)
- **References:**
  - Implementation checklist: `.devagent/workspace/tasks/active/2026-01-14_ralph-revision-3/AGENTS.md`
  - Related reviews: `.devagent/workspace/reviews/2026-01-14_devagent-157f-improvements.md`
- **Dependencies:** None
- **Acceptance Criteria:**
  - Basic lint/typecheck or smoke test runs before UI verification
  - Select component empty string issue is fixed or documented
  - Blocking issues are caught earlier in the flow
- **Testing Criteria:**
  - Manual: Run Ralph cycle and verify pre-checks run before UI verification
  - Manual: Test that Select component empty string issue no longer blocks UI testing
  - Manual: Verify blocking issues are caught earlier
- **Validation Plan:** Test pre-checks, verify they catch issues, confirm UI testing is not blocked.

#### Task 7: Implement Automatic Asset Organization
- **Objective:** Modify the system to automatically save all cycle reviews, findings, and screenshots directly into the specific task folder that initiated the Ralph cycle.
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/workflows/final-review.md` (update to save artifacts to task folder)
  - `.devagent/plugins/ralph/skills/agent-browser/SKILL.md` (update screenshot paths to use task folder)
  - `.devagent/plugins/ralph/AGENTS.md` (update screenshot documentation paths)
  - `.devagent/plugins/ralph/workflows/generate-revise-report.md` (if revise reports should also be organized)
- **References:**
  - Implementation checklist: `.devagent/workspace/tasks/active/2026-01-14_ralph-revision-3/AGENTS.md`
  - Screenshot management: `.devagent/plugins/ralph/skills/agent-browser/SKILL.md`
  - Reviews structure: `.devagent/workspace/reviews/README.md`
- **Dependencies:** Task 1 (pathing issues must be resolved for correct folder paths)
- **Acceptance Criteria:**
  - Cycle reviews are saved to task folder (`.devagent/workspace/tasks/active/YYYY-MM-DD_task-slug/`)
  - Findings are saved to task folder
  - Screenshots are saved to task folder (or task-specific subdirectory)
  - Artifacts are easy to locate for review
- **Testing Criteria:**
  - Manual: Run Ralph cycle and verify artifacts are saved to correct task folder
  - Manual: Verify screenshots, reviews, and findings are organized correctly
  - Manual: Test with multiple tasks to ensure proper organization
- **Validation Plan:** Run Ralph cycle, verify artifacts are organized by task, check folder structure.

#### Task 8: Implement Retry Logic for Git Operations
- **Objective:** Implement retry logic for git push operations to handle transient server-side errors (e.g., "fatal: error in commit_refs").
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/tools/ralph.sh` (add retry logic for git push)
  - `.devagent/plugins/ralph/workflows/final-review.md` (add retry logic for git push in PR creation)
  - Any other scripts that perform git push operations
- **References:**
  - Implementation checklist: `.devagent/workspace/tasks/active/2026-01-14_ralph-revision-3/AGENTS.md`
  - Related reviews: `.devagent/workspace/reviews/2026-01-14_devagent-157f-improvements.md`
- **Dependencies:** None
- **Acceptance Criteria:**
  - Git push operations retry on transient errors (e.g., "fatal: error in commit_refs")
  - Retry logic has reasonable limits (e.g., max 3 retries with exponential backoff)
  - Permanent errors are not retried indefinitely
  - Retry behavior is logged for debugging
- **Testing Criteria:**
  - Manual: Test git push with simulated transient errors (if possible)
  - Manual: Verify retry logic works correctly
  - Manual: Test that permanent errors are not retried indefinitely
- **Validation Plan:** Test retry logic, verify it handles transient errors, check logging.

#### Task 9: Add Documentation (JSDoc)
- **Objective:** Add JSDoc comments to the `getAllTasks` function (and others) to clearly document filtering behavior and parameter expectations for future developers.
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/db/beads.server.ts` (add JSDoc to `getAllTasks` and other functions)
- **References:**
  - Implementation checklist: `.devagent/workspace/tasks/active/2026-01-14_ralph-revision-3/AGENTS.md`
  - Related reviews: `.devagent/workspace/reviews/2026-01-14_devagent-157f-improvements.md`
- **Dependencies:** None
- **Acceptance Criteria:**
  - `getAllTasks` function has JSDoc comments documenting filtering behavior
  - Parameter expectations are clearly documented
  - Return value is documented
  - Other relevant functions have JSDoc comments
- **Testing Criteria:**
  - Manual: Review JSDoc comments for clarity and completeness
  - Manual: Verify JSDoc comments are properly formatted and appear in IDE tooltips
- **Validation Plan:** Review documentation, verify it's clear and helpful for future developers.

#### Task 10: Investigate Git Push Errors
- **Objective:** Investigate periodic `git push` failures (specifically "fatal: error in commit_refs") to determine if they are caused by repository permissions or server-side issues.
- **Impacted Modules/Files:**
  - Documentation: Create investigation notes or update documentation with findings
  - `.devagent/plugins/ralph/tools/ralph.sh` (if investigation reveals actionable fixes)
- **References:**
  - Implementation checklist: `.devagent/workspace/tasks/active/2026-01-14_ralph-revision-3/AGENTS.md`
  - Related reviews: `.devagent/workspace/reviews/2026-01-14_devagent-157f-improvements.md`
- **Dependencies:** Task 8 (retry logic may help, but investigation should determine root cause)
- **Acceptance Criteria:**
  - Root cause of git push errors is identified (repository permissions vs. server-side issues)
  - Findings are documented
  - Actionable fixes are implemented if possible
- **Testing Criteria:**
  - Manual: Review git push error logs and patterns
  - Manual: Test repository permissions and configuration
  - Manual: Document findings and recommendations
- **Validation Plan:** Complete investigation, document findings, implement fixes if possible.

### Implementation Guidance

**From `.devagent/core/AGENTS.md` → Standard Workflow Instructions:**
- Date handling: Always run `date +%Y-%m-%d` first to get current date in ISO format
- Metadata retrieval: Run `git config user.name` to determine owner/author
- Context gathering: Review internal agent documentation, workflow definitions, rules & conventions, DevAgent workspace, then fallback to README/docs
- Storage patterns: Use `YYYY-MM-DD_<descriptor>.md` format for dated artifacts

**From `.devagent/workspace/memory/constitution.md` → Delivery Principles (C3):**
- Human-in-the-loop defaults: Every agent interaction produces drafts that require explicit human confirmation before downstream automation proceeds
- Traceable artifacts: All agent outputs must link to mission metrics and cite research inputs. All code changes must be traceable to specific tasks via commit messages and comments
- Iterate in thin slices: Limit planning waves to five tasks and ensure each slice can deliver observable value within a week
- Guardrails before generation: Establish constraints (tools, permissions, review gates) prior to code generation to prevent scope drift
- Teach by doing: Prioritize automations that keep DevAgent building DevAgent so the system continuously validates itself

**From `.devagent/workspace/memory/constitution.md` → Simplicity Over Rigidity (C6):**
- Prefer simpler, more natural flows over rigid, prescriptive structures
- Avoid dictating overly precise processes when concise, flexible prompting achieves the same goal
- Favor natural progression (e.g., analyze → act → validate) over artificial phase boundaries
- Use checklists and frameworks as guides for completeness, not mandates for systematic coverage

**From `apps/ralph-monitoring/package.json` → Testing Standards:**
- Review `package.json` scripts to determine correct commands for testing, linting, and typechecking
- Follow project testing standards (vitest for unit tests, manual testing for UI)

**From `apps/ralph-monitoring/app/routes/_index.tsx` → Coding Patterns:**
- Use React Router 7 patterns for routing and data loading
- Use shadcn/ui components for UI elements
- Follow TypeScript best practices with proper typing

### Release & Delivery Strategy
- **Milestone 1:** Architectural changes (Task 1) - Simplifies workflow and may resolve pathing issues
- **Milestone 2:** Bug fixes (Tasks 2, 3, 10) - Resolves critical bugs affecting Ralph cycles
- **Milestone 3:** UI/Accessibility improvements (Tasks 4, 5, 6) - Improves user experience
- **Milestone 4:** Process improvements (Tasks 7, 8, 9) - Streamlines operations and documentation

**Review gates:**
- After each milestone, verify no regressions introduced
- Test Ralph cycles end-to-end after all tasks complete
- Validate error-free runs from a process perspective

### Approval & Ops Readiness
- **Required approvals:** Jake Ruesink (Owner, Decision Maker)
- **Operational checklists:**
  - Verify all checklist items completed
  - Test Ralph cycles run without process-level errors
  - Validate no regressions in existing functionality

---

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Git workflow simplification may break existing workflows | Risk | Jake Ruesink | Test thoroughly, document migration path | During Task 1 |
| Pathing issues may not be fully resolved (or may already be fixed) | Risk | Jake Ruesink | Validate pathing in Task 3, fix any remaining issues | During Task 3 |
| Beads UI epic display fix may require database schema changes | Risk | Jake Ruesink | Investigate Beads database schema and query patterns | During Task 2 |
| Git push errors may be server-side and not fixable locally | Question | Jake Ruesink | Complete investigation in Task 10, document findings | During Task 10 |
| Automatic asset organization may conflict with existing review structure | Risk | Jake Ruesink | Review existing review structure, ensure compatibility | During Task 7 |

---

## Progress Tracking
Refer to the AGENTS.md file in the task directory (`.devagent/workspace/tasks/active/2026-01-14_ralph-revision-3/AGENTS.md`) for instructions on tracking and reporting progress during implementation.

---

## Appendices & References

### Agent Documentation
- `AGENTS.md` (root) - Project-specific workflow documentation
- `.devagent/core/AGENTS.md` - Portable agent kit documentation
- `.devagent/plugins/ralph/AGENTS.md` - Ralph-specific agent instructions

### Coding Standards and Conventions
- `.cursorrules/` - Cursor rules for coding standards
- `.devagent/workspace/memory/constitution.md` - DevAgent constitution and delivery principles

### Related Documentation
- `README.md` - Project overview
- `.beads/docs/ARCHITECTURE.md` - Beads database schema and relationships
- `.devagent/workspace/reviews/README.md` - Review artifacts structure

### Task Artifacts
- Clarification packet: `.devagent/workspace/tasks/active/2026-01-14_ralph-revision-3/clarification/2026-01-14_initial-clarification.md`
- Implementation checklist: `.devagent/workspace/tasks/active/2026-01-14_ralph-revision-3/AGENTS.md`
- Related reviews: `.devagent/workspace/reviews/2026-01-14_devagent-157f-improvements.md`

### Related Plans
- `.devagent/workspace/tasks/completed/2026-01-13_ralph-improvements/plan/2026-01-13_ralph-improvements-plan.md` - Previous Ralph improvements
- `.devagent/workspace/tasks/completed/2026-01-13_ralph-quality-gates-improvements/AGENTS.md` - Ralph quality gates improvements
