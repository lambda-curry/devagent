# Research Packet — Ralph Improvements

- Mode: Task
- Requested By: Jake Ruesink
- Last Updated: 2026-01-13
- Related Plan: (not yet created)
- Storage Path: `.devagent/workspace/tasks/active/2026-01-13_ralph-improvements/research/2026-01-13_ralph-improvements-research.md`
- Stakeholders: Jake Ruesink (Owner)

## Request Overview

Investigate four improvement areas for the Ralph autonomous execution system:
1. **Better Task Descriptions** - Enhance task context with code references, rules, docs, and testing criteria
2. **Setup Worktree for Epic** - Implement git worktree functionality for epic isolation
3. **PR Creation on Cycle Break** - Automate PR creation with reports when execution completes/fails
4. **Epic-Focused Execution** - Filter Ralph to work on specific epics instead of all open tasks

## Context Snapshot

- **Task summary:** Improve Ralph's autonomy, traceability, and usability through enhanced context, isolation, automation, and filtering
- **Task reference:** `.devagent/workspace/tasks/active/2026-01-13_ralph-improvements/`
- **Existing decisions:** 
  - Ralph uses Beads for task tracking (`.devagent/plugins/ralph/AGENTS.md`)
  - Plan-to-beads conversion creates tasks with minimal descriptions (`.devagent/plugins/ralph/skills/plan-to-beads-conversion/SKILL.md`)
  - Revise reports are generated manually via `devagent ralph-revise-report` (`.devagent/plugins/ralph/workflows/generate-revise-report.md`)

## Research Questions

| ID | Question | Status | Notes |
| --- | --- | --- | --- |
| RQ1 | How are task descriptions currently generated in plan-to-beads conversion? | Answered | Tasks get minimal description (just objective) + plan document reference in notes |
| RQ2 | What information is available during plan-to-beads conversion that could enrich task descriptions? | Answered | Plan document, task context, quality gates, epic context |
| RQ3 | How does git worktree work and what patterns exist for epic isolation? | Answered | Git worktree allows multiple working directories from one repo |
| RQ4 | How does Ralph currently select tasks for execution? | Answered | Uses `bd ready` which returns next ready task from ALL open tasks |
| RQ5 | What happens when Ralph execution loop completes or fails? | Answered | Shows git log summary, no PR creation or automated reporting |
| RQ6 | What PR creation workflows or patterns exist in the codebase? | Answered | PR review workflows exist, but no PR creation automation |
| RQ7 | How are revise reports currently generated and when? | Answered | Manual workflow `devagent ralph-revise-report <EpicID>`, runs after epic completion |

## Key Findings

1. **Task descriptions are minimal** - Currently only include objective text and plan document reference, requiring agents to read full plan for context
2. **No worktree functionality exists** - Would be new feature for epic isolation
3. **No PR automation** - Ralph completes loop with git summary only, no PR creation
4. **Ralph processes all open tasks** - Uses `bd ready` without epic filtering, though epic status is checked
5. **Revise reports are manual** - Generated via separate workflow after epic completion, not integrated into cycle break

## Detailed Findings

### RQ1 & RQ2: Task Description Generation

