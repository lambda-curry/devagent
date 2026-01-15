# Beads Setup Audit & Best Practices Review

**Date:** 2026-01-14  
**Purpose:** Audit current Beads setup against latest best practices and identify gaps

## Executive Summary

Our Beads setup has several mismatches between:
1. **Actual Beads status values** (`open`, `closed`, `in_progress`, `blocked`, `pinned`)
2. **Our TypeScript code expectations** (`todo`, `done`, `in_progress`, `blocked`)
3. **Our skill documentation** (incorrectly references `todo` and `closed`)

Additionally, we need to verify our configuration matches Beads best practices for git integration, daemon usage, and database management.

## Current State

### Database Status
- **Issue Count:** 6 tasks (all with status `open`)
- **Issue Prefix:** `devagent` (configured correctly)
- **Database Path:** `.beads/beads.db`
- **Mode:** Direct (daemon not running)

### Configuration Files

#### `.beads/config.yaml`
- ✅ Present and properly structured
- ✅ Issue prefix commented out (auto-detected)
- ✅ Daemon settings configured
- ⚠️ Sync branch commented out (should be set for team projects)

#### `.beads/metadata.json`
- ✅ Present with correct structure
- Contains: `database`, `jsonl_export` paths

#### `.gitignore`
- ✅ Correctly ignores `.beads/*.db` and `.beads/*.sqlite`
- ✅ Tracks `.beads/issues.jsonl` (correct - this is source of truth)
- ✅ Ignores cache/tmp/logs directories

### Code Mismatches

#### Status Value Mismatch

**Beads Actual Statuses (from official docs):**
- `open` - Ready to be worked on
- `in_progress` - Currently being worked on
- `closed` - Work completed
- `blocked` - Blocked by dependencies or external factors
- `pinned` - Stays open indefinitely (for hooks/anchors)

**Our TypeScript Interface (`apps/ralph-monitoring/app/db/beads.server.ts`):**
```typescript
status: 'todo' | 'in_progress' | 'done' | 'blocked'
```

**Issues:**
1. ❌ We expect `todo` but Beads uses `open`
2. ❌ We expect `done` but Beads uses `closed`
3. ✅ `in_progress` matches
4. ✅ `blocked` matches

**Impact:**
- `getActiveTasks()` queries for `'todo'` but database has `'open'` → Returns empty results
- UI checks for `'done'` but database has `'closed'` → Tasks never show as done
- Status filtering in `getAllTasks()` won't work correctly

#### Skill Documentation Mismatch

**`.devagent/plugins/ralph/skills/beads-integration/SKILL.md`:**
- Line 31: Says `bd ready` returns tasks in `todo` status (should be `open`)
- Line 46: Says to use `--status closed` (correct)
- Line 52: Says to use `--status todo` (should be `open`)

### Git Integration

#### Current State
- ✅ `.beads/issues.jsonl` is tracked in git (6 lines)
- ❓ Merge driver not verified (should be configured by `bd init`)
- ❓ Git hooks not verified (should install pre-commit, post-merge, pre-push hooks)

#### Best Practices (from official docs)
1. **Merge Driver:** Should be auto-configured by `bd init`
   - `git config merge.beads.driver "bd merge %A %O %A %B"`
   - `.gitattributes` should have `.beads/issues.jsonl merge=beads`
2. **Git Hooks:** Recommended for automatic sync
   - `pre-commit`: Flush pending changes
   - `post-merge`: Import updated JSONL
   - `pre-push`: Export database to JSONL
3. **Sync Branch:** For protected branches, should configure `sync.branch`

### Daemon Configuration

#### Current State
- **Daemon Status:** Not running (using direct mode)
- **Auto-start:** Enabled in config (`auto-start-daemon: true`)
- **Fallback Reason:** `auto_start_failed`

#### Best Practices
- Daemon provides auto-sync with 30-second debounce
- Direct mode is fine for single-user workflows
- ⚠️ **Git Worktree Warning:** Daemon does NOT work correctly with git worktrees (we may be using worktrees)

### Database vs JSONL

#### Current State
- ✅ Database exists: `.beads/beads.db`
- ✅ JSONL exists: `.beads/issues.jsonl` (6 lines, tracked in git)
- ✅ Both are in sync (no warnings)

#### Best Practices
- JSONL is source of truth (versioned in git)
- Database is local cache (not tracked)
- Auto-flush exports DB → JSONL after mutations
- Auto-import imports JSONL → DB when JSONL is newer

## Identified Issues

### Critical Issues

1. **Status Value Mismatch** ⚠️ **CRITICAL**
   - TypeScript code expects `todo`/`done` but Beads uses `open`/`closed`
   - This breaks all status filtering and active task queries
   - **Fix Required:** Update TypeScript interfaces and queries

