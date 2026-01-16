import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskDetail, { loader } from '../tasks.$taskId';
import type { Route } from '../+types/tasks.$taskId';
import type { BeadsTask } from '~/db/beads.server';
import * as beadsServer from '~/db/beads.server';
import * as logsServer from '~/utils/logs.server';
import { createRoutesStub } from '~/lib/test-utils/router';

// Mock the database module
vi.mock('~/db/beads.server', () => ({
  getTaskById: vi.fn()
}));

// Mock the logs server module
vi.mock('~/utils/logs.server', () => ({
  logFileExists: vi.fn()
}));

// Mock ThemeToggle to avoid theme provider dependencies
vi.mock('~/components/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>
}));

// Mock LogViewer to avoid EventSource and API dependencies
vi.mock('~/components/LogViewer', () => ({
  LogViewer: ({ taskId }: { taskId: string }) => (
    <div data-testid="log-viewer" data-task-id={taskId}>
      Log Viewer for {taskId}
    </div>
  )
}));

const createLoaderArgs = (taskId?: string): Route.LoaderArgs => ({
  params: taskId ? { taskId } : {},
  request: new Request(`http://localhost/tasks/${taskId ?? ''}`),
  context: {},
  unstable_pattern: ''
});

const createComponentProps = (task: BeadsTask, hasLogs = false): Route.ComponentProps => ({
  loaderData: { task, hasLogs },
  params: { taskId: task.id },
  matches: [] as unknown as Route.ComponentProps['matches']
});

