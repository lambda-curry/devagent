import { AlertCircle, CheckCircle2, Circle, Eye, PlayCircle, Search, Square, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  Link,
  useFetcher,
  useLoaderData,
  useNavigate,
  useNavigation,
  useRevalidator,
  useSearchParams
} from 'react-router';
import { EmptyState } from '~/components/EmptyState';
import { TaskCardSkeleton } from '~/components/TaskCardSkeleton';
import { ThemeToggle } from '~/components/ThemeToggle';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { type BeadsTask, getAllTasks, type TaskFilters } from '~/db/beads.server';

export const loader = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  const status = (url.searchParams.get('status') || 'all') as TaskFilters['status'];
  const priority = url.searchParams.get('priority') || undefined;
  const search = url.searchParams.get('search') || undefined;

  const filters: TaskFilters = {
    status: status === 'all' ? undefined : status,
    priority,
    search
  };

  const tasks = getAllTasks(filters);
  return { tasks, filters };
};

export const meta = () => {
  return [{ title: 'Tasks - Ralph Monitoring' }, { name: 'description', content: 'View and filter Ralph tasks' }];
};

const statusIcons = {
  open: Circle,
  in_progress: PlayCircle,
  closed: CheckCircle2,
  blocked: AlertCircle
};

const statusColors = {
  open: 'text-gray-500',
  in_progress: 'text-blue-500',
  closed: 'text-green-500',
  blocked: 'text-red-500'
};

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'closed', label: 'Closed' },
  { value: 'blocked', label: 'Blocked' }
];

