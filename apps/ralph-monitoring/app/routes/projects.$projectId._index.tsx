import { AlertCircle, CheckCircle2, Circle, PlayCircle, Search, Square, X } from 'lucide-react';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link, href, useFetcher, useNavigate, useNavigation, useRevalidator, useSearchParams } from 'react-router';
import type { Route } from './+types/projects.$projectId._index';
import { EmptyState } from '~/components/EmptyState';
import { TaskCardSkeleton } from '~/components/TaskCardSkeleton';
import { ThemeToggle } from '~/components/ThemeToggle';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import type { BeadsTask } from '~/db/beads.types';
import { getAllTasks, type TaskFilters } from '~/db/beads.server';
import { getProjectList } from '~/lib/projects.server';
import { formatDurationMs } from '~/lib/utils';
import { compareHierarchicalIds } from '~/db/hierarchical-id';

export async function loader({ params, request }: Route.LoaderArgs) {
  const projectId = params.projectId ?? 'combined';
  const url = new URL(request.url);
  const status = (url.searchParams.get('status') || 'all') as TaskFilters['status'];
  const priority = url.searchParams.get('priority') || undefined;
  const search = url.searchParams.get('search') || undefined;

  const filters: TaskFilters = {
    status: status === 'all' ? undefined : status,
    priority,
    search
  };

  let tasks: (BeadsTask & { projectId: string })[];
  const viewMode: 'combined' | 'single' = projectId === 'combined' ? 'combined' : 'single';

  if (projectId === 'combined') {
    const projects = getProjectList().filter((p) => p.valid);
    const all: (BeadsTask & { projectId: string })[] = [];
    for (const project of projects) {
      const projectTasks = getAllTasks(filters, project.id);
      for (const task of projectTasks) {
        all.push({ ...task, projectId: project.id });
      }
    }
    all.sort((a, b) => {
      const idCmp = compareHierarchicalIds(a.id, b.id);
      return idCmp !== 0 ? idCmp : a.projectId.localeCompare(b.projectId);
    });
    tasks = all;
  } else {
    const projectTasks = getAllTasks(filters, projectId);
    tasks = projectTasks.map((t) => ({ ...t, projectId }));
  }

  const childrenByParentKey = new Map<string, (BeadsTask & { projectId: string })[]>();
  for (const task of tasks) {
    if (!task.parent_id) continue;
    const key = `${task.projectId}:${task.parent_id}`;
    const existing = childrenByParentKey.get(key) ?? [];
    existing.push(task);
    childrenByParentKey.set(key, existing);
  }
  for (const children of childrenByParentKey.values()) {
    children.sort((a, b) => compareHierarchicalIds(a.id, b.id));
  }

  const tasksWithChildren: TaskWithChildren[] = tasks.map((task) => ({
    ...task,
    children: childrenByParentKey.get(`${task.projectId}:${task.id}`) ?? []
  }));

  const projects = getProjectList();
  return { tasks: tasksWithChildren, filters, projectId, viewMode, projects };
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
  open: 'text-muted-foreground',
  in_progress: 'text-primary',
  closed: 'text-muted-foreground',
  blocked: 'text-destructive'
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
  { value: 'epics', label: 'Epics' }
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
  projectId: string;
  children: (BeadsTask & { projectId: string })[];
}