2. **Skill Documentation Incorrect** ⚠️ **HIGH**
   - Documentation references `todo` status which doesn't exist
   - Could cause agents to use wrong status values
   - **Fix Required:** Update skill documentation

### Medium Issues

3. **Git Integration Not Verified** ⚠️ **MEDIUM**
   - Merge driver configuration not verified
   - Git hooks installation not verified
   - **Fix Required:** Verify and document git integration setup

4. **Sync Branch Not Configured** ⚠️ **MEDIUM**
   - For team projects, should configure `sync.branch`
   - Currently commented out in config
   - **Fix Required:** Decide if needed and configure

### Low Issues

5. **Daemon Not Running** ℹ️ **LOW**
   - Using direct mode (acceptable for single-user)
   - Auto-start failed (may be intentional)
   - **Action:** Verify if daemon is needed

## Recommendations

### Immediate Actions

1. **Fix Status Value Mismatch**
   - Update `BeadsTask` interface to use `'open' | 'in_progress' | 'closed' | 'blocked'`
   - Update all SQL queries to use `'open'` instead of `'todo'`
   - Update all SQL queries to use `'closed'` instead of `'done'`
   - Update UI code to check for `'closed'` instead of `'done'`

2. **Update Skill Documentation**
   - Change all references from `todo` to `open`
   - Verify all status examples use correct values
   - Add note about status value mapping

3. **Clear Database and Re-initialize**
   - Clear existing database
   - Verify `bd init` configuration
   - Re-import tasks if needed

### Short-term Improvements

4. **Verify Git Integration**
   - Check merge driver: `git config merge.beads.driver`
   - Check `.gitattributes`: `grep "issues.jsonl" .gitattributes`
   - Install git hooks if missing: `./examples/git-hooks/install.sh` (if available)

5. **Configure Sync Branch** (if needed)
   - Decide if we need protected branch workflow
   - If yes: `bd config set sync.branch beads-sync`
   - Update config.yaml documentation

6. **Test Status Workflow**
   - Create test task
   - Verify `bd ready` returns tasks with `open` status
   - Verify status transitions: `open` → `in_progress` → `closed`
   - Verify UI displays correct statuses

### Long-term Improvements

7. **Add Status Mapping Layer** (if needed)
   - Consider adding a mapping layer if we want to use different terminology internally
   - Or standardize on Beads terminology throughout

8. **Documentation Updates**
   - Update all references to Beads statuses in codebase
   - Add status value reference to skill documentation
   - Document git integration setup process

## Best Practices Checklist

### Configuration ✅
- [x] `.beads/config.yaml` exists and is structured correctly
- [x] Issue prefix configured (`devagent`)
- [ ] Sync branch configured (if needed)
- [x] Database path configured correctly

### Git Integration ❓
- [ ] Merge driver configured (`git config merge.beads.driver`)
- [ ] `.gitattributes` has merge driver entry
- [ ] Git hooks installed (pre-commit, post-merge, pre-push)
- [x] `.beads/issues.jsonl` tracked in git
- [x] `.beads/*.db` ignored in git

### Code Alignment ❌
- [ ] TypeScript interfaces match Beads status values
- [ ] SQL queries use correct status values
- [ ] UI code uses correct status values
- [ ] Skill documentation uses correct status values

### Database Management ✅
- [x] Database exists and is accessible
- [x] JSONL exists and is in sync
- [x] Auto-flush/auto-import configured
- [ ] Database cleared and ready for fresh start

## Next Steps

1. ✅ **Clear database** - COMPLETED
   - All tasks closed and database cleared
   - JSONL file removed (git shows as deleted)
   - Database will auto-create on next `bd` command
2. **Fix TypeScript status values** (update interfaces and queries)
3. **Update skill documentation** (fix status references)
4. **Verify git integration** (check merge driver and hooks)
5. **Test end-to-end workflow** (create task, update status, verify UI)

## Database Clear Status

✅ **Database Cleared Successfully**
- All 6 tasks were closed with reason "Clearing database for audit"
- Database file (`.beads/beads.db`) removed
- JSONL file (`.beads/issues.jsonl`) removed
- Git shows JSONL as deleted (needs commit)
- Database will auto-recreate on next `bd` command
- Configuration preserved (issue_prefix: `devagent`)

## References

- [Beads Official Docs](https://github.com/steveyegge/beads)
- [Beads CLI Reference](https://github.com/steveyegge/beads/blob/main/docs/CLI_REFERENCE.md)
- [Beads Git Integration](https://github.com/steveyegge/beads/blob/main/docs/GIT_INTEGRATION.md)
- [Beads Configuration](https://github.com/steveyegge/beads/blob/main/docs/CONFIG.md)
