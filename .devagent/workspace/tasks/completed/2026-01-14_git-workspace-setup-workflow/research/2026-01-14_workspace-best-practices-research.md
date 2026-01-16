# Research Packet — Workspace Best Practices and Management Patterns

- Mode: Task
- Requested By: Jake Ruesink
- Last Updated: 2026-01-14
- Related Task Hub: `.devagent/workspace/tasks/completed/2026-01-14_git-workspace-setup-workflow/`
- Storage Path: `.devagent/workspace/tasks/completed/2026-01-14_git-workspace-setup-workflow/research/2026-01-14_workspace-best-practices-research.md`
- Stakeholders: Jake Ruesink (AgentBuilder)

## Request Overview
Research workspace management best practices, cleanup strategies, and how others manage workspaces. Key questions:
1. What are workspace best practices?
2. Do we need to clean them up when done?
3. How do other people manage workspaces?

## Context Snapshot
- Task summary: Create a git-workspace workflow to setup a new workspace and optionally move in-progress uncommitted work to a new workspace for concurrent feature development
- Task reference: `.devagent/workspace/tasks/completed/2026-01-14_git-workspace-setup-workflow/`
- Existing decisions: Related work on setup agent that validates epic/tasks and prepares git workspace (`.devagent/workspace/tasks/completed/2026-01-13_final-agent-pr-creation-reporting/`)

## Research Questions
| ID | Question | Status | Notes |
| --- | --- | --- | --- |
| RQ1 | What are git worktree best practices? | Answered | Official git documentation and patterns |
| RQ2 | Do workspaces need cleanup when done? | Answered | Yes, but with safety checks |
| RQ3 | How do others manage multiple workspaces? | Answered | Worktree patterns and tooling |
| RQ4 | What are the safety considerations for workspace operations? | Answered | Clean state checks, force removal options |

## Key Findings
1. **Git worktrees enable concurrent development** — Multiple checked-out branches can exist simultaneously, sharing repository data but with independent working directories
2. **Cleanup is recommended but not automatic** — Workspaces should be explicitly removed using `git worktree remove`, with `--force` for unclean states
3. **Prune handles stale metadata** — `git worktree prune` cleans up administrative files from manually deleted worktrees
4. **Main worktree cannot be removed** — Only linked worktrees can be removed; the main worktree is permanent
5. **Safety by default** — Git prevents removal of unclean worktrees unless `--force` is used, protecting uncommitted work
6. **Temporary worktree pattern** — Common pattern: create worktree → work → commit → remove worktree

## Detailed Findings

### RQ1: Git Worktree Best Practices

**Summary:** Git worktrees allow multiple working directories for the same repository, enabling concurrent work on different branches without switching contexts.

**Supporting Evidence:**
- **Official Git Documentation** (git-scm.com, 2026-01-14): A repository can support multiple working trees, allowing checkout of more than one branch at a time. The main worktree is created by `git init` or `git clone`, and additional "linked worktrees" are created with `git worktree add`
- **Worktree Structure:** Each worktree shares repository data (objects, refs) but has independent per-worktree files (index, HEAD, config)
- **Common Use Cases:**
  - Working on multiple features simultaneously
  - Emergency fixes without disrupting main work
  - Testing different branches side-by-side

**Commands:**
```bash
# Create a new worktree
git worktree add <path> [<commit-ish>]

# Create with new branch
git worktree add -b <new-branch> <path> [<commit-ish>]

# List all worktrees
git worktree list [-v | --porcelain]

# Remove a worktree
git worktree remove <path>
```

**Freshness:** Git documentation (2026-01-14), official git-scm.com sources

### RQ2: Do Workspaces Need Cleanup When Done?

**Summary:** Yes, workspaces should be explicitly removed when no longer needed. Git provides safety checks to prevent accidental data loss.

