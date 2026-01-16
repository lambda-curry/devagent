# Brainstorm Packet — Ralph Monitoring UI Tech Stack & Implementation Ideas

- Mode: exploratory
- Session Date: 2026-01-14
- Participants: Jake Ruesink
- Storage Path: `.devagent/workspace/tasks/completed/2026-01-13_ralph-monitoring-ui/brainstorms/2026-01-14_ralph-monitoring-ui-tech-stack-ideas.md`
- Related Artifacts: 
  - Task Hub: `.devagent/workspace/tasks/completed/2026-01-13_ralph-monitoring-ui/AGENTS.md`
  - Research: `.devagent/workspace/tasks/completed/2026-01-13_ralph-monitoring-ui/research/2026-01-13_ralph-monitoring-ui-research.md`
  - External: https://github.com/lambda-curry/react-router-starter (React Router 7 starter)
  - External: https://github.com/mantoni/beads-ui (Beads UI reference)

## Problem Statement

Develop a monitoring UI for Ralph that visualizes active agents, streams real-time execution logs, and provides controls for human intervention (pause/stop execution loops). The tech stack should be inspired by the React Router 7 starter (https://github.com/lambda-curry/react-router-starter), and we should learn from how beads-ui (https://github.com/mantoni/beads-ui) reads and displays Beads data.

**Brainstorm Mode:** Exploratory — Open-ended ideation for tech stack choices, architecture patterns, and feature implementations that leverage React Router 7 patterns and Beads database reading approaches.

**Known Constraints:**
- Technical: Must integrate with Beads SQLite database, support real-time log streaming, handle process intervention (pause/stop)
- Strategic: Should align with DevAgent's tool-agnostic principles (C4), support human-in-the-loop defaults (C3)
- Timeline: No specific deadline, but should enable faster Ralph adoption

## Phase Tracking

- Problem / Context: ✅ complete
- Ideas: ✅ complete (75 ideas)
- Clustering: ✅ complete (9 themes)
- Evaluation: ✅ complete (evaluation matrix)
- Prioritization: ✅ complete (5 top candidates)
- Packaging / Handoff: ✅ complete

## Ideas (Divergent Phase)

_Generated using multiple ideation techniques: prompt-based, constraint-based, analogy, SCAMPER, "How Might We", perspective shifts (user, developer, business, technical)._

### Batch 1: Tech Stack & Architecture Foundation

1. **React Router 7 App Router Pattern** — Use React Router 7's file-based routing with nested layouts, loaders, and actions. Create routes like `/tasks/:taskId`, `/epics/:epicId`, `/logs/:taskId` with shared layouts for navigation and real-time status indicators.

2. **SQLite Direct Access via React Router Loaders** — Follow beads-ui pattern of reading Beads SQLite directly in server-side loaders (or API routes), avoiding ORM overhead. Use `better-sqlite3` or native SQLite bindings to query tasks, epics, comments, and status in loaders before rendering.

3. **Server-Sent Events (SSE) for Log Streaming** — Implement SSE endpoint that tails task-specific log files (`logs/bd-xxxx.log`) and streams updates to the browser. React Router 7's streaming support pairs well with SSE for real-time updates without WebSocket complexity.

4. **File System Watcher for Beads Database Changes** — Use Node.js `fs.watch` or `chokidar` to monitor Beads SQLite file changes, triggering UI updates when tasks change status, new comments are added, or epics are updated. This mirrors how beads-ui likely detects database changes.

5. **React Router 7 Resource Routes for API** — Create resource routes (`/api/tasks`, `/api/logs/:taskId/stream`) that return JSON or stream data. Use React Router 7's action/loader pattern instead of separate Express/Fastify server, keeping everything in one app.

6. **TypeScript + React Router 7 Type Safety** — Leverage React Router 7's type-safe route definitions and loader/action types. Generate TypeScript types from Beads database schema to ensure type safety when reading task data.

7. **Tailwind CSS + Shadcn UI Component Library** — Use the React Router 7 starter's styling approach (Tailwind + Shadcn) for consistent, accessible UI components. Build task cards, log viewers, and intervention controls using Shadcn primitives.

8. **Nested Route Layouts for Multi-Panel Views** — Use React Router 7's nested layouts to create a split-pane interface: sidebar with task/epic list, main panel with task details, bottom panel with logs. Each route can define its own layout while sharing common navigation.

9. **React Query for Client-Side Caching** — Pair React Router 7 loaders with React Query for optimistic updates, background refetching, and cache invalidation when Beads database changes. This handles the gap between server-side loaders and client-side reactivity.

10. **Bun Runtime for Fast SQLite + File Operations** — Use Bun (if compatible with React Router 7) for faster SQLite queries and file system operations. Bun's native SQLite and file watching could outperform Node.js for this use case.

### Batch 2: Real-Time Streaming Deep Dive

11. **SSE with `tail -f` Pattern via Child Process** — Use Node.js `spawn('tail', ['-f', 'logs/bd-xxxx.log'])` to stream log file changes. Pipe stdout to SSE response, handling process cleanup when client disconnects. Simple, proven pattern for log tailing.

12. **React Router 7 Streaming Response for SSE** — Leverage React Router 7's native streaming response support to create SSE endpoints. Use `Response` with `ReadableStream` to send incremental log chunks, taking advantage of React Router 7's built-in streaming capabilities.

13. **EventSource API with Automatic Reconnection** — Client-side uses native `EventSource` API with built-in reconnection logic. Handle connection drops gracefully, resume from last received line number or timestamp to avoid missing log entries during disconnects.

14. **Log File Rotation Detection & Handling** — Detect when `ralph.sh` rotates or recreates log files (e.g., on task restart). Automatically switch to new file handle, or maintain a rolling window of recent log files to stream from multiple sources.

15. **Buffered Streaming with Backpressure Handling** — Implement backpressure-aware streaming: if client can't consume logs fast enough, buffer in memory with size limits, or skip to most recent lines. Prevents memory bloat during high-volume log generation.

16. **WebSocket Alternative for Bi-Directional Control** — Use WebSocket instead of SSE if we need bi-directional communication (e.g., pause/stop commands sent from UI to server). WebSocket allows sending intervention commands while receiving log streams on same connection.

17. **Multi-Task Log Aggregation Stream** — Stream logs from multiple active tasks simultaneously. Create a unified log view showing interleaved output from all running Ralph agents, with task ID prefixes and color coding for visual separation.

18. **Incremental Line-by-Line Parsing** — Parse log lines incrementally as they stream in, extracting structured data (timestamps, log levels, task IDs) for filtering, search, and highlighting. Use streaming JSON parser if logs include structured output.

19. **Client-Side Virtual Scrolling for Large Logs** — Use virtual scrolling (e.g., `react-window` or `@tanstack/react-virtual`) to render only visible log lines. Stream all data but only render viewport, handling thousands of lines without performance degradation.

20. **Log Level Filtering in Stream** — Apply log level filters (INFO, WARN, ERROR) at the stream source, reducing bandwidth and client-side processing. Parse log lines server-side and only send matching levels to connected clients.

21. **Timestamp-Based Log Seeking** — Allow users to "seek" to specific timestamps in log history. Store log line offsets with timestamps, enable jumping to specific time ranges without streaming entire file from beginning.

22. **Stream Compression for High-Volume Logs** — Compress SSE stream using gzip or brotli if log volume is high. Client-side decompression, or use HTTP compression at transport level. Reduces bandwidth for verbose AI tool output.

23. **Connection Pooling for Multiple Clients** — Handle multiple simultaneous UI clients watching same task logs. Share single file tail process across clients, broadcasting updates to all connected EventSource clients efficiently.

24. **Log Streaming with Task Status Integration** — Combine log streaming with Beads database status updates. When task status changes (todo → in_progress → done), automatically start/stop log streaming, or highlight status transitions within log stream.

25. **React Router 7 Deferred Data with Streaming** — Use React Router 7's `defer` and `Await` components to stream initial log data while page loads, then continue streaming updates via SSE. Provides fast initial render with progressive enhancement.

### Batch 3: Cursor Output Capture & Streaming

26. **Simple Text Output Streaming via `tee` Enhancement** — Modify `ralph.sh` to use `tee -a logs/${TASK_ID}.log` instead of single `.ralph_last_output.txt`. Stream this file via SSE to UI. Simplest approach: just capture stdout text as-is, no parsing needed.

27. **Cursor `--output-format` Options Exploration** — Investigate Cursor CLI's available output formats. Current `--output-format text` might have alternatives like `json`, `structured`, or `diff` that provide richer data. Test different formats to see what's available.

28. **Stdout/Stderr Dual Stream Capture** — Capture both stdout and stderr separately in `ralph.sh`, writing to `logs/${TASK_ID}.stdout.log` and `logs/${TASK_ID}.stderr.log`. UI can stream both channels with visual distinction (info vs. error styling).

29. **Process Output Interception with Named Pipes** — Use named pipes (FIFOs) to intercept Cursor's output before it hits terminal. `ralph.sh` creates pipe, redirects Cursor output to pipe, reads from pipe and both writes to log file AND streams to UI backend simultaneously.

30. **Cursor CLI Wrapper Script for Output Interception** — Create wrapper script around Cursor CLI that intercepts all output, adds metadata (timestamps, task ID), and forwards to both log file and streaming endpoint. Wrapper sits between `ralph.sh` and actual Cursor command.

31. **Structured Output Parsing from Cursor Text** — Parse Cursor's text output to extract structured information: code blocks, file paths, command executions, diffs. Use regex or line-by-line parsing to identify patterns, then stream structured JSON to UI instead of raw text.

32. **Real-Time Diff Extraction from Cursor Output** — If Cursor outputs diffs in text format, parse them in real-time as they stream. Extract file paths, line numbers, additions/deletions, and stream structured diff objects to UI for syntax-highlighted, side-by-side diff view.

33. **Cursor Output Buffer with Chunked Streaming** — Buffer Cursor output in small chunks (e.g., 100 lines or 10KB), flush chunks to both log file and SSE stream. Prevents overwhelming UI with single massive output, enables progressive rendering.

34. **WebSocket Bridge for Bi-Directional Cursor Control** — Instead of just capturing output, create WebSocket bridge that: (1) receives Cursor commands from UI, (2) executes via `ralph.sh`, (3) streams output back in real-time. Enables UI-driven task execution, not just monitoring.

35. **Cursor Output Format Detection & Adaptive Parsing** — Detect what format Cursor is outputting (plain text, markdown, structured JSON, diffs) and adapt parsing strategy. Stream raw if simple, parse if structured, extract diffs if available. Handles Cursor's varying output formats.

36. **Task-Specific Log File with Rotation** — Create `logs/bd-${TASK_ID}.log` for each task, rotate when task completes or restarts. `ralph.sh` appends to this file, UI streams from it. Simple file-based approach, no complex process management.

37. **Streaming via File Watcher Instead of Process Piping** — Instead of piping Cursor output directly to UI, write to log file and use file watcher (`chokidar` or `fs.watch`) to detect new lines. Stream new lines to UI via SSE. Decouples capture from streaming, simpler architecture.

38. **Cursor Output Metadata Injection** — Inject metadata into Cursor output stream: timestamps, task ID, iteration number, phase (setup/execution/review). Use `sed` or `awk` in `ralph.sh` pipeline to prepend metadata to each line before writing to log.

39. **Multi-Format Output Capture** — Capture Cursor output in multiple formats simultaneously: (1) raw text to log file, (2) parsed structured data to JSON file, (3) extracted diffs to separate diff file. UI can choose which format to display or stream.

40. **Cursor CLI Exit Code + Output Correlation** — Capture both exit code and full output. Stream exit code as metadata event when Cursor finishes, allowing UI to highlight success/failure status and correlate with output content.

41. **Incremental Output Streaming with Backpressure** — Stream Cursor output incrementally as it arrives, but handle backpressure: if UI can't consume fast enough, buffer in memory with size limit, or skip to most recent output. Prevents memory bloat during verbose Cursor responses.

42. **Cursor Output Filtering & Highlighting** — Parse Cursor output to identify important events: file changes, test results, errors, warnings. Stream with metadata tags, allowing UI to filter, highlight, or create event timeline separate from raw log view.

43. **Hybrid Approach: Text Stream + Post-Process Diff Extraction** — Stream raw text output in real-time for immediate visibility, but also post-process completed output to extract diffs, file changes, and structured data. UI shows live text stream + structured summary panel.

44. **Cursor Output Compression for High-Volume Streams** — Compress Cursor output before writing to log file or streaming. Use gzip compression, decompress on UI side. Reduces storage and bandwidth for verbose AI tool responses.

45. **Task Output Aggregation Across Iterations** — Aggregate output from multiple Cursor invocations (iterations) for same task. Stream each iteration separately with iteration markers, or aggregate into single unified stream. Handles Ralph's multi-iteration execution pattern.

### Batch 4: UI Patterns & Visualization

46. **Terminal-Style Log Viewer Component** — Create a terminal emulator component (like `xterm.js` or custom React component) that displays streaming Cursor output with monospace font, syntax highlighting, and scroll-to-bottom behavior. Mimics familiar terminal experience.

47. **Split-Pane Layout: Tasks + Logs** — Use React Router 7 nested layouts to create split-pane interface: left sidebar with task/epic list (from Beads), main panel with selected task details, bottom panel with streaming logs. Each pane independently scrollable.

48. **Kanban Board with Live Status Updates** — Fork beads-ui's Kanban view but enhance with real-time status updates. Tasks move between columns (todo → in_progress → done) as Ralph executes, with visual indicators showing active tasks streaming logs.

49. **Task Card with Embedded Log Preview** — Each task card in Kanban/list view shows last 5-10 lines of log output as preview. Click to expand full log viewer. Provides quick status at-a-glance without opening full task view.

50. **Syntax-Highlighted Code Blocks in Logs** — Parse Cursor output to detect code blocks (markdown fenced blocks, file paths, commands) and apply syntax highlighting. Use `react-syntax-highlighter` or `shiki` to colorize code snippets within log stream.

51. **Diff View Side-by-Side Panel** — If extracting diffs from Cursor output, display in side-by-side diff view (like GitHub PR diff). Left panel shows old code, right panel shows new code, with line-by-line highlighting for additions/deletions.

52. **Timeline View of Task Execution** — Create timeline visualization showing task execution phases: setup → iteration 1 → iteration 2 → review. Each phase shows duration, status, and log snippet. Visual progress indicator for multi-iteration tasks.

53. **Filterable Log Stream with Search** — Add search/filter controls above log viewer: filter by log level (INFO/WARN/ERROR), search for keywords, filter by file paths mentioned. Stream all data but only display matching lines.

54. **Collapsible Log Sections by Phase** — Group log output by execution phases (setup, task execution, quality gates, review). Each section collapsible, shows line count and status. Helps navigate long log outputs from multi-iteration runs.

55. **Real-Time Status Badge in Navigation** — Show live status indicator in app header/navigation: "3 tasks in progress", "1 task streaming logs", with color-coded badges. Quick overview without navigating to specific views.

56. **Task Detail Modal/Sheet with Streaming Logs** — Click task card to open modal or slide-over sheet with full task details (from Beads) and streaming log viewer. Logs continue streaming while modal open, pause when closed (or continue in background).

57. **Epic Progress Dashboard** — Create dashboard view showing epic-level progress: task completion percentage, active tasks, estimated time remaining. Aggregate data from all tasks in epic, update in real-time as tasks complete.

58. **Log Line Numbering with Anchors** — Number each log line and make line numbers clickable anchors. Enables sharing specific log lines, bookmarking important output, and referencing in comments. Useful for debugging and collaboration.

59. **Auto-Scroll Toggle with Manual Override** — Log viewer auto-scrolls to bottom as new lines arrive, but user can toggle off to review older output. Toggle button clearly visible, re-enables auto-scroll when user manually scrolls to bottom.

60. **Color-Coded Log Levels** — Parse log output to detect log levels (INFO, WARN, ERROR, DEBUG) and apply color coding: green for info, yellow for warnings, red for errors. Visual scanning for important messages.

61. **File Path Links in Logs** — Detect file paths in Cursor output (e.g., `src/components/Button.tsx`) and render as clickable links. Clicking opens file in editor (via protocol handler) or shows file preview in UI.

62. **Command Execution Indicators** — Detect command executions in Cursor output (lines starting with `$`, `>`, or command patterns) and highlight them. Show execution status (running, success, failed) with icons or badges.

63. **Progress Bar for Long-Running Tasks** — Estimate task progress based on log patterns: detect quality gate phases, test execution, commit operations. Show progress bar with phase labels, even if exact percentage unknown.

64. **Multi-Task Log Aggregation View** — Show unified log stream from multiple active tasks, with task ID prefixes and color coding per task. Toggle individual tasks on/off to focus on specific task or see overall execution flow.

65. **Log Export/Download Functionality** — Add export button to download full log as text file, or copy selected lines to clipboard. Useful for sharing logs, debugging, or archiving completed task outputs.

66. **Dark/Light Theme Toggle** — Support both dark and light themes for log viewer, matching user preference or system setting. Important for extended monitoring sessions and different work environments.

67. **Responsive Mobile Layout** — Design mobile-friendly layout: stack panes vertically on small screens, collapsible sidebar, touch-friendly controls. Enables monitoring Ralph execution from mobile devices.

68. **Keyboard Shortcuts for Navigation** — Add keyboard shortcuts: `j/k` for next/previous task, `/` for search, `g` then `t` for top of logs, `G` for bottom. Power user efficiency for frequent monitoring.

69. **Toast Notifications for Task Status Changes** — Show toast notifications when tasks change status (todo → in_progress, in_progress → done) or when errors occur. Non-intrusive alerts for important events without requiring constant UI watching.

70. **Intervention Controls: Pause/Stop Buttons** — Add prominent pause/stop buttons to active task views. Clicking sends signal to `ralph.sh` to pause or terminate current Cursor execution. Visual feedback shows intervention state (pausing, stopped).

71. **Task Comment Thread Integration** — Display Beads task comments alongside log viewer. Show comments as threaded discussion, with timestamps and context. Link comments to specific log lines if comments reference them.

72. **Epic Dependency Graph Visualization** — Visualize task dependencies within epic as graph/dag. Show which tasks block others, execution order, and current progress. Helps understand epic structure and identify bottlenecks.

73. **Log Statistics Panel** — Show statistics sidebar: total lines streamed, execution time, error count, file changes detected, commands executed. Aggregate metrics from parsed log output, update in real-time.

74. **Customizable Log View Layout** — Allow users to customize layout: log panel size, sidebar width, panel order. Save preferences to localStorage. Accommodates different monitoring workflows and screen sizes.

75. **Error Highlighting with Expandable Stack Traces** — Detect errors in log output (stack traces, error messages) and highlight them prominently. Make stack traces collapsible/expandable to reduce visual clutter while keeping details accessible.

## Clustered Themes

_Ideas grouped by similarity to identify patterns and reduce redundancy._

### Theme 1: Core Tech Stack Foundation
**Pattern:** Essential technology choices that form the base architecture
**Ideas:** 1, 2, 5, 6, 7, 10
- React Router 7 routing patterns
- SQLite direct access
- TypeScript type safety
- Tailwind/Shadcn UI
- Bun vs Node.js runtime

### Theme 2: Simple Log Capture & File Management
**Pattern:** File-based approaches for capturing Cursor output with minimal complexity
**Ideas:** 26, 28, 36, 37, 38, 40
- Task-specific log files via `tee`
- File watchers for streaming
- Log rotation and metadata injection
- Simple text capture without parsing

### Theme 3: Real-Time Streaming Architecture
**Pattern:** Mechanisms for streaming log data from files/processes to UI in real-time
**Ideas:** 3, 11, 12, 13, 15, 16, 19, 22, 23, 25, 41
- SSE vs WebSocket
- File tailing patterns
- Backpressure handling
- Connection management
- Virtual scrolling for performance

### Theme 4: Cursor Output Processing & Parsing
**Pattern:** Extracting structured data, diffs, and metadata from Cursor's text output
**Ideas:** 27, 31, 32, 35, 39, 42, 43, 45
- Format detection and exploration
- Diff extraction
- Structured parsing
- Hybrid text + post-processing
- Multi-format capture

### Theme 5: UI Layout & Navigation Patterns
**Pattern:** Overall application structure, routing, and navigation
**Ideas:** 8, 47, 48, 56, 67, 74
- Split-pane layouts
- Kanban board views
- Nested route layouts
- Modal/sheet patterns
- Responsive design

### Theme 6: Log Viewer Component Features
**Pattern:** Features specific to displaying and interacting with log streams
**Ideas:** 46, 49, 50, 53, 54, 58, 59, 60, 61, 62, 65, 75
- Terminal-style viewer
- Syntax highlighting
- Filtering and search
- Auto-scroll behavior
- Line numbering and anchors
- Export functionality

### Theme 7: Status & Progress Visualization
**Pattern:** Visual indicators of task/epic progress and execution state
**Ideas:** 4, 24, 52, 55, 57, 63, 69, 73
- Real-time status badges
- Progress bars and timelines
- Epic dashboard
- Toast notifications
- Statistics panels

### Theme 8: Intervention & Control Mechanisms
**Pattern:** Enabling human control over running Ralph agents
**Ideas:** 16, 34, 70
- Pause/stop buttons
- WebSocket for bi-directional control
- Process management

### Theme 9: Advanced Visualization & Integration
**Pattern:** Enhanced features for deeper insights and integration with Beads
**Ideas:** 17, 21, 51, 64, 71, 72
- Multi-task aggregation
- Diff views
- Task comment integration
- Dependency graphs
- Timestamp seeking

## Evaluation Matrix

_Scored against mission metrics, constitution principles, and practical constraints._

| Idea/Theme | Mission Alignment | User Impact | Technical Feasibility | Estimated Effort | Total Score | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| **Theme 1: Core Tech Stack** | 5 | 5 | 4 | 4 | **18** | Foundation for everything else |
| **Theme 2: Simple Log Capture** | 5 | 5 | 5 | 5 | **20** | Simplest viable approach, high value |
| **Theme 3: Real-Time Streaming** | 5 | 5 | 4 | 3 | **17** | Core requirement, moderate complexity |
| **Theme 4: Cursor Output Processing** | 4 | 4 | 3 | 2 | **13** | Nice-to-have, adds complexity |
| **Theme 5: UI Layout & Navigation** | 5 | 5 | 4 | 4 | **18** | Essential UX foundation |
| **Theme 6: Log Viewer Features** | 4 | 5 | 4 | 3 | **16** | Important for usability |
| **Theme 7: Status Visualization** | 4 | 4 | 4 | 3 | **15** | Helpful but not critical |
| **Theme 8: Intervention Controls** | 5 | 5 | 3 | 2 | **15** | Core requirement, technical challenge |
| **Theme 9: Advanced Features** | 3 | 3 | 3 | 2 | **11** | Future enhancements |

**Scoring Guide:**
- **Mission Alignment:** 1 = Tangential, 5 = Core to stated mission metrics
- **User Impact:** 1 = Minimal, 5 = Transformative for primary user segments
- **Technical Feasibility:** 1 = High risk/complexity, 5 = Straightforward with existing stack
- **Estimated Effort:** 1 = Months/high effort, 5 = Days/low effort (inverted—higher score = less effort)

## Prioritized Candidates (Top 5)

### Candidate 1: Simple File-Based Log Capture + SSE Streaming
**Score:** 20 (Theme 2 + Theme 3 core elements)
**Description:** Modify `ralph.sh` to write Cursor output to task-specific log files (`logs/bd-${TASK_ID}.log`) using `tee -a`, then stream these files to UI via Server-Sent Events (SSE) using file watchers or `tail -f` pattern. Display raw text output in terminal-style viewer.

**Mission Alignment:** Directly enables real-time monitoring of Ralph agents, supporting faster adoption and human-in-the-loop oversight (C3). Core requirement for monitoring UI.

**Expected Impact:** 
- Immediate visibility into Ralph execution without complex parsing
- Simple architecture reduces implementation risk
- Fast time-to-value for monitoring capability
- Foundation for future enhancements

**Implementation Approach:**
1. Update `ralph.sh` to use `tee -a logs/${TASK_ID}.log` instead of single output file
2. Create React Router 7 SSE endpoint that tails log files
3. Build simple terminal-style log viewer component
4. Use file watcher or `tail -f` child process for streaming

**Key Assumptions:**
- Cursor's text output is sufficient for monitoring (no need for structured parsing initially)
- File-based approach scales for typical task execution volumes
- SSE provides adequate real-time performance

**Risks:**
- Log file rotation/cleanup needs careful handling
- High-volume output might overwhelm file system or streaming
- No structured data extraction limits advanced features

**Next Steps:** Research Cursor CLI output formats, test file streaming performance, validate SSE approach with React Router 7

### Candidate 2: React Router 7 Foundation + Beads Integration
**Score:** 18 (Theme 1)
**Description:** Build UI using React Router 7 with file-based routing, nested layouts, and loaders. Read Beads SQLite directly in loaders using `better-sqlite3`, following beads-ui patterns. Use Tailwind CSS + Shadcn UI for components.

**Mission Alignment:** Establishes tool-agnostic foundation (C4) and provides structured, maintainable codebase. Enables future enhancements without major refactoring.

**Expected Impact:**
- Type-safe, maintainable architecture
- Familiar patterns from React Router 7 starter
- Direct SQLite access avoids ORM overhead
- Consistent UI components via Shadcn

**Implementation Approach:**
1. Scaffold React Router 7 app structure
2. Set up SQLite access in loaders
3. Create routes for tasks, epics, logs
4. Implement nested layouts for split-pane UI
5. Integrate Tailwind + Shadcn component library

**Key Assumptions:**
- React Router 7 is stable and suitable for this use case
- Direct SQLite access performs well for read-heavy workload
- Shadcn components meet accessibility and design needs

**Risks:**
- React Router 7 might have learning curve or limitations
- SQLite file locking with concurrent reads needs testing
- Component library might not cover all needed patterns

**Next Steps:** Validate React Router 7 compatibility, test SQLite concurrent access patterns, review Shadcn component coverage

### Candidate 3: Split-Pane UI Layout with Kanban Board
**Score:** 18 (Theme 5 + Theme 7 core)
**Description:** Create split-pane interface with left sidebar showing Kanban board of tasks (forked from beads-ui), main panel with task details, and bottom panel with streaming logs. Real-time status updates as tasks move between columns.

**Mission Alignment:** Provides intuitive navigation and at-a-glance status visibility, supporting human-in-the-loop workflows (C3). Familiar Kanban pattern reduces learning curve.

**Expected Impact:**
- Intuitive task navigation and status overview
- Real-time visual feedback on execution progress
- Efficient use of screen space
- Familiar UI patterns from beads-ui

**Implementation Approach:**
1. Fork/enhance beads-ui Kanban component
2. Implement React Router 7 nested layouts for split-pane
3. Add real-time status updates via file watcher on Beads DB
4. Create task detail panel with streaming log viewer
5. Implement task selection and routing

**Key Assumptions:**
- beads-ui Kanban can be adapted to React Router 7
- File watcher on SQLite provides adequate real-time updates
- Split-pane layout works well for monitoring workflow

**Risks:**
- Forking beads-ui might require significant adaptation
- Real-time DB watching might have performance issues
- Layout might not work well on smaller screens

**Next Steps:** Analyze beads-ui codebase structure, test SQLite file watching performance, prototype split-pane layout

### Candidate 4: Intervention Controls (Pause/Stop)
**Score:** 15 (Theme 8)
**Description:** Implement pause/stop buttons in UI that send signals to `ralph.sh` to interrupt Cursor execution. Requires process management (PID tracking) and communication mechanism (file-based signals or WebSocket).

**Mission Alignment:** Core requirement for human-in-the-loop control (C3). Enables users to intervene when agents go off-track or need guidance.

**Expected Impact:**
- Critical safety mechanism for autonomous execution
- Enables user control over long-running tasks
- Prevents wasted compute on incorrect execution paths

**Implementation Approach:**
1. Modify `ralph.sh` to write PID to `.ralph_current_pid` or Beads sessions table
2. Create API endpoint to send SIGTERM/SIGKILL to process
3. Add pause/stop buttons to active task views
4. Handle graceful shutdown and status updates

**Key Assumptions:**
- Process signals work reliably across platforms
- PID tracking survives process restarts
- Graceful shutdown doesn't corrupt state

**Risks:**
- Process management complexity (process groups, signal handling)
- Cross-platform compatibility (macOS, Linux, Windows)
- State recovery after forced termination

**Next Steps:** Research process signal handling, design PID tracking mechanism, prototype intervention API

### Candidate 5: Enhanced Log Viewer with Basic Features
**Score:** 16 (Theme 6 core features)
**Description:** Build terminal-style log viewer with syntax highlighting for code blocks, auto-scroll toggle, search/filter, and color-coded log levels. Essential usability features without complex parsing.

**Mission Alignment:** Improves monitoring experience, making logs more readable and navigable. Supports faster problem identification and debugging.

**Expected Impact:**
- Significantly improved log readability
- Faster issue identification
- Better user experience for extended monitoring sessions

**Implementation Approach:**
1. Create terminal-style React component
2. Add syntax highlighting for code blocks (react-syntax-highlighter)
3. Implement auto-scroll with toggle
4. Add search/filter functionality
5. Parse and color-code basic log levels

**Key Assumptions:**
- Basic log level detection via regex is sufficient
- Syntax highlighting doesn't impact streaming performance
- Search/filter can work on client-side streamed data

**Risks:**
- Performance impact of syntax highlighting on large logs
- Log level detection might miss some patterns
- Search might be slow on very large streams

**Next Steps:** Test syntax highlighting performance, validate log level detection patterns, prototype search functionality

## Research Questions for #ResearchAgent

_Formulated questions to validate top candidates with evidence._

| ID | Question | Candidate | Priority |
| --- | --- | --- | --- |
| RQ1 | What output formats does Cursor CLI support (`--output-format` options)? Are there structured formats (JSON, diff) available beyond text? | Candidate 1 | High |
| RQ2 | How does beads-ui read and monitor Beads SQLite database? What file watching or polling mechanism does it use? | Candidate 2, 3 | High |
| RQ3 | What is the performance impact of tailing log files via `tail -f` vs file watchers (`chokidar`, `fs.watch`) for SSE streaming? | Candidate 1 | High |
| RQ4 | How does React Router 7 handle SSE endpoints? Are there examples or patterns for streaming responses? | Candidate 1, 2 | High |
| RQ5 | What is the structure of beads-ui's codebase? How is the Kanban component implemented, and what would be required to adapt it to React Router 7? | Candidate 3 | Medium |
| RQ6 | How can we reliably track and signal processes (PID management) for intervention controls across macOS, Linux, and Windows? | Candidate 4 | High |
| RQ7 | What are the SQLite file locking implications when multiple processes (Ralph, UI backend, beads CLI) access the database concurrently? | Candidate 2, 3 | Medium |
| RQ8 | What is the performance impact of syntax highlighting large streaming log outputs in React? Are there virtual scrolling optimizations needed? | Candidate 5 | Medium |
| RQ9 | How does the React Router 7 starter handle SQLite access? Are there existing patterns for database integration? | Candidate 2 | Medium |
| RQ10 | What file system patterns work best for task-specific log files? Should we use rotation, cleanup strategies, or size limits? | Candidate 1 | Medium |

**Research Mode Recommendation:** task — Focused research questions for specific implementation decisions in active task context.

## Parking Lot (Future Ideas)

_Lower-priority or future ideas preserved for later consideration._

- **Real-Time Diff Extraction & Side-by-Side View** (Ideas 32, 51) — Complex parsing adds significant effort. Defer until simple text streaming proves valuable.
- **Multi-Task Log Aggregation** (Idea 17, 64) — Useful for epic-level monitoring but not critical for initial release. Consider after single-task monitoring works well.
- **WebSocket Bridge for Bi-Directional Control** (Ideas 16, 34) — More complex than file-based signals. Consider if intervention controls need richer communication.
- **Epic Dependency Graph Visualization** (Idea 72) — Nice-to-have for understanding task relationships. Low priority compared to core monitoring features.
- **Advanced Statistics & Metrics Panels** (Idea 73) — Valuable for insights but not essential for initial monitoring capability.
- **Bun Runtime** (Idea 10) — Performance optimization to consider after Node.js implementation proves functional.
- **Hybrid Text + Post-Processed Diff Extraction** (Idea 43) — Good compromise approach but adds complexity. Evaluate after simple approach is validated.
- **Timestamp-Based Log Seeking** (Idea 21) — Useful for navigating long logs but requires index building. Consider for v2.
- **Task Comment Thread Integration** (Idea 71) — Valuable for traceability but can be added after core monitoring works.
- **Responsive Mobile Layout** (Idea 67) — Important for accessibility but lower priority than desktop experience initially.

## Session Log

**Ideation Techniques Used:** 
- Prompt-based generation (React Router 7 patterns, beads-ui patterns)
- Constraint-based creativity (Cursor output capture, file-based streaming)
- Analogy (terminal emulators, GitHub PR diffs, Kanban boards)
- Perspective shifts (developer monitoring, user intervention, system architecture)
- "How Might We" framing (How might we stream Cursor output? How might we enable intervention?)

**Constitution Clauses Referenced:** 
- C3 (Human-in-the-loop defaults) — Intervention controls, real-time monitoring
- C4 (Tool-agnostic design) — React Router 7 foundation, flexible architecture

**Mission Metrics Considered:** 
- Faster Ralph adoption — Monitoring UI enables confidence in autonomous execution
- Daily coding feels natural — Intuitive UI reduces friction
- Positive team feedback — Real-time visibility and control improve experience

**Conflicts/Blockers Encountered:** 
- Cursor output format uncertainty — Need research on available formats
- Process intervention complexity — Cross-platform signal handling challenges
- Simple vs. complex parsing trade-off — Chose simple approach for initial release

**Follow-up Actions:**
- [ ] Hand off research questions to #ResearchAgent for Candidates 1-5
- [ ] Validate React Router 7 + SQLite integration approach
- [ ] Test Cursor CLI output format options
- [ ] Prototype simple file-based streaming to validate approach

## Recommended Next Steps

1. **Research Phase:** Execute research questions RQ1-RQ4 (high priority) to validate core technical assumptions about Cursor output, React Router 7 SSE, and file streaming patterns.

2. **Technical Spike:** Prototype simple file-based log capture + SSE streaming (Candidate 1) to validate approach before full implementation. Test with real Cursor output.

3. **Architecture Decision:** Based on research, finalize tech stack choices (React Router 7 vs alternatives, SSE vs WebSocket, file-based vs process-based streaming).

4. **Implementation Planning:** Create detailed implementation plan for prioritized candidates, starting with Candidate 1 (log capture) and Candidate 2 (tech stack foundation).

5. **beads-ui Analysis:** Analyze beads-ui codebase structure to determine fork vs. rebuild approach for Kanban board (Candidate 3).
