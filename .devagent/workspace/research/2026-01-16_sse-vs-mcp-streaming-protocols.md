# Research Packet: SSE vs MCP Streaming Protocols

- **Date:** 2026-01-16
- **Author:** AI Agent (Ralph)
- **Classification:** Architecture Decision
- **Status:** Complete
- **Task ID:** devagent-gc4.1
- **Epic ID:** devagent-gc4

## Problem Statement

Investigate whether SSE (Server-Sent Events) is still the right choice for log streaming in ralph-monitoring UI given that MCP (Model Context Protocol) servers are using HTTP streaming protocols. Research the benefits and tradeoffs of alternative streaming approaches (e.g., streaming JSON, structured formats) and determine if we should adopt a different pattern for consistency with MCP ecosystem.

## Current Implementation

### SSE Implementation

The current ralph-monitoring UI uses **Server-Sent Events (SSE)** for log streaming:

**Server-side** (`apps/ralph-monitoring/app/routes/api.logs.$taskId.stream.ts`):
- Uses `ReadableStream` with `text/event-stream` content type
- Spawns `tail -f` process to follow log files
- Formats output as SSE events: `data: <content>\n\n`
- Handles client disconnect via `request.signal.addEventListener('abort')`

**Client-side** (`apps/ralph-monitoring/app/components/LogViewer.tsx`):
- Uses native `EventSource` API
- Automatically handles reconnection
- Processes incoming log lines via `eventSource.onmessage`

**Key Characteristics:**
- Unidirectional (server → client)
- Text-based format
- Automatic reconnection built into EventSource
- Simple line-by-line streaming
- Standard HTTP/1.1 protocol

## MCP Protocol Analysis

### MCP Architecture

**Model Context Protocol (MCP)** uses a fundamentally different approach:

1. **Transport:** JSON-RPC 2.0 over HTTP (not HTTP streaming)
2. **Communication Pattern:** Request/Response with notifications
3. **Progress Updates:** Via `notifications/progress` (JSON-RPC notifications)
4. **Resource Subscriptions:** Via `resources/subscribe` (JSON-RPC notifications)

### MCP Streaming Mechanisms

MCP does **not** use traditional HTTP streaming (SSE, chunked transfer encoding, or streaming JSON). Instead:

1. **Progress Notifications:**
   ```json
   {
     "jsonrpc": "2.0",
     "method": "notifications/progress",
     "params": {
       "progressToken": "oivaizmir",
       "progress": 50,
       "total": 100,
       "message": "Reticulating splines..."
     }
   }
   ```

2. **Tool Call Responses:**
   - Complete JSON responses (not streamed)
   - Structured content blocks (text, images, audio, resources)
   - Error handling via JSON-RPC error objects

3. **Resource Subscriptions:**
   - JSON-RPC notifications for resource updates
   - Not HTTP streaming

### Key Differences

| Aspect | SSE (Current) | MCP Protocol |
|-------|---------------|---------------|
| **Transport** | HTTP/1.1 with `text/event-stream` | JSON-RPC 2.0 over HTTP |
| **Direction** | Unidirectional (server → client) | Bidirectional (request/response + notifications) |
| **Format** | Text-based (`data: <content>\n\n`) | Structured JSON |
| **Reconnection** | Built into EventSource | Manual via JSON-RPC |
| **Use Case** | Real-time log streaming | Tool calls, resource access, progress updates |
| **Protocol** | Standard HTTP streaming | Application-layer protocol |

## Alternative Streaming Approaches

### 1. Streaming JSON (NDJSON / JSONL)

**Format:** Newline-delimited JSON (one JSON object per line)

**Example:**
```json
{"type": "log", "timestamp": "2026-01-16T10:00:00Z", "message": "Task started"}
{"type": "log", "timestamp": "2026-01-16T10:00:01Z", "message": "Processing..."}
{"type": "progress", "progress": 50, "total": 100}
```

**Benefits:**
- Structured data (can include metadata: timestamps, log levels, structured content)
- Easy to parse (one JSON object per line)
- Can include multiple event types in same stream
- More flexible than plain text