**Supporting Evidence:**
- **Default Safety:** `git worktree remove` only removes "clean" worktrees (no untracked files, no modified tracked files) by default
- **Force Removal:** `--force` option allows removal of unclean worktrees, but this is explicit and requires user intent
- **Prune for Stale Metadata:** `git worktree prune` removes stale administrative files from worktrees that were deleted manually (outside of git commands)
- **Main Worktree Protection:** The main worktree cannot be removed, ensuring at least one working directory always exists

**Cleanup Patterns:**
1. **Explicit Removal (Recommended):** `git worktree remove <path>` — Safest, preserves work
2. **Force Removal:** `git worktree remove --force <path>` — For when you want to discard uncommitted changes
3. **Prune Stale:** `git worktree prune` — Cleanup after manual directory deletion

**Best Practice:** Always use `git worktree remove` when done with a worktree. If you manually delete the directory, run `git worktree prune` to clean up metadata.

**Freshness:** Git documentation (2026-01-14)

### RQ3: How Do Others Manage Multiple Workspaces?

**Summary:** Common patterns include temporary worktrees for quick fixes, feature-specific worktrees for concurrent development, and tooling to manage worktree lifecycles.

**Supporting Evidence:**
- **Temporary Worktree Pattern:** Official git documentation example shows creating a worktree for emergency fixes, committing, then removing:
  ```bash
  git worktree add -b emergency-fix ../temp master
  # ... work ...
  git commit -a -m 'emergency fix'
  git worktree remove ../temp
  ```

- **Concurrent Development:** Worktrees enable working on multiple features without context switching or stashing
- **Tooling:** Tools like `git-machete` and `git-spice` provide higher-level workflows for managing branch stacks and worktrees
- **Ralph Plugin Pattern:** Existing DevAgent work shows setup agents that prepare git workspace/branch before execution (`.devagent/workspace/tasks/completed/2026-01-13_final-agent-pr-creation-reporting/`)

**Management Strategies:**
1. **Feature-based:** One worktree per feature branch
2. **Temporary:** Create for specific tasks, remove when done
3. **Persistent:** Long-lived worktrees for ongoing work streams
4. **Tool-assisted:** Use scripts or tools to manage worktree lifecycle

**Freshness:** Git documentation (2026-01-14), DevAgent internal context (2026-01-14)

### RQ4: Safety Considerations for Workspace Operations

**Summary:** Git provides multiple safety mechanisms: clean state checks, force flags for explicit overrides, and protection of the main worktree.

**Supporting Evidence:**
- **Clean State Requirement:** By default, only clean worktrees can be removed, preventing accidental loss of uncommitted work
- **Force Flag:** `--force` must be explicitly provided to remove unclean worktrees, requiring user intent
- **Main Worktree Protection:** The main worktree cannot be removed, ensuring repository integrity
- **Submodule Handling:** Force removal may be needed for worktrees containing submodules
- **Administrative Files:** Worktree metadata is stored in `.git/worktrees/`, and stale entries can be pruned

**Safety Checklist:**
- ✅ Check worktree status before removal (`git worktree list`)
- ✅ Verify no uncommitted changes if removing without force
- ✅ Use `--force` only when intentionally discarding work
- ✅ Run `git worktree prune` after manual directory deletions
- ✅ Never attempt to remove the main worktree

**Freshness:** Git documentation (2026-01-14)

## Comparative / Alternatives Analysis

### Alternative Approaches to Concurrent Development

| Approach | Pros | Cons | Use Case |
| --- | --- | --- | --- |
| **Git Worktrees** | Multiple checkouts, shared repo data, independent working dirs | Requires explicit cleanup, manual management | Concurrent features, emergency fixes |
| **Git Stash** | Quick context switch, simple | Single working directory, stash conflicts | Temporary context switches |
| **Multiple Clones** | Complete isolation | Disk space, sync overhead | Completely separate experiments |
| **Branch Switching** | Simple, familiar | Context loss, uncommitted work handling | Sequential development |

