/**
 * Server-side epic activity feed: merges execution logs, comments, and task status
 * updates into a unified list ordered by timestamp (most recent first).
 */

import {
  getCommentsForEpicTasks,
  getExecutionLogs,
  getTasksByEpicId,
  type BeadsCommentWithTaskId
} from '~/db/beads.server';
import type {
  EpicActivityItem,
  EpicActivityComment,
  EpicActivityExecution,
  EpicActivityStatus,
  ParsedCommitComment
} from '~/db/beads.types';

/** Regex for first line "Commit: <sha> - <message>". Sha: non-whitespace; message: rest of line. */
const COMMIT_LINE_REGEX = /^Commit:\s+(\S+)\s+-\s+(.*)$/m;

/**
 * Parse a comment body for Beads commit format: first line "Commit: <sha> - <message>".
 * Returns structured { sha, message } if the first line matches; otherwise null.
 */
export function parseCommitComment(body: string): ParsedCommitComment | null {
  if (typeof body !== 'string' || body.trim() === '') return null;
  const match = body.trim().match(COMMIT_LINE_REGEX);
  if (!match) return null;
  return { sha: match[1], message: match[2].trim() };
}

/**
 * Build activity items from execution logs (handles missing table via getExecutionLogs returning []).
 */
function executionToItems(epicId: string, projectPathOrId?: string | null): EpicActivityExecution[] {
  const logs = getExecutionLogs(epicId, projectPathOrId);
  return logs.map(row => ({
    type: 'execution' as const,
    timestamp: row.started_at,
    task_id: row.task_id,
    agent_type: row.agent_type,
    started_at: row.started_at,
    ended_at: row.ended_at,
    status: row.status,
    iteration: row.iteration
  }));
}

/**
 * Build activity items from comments (with optional commit parsing). Handles missing
 * comments table via getCommentsForEpicTasks returning [].
 */
function commentsToItems(
  epicId: string,
  projectPathOrId?: string | null
): EpicActivityComment[] {
  const comments = getCommentsForEpicTasks(epicId, projectPathOrId);
  return comments.map((c: BeadsCommentWithTaskId) => {
    const commit = parseCommitComment(c.body);
    const item: EpicActivityComment = {
      type: 'comment',
      timestamp: c.created_at,
      task_id: c.issue_id,
      comment_id: c.id,
      author: c.author,
      body: c.body
    };
    if (commit) item.commit = commit;
    return item;
  });
}

/**
 * Build status activity items from task updated_at. One item per task using updated_at
 * as the timestamp (represents last status/field change).
 */
function tasksToStatusItems(
  epicId: string,
  projectPathOrId?: string | null
): EpicActivityStatus[] {
  const tasks = getTasksByEpicId(epicId, projectPathOrId);
  return tasks.map(t => ({
    type: 'status' as const,
    timestamp: t.updated_at,
    task_id: t.id,
    status: t.status,
    title: t.title
  }));
}

/**
 * Returns a unified list of activity items for an epic (execution, comment, status),
 * ordered by timestamp descending (most recent first). Handles missing execution log
 * table or comments gracefully (those sources contribute zero items).
 */
export function getEpicActivity(
  epicId: string,
  projectPathOrId?: string | null
): EpicActivityItem[] {
  const executions = executionToItems(epicId, projectPathOrId);
  const comments = commentsToItems(epicId, projectPathOrId);
  const statuses = tasksToStatusItems(epicId, projectPathOrId);

  const all: EpicActivityItem[] = [...executions, ...comments, ...statuses];
  all.sort((a, b) => {
    const ta = a.timestamp;
    const tb = b.timestamp;
    return tb.localeCompare(ta);
  });
  return all;
}
