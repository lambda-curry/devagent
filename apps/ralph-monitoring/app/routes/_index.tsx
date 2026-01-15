import { Link, useLoaderData, useSearchParams, useNavigate } from 'react-router';
import { getAllTasks, type BeadsTask, type TaskFilters } from '~/db/beads.server';
import { CheckCircle2, Circle, PlayCircle, AlertCircle, X, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { useState, useEffect, useMemo } from 'react';

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
  todo: Circle,
  in_progress: PlayCircle,
  done: CheckCircle2,
  blocked: AlertCircle
};

const statusColors = {
  todo: 'text-gray-500',
  in_progress: 'text-blue-500',
  done: 'text-green-500',
  blocked: 'text-red-500'
};

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'todo', label: 'Todo' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
  { value: 'blocked', label: 'Blocked' }
];

export default function Index() {
  const { tasks } = useLoaderData<{ tasks: BeadsTask[]; filters: TaskFilters }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get current filter values from URL
  const currentStatus = (searchParams.get('status') || 'all') as TaskFilters['status'];
  const currentPriority = searchParams.get('priority') || '';
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
  const hasActiveFilters = currentStatus !== 'all' || currentPriority !== '' || currentSearch !== '';

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
    if (value === '') {
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
      todo: [],
      done: [],
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
        <h1 className="text-3xl font-bold mb-8">Ralph Monitoring</h1>

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
              <Select value={currentPriority || ''} onValueChange={handlePriorityChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Priorities</SelectItem>
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
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {hasActiveFilters ? 'No tasks match your filters' : 'No tasks found'}
          </div>
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

            {/* Todo Column */}
            {tasksByStatus.todo.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Circle className="w-5 h-5 text-gray-500" />
                  <h2 className="text-xl font-semibold">Todo</h2>
                  <span className="text-sm text-muted-foreground">({tasksByStatus.todo.length})</span>
                </div>

                <div className="space-y-3">
                  {tasksByStatus.todo.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}

            {/* Done Column */}
            {tasksByStatus.done.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <h2 className="text-xl font-semibold">Done</h2>
                  <span className="text-sm text-muted-foreground">({tasksByStatus.done.length})</span>
                </div>

                <div className="space-y-3">
                  {tasksByStatus.done.map(task => (
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

  return (
    <Link
      to={`/tasks/${task.id}`}
      className="block p-4 bg-card border border-border rounded-lg hover:border-primary transition-colors"
    >
      <div className="flex items-start gap-3">
        <StatusIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${statusColor}`} />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate">{task.title}</h3>
          {task.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>}
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span>ID: {task.id}</span>
            {task.priority && <span className="px-2 py-0.5 bg-muted rounded">Priority: {task.priority}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
