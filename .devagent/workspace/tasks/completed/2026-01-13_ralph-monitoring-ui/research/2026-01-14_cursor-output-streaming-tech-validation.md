# Research Packet: Cursor Output Streaming & Tech Stack Validation

- **Date:** 2026-01-14
- **Author:** Jake Ruesink
- **Classification:** Implementation Design
- **Status:** Draft
- **Source Context:** Brainstorm session `2026-01-14_ralph-monitoring-ui-tech-stack-ideas.md` research questions RQ1-RQ4, RQ6

## Problem Statement

Validate core technical assumptions for Ralph Monitoring UI implementation, specifically:
1. Cursor CLI output format options and capabilities
2. React Router 7 Server-Sent Events (SSE) streaming patterns
3. File streaming performance (tail -f vs file watchers)
4. Process signal handling for intervention controls
5. beads-ui SQLite monitoring approach

## Research Plan

**Validation Targets:**
1. ✅ Investigate Cursor CLI `--output-format` options beyond `text`
2. ✅ Research React Router 7 SSE/streaming response patterns
3. ⚠️ Compare file streaming approaches (tail -f vs chokidar/fs.watch) - needs performance testing
4. ⚠️ Research cross-platform process signal handling (SIGTERM/SIGKILL) - needs platform-specific validation
5. ⚠️ Analyze beads-ui codebase structure and SQLite monitoring - needs deeper code inspection

## Sources

### Internal Sources
- `.devagent/plugins/ralph/tools/ralph.sh` (2026-01-14) - Current Cursor CLI invocation: `--output-format text`
- `.devagent/workspace/tasks/completed/2026-01-13_ralph-monitoring-ui/research/2026-01-13_ralph-monitoring-ui-research.md` - Prior research on log streaming strategy
- `.devagent/workspace/tasks/completed/2026-01-13_ralph-monitoring-ui/brainstorms/2026-01-14_ralph-monitoring-ui-tech-stack-ideas.md` - Research questions RQ1-RQ10

### External Sources
- React Router 7 Documentation: https://github.com/remix-run/react-router (v7.6.2+) - Streaming APIs and defer() patterns
- Context7 React Router Docs: `/remix-run/react-router` - SSE and ReadableStream examples
- beads-ui GitHub: https://github.com/mantoni/beads-ui - Package.json shows Express-based architecture
- React Router 7 Starter: https://github.com/lambda-curry/react-router-starter - Reference implementation

## Findings & Tradeoffs

### 1. Cursor CLI Output Format Options (RQ1)

**Current State:**
- `ralph.sh` uses: `"$AI_COMMAND" -p --force --output-format text "$PROMPT"`
- Only `text` format is currently used in codebase

**Finding:**
- **⚠️ [NEEDS CLARIFICATION]** Cursor CLI documentation not found in codebase
- Need to test Cursor CLI help: `cursor --help` or `cursor -h` to discover available `--output-format` options
- Possible formats to investigate: `json`, `structured`, `diff`, `markdown`

**Recommendation:**
- Test Cursor CLI locally to enumerate output format options
- If only `text` is available, proceed with text parsing approach (Ideas 26, 31, 43)
- If structured formats exist, evaluate trade-off between format complexity vs. parsing effort

**Tradeoffs:**
- **Text-only approach:** Simple, works immediately, but requires parsing for structured data
- **Structured format:** Richer data, but may not be available or may add complexity

### 2. React Router 7 Server-Sent Events (SSE) Patterns (RQ4)

**Finding:**
React Router 7 supports streaming via `defer()` utility, but SSE requires custom implementation:

**Available Patterns:**
1. **Deferred Data Loading** - Use `defer()` to stream Promise resolutions:
   ```typescript
   export async function loader() {
     return defer({
       critical: await fetchCriticalData(),
       lazy: fetchLazyData(), // Streamed
     });
   }
   ```

2. **Resource Routes for SSE** - Create resource routes that return `Response` with `ReadableStream`:
   ```typescript
   // app/routes/api.logs.$taskId.stream.ts
   export async function loader({ params }) {
     const stream = new ReadableStream({
       start(controller) {
         // Tail log file and send chunks
         const tail = spawn('tail', ['-f', `logs/${params.taskId}.log`]);
         tail.stdout.on('data', (chunk) => {
           controller.enqueue(new TextEncoder().encode(`data: ${chunk}\n\n`));
         });
       }
     });
     
     return new Response(stream, {
       headers: {
         'Content-Type': 'text/event-stream',
         'Cache-Control': 'no-cache',
         'Connection': 'keep-alive',
       },
     });
   }
   ```

