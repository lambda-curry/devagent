# Beads Best Practices Compliance

**Date:** 2026-01-14  
**Status:** Setup in progress  
**Reference:** `.beads/docs/` directory

## Compliance Checklist

### ✅ Completed

1. **Status Values Fixed**
   - ✅ All code uses correct Beads statuses: `open`, `closed`, `in_progress`, `blocked`
   - ✅ TypeScript interfaces updated
   - ✅ SQL queries updated
   - ✅ UI components updated
   - ✅ Skill documentation updated
   - ✅ Import/export scripts updated

2. **Configuration Files**
   - ✅ `.beads/config.yaml` exists and is properly structured
   - ✅ Issue prefix configured: `devagent`
   - ✅ `.gitignore` correctly ignores database files
   - ✅ `.gitattributes` has merge driver entry

3. **Database**
   - ✅ Database cleared (fresh start)
   - ✅ Ready for re-initialization

### ⚠️ Needs Setup

1. **Git Integration** (Critical)
   - ❌ Merge driver not configured (`git config merge.beads.driver`)
   - ❌ Git hooks not installed (pre-commit, post-merge, pre-push)
   - ✅ `.gitattributes` has merge driver entry (but driver not configured)

2. **AI Tool Integration** (Completed)
   - ✅ Ralph AGENTS.md enhanced with Beads workflow context
   - ✅ Applied Cursor setup content to Ralph's instruction file
   - ✅ Includes core rules, quick reference, issue types, priorities, and context loading

3. **Database Initialization** (Required)
   - ❌ Need to run `bd init` to:
     - Create fresh database
     - Configure merge driver
     - Install git hooks (if desired)
     - Set up proper structure

## Best Practices from Documentation

### 1. Git Integration (GIT_INTEGRATION.md)

**Required:**
- Merge driver auto-configured by `bd init`
- Git hooks for automatic sync (STRONGLY RECOMMENDED)
  - `pre-commit`: Flush pending changes
  - `post-merge`: Import updated JSONL
  - `pre-push`: Export database to JSONL
  - `post-checkout`: Import after branch switches

**Current Status:**
- `.gitattributes` has merge driver entry ✅
- Merge driver not configured in git config ❌
- Git hooks not installed ❌

**Action Required:**
```bash
# Re-initialize to configure merge driver
bd init --skip-db  # If database already exists
# OR
bd init  # Full initialization (will create database)

# Install git hooks (recommended)
# This is offered during bd init, or can be done manually
```

### 2. AI Tool Setup (SETUP.md)

**Recommended:**
- Install Cursor integration for workflow context
- Provides AI agents with beads workflow instructions

**Current Status:**
- Cursor integration not installed ❌

**Action Required:**
```bash
bd setup cursor
```

### 3. Configuration (CONFIG.md)

**Best Practices:**
- ✅ `.beads/config.yaml` for project-specific tool settings
- ✅ `bd config` for project-level configuration (stored in database)
- ✅ Issue prefix configured: `devagent`

**Current Status:**
- Configuration files properly structured ✅
- Issue prefix configured ✅

### 4. Database Management (QUICKSTART.md)

**Best Practices:**
- JSONL is source of truth (versioned in git)
- Database is local cache (not tracked)
- Auto-flush/auto-import for sync

**Current Status:**
- Database cleared (ready for fresh start) ✅
- JSONL tracking configured in `.gitignore` ✅

### 5. Status Values (CLI_REFERENCE.md)

**Official Beads Statuses:**
- `open` - Ready to be worked on
- `in_progress` - Currently being worked on
- `closed` - Work completed
- `blocked` - Blocked by dependencies
- `pinned` - Stays open indefinitely (for hooks/anchors)

**Current Status:**
- All code updated to use correct statuses ✅

## Setup Steps

### Step 1: Re-initialize Beads

```bash
# Initialize with proper configuration
bd init

# This will:
# - Create .beads/beads.db
# - Configure merge driver (git config merge.beads.driver)
# - Offer to install git hooks (RECOMMENDED: say yes)
# - Set up proper structure
```

### Step 2: Ralph Integration (Completed)

Ralph's AGENTS.md has been enhanced with Beads workflow context:
- ✅ Core rules about tracking work in Beads
- ✅ Quick reference commands
- ✅ Issue types and priorities
- ✅ Status values and workflow
- ✅ Context loading instructions

This provides Ralph with the same workflow context that Cursor setup would provide, but tailored for autonomous execution.

### Step 3: Verify Setup

```bash
# Check overall health
bd doctor

# Verify merge driver
git config merge.beads.driver
# Should output: bd merge %A %O %A %B

# Verify git hooks
ls -la .git/hooks/ | grep -E "pre-commit|post-merge|pre-push"

# Verify Ralph integration
grep -q "Beads Issue Tracking" .devagent/plugins/ralph/AGENTS.md && echo "Ralph AGENTS.md enhanced" || echo "Not found"
```

## Expected Final State

After setup, we should have:

1. **Git Integration:**
   - ✅ Merge driver configured: `git config merge.beads.driver = "bd merge %A %O %A %B"`
   - ✅ `.gitattributes` has: `.beads/issues.jsonl merge=beads`
   - ✅ Git hooks installed (pre-commit, post-merge, pre-push, post-checkout)

2. **AI Tool Integration:**
   - ✅ `.devagent/plugins/ralph/AGENTS.md` enhanced with Beads workflow context
   - ✅ Includes core rules, quick reference, issue types, priorities, and status workflow

3. **Database:**
   - ✅ `.beads/beads.db` exists (fresh, empty)
   - ✅ `.beads/issues.jsonl` will be created on first issue

4. **Configuration:**
   - ✅ `.beads/config.yaml` properly configured
   - ✅ Issue prefix: `devagent`
   - ✅ All status values correct

## Notes

- **No backwards compatibility needed** - We're starting fresh
- **Git hooks are STRONGLY RECOMMENDED** - They ensure automatic sync
- **Cursor integration is recommended** - Provides AI agents with workflow context
- **Merge driver is required** - Prevents spurious merge conflicts

## Next Actions

1. Run `bd init` to configure git integration
2. Install git hooks when prompted (or manually)
3. Run `bd setup cursor` for AI tool integration
4. Verify with `bd doctor`
5. Create a test issue to verify end-to-end workflow
