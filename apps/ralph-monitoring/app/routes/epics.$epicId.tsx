import { Link, useRevalidator, data } from 'react-router';
import { useEffect, useRef, useCallback } from 'react';
import type { Route } from './+types/epics.$epicId';
import { getTaskById, getEpicById, getTasksByEpicId } from '~/db/beads.server';
import { EpicProgress } from '~/components/EpicProgress';
import { ThemeToggle } from '~/components/ThemeToggle';
import { ArrowLeft } from 'lucide-react';

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

  return { epic, summary, tasks };
}

export const meta: Route.MetaFunction = ({ data }) => {
  const title = data?.epic ? `${data.epic.title} - Ralph Monitoring` : 'Epic - Ralph Monitoring';
  return [
    { title },
    { name: 'description', content: data?.epic?.description ?? 'Epic progress and tasks' },
  ];
};

export default function EpicDetail({ loaderData }: Route.ComponentProps) {
  const { epic, summary, tasks } = loaderData;
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

      <EpicProgress epic={epic} summary={summary} tasks={tasks} />
    </main>
  );
}
