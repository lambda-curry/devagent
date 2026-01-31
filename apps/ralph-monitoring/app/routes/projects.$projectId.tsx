import { Outlet } from 'react-router';
import type { Route } from './+types/projects.$projectId';
import { ProjectSwitcher } from '~/components/ProjectSwitcher';

/**
 * Layout for project-scoped routes: task list (index) and task detail.
 * Renders project switcher and child route (projects.$projectId._index or projects.$projectId.tasks.$taskId).
 */
export default function ProjectsLayout(_props: Route.ComponentProps) {
  return (
    <>
      <header className="border-b border-border bg-background">
        <div className="mx-auto w-full max-w-7xl px-[var(--space-6)] py-4">
          <ProjectSwitcher />
        </div>
      </header>
      <Outlet />
    </>
  );
}
