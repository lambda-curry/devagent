import { redirect } from 'react-router';
import type { Route } from './+types/tasks.$taskId';

/**
 * Legacy route: redirect /tasks/:taskId to /projects/combined/tasks/:taskId
 * so old links and AgentTimeline continue to work.
 */
export async function loader({ params }: Route.LoaderArgs) {
  const taskId = params.taskId;
  if (!taskId) return redirect('/projects/combined');
  return redirect(`/projects/combined/tasks/${taskId}`);
}

export default function TasksTaskIdRedirect() {
  return null;
}
