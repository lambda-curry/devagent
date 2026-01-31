import { redirect } from 'react-router';
import type { Route } from './+types/_index';
import { getDefaultProjectId } from '~/lib/projects.server';

/**
 * Root index redirects to project-scoped task list.
 * Uses default project when set in config, otherwise combined view (all projects).
 */
export async function loader(_args: Route.LoaderArgs) {
  const defaultId = getDefaultProjectId();
  return redirect(defaultId ? `/projects/${defaultId}` : '/projects/combined');
}

export default function Index() {
  return null;
}
