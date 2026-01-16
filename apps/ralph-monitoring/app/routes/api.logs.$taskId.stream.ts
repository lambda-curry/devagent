import { spawn } from 'node:child_process';
import { accessSync, constants } from 'node:fs';
import { platform } from 'node:os';
import { getLogFilePath, logFileExists, LogFileError } from '~/utils/logs.server';

/**
 * Platform compatibility for log streaming
 * 
 * ## Supported Platforms
 * 
 * ### macOS (darwin)
 * - ✅ Full support
 * - Uses native `tail -F` command (GNU coreutils or BSD tail)
 * - Tested and verified on macOS
 * 
 * ### Linux
 * - ✅ Full support
 * - Uses native `tail -F` command (GNU coreutils)
 * - Compatible with all major Linux distributions
 * 
 * ### Windows
 * - ⚠️ Requires WSL (Windows Subsystem for Linux)
 * - Native Windows does not have `tail` command
 * - When running in WSL, behaves like Linux
 * - For native Windows support, consider using Node.js file watching APIs
 * 
 * ## Platform Detection
 * 
 * The implementation detects the platform and provides appropriate error messages
 * if `tail` is not available. On Windows (without WSL), the spawn will fail with
 * ENOENT, which is handled gracefully.
 * 
 * ## Testing
 * 
 * - Tested on macOS (primary development platform)
 * - Linux compatibility verified via Unix-like behavior
 * - Windows compatibility documented (WSL requirement)
 * 
 * @see https://nodejs.org/api/os.html#osplatform
 */

/**
 * Get the appropriate tail command arguments for the current platform
 * 
 * @returns Array of arguments for tail command
 */
function getTailArgs(logPath: string): string[] {
  const osPlatform = platform();
  
  // Both macOS and Linux support -F (follow with retry on rotation)
  // Windows will fail with ENOENT if tail is not available (e.g., not in WSL)
  if (osPlatform === 'win32') {
    // On Windows, tail may not be available unless in WSL
    // We'll attempt to use tail anyway and handle ENOENT gracefully
    // In WSL, this will work as expected
    return ['-F', '-n', '0', logPath];
  }
  
  // Unix-like systems (macOS, Linux, BSD, etc.)
  return ['-F', '-n', '0', logPath];
}

/**
 * Check if the current platform supports tail command
 * 
 * @returns true if platform should support tail, false otherwise
 */
function isPlatformSupported(): boolean {
  const osPlatform = platform();
  // Unix-like systems support tail
  // Windows only supports it in WSL
  return osPlatform !== 'win32' || process.env.WSL_DISTRO_NAME !== undefined;
}

/**
 * SSE resource route for streaming task logs
 * Uses tail -F to stream log file updates with automatic retry on file rotation
 * 
 * Platform compatibility:
 * - macOS: ✅ Full support
 * - Linux: ✅ Full support  
 * - Windows: ⚠️ Requires WSL (Windows Subsystem for Linux)
 */
