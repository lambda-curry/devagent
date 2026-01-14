import { spawn } from 'node:child_process';
import { getLogFilePath, logFileExists } from '~/utils/logs.server';

/**
 * SSE resource route for streaming task logs
 * Uses tail -f to stream log file updates
 */
export async function loader({ params, request }: { params: { taskId?: string }; request: Request }) {
  const taskId = params.taskId;
  
  if (!taskId) {
    return new Response('Task ID is required', { status: 400 });
  }

  // Check if log file exists
  if (!logFileExists(taskId)) {
    return new Response('Log file not found', { status: 404 });
  }

  const logPath = getLogFilePath(taskId);

  // Create a ReadableStream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Spawn tail -f process to follow log file
      const tail = spawn('tail', ['-f', '-n', '0', logPath]);

      // Send data chunks as SSE events
      tail.stdout.on('data', (chunk: Buffer) => {
        const text = chunk.toString('utf-8');
        // Format as SSE: data: <content>\n\n
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.trim()) {
            controller.enqueue(new TextEncoder().encode(`data: ${line}\n\n`));
          }
        }
      });

      // Handle errors
      tail.stderr.on('data', (chunk: Buffer) => {
        console.error(`tail error for task ${taskId}:`, chunk.toString());
      });

      tail.on('error', (error) => {
        console.error(`tail process error for task ${taskId}:`, error);
        controller.enqueue(new TextEncoder().encode(`event: error\ndata: ${error.message}\n\n`));
        controller.close();
      });

      // Clean up on client disconnect
      request.signal.addEventListener('abort', () => {
        tail.kill();
        controller.close();
      });

      // Clean up on process exit
      tail.on('exit', () => {
        controller.close();
      });
    },
    cancel() {
      // Cleanup on stream cancellation
      // The tail process cleanup is handled in the abort listener
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
