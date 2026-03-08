import type * as React from 'react';
import { Check, SkipForward, X } from 'lucide-react';

import { cn } from '~/lib/utils';

export type ActivityOutcome = 'done' | 'failed' | 'skipped';

export interface ActivityRowProps extends React.HTMLAttributes<HTMLButtonElement> {
  /** Relative time (e.g. "2m ago") */
  timeLabel: string;
  /** Task title (truncated on small screens) */
  taskTitle: string;
  outcome: ActivityOutcome;
}

const outcomeIcons: Record<ActivityOutcome, React.ReactNode> = {
  done: <Check className="size-4 shrink-0 text-primary" aria-hidden />,
  failed: <X className="size-4 shrink-0 text-destructive" aria-hidden />,
  skipped: <SkipForward className="size-4 shrink-0 text-muted-foreground" aria-hidden />
};

function ActivityRow({ timeLabel, taskTitle, outcome, className, ...props }: ActivityRowProps) {
  return (
    <button
      type="button"
      className={cn(
        'flex min-h-[48px] w-full touch-manipulation items-center gap-[var(--space-3)] border-b border-border px-[var(--space-4)] py-[var(--space-2)] text-left last:border-b-0',
        'hover:bg-accent/50 active:opacity-[var(--active-opacity)]',
        'focus-visible:outline-none focus-visible:ring-[var(--focus-ring-width)] focus-visible:ring-ring focus-visible:ring-offset-[var(--focus-ring-offset)]',
        className
      )}
      {...props}
    >
      <span className="w-12 shrink-0 text-[length:var(--font-size-xs)] text-muted-foreground">
        {timeLabel}
      </span>
      <span className="min-w-0 flex-1 truncate text-[length:var(--font-size-md)] text-foreground">
        {taskTitle}
      </span>
      <span className="shrink-0" aria-hidden>
        {outcomeIcons[outcome]}
      </span>
    </button>
  );
}

ActivityRow.displayName = 'ActivityRow';

export { ActivityRow };
