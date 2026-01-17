# Platform Compatibility for Log Streaming

## Overview

The log streaming endpoint (`api.logs.$taskId.stream.ts`) uses the Unix `tail -F` command to stream log files in real-time via Server-Sent Events (SSE).

## Supported Platforms

### ✅ macOS (darwin)

**Status:** Fully supported and tested

- Uses native BSD `tail` command (included in macOS)
- `tail -F` flag works correctly for following files with retry on rotation
- Tested on macOS 14.6.0 (Darwin 24.6.0)
- No additional setup required

**Verification:**
```bash
# Test tail command availability
which tail
# Output: /usr/bin/tail

# Test tail -F functionality
echo "test" > /tmp/test.log
tail -F -n 0 /tmp/test.log &
# Add content to file - should stream correctly
```

### ✅ Linux

**Status:** Fully supported

- Uses GNU `tail` command (coreutils)
- Compatible with all major Linux distributions (Ubuntu, Debian, RHEL, etc.)
- `tail -F` flag works identically to macOS
- No additional setup required

**Note:** Linux compatibility is verified through Unix-like behavior. The implementation follows POSIX standards and should work on all Linux distributions.

### ⚠️ Windows

**Status:** Requires WSL (Windows Subsystem for Linux)

**Native Windows:**
- ❌ Not supported - Windows does not include `tail` command
- The `spawn('tail', ...)` call will fail with `ENOENT` error
- Error message will indicate WSL requirement

**Windows with WSL:**
- ✅ Supported when running in WSL environment
- Behaves identically to Linux
- Requires Node.js application to run within WSL
- WSL can be detected via `process.env.WSL_DISTRO_NAME`

**Error Handling:**
When `tail` is not found on Windows (without WSL), the application will:
1. Detect the `ENOENT` error code
2. Return a user-friendly error message indicating WSL requirement
3. Provide guidance on running in WSL

**Example Error Response:**
```json
{
  "error": "tail command not found. Please ensure tail is installed. On Windows, tail is only available in WSL (Windows Subsystem for Linux). Please run this application in WSL or use a Unix-like environment.",
  "code": "STREAM_ERROR",
  "taskId": "example-task"
}
```

## Platform Detection

The implementation uses Node.js `os.platform()` to detect the operating system:

```typescript
import { platform } from 'node:os';

const osPlatform = platform();
// Returns: 'darwin' (macOS), 'linux', 'win32' (Windows), etc.
```

### Platform-Specific Behavior

1. **Unix-like systems (macOS, Linux, BSD):**
   - Uses `tail -F -n 0 <logPath>` directly
   - No special handling required

2. **Windows:**
   - Attempts to use `tail` (will work in WSL)
   - Provides platform-specific error messages if `tail` is not found
   - Checks for WSL environment via `process.env.WSL_DISTRO_NAME`

## Testing

### macOS Testing

✅ **Verified on macOS:**
- Platform: macOS 14.6.0 (Darwin 24.6.0)
- Tail command: `/usr/bin/tail` (BSD version)
- Test result: `tail -F` works correctly for log streaming

**Test Command:**
```bash
echo "test log line" > /tmp/test-log-stream.log
tail -F -n 0 /tmp/test-log-stream.log &
# Add content: echo "new line" >> /tmp/test-log-stream.log
# Verify streaming works
```

### Linux Testing

⚠️ **Not directly tested** - Compatibility verified through:
- Unix-like behavior (POSIX compliance)
- Standard GNU coreutils `tail` implementation
- Identical command-line interface to macOS

**Recommended Linux Test:**
```bash
# On a Linux system
echo "test log line" > /tmp/test-log-stream.log
tail -F -n 0 /tmp/test-log-stream.log &
echo "new line" >> /tmp/test-log-stream.log
# Verify streaming works
```

### Windows Testing

⚠️ **Not directly tested** - Behavior documented based on:
- Windows lack of native `tail` command
- WSL compatibility (Linux-like environment)
- Error handling implementation

**Windows Testing Requirements:**
1. Test in native Windows (should fail with ENOENT)
2. Test in WSL (should work like Linux)
3. Verify error messages are user-friendly

## Implementation Details

### Tail Command Arguments

The implementation uses:
```bash
tail -F -n 0 <logPath>
```

- `-F`: Follow file with retry (handles log rotation)
- `-n 0`: Start from end of file (don't show existing content)
- `<logPath>`: Path to the log file

### Error Handling

The implementation handles platform-specific errors:

1. **ENOENT (Command not found):**
   - Detects platform
   - Provides platform-specific error message
   - Windows: Mentions WSL requirement
   - Unix: Suggests checking PATH

2. **Permission Errors:**
   - Handled uniformly across platforms
   - Returns 403 status with clear error message

3. **Process Errors:**
   - Platform-agnostic error handling
   - Logs errors and closes stream gracefully

## Future Enhancements

### Potential Windows Native Support

If native Windows support is needed (without WSL), consider:

1. **Node.js File Watching:**
   - Use `fs.watch()` or `fs.watchFile()` APIs
   - Implement tail-like behavior in JavaScript
   - More complex but platform-independent

2. **PowerShell Alternative:**
   - Use PowerShell `Get-Content -Wait -Tail 0`
   - Requires platform detection and alternative command
   - Less reliable than Unix `tail`

3. **Third-Party Tools:**
   - Bundle a cross-platform tail implementation
   - Increases dependencies and complexity

**Recommendation:** Current WSL requirement is acceptable for most use cases. Native Windows support can be added if there's a specific need.

## References

- [Node.js os.platform()](https://nodejs.org/api/os.html#osplatform)
- [GNU tail documentation](https://www.gnu.org/software/coreutils/manual/html_node/tail-invocation.html)
- [Windows Subsystem for Linux](https://learn.microsoft.com/en-us/windows/wsl/)
- [Server-Sent Events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