3. **Streaming Rendering** - React Router 7 supports `renderToReadableStream` for HTML streaming, but SSE is separate

**Sources:**
- React Router 7 Streaming APIs: https://github.com/remix-run/react-router/blob/main/decisions/0004-streaming-apis.md
- Context7 React Router docs: `/remix-run/react-router` - Deferred data loading examples

**Recommendation:**
- Use resource routes (`app/routes/api.logs.$taskId.stream.ts`) for SSE endpoints
- Implement `ReadableStream` with `tail -f` child process or file watcher
- Client-side uses native `EventSource` API for reconnection

**Tradeoffs:**
- **Resource routes:** Native React Router 7 pattern, no separate server needed
- **Separate Express server:** More control, but adds complexity and deployment overhead
- **Recommendation:** Use resource routes for simplicity and consistency

### 3. File Streaming Performance: tail -f vs File Watchers (RQ3)

**Finding:**
Two primary approaches for streaming log files:

**Approach 1: `tail -f` via Child Process**
```typescript
const tail = spawn('tail', ['-f', 'logs/bd-xxxx.log']);
tail.stdout.on('data', (chunk) => {
  // Stream to SSE
});
```
- **Pros:** Simple, proven pattern, handles file rotation automatically
- **Cons:** Spawns process per client, cleanup needed on disconnect

**Approach 2: File Watcher (chokidar/fs.watch)**
```typescript
const watcher = chokidar.watch('logs/bd-xxxx.log');
watcher.on('change', () => {
  // Read new lines and stream
});
```
- **Pros:** Single watcher can serve multiple clients, more control
- **Cons:** Need to track file position, handle file rotation manually

**Performance Considerations:**
- **⚠️ [NEEDS VALIDATION]** Performance testing needed to compare:
  - Memory usage per client connection
  - CPU impact of multiple `tail -f` processes vs single file watcher
  - Latency differences (likely minimal for log streaming)

**Recommendation:**
- Start with `tail -f` approach (simpler, proven)
- Monitor performance with multiple concurrent clients
- Consider file watcher optimization if needed for scale

**Tradeoffs:**
- **tail -f:** Simpler implementation, automatic rotation handling
- **File watcher:** Better for multiple clients, but more complex position tracking

### 4. Process Signal Handling for Intervention (RQ6)

**Finding:**
Process intervention requires:
1. **PID Tracking:** `ralph.sh` must write PID of Cursor process to file or database
2. **Signal Sending:** UI backend sends SIGTERM (graceful) then SIGKILL (force) if needed
3. **Cross-Platform:** macOS, Linux support similar; Windows requires different approach

**Implementation Pattern:**
```typescript
// Write PID in ralph.sh
echo $$ > .ralph_current_pid

// Send signal from Node.js
import { kill } from 'process';
kill(pid, 'SIGTERM');
// Fallback to SIGKILL if process doesn't terminate
```

**Cross-Platform Considerations:**
- **macOS/Linux:** `process.kill()` works with SIGTERM/SIGKILL
- **Windows:** Signals not supported; use `taskkill` command or `child_process.exec()`
- **Process Groups:** May need `kill(-pid)` to kill entire process group

**Sources:**
- Node.js `process.kill()`: https://nodejs.org/api/process.html#processkillpid-signal
- Platform differences documented in Node.js process module

**Recommendation:**
- Implement PID tracking in `ralph.sh` (write to `.ralph_current_pid` or Beads sessions table)
- Use Node.js `process.kill()` for macOS/Linux
- Add Windows fallback using `child_process.exec('taskkill /PID ...')` if Windows support needed
- Handle process group cleanup to prevent orphaned processes

**Tradeoffs:**
- **File-based PID:** Simple, but file cleanup needed
- **Database PID:** Centralized, but requires DB write on each task start
- **Process groups:** More thorough cleanup, but complexity increases

**⚠️ [NEEDS VALIDATION]** Test signal handling on target platforms (macOS primary)

