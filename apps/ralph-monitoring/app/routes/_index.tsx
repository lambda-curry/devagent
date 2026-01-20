import { AlertCircle, CheckCircle2, Circle, PlayCircle, Search, Square, X } from 'lucide-react';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link, useFetcher, useNavigate, useNavigation, useRevalidator, useSearchParams } from 'react-router';
import type { Route } from './+types/_index';
import { EmptyState } from '~/components/EmptyState';
import { TaskCardSkeleton } from '~/components/TaskCardSkeleton';
import { ThemeToggle } from '~/components/ThemeToggle';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { type BeadsTask, getAllTasks, type TaskFilters } from '~/db/beads.server';
import { compareHierarchicalIds } from '~/db/hierarchical-id';

export async function loader({ request }: Route.LoaderArgs) {
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
  tasks.sort((a, b) => compareHierarchicalIds(a.id, b.id));

  const childrenByParentId = new Map<string, BeadsTask[]>();
  for (const task of tasks) {
    if (!task.parent_id) continue;
    const existingChildren = childrenByParentId.get(task.parent_id) ?? [];
    existingChildren.push(task);
    childrenByParentId.set(task.parent_id, existingChildren);
  }

  // Ensure epic child lists render in plan order too (numeric hierarchical ID ordering).
  for (const [, children] of childrenByParentId) {
    children.sort((a, b) => compareHierarchicalIds(a.id, b.id));
  }

  // PERFORMANCE: Comment counts removed from loader - they were causing N+1 CLI calls
  // Each task was spawning a separate `bd comments <task-id> --json` process via spawnSync
  // For 20 tasks, this would spawn 20 blocking CLI processes sequentially (~50-200ms each)
  // Comment counts are now omitted to dramatically improve list load time
  const tasksWithChildren: TaskWithChildren[] = tasks.map(task => ({
    ...task,
    children: childrenByParentId.get(task.id) ?? []
  }));

  return { tasks: tasksWithChildren, filters };
}

export const meta: Route.MetaFunction = () => [
  { title: 'Tasks - Ralph Monitoring' },
  { name: 'description', content: 'View and filter Ralph tasks' }
];

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

type WorkItemsMode = 'tasks' | 'epics';

const workItemsOptions: Array<{ value: WorkItemsMode; label: string }> = [
  { value: 'tasks', label: 'Tasks' },
  { value: 'epics', label: 'Epics' },
];

const closedToggleStorageKey = 'ralph-monitoring.closed-collapsed';
const workItemsStorageKey = 'ralph-monitoring.work-items';

function formatStatusLabel(status: BeadsTask['status'] | string) {
  switch (status) {
    case 'open':
      return 'Open';
    case 'in_progress':
      return 'In Progress';
    case 'closed':
      return 'Closed';
    case 'blocked':
      return 'Blocked';
    default:
      return status;
  }
}

interface TaskWithChildren extends BeadsTask {
  children: BeadsTask[];
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { tasks } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const revalidator = useRevalidator();
  const kanbanScrollerRef = useRef<HTMLElement | null>(null);
  const closedTasksId = useId();

  // Detect loading state (when navigating or revalidating) - React Router 7 feature
  const isLoading = navigation.state === 'loading' || navigation.state === 'submitting';

  // Get current filter values from URL
  const currentStatus = (searchParams.get('status') || 'all') as TaskFilters['status'];
  const currentPriority = searchParams.get('priority') || 'all';
  const currentSearch = searchParams.get('search') || '';

  // Keep SSR + first client render stable (avoid hydration mismatch), then sync from localStorage.
  const [arePreferencesBootstrapped, setArePreferencesBootstrapped] = useState(false);
  const [workItemsMode, setWorkItemsMode] = useState<WorkItemsMode>('tasks');
  const [isClosedCollapsed, setIsClosedCollapsed] = useState(true);

  useEffect(() => {
    const storedWorkItems = window.localStorage.getItem(workItemsStorageKey);
    if (storedWorkItems === 'epics' || storedWorkItems === 'tasks') setWorkItemsMode(storedWorkItems);

    const storedClosedCollapsed = window.localStorage.getItem(closedToggleStorageKey);
    setIsClosedCollapsed(storedClosedCollapsed === 'true' || storedClosedCollapsed === null);

    setArePreferencesBootstrapped(true);
  }, []);