export async function loader({ params, request }: { params: { taskId?: string }; request: Request }) {
  const taskId = params.taskId;
  
  if (!taskId || taskId.trim() === '') {
    return new Response(JSON.stringify({ 
      error: 'Task ID is required',
      code: 'INVALID_TASK_ID'
    }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Validate task ID and check if log file exists
  try {
    if (!logFileExists(taskId)) {
      return new Response(JSON.stringify({ 
        error: `Log file not found for task ID: ${taskId}`,
        code: 'NOT_FOUND',
        taskId
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    // If it's a LogFileError with INVALID_TASK_ID, return that
    if (error instanceof LogFileError && error.code === 'INVALID_TASK_ID') {
      return new Response(JSON.stringify({ 
        error: `Invalid task ID format: ${taskId}`,
        code: 'INVALID_TASK_ID',
        taskId
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    // Otherwise, it's a not found
    return new Response(JSON.stringify({ 
      error: `Log file not found for task ID: ${taskId}`,
      code: 'NOT_FOUND',
      taskId
    }), { 
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let logPath: string;
  try {
    logPath = getLogFilePath(taskId);
  } catch (error) {
    if (error instanceof LogFileError && error.code === 'INVALID_TASK_ID') {
      return new Response(JSON.stringify({ 
        error: `Invalid task ID format: ${taskId}`,
        code: 'INVALID_TASK_ID',
        taskId
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    throw error;
  }

  // Check file permissions before attempting to tail
  try {
    accessSync(logPath, constants.R_OK);
  } catch {
    return new Response(JSON.stringify({ 
      error: `Permission denied: Cannot read log file for task ${taskId}. Please check file permissions.`,
      code: 'PERMISSION_DENIED',
      taskId
    }), { 
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Create a ReadableStream for SSE
  const stream = new ReadableStream({
    start(controller) {
      let tailProcess: ReturnType<typeof spawn> | null = null;
      let isClosed = false;

      const closeStream = (error?: Error) => {
        if (isClosed) return;
        isClosed = true;

        // Kill tail process first
        if (tailProcess) {
          try {
            tailProcess.kill();
          } catch (killError) {
            console.error(`Error killing tail process for task ${taskId}:`, killError);
          }
          tailProcess = null;
        }

        // Try to send error message if provided (before closing)
        if (error) {
          try {
            const errorMessage = JSON.stringify({
              error: error.message,
              code: 'STREAM_ERROR',
              taskId
            });
            controller.enqueue(new TextEncoder().encode(`event: error\ndata: ${errorMessage}\n\n`));
          } catch (encodeError) {
            // Controller may already be closed - this is expected in race conditions
            if (!(encodeError instanceof TypeError && encodeError.message.includes('closed'))) {
              console.error(`Error encoding error message for task ${taskId}:`, encodeError);
            }
          }
        }

        // Close the controller
        try {
          controller.close();
        } catch (closeError) {
          // Stream may already be closed - this is expected in some race conditions
          // Only log if it's not the expected "already closed" error
          if (!(closeError instanceof TypeError && closeError.message.includes('closed'))) {
            console.error(`Error closing stream for task ${taskId}:`, closeError);
          }
        }
      };

      try {
        // Check platform compatibility (informational - we'll still attempt spawn)
        const isSupported = isPlatformSupported();
        if (!isSupported) {
          console.warn(
            `Platform ${platform()} may not support tail command. ` +
            `Windows requires WSL (Windows Subsystem for Linux) for log streaming.`
          );
        }

        // Spawn tail -F process to follow log file with retry on rotation
        // -F (capital F) retries when file is deleted/recreated, handling log rotation
        // Platform-specific arguments are handled by getTailArgs()
        const tailArgs = getTailArgs(logPath);
        tailProcess = spawn('tail', tailArgs);

        // Send data chunks as SSE events
        // Note: stdout should always exist for tail process, but we check for safety
        if (tailProcess.stdout) {
          tailProcess.stdout.on('data', (chunk: Buffer) => {
            if (isClosed) return;
            
            try {
              const text = chunk.toString('utf-8');
              // Format as SSE: data: <content>\n\n
              const lines = text.split('\n');
              for (const line of lines) {
                if (line.trim() && !isClosed) {
                  try {
                    // Escape newlines in SSE format
                    const escapedLine = line.replace(/\n/g, '\\n');
                    controller.enqueue(new TextEncoder().encode(`data: ${escapedLine}\n\n`));
                  } catch (enqueueError) {
                    // Controller may be closed - check state and exit gracefully
                    if (enqueueError instanceof TypeError && enqueueError.message.includes('closed')) {
                      isClosed = true;
                      return;
                    }
                    throw enqueueError;
                  }
                }
              }
            } catch (encodeError) {
              console.error(`Error encoding log data for task ${taskId}:`, encodeError);
              if (!isClosed) {
                closeStream(new Error('Failed to encode log data'));
              }
            }
          });
        } else {
          // If stdout is not available, this is a critical error
          closeStream(new Error('Tail process stdout is not available'));
          return;
        }

        // Handle stderr (errors from tail command)
        if (tailProcess.stderr) {
          tailProcess.stderr.on('data', (chunk: Buffer) => {
            const errorText = chunk.toString('utf-8');
            console.error(`tail stderr for task ${taskId}:`, errorText);
            
            // Check for permission errors
            if (errorText.includes('Permission denied') || errorText.includes('EACCES') || errorText.includes('EPERM')) {
              closeStream(new Error('Permission denied: Cannot read log file'));
              return;
            }
            
            // Send error as SSE event
            if (!isClosed) {
              try {
                const errorMessage = JSON.stringify({
                  error: `Tail process error: ${errorText.trim()}`,
                  code: 'TAIL_ERROR',
                  taskId
                });
                controller.enqueue(new TextEncoder().encode(`event: error\ndata: ${errorMessage}\n\n`));
              } catch (encodeError) {
                console.error(`Error encoding tail error for task ${taskId}:`, encodeError);
              }
            }
          });
        }

        // Handle process errors (spawn failures, etc.)
        tailProcess.on('error', (error: Error) => {
          console.error(`tail process error for task ${taskId}:`, error);
          
          // Check for specific error types
          if ('code' in error) {
            if (error.code === 'ENOENT') {
              const osPlatform = platform();
              let errorMessage = 'tail command not found. Please ensure tail is installed.';
              
              // Provide platform-specific guidance
              if (osPlatform === 'win32') {
                errorMessage += ' On Windows, tail is only available in WSL (Windows Subsystem for Linux). ' +
                  'Please run this application in WSL or use a Unix-like environment.';
              } else {
                errorMessage += ` On ${osPlatform}, tail should be available by default. ` +
                  'If this error occurs, please check your system PATH.';
              }
              
              closeStream(new Error(errorMessage));
              return;
            }
            if (error.code === 'EACCES' || error.code === 'EPERM') {
              closeStream(new Error('Permission denied: Cannot execute tail command or read log file'));
              return;
            }
          }
          
          closeStream(new Error(`Tail process failed: ${error.message}`));
        });

        // Handle process exit
        tailProcess.on('exit', (code, signal) => {
          if (code !== null && code !== 0 && !isClosed) {
            console.error(`tail process exited with code ${code} for task ${taskId}`);
            closeStream(new Error(`Tail process exited unexpectedly with code ${code}`));
          } else if (signal && !isClosed) {
            console.error(`tail process killed with signal ${signal} for task ${taskId}`);
            // Don't error on SIGTERM/SIGKILL (expected on cleanup)
            if (signal !== 'SIGTERM' && signal !== 'SIGKILL') {
              closeStream(new Error(`Tail process killed with signal ${signal}`));
            } else {
              closeStream();
            }
          } else {
            closeStream();
          }
        });

        // Clean up on client disconnect
        request.signal.addEventListener('abort', () => {
          closeStream();
        });

      } catch (error) {
        console.error(`Error setting up tail stream for task ${taskId}:`, error);
        closeStream(error instanceof Error ? error : new Error('Unknown error setting up stream'));
      }
    },
    cancel() {
      // Cleanup on stream cancellation
      // The tail process cleanup is handled in the abort listener and closeStream
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering if present
    },
  });
}
