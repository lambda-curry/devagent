import { MessageCircle } from 'lucide-react';
import type { BeadsComment } from '~/db/beads.server';

interface CommentsProps {
  comments: BeadsComment[];
}

/**
 * Comments component displays a list of task comments.
 * 
 * Features:
 * - Displays comments with timestamps
 * - Shows empty state when no comments exist
 * - Renders comment text as plaintext (markdown support can be added later)
 * - Handles long text gracefully with proper whitespace
 */
export function Comments({ comments }: CommentsProps) {
  if (comments.length === 0) {
    return (
      <div className="border-t border-border pt-6 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Comments</h2>
        </div>
        <div className="text-sm text-muted-foreground italic">
          No comments yet. Comments will appear here when added to this task.
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-border pt-6 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Comments ({comments.length})</h2>
      </div>
      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={`${comment.created_at}-${comment.body.slice(0, 20)}`}
            className="bg-muted/50 rounded-lg p-4 border border-border"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">
                {new Date(comment.created_at).toLocaleString()}
              </span>
            </div>
            <div className="text-sm text-foreground whitespace-pre-wrap break-words">
              {comment.body}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
