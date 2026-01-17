# Comments Visibility and Realtime Log View Research

**Date:** 2026-01-17  
**Classification:** Bug investigation (UI/UX issues)  
**Status:** Complete

## Research Plan

This research investigates two critical UI/UX issues:
1. **Comments Visibility**: Comments exist in Beads but are not displayed in the Ralph monitoring UI
2. **Realtime Log View**: Log streaming consistently fails with "file not found" errors

### Validation Targets

1. ✅ Confirm Beads comment data structure and CLI access method
2. ✅ Identify where comments should be displayed (card view vs details view)
3. ✅ Understand log file path resolution and environment variable configuration
4. ✅ Determine root cause of "file not found" errors in log streaming
5. ✅ Map current implementation gaps for both features

## Sources

### Internal Sources

1. **Beads CLI Comment Access** (`.devagent/plugins/ralph/tools/ralph.ts:237-262`)
   - Function: `getTaskComments(taskId: string)`
   - Method: Uses `bd comments <task-id> --json` CLI command
   - Returns: `Array<{ body: string; created_at: string }>`
   - Status: ✅ Working implementation exists in ralph.ts

2. **Beads Database Schema** (`.beads/docs/ARCHITECTURE.md:295-301`)
   - Comments stored as relational data: `comments | []Comment | Discussion comments (optional)`
   - Comments are part of the Beads issue data model
   - Stored in SQLite database at `.beads/beads.db`

3. **Task Card View** (`apps/ralph-monitoring/app/routes/_index.tsx:386-571`)
   - Current implementation: Shows task title, description, status, priority, ID
   - Missing: Comment count display
   - Task cards render in grid layout grouped by status

4. **Task Details View** (`apps/ralph-monitoring/app/routes/tasks.$taskId.tsx:46-202`)
   - Current implementation: Shows task metadata, description, timestamps, log viewer
   - Missing: Comments section/display
   - Loader only fetches task and `hasLogs` boolean

5. **Log File Path Resolution** (`apps/ralph-monitoring/app/utils/logs.server.ts:26-41`)
   - Function: `getLogFilePath(taskId: string)`
   - Path construction:
     ```typescript
     const repoRoot = process.env.REPO_ROOT || process.cwd();
     const logDir = process.env.RALPH_LOG_DIR || join(repoRoot, 'logs', 'ralph');
     return join(logDir, `${sanitizedTaskId}.log`);
     ```
   - File naming: `${taskId}.log` (sanitized)

6. **Log File Existence Check** (`apps/ralph-monitoring/app/utils/logs.server.ts:46-57`)
   - Function: `logFileExists(taskId: string)`
   - Uses `existsSync()` to check file existence
   - Returns `false` for invalid task IDs

7. **Log Streaming Endpoint** (`apps/ralph-monitoring/app/routes/api.logs.$taskId.stream.ts:84-368`)
   - Checks `logFileExists()` before streaming (line 99)
   - Returns 404 with "Log file not found" if file doesn't exist
   - Uses `tail -F` command for streaming (platform-dependent)

8. **Database Access** (`apps/ralph-monitoring/app/db/beads.server.ts`)
   - Current queries: Only fetch task fields (id, title, description, status, priority, timestamps)
   - Missing: No comment queries or comment count aggregation
   - Database path: `.beads/beads.db` (readonly access)

### External Sources

1. **Beads CLI Documentation** (`.devagent/plugins/ralph/skills/beads-integration/SKILL.md:99-121`)
   - Command: `bd comment <task-id> --body "<comment-text>"`
   - Comments support markdown formatting
   - Comments are stored in Beads database

## Findings & Tradeoffs

### Issue 1: Comments Not Visible

**Current State:**
- ✅ Comments exist in Beads database and are accessible via CLI (`bd comments <task-id> --json`)
- ✅ Working implementation exists in `.devagent/plugins/ralph/tools/ralph.ts` for fetching comments
- ❌ Frontend (`apps/ralph-monitoring`) does NOT fetch or display comments
- ❌ Task cards show no comment count indicator
- ❌ Task details view has no comments section

