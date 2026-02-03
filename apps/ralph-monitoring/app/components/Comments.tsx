import { zodResolver } from '@hookform/resolvers/zod';
import { FormError, HiddenField, Textarea } from '@lambdacurry/forms';
import { Check, Loader2, MessageCircle, Pencil, Plus, Trash2, X } from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';
import { useFetcher, useRevalidator } from 'react-router';
import { createFormData, RemixFormProvider, useRemixForm } from 'remix-hook-form';
import type { Resolver } from 'react-hook-form';
import { z } from 'zod';
import type { BeadsComment } from '~/db/beads.types';
import { MarkdownContent } from './Markdown';
import { Button } from './ui/button';

// Schema for adding/editing comments
const commentSchema = z.object({
  text: z.string().min(1, 'Comment cannot be empty'),
  author: z.string().min(1, 'Author is required'),
});

type CommentFormData = z.infer<typeof commentSchema>;
const buildResolver = zodResolver as unknown as (schema: unknown) => Resolver<CommentFormData>;
const commentResolver = buildResolver(commentSchema);

interface CommentsProps {
  taskId: string;
  comments: BeadsComment[];
}

interface AddCommentFormProps {
  taskId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

interface EditCommentFormProps {
  commentId: number;
  initialText: string;
  onCancel: () => void;
  onSuccess: () => void;
}

/**
 * Form component for adding a new comment.
 * Uses @lambdacurry/forms with remix-hook-form following best practices.
 */
function AddCommentForm({ taskId, onCancel, onSuccess }: AddCommentFormProps) {
  const fetcher = useFetcher<{ success?: boolean; errors?: Record<string, { message: string }> }>();
  const revalidator = useRevalidator();

  const methods = useRemixForm<CommentFormData>({
    resolver: commentResolver,
    defaultValues: { text: '', author: 'User' },
    fetcher,
    submitHandlers: {
      onValid: (data) => {
        fetcher.submit(createFormData(data), {
          method: 'post',
          action: `/api/tasks/${taskId}/comments`,
        });
      },
    },
  });

  const isSubmitting = fetcher.state === 'submitting';

  // Handle successful submission
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.success) {
      revalidator.revalidate();
      methods.reset();
      onSuccess();
    }
  }, [fetcher.state, fetcher.data, revalidator, onSuccess, methods]);

  return (
    <div className="mb-4 bg-muted/50 rounded-lg p-4 border border-border">
      <RemixFormProvider {...methods}>
        <form onSubmit={methods.handleSubmit}>
          <Textarea
            name="text"
            placeholder="Write a comment... (Markdown supported)"
            rows={4}
            autoFocus
          />
          <HiddenField name="author" />
          <FormError className="mt-2" />
          <div className="flex justify-end gap-2 mt-3">
            <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? (
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
      </RemixFormProvider>
    </div>
  );
}

/**
 * Form component for editing an existing comment.
 * Uses @lambdacurry/forms with remix-hook-form following best practices.
 */
function EditCommentForm({ commentId, initialText, onCancel, onSuccess }: EditCommentFormProps) {
  const fetcher = useFetcher<{ success?: boolean; errors?: Record<string, { message: string }> }>();
  const revalidator = useRevalidator();

  const methods = useRemixForm<CommentFormData>({
    resolver: commentResolver,
    defaultValues: { text: initialText, author: 'User' },
    fetcher,
    submitHandlers: {
      onValid: (data) => {
        fetcher.submit(createFormData(data), {
          method: 'put',
          action: `/api/comments/${commentId}`,
        });
      },
    },
  });

  const isSubmitting = fetcher.state === 'submitting';

  // Handle successful submission
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.success) {
      revalidator.revalidate();
      onSuccess();
    }
  }, [fetcher.state, fetcher.data, revalidator, onSuccess]);

  return (
    <RemixFormProvider {...methods}>
      <form onSubmit={methods.handleSubmit}>
        <Textarea name="text" rows={4} autoFocus />
        <FormError className="mt-2" />
        <div className="flex justify-end gap-2 mt-3">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? (
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
    </RemixFormProvider>
  );
}

/**
 * Comments component displays a list of task comments with markdown rendering.
 *
 * Features:
 * - Displays comments with timestamps and author (newest first)
 * - Add new comments using @lambdacurry/forms
 * - Edit existing comments with form validation
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

  const deleteFetcher = useFetcher<{ success?: boolean }>();
  const revalidator = useRevalidator();

  const isDeleting = deleteFetcher.state === 'submitting';

  // Reset delete state after successful delete
  useEffect(() => {
    if (deleteFetcher.state === 'idle' && deleteFetcher.data?.success) {
      setDeleteConfirmId(null);
      revalidator.revalidate();
    }
  }, [deleteFetcher.state, deleteFetcher.data, revalidator]);

  const handleDelete = (commentId: number) => {
    deleteFetcher.submit(null, {
      method: 'DELETE',
      action: `/api/comments/${commentId}`,
    });
  };

  const handleAddSuccess = useCallback(() => {
    setIsAddingComment(false);
  }, []);

  const handleEditSuccess = useCallback(() => {
    setEditingCommentId(null);
  }, []);

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
        <AddCommentForm
          taskId={taskId}
          onCancel={() => setIsAddingComment(false)}
          onSuccess={handleAddSuccess}
        />
      )}

      {/* Comments List (newest first - already sorted by API) */}
      {comments.length === 0 ? (
        <div className="text-sm text-muted-foreground italic">
          No comments yet. Comments will appear here when added to this task.
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-muted/50 rounded-lg p-4 border border-border">
              {editingCommentId === comment.id ? (
                /* Edit Mode */
                <EditCommentForm
                  commentId={comment.id}
                  initialText={comment.body}
                  onCancel={() => setEditingCommentId(null)}
                  onSuccess={handleEditSuccess}
                />
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
