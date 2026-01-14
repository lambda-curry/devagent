import { readLastLines, logFileExists } from '~/utils/logs.server';

/**
 * API route to fetch static log content (last N lines)
 * Used as fallback when SSE streaming fails
 */
export async function loader({ params }: { params: { taskId?: string } }) {
  const taskId = params.taskId;
  
  if (!taskId) {
    return new Response('Task ID is required', { status: 400 });
  }

  if (!logFileExists(taskId)) {
    return new Response('Log file not found', { status: 404 });
  }

  // Read last 100 lines as fallback
  const logs = readLastLines(taskId, 100);

  return new Response(JSON.stringify({ logs }), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