export default function Index() {
  const { tasks } = useLoaderData<{ tasks: BeadsTask[]; filters: TaskFilters }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const navigation = useNavigation();

  // Detect loading state (when navigating or revalidating)
  const isLoading = navigation.state === 'loading' || navigation.state === 'submitting';

  // Get current filter values from URL
  const currentStatus = (searchParams.get('status') || 'all') as TaskFilters['status'];
  const currentPriority = searchParams.get('priority') || 'all';
  const currentSearch = searchParams.get('search') || '';

  // Local state for search input (for debouncing)
  const [searchInput, setSearchInput] = useState(currentSearch);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== currentSearch) {
        const newParams = new URLSearchParams(searchParams);
        if (searchInput.trim()) {
          newParams.set('search', searchInput.trim());
        } else {
          newParams.delete('search');
        }
        setSearchParams(newParams, { replace: true });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, currentSearch, searchParams, setSearchParams]);

  // Sync search input with URL when it changes externally
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  // Get unique priorities from tasks
  const availablePriorities = useMemo(() => {
    const priorities = new Set<string>();
    tasks.forEach(task => {
      if (task.priority) {
        priorities.add(task.priority);
      }
    });
    return Array.from(priorities).sort();
  }, [tasks]);

  // Check if any filters are active
  const hasActiveFilters = currentStatus !== 'all' || currentPriority !== 'all' || currentSearch !== '';

  // Handle status change
  const handleStatusChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'all') {
      newParams.delete('status');
    } else {
      newParams.set('status', value);
    }
    setSearchParams(newParams);
  };

  // Handle priority change
  const handlePriorityChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'all') {
      newParams.delete('priority');
    } else {
      newParams.set('priority', value);
    }
    setSearchParams(newParams);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchInput('');
    navigate('/', { replace: true });
  };

  // Group tasks by status for display
  const tasksByStatus = useMemo(() => {
    const grouped: Record<string, BeadsTask[]> = {
      in_progress: [],
      open: [],
      closed: [],
      blocked: []
    };

    tasks.forEach(task => {
      if (task.status in grouped) {
        grouped[task.status].push(task);
      }
    });

    return grouped;
  }, [tasks]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Ralph Monitoring</h1>
          <ThemeToggle />
        </div>

        {/* Filter Controls */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex-1 sm:flex-initial sm:w-48">
              <Select value={currentStatus} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority Filter */}
            <div className="flex-1 sm:flex-initial sm:w-48">
              <Select value={currentPriority || 'all'} onValueChange={handlePriorityChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {availablePriorities.map(priority => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search tasks..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button variant="outline" onClick={handleClearFilters} className="sm:w-auto">
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Task List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Loading Skeletons - Show 4 skeletons to match typical layout */}
            {/* biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton loaders don't reorder */}
            {Array.from({ length: 4 }, (_, index) => (
              <TaskCardSkeleton key={`skeleton-loading-${index}`} />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState hasFilters={hasActiveFilters} icon={hasActiveFilters ? Search : undefined} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* In Progress Column */}
            {tasksByStatus.in_progress.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <PlayCircle className="w-5 h-5 text-blue-500" />
                  <h2 className="text-xl font-semibold">In Progress</h2>
                  <span className="text-sm text-muted-foreground">({tasksByStatus.in_progress.length})</span>
                </div>

                <div className="space-y-3">
                  {tasksByStatus.in_progress.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}

            {/* Open Column */}
            {tasksByStatus.open.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Circle className="w-5 h-5 text-gray-500" />
                  <h2 className="text-xl font-semibold">Open</h2>
                  <span className="text-sm text-muted-foreground">({tasksByStatus.open.length})</span>
                </div>

                <div className="space-y-3">
                  {tasksByStatus.open.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}

            {/* Closed Column */}
            {tasksByStatus.closed.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <h2 className="text-xl font-semibold">Closed</h2>
                  <span className="text-sm text-muted-foreground">({tasksByStatus.closed.length})</span>
                </div>

                <div className="space-y-3">
                  {tasksByStatus.closed.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}

            {/* Blocked Column */}
            {tasksByStatus.blocked.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <h2 className="text-xl font-semibold">Blocked</h2>
                  <span className="text-sm text-muted-foreground">({tasksByStatus.blocked.length})</span>
                </div>

                <div className="space-y-3">
                  {tasksByStatus.blocked.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TaskCard({ task }: { task: BeadsTask }) {
  const StatusIcon = statusIcons[task.status as keyof typeof statusIcons] || Circle;
  const statusColor = statusColors[task.status as keyof typeof statusColors] || 'text-gray-500';
  const isInProgress = task.status === 'in_progress';
  const isDone = task.status === 'closed';
  const fetcher = useFetcher();
  const revalidator = useRevalidator();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const isStopping = fetcher.state === 'submitting' || fetcher.state === 'loading';

  // Revalidate after successful stop
  useEffect(() => {
    if (fetcher.data) {
      const result = fetcher.data as { success: boolean; message: string };
      if (result.success) {
        setTimeout(() => {
          revalidator.revalidate();
        }, 500);
      }
    }
  }, [fetcher.data, revalidator]);

  const handleStop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isInProgress || isStopping) return;

    fetcher.submit(
      {},
      {
        method: 'POST',
        action: `/api/tasks/${task.id}/stop`
      }
    );
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/tasks/${task.id}`);
  };

  const getStatusBadgeVariant = () => {
    switch (task.status) {
      case 'closed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'blocked':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = () => {
    switch (task.status) {
      case 'open':
        return 'Open';
      case 'in_progress':
        return 'In Progress';
      case 'closed':
        return 'Closed';
      case 'blocked':
        return 'Blocked';
      default:
        return task.status;
    }
  };

  return (
    <Card
      className="group relative transition-all duration-200 hover:shadow-md hover:border-primary/50 hover:-translate-y-0.5 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      <CardContent className="p-5">
        <Link
          to={`/tasks/${task.id}`}
          className="block focus:outline-none"
          tabIndex={0}
          aria-label={`View details for task: ${task.title}`}
        >
          <div className="flex items-start gap-4">
            {/* Status Icon with Animation */}
            <div className="flex-shrink-0 mt-0.5">
              {isInProgress ? (
                <div className="relative">
                  <PlayCircle className={`w-5 h-5 ${statusColor} animate-pulse`} aria-hidden="true" />
                  <span
                    className="absolute inset-0 w-5 h-5 rounded-full bg-blue-500/20 animate-ping"
                    aria-hidden="true"
                  />
                </div>
              ) : isDone ? (
                <div className="relative">
                  <CheckCircle2
                    className={`w-5 h-5 ${statusColor} animate-[checkmark-pulse_2s_ease-in-out_infinite]`}
                    aria-hidden="true"
                  />
                </div>
              ) : (
                <StatusIcon className={`w-5 h-5 ${statusColor}`} aria-hidden="true" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-foreground truncate text-base leading-tight">{task.title}</h3>
                <Badge variant={getStatusBadgeVariant()} className="flex-shrink-0 text-xs">
                  {getStatusLabel()}
                </Badge>
              </div>

              {task.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{task.description}</p>
              )}

              <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                <span className="font-mono">ID: {task.id}</span>
                {task.priority && (
                  <Badge variant="outline" className="text-xs font-normal">
                    {task.priority}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Link>

        {/* Quick Action Buttons - Appear on Hover */}
        {/* biome-ignore lint/a11y/useSemanticElements: Container div for button group is appropriate */}
        <div
          className={`absolute top-3 right-3 flex items-center gap-2 transition-all duration-200 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
          }`}
          role="group"
          aria-label="Task actions"
          onMouseDown={e => e.preventDefault()}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleViewDetails}
            aria-label="View task details"
            tabIndex={isHovered ? 0 : -1}
          >
            <Eye className="w-4 h-4" />
          </Button>
          {isInProgress && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleStop}
              disabled={isStopping}
              aria-label="Stop task"
              tabIndex={isHovered ? 0 : -1}
            >
              <Square className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
