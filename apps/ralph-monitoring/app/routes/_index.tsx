import { redirect } from 'react-router';
import type { Route } from './+types/_index';

/**
 * Root index redirects to project-scoped task list.
 * Default: combined view (all projects). Use /projects/:projectId for single project.
 */
export async function loader(_args: Route.LoaderArgs) {
  return redirect('/projects/combined');
}

export default function Index() {
  return null;
}
