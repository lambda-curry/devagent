import { Link, useRevalidator, data } from 'react-router';
import { useEffect, useRef, useCallback, useMemo, useState, useId } from 'react';
import type { Route } from './+types/epics.$epicId';
import {
  getTaskById,
  getEpicById,
  getTasksByEpicId,
  getExecutionLogs,
  type RalphExecutionLog,
} from '~/db/beads.server';
import { getSignalState } from '~/utils/loop-control.server';
import { EpicProgress } from '~/components/EpicProgress';
import { AgentTimeline } from '~/components/AgentTimeline';
import { LoopControlPanel, type LoopRunStatus } from '~/components/LoopControlPanel';
import { ThemeToggle } from '~/components/ThemeToggle';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { ArrowLeft } from 'lucide-react';

const TIME_RANGE_OPTIONS = [
  { value: 'all', label: 'All time' },
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
] as const;

export async function loader({ params }: Route.LoaderArgs) {
  const epicId = params.epicId;
  if (!epicId) {
    throw data('Epic ID is required', { status: 400 });
  }

  const epic = getTaskById(epicId);
  if (!epic) {
    throw data('Epic not found', { status: 404 });
  }
  if (epic.parent_id !== null) {
    throw data('Not an epic (task has parent)', { status: 404 });
  }

  const summary = getEpicById(epicId);
  if (!summary) {
    throw data('Epic summary not found', { status: 404 });
  }

  const tasks = getTasksByEpicId(epicId);
  const executionLogs = getExecutionLogs(epicId);
  const taskIdToTitle = Object.fromEntries(tasks.map((t) => [t.id, t.title]));
  const loopSignals = getSignalState();

  return { epic, summary, tasks, executionLogs, taskIdToTitle, loopSignals };
}

export const meta: Route.MetaFunction = ({ data }) => {
  const title = data?.epic ? `${data.epic.title} - Ralph Monitoring` : 'Epic - Ralph Monitoring';
  return [
    { title },
    { name: 'description', content: data?.epic?.description ?? 'Epic progress and tasks' },
  ];
};

function filterLogsByTimeRange(logs: RalphExecutionLog[], range: string): RalphExecutionLog[] {
  if (range === 'all' || logs.length === 0) return logs;
  const now = Date.now();
  const cutoffMs =
    range === '24h' ? now - 24 * 60 * 60 * 1000 : range === '7d' ? now - 7 * 24 * 60 * 60 * 1000 : 0;
  return logs.filter((log) => new Date(log.started_at).getTime() >= cutoffMs);
}

function deriveRunStatus(
  loopSignals: { pause: boolean; resume: boolean; skipTaskIds: string[] },
  tasks: { status: string }[]
): LoopRunStatus {
  if (loopSignals.pause) return 'paused';
  const hasInProgress = tasks.some((t) => t.status === 'in_progress');
  return hasInProgress ? 'running' : 'idle';
}

export default function EpicDetail({ loaderData }: Route.ComponentProps) {
  const { epic, summary, tasks, executionLogs, taskIdToTitle, loopSignals } = loaderData;
  const runStatus = deriveRunStatus(loopSignals, tasks);
  const [agentTypeFilter, setAgentTypeFilter] = useState<string>('all');
  const [timeRangeFilter, setTimeRangeFilter] = useState<string>('all');
  const timelineHeadingId = useId();
  const agentFilterId = useId();
  const timeRangeFilterId = useId();

  const revalidator = useRevalidator();
  const revalidateRef = useRef(revalidator.revalidate);
  revalidateRef.current = revalidator.revalidate;

  const stableRevalidate = useCallback(() => {
    revalidateRef.current();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) {
        stableRevalidate();
      }
    }, 5000);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        stableRevalidate();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [stableRevalidate]);

  const agentTypes = useMemo(() => {
    const set = new Set(executionLogs.map((log) => log.agent_type));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [executionLogs]);

  const filteredLogs = useMemo(() => {
    let result = filterLogsByTimeRange(executionLogs, timeRangeFilter);
    if (agentTypeFilter !== 'all') {
      result = result.filter((log) => log.agent_type === agentTypeFilter);
    }
    return result;
  }, [executionLogs, timeRangeFilter, agentTypeFilter]);

  return (
    <main className="mx-auto w-full max-w-4xl p-[var(--space-6)]">
      <header className="mb-[var(--space-6)] flex flex-wrap items-center justify-between gap-[var(--space-4)]">
        <div className="flex items-center gap-[var(--space-3)]">
          <Link
            to="/epics"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Epics
          </Link>
          <h1 className="text-xl font-semibold text-foreground">{epic.title}</h1>
        </div>
        <ThemeToggle />
      </header>

      <LoopControlPanel epicId={epic.id} runStatus={runStatus} tasks={tasks} />

      <EpicProgress epic={epic} summary={summary} tasks={tasks} />

      <section className="mt-[var(--space-6)] space-y-[var(--space-4)]" aria-labelledby={timelineHeadingId}>
        <h2 id={timelineHeadingId} className="text-base font-medium text-foreground">
          Timeline
        </h2>
        <div className="flex flex-wrap items-center gap-[var(--space-3)]">
          <div className="flex items-center gap-2">
            <label htmlFor={agentFilterId} className="text-sm text-muted-foreground">
              Agent
            </label>
            <Select value={agentTypeFilter} onValueChange={setAgentTypeFilter}>
              <SelectTrigger id={agentFilterId} className="w-[140px]">
                <SelectValue placeholder="All agents" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All agents</SelectItem>
                {agentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/-/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor={timeRangeFilterId} className="text-sm text-muted-foreground">
              Time range
            </label>
            <Select value={timeRangeFilter} onValueChange={setTimeRangeFilter}>
              <SelectTrigger id={timeRangeFilterId} className="w-[160px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                {TIME_RANGE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <AgentTimeline logs={filteredLogs} taskIdToTitle={taskIdToTitle} className="mt-2" />
      </section>
    </main>
  );
}
