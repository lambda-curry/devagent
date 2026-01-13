# Research Packet — PR Creation and Final Reporting Workflows

- Mode: Task
- Requested By: Jake Ruesink
- Last Updated: 2026-01-13
- Related Task Hub: `.devagent/workspace/tasks/active/2026-01-13_final-agent-pr-creation-reporting/`
- Storage Path: `.devagent/workspace/tasks/active/2026-01-13_final-agent-pr-creation-reporting/research/2026-01-13_pr-creation-final-reporting-research.md`
- Stakeholders: Jake Ruesink (AgentBuilder)

## Request Overview

Investigate how DevAgent currently handles PR creation and final reporting at the end of task execution. Identify gaps, existing patterns (especially Ralph plugin's approach), and design requirements for a new general-purpose final agent workflow that manages PR creation and reporting with a well-crafted prompt.

## Research Questions

| ID | Question | Status | Notes |
| --- | --- | --- | --- |
| RQ1 | How do standard DevAgent workflows (implement-plan, execute-full-task) currently handle git commits and PR creation? | Answered | Standard workflows explicitly leave changes uncommitted; no PR creation |
| RQ2 | How does Ralph plugin handle PR creation and what can we learn from it? | Answered | Uses shell scripts with GitHub CLI; not agent-driven |
| RQ3 | What integration points exist between workflows for final reporting? | Answered | implement-plan → completion reporting; execute-full-task → mark-task-complete |
| RQ4 | What are the constitutional requirements (C3) for agent-driven automation? | Answered | Human-in-the-loop defaults required; traceable artifacts |
| RQ5 | What reporting formats and templates exist for PR descriptions? | Answered | Review artifacts exist; no PR creation templates |
| RQ6 | How should a final agent workflow integrate with existing workflows? | Answered | Should follow implement-plan or execute-full-task; optional vs required |

## Key Findings

1. **Standard workflows explicitly avoid commits:** `implement-plan` and `execute-full-task` both state "Do not commit changes (leave as open changes for review)" - this is a deliberate design choice.

2. **Ralph uses shell scripts, not agents:** Ralph's PR creation (lines 281-357 in `ralph.sh`) is pure bash script execution using GitHub CLI directly - no agent invocation.

3. **No general-purpose PR creation workflow exists:** Only Ralph plugin has PR automation, and it's plugin-specific and shell-script-based.

4. **Integration points are clear:** `implement-plan` ends with completion reporting; `execute-full-task` ends with `mark-task-complete`; both are natural insertion points.

5. **Constitution requires human-in-the-loop:** C3 delivery principles mandate explicit human confirmation before downstream automation, which affects PR creation design.

6. **Review artifacts exist but no PR creation templates:** Templates exist for PR reviews (`review-artifact-template.md`) but not for PR creation/description generation.

## Detailed Findings

### RQ1: Standard Workflow Git/PR Handling

**Summary:** Standard DevAgent workflows explicitly avoid committing changes and do not create PRs.

**Supporting Evidence:**
- `.devagent/core/workflows/implement-plan.md` (line 5): "Do not commit changes (leave as open changes for review)"
- `.devagent/core/workflows/implement-plan.md` (line 125): "Changes left as open (not committed) for review"
- `.devagent/core/workflows/execute-full-task.md` (line 5): "Do not generate command chains, commit changes, or bypass explicit pause points"
- `.devagent/core/workflows/mark-task-complete.md` (line 5): "Do not modify application code or commit changes"

**Completion Reporting:**
- `implement-plan` generates a summary after all tasks complete (lines 87-90):
  - Completed tasks list
  - Skipped tasks list
  - Blockers
  - Link to updated AGENTS.md
- `execute-full-task` provides final status report with links to artifacts (line 113)

**Freshness:** 2026-01-13 (workflow definitions)

### RQ2: Ralph Plugin PR Creation Approach

**Summary:** Ralph uses shell scripts with GitHub CLI to create PRs automatically after execution loop completes. This is not agent-driven.

**Supporting Evidence:**
- `.devagent/plugins/ralph/tools/ralph.sh` (lines 281-357): Automatic PR creation block
- Process flow:
  1. Check if GitHub CLI (`gh`) is available
  2. Push current branch to origin
  3. Generate markdown report file (`.ralph_pr_body.md`)
  4. Include execution summary, task status, and revise reports
  5. Use `gh pr create` or `gh pr edit` to create/update PR
  6. Clean up temporary report file

**Key Characteristics:**
- **Not agent-driven:** Pure bash script execution in same process
- **Epic-specific:** Uses epic ID for branch naming (`ralph/<epic-id>`)
- **Report generation:** Creates execution report with task status table
- **Revise report integration:** Automatically includes revise reports if available
- **Error handling:** Gracefully fails if GitHub CLI unavailable

**What We Can Learn:**
- Report structure (execution summary, task status, revise reports)
- GitHub CLI usage patterns (`gh pr create`, `gh pr edit`, `gh pr list`)
- Branch detection and pushing
- PR update vs create logic

**Freshness:** 2026-01-13 (ralph.sh script)

### RQ3: Workflow Integration Points

**Summary:** Clear integration points exist at workflow completion stages.

**Supporting Evidence:**

**implement-plan completion (lines 87-90):**
- Generates summary after all executable tasks complete
- Reports final status to user
- Natural insertion point: After completion reporting, before workflow ends

**execute-full-task completion (line 77):**
- Completes with `mark-task-complete` when all workflows execute
- Natural insertion point: After `implement-plan` completes, before `mark-task-complete`

**mark-task-complete (line 5):**
- Explicitly states "Do not modify application code or commit changes"
- This workflow is for task hub management only, not git/PR operations

**Workflow Chain Options:**
1. **After implement-plan:** `implement-plan` → `create-pr` → (optional) `mark-task-complete`
2. **After execute-full-task:** `execute-full-task` → `create-pr` → `mark-task-complete`
3. **Standalone:** `create-pr` (can be invoked independently with task hub path)

**Freshness:** 2026-01-13 (workflow definitions)

### RQ4: Constitutional Requirements (C3)

**Summary:** C3 delivery principles require human-in-the-loop defaults and traceable artifacts.

**Supporting Evidence:**
- `.devagent/workspace/memory/constitution.md` (C3, lines 27-35):
  1. **Human-in-the-loop defaults:** "Every agent interaction produces drafts that require explicit human confirmation before downstream automation proceeds."
  2. **Traceable artifacts:** "All agent outputs must link to mission metrics and cite research inputs. All code changes must be traceable to specific tasks via commit messages and comments."

**Implications for PR Creation Workflow:**
- PR creation should require explicit human confirmation (per C3.1)
- Commit messages must reference task IDs and be traceable (per C3.2)
- PR descriptions should link to task hubs and research artifacts (per C3.2)

**Freshness:** 2026-01-13 (constitution)

### RQ5: Reporting Formats and Templates

**Summary:** Templates exist for PR reviews but not for PR creation/description generation.

**Supporting Evidence:**
- `.devagent/core/templates/review-artifact-template.md`: Template for PR review artifacts
- `.devagent/core/templates/pr-comparison-template.md`: Template for comparing multiple PRs
- **No template exists for:** PR description generation, execution reports, final task summaries

**Ralph's Report Structure (from ralph.sh lines 295-338):**
- Execution Report header
- Status, Date, Branch
- Epic information (if available)
- Execution Summary (iterations run)
- Task Status table
- Revise Report (if available)

**Potential Template Structure:**
- Task summary and context
- Implementation checklist status
- Files changed summary
- Quality gate results
- Links to task hub, research, plan artifacts
- Open questions or blockers

**Freshness:** 2026-01-13 (templates and ralph.sh)

### RQ6: Integration Design Considerations

**Summary:** Final agent workflow should be optional, follow standard workflow patterns, and integrate seamlessly.

**Integration Patterns:**

**Option A: Post-implement-plan Hook**
- `implement-plan` completes → suggests `create-pr` workflow
- User invokes `create-pr` with task hub path
- Workflow handles: commit creation, branch management, PR creation

**Option B: Integrated into execute-full-task**
- `execute-full-task` includes `create-pr` as optional final step
- User can specify "create PR" in workflow overrides
- Executes after `implement-plan`, before `mark-task-complete`

**Option C: Standalone Workflow**
- `create-pr` can be invoked independently
- Takes task hub path as input
- Can be chained manually or suggested by other workflows

**Recommended Approach:** Option C (standalone) with integration hooks in Option A and B, providing flexibility.

**Workflow Naming Considerations:**
- `create-pr` - Clear, action-oriented
- `final-report` - Focuses on reporting aspect
- `complete-task-pr` - Emphasizes task completion context
- **Recommendation:** `create-pr` (matches existing `review-pr` naming pattern)

**Freshness:** 2026-01-13 (workflow analysis)

## Comparative / Alternatives Analysis

### Approach Comparison

| Approach | Pros | Cons | Use Case |
| --- | --- | --- | --- |
| **Shell Script (Ralph-style)** | Fast, deterministic, no agent overhead | Not flexible, can't adapt to context, hard to customize | Plugin-specific automation |
| **Agent-Driven Workflow** | Flexible, context-aware, can generate rich reports | Slower, requires good prompt design | General-purpose, standard workflows |
| **Hybrid (Script + Agent)** | Fast operations, smart reporting | More complex, two-phase execution | Complex reporting needs |

**Recommendation:** Agent-driven workflow for general-purpose use, following Ralph's patterns for structure but using agent intelligence for content generation.

## Implications for Implementation

### Scope Adjustments

1. **Workflow should be optional:** Not all tasks need PRs (documentation-only, research tasks)
2. **Commit creation is debatable:** Should workflow create commits or assume they exist?
   - **Option:** Make commit creation optional/configurable
3. **Branch management:** Should workflow create branches or assume branch exists?
   - **Option:** Detect current branch, create feature branch if on main

### Acceptance Criteria Impacts

- Workflow must require human confirmation before creating PR (C3 requirement)
- PR descriptions must link to task hub and research artifacts (traceability)
- Commit messages must reference task IDs (traceability)
- Workflow should gracefully handle missing GitHub CLI or authentication

### Validation Needs

- Test with various task hub states (complete, partial, blocked)
- Test with different git states (clean, uncommitted changes, existing branch)
- Test integration with `implement-plan` and `execute-full-task`
- Verify human confirmation prompts work correctly

## Risks & Open Questions

| Item | Type | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Should workflow create commits or assume they exist? | Question | TBD | Clarify in task clarification phase | TBD |
| How to handle branch creation vs existing branches? | Question | TBD | Clarify in task clarification phase | TBD |
| What if GitHub CLI is not available? | Risk | TBD | Graceful degradation: generate report file only | TBD |
| How to ensure PR descriptions are comprehensive? | Risk | TBD | Use structured prompt with task hub context | TBD |
| Integration complexity with existing workflows | Risk | TBD | Start with standalone, add integration hooks later | TBD |
| Human confirmation UX | Question | TBD | Design clear confirmation prompts per C3 | TBD |

## Recommended Follow-ups

1. **Clarify requirements:** Run `devagent clarify-task` to validate scope, commit handling, and branch management approach
2. **Design workflow structure:** Create workflow definition following standard DevAgent workflow patterns
3. **Design agent prompt:** Craft comprehensive prompt that includes task hub context, git state, and reporting requirements
4. **Create PR description template:** Design template for consistent PR descriptions
5. **Test integration:** Validate workflow works with `implement-plan` and `execute-full-task` chains

## Sources

| Reference | Type | Freshness | Access Notes |
| --- | --- | --- | --- |
| `.devagent/core/workflows/implement-plan.md` | Internal | 2026-01-13 | Standard workflow definition |
| `.devagent/core/workflows/execute-full-task.md` | Internal | 2026-01-13 | Full task lifecycle workflow |
| `.devagent/core/workflows/mark-task-complete.md` | Internal | 2026-01-13 | Task completion workflow |
| `.devagent/core/workflows/review-pr.md` | Internal | 2026-01-13 | PR review workflow (for reference) |
| `.devagent/plugins/ralph/tools/ralph.sh` | Internal | 2026-01-13 | Ralph PR creation implementation |
| `.devagent/workspace/memory/constitution.md` | Internal | 2026-01-13 | C3 delivery principles |
| `.devagent/core/templates/review-artifact-template.md` | Internal | 2026-01-13 | PR review template |
| `.devagent/core/AGENTS.md` | Internal | 2026-01-13 | Workflow roster and standard instructions |