**Recommendation:** Git worktrees are ideal for the use case (concurrent feature development) because they provide isolation without the overhead of multiple clones and enable safe separation of uncommitted work.

## Implications for Implementation

### Workflow Design Considerations

1. **Workspace Creation:**
   - Use `git worktree add -b <branch> <path>` to create new branch in new worktree
   - Consider path naming conventions (e.g., `../workspace-<feature-name>`)
   - Handle path conflicts gracefully

2. **Uncommitted Work Migration:**
   - Option 1: Stash in main worktree, apply in new worktree
   - Option 2: Create worktree first, then move/copy files
   - Option 3: Commit to temporary branch, then move to new worktree branch
   - **Recommendation:** Stash → create worktree → apply stash (safest, preserves git history)

3. **Cleanup Strategy:**
   - Always attempt clean removal first (`git worktree remove <path>`)
   - If unclean, prompt user or use `--force` based on policy
   - Consider automatic pruning of stale worktrees
   - Document cleanup in workflow

4. **Safety Checks:**
   - Verify worktree doesn't already exist at target path
   - Check git status before operations
   - Validate branch doesn't conflict with existing branches
   - Confirm main worktree is not being removed

5. **Integration with DevAgent:**
   - Follow tool-agnostic design (C4) — workflow should work across tools
   - Consider integration with existing setup agent patterns
   - Align with DevAgent's human-in-the-loop defaults (C3) — prompt for confirmation on destructive operations

## Risks & Open Questions

| Item | Type | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Uncommitted work migration strategy | Question | Jake Ruesink | Test stash → apply pattern vs. file copy vs. commit patterns | Before implementation |
| Workspace path naming convention | Question | Jake Ruesink | Define standard (e.g., `../workspace-<slug>`, `../<branch-name>`) | Before implementation |
| Automatic cleanup policy | Question | Jake Ruesink | Determine if workflow should auto-cleanup or require explicit removal | Before implementation |
| Worktree limit (Git has limits) | Risk | Jake Ruesink | Document Git's worktree limits and handle gracefully | During implementation |
| Cross-platform path handling | Risk | Jake Ruesink | Ensure path handling works on Windows/Mac/Linux | During implementation |
| Integration with existing setup agent | Question | Jake Ruesink | Determine if this should extend or replace setup agent patterns | Before planning |

## Recommended Follow-ups

1. **Clarify Task Scope:** Use `devagent clarify-task` to refine:
   - Exact workflow steps and user interactions
   - Uncommitted work migration approach
   - Cleanup automation vs. manual removal preference

2. **Create Implementation Plan:** Use `devagent create-plan` to design:
   - Workflow specification document
   - Git command sequences
   - Error handling and edge cases
   - Integration points with DevAgent structure

3. **Prototype Testing:** Test worktree operations manually to validate:
   - Stash → apply pattern for uncommitted work
   - Path handling and conflict detection
   - Cleanup scenarios (clean, unclean, stale)

## Sources

| Reference | Type | Freshness | Access Notes |
| --- | --- | --- | --- |
| [Git Worktree Documentation](https://git-scm.com/docs/git-worktree) | Official Documentation | 2026-01-14 | git-scm.com official docs |
| [Git Worktree Source](https://github.com/git/git/blob/master/Documentation/git-worktree.adoc) | Official Documentation | 2026-01-14 | Git source repository |
| `.devagent/workspace/tasks/completed/2026-01-13_final-agent-pr-creation-reporting/plan/2026-01-13_final-agent-plan.md` | Internal Plan | 2026-01-14 | Related setup agent work |
| `.devagent/workspace/memory/constitution.md` | Internal Principles | 2026-01-14 | C3 (human-in-the-loop), C4 (tool-agnostic) |
| `.devagent/core/AGENTS.md` | Internal Documentation | 2026-01-14 | Standard workflow instructions |
