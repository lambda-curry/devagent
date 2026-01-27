# Research: Ralph Branching Flow Simplification

- Date: 2026-01-16
- Related Task: `.devagent/workspace/tasks/completed/DEV-32_ralph-branching-flow/`
- Classification: Implementation Design
- Assumptions: User will configure branches in config.json before running ralph.sh

## Research Plan

This research validates the following:

1. **Current Setup Agent Responsibilities**: What does the setup agent currently do, and what validation logic should be preserved?
2. **Current Final Review Agent Responsibilities**: What does the final review agent do, and can its functionality be moved elsewhere?
3. **Branch Creation Logic**: How does the setup agent create branches, and what issues have occurred?
4. **Configuration Structure**: What is the current config.json schema, and how should branch configuration be added?
5. **Main Loop Dependencies**: What does the main ralph loop agent need to know about branches?
6. **Failure Modes**: What problems have occurred with the current setup agent approach?

## Sources

| Reference | Type | Freshness | Access Notes |
| --- | --- | --- | --- |
| `.devagent/plugins/ralph/workflows/setup-workspace.md` | Internal workflow | 2026-01-16 | Setup agent workflow definition |
| `.devagent/plugins/ralph/workflows/final-review.md` | Internal workflow | 2026-01-16 | Final review agent workflow definition |
| `.devagent/plugins/ralph/tools/ralph.sh` | Internal script | 2026-01-16 | Main execution script with agent invocations |
| `.devagent/plugins/ralph/tools/config.json` | Internal config | 2026-01-16 | Current configuration schema |
| `.devagent/plugins/ralph/workflows/setup-ralph-loop.md` + `.devagent/plugins/ralph/workflows/start-ralph-execution.md` | Internal workflows | 2026-01-16 | Canonical setup + start docs |
| `.devagent/workspace/tasks/completed/2026-01-14_ralph-revision-3/research/2026-01-15_branch-name-slash-issue.md` | Internal research | 2026-01-15 | Historical branch creation issues |
| `.devagent/plugins/ralph/AGENTS.md` | Internal documentation | 2026-01-16 | Main loop agent instructions |

## Findings & Tradeoffs

### 1. Current Setup Agent Responsibilities

**Summary:** The setup agent (`setup-workspace.md`) performs three main functions:

1. **Epic Validation**: Validates Epic ID using `bd show <EPIC_ID> --json` and fails fast if Epic doesn't exist
2. **Git Branch Management**: Creates or switches to `ralph-<EPIC_ID>` branch (dash-separated), ensures workspace is clean, and pushes to remote
3. **Environment Preparation**: Ensures `beads.db` path is accessible and confirms `AGENTS.md` is readable

**Key Logic:**
- Branch naming: Uses `ralph-<EPIC_ID>` (dash-separated) to avoid GitHub "fatal error in commit_refs" issue
- Base branch: Creates from `main` branch (or configured base branch) if branch doesn't exist
- Workspace validation: Checks for uncommitted changes and handles stashing/failing based on project safety rules
- Safety check: Ralph script validates we're not on `main` branch before proceeding (line 138-143 in `ralph.sh`)

**Evidence:**
- `.devagent/plugins/ralph/workflows/setup-workspace.md` lines 24-40
- `.devagent/plugins/ralph/tools/ralph.sh` lines 91-96 (invocation), 138-143 (safety check)

**Tradeoffs:**
- **Preserve Epic Validation**: This is critical - if Epic doesn't exist, execution should fail immediately. This validation should be moved to `ralph.sh` directly or kept as a simple check before the main loop.
- **Remove Branch Creation**: Branch creation logic should be removed - user will configure branches in config.json
- **Remove Workspace Cleanup**: Workspace cleanup (stashing) can be handled manually by the user or removed entirely

### 2. Current Final Review Agent Responsibilities

**Summary:** The final review agent (`final-review.md`) performs:

