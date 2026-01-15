# Beads Syncing Setup Guide

**Date:** 2026-01-14  
**Purpose:** Configure Beads syncing for the DevAgent project

## Current Status

✅ **Git Integration Configured:**
- Merge driver configured: `git config merge.beads.driver = "bd merge %A %O %A %B"`
- `.gitattributes` has merge driver entry: `.beads/issues.jsonl merge=beads`
- Database exists and is ready

⚠️ **Git Hooks Not Installed:**
- Recommended but not required
- Can be installed manually or via Beads if available

## Sync Architecture Overview

Beads uses a **pull-first sync** strategy with **3-way merge**:

```
bd sync flow:
1. Load local state (from database)
2. Pull from git remote
3. 3-way merge (base + local + remote)
4. Export merged state to JSONL
5. Commit and push to remote
6. Update sync base
```

**Key Files:**
- `.beads/issues.jsonl` - Source of truth (git-tracked)
- `.beads/beads.db` - Local cache (not tracked)
- `.beads/sync_base.jsonl` - Last sync snapshot (per-machine, not tracked)

## Sync Modes

### 1. Normal Sync (Default) ✅ Recommended for DevAgent

**Best for:** Standard multi-machine workflows, team collaboration

**How it works:**
- Commits directly to current branch (usually `main`)
- Uses git hooks for automatic sync
- Pull-first merge prevents data loss

**Setup:**
```bash
# Already configured! Just use:
bd sync

# Or let git hooks handle it automatically
# (hooks will be installed if available)
```

**When to use:**
- ✅ Team working on shared repository
- ✅ Multiple developers/agents
- ✅ Standard git workflow
- ✅ Main branch is not protected

**Workflow:**
1. Agent creates/updates tasks → Database updated
2. Git hooks auto-export to JSONL on commit
3. `git push` → JSONL synced to remote
4. Other machines `git pull` → Auto-import to database

### 2. Sync Branch Mode (Protected Branches)

**Best for:** GitHub/GitLab protected branches, CI/CD workflows

**How it works:**
- Commits to separate branch (e.g., `beads-sync`)
- Uses git worktrees (lightweight checkouts)
- Main branch stays protected
- Periodically merge via PR

**Setup:**
```bash
# Configure sync branch
bd config set sync.branch beads-sync

# Or initialize with sync branch
bd init --branch beads-sync  # (if reinitializing)
```

**When to use:**
- ✅ Protected `main` branch (requires PRs)
- ✅ Want isolated beads history
- ✅ CI/CD that needs non-interactive sync
- ✅ Team review before merging beads changes

**Workflow:**
1. Agent creates/updates tasks → Database updated
2. Daemon auto-commits to `beads-sync` branch
3. Periodically: `bd sync --merge` or create PR
4. Merge `beads-sync` → `main` via PR

**Configuration:**
```bash
# Set sync branch
bd config set sync.branch beads-sync

# Check status
bd sync --status

# Merge to main (creates PR or direct merge)
bd sync --merge
```

### 3. Daemon Auto-Sync (Background)

**Best for:** Continuous sync without manual intervention

**How it works:**
- Background daemon monitors database changes
- Auto-exports to JSONL (30-second debounce)
- Auto-commits and pushes (if enabled)
- Auto-imports when JSONL changes

**Setup:**
```bash
# Start daemon with auto-commit
bd daemon --start --auto-commit

# Or configure in .beads/config.yaml:
# auto-start-daemon: true
```

**When to use:**
- ✅ Want hands-free automation
- ✅ Multiple agents working simultaneously
- ✅ Need real-time sync
- ✅ Single-user or trusted team

**Configuration:**
```yaml
# .beads/config.yaml
auto-start-daemon: true
flush-debounce: 5s  # Default: 5 seconds
```

**Note:** Daemon does NOT work with git worktrees. Use `--no-daemon` flag if using worktrees.

### 4. Manual Sync (On-Demand)

**Best for:** Explicit control, CI/CD pipelines, debugging

**How it works:**
- Run `bd sync` manually when needed
- Full pull-first merge
- Explicit commit and push

**When to use:**
- ✅ CI/CD pipelines
- ✅ Want explicit control
- ✅ Debugging sync issues
- ✅ Git worktrees (daemon incompatible)

**Workflow:**
```bash
# At end of agent session
bd sync

# This:
# 1. Pulls from remote
# 2. Merges changes
# 3. Exports to JSONL
# 4. Commits and pushes
```

### 5. Git Hooks (Automatic Sync)

**Best for:** Ensuring consistency, preventing sync issues

