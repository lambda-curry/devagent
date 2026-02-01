import { Check, Loader2, MessageCircle, Pencil, Plus, Trash2, X } from 'lucide-react';
import { memo, useEffect, useRef, useState } from 'react';
import { useFetcher, useRevalidator } from 'react-router';
import type { BeadsComment } from '~/db/beads.types';
import { MarkdownContent } from './Markdown';
import { Button } from './ui/button';

interface CommentsProps {
  taskId: string;
  comments: BeadsComment[];
}

/**
 * Comments component displays a list of task comments with markdown rendering.
 *
 * Features:
 * - Displays comments with timestamps and author (newest first)
 * - Add new comments
 * - Edit existing comments
 * - Delete comments with confirmation
 * - Renders markdown formatting (bold, code blocks, lists, checkmarks)
 * - GitHub-Flavored Markdown (GFM) support
 * - Safe by default - XSS protection via react-markdown
 *
 * Performance:
 * - Component is memoized to prevent unnecessary re-renders
 * - Only re-renders when comments array reference changes
 */
export const Comments = memo(function Comments({ taskId, comments }: CommentsProps) {
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  const addFetcher = useFetcher();
  const editFetcher = useFetcher();
  const deleteFetcher = useFetcher();
  const revalidator = useRevalidator();

  const isAdding = addFetcher.state === 'submitting';
  const isEditing = editFetcher.state === 'submitting';
  const isDeleting = deleteFetcher.state === 'submitting';

  // Reset form state after successful add
  useEffect(() => {
    if (addFetcher.state === 'idle' && addFetcher.data?.success) {
      setIsAddingComment(false);
      revalidator.revalidate();
    }
  }, [addFetcher.state, addFetcher.data, revalidator]);

  // Reset edit state after successful edit
  useEffect(() => {
    if (editFetcher.state === 'idle' && editFetcher.data?.success) {
      setEditingCommentId(null);
      revalidator.revalidate();
    }
  }, [editFetcher.state, editFetcher.data, revalidator]);

  // Reset delete state after successful delete
  useEffect(() => {
    if (deleteFetcher.state === 'idle' && deleteFetcher.data?.success) {
      setDeleteConfirmId(null);
      revalidator.revalidate();
    }
  }, [deleteFetcher.state, deleteFetcher.data, revalidator]);

  // Focus textarea when opening add form
  useEffect(() => {
    if (isAddingComment && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isAddingComment]);

  // Focus edit textarea when editing
  useEffect(() => {
    if (editingCommentId !== null && editTextareaRef.current) {
      editTextareaRef.current.focus();
      // Move cursor to end
      const length = editTextareaRef.current.value.length;
      editTextareaRef.current.setSelectionRange(length, length);
    }
  }, [editingCommentId]);

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addFetcher.submit(formData, {
      method: 'POST',
      action: `/api/tasks/${taskId}/comments`
    });
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>, commentId: number) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    editFetcher.submit(formData, {
      method: 'PUT',
      action: `/api/comments/${commentId}`
    });
  };

  const handleDelete = (commentId: number) => {
    deleteFetcher.submit(null, {
      method: 'DELETE',
      action: `/api/comments/${commentId}`
    });
  };

  return (
    <div className="border-t border-border pt-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Comments {comments.length > 0 && `(${comments.length})`}</h2>
        </div>
        {!isAddingComment && (
          <Button variant="outline" size="sm" onClick={() => setIsAddingComment(true)}>
            <Plus className="w-4 h-4" />
            Add Comment
          </Button>
        )}
      </div>

      {/* Add Comment Form */}
      {isAddingComment && (
        <div className="mb-4 bg-muted/50 rounded-lg p-4 border border-border">
          <form onSubmit={handleAddSubmit}>
            <textarea
              ref={textareaRef}
              name="text"
              placeholder="Write a comment... (Markdown supported)"
              className="w-full min-h-[100px] p-3 text-sm bg-background border border-input rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isAdding}
              required
            />
            <input type="hidden" name="author" value="User" />
            <div className="flex justify-end gap-2 mt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAddingComment(false)}
                disabled={isAdding}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isAdding}>
                {isAdding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Add Comment
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Comments List (newest first - already sorted by API) */}
      {comments.length === 0 ? (
        <div className="text-sm text-muted-foreground italic">
          No comments yet. Comments will appear here when added to this task.
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="bg-muted/50 rounded-lg p-4 border border-border">
              {editingCommentId === comment.id ? (
                /* Edit Mode */
                <form onSubmit={e => handleEditSubmit(e, comment.id)}>
                  <textarea
                    ref={editTextareaRef}
                    name="text"
                    defaultValue={comment.body}
                    className="w-full min-h-[100px] p-3 text-sm bg-background border border-input rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                    disabled={isEditing}
                    required
                  />
                  <div className="flex justify-end gap-2 mt-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingCommentId(null)}
                      disabled={isEditing}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" disabled={isEditing}>
                      {isEditing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                /* View Mode */
                <>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground">{comment.author}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {deleteConfirmId === comment.id ? (
                        /* Delete Confirmation */
                        <>
                          <span className="text-xs text-destructive mr-2">Delete?</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setDeleteConfirmId(null)}
                            disabled={isDeleting}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleDelete(comment.id)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          </Button>
                        </>
                      ) : (
                        /* Edit/Delete Buttons */
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => setEditingCommentId(comment.id)}
                            title="Edit comment"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteConfirmId(comment.id)}
                            title="Delete comment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-foreground break-words">
                    <MarkdownContent>{comment.body}</MarkdownContent>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
