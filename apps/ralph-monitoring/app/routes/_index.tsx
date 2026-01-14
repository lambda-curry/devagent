import { Link, useLoaderData } from 'react-router';
import { getActiveTasks, type BeadsTask } from '~/db/beads.server';
import { CheckCircle2, Circle, PlayCircle, AlertCircle } from 'lucide-react';

export const loader = async () => {
  const tasks = getActiveTasks();
  return { tasks };
};

export const meta = () => {
  return [
    { title: 'Active Tasks - Ralph Monitoring' },
    { name: 'description', content: 'View active Ralph tasks' }
  ];
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

export default function Index() {
  const { tasks } = useLoaderData<{ tasks: BeadsTask[] }>();

  const tasksByStatus = {
    in_progress: tasks.filter((t: BeadsTask) => t.status === 'in_progress'),
    todo: tasks.filter((t: BeadsTask) => t.status === 'todo')
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Ralph Monitoring</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* In Progress Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <PlayCircle className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-semibold">In Progress</h2>
              <span className="text-sm text-muted-foreground">
                ({tasksByStatus.in_progress.length})
              </span>
            </div>
            
            <div className="space-y-3">
              {tasksByStatus.in_progress.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No tasks in progress
                </div>
              ) : (
                tasksByStatus.in_progress.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))
              )}
            </div>
          </div>

          {/* Todo Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Circle className="w-5 h-5 text-gray-500" />
              <h2 className="text-xl font-semibold">Todo</h2>
              <span className="text-sm text-muted-foreground">
                ({tasksByStatus.todo.length})
              </span>
            </div>
            
            <div className="space-y-3">
              {tasksByStatus.todo.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No tasks in todo
                </div>
              ) : (
                tasksByStatus.todo.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))
              )}
            </div>
          </div>
        </div>
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
          {task.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
          <div className="mt-2 text-xs text-muted-foreground">
            ID: {task.id}
          </div>
        </div>
      </div>
    </Link>
  );
}
