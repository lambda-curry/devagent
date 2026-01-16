import { data } from 'react-router';
import type { Route } from './+types/api.logs.$taskId';
import { readLastLines, logFileExists } from '~/utils/logs.server';

/**
 * API route to fetch static log content (last N lines)
 * Used as fallback when SSE streaming fails
 */
export async function loader({ params }: Route.LoaderArgs) {
  const taskId = params.taskId;
  
  if (!taskId) {
    throw data('Task ID is required', { status: 400 });
  }

  if (!logFileExists(taskId)) {
    throw data('Log file not found', { status: 404 });
  }

  // Read last 100 lines as fallback
  const logs = readLastLines(taskId, 100);

  return data({ logs });
}
