import { FileText } from 'lucide-react';
import { cn } from '~/lib/utils';
import { Card, CardContent } from '~/components/ui/card';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  hasFilters?: boolean;
  variant?: 'card' | 'inline';
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon = FileText,
  hasFilters = false,
  variant = 'card',
  className
}: EmptyStateProps) {
  const defaultTitle = hasFilters ? 'No tasks match your filters' : 'No tasks yet';

  const defaultDescription = hasFilters
    ? 'Try adjusting your filters or search terms to see more tasks.'
    : 'Tasks will appear here once Ralph starts executing work. Check back soon!';

  const content = (
    <>
      <div className="mb-[var(--space-4)] rounded-full bg-surface p-[var(--space-4)]" aria-hidden="true">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-[var(--space-2)]">{title || defaultTitle}</h3>
      <p className="text-sm text-muted-foreground max-w-md">{description || defaultDescription}</p>
    </>
  );

  if (variant === 'inline') {
    return (
      <output
        className={cn('flex flex-col items-center justify-center text-center py-[var(--space-12)] px-[var(--space-4)]', className)}
        aria-live="polite"
        aria-atomic="true"
      >
        {content}
      </output>
    );
  }

  return (
    <Card className={cn('shadow-none', className)} aria-live="polite" aria-atomic="true">
      <CardContent className="flex flex-col items-center justify-center text-center py-[var(--space-12)]">
        {content}
      </CardContent>
    </Card>
  );
}
