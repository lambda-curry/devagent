import type * as React from 'react';

import { Card, CardContent } from '~/components/ui/card';
import { ProgressBar } from '~/components/ProgressBar';
import { cn } from '~/lib/utils';

export type LoopRunStatus = 'idle' | 'running' | 'paused' | 'stopped';

export interface LoopCardProps extends React.HTMLAttributes<HTMLButtonElement> {
  /** Epic/loop title */
  title: string;
  status: LoopRunStatus;
  /** e.g. 3 */
  completedCount: number;
  /** e.g. 11 */
  totalCount: number;
  /** Current task name (optional) */
  currentTaskName?: string;
  /** Relative time (e.g. "2m ago") */
  lastActivityLabel?: string;
}

const statusDotStyles: Record<LoopRunStatus, string> = {
  running: 'bg-primary animate-pulse',
  paused: 'bg-amber-500',
  idle: 'bg-muted-foreground/60',
  stopped: 'bg-muted-foreground/60'
};

function LoopCard({
  title,
  status,
  completedCount,
  totalCount,
  currentTaskName,
  lastActivityLabel,
  className,
  ...props
}: LoopCardProps) {
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const subtitle = [currentTaskName, lastActivityLabel].filter(Boolean).join(' · ') || undefined;

  return (
    <button
      type="button"
      className={cn(
        'w-full touch-manipulation text-left',
        'hover:bg-accent/50 active:opacity-[var(--active-opacity)]',
        'focus-visible:outline-none focus-visible:ring-[var(--focus-ring-width)] focus-visible:ring-ring focus-visible:ring-offset-[var(--focus-ring-offset)]',
        className
      )}
      {...props}
    >
      <Card className="border-border shadow-[var(--shadow-1)]">
        <CardContent className="flex min-h-[56px] flex-col justify-center gap-[var(--space-2)] p-[var(--space-4)]">
          <div className="flex items-center gap-[var(--space-2)]">
            <span
              className={cn(
                'size-2 shrink-0 rounded-full',
                statusDotStyles[status]
              )}
              aria-hidden
            />
            <h3 className="min-w-0 flex-1 truncate text-[length:var(--font-size-md)] font-medium text-foreground">
              {title}
            </h3>
          </div>
          <div className="flex items-center gap-[var(--space-3)]">
            <ProgressBar
              value={progress}
              label={`${completedCount}/${totalCount}`}
              className="min-w-0 flex-1"
              showAnimation
            />
          </div>
          {subtitle ? (
            <p className="text-[length:var(--font-size-xs)] text-muted-foreground">{subtitle}</p>
          ) : null}
        </CardContent>
      </Card>
    </button>
  );
}

LoopCard.displayName = 'LoopCard';

export { LoopCard };