**What gets installed:**
- `pre-commit`: Flush database → JSONL before commit
- `post-merge`: Import JSONL → database after pull/merge
- `pre-push`: Export database → JSONL before push
- `post-checkout`: Import JSONL → database after branch switch

**Setup:**
```bash
# Check if hooks can be installed via bd
bd hooks install  # (if command exists)

# Or install manually (see below)
```

**Why hooks matter:**
- **Without pre-push:** Database changes committed, stale JSONL pushed → other workspaces diverge
- **With pre-push:** JSONL always reflects database → all workspaces stay synchronized

## Recommended Setup for DevAgent

### Option A: Normal Sync + Git Hooks (Recommended)

**Best for:** Standard team workflow with automatic sync

**Setup:**
```bash
# 1. Git integration already configured ✅
# 2. Install git hooks (if available)
bd hooks install  # Or install manually

# 3. Use normal sync
bd sync  # Manual
# OR let hooks handle it automatically
```

**Workflow:**
- Ralph creates/updates tasks
- Git hooks auto-sync on commit/push
- Other machines auto-sync on pull
- No manual `bd sync` needed

### Option B: Sync Branch Mode (If Main is Protected)

**Best for:** Protected main branch requiring PRs

**Setup:**
```bash
# Configure sync branch
bd config set sync.branch beads-sync

# Start daemon (if not using worktrees)
bd daemon --start --auto-commit

# Periodically merge
bd sync --merge  # Creates PR or merges directly
```

**Workflow:**
- Ralph commits to `beads-sync` branch
- Periodically merge `beads-sync` → `main` via PR
- Review beads changes before merging

### Option C: Manual Sync Only

**Best for:** Explicit control, CI/CD, debugging

**Setup:**
```bash
# No additional setup needed
# Just run when needed:
bd sync
```

**Workflow:**
- Ralph works on tasks
- At end of session: `bd sync`
- Explicit sync control

## Git Hooks Installation

### Automatic (if available)
```bash
bd hooks install
```

### Manual Installation

Create these files in `.git/hooks/`:

**`.git/hooks/pre-commit`:**
```bash
#!/bin/sh
# bd (beads) pre-commit hook
bd export --no-pull 2>/dev/null || true
```

**`.git/hooks/post-merge`:**
```bash
#!/bin/sh
# bd (beads) post-merge hook
bd import -i .beads/issues.jsonl 2>/dev/null || true
```

**`.git/hooks/pre-push`:**
```bash
#!/bin/sh
# bd (beads) pre-push hook
bd export --no-pull 2>/dev/null || true
```

**`.git/hooks/post-checkout`:**
```bash
#!/bin/sh
# bd (beads) post-checkout hook
bd import -i .beads/issues.jsonl 2>/dev/null || true
```

Make them executable:
```bash
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/post-merge
chmod +x .git/hooks/pre-push
chmod +x .git/hooks/post-checkout
```

## Verification

```bash
# Check overall health
bd doctor

# Verify merge driver
git config merge.beads.driver
# Should output: bd merge %A %O %A %B

# Verify git hooks
ls -la .git/hooks/ | grep -E "pre-commit|post-merge|pre-push"

# Test sync
bd sync --dry-run  # Preview without committing
bd sync            # Actual sync
```

## Troubleshooting

### "Sync conflicts"
- Merge driver should handle most conflicts automatically
- If conflicts occur, resolve manually: `git checkout --theirs .beads/issues.jsonl` then `bd import`

### "Database out of sync"
- Run `bd sync` to force sync
- Check `bd doctor` for sync divergence warnings

### "Daemon not working"
- Check `bd daemon status`
- If using worktrees, use `--no-daemon` flag
- Check logs: `.beads/daemon.log`

### "Hooks not running"
- Verify hooks are executable: `chmod +x .git/hooks/*`
- Check git config: `git config core.hooksPath` (should be unset or `.git/hooks`)

## Next Steps

1. **Choose sync mode** based on your workflow
2. **Install git hooks** (recommended for automatic sync)
3. **Test sync** with `bd sync --dry-run`
4. **Verify** with `bd doctor`

## References

- [SYNC.md](.beads/docs/SYNC.md) - Sync architecture details
- [GIT_INTEGRATION.md](.beads/docs/GIT_INTEGRATION.md) - Git integration guide
- [PROTECTED_BRANCHES.md](.beads/docs/PROTECTED_BRANCHES.md) - Sync branch mode
- [DAEMON.md](.beads/docs/DAEMON.md) - Daemon management
