import { Outlet } from 'react-router';
import type { Route } from './+types/projects.$projectId';

/**
 * Layout for project-scoped routes: task list (index) and task detail.
 * Renders child route (projects.$projectId._index or projects.$projectId.tasks.$taskId).
 */
export default function ProjectsLayout(_props: Route.ComponentProps) {
  return <Outlet />;
}
