import { Link, href } from 'react-router';
import { useMemo, useState, useId } from 'react';
import { ExternalLink, FileText } from 'lucide-react';
import { LogViewer } from '~/components/LogViewer';
import { EmptyState } from '~/components/EmptyState';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import type { EpicTask } from '~/db/beads.types';

export interface TaskLogInfo {
  hasLogs: boolean;
  hasExecutionHistory: boolean;
}

export interface EpicLogPanelProps {
  /** Epic tasks (ordered by status then updated_at). */
  tasks: EpicTask[];
  /** Per-task log availability from loader. */
  taskLogInfo: Record<string, TaskLogInfo>;
  /** Optional project id for LogViewer API (e.g. for multi-project). */
  projectId?: string;
}

/**
 * Picks the default task ID for the log panel: prefer in_progress, else first task.
 * Pure function for stable defaults and testing.
 */
export function getDefaultLogPanelTaskId(tasks: EpicTask[]): string | null {
  if (tasks.length === 0) return null;
  const inProgress = tasks.find((t) => t.status === 'in_progress');
  return inProgress ? inProgress.id : tasks[0].id;
}

export function EpicLogPanel({ tasks, taskLogInfo, projectId }: EpicLogPanelProps) {
  const defaultId = useMemo(() => getDefaultLogPanelTaskId(tasks), [tasks]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(defaultId);
  const selectId = useId();

  // Keep selection in sync when default changes (e.g. revalidation) or ensure valid selection
  const effectiveTaskId =
    selectedTaskId && tasks.some((t) => t.id === selectedTaskId) ? selectedTaskId : defaultId;
  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === effectiveTaskId) ?? null,
    [tasks, effectiveTaskId]
  );

  const info = effectiveTaskId ? taskLogInfo[effectiveTaskId] : undefined;
  const hasLogs = info?.hasLogs ?? false;
  const hasExecutionHistory = info?.hasExecutionHistory ?? false;
  const isTaskActive = selectedTask?.status === 'in_progress' || selectedTask?.status === 'open';

  if (tasks.length === 0) {
    return (
      <section className="mt-[var(--space-6)]" aria-label="Task logs">
        <h2 className="text-base font-medium text-foreground mb-[var(--space-3)]">Task logs</h2>
        <EmptyState
          variant="inline"
          title="No tasks in this epic"
          description="Task logs will appear here when the epic has subtasks."
          icon={FileText}
        />
      </section>
    );
  }

  return (
    <section className="mt-[var(--space-6)] space-y-[var(--space-3)]" aria-label="Task logs">
      <div className="flex flex-wrap items-center gap-[var(--space-3)]">
        <h2 className="text-base font-medium text-foreground">Task logs</h2>
        <div className="flex items-center gap-2">
          <label htmlFor={selectId} className="text-sm text-muted-foreground sr-only">
            Select task to view logs
          </label>
          <Select
            value={effectiveTaskId ?? ''}
            onValueChange={(value) => setSelectedTaskId(value || null)}
          >
            <SelectTrigger id={selectId} className="w-[280px] max-w-full">
              <SelectValue placeholder="Select a task" />
            </SelectTrigger>
            <SelectContent>
              {tasks.map((task) => (
                <SelectItem key={task.id} value={task.id}>
                  <span className="truncate block">
                    {task.title}
                    {task.status === 'in_progress' ? ' (in progress)' : ''}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {effectiveTaskId ? (
            <Link
              to={href('/tasks/:taskId', { taskId: effectiveTaskId })}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              View task
            </Link>
          ) : null}
        </div>
      </div>
      {effectiveTaskId && selectedTask ? (
        <LogViewer
          taskId={effectiveTaskId}
          projectId={projectId}
          isTaskActive={isTaskActive}
          hasLogs={hasLogs}
          hasExecutionHistory={hasExecutionHistory}
        />
      ) : (
        <EmptyState
          variant="inline"
          title="No task selected"
          description="Select a task above to view its logs."
          icon={FileText}
        />
      )}
    </section>
  );
}
