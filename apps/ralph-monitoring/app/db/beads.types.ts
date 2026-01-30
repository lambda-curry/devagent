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
}

export interface BeadsComment {
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
}
