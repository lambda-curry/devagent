/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProjectsIndex, { loader } from '../projects.$projectId._index';
import type { Route } from '../+types/projects.$projectId._index';
import type { BeadsTask } from '~/db/beads.types';
import * as beadsServer from '~/db/beads.server';
import * as projectsServer from '~/lib/projects.server';
import { createRoutesStub } from '~/lib/test-utils/router';

vi.mock('~/db/beads.server', () => ({ getAllTasks: vi.fn() }));
vi.mock('~/lib/projects.server', () => ({ getProjectList: vi.fn() }));
vi.mock('~/components/ThemeToggle', () => ({ ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div> }));

const workItemsStorageKey = 'ralph-monitoring.work-items';
const closedToggleStorageKey = 'ralph-monitoring.closed-collapsed';

const createLoaderArgs = (projectId: string, request: Request): Route.LoaderArgs => ({
  params: { projectId },
  request,
  context: {},
  unstable_pattern: ''
});

const createComponentProps = (loaderData: Awaited<ReturnType<typeof loader>>): Route.ComponentProps => ({
  loaderData,
  params: { projectId: loaderData.projectId },
  matches: [] as unknown as Route.ComponentProps['matches']
});

describe('projects.$projectId._index', () => {
  const mockTasks: BeadsTask[] = [
    {
      id: 'devagent-kwy.1',
      title: 'Test Task',
      description: 'Test',
      design: null,
      acceptance_criteria: null,
      notes: null,
      status: 'in_progress',
      priority: '2',
      parent_id: null,
      created_at: '2026-01-15T17:59:14.208505-06:00',
      updated_at: '2026-01-15T18:06:19.720292-06:00'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.removeItem(workItemsStorageKey);
    window.localStorage.removeItem(closedToggleStorageKey);
  });

  describe('Loader', () => {
    it('should load tasks for single projectId', async () => {
      vi.mocked(projectsServer.getProjectList).mockReturnValue([]);
      vi.mocked(beadsServer.getAllTasks).mockReturnValue(mockTasks);

      const request = new Request('http://localhost/projects/my-project');
      const result = await loader(createLoaderArgs('my-project', request));

      expect(beadsServer.getAllTasks).toHaveBeenCalledWith(
        { status: undefined, priority: undefined, search: undefined },
        'my-project'
      );
      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].id).toBe('devagent-kwy.1');
      expect(result.tasks[0].projectId).toBe('my-project');
      expect(result.projectId).toBe('my-project');
      expect(result.viewMode).toBe('single');
    });

    it('should aggregate tasks from all projects when projectId is combined', async () => {
      vi.mocked(projectsServer.getProjectList).mockReturnValue([
        { id: 'proj-a', path: '/path/a', label: 'A', valid: true },
        { id: 'proj-b', path: '/path/b', label: 'B', valid: true }
      ]);
      vi.mocked(beadsServer.getAllTasks)
        .mockReturnValueOnce([{ ...mockTasks[0], id: 'task-a.1' }])
        .mockReturnValueOnce([{ ...mockTasks[0], id: 'task-b.1', title: 'Task B' }]);

      const request = new Request('http://localhost/projects/combined');
      const result = await loader(createLoaderArgs('combined', request));

      expect(beadsServer.getAllTasks).toHaveBeenCalledWith(
        { status: undefined, priority: undefined, search: undefined },
        'proj-a'
      );
      expect(beadsServer.getAllTasks).toHaveBeenCalledWith(
        { status: undefined, priority: undefined, search: undefined },
        'proj-b'
      );
      expect(result.tasks).toHaveLength(2);
      expect(result.tasks[0].projectId).toBe('proj-a');
      expect(result.tasks[1].projectId).toBe('proj-b');
      expect(result.projectId).toBe('combined');
      expect(result.viewMode).toBe('combined');
    });
  });

  describe('Rendering', () => {
    it('should render task list with project-scoped links', async () => {
      vi.mocked(projectsServer.getProjectList).mockReturnValue([]);
      vi.mocked(beadsServer.getAllTasks).mockReturnValue(mockTasks);

      const request = new Request('http://localhost/projects/my-project');
      const loaderData = await loader(createLoaderArgs('my-project', request));
      const RouteComponent = () => <ProjectsIndex {...createComponentProps(loaderData)} />;
      const Stub = createRoutesStub([{ path: '/projects/:projectId', Component: RouteComponent }]);
      render(<Stub initialEntries={['/projects/my-project']} />);

      expect(await screen.findByRole('heading', { name: /Ralph Monitoring/i })).toBeInTheDocument();
      const link = await screen.findByRole('link', { name: /View details for task: Test Task/i });
      expect(link).toHaveAttribute('href', '/projects/my-project/tasks/devagent-kwy.1');
    });
  });
});
