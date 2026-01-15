import { Card, CardContent } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';
import { cn } from '~/lib/utils';

interface TaskCardSkeletonProps {
  className?: string;
}

export function TaskCardSkeleton({ className }: TaskCardSkeletonProps) {
  return (
    <Card className={cn('transition-all duration-200', className)} aria-label="Loading task" aria-busy="true">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Status Icon Skeleton */}
          <div className="flex-shrink-0 mt-0.5">
            <Skeleton className="w-5 h-5 rounded-full" />
          </div>

          {/* Content Skeleton */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-3">
              {/* Title Skeleton */}
              <Skeleton className="h-5 w-3/4" />
              {/* Badge Skeleton */}
              <Skeleton className="h-5 w-16 rounded-full flex-shrink-0" />
            </div>

            {/* Description Skeleton */}
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>

            {/* Metadata Skeleton */}
            <div className="flex items-center gap-3 pt-1">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3.5 w-12 rounded-full" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