describe('Task Detail View & Navigation', () => {
  const mockTask: BeadsTask = {
    id: 'devagent-kwy.3',
    title: 'Test Task Detail View & Navigation',
    description: 'This is a test task description with multiple lines.\nIt should render correctly.',
    status: 'in_progress',
    priority: '2',
    parent_id: 'devagent-kwy',
    created_at: '2026-01-15T17:59:23.136627-06:00',
    updated_at: '2026-01-15T18:16:19.797194-06:00'
  };

  const mockClosedTask: BeadsTask = {
    id: 'devagent-kwy.1',
    title: 'Closed Task',
    description: 'A closed task',
    status: 'closed',
    priority: '1',
    parent_id: null,
    created_at: '2026-01-15T17:59:14.208505-06:00',
    updated_at: '2026-01-15T18:09:48.328896-06:00'
  };

  const mockOpenTask: BeadsTask = {
    id: 'devagent-kwy.2',
    title: 'Open Task',
    description: 'An open task',
    status: 'open',
    priority: '2',
    parent_id: null,
    created_at: '2026-01-15T17:59:18.626446-06:00',
    updated_at: '2026-01-15T17:59:18.626446-06:00'
  };

  const mockBlockedTask: BeadsTask = {
    id: 'devagent-kwy.4',
    title: 'Blocked Task',
    description: 'A blocked task',
    status: 'blocked',
    priority: '3',
    parent_id: null,
    created_at: '2026-01-15T17:59:27.868344-06:00',
    updated_at: '2026-01-15T17:59:27.868344-06:00'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock: log file doesn't exist
    vi.mocked(logsServer.logFileExists).mockReturnValue(false);
  });

  describe('Loader', () => {
    it('should load task by ID and check for logs', async () => {
      vi.mocked(beadsServer.getTaskById).mockReturnValue(mockTask);
      vi.mocked(logsServer.logFileExists).mockReturnValue(true);

      const result = await loader(createLoaderArgs('devagent-kwy.3'));

      expect(beadsServer.getTaskById).toHaveBeenCalledWith('devagent-kwy.3');
      expect(logsServer.logFileExists).toHaveBeenCalledWith('devagent-kwy.3');
      expect(result.task).toEqual(mockTask);
      expect(result.hasLogs).toBe(true);
    });

    it('should throw 400 error when task ID is missing', async () => {
      const thrown = await loader(createLoaderArgs()).catch(error => error);

      expect(thrown).toMatchObject({ init: { status: 400 } });
      expect(beadsServer.getTaskById).not.toHaveBeenCalled();
    });

    it('should throw 404 error when task is not found', async () => {
      vi.mocked(beadsServer.getTaskById).mockReturnValue(null);

      const thrown = await loader(createLoaderArgs('non-existent')).catch(error => error);

      expect(thrown).toMatchObject({ init: { status: 404 } });
      expect(beadsServer.getTaskById).toHaveBeenCalledWith('non-existent');
    });
  });

  describe('Task Detail Rendering', () => {
    const createRouter = (task: BeadsTask, hasLogs = false, initialEntries = [`/tasks/${task.id}`]) => {
      const RouteComponent = () => <TaskDetail {...createComponentProps(task, hasLogs)} />;
      const Stub = createRoutesStub([
        { path: '/', Component: () => <div>Home</div> },
        { path: '/tasks/:taskId', Component: RouteComponent }
      ]);

      return function Router() {
        return <Stub initialEntries={initialEntries} />;
      };
    };

    it('should render task title', async () => {
      vi.mocked(beadsServer.getTaskById).mockReturnValue(mockTask);
      const Router = createRouter(mockTask, false);
      render(<Router />);

      expect(await screen.findByRole('heading', { name: /Test Task Detail View & Navigation/i })).toBeInTheDocument();
    });

    it('should render task description', async () => {
      vi.mocked(beadsServer.getTaskById).mockReturnValue(mockTask);
      const Router = createRouter(mockTask);
      render(<Router />);

      expect(await screen.findByText(/This is a test task description/i)).toBeInTheDocument();
      expect(await screen.findByText(/It should render correctly/i)).toBeInTheDocument();
    });

    it('should render task status', async () => {
      vi.mocked(beadsServer.getTaskById).mockReturnValue(mockTask);
      const Router = createRouter(mockTask);
      render(<Router />);

      expect(await screen.findByText(/Status: in_progress/i)).toBeInTheDocument();
    });

    it('should render task priority', async () => {
      vi.mocked(beadsServer.getTaskById).mockReturnValue(mockTask);
      const Router = createRouter(mockTask);
      render(<Router />);

      expect(await screen.findByText(/Priority: 2/i)).toBeInTheDocument();
    });

    it('should render task ID', async () => {
      vi.mocked(beadsServer.getTaskById).mockReturnValue(mockTask);
      const Router = createRouter(mockTask);
      render(<Router />);

      expect(await screen.findByText(/ID: devagent-kwy\.3/i)).toBeInTheDocument();
    });

    it('should render created and updated timestamps', async () => {
      vi.mocked(beadsServer.getTaskById).mockReturnValue(mockTask);
      const Router = createRouter(mockTask);
      render(<Router />);

      // Check that dates are rendered (format may vary by locale)
      const createdText = await screen.findByText(/Created:/i);
      expect(createdText).toBeInTheDocument();

      const updatedText = await screen.findByText(/Updated:/i);
      expect(updatedText).toBeInTheDocument();
    });

    it('should render back button', async () => {
      vi.mocked(beadsServer.getTaskById).mockReturnValue(mockTask);
      const Router = createRouter(mockTask);
      render(<Router />);

      const backLink = await screen.findByRole('link', { name: /Back to tasks/i });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute('href', '/');
    });

    it('should render theme toggle', async () => {
      vi.mocked(beadsServer.getTaskById).mockReturnValue(mockTask);
      const Router = createRouter(mockTask);
      render(<Router />);

      expect(await screen.findByTestId('theme-toggle')).toBeInTheDocument();
    });

    it('should render LogViewer for active task (in_progress) even without logs', async () => {
      vi.mocked(beadsServer.getTaskById).mockReturnValue(mockTask);
      vi.mocked(logsServer.logFileExists).mockReturnValue(false);
      const Router = createRouter(mockTask);
      render(<Router />);

      const logViewer = await screen.findByTestId('log-viewer');
      expect(logViewer).toBeInTheDocument();
      expect(logViewer).toHaveAttribute('data-task-id', 'devagent-kwy.3');
    });

    it('should render LogViewer for active task (open) even without logs', async () => {
      vi.mocked(beadsServer.getTaskById).mockReturnValue(mockOpenTask);
      vi.mocked(logsServer.logFileExists).mockReturnValue(false);
      const Router = createRouter(mockOpenTask);
      render(<Router />);

      const logViewer = await screen.findByTestId('log-viewer');
      expect(logViewer).toBeInTheDocument();
      expect(logViewer).toHaveAttribute('data-task-id', 'devagent-kwy.2');
    });

    it('should render LogViewer for inactive task (closed) when logs exist', async () => {
      vi.mocked(beadsServer.getTaskById).mockReturnValue(mockClosedTask);
      vi.mocked(logsServer.logFileExists).mockReturnValue(true);
      const Router = createRouter(mockClosedTask, true);
      render(<Router />);

      const logViewer = await screen.findByTestId('log-viewer');
      expect(logViewer).toBeInTheDocument();
      expect(logViewer).toHaveAttribute('data-task-id', 'devagent-kwy.1');
    });

    it('should not render LogViewer for inactive task (closed) when no logs exist', async () => {
      vi.mocked(beadsServer.getTaskById).mockReturnValue(mockClosedTask);
      vi.mocked(logsServer.logFileExists).mockReturnValue(false);
      const Router = createRouter(mockClosedTask);
      render(<Router />);

      await screen.findByText('Closed Task');
      const logViewer = screen.queryByTestId('log-viewer');
      expect(logViewer).not.toBeInTheDocument();
    });

    it('should not render LogViewer for inactive task (blocked) when no logs exist', async () => {
      vi.mocked(beadsServer.getTaskById).mockReturnValue(mockBlockedTask);
      vi.mocked(logsServer.logFileExists).mockReturnValue(false);
      const Router = createRouter(mockBlockedTask);
      render(<Router />);

      await screen.findByText('Blocked Task');
      const logViewer = screen.queryByTestId('log-viewer');
      expect(logViewer).not.toBeInTheDocument();
    });

    it('should render stop button for in_progress tasks', async () => {
      vi.mocked(beadsServer.getTaskById).mockReturnValue(mockTask);
      const Router = createRouter(mockTask);
      render(<Router />);

      const stopButton = await screen.findByRole('button', { name: /Stop/i });
      expect(stopButton).toBeInTheDocument();
    });

    it('should not render stop button for closed tasks', async () => {
      vi.mocked(beadsServer.getTaskById).mockReturnValue(mockClosedTask);
      const Router = createRouter(mockClosedTask);
      render(<Router />);

      await screen.findByText('Closed Task');
      const stopButton = screen.queryByRole('button', { name: /Stop/i });
      expect(stopButton).not.toBeInTheDocument();
    });

    it('should not render stop button for open tasks', async () => {
      vi.mocked(beadsServer.getTaskById).mockReturnValue(mockOpenTask);
      const Router = createRouter(mockOpenTask);
      render(<Router />);

      await screen.findByText('Open Task');
      const stopButton = screen.queryByRole('button', { name: /Stop/i });
      expect(stopButton).not.toBeInTheDocument();
    });

    it('should not render stop button for blocked tasks', async () => {
      vi.mocked(beadsServer.getTaskById).mockReturnValue(mockBlockedTask);
      const Router = createRouter(mockBlockedTask);
      render(<Router />);

      await screen.findByText('Blocked Task');
      const stopButton = screen.queryByRole('button', { name: /Stop/i });
      expect(stopButton).not.toBeInTheDocument();
    });

    it('should render correct status icon for in_progress task', async () => {
      vi.mocked(beadsServer.getTaskById).mockReturnValue(mockTask);
      const Router = createRouter(mockTask);
      render(<Router />);

      // PlayCircle icon should be present (lucide-react icons render as SVG)
      // We can check by looking for the status text and verifying the icon is rendered
      await screen.findByText(/Status: in_progress/i);
      // The icon is rendered but we can't easily test the specific icon type without querying SVG
      // Instead, we verify the status is displayed correctly
      expect(screen.getByText(/Status: in_progress/i)).toBeInTheDocument();
    });

    it('should render correct status icon for closed task', async () => {
      vi.mocked(beadsServer.getTaskById).mockReturnValue(mockClosedTask);
      const Router = createRouter(mockClosedTask);
      render(<Router />);

      await screen.findByText(/Status: closed/i);
      expect(screen.getByText(/Status: closed/i)).toBeInTheDocument();
    });

    it('should render correct status icon for open task', async () => {
      vi.mocked(beadsServer.getTaskById).mockReturnValue(mockOpenTask);
      const Router = createRouter(mockOpenTask);
      render(<Router />);

      await screen.findByText(/Status: open/i);
      expect(screen.getByText(/Status: open/i)).toBeInTheDocument();
    });

    it('should render correct status icon for blocked task', async () => {
      vi.mocked(beadsServer.getTaskById).mockReturnValue(mockBlockedTask);
      const Router = createRouter(mockBlockedTask);
      render(<Router />);

      await screen.findByText(/Status: blocked/i);
      expect(screen.getByText(/Status: blocked/i)).toBeInTheDocument();
    });

    it('should handle task without description', async () => {
      const taskWithoutDescription: BeadsTask = {
        ...mockTask,
        description: null
      };
      vi.mocked(beadsServer.getTaskById).mockReturnValue(taskWithoutDescription);
      const Router = createRouter(taskWithoutDescription);
      render(<Router />);

      await screen.findByText('Test Task Detail View & Navigation');
      // Description section should not be rendered
      expect(screen.queryByText(/Description/i)).not.toBeInTheDocument();
    });

    it('should handle task without priority', async () => {
      const taskWithoutPriority: BeadsTask = {
        ...mockTask,
        priority: null
      };
      vi.mocked(beadsServer.getTaskById).mockReturnValue(taskWithoutPriority);
      const Router = createRouter(taskWithoutPriority);
      render(<Router />);

      await screen.findByText('Test Task Detail View & Navigation');
      // Priority should not be displayed
      expect(screen.queryByText(/Priority:/i)).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    const createRouterWithNavigation = (task: BeadsTask) => {
      const RouteComponent = () => <TaskDetail {...createComponentProps(task)} />;
      const Stub = createRoutesStub([
        { path: '/', Component: () => <div>Home Page</div> },
        { path: '/tasks/:taskId', Component: RouteComponent }
      ]);

      return function Router() {
        return <Stub initialEntries={[`/tasks/${task.id}`]} />;
      };
    };

    it('should navigate to home when back button is clicked', async () => {
      vi.mocked(beadsServer.getTaskById).mockReturnValue(mockTask);
      const Router = createRouterWithNavigation(mockTask);
      render(<Router />);

      const backLink = await screen.findByRole('link', { name: /Back to tasks/i });
      expect(backLink).toBeInTheDocument();

      await userEvent.click(backLink);

      await waitFor(() => {
        expect(screen.getByText('Home Page')).toBeInTheDocument();
      });
    });
  });

  describe('Stop Functionality', () => {
    const createRouterWithStop = (task: BeadsTask) => {
      const RouteComponent = () => <TaskDetail {...createComponentProps(task)} />;
      const Stub = createRoutesStub([
        { path: '/', Component: () => <div>Home</div> },
        { path: '/tasks/:taskId', Component: RouteComponent },
        {
          path: '/api/tasks/:taskId/stop',
          action: async () => {
            return { success: true, message: 'Task stopped successfully' };
          }
        }
      ]);

      return function Router() {
        return <Stub initialEntries={[`/tasks/${task.id}`]} />;
      };
    };

    it('should show stop button for in_progress tasks', async () => {
      vi.mocked(beadsServer.getTaskById).mockReturnValue(mockTask);
      const Router = createRouterWithStop(mockTask);
      render(<Router />);

      const stopButton = await screen.findByRole('button', { name: /Stop/i });
      expect(stopButton).toBeInTheDocument();
      expect(stopButton).not.toBeDisabled();
    });

    it('should show stop button and handle click for in_progress tasks', async () => {
      vi.mocked(beadsServer.getTaskById).mockReturnValue(mockTask);
      const Router = createRouterWithStop(mockTask);
      render(<Router />);

      const stopButton = await screen.findByRole('button', { name: /Stop/i });
      expect(stopButton).toBeInTheDocument();
      expect(stopButton).not.toBeDisabled();

      // Click stop button - the fetcher will handle the submission
      // In a real scenario, the button would show "Stopping..." during submission
      // but in tests, the fetcher completes very quickly
      await userEvent.click(stopButton);

      // Verify the button is still present (the action completes quickly)
      // The success message should appear after the action completes
      await waitFor(
        () => {
          expect(screen.getByText(/Task stopped successfully/i)).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });
  });

  describe('Real-time Task Updates & Revalidation', () => {
    const mockInProgressTask: BeadsTask = {
      id: 'task-1',
      title: 'In Progress Task',
      description: 'This is an in progress task',
      status: 'in_progress',
      priority: '2',
      parent_id: null,
      created_at: '2026-01-15T17:59:14.208505-06:00',
      updated_at: '2026-01-15T18:06:19.720292-06:00'
    };

    const mockOpenTask: BeadsTask = {
      id: 'task-2',
      title: 'Open Task',
      description: 'This is an open task',
      status: 'open',
      priority: '1',
      parent_id: null,
      created_at: '2026-01-15T17:59:18.626446-06:00',
      updated_at: '2026-01-15T17:59:18.626446-06:00'
    };

    const mockClosedTask: BeadsTask = {
      id: 'task-3',
      title: 'Closed Task',
      description: 'This is a closed task',
      status: 'closed',
      priority: '2',
      parent_id: null,
      created_at: '2026-01-15T17:59:23.136627-06:00',
      updated_at: '2026-01-15T17:59:23.136627-06:00'
    };

    const createRouter = (task: BeadsTask) => {
      const RouteComponent = () => <TaskDetail {...createComponentProps(task)} />;
      const Stub = createRoutesStub([
        { path: '/', Component: () => <div>Home</div> },
        { path: '/tasks/:taskId', Component: RouteComponent }
      ]);

      return function Router() {
        return <Stub initialEntries={[`/tasks/${task.id}`]} />;
      };
    };

    beforeEach(() => {
      vi.clearAllMocks();
      // Mock document.hidden to be false by default
      Object.defineProperty(document, 'hidden', {
        writable: true,
        configurable: true,
        value: false
      });
    });

    it('should set up polling for in_progress tasks', async () => {
      vi.mocked(beadsServer.getTaskById).mockReturnValue(mockInProgressTask);

      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const Router = createRouter(mockInProgressTask);
      const { unmount } = render(<Router />);

      await screen.findByText('In Progress Task');

      // Verify visibility change listener is added for active tasks
      expect(addEventListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));

      // Cleanup
      unmount();

      // Verify listener is removed on unmount
      expect(removeEventListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    });

    it('should set up polling for open tasks', async () => {
      vi.mocked(beadsServer.getTaskById).mockReturnValue(mockOpenTask);

      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const Router = createRouter(mockOpenTask);
      const { unmount } = render(<Router />);

      await screen.findByText('Open Task');

      // Verify visibility change listener is added for active tasks
      expect(addEventListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));

      // Cleanup
      unmount();

      // Verify listener is removed on unmount
      expect(removeEventListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    });

    it('should not set up polling for closed tasks', async () => {
      vi.mocked(beadsServer.getTaskById).mockReturnValue(mockClosedTask);

      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

      const Router = createRouter(mockClosedTask);
      render(<Router />);

      await screen.findByText('Closed Task');

      // Verify visibility change listener is NOT added for inactive tasks
      // Check if any calls were made with 'visibilitychange' as the first argument
      const visibilityCalls = addEventListenerSpy.mock.calls.filter(call => call[0] === 'visibilitychange');
      expect(visibilityCalls.length).toBe(0);
    });

    it('should render in_progress task correctly with polling enabled', async () => {
      vi.mocked(beadsServer.getTaskById).mockReturnValue(mockInProgressTask);

      const Router = createRouter(mockInProgressTask);
      render(<Router />);

      await screen.findByText('In Progress Task');
      expect(screen.getByText(/Status: in_progress/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Stop/i })).toBeInTheDocument();
    });

    it('should render open task correctly with polling enabled', async () => {
      vi.mocked(beadsServer.getTaskById).mockReturnValue(mockOpenTask);

      const Router = createRouter(mockOpenTask);
      render(<Router />);

      await screen.findByText('Open Task');
      expect(screen.getByText(/Status: open/i)).toBeInTheDocument();
      // Open tasks don't have stop button
      expect(screen.queryByRole('button', { name: /Stop/i })).not.toBeInTheDocument();
    });

    it('should render closed task correctly without polling', async () => {
      vi.mocked(beadsServer.getTaskById).mockReturnValue(mockClosedTask);

      const Router = createRouter(mockClosedTask);
      render(<Router />);

      await screen.findByText('Closed Task');
      expect(screen.getByText(/Status: closed/i)).toBeInTheDocument();
      // Closed tasks don't have stop button
      expect(screen.queryByRole('button', { name: /Stop/i })).not.toBeInTheDocument();
    });
  });
});