**Tradeoffs:**
- Requires JSON parsing on client
- Slightly more overhead than plain text
- Not compatible with EventSource (would need custom fetch/ReadableStream)

**Implementation:**
```typescript
// Server
controller.enqueue(new TextEncoder().encode(
  JSON.stringify({ type: 'log', message: line }) + '\n'
));

// Client
const reader = response.body.getReader();
const decoder = new TextDecoder();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const lines = decoder.decode(value).split('\n');
  for (const line of lines) {
    if (line.trim()) {
      const event = JSON.parse(line);
      // Handle event
    }
  }
}
```

### 2. SSE with Structured Events

**Format:** SSE with JSON payloads in `data:` field

**Example:**
```
event: log
data: {"timestamp": "2026-01-16T10:00:00Z", "message": "Task started"}

event: progress
data: {"progress": 50, "total": 100}
```

**Benefits:**
- Keeps SSE benefits (EventSource, auto-reconnect)
- Adds structured data capability
- Can use different event types
- Minimal changes to current implementation

**Tradeoffs:**
- Still text-based (JSON strings in SSE format)
- Requires JSON parsing on client
- Slightly more complex than plain text SSE

**Implementation:**
```typescript
// Server
controller.enqueue(new TextEncoder().encode(
  `event: log\ndata: ${JSON.stringify({ timestamp, message })}\n\n`
));

// Client
eventSource.addEventListener('log', (event) => {
  const data = JSON.parse(event.data);
  // Handle structured log event
});
```

### 3. WebSocket

**Format:** Bidirectional binary or text protocol

**Benefits:**
- Full bidirectional communication
- Lower latency than HTTP
- Can send structured data easily
- More flexible than SSE

**Tradeoffs:**
- More complex (connection management, reconnection logic)
- Requires WebSocket server infrastructure
- Overkill for unidirectional log streaming
- Not standard HTTP (different protocol)

### 4. HTTP Chunked Transfer Encoding with JSON

**Format:** HTTP chunked encoding with JSON objects

**Benefits:**
- Standard HTTP
- Structured data
- Can use fetch API with streaming

**Tradeoffs:**
- No built-in reconnection
- More complex client implementation
- Not as simple as SSE

## Comparison Matrix

| Approach | Complexity | Structure | Reconnection | MCP Alignment | Recommendation |
|----------|------------|-----------|--------------|---------------|----------------|
| **SSE (Current)** | Low | Low (text) | Built-in | Low | ✅ Keep |
| **SSE + JSON** | Low-Medium | High | Built-in | Medium | ⚠️ Consider |
| **NDJSON/JSONL** | Medium | High | Manual | Medium | ⚠️ Consider |
| **WebSocket** | High | High | Manual | Low | ❌ Overkill |
| **MCP JSON-RPC** | High | High | Manual | High | ❌ Wrong use case |

## Key Findings

### 1. MCP Doesn't Use HTTP Streaming

**Critical Discovery:** MCP does **not** use HTTP streaming protocols (SSE, chunked encoding, or streaming JSON). MCP uses:
- JSON-RPC 2.0 over HTTP (standard request/response)
- JSON-RPC notifications for progress updates
- Complete JSON responses (not streamed)

**Implication:** There is **no MCP streaming pattern to align with** for log streaming. MCP's "streaming" is actually JSON-RPC notifications, which is a different use case (tool calls, progress updates) than continuous log streaming.

### 2. SSE is Appropriate for Log Streaming

**SSE is well-suited for log streaming because:**
- Unidirectional (server → client) matches log streaming use case
- Simple text format works well for log lines
- Built-in reconnection handles network issues
- Standard HTTP/1.1 protocol (no special infrastructure)
- Low overhead
- Works well with React Router 7 resource routes

### 3. MCP Alignment is Not Relevant

**MCP is designed for:**
- Tool calls (request/response)
- Resource access (request/response)
- Progress notifications (JSON-RPC notifications)

**Log streaming is:**
- Continuous, unidirectional data flow
- Text-based log lines
- Real-time updates

**Conclusion:** MCP and log streaming serve different purposes. Aligning log streaming with MCP patterns would be a mismatch.

