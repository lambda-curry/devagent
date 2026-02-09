import type * as React from 'react';

import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { cn } from '~/lib/utils';

export interface NowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current task or "what's running" title */
  title: string;
  /** Agent name (e.g. "Pixel Perfector") */
  agent?: string;
  /** Elapsed time (e.g. "2m 34s") */
  elapsed?: string;
  /** Primary CTA label (e.g. "Watch Live") */
  ctaLabel?: string;
  onCtaClick?: () => void;
}

function NowCard({
  title,
  agent,
  elapsed,
  ctaLabel = 'Watch Live',
  onCtaClick,
  className,
  ...props
}: NowCardProps) {
  const meta = [agent, elapsed].filter(Boolean).join(' · ');

  return (
    <Card
      className={cn(
        'shadow-[var(--shadow-2)]',
        'min-h-[var(--touch-target-min)]',
        className
      )}
      {...props}
    >
      <CardHeader className="pb-[var(--space-1)]">
        <h2 className="line-clamp-2 text-[length:var(--font-size-lg)] font-semibold leading-[var(--line-height-snug)] text-foreground">
          {title}
        </h2>
        {meta ? (
          <p className="text-[length:var(--font-size-sm)] text-muted-foreground">{meta}</p>
        ) : null}
      </CardHeader>
      {ctaLabel ? (
        <CardContent className="pt-0">
          <button
            type="button"
            onClick={onCtaClick}
            className={cn(
              'flex min-h-[var(--touch-target-min)] min-w-0 items-center justify-center rounded-lg bg-primary px-[var(--control-padding-x)] py-[var(--control-padding-y)]',
              'text-[length:var(--font-size-md)] font-medium text-primary-foreground',
              'hover:bg-primary/90 active:opacity-[var(--active-opacity)]',
              'focus-visible:outline-none focus-visible:ring-[var(--focus-ring-width)] focus-visible:ring-ring focus-visible:ring-offset-[var(--focus-ring-offset)]'
            )}
          >
            {ctaLabel}
          </button>
        </CardContent>
      ) : null}
    </Card>
  );
}

NowCard.displayName = 'NowCard';

export { NowCard };
