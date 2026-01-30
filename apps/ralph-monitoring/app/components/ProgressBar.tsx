import * as React from 'react';

import { cn } from '~/lib/utils';

const PROGRESS_COLORS = {
  primary: 'bg-primary',
  muted: 'bg-muted-foreground',
  destructive: 'bg-destructive',
  secondary: 'bg-secondary',
  accent: 'bg-accent-foreground'
} as const;

export type ProgressBarColor = keyof typeof PROGRESS_COLORS;

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Value 0–100 */
  value: number;
  /** Optional label shown to the right (e.g. "75%") */
  label?: string;
  /** Bar fill color variant */
  color?: ProgressBarColor;
  /** Whether to animate width changes */
  showAnimation?: boolean;
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value,
      label,
      color = 'primary',
      showAnimation = false,
      className,
      ...props
    },
    ref
  ) => {
    const clamped = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
    const fillClass = PROGRESS_COLORS[color];

    return (
      <div
        ref={ref}
        className={cn('flex w-full items-center gap-2', className)}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? undefined}
        {...props}
      >
        <div className="relative flex h-2 w-full items-center overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              'h-full rounded-full',
              fillClass,
              showAnimation && 'transition-[width] duration-300 ease-in-out'
            )}
            style={{ width: `${clamped}%` }}
          />
        </div>
        {label != null && (
          <span className="shrink-0 truncate text-right text-sm text-muted-foreground">
            {label}
          </span>
        )}
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';

export { ProgressBar };