## Recommendations

### ✅ Keep SSE (Current Implementation)

**Recommendation:** **Continue using SSE for log streaming.**

**Rationale:**
1. **Right tool for the job:** SSE is designed for unidirectional, real-time server-to-client streaming
2. **MCP alignment is irrelevant:** MCP doesn't use HTTP streaming, so there's no pattern to align with
3. **Current implementation works well:** Simple, effective, and well-integrated with React Router 7
4. **Low complexity:** EventSource API is simple and reliable
5. **Standard protocol:** Works with standard HTTP infrastructure

### ⚠️ Optional Enhancement: SSE with Structured Events

**If structured metadata is needed** (timestamps, log levels, structured content), consider enhancing SSE with JSON payloads:

**When to consider:**
- Need to add metadata (timestamps, log levels, structured content)
- Want to support multiple event types (log, progress, error)
- Need to parse or filter logs on client side

**Implementation:**
- Keep SSE format
- Use JSON in `data:` field
- Use `event:` field for event types
- Minimal changes to current implementation

**Example:**
```typescript
// Server
controller.enqueue(new TextEncoder().encode(
  `event: log\ndata: ${JSON.stringify({ 
    timestamp: new Date().toISOString(),
    level: 'info',
    message: line 
  })}\n\n`
));

// Client
eventSource.addEventListener('log', (event) => {
  const logEntry = JSON.parse(event.data);
  // Handle structured log entry
});
```

### ❌ Do Not Adopt MCP Patterns

**Do not** adopt MCP JSON-RPC patterns for log streaming because:
1. MCP doesn't use HTTP streaming (it uses JSON-RPC request/response)
2. Would require significant architectural changes
3. No benefit over SSE for this use case
4. Adds unnecessary complexity

## Implementation Status

**Current State:**
- ✅ SSE implementation is working
- ✅ React Router 7 resource route pattern
- ✅ Client-side EventSource integration
- ✅ Proper cleanup on disconnect

**No Changes Needed:**
- Current SSE implementation is appropriate
- No need to align with MCP patterns (MCP doesn't use HTTP streaming)
- Keep existing simple, effective approach

## Future Considerations

### If Structured Logs Are Needed

If future requirements need structured log data (timestamps, log levels, metadata), enhance SSE with JSON:

1. **Minimal change:** Keep SSE, add JSON to `data:` field
2. **Backward compatible:** Can support both plain text and structured formats
3. **Low risk:** Small enhancement to existing working system

### If Bidirectional Communication Is Needed

If future requirements need client-to-server communication (e.g., filtering, search), consider:

1. **Keep SSE for streaming:** Continue using SSE for log streaming
2. **Add separate API endpoints:** Use standard HTTP endpoints for client requests (filtering, search)
3. **Hybrid approach:** SSE for streaming + REST API for control

**Do not** switch to WebSocket unless bidirectional real-time communication is required.

## References

### Internal Sources
- `apps/ralph-monitoring/app/routes/api.logs.$taskId.stream.ts` - Current SSE implementation
- `apps/ralph-monitoring/app/components/LogViewer.tsx` - Client-side EventSource usage
- `.devagent/workspace/tasks/active/2026-01-13_ralph-monitoring-ui/research/2026-01-14_cursor-output-streaming-tech-validation.md` - Prior SSE research

### External Sources
- MCP Specification: https://modelcontextprotocol.io/specification/
- Server-Sent Events (SSE) Specification: https://html.spec.whatwg.org/multipage/server-sent-events.html
- React Router 7 Streaming APIs: https://github.com/remix-run/react-router/blob/main/decisions/0004-streaming-apis.md

## Conclusion

**SSE remains the right choice for log streaming.** MCP does not use HTTP streaming protocols, so there is no MCP pattern to align with. The current SSE implementation is appropriate, simple, and effective. No changes are needed unless structured log metadata is required in the future.

---

**Next Steps:**
- ✅ Research complete
- ✅ Recommendation: Keep SSE
- ⏭️ No implementation changes needed
- 📝 Document findings for future reference
