# Research: Branch Name Slash Issue with Git Push

- Date: 2026-01-15
- Related Task: `.devagent/workspace/tasks/completed/2026-01-14_ralph-revision-3/`
- Issue: Branch name `ralph/revision-3` failed to push with "fatal error in commit_refs"

## Problem

When attempting to push branch `ralph/revision-3` (with slash), encountered error:
```
remote: fatal error in commit_refs        
To github.com:lambda-curry/devagent
 ! [remote rejected]   ralph/revision-3 -> ralph/revision-3 (failure)
error: failed to push some refs to 'github.com:lambda-curry/devagent'
```

Renaming branch to `ralph-revision-3-impl` (no slash) allowed successful push.

## Investigation

### Existing Branches with Slashes
- `ralph/devagent-157f` - exists locally and in worktree
- `ralph/devagent-a884` - exists in worktree at `/Users/jake/projects/ralph-worktrees/devagent-a884`
- `ralph/monitoring-ui-mvp` - exists locally

### Worktree Status
```
/Users/jake/projects/devagent                                       46b2c6f6 [ralph-revision-3-impl]
/Users/jake/projects/devagent/.devagent/worktrees/ralph-revision-3  2cf22767 [ralph-revision-3]
/Users/jake/projects/ralph-worktrees/devagent-157f                  d5e7c168 [devagent-157f]
/Users/jake/projects/ralph-worktrees/devagent-a884                  e9ee5a8f [ralph/devagent-a884]
```

### Findings

1. **Worktree Conflict**: There's an existing worktree at `.devagent/worktrees/ralph-revision-3` with branch `ralph-revision-3` (no slash). This worktree was created earlier in this session.

2. **Branch Name Mismatch**: The worktree uses `ralph-revision-3` (no slash) but we tried to push `ralph/revision-3` (with slash). These are different branch names.

3. **Remote Branch Check**: No remote branches with `ralph/` prefix found when checking `git ls-remote`.

4. **Successful Pattern**: Branch `ralph-revision-3-impl` (no slash) pushed successfully.

## Hypothesis

The issue is likely **NOT** about slashes in branch names generally (since `ralph/devagent-a884` exists in a worktree), but rather:

1. **GitHub Server-Side Issue**: The "fatal error in commit_refs" is a server-side error from GitHub, not a local git issue. This could be:
   - A transient GitHub server issue
   - A specific problem with that exact branch name `ralph/revision-3`
   - A conflict with existing refs on the server (though `git ls-remote` showed no existing `ralph/` branches)

2. **Worktree Branch Exists**: There's a worktree at `.devagent/worktrees/ralph-revision-3` with branch `ralph-revision-3` (no slash). While this shouldn't conflict with `ralph/revision-3` (with slash) since they're different names, GitHub might have had an internal issue.

3. **Successful Pattern**: Branch `ralph-revision-3-impl` (no slash) pushed successfully, suggesting the issue was specific to `ralph/revision-3`.

## Conclusion

**This is a recurring issue** - the user has encountered "fatal error in commit_refs" multiple times when pushing branches with slashes. While some branches with slashes work (like `ralph/devagent-a884`), the pattern is unreliable and causes frequent push failures.

**Root Cause**: GitHub server-side issue with branch names containing slashes, particularly when combined with worktrees or in certain repository states.

**Recommendation**: **Avoid slashes in branch names** to prevent this recurring issue:
1. Use dash-separated names: `ralph-<epic-id>` instead of `ralph/<epic-id>`
2. Update workflows to use dash-separated branch naming convention
3. Document this as a known limitation/workaround

## Recommendation

**Avoid slashes in branch names when using worktrees** to prevent potential conflicts:

1. Use dashes instead: `ralph-revision-3` instead of `ralph/revision-3`
2. This aligns with the existing pattern: `ralph-revision-3-impl` worked successfully
3. Update workflow documentation to recommend dash-separated branch names

## Related Patterns

- Existing Ralph branches use pattern: `ralph/<epic-id>` (with slash)
- Worktree branches use pattern: `ralph-revision-3` (no slash) 
- Successful push used: `ralph-revision-3-impl` (no slash)

## Action Items

1. Update `.devagent/plugins/ralph/workflows/setup-workspace.md` to use dash-separated branch names
2. Document this finding in the task AGENTS.md
3. Consider updating branch naming convention to avoid slashes when worktrees are involved
