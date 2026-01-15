# Beads Sync Branch Setup Complete

**Date:** 2026-01-14  
**Status:** ✅ Configured and Ready

## What Was Done

### 1. Database Migration ✅
- Migrated legacy database to add repository fingerprint
- Repository ID: `5ecb1f1f`
- Database is now bound to this repository

### 2. Sync Branch Configuration ✅
- Configured sync branch: `beads-sync`
- Created `beads-sync` branch in git
- Sync branch mode is now active

### 3. Git Integration ✅
- Merge driver configured
- Git hooks installed
- Ready for automatic sync

## How Sync Branch Mode Works

### Architecture

```
Main Branch (main):
├── Your code files
├── .beads/.gitignore (config)
├── .gitattributes (merge driver)
└── (No .beads/issues.jsonl - stays in sync branch)

Sync Branch (beads-sync):
├── .beads/issues.jsonl (issue data)
├── .beads/metadata.json
└── .beads/config.yaml (optional)

Worktree (hidden):
└── .git/beads-worktrees/beads-sync/
    └── .beads/ (sparse checkout)
```

### Workflow

1. **Ralph creates/updates tasks:**
   - Changes go to `.beads/beads.db` (local database)
   - Daemon exports to `.beads/issues.jsonl`

2. **Daemon auto-commits:**
   - Copies JSONL to worktree (`.git/beads-worktrees/beads-sync/`)
   - Commits to `beads-sync` branch
   - Pushes to remote (if `--auto-push` enabled)

3. **Main branch stays clean:**
   - No beads commits on `main`
   - Your code commits remain separate
   - Protected branch rules are satisfied

4. **Periodic merge:**
   - Review beads changes
   - Merge `beads-sync` → `main` via PR
   - Or use `bd sync --merge` for direct merge

## Current Configuration

```bash
# Sync branch configured
bd config get sync.branch
# Output: beads-sync

# Check sync status
bd sync --status
# Shows commits and file differences between branches
```

## Daily Workflow

### For Ralph (Autonomous Execution)

Ralph works normally - no changes needed:
- Creates/updates tasks → Database updated
- Daemon auto-commits to `beads-sync` branch
- No impact on `main` branch

### For You (Human Review)

**Option 1: Review and Merge via PR**
```bash
# Check what's changed
bd sync --status

# Push sync branch
git push origin beads-sync

# Create PR on GitHub/GitLab: beads-sync → main
# Review changes, then merge PR
```

**Option 2: Direct Merge (if allowed)**
```bash
# Merge sync branch to main
bd sync --merge

# Or manually:
git checkout main
git merge beads-sync
git push origin main
```

## Daemon Configuration

The daemon is currently running. To configure auto-commit and auto-push:

```bash
# Stop current daemon
bd daemon stop

# Start with auto-commit (recommended)
bd daemon start --auto-commit

# Or with auto-commit AND auto-push
bd daemon start --auto-commit --auto-push
```

**Daemon modes:**
- `--auto-commit`: Commits to sync branch after each change (30s debounce)
- `--auto-push`: Also pushes to remote after commit
- Without flags: Only exports to JSONL, no commits

## Verification

```bash
# Check sync branch status
bd sync --status

# Verify configuration
bd config get sync.branch

# Check daemon
bd daemon status

# Overall health
bd doctor
```

## Benefits

✅ **Protected Branch Compatible**
- Works with GitHub/GitLab branch protection
- No direct commits to `main`
- Review process for beads changes

✅ **Clean Separation**
- Code commits stay on `main`
- Beads commits stay on `beads-sync`
- Easy to review beads changes separately

✅ **No Disruption**
- Ralph workflow unchanged
- Your workflow unchanged
- Automatic background sync

✅ **Minimal Overhead**
- Uses git worktrees (lightweight)
- Only `.beads/` directory in worktree
- ~few MB disk space

## Troubleshooting

### "Sync branch doesn't exist"
```bash
# Create it manually
git checkout -b beads-sync
git checkout main
```

### "Daemon not committing"
```bash
# Check daemon status
bd daemon status

# Restart with auto-commit
bd daemon stop
bd daemon start --auto-commit
```

### "Want to see what's in sync branch"
```bash
# Check status
bd sync --status

# Or view branch directly
git log beads-sync --oneline
git show beads-sync:.beads/issues.jsonl | head -20
```

### "Want to merge manually"
```bash
# Check differences
bd sync --status

# Merge to main
git checkout main
git merge beads-sync
git push origin main
```

## Next Steps

1. **Start daemon with auto-commit** (if not already):
   ```bash
   bd daemon start --auto-commit
   ```

2. **Create first task** to test:
   ```bash
   bd create "Test task" -t task -p 2
   ```

3. **Verify sync branch** gets the commit:
   ```bash
   bd sync --status
   git log beads-sync --oneline
   ```

4. **Set up periodic merge** workflow:
   - Daily/weekly: Review and merge `beads-sync` → `main`
   - Or use `bd sync --merge` for direct merge

## References

- [PROTECTED_BRANCHES.md](.beads/docs/PROTECTED_BRANCHES.md) - Complete sync branch guide
- [SYNC.md](.beads/docs/SYNC.md) - Sync architecture details
- [DAEMON.md](.beads/docs/DAEMON.md) - Daemon management
