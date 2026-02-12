import { data } from 'react-router';
import type { Route } from './+types/epics.$epicId.live';
import { getTaskById, getEpicById, getTasksByEpicId } from '~/db/beads.server';
import { getSignalState } from '~/utils/loop-control.server';
import { EpicLiveView } from '~/components/EpicLiveView';

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
  const loopSignals = getSignalState();
  const hasInProgress = tasks.some((t) => t.status === 'in_progress');
  const runStatus = loopSignals.pause ? 'paused' : hasInProgress ? 'running' : 'idle';
  const currentTask = tasks.find((t) => t.status === 'in_progress') ?? null;

  return {
    epicId,
    epicTitle: epic.title,
    currentTask,
    runStatus,
  };
}

export const meta: Route.MetaFunction = ({ data }) => {
  const title = data?.currentTask
    ? `Live: ${data.currentTask.title} - Ralph`
    : 'Live log - Ralph Monitoring';
  return [{ title }, { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' }];
};

export default function EpicLive({ loaderData }: Route.ComponentProps) {
  return (
    <EpicLiveView
      epicId={loaderData.epicId}
      epicTitle={loaderData.epicTitle}
      currentTask={loaderData.currentTask}
      runStatus={loaderData.runStatus as 'idle' | 'running' | 'paused'}
    />
  );
}
