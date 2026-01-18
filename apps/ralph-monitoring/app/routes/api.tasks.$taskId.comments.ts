import { data } from 'react-router';
import type { Route } from './+types/api.tasks.$taskId.comments';
import { getTaskComments } from '~/db/beads.server';

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

  // Fetch comments using Beads CLI (this uses spawnSync internally)
  // By using an API route, we move this off the critical rendering path
  const comments = getTaskComments(taskId);

  return { comments };
}
