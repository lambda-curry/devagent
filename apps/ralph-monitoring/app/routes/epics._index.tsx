import { useEffect, useRef, useCallback } from 'react';
import { useNavigate, useRevalidator, href } from 'react-router';
import type { Route } from './+types/epics._index';
import { getEpics } from '~/db/beads.server';
import type { EpicSummary } from '~/db/beads.types';
import type { LoopRunStatus } from '~/components/mobile-loop/LoopCard';
import { LoopCard } from '~/components/mobile-loop';
import { EmptyState } from '~/components/EmptyState';
import { ThemeToggle } from '~/components/ThemeToggle';
import { formatRelativeTime } from '~/lib/formatRelativeTime';
import { Layers } from 'lucide-react';

export async function loader(_args: Route.LoaderArgs) {
  const epics = getEpics();
  return { epics };
}

export const meta: Route.MetaFunction = () => [
  { title: 'Loop Monitor - Ralph Monitoring' },
  { name: 'description', content: 'Active loops and epic progress' },
];

const SORT_ORDER: Record<EpicSummary['status'], number> = {
  in_progress: 1,
  blocked: 2,
  open: 3,
  closed: 4,
};

function epicSortOrder(a: EpicSummary, b: EpicSummary): number {
  return (SORT_ORDER[a.status] ?? 5) - (SORT_ORDER[b.status] ?? 5);
}

function epicStatusToLoopRunStatus(status: EpicSummary['status']): LoopRunStatus {
  switch (status) {
    case 'in_progress':
      return 'running';
    case 'blocked':
      return 'paused';
    default:
      return 'idle';
  }
}

export default function EpicsIndex({ loaderData }: Route.ComponentProps) {
  const { epics } = loaderData;
  const navigate = useNavigate();
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
    }, 10_000);

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

  const sortedEpics = [...epics].sort(epicSortOrder);

  return (
    <main className="mx-auto w-full max-w-lg px-[var(--space-4)] py-[var(--space-6)]">
      <header className="mb-[var(--space-6)] flex flex-wrap items-center justify-between gap-[var(--space-4)]">
        <h1 className="text-[length:var(--font-size-xl)] font-semibold text-foreground leading-[var(--line-height-snug)]">
          Loop Monitor
        </h1>
        <ThemeToggle />
      </header>

      {sortedEpics.length === 0 ? (
        <EmptyState
          title="No epics yet"
          description="Epics will appear here once Ralph creates parent tasks. Check back soon!"
          icon={Layers}
          variant="card"
        />
      ) : (
        <ul className="flex flex-col gap-[var(--space-3)] list-none p-0 m-0">
          {sortedEpics.map((epic) => {
            const currentTaskLine =
              epic.current_task_title &&
              (epic.current_task_agent
                ? `${epic.current_task_title} · ${epic.current_task_agent}`
                : epic.current_task_title);

            return (
              <li key={epic.id}>
                <LoopCard
                  title={epic.title}
                  status={epicStatusToLoopRunStatus(epic.status)}
                  completedCount={epic.completed_count}
                  totalCount={epic.task_count}
                  currentTaskName={currentTaskLine ?? undefined}
                  lastActivityLabel={formatRelativeTime(epic.updated_at)}
                  onClick={() =>
                    navigate(href('/epics/:epicId', { epicId: epic.id }))
                  }
                  className="min-h-[var(--space-12)] w-full"
                  aria-label={`${epic.title}, ${epic.completed_count} of ${epic.task_count} tasks`}
                />
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