**Root Cause:**
The frontend application does not query comments from the Beads database. The `beads.server.ts` module only queries the `issues` table for task metadata, not the `comments` table.

**Implementation Gaps:**
1. **Database Layer**: No function to query comments from Beads SQLite database
2. **API Layer**: No loader/route to fetch comments for a task
3. **UI Layer**: No component to display comments or comment counts

**Data Access Options:**
- **Option A**: Query SQLite directly (requires understanding Beads schema)
  - Pros: Fast, direct database access
  - Cons: Tied to Beads schema, may break if schema changes
- **Option B**: Use Beads CLI (`bd comments <task-id> --json`)
  - Pros: Stable API, matches existing pattern in ralph.ts
  - Cons: Spawns subprocess, slightly slower
- **Option C**: Use Beads RPC daemon (if available)
  - Pros: Fast, programmatic access
  - Cons: Requires RPC client implementation

**Recommendation:** Use Option B (CLI) for consistency with existing `ralph.ts` patterns and stability.

### Issue 2: Realtime Log View "File Not Found"

**Current State:**
- ✅ Log file path resolution logic exists (`getLogFilePath()`)
- ✅ File existence check exists (`logFileExists()`)
- ✅ Streaming endpoint checks file existence before streaming
- ❌ Users consistently see "file not found" errors

**Path Resolution Logic:**
```typescript
const repoRoot = process.env.REPO_ROOT || process.cwd();
const logDir = process.env.RALPH_LOG_DIR || join(repoRoot, 'logs', 'ralph');
return join(logDir, `${sanitizedTaskId}.log`);
```

**Potential Root Causes:**
1. **Log directory doesn't exist**: `logs/ralph/` may not be created
2. **Environment variables misconfigured**: `REPO_ROOT` or `RALPH_LOG_DIR` may be incorrect
3. **Log files not created**: Ralph execution may not be creating log files
4. **Task ID mismatch**: Task ID format may not match file naming (sanitization issues)
5. **Timing issue**: Log file created after UI check (race condition)

**Investigation Needed:**
- Check if `logs/ralph/` directory exists
- Verify environment variables in production
- Confirm Ralph execution creates log files with correct naming
- Verify task ID sanitization matches file creation

**Error Flow:**
1. User opens task details view
2. Loader checks `logFileExists(taskId)` → returns `false`
3. `hasLogs` set to `false`, but `shouldShowLogViewer` may still be `true` for active tasks
4. LogViewer component attempts to connect to stream
5. Stream endpoint checks `logFileExists()` again → returns 404
6. User sees "file not found" error

**Recommendation:** Investigate log file creation timing and directory existence. Add defensive checks and better error messaging.

## Recommendation

### For Comments Visibility

**Implementation Approach:**
1. **Add comment fetching to database layer** (`apps/ralph-monitoring/app/db/beads.server.ts`)
   - Create `getTaskComments(taskId: string)` function using Beads CLI
   - Create `getTaskCommentCount(taskId: string)` function for card view
   - Follow pattern from `.devagent/plugins/ralph/tools/ralph.ts:237-262`

2. **Add comments to task details loader** (`apps/ralph-monitoring/app/routes/tasks.$taskId.tsx`)
   - Fetch comments in loader
   - Pass comments to component via loaderData

3. **Add comment count to task list loader** (`apps/ralph-monitoring/app/routes/_index.tsx`)
   - Fetch comment counts for all tasks (batch if possible)
   - Add comment count to task card display

4. **Create Comments component** (`apps/ralph-monitoring/app/components/Comments.tsx`)
   - Display list of comments with timestamps
   - Support markdown rendering
   - Show empty state when no comments

5. **Update UI components**
   - Add comment count badge to task cards
   - Add comments section to task details view

**Tradeoffs:**
- CLI approach: Slightly slower but stable and consistent
- Direct DB query: Faster but requires schema knowledge and may break
- Recommendation: Start with CLI approach, optimize later if needed