export default function ProjectsIndex({ loaderData }: Route.ComponentProps) {
  const { tasks, projectId, viewMode, projects } = loaderData;
  const getProjectLabel = (id: string) => projects.find((p) => p.id === id)?.label ?? id;
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const revalidator = useRevalidator();
  const kanbanScrollerRef = useRef<HTMLElement | null>(null);
  const closedTasksId = useId();

  const isLoading = navigation.state === 'loading' || navigation.state === 'submitting';

  const currentStatus = (searchParams.get('status') || 'all') as TaskFilters['status'];
  const currentPriority = searchParams.get('priority') || 'all';
  const currentSearch = searchParams.get('search') || '';

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

  useEffect(() => {
    if (!arePreferencesBootstrapped) return;
    window.localStorage.setItem(workItemsStorageKey, workItemsMode);
  }, [arePreferencesBootstrapped, workItemsMode]);

  useEffect(() => {
    if (!arePreferencesBootstrapped) return;
    window.localStorage.setItem(closedToggleStorageKey, String(isClosedCollapsed));
  }, [arePreferencesBootstrapped, isClosedCollapsed]);

  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== currentSearch) {
        const newParams = new URLSearchParams(searchParams);
        if (searchInput.trim()) newParams.set('search', searchInput.trim());
        else newParams.delete('search');
        setSearchParams(newParams, { replace: true });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, currentSearch, searchParams, setSearchParams]);

  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  const revalidateRef = useRef(revalidator.revalidate);
  revalidateRef.current = revalidator.revalidate;
  const stableRevalidate = useCallback(() => {
    revalidateRef.current();
  }, []);

  const hasActiveTasks = useMemo(
    () => tasks.some((task) => task.status === 'in_progress' || task.status === 'open'),
    [tasks]
  );

  useEffect(() => {
    if (!hasActiveTasks) return;
    const handleVisibilityChange = () => {
      if (!document.hidden) stableRevalidate();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    const interval = setInterval(() => {
      if (!document.hidden) stableRevalidate();
    }, 5000);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hasActiveTasks, stableRevalidate]);

  const availablePriorities = useMemo(() => {
    const priorities = new Set<string>();
    tasks.forEach((task: BeadsTask) => {
      if (task.priority) priorities.add(task.priority);
    });
    return Array.from(priorities).sort();
  }, [tasks]);

  const hasActiveFilters = currentStatus !== 'all' || currentPriority !== 'all' || currentSearch !== '';

  const visibleWorkItems = useMemo(() => {
    if (workItemsMode === 'tasks') {
      return tasks.filter((task) => task.children.length === 0);
    }
    return tasks.filter((task) => task.children.length > 0);
  }, [tasks, workItemsMode]);

  const handleStatusChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'all') newParams.delete('status');
    else newParams.set('status', value);
    setSearchParams(newParams);
  };

  const handlePriorityChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'all') newParams.delete('priority');
    else newParams.set('priority', value);
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    navigate(href('/projects/:projectId', { projectId }), { replace: true });
  };

  const tasksByStatus = useMemo(() => {
    const grouped: Record<BeadsTask['status'], TaskWithChildren[]> = {
      in_progress: [],
      open: [],
      closed: [],
      blocked: []
    };
    for (const task of visibleWorkItems) {
      const status = task.status as BeadsTask['status'];
      if (grouped[status]) grouped[status].push(task);
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
    <div className="min-h-dvh bg-background">
      <div className="mx-auto w-full max-w-7xl p-[var(--space-6)]">
        <div className="flex items-center justify-between mb-[var(--space-6)]">
          <h1 className="text-2xl font-semibold tracking-tight">Ralph Monitoring</h1>
          <ThemeToggle />
        </div>

        <Card className="mb-[var(--space-6)]">
          <CardContent className="pt-[var(--space-4)]">
            <div className="flex flex-col sm:flex-row gap-[var(--space-4)]">
              <div className="flex-1 sm:flex-initial sm:w-48">
                <Select value={workItemsMode} onValueChange={(value) => setWorkItemsMode(value as WorkItemsMode)}>
                  <SelectTrigger aria-label="Work items">
                    <SelectValue placeholder="Work items" />
                  </SelectTrigger>
                  <SelectContent>
                    {workItemsOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 sm:flex-initial sm:w-48">
                <Select value={currentStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 sm:flex-initial sm:w-48">
                <Select value={currentPriority || 'all'} onValueChange={handlePriorityChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    {availablePriorities.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9"
                />
              </div>
              {hasActiveFilters && (
                <Button variant="outline" onClick={handleClearFilters} className="sm:w-auto">
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--space-6)]">
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
                    {tasksByStatus.in_progress.map((task) => (
                      <TaskCard
                        key={`${task.projectId}:${task.id}`}
                        task={task}
                        onRevalidate={stableRevalidate}
                        projectLabel={getProjectLabel(task.projectId)}
                        viewMode={viewMode}
                      />
                    ))}
                  </div>
                </section>
              )}
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
                    {tasksByStatus.open.map((task) => (
                      <TaskCard
                        key={`${task.projectId}:${task.id}`}
                        task={task}
                        onRevalidate={stableRevalidate}
                        projectLabel={getProjectLabel(task.projectId)}
                        viewMode={viewMode}
                      />
                    ))}
                  </div>
                </section>
              )}
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
                    {tasksByStatus.blocked.map((task) => (
                      <TaskCard
                        key={`${task.projectId}:${task.id}`}
                        task={task}
                        onRevalidate={stableRevalidate}
                        projectLabel={getProjectLabel(task.projectId)}
                        viewMode={viewMode}
                      />
                    ))}
                  </div>
                </section>
              )}
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
                        onClick={() => setIsClosedCollapsed((prev) => !prev)}
                      >
                        {isClosedExpanded ? 'Hide closed' : 'Show closed'}
                      </Button>
                    )}
                  </div>
                  {isClosedExpanded && (
                    <div className="space-y-3" id={closedTasksId}>
                      {tasksByStatus.closed.map((task) => (
                        <TaskCard
                          key={`${task.projectId}:${task.id}`}
                          task={task}
                          onRevalidate={stableRevalidate}
                          projectLabel={getProjectLabel(task.projectId)}
                          viewMode={viewMode}
                        />
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
  /** Display label for the task's project (e.g. from config); shown as badge. */
  projectLabel: string;
  /** When 'combined', show project badge; when 'single', show optional muted project label. */
  viewMode: 'combined' | 'single';
}

function TaskCard({ task, onRevalidate, projectLabel, viewMode }: TaskCardProps) {
  const taskProjectId = task.projectId;
  const StatusIcon = statusIcons[task.status as keyof typeof statusIcons] || Circle;
  const statusColor = statusColors[task.status as keyof typeof statusColors] || 'text-muted-foreground';
  const isInProgress = task.status === 'in_progress';
  const isDone = task.status === 'closed';
  const fetcher = useFetcher();
  const isStopping = fetcher.state === 'submitting' || fetcher.state === 'loading';
  const stopSuccess = (fetcher.data as { success?: boolean } | undefined)?.success;

  useEffect(() => {
    if (stopSuccess) {
      const timer = setTimeout(() => onRevalidate(), 500);
      return () => clearTimeout(timer);
    }
  }, [stopSuccess, onRevalidate]);

  const stopAction = `/api/tasks/${task.id}/stop?projectId=${encodeURIComponent(taskProjectId)}`;

  const handleStop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isInProgress || isStopping) return;
    fetcher.submit(new FormData(), { method: 'POST', encType: 'multipart/form-data', action: stopAction });
  };

  const getStatusBadgeVariant = () => {
    switch (task.status) {
      case 'in_progress':
        return 'default';
      case 'closed':
        return 'secondary';
      case 'blocked':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const taskDetailHref = href('/projects/:projectId/tasks/:taskId', { projectId: taskProjectId, taskId: task.id });

  return (
    <Card
      className={[
        'group relative w-full max-w-[420px] overflow-hidden transition-shadow duration-200',
        'hover:shadow-[var(--shadow-2)] hover:border-primary/40',
        'focus-within:ring-[var(--focus-ring-width)] focus-within:ring-ring focus-within:ring-offset-[var(--focus-ring-offset)] focus-within:ring-offset-background'
      ].join(' ')}
    >
      <CardContent className="p-5">
        <Link
          to={taskDetailHref}
          prefetch="intent"
          className="block focus:outline-none"
          tabIndex={0}
          aria-label={`View details for task: ${task.title}`}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-0.5">
              {isInProgress ? (
                <div className="relative">
                  <PlayCircle className={`w-5 h-5 ${statusColor} animate-pulse`} aria-hidden="true" />
                  <span className="absolute inset-0 w-5 h-5 rounded-full bg-primary/20 animate-ping" aria-hidden="true" />
                </div>
              ) : isDone ? (
                <div className="relative">
                  <CheckCircle2 className={`w-5 h-5 ${statusColor} animate-[checkmark-pulse_2s_ease-in-out_infinite]`} aria-hidden="true" />
                </div>
              ) : (
                <StatusIcon className={`w-5 h-5 ${statusColor}`} aria-hidden="true" />
              )}
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-foreground truncate text-base leading-tight">{task.title}</h3>
                <div className="flex flex-shrink-0 items-center gap-2">
                  {viewMode === 'combined' ? (
                    <Badge variant="outline" className="text-xs font-normal text-muted-foreground" title={`Project: ${projectLabel}`}>
                      {projectLabel}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground truncate max-w-[120px]" title={`Project: ${projectLabel}`}>
                      {projectLabel}
                    </span>
                  )}
                  <Badge variant={getStatusBadgeVariant()} className="text-xs">
                    {formatStatusLabel(task.status)}
                  </Badge>
                </div>
              </div>
              {task.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 break-words leading-relaxed">{task.description}</p>
              )}
              <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 min-w-0">
                <span className="flex-1 font-mono truncate min-w-0" title={task.id}>
                  ID: {task.id}
                </span>
                {task.duration_ms != null && task.duration_ms >= 0 && (
                  <span className="flex-shrink-0" title="Last run duration">
                    {formatDurationMs(task.duration_ms)}
                  </span>
                )}
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

        {task.children.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-muted-foreground">Sub-issues ({task.children.length})</span>
            </div>
            <div className="space-y-2">
              {task.children.map((child) => {
                const ChildStatusIcon = statusIcons[child.status as keyof typeof statusIcons] || Circle;
                const childStatusColor = statusColors[child.status as keyof typeof statusColors] || 'text-muted-foreground';
                const childHref = href('/projects/:projectId/tasks/:taskId', { projectId: child.projectId, taskId: child.id });
                return (
                  <Link
                    key={child.id}
                    to={childHref}
                    prefetch="intent"
                    className="block rounded-lg border bg-surface p-[var(--space-3)] hover:bg-accent transition-colors text-sm"
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
          <div className="absolute top-3 right-3 flex items-center gap-2 transition-all duration-200 opacity-0 -translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto">
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
