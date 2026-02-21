import { Link, href } from 'react-router';
import { useState, useId } from 'react';
import type { EpicTask } from '~/db/beads.types';
import { StepChip, type StepStatus } from '~/components/mobile-loop/StepChip';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '~/lib/utils';

export type StepStatusChip = 'pending' | 'running' | 'done' | 'failed' | 'skipped' | 'blocked';

export interface StepsListProps {
  tasks: EpicTask[];
  /** Optional: latest execution status per task (from execution log) to show failed/skipped */
  taskIdToLastStatus?: Record<string, 'success' | 'failed' | 'running'>;
  defaultCollapsed?: boolean;
  className?: string;
}

/** Map internal step status to StepChip status (blocked shown as failed). */
function toStepChipStatus(chip: StepStatusChip): StepStatus {
  if (chip === 'blocked') return 'failed';
  return chip as StepStatus;
}

function stepStatusChip(
  task: EpicTask,
  taskIdToLastStatus?: Record<string, 'success' | 'failed' | 'running'>
): StepStatusChip {
  const lastStatus = taskIdToLastStatus?.[task.id];
  if (task.status === 'in_progress') return 'running';
  if (task.status === 'blocked') return 'blocked';
  if (task.status === 'open') return 'pending';
  if (task.status === 'closed') {
    if (lastStatus === 'failed') return 'failed';
    return 'done';
  }
  return 'pending';
}

function stepStatusLabel(chip: StepStatusChip): string {
  switch (chip) {
    case 'pending':
      return 'Pending';
    case 'running':
      return 'Running';
    case 'done':
      return 'Done';
    case 'failed':
      return 'Failed';
    case 'skipped':
      return 'Skipped';
    case 'blocked':
      return 'Blocked';
    default:
      return chip;
  }
}

export function StepsList({
  tasks,
  taskIdToLastStatus,
  defaultCollapsed = true,
  className,
}: StepsListProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const contentId = useId();

  return (
    <section
      className={cn('border-t border-border pt-[var(--space-4)]', className)}
      aria-label="All steps"
      data-testid="steps-list"
    >
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className={cn(
          'flex min-h-[var(--space-12)] w-full touch-manipulation items-center gap-[var(--space-2)] py-[var(--space-2)] text-left',
          'hover:bg-accent/50 active:opacity-[var(--active-opacity)]',
          'focus-visible:outline-none focus-visible:ring-[var(--focus-ring-width)] focus-visible:ring-ring focus-visible:ring-offset-[var(--focus-ring-offset)]'
        )}
        aria-expanded={!collapsed}
        aria-controls={contentId}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        )}
        <h2 className="text-[length:var(--font-size-sm)] font-medium text-foreground">All Steps</h2>
        <span className="text-[length:var(--font-size-sm)] text-muted-foreground">({tasks.length})</span>
      </button>
      <section
        id={contentId}
        aria-label="Loop steps"
        hidden={collapsed}
        className={cn(collapsed && 'hidden')}
      >
        {!collapsed && tasks.length === 0 && (
          <p className="py-[var(--space-4)] text-[length:var(--font-size-sm)] text-muted-foreground">
            No steps in this epic yet
          </p>
        )}
        {!collapsed && tasks.length > 0 && (
          <ul className="divide-y divide-border pt-[var(--space-2)]">
            {tasks.map((task) => {
              const chip = stepStatusChip(task, taskIdToLastStatus);
              return (
                <li key={task.id}>
                  <Link
                    to={href('/tasks/:taskId', { taskId: task.id })}
                    prefetch="intent"
                    className={cn(
                      'flex min-h-[var(--space-12)] touch-manipulation items-center gap-[var(--space-3)] py-[var(--space-2)]',
                      'text-left text-[length:var(--font-size-sm)] hover:bg-accent/50 active:opacity-[var(--active-opacity)]',
                      'focus-visible:outline-none focus-visible:ring-[var(--focus-ring-width)] focus-visible:ring-ring focus-visible:ring-offset-[var(--focus-ring-offset)]'
                    )}
                  >
                    <StepChip status={toStepChipStatus(chip)} label={stepStatusLabel(chip)} className="shrink-0" />
                    <span className="min-w-0 flex-1 truncate text-foreground" title={task.title}>
                      {task.title}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </section>
  );
}
