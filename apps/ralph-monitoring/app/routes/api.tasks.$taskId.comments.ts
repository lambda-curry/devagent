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
    const rawText = formData.get('text');
    const rawAuthor = formData.get('author');

    // remix-hook-form's createFormData JSON-stringifies values, so we need to parse them
    const parseFormValue = (value: FormDataEntryValue | null): string | null => {
      if (value === null || typeof value !== 'string') return null;
      // Check if it's a JSON-stringified value (starts and ends with quotes)
      if (value.startsWith('"') && value.endsWith('"')) {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
      return value;
    };

    const text = parseFormValue(rawText);
    const author = parseFormValue(rawAuthor) || 'User';

    if (!text || text.trim() === '') {
      throw data({ success: false, message: 'Comment text is required' }, { status: 400 });
    }

    const comment = addComment(taskId, author, text.trim());

    if (!comment) {
      throw data({ success: false, message: 'Failed to add comment' }, { status: 500 });
    }

    return data({ success: true, comment }, { status: 201 });
  } catch (error) {
    // Re-throw if it's already a Response (from throw data())
    if (error instanceof Response) {
      throw error;
    }
    // Handle different error types
    let errorMessage: string;
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String((error as { message: unknown }).message);
    } else {
      errorMessage = JSON.stringify(error);
    }
    console.error(`Error adding comment to task ${taskId}:`, error);

    throw data({ success: false, message: `Failed to add comment: ${errorMessage}` }, { status: 500 });
  }
}
