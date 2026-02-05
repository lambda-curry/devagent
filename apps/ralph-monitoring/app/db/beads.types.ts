export interface BeadsTask {
  id: string;
  title: string;
  description: string | null;
  design: string | null;
  acceptance_criteria: string | null;
  notes: string | null;
  status: 'open' | 'in_progress' | 'closed' | 'blocked';
  priority: string | null;
  parent_id: string | null; // Computed from hierarchical ID structure
  created_at: string;
  updated_at: string;
  /** From execution log: latest run started_at (ISO timestamp). */
  started_at?: string | null;
  /** From execution log: latest run ended_at (ISO timestamp). */
  ended_at?: string | null;
  /** From execution log: duration in ms (ended_at - started_at). Null if no run or run not ended. */
  duration_ms?: number | null;
  /** From execution log: path to the log file for the latest run. Null if no run or logging not enabled. */
  log_file_path?: string | null;
}

export interface BeadsComment {
  id: number;
  author: string;
  body: string;
  created_at: string;
}

/** Execution log row written by Ralph for each task run (start/end, agent, status). */
export interface RalphExecutionLog {
  task_id: string;
  agent_type: string;
  started_at: string;
  ended_at: string | null;
  status: 'running' | 'success' | 'failed';
  iteration: number;
  /** Path to the log file for this execution. Null if logging was not enabled. */
  log_file_path: string | null;
}

/** Epic list item: root-level issue (no parent) with task/completed counts and progress. */
export interface EpicSummary {
  id: string;
  title: string;
  status: BeadsTask['status'];
  task_count: number;
  completed_count: number;
  progress_pct: number;
  updated_at: string;
}

/** Task with optional agent_type from latest execution log (for epic detail). */
export interface EpicTask extends BeadsTask {
  agent_type: string | null;
}

/** Discriminated union for epic activity feed items (unified list). */
export type EpicActivityItem =
  | EpicActivityExecution
  | EpicActivityComment
  | EpicActivityStatus;

export interface EpicActivityExecution {
  type: 'execution';
  timestamp: string;
  task_id: string;
  agent_type: string;
  started_at: string;
  ended_at: string | null;
  status: 'running' | 'success' | 'failed';
  iteration: number;
}

/** Parsed commit comment: first line "Commit: <sha> - <message>". */
export interface ParsedCommitComment {
  sha: string;
  message: string;
}

export interface EpicActivityComment {
  type: 'comment';
  timestamp: string;
  task_id: string;
  comment_id: number;
  author: string;
  body: string;
  /** Set when body starts with "Commit: sha - message"; enables rich display. */
  commit?: ParsedCommitComment;
}

export interface EpicActivityStatus {
  type: 'status';
  timestamp: string;
  task_id: string;
  status: BeadsTask['status'];
  title: string;
}