1. **Data Aggregation**: Fetches task status summary, extracts revision learning comments, identifies revise reports
2. **Summary Generation**: Creates executive summary of execution cycle (accomplishments, blockers, stop reason)
3. **Revise Report Integration**: Appends improvement recommendations from revise reports to PR body
4. **PR Management**: Creates or updates GitHub PR with comprehensive execution report

**Key Logic:**
- Runs via `trap finish EXIT` in `ralph.sh` (line 114-124), ensuring it runs even if script crashes
- Requires `gh` CLI for PR operations
- Falls back to writing `.ralph_pr_body.md` file if `gh` CLI is missing

**Evidence:**
- `.devagent/plugins/ralph/workflows/final-review.md` lines 24-48
- `.devagent/plugins/ralph/tools/ralph.sh` lines 114-124 (trap definition)

**Tradeoffs:**
- **Remove PR Creation**: PR creation can be handled manually by the user or moved to a separate workflow
- **Preserve Summary Generation**: The summary generation logic could be useful, but can be simplified or removed
- **Remove Automatic Invocation**: The trap-based invocation adds complexity - user can run final review manually if needed

### 3. Branch Creation Issues

**Summary:** Historical research shows recurring issues with branch creation:

1. **GitHub Server Errors**: Branch names with slashes (e.g., `ralph/<EPIC_ID>`) frequently fail to push with "fatal error in commit_refs" errors
2. **Worktree Conflicts**: Branch creation in worktrees can cause conflicts when branch names don't match
3. **Unreliable Pattern**: While some branches with slashes work, the pattern is unreliable and causes frequent push failures

**Evidence:**
- `.devagent/workspace/tasks/completed/2026-01-14_ralph-revision-3/research/2026-01-15_branch-name-slash-issue.md` documents the issue
- Setup agent workflow explicitly notes: "Branch names with slashes (e.g., `ralph/<EPIC_ID>`) frequently fail to push with GitHub server errors. Use dash-separated names instead." (line 32)

**Tradeoffs:**
- **Remove Dynamic Branch Creation**: Eliminates the source of these issues
- **User-Configured Branches**: User sets branch names in config.json, avoiding dynamic generation problems
- **Simpler Flow**: No need to handle branch creation failures or edge cases

### 4. Current Configuration Structure

**Summary:** Current `config.json` structure:

```json
{
  "beads": {
    "database_path": ".beads/beads.db",
    "project": "default"
  },
  "ai_tool": {
    "name": "agent",
    "command": "agent",
    "env": {}
  },
  "quality_gates": {
    "template": "",
    "overrides": {}
  },
  "beads_payload": ".devagent/plugins/ralph/output/beads-payload.json",
  "execution": {
    "require_confirmation": true,
    "max_iterations": 50
  }
}
```

**Proposed Extension:** Add `git` section:

```json
{
  "git": {
    "base_branch": "main",
    "working_branch": "ralph-dev-32"
  }
}
```

**Evidence:**
- `.devagent/plugins/ralph/tools/config.json` shows current structure
- Similar pattern exists for `ai_tool` configuration (user specifies command)

**Tradeoffs:**
- **Explicit Configuration**: User must set branches before running, but avoids dynamic generation issues
- **Flexibility**: User can use any branch naming convention they prefer
- **Validation**: Script should validate branches exist before proceeding

### 5. Main Loop Dependencies

**Summary:** The main ralph loop agent needs:

1. **Branch Context**: Currently gets branch context implicitly (runs on current branch). With config, should validate it matches configured working branch.
2. **Epic Validation**: Currently validated by setup agent. Should be moved to `ralph.sh` directly.
3. **Safety Checks**: Currently checks we're not on `main` (line 138-143). Should check we're on configured working branch instead.

**Evidence:**
- `.devagent/plugins/ralph/tools/ralph.sh` lines 138-143 (main branch check)
- `.devagent/plugins/ralph/AGENTS.md` shows main loop doesn't explicitly reference branches in prompts

