import { data } from 'react-router';
import { addComment, getTaskById } from '~/db/beads.server';
import type { Route } from './+types/api.tasks.$taskId.comments';

/**
 * API endpoint to add a comment to a task
 * POST /api/tasks/:taskId/comments
 */
export async function action({ params, request }: Route.ActionArgs) {
  const taskId = params.taskId;

  if (!taskId) {
    throw data({ success: false, message: 'Task ID is required' }, { status: 400 });
  }

  // Only allow POST requests
  if (request.method !== 'POST') {
    throw data({ success: false, message: 'Method not allowed' }, { status: 405 });
  }

  // Verify task exists
  const task = getTaskById(taskId);
  if (!task) {
    throw data({ success: false, message: 'Task not found' }, { status: 404 });
  }

  try {
    const formData = await request.formData();
    const text = formData.get('text');
    const author = formData.get('author') || 'User';

    if (!text || typeof text !== 'string' || text.trim() === '') {
      throw data({ success: false, message: 'Comment text is required' }, { status: 400 });
    }

    const comment = addComment(taskId, String(author), text.trim());

    if (!comment) {
      throw data({ success: false, message: 'Failed to add comment' }, { status: 500 });
    }

    return data({ success: true, comment }, { status: 201 });
  } catch (error) {
    // Re-throw if it's already a Response (from throw data())
    if (error instanceof Response) {
      throw error;
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error adding comment to task ${taskId}:`, error);

    throw data({ success: false, message: `Failed to add comment: ${errorMessage}` }, { status: 500 });
  }
}