### 5. beads-ui SQLite Monitoring Approach (RQ2)

**Finding:**
- beads-ui uses Express.js (from package.json: `"express": "^5.2.1"`)
- Architecture appears to be traditional Express app, not React Router 7
- **⚠️ [NEEDS DEEPER INVESTIGATION]** Need to inspect beads-ui source code to understand:
  - How it reads Beads SQLite database
  - Whether it uses file watchers or polling for database changes
  - How Kanban component is structured

**Recommendation:**
- Clone/fork beads-ui repository to analyze codebase structure
- Identify SQLite access patterns (likely `better-sqlite3` or `sqlite3`)
- Determine if database monitoring uses:
  - File watcher on `.beads/beads.db`
  - Polling with setInterval
  - Event-driven updates (if SQLite supports it)

**Tradeoffs:**
- **Forking beads-ui:** Leverage existing code, but may require significant adaptation for React Router 7
- **Rebuilding:** More control, but more effort to recreate Kanban functionality

## Recommendation

### Immediate Actions (High Priority)

1. **Test Cursor CLI Output Formats**
   - Run `cursor --help` or check Cursor documentation
   - Test available `--output-format` options
   - Document findings in this research packet

2. **Prototype React Router 7 SSE Endpoint**
   - Create resource route: `app/routes/api.logs.$taskId.stream.ts`
   - Implement `tail -f` child process streaming
   - Test with EventSource client

3. **Implement PID Tracking in ralph.sh**
   - Add PID write: `echo $! > .ralph_current_pid` after Cursor command
   - Test signal handling on macOS

4. **Analyze beads-ui Codebase**
   - Clone beads-ui repository
   - Document SQLite access patterns
   - Identify Kanban component structure

### Validation Needed

- **⚠️ Performance Testing:** Compare `tail -f` vs file watcher with multiple concurrent clients
- **⚠️ Platform Testing:** Validate signal handling on macOS (primary platform)
- **⚠️ Cursor CLI Testing:** Enumerate available output formats

## Repo Next Steps

- [ ] Test Cursor CLI: `cursor --help` to discover output format options
- [ ] Clone beads-ui: `git clone https://github.com/mantoni/beads-ui.git` for code analysis
- [ ] Prototype SSE endpoint: Create `app/routes/api.logs.$taskId.stream.ts` with `tail -f` pattern
- [ ] Add PID tracking: Modify `ralph.sh` to write PID after Cursor invocation
- [ ] Test signal handling: Create test script to validate SIGTERM/SIGKILL on macOS
- [ ] Performance benchmark: Compare `tail -f` vs `chokidar` with 5+ concurrent clients

## Risks & Open Questions

### High Priority

- **Cursor Output Format Unknown:** If only `text` format exists, parsing complexity increases. Need to test CLI to confirm.
- **beads-ui Architecture Mismatch:** If beads-ui is Express-based, adapting to React Router 7 may require significant refactoring. Need code inspection.
- **Process Signal Reliability:** Cross-platform signal handling may have edge cases. Need platform-specific testing.

### Medium Priority

- **File Streaming Performance:** Unknown if `tail -f` scales to 10+ concurrent clients. Performance testing needed.
- **SQLite Concurrent Access:** Multiple processes (Ralph, UI, beads CLI) accessing database simultaneously. Need to verify locking behavior.
- **Log File Rotation:** How to handle log file cleanup, rotation, or size limits. Not yet addressed.

### Low Priority

- **Windows Support:** Process signals don't work on Windows. May need `taskkill` fallback if Windows support required.
- **React Router 7 Stability:** React Router 7 is relatively new. Need to verify SSE resource route patterns are stable.

## Related Artifacts

- Brainstorm: `.devagent/workspace/tasks/completed/2026-01-13_ralph-monitoring-ui/brainstorms/2026-01-14_ralph-monitoring-ui-tech-stack-ideas.md`
- Prior Research: `.devagent/workspace/tasks/completed/2026-01-13_ralph-monitoring-ui/research/2026-01-13_ralph-monitoring-ui-research.md`
- Task Hub: `.devagent/workspace/tasks/completed/2026-01-13_ralph-monitoring-ui/AGENTS.md`

---

**Next Workflow:** After validation testing, proceed to `devagent create-plan` with validated technical approach.