### For Realtime Log View

**Investigation Steps:**
1. **Verify log directory exists**: Check if `logs/ralph/` is created on startup
2. **Check environment variables**: Verify `REPO_ROOT` and `RALPH_LOG_DIR` are set correctly
3. **Trace log file creation**: Confirm Ralph execution creates files with expected naming
4. **Add defensive checks**: Create log directory if missing, better error messages

**Implementation Approach:**
1. **Add log directory creation** (`apps/ralph-monitoring/app/utils/logs.server.ts`)
   - Ensure `logs/ralph/` directory exists before checking files
   - Create directory if missing (with proper permissions)

2. **Improve error messaging** (`apps/ralph-monitoring/app/routes/api.logs.$taskId.stream.ts`)
   - Provide more specific error messages
   - Include expected file path in error response

3. **Add logging/debugging** (`apps/ralph-monitoring/app/utils/logs.server.ts`)
   - Log resolved log file paths for debugging
   - Log environment variable values (sanitized)

4. **Handle timing issues** (`apps/ralph-monitoring/app/components/LogViewer.tsx`)
   - Retry logic for file creation
   - Better loading states

**Tradeoffs:**
- Auto-create directory: Convenient but may mask configuration issues
- Better error messages: Helpful for debugging but adds complexity
- Recommendation: Add directory creation with clear logging

## Repo Next Steps

### Comments Visibility
- [ ] Add `getTaskComments()` function to `apps/ralph-monitoring/app/db/beads.server.ts`
- [ ] Add `getTaskCommentCount()` function for efficient card view queries
- [ ] Update task details loader to fetch comments
- [ ] Update task list loader to fetch comment counts (batch query)
- [ ] Create `Comments.tsx` component for displaying comments
- [ ] Add comment count badge to task cards in `_index.tsx`
- [ ] Add comments section to task details view in `tasks.$taskId.tsx`
- [ ] Add markdown rendering support for comment bodies
- [ ] Test with tasks that have comments

### Realtime Log View
- [ ] Verify `logs/ralph/` directory exists (check on app startup)
- [ ] Add directory creation logic if missing
- [ ] Add debug logging for log file path resolution
- [ ] Verify environment variables (`REPO_ROOT`, `RALPH_LOG_DIR`)
- [ ] Trace Ralph execution to confirm log file creation
- [ ] Improve error messages with expected file paths
- [ ] Add retry logic in LogViewer for file creation timing
- [ ] Test log streaming with active tasks

## Risks & Open Questions

### Risks
1. **Performance**: Fetching comments for all tasks in list view may be slow
   - Mitigation: Batch queries or lazy loading
2. **Schema Changes**: Beads schema may change, breaking direct queries
   - Mitigation: Use CLI approach for stability
3. **Log File Permissions**: Directory creation may have permission issues
   - Mitigation: Proper error handling and logging

### Open Questions
1. **Comment Count Performance**: Should we cache comment counts or fetch on-demand?
2. **Log File Location**: Is `logs/ralph/` the correct location, or should it be configurable?
3. **Log File Naming**: Does Ralph execution create files with exact task ID format?
4. **Environment Variables**: Are `REPO_ROOT` and `RALPH_LOG_DIR` set correctly in all environments?
5. **Markdown Rendering**: What markdown library should we use for comment rendering?

## Related Files

- `apps/ralph-monitoring/app/db/beads.server.ts` - Database access layer
- `apps/ralph-monitoring/app/routes/_index.tsx` - Task list/card view
- `apps/ralph-monitoring/app/routes/tasks.$taskId.tsx` - Task details view
- `apps/ralph-monitoring/app/utils/logs.server.ts` - Log file utilities
- `apps/ralph-monitoring/app/routes/api.logs.$taskId.stream.ts` - Log streaming endpoint
- `apps/ralph-monitoring/app/components/LogViewer.tsx` - Log viewer component
- `.devagent/plugins/ralph/tools/ralph.ts` - Reference implementation for comment fetching
