import { data } from 'react-router';
import type { Route } from './+types/api.tasks.$taskId.comments';
import { getTaskCommentsAsync } from '~/db/beads.server';

/**
 * API endpoint to fetch comments for a task
 * 
 * This is a separate endpoint to allow lazy loading of comments,
 * improving initial page load performance by not blocking the
 * server render with synchronous CLI calls (spawnSync).
 */
export async function loader({ params }: Route.LoaderArgs) {
  const taskId = params.taskId;

  if (!taskId) {
    throw data({ error: 'Task ID is required' }, { status: 400 });
  }

  const result = await getTaskCommentsAsync(taskId, { timeoutMs: 5_000 });

  if (result.error) {
    const status = result.error.type === 'timeout' ? 504 : 500;
    const message =
      typeof result.error.message === 'string' && result.error.message.trim()
        ? result.error.message
        : result.error.type === 'timeout'
          ? 'Timed out while loading comments.'
          : 'Failed to load comments.';
    throw data(
      {
        error: message,
        type: result.error.type,
      },
      { status }
    );
  }

  return data({ comments: result.comments });
}
