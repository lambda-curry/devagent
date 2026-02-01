import { data } from 'react-router';
import type { Route } from './+types/api.comments.$commentId';
import { updateComment, deleteComment } from '~/db/beads.server';

/**
 * API endpoint to update or delete a comment
 * PUT /api/comments/:commentId - Update comment
 * DELETE /api/comments/:commentId - Delete comment
 */
export async function action({ params, request }: Route.ActionArgs) {
  const commentIdStr = params.commentId;

  if (!commentIdStr) {
    throw data({ success: false, message: 'Comment ID is required' }, { status: 400 });
  }

  const commentId = parseInt(commentIdStr, 10);
  if (isNaN(commentId)) {
    throw data({ success: false, message: 'Invalid comment ID' }, { status: 400 });
  }

  try {
    if (request.method === 'PUT') {
      const formData = await request.formData();
      const text = formData.get('text');

      if (!text || typeof text !== 'string' || text.trim() === '') {
        throw data({ success: false, message: 'Comment text is required' }, { status: 400 });
      }

      const comment = updateComment(commentId, text.trim());

      if (!comment) {
        throw data({ success: false, message: 'Comment not found' }, { status: 404 });
      }

      return data({ success: true, comment }, { status: 200 });
    }

    if (request.method === 'DELETE') {
      const deleted = deleteComment(commentId);

      if (!deleted) {
        throw data({ success: false, message: 'Comment not found' }, { status: 404 });
      }

      return data({ success: true }, { status: 200 });
    }

    throw data({ success: false, message: 'Method not allowed' }, { status: 405 });
  } catch (error) {
    // Re-throw if it's already a Response (from throw data())
    if (error instanceof Response) {
      throw error;
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error with comment ${commentId}:`, error);

    throw data({ success: false, message: `Failed to process comment: ${errorMessage}` }, { status: 500 });
  }
}
