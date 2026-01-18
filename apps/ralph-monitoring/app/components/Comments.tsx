import { memo } from 'react';
import { MessageCircle } from 'lucide-react';
import type { BeadsComment } from '~/db/beads.server';
import { MarkdownContent } from './Markdown';

interface CommentsProps {
  comments: BeadsComment[];
}

/**
 * Comments component displays a list of task comments with markdown rendering.
 *
 * Features:
 * - Displays comments with timestamps
 * - Shows empty state when no comments exist
 * - Renders markdown formatting (bold, code blocks, lists, checkmarks)
 * - GitHub-Flavored Markdown (GFM) support
 * - Safe by default - XSS protection via react-markdown
 *
 * Performance:
 * - Component is memoized to prevent unnecessary re-renders
 * - Only re-renders when comments array reference changes
 */
export const Comments = memo(function Comments({ comments }: CommentsProps) {
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
        {comments.map((comment, index) => (
          <div
            key={`${comment.created_at}-${index}`}
            className="bg-muted/50 rounded-lg p-4 border border-border"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">
                {new Date(comment.created_at).toLocaleString()}
              </span>
            </div>
            <div className="text-sm text-foreground break-words">
              <MarkdownContent>{comment.body}</MarkdownContent>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