  // Persist work items mode preference
  useEffect(() => {
    if (!arePreferencesBootstrapped) return;
    window.localStorage.setItem(workItemsStorageKey, workItemsMode);
  }, [arePreferencesBootstrapped, workItemsMode]);

  // Persist closed collapsed preference (only meaningful when status=all)
  useEffect(() => {
    if (!arePreferencesBootstrapped) return;
    window.localStorage.setItem(closedToggleStorageKey, String(isClosedCollapsed));
  }, [arePreferencesBootstrapped, isClosedCollapsed]);

  // Local state for search input (ephemeral UI state for debouncing)
  const [searchInput, setSearchInput] = useState(currentSearch);

  // Debounce search input and sync to URL (300ms)
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

  // Use ref to access revalidator.revalidate without causing effect re-runs
  // The revalidator object reference may change on renders, but we only need
  // the revalidate function which is stable
  const revalidateRef = useRef(revalidator.revalidate);
  revalidateRef.current = revalidator.revalidate;

  // Stable revalidate callback that doesn't change between renders
  const stableRevalidate = useCallback(() => {
    revalidateRef.current();
  }, []);

  // Derive whether there are active tasks - use primitive boolean instead of array
  // This prevents unnecessary effect re-runs when task data changes but active status doesn't
  const hasActiveTasks = useMemo(
    () => tasks.some(task => task.status === 'in_progress' || task.status === 'open'),
    [tasks]
  );

  // Automatic revalidation for real-time task updates
  // Poll every 5 seconds when there are active tasks (in_progress or open)
  // Only poll when page is visible to avoid unnecessary requests
  useEffect(() => {
    if (!hasActiveTasks) {
      return;
    }

    const handleVisibilityChange = () => {
      // Revalidate immediately when page becomes visible
      if (!document.hidden) {
        stableRevalidate();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Poll every 5 seconds when page is visible
    const interval = setInterval(() => {
      if (!document.hidden) {
        stableRevalidate();
      }
    }, 5000);

    // NOTE: Removed initial revalidation on mount - the loader already ran
    // during navigation, so immediate revalidation is redundant and causes
    // unnecessary re-renders

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hasActiveTasks, stableRevalidate]);

  // Get unique priorities from tasks
  const availablePriorities = useMemo(() => {
    const priorities = new Set<string>();
    tasks.forEach((task: BeadsTask) => {
      if (task.priority) {
        priorities.add(task.priority);
      }
    });
    return Array.from(priorities).sort();
  }, [tasks]);

  // Check if any filters are active
  const hasActiveFilters = currentStatus !== 'all' || currentPriority !== 'all' || currentSearch !== '';

  const visibleWorkItems = useMemo(() => {
    if (workItemsMode === 'tasks') {
      // Tasks view: leaf issues only (no epics, no nested child lists)
      return tasks.filter(task => task.children.length === 0);
    }
    // Epics view: parent issues only (show child list inline; children not rendered elsewhere)
    return tasks.filter(task => task.children.length > 0);
  }, [tasks, workItemsMode]);

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
    const grouped: Record<BeadsTask['status'], TaskWithChildren[]> = {
      in_progress: [],
      open: [],
      closed: [],
      blocked: []
    };

    for (const task of visibleWorkItems) {
      const status = task.status as BeadsTask['status'];
      // Only push if status is a valid key in grouped
      if (grouped[status]) {
        grouped[status].push(task);
      }
    }

    return grouped;
  }, [visibleWorkItems]);

  const isClosedForcedExpanded = currentStatus === 'closed';
  const isClosedExpanded = isClosedForcedExpanded || !isClosedCollapsed;
  const canToggleClosed = currentStatus === 'all';

