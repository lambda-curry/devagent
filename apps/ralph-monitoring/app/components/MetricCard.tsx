import * as React from 'react';

import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { cn } from '~/lib/utils';

export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Card title / metric label (e.g. "Tasks complete") */
  title: string;
  /** Main value (e.g. "12", "2h 34m") */
  value: React.ReactNode;
  /** Optional subtitle or trend (e.g. "Last 7 days", "+3 from last run") */
  subtitle?: React.ReactNode;
  /** Optional icon or indicator */
  icon?: React.ReactNode;
}

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ title, value, subtitle, icon, className, ...props }, ref) => (
    <Card ref={ref} className={cn(className)} {...props}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-1">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon != null && (
          <span className="text-muted-foreground [&_svg]:size-4">{icon}</span>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
        {subtitle != null && (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  )
);

MetricCard.displayName = 'MetricCard';

export { MetricCard };
