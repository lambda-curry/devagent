import { FileText } from 'lucide-react';
import { cn } from '~/lib/utils';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  hasFilters?: boolean;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon = FileText,
  hasFilters = false,
  className
}: EmptyStateProps) {
  const defaultTitle = hasFilters ? 'No tasks match your filters' : 'No tasks yet';

  const defaultDescription = hasFilters
    ? 'Try adjusting your filters or search terms to see more tasks.'
    : 'Tasks will appear here once Ralph starts executing work. Check back soon!';

  return (
    <div
      className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="mb-4 rounded-full bg-muted p-4" aria-hidden="true">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title || defaultTitle}</h3>
      <p className="text-sm text-muted-foreground max-w-md">{description || defaultDescription}</p>
    </div>
  );
}