**Current State:**
- Plan-to-beads conversion (`.devagent/plugins/ralph/skills/plan-to-beads-conversion/SKILL.md`) creates tasks with:
  - `description`: Task objective text only (extracted from plan's "Objective:" field)
  - `notes`: "Plan document: <absolute-path-to-plan-file>"
  - `acceptance_criteria`: List of criteria from plan
  - No code references, rules, docs, or testing criteria in task description

**Available Context During Conversion:**
- Full plan document (includes PART 1: PRODUCT CONTEXT with architecture, constraints, etc.)
- Task objective and acceptance criteria
- Quality gates from template (`.devagent/plugins/ralph/quality-gates/typescript.json`)
- Epic context (final deliverable, quality gates)
- Task dependencies and relationships

**Agent Behavior:**
- Agents are instructed to read plan document from `notes` field (`.devagent/plugins/ralph/AGENTS.md` line 21)
- Agents must manually extract relevant context from plan document
- No structured guidance on what parts of code/rules/docs to review

**Enhancement Opportunity:**
- Enrich task descriptions during plan-to-beads conversion with:
  - Code paths/files that task touches (could be extracted from plan's "Impacted Modules/Files" sections if present)
  - Relevant rules/documentation references (AGENTS.md, Cursor rules, etc.)
  - Testing criteria (from quality gates or plan)
  - Architecture context from plan's PART 1

**Source:** `.devagent/plugins/ralph/skills/plan-to-beads-conversion/SKILL.md` (2026-01-13), `.devagent/plugins/ralph/AGENTS.md` (2026-01-13)

### RQ3: Git Worktree for Epic Isolation

**Git Worktree Basics:**
- Git worktree allows multiple working directories from a single repository
- Each worktree has its own working directory but shares the same `.git` directory
- Useful for isolating feature work, parallel development, or branch-specific builds

**Patterns:**
- Create worktree: `git worktree add <path> <branch>`
- List worktrees: `git worktree list`
- Remove worktree: `git worktree remove <path>`
- Worktrees can be in subdirectories or separate locations

**Epic Isolation Use Case:**
- Create worktree for epic branch: `git worktree add ../epic-<epic-id> epic-<epic-id>`
- Run Ralph in worktree directory
- Isolates epic work from main working directory
- Enables parallel epic execution
- Cleanup: `git worktree remove ../epic-<epic-id>` after epic completion

**Implementation Considerations:**
- Branch naming: Use epic ID or slug (e.g., `ralph/epic-bd-a3f8`)
- Worktree location: `.devagent/plugins/ralph/worktrees/epic-<epic-id>/` or project root sibling
- Cleanup strategy: Automatic cleanup on epic completion or manual cleanup
- Integration point: Add to `execute-autonomous.md` workflow before starting Ralph

**Source:** Git documentation (standard feature), no existing implementation found in codebase

### RQ4: Epic-Focused Execution

**Current Task Selection:**
- Ralph script (`.devagent/plugins/ralph/tools/ralph.sh` line 62) uses:
  ```bash
  READY_TASK=$(bd ready --json 2>/dev/null | jq -r '...')
  ```
- `bd ready` returns the next ready task from ALL open tasks in Beads database
- No filtering by epic ID

**Epic Status Check:**
- Script checks epic status (lines 69-77) to stop if epic is blocked/done
- But doesn't filter which epic to work on

**Enhancement Opportunity:**
- Add epic ID parameter to `ralph.sh`:
  - Environment variable: `RALPH_EPIC_ID=bd-a3f8 .devagent/plugins/ralph/tools/ralph.sh`
  - Command-line flag: `.devagent/plugins/ralph/tools/ralph.sh --epic bd-a3f8`
- Filter `bd ready` to only return tasks from specified epic:
  - Option 1: `bd list --parent <EPIC_ID> --status ready --json | jq -r '.[0].id'`
  - Option 2: Check task's `parent_id` matches epic ID after getting ready task
- Update `start-ralph-execution.md` workflow to accept epic ID parameter

**Source:** `.devagent/plugins/ralph/tools/ralph.sh` (2026-01-13), `.devagent/plugins/ralph/workflows/start-ralph-execution.md` (2026-01-13)

### RQ5 & RQ6: PR Creation on Cycle Break

**Current Cycle Break Behavior:**
- Ralph script (`.devagent/plugins/ralph/tools/ralph.sh` lines 188-193) shows:
  - Git log summary: `git log --oneline --grep="ralph:" | head -10`
  - No PR creation
  - No automated reporting

**Cycle Break Scenarios:**
1. **Success:** All tasks complete, no more ready tasks (line 64-67)
2. **Failure:** Max iterations reached (line 58)
3. **Epic Blocked:** Parent epic status is blocked/done (line 73-76)
4. **Agent Error:** AI tool returns non-zero exit code (line 176-183)

**PR Creation Patterns:**
- PR review workflows exist (`.cursor/skills/pr-review-integration/SKILL.md`)
- GitHub CLI operations skill (`.cursor/skills/github-cli-operations/SKILL.md`)
- No PR creation automation found

**Revise Report Integration:**
- Revise report workflow exists (`.devagent/plugins/ralph/workflows/generate-revise-report.md`)
- Currently manual: `devagent ralph-revise-report <EpicID>`
- Generates report in `.devagent/workspace/reviews/`
- Could be integrated into cycle break handler

**Enhancement Opportunity:**
- Create new workflow: `create-epic-pr.md` or extend `ralph.sh` with PR creation hook
- On cycle break (any cause):
  1. Generate revise report (if epic complete) or execution summary
  2. Create branch if not already on one (currently creates `ralph/execution`)
  3. Push branch to remote
  4. Create PR using GitHub CLI: `gh pr create --title "..." --body "<report content>"`
  5. Include report in PR description
- Consider per-task pushes if Vercel builds are cost-effective (requires investigation)

**Source:** `.devagent/plugins/ralph/tools/ralph.sh` (2026-01-13), `.devagent/plugins/ralph/workflows/generate-revise-report.md` (2026-01-13), `.cursor/skills/github-cli-operations/SKILL.md` (2026-01-13)

### RQ7: Revise Report Generation

**Current Workflow:**
- Manual trigger: `devagent ralph-revise-report <EpicID>`
- Workflow: `.devagent/plugins/ralph/workflows/generate-revise-report.md`
- Skill: `.devagent/plugins/ralph/skills/revise-report-generation/SKILL.md`

**Report Content:**
- Epic summary and completion status
- Traceability matrix (task → commit mapping)
- Evidence & screenshots
- Improvement recommendations (Documentation, Process, Rules, Tech Architecture)
- Action items

**Timing:**
- Currently runs manually after epic completion
- Epic includes final task "Generate Epic Revise Report" that depends on all other tasks
- Task becomes ready when all dependencies complete
- Agent must manually run report generation workflow

**Integration Opportunity:**
- Automate report generation on cycle break
- Include report in PR description when creating PR
- Could be triggered automatically when epic completion detected

**Source:** `.devagent/plugins/ralph/workflows/generate-revise-report.md` (2026-01-13), `.devagent/plugins/ralph/skills/revise-report-generation/SKILL.md` (2026-01-13)

## Comparative / Alternatives Analysis

### Task Description Enhancement

**Option A: Enrich During Conversion**
- **Pros:** Context available at conversion time, structured, consistent
- **Cons:** Requires plan document to have structured sections (Impacted Modules, etc.)
- **Effort:** Medium - modify plan-to-beads conversion skill

**Option B: Agent Instructions Enhancement**
- **Pros:** No conversion changes needed, flexible
- **Cons:** Relies on agent to extract context, less structured
- **Effort:** Low - update AGENTS.md with better instructions

**Option C: Hybrid Approach**
- **Pros:** Best of both - structured during conversion, instructions as fallback
- **Cons:** More complex
- **Effort:** Medium-High

**Recommendation:** Option A with Option B as fallback - enrich during conversion when possible, enhance agent instructions for manual extraction

### Worktree Implementation

**Option A: Automatic Worktree Creation**
- **Pros:** Fully automated, consistent isolation
- **Cons:** Requires cleanup logic, more complex
- **Effort:** Medium

**Option B: Manual Worktree Setup**
- **Pros:** Simple, user control
- **Cons:** Manual step, easy to forget
- **Effort:** Low

**Option C: Optional Worktree Flag**
- **Pros:** Flexible, opt-in
- **Cons:** Inconsistent usage
- **Effort:** Medium

**Recommendation:** Option A with cleanup on epic completion - fully automated for best UX

### PR Creation

**Option A: Always Create PR on Cycle Break**
- **Pros:** Consistent, always have PR for review
- **Cons:** May create PRs for incomplete work
- **Effort:** Medium

**Option B: PR Only on Epic Completion**
- **Pros:** Cleaner, only complete work in PRs
- **Cons:** No PR if epic fails/blocked early
- **Effort:** Medium

**Option C: Configurable PR Creation**
- **Pros:** Flexible, user control
- **Cons:** More configuration, inconsistent
- **Effort:** Medium-High

**Recommendation:** Option A - always create PR with appropriate status/description indicating completion state

### Epic Filtering

**Option A: Environment Variable**
- **Pros:** Simple, script-friendly
- **Cons:** Less discoverable
- **Effort:** Low

**Option B: Command-Line Flag**
- **Pros:** Explicit, discoverable
- **Cons:** More complex parsing
- **Effort:** Low-Medium

**Option C: Both**
- **Pros:** Flexible, supports both use cases
- **Cons:** Slightly more code
- **Effort:** Low-Medium

**Recommendation:** Option C - support both for maximum flexibility

## Implications for Implementation

### Scope Adjustments

1. **Task Description Enhancement:**
   - Modify plan-to-beads conversion to extract and include:
     - Code paths from plan's "Impacted Modules/Files" sections
     - Relevant rules/docs references (could be standardized list)
     - Testing criteria from quality gates
   - Update agent instructions to use enriched descriptions
   - May require plan template updates to ensure structured sections

2. **Worktree Setup:**
   - Add worktree creation to `execute-autonomous.md` workflow
   - Create epic branch if doesn't exist
   - Set up worktree in designated location
   - Update `start-ralph-execution.md` to run in worktree
   - Add cleanup logic (manual or automatic on epic completion)

3. **PR Creation:**
   - Create new workflow or extend `ralph.sh` with PR creation hook
   - Integrate revise report generation into cycle break handler
   - Use GitHub CLI to create PR with report in description
   - Handle different cycle break scenarios (success, failure, blocked)
   - Consider per-task push option (requires Vercel cost investigation)

4. **Epic Filtering:**
   - Add epic ID parameter to `ralph.sh` (env var and/or flag)
   - Modify task selection to filter by epic
   - Update `start-ralph-execution.md` to accept and pass epic ID
   - Ensure backward compatibility (no epic ID = current behavior)

### Acceptance Criteria Impacts

- All improvements should maintain backward compatibility
- Worktree should be optional (opt-in via flag or config)
- PR creation should handle all cycle break scenarios gracefully
- Epic filtering should not break existing workflows

### Validation Needs

- Test plan-to-beads conversion with enriched descriptions
- Test worktree creation/cleanup in various scenarios
- Test PR creation with different cycle break causes
- Test epic filtering with single epic and multiple epics
- Verify backward compatibility

## Risks & Open Questions

| Item | Type | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Plan documents may not have structured "Impacted Modules" sections | Risk | Implementation | Use fallback to agent instructions, enhance plan template | TBD |
| Worktree cleanup on epic failure | Risk | Implementation | Add manual cleanup command, document cleanup process | TBD |
| Vercel build costs for per-task pushes | Question | Research | Investigate Vercel pricing, test with small epic | TBD |
| PR creation requires GitHub CLI auth | Risk | Implementation | Document setup, provide clear error messages | TBD |
| Epic filtering breaks existing multi-epic workflows | Risk | Testing | Ensure backward compatibility, test thoroughly | TBD |
| Report generation timing (mid-epic vs completion) | Question | Design | Decide on trigger timing, document decision | TBD |

## Recommended Follow-ups

1. **Investigate Vercel Build Costs:** Research Vercel pricing model to determine if per-task pushes are cost-effective
2. **Plan Template Enhancement:** Review plan template to ensure "Impacted Modules/Files" sections are standardized
3. **GitHub CLI Setup:** Document GitHub CLI authentication requirements for PR creation
4. **Worktree Cleanup Strategy:** Design cleanup approach (automatic vs manual, when to trigger)
5. **Report Generation Timing:** Decide whether reports should be generated on cycle break or only on epic completion
6. **Testing Strategy:** Design test scenarios for all four improvements, especially edge cases

## Sources

| Reference | Type | Freshness | Access Notes |
| --- | --- | --- | --- |
| `.devagent/plugins/ralph/skills/plan-to-beads-conversion/SKILL.md` | Internal | 2026-01-13 | Plan-to-beads conversion process |
| `.devagent/plugins/ralph/tools/ralph.sh` | Internal | 2026-01-13 | Ralph execution loop implementation |
| `.devagent/plugins/ralph/AGENTS.md` | Internal | 2026-01-13 | Agent instructions and task context requirements |
| `.devagent/plugins/ralph/workflows/execute-autonomous.md` | Internal | 2026-01-13 | Autonomous execution setup workflow |
| `.devagent/plugins/ralph/workflows/start-ralph-execution.md` | Internal | 2026-01-13 | Ralph execution launch workflow |
| `.devagent/plugins/ralph/workflows/generate-revise-report.md` | Internal | 2026-01-13 | Revise report generation workflow |
| `.devagent/plugins/ralph/skills/revise-report-generation/SKILL.md` | Internal | 2026-01-13 | Report generation skill instructions |
| `.cursor/skills/github-cli-operations/SKILL.md` | Internal | 2026-01-13 | GitHub CLI operations reference |
| `.cursor/skills/pr-review-integration/SKILL.md` | Internal | 2026-01-13 | PR review patterns (not creation) |
| Git worktree documentation | External | Standard | Git feature documentation |
