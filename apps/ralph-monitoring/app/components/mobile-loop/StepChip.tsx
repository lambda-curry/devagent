import type * as React from 'react';

import { cn } from '~/lib/utils';

export type StepStatus = 'pending' | 'running' | 'done' | 'failed' | 'skipped';

export interface StepChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StepStatus;
  label: string;
}

const statusStyles: Record<StepStatus, string> = {
  pending: 'border-border bg-muted/50 text-muted-foreground',
  running:
    'border-primary bg-primary/15 text-primary animate-pulse motion-reduce:animate-none',
  done: 'border-transparent bg-primary/20 text-foreground',
  failed: 'border-transparent bg-destructive/20 text-destructive',
  skipped: 'border-border bg-muted/50 text-muted-foreground'
};

function StepChip({ status, label, className, ...props }: StepChipProps) {
  return (
    <span
      className={cn(
        'inline-flex min-h-[var(--touch-target-min)] min-w-0 items-center gap-[var(--space-1-5)] rounded-full border px-[var(--space-2)] py-[var(--space-1)] text-[length:var(--font-size-xs)] font-medium',
        statusStyles[status],
        className
      )}
      {...props}
    >
      <span className="shrink-0 truncate" title={label}>
        {label}
      </span>
    </span>
  );
}

StepChip.displayName = 'StepChip';

export { StepChip };