**Tradeoffs:**
- **Simpler Validation**: Single check in `ralph.sh` instead of separate agent
- **Explicit Branch Context**: Can pass branch info to main loop agent if needed
- **Reduced Complexity**: No need for setup agent invocation

### 6. Failure Modes

**Summary:** Current setup agent can fail in several ways:

1. **Epic Not Found**: Setup agent validates Epic, but failure handling is unclear (line 93-96 in `ralph.sh` notes "we don't exit on failure here yet")
2. **Branch Creation Failures**: GitHub push errors, worktree conflicts, branch name issues
3. **Workspace Conflicts**: Uncommitted changes on wrong branch can cause failures

**Evidence:**
- `.devagent/plugins/ralph/tools/ralph.sh` line 93-96 shows setup agent invocation without explicit error handling
- Historical research shows branch creation failures

**Tradeoffs:**
- **Remove Failure Points**: Eliminating setup agent removes these failure modes
- **User Responsibility**: User ensures branches exist and workspace is clean before running
- **Simpler Error Handling**: Fewer failure points to handle

## Recommendation

**Remove both setup and final review agents, and move branch configuration to `config.json`.**

### Implementation Approach:

1. **Add `git` section to `config.json`**:
   ```json
   {
     "git": {
       "base_branch": "main",
       "working_branch": "ralph-dev-32"
     }
   }
   ```

2. **Update `ralph.sh` to**:
   - Read branch configuration from `config.json`
   - Validate Epic ID directly (simple `bd show` check)
   - Validate current branch matches `working_branch` from config
   - Remove setup agent invocation (lines 91-96)
   - Remove final review agent trap (lines 114-124)
   - Remove main branch safety check (lines 138-143) - replace with working branch check

3. **Preserve Critical Validation**:
   - Epic validation: Move to `ralph.sh` directly (simple check before main loop)
   - Branch validation: Check current branch matches configured working branch
   - Beads DB validation: Keep existing check (lines 127-133)

4. **Remove Agent Invocations**:
   - Remove setup agent call (line 93)
   - Remove final review agent trap (lines 114-124)

### Benefits:

- **Simpler Flow**: Fewer moving parts, less complexity
- **Fewer Failure Points**: Eliminates branch creation failures
- **Explicit Configuration**: User controls branch setup upfront
- **Easier Debugging**: No agent invocations to debug
- **Faster Startup**: No agent invocation overhead

### Risks:

- **User Must Pre-Configure**: User must set up branches before running (mitigated by clear documentation)
- **Lost PR Automation**: PR creation must be manual (acceptable tradeoff for simplicity)
- **Lost Summary Generation**: Execution summaries must be manual (acceptable tradeoff)

## Repo Next Steps

- [ ] Design exact `config.json` schema for `git` section
- [ ] Update `ralph.sh` to read and validate branch configuration
- [ ] Move Epic validation to `ralph.sh` (remove from setup agent)
- [ ] Remove setup agent invocation from `ralph.sh`
- [ ] Remove final review agent trap from `ralph.sh`
- [ ] Update branch validation logic (check current branch matches config)
- [ ] Update documentation to reflect new configuration requirements
- [ ] Test simplified flow with configured branches

## Risks & Open Questions

| Item | Type | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Should Epic validation be preserved? | Question | TBD | Move to simple check in `ralph.sh` before main loop | TBD |
| What if configured working branch doesn't exist? | Question | TBD | Script should check branch exists and fail with clear error | TBD |
| What if user is on wrong branch? | Question | TBD | Script should validate current branch matches config and fail with clear error | TBD |
| Should we preserve any workspace cleanup logic? | Question | TBD | Remove - user responsibility to ensure clean workspace | TBD |
| Lost PR automation may reduce visibility | Risk | TBD | Document manual PR creation process, or create separate lightweight workflow | TBD |
| User must remember to configure branches | Risk | TBD | Clear error messages if config missing, update documentation | TBD |