  const handleKanbanKeyDown = useCallback((e: React.KeyboardEvent<HTMLElement>) => {
    const scroller = kanbanScrollerRef.current;
    if (!scroller) return;

    const scrollBy = Math.max(240, Math.floor(scroller.clientWidth * 0.8));

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        scroller.scrollBy({ left: -scrollBy, behavior: 'smooth' });
        break;
      case 'ArrowRight':
        e.preventDefault();
        scroller.scrollBy({ left: scrollBy, behavior: 'smooth' });
        break;
      case 'Home':
        e.preventDefault();
        scroller.scrollTo({ left: 0, behavior: 'smooth' });
        break;
      case 'End':
        e.preventDefault();
        scroller.scrollTo({ left: scroller.scrollWidth, behavior: 'smooth' });
        break;
      default:
        break;
    }
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Ralph Monitoring</h1>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link to="/arcade" prefetch="intent">
                Arcade
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Work Items Toggle */}
            <div className="flex-1 sm:flex-initial sm:w-48">
              <Select
                value={workItemsMode}
                onValueChange={value => setWorkItemsMode(value as WorkItemsMode)}
              >
                <SelectTrigger aria-label="Work items">
                  <SelectValue placeholder="Work items" />
                </SelectTrigger>
                <SelectContent>
                  {workItemsOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
            {['skeleton-1', 'skeleton-2', 'skeleton-3', 'skeleton-4'].map((key) => (
              <TaskCardSkeleton key={key} />
            ))}
          </div>
        ) : visibleWorkItems.length === 0 ? (
          <EmptyState hasFilters={hasActiveFilters} icon={hasActiveFilters ? Search : undefined} />
        ) : (
          <section
            ref={kanbanScrollerRef}
            className="overflow-x-auto"
            aria-label="Task board columns"
            // biome-ignore lint/a11y/noNoninteractiveTabindex: scroller is intentionally focusable for keyboard horizontal scrolling
            tabIndex={0}
            onKeyDown={handleKanbanKeyDown}
            onFocusCapture={(e) => {
              const scroller = kanbanScrollerRef.current;
              const target = e.target as HTMLElement | null;
              if (!scroller || !target || !scroller.contains(target)) return;

              const scrollerRect = scroller.getBoundingClientRect();
              const targetRect = target.getBoundingClientRect();
              const padding = 8;

              const isOutOfView =
                targetRect.left < scrollerRect.left + padding ||
                targetRect.right > scrollerRect.right - padding;

              if (isOutOfView) target.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            }}
          >
            <div className="flex flex-nowrap gap-6 pb-2">
              {/* In Progress Column */}
              {tasksByStatus.in_progress.length > 0 && (
                <section className="space-y-4 flex-shrink-0 min-w-[320px] sm:min-w-[360px] lg:min-w-[420px]">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <PlayCircle className="w-5 h-5 text-blue-500" />
                      <h2 className="text-xl font-semibold">In Progress</h2>
                      <span className="text-sm text-muted-foreground">({tasksByStatus.in_progress.length})</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {tasksByStatus.in_progress.map(task => (
                      <TaskCard key={task.id} task={task} onRevalidate={stableRevalidate} />
                    ))}
                  </div>
                </section>
              )}

              {/* Open Column */}
              {tasksByStatus.open.length > 0 && (
                <section className="space-y-4 flex-shrink-0 min-w-[320px] sm:min-w-[360px] lg:min-w-[420px]">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Circle className="w-5 h-5 text-gray-500" />
                      <h2 className="text-xl font-semibold">Open</h2>
                      <span className="text-sm text-muted-foreground">({tasksByStatus.open.length})</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {tasksByStatus.open.map(task => (
                      <TaskCard key={task.id} task={task} onRevalidate={stableRevalidate} />
                    ))}
                  </div>
                </section>
              )}

              {/* Blocked Column */}
              {tasksByStatus.blocked.length > 0 && (
                <section className="space-y-4 flex-shrink-0 min-w-[320px] sm:min-w-[360px] lg:min-w-[420px]">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <h2 className="text-xl font-semibold">Blocked</h2>
                      <span className="text-sm text-muted-foreground">({tasksByStatus.blocked.length})</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {tasksByStatus.blocked.map(task => (
                      <TaskCard key={task.id} task={task} onRevalidate={stableRevalidate} />
                    ))}
                  </div>
                </section>
              )}

              {/* Closed Column */}
              {tasksByStatus.closed.length > 0 && (
                <section className="space-y-4 flex-shrink-0 min-w-[320px] sm:min-w-[360px] lg:min-w-[420px]">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <h2 className="text-xl font-semibold">Closed</h2>
                      <span className="text-sm text-muted-foreground">({tasksByStatus.closed.length})</span>
                    </div>

                    {canToggleClosed && !isClosedForcedExpanded && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-expanded={isClosedExpanded}
                        aria-controls={closedTasksId}
                        aria-label={isClosedExpanded ? 'Hide closed tasks' : 'Show closed tasks'}
                        onClick={() => setIsClosedCollapsed(prev => !prev)}
                      >
                        {isClosedExpanded ? 'Hide closed' : 'Show closed'}
                      </Button>
                    )}
                  </div>

                  {isClosedExpanded && (
                    <div className="space-y-3" id={closedTasksId}>
                      {tasksByStatus.closed.map(task => (
                        <TaskCard key={task.id} task={task} onRevalidate={stableRevalidate} />
                      ))}
                    </div>
                  )}
                </section>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

interface TaskCardProps {
  task: TaskWithChildren;
  onRevalidate: () => void;
}

function TaskCard({ task, onRevalidate }: TaskCardProps) {
  const StatusIcon = statusIcons[task.status as keyof typeof statusIcons] || Circle;
  const statusColor = statusColors[task.status as keyof typeof statusColors] || 'text-gray-500';
  const isInProgress = task.status === 'in_progress';
  const isDone = task.status === 'closed';
  const fetcher = useFetcher();
  const isStopping = fetcher.state === 'submitting' || fetcher.state === 'loading';

  // Derive success state from fetcher data (no dependencies that change frequently)
  const stopSuccess = (fetcher.data as { success?: boolean } | undefined)?.success;

  // Revalidate after successful stop
  useEffect(() => {
    if (stopSuccess) {
      const timer = setTimeout(() => {
        onRevalidate();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [stopSuccess, onRevalidate]);

  const handleStop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isInProgress || isStopping) return;

    fetcher.submit(
      new FormData(),
      {
        method: 'POST',
        encType: 'multipart/form-data',
        action: `/api/tasks/${task.id}/stop`
      }
    );
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

  const getStatusLabel = () => formatStatusLabel(task.status);

  return (
    <Card className="group relative w-full max-w-[420px] overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/50 hover:-translate-y-0.5 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
      <CardContent className="p-5">
        <Link
          to={`/tasks/${task.id}`}
          prefetch="intent"
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
                <p className="text-sm text-muted-foreground line-clamp-2 break-words leading-relaxed">{task.description}</p>
              )}

              <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 min-w-0">
                <span className="flex-1 font-mono truncate min-w-0" title={task.id}>
                  ID: {task.id}
                </span>
                {task.priority && (
                  <Badge variant="outline" className="text-xs font-normal">
                    {task.priority}
                  </Badge>
                )}
                {task.parent_id === null && task.children.length > 0 && (
                  <Badge variant="outline" className="text-xs font-normal">
                    Epic
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Link>

        {/* Epic Children Display */}
        {task.children.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-muted-foreground">
                Sub-issues ({task.children.length})
              </span>
            </div>
            <div className="space-y-2">
              {task.children.map(child => {
                const ChildStatusIcon = statusIcons[child.status as keyof typeof statusIcons] || Circle;
                const childStatusColor = statusColors[child.status as keyof typeof statusColors] || 'text-gray-500';
                return (
                  <Link
                    key={child.id}
                    to={`/tasks/${child.id}`}
                    prefetch="intent"
                    className="block p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <ChildStatusIcon className={`w-3 h-3 ${childStatusColor}`} />
                      <span className="font-medium truncate">{child.title}</span>
                      <Badge variant="outline" className="text-xs ml-auto">
                        {formatStatusLabel(child.status)}
                      </Badge>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {isInProgress && (
          <div
            className="absolute top-3 right-3 flex items-center gap-2 transition-all duration-200 opacity-0 -translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto"
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleStop}
              disabled={isStopping}
              aria-label="Stop task"
              tabIndex={0}
            >
              <Square className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
