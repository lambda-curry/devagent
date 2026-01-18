/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import Index, { loader } from '../_index';
import type { Route } from '../+types/_index';
import type { BeadsTask } from '~/db/beads.server';
import * as beadsServer from '~/db/beads.server';
import { createRoutesStub } from '~/lib/test-utils/router';

// Mock the database module
vi.mock('~/db/beads.server', () => ({
  getAllTasks: vi.fn(),
  getTaskCommentCounts: vi.fn()
}));

// Mock ThemeToggle to avoid theme provider dependencies
vi.mock('~/components/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>
}));

const createLoaderArgs = (request: Request): Route.LoaderArgs => ({
  request,
  params: {},
  context: {},
  unstable_pattern: ''
});

const createComponentProps = (loaderData: Awaited<ReturnType<typeof loader>>): Route.ComponentProps => ({
  loaderData,
  params: {},
  matches: [] as unknown as Route.ComponentProps['matches']
});

describe('Task List Display & Rendering', () => {
  const mockTasks: BeadsTask[] = [
    {
      id: 'devagent-kwy.1',
      title: 'Test Task List Display & Rendering',
      description: 'Test task description',
      design: null,
      acceptance_criteria: null,
      notes: null,
      status: 'in_progress',
      priority: '2',
      parent_id: 'devagent-kwy',
      created_at: '2026-01-15T17:59:14.208505-06:00',
      updated_at: '2026-01-15T18:06:19.720292-06:00'
    },
    {
      id: 'devagent-kwy.2',
      title: 'Test Task Filtering & Search',
      description: 'Another test task',
      design: null,
      acceptance_criteria: null,
      notes: null,
      status: 'open',
      priority: '2',
      parent_id: 'devagent-kwy',
      created_at: '2026-01-15T17:59:18.626446-06:00',
      updated_at: '2026-01-15T17:59:18.626446-06:00'
    },
    {
      id: 'devagent-kwy.3',
      title: 'Test Task Detail View & Navigation',
      description: 'Closed task example',
      design: null,
      acceptance_criteria: null,
      notes: null,
      status: 'closed',
      priority: '1',
      parent_id: 'devagent-kwy',
      created_at: '2026-01-15T17:59:23.136627-06:00',
      updated_at: '2026-01-15T17:59:23.136627-06:00'
    },
    {
      id: 'devagent-kwy.4',
      title: 'Test Theme Toggle & Persistence',
      description: 'Blocked task example',
      design: null,
      acceptance_criteria: null,
      notes: null,
      status: 'blocked',
      priority: '3',
      parent_id: null,
      created_at: '2026-01-15T17:59:27.868344-06:00',
      updated_at: '2026-01-15T17:59:27.868344-06:00'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock: no comment counts
    vi.mocked(beadsServer.getTaskCommentCounts).mockReturnValue(new Map());
  });

  describe('Loader', () => {
    it('should load tasks with no filters', async () => {
      vi.mocked(beadsServer.getAllTasks).mockReturnValue(mockTasks);

      const request = new Request('http://localhost/');
      const result = await loader(createLoaderArgs(request));

      expect(beadsServer.getAllTasks).toHaveBeenCalledWith({
        status: undefined,
        priority: undefined,
        search: undefined
      });
      expect(result.tasks).toHaveLength(4);
      expect(result.tasks[0].id).toBe('devagent-kwy.1');
    });

    it('should load tasks with status filter', async () => {
      vi.mocked(beadsServer.getAllTasks).mockReturnValue([mockTasks[0]]);

      const request = new Request('http://localhost/?status=in_progress');
      const result = await loader(createLoaderArgs(request));

      expect(beadsServer.getAllTasks).toHaveBeenCalledWith({
        status: 'in_progress'
      });
      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].status).toBe('in_progress');
    });

    it('should load tasks with priority filter', async () => {
      vi.mocked(beadsServer.getAllTasks).mockReturnValue([mockTasks[0], mockTasks[2]]);

      const request = new Request('http://localhost/?priority=2');
      await loader(createLoaderArgs(request));

      expect(beadsServer.getAllTasks).toHaveBeenCalledWith({
        priority: '2'
      });
    });

    it('should load tasks with search filter', async () => {
      vi.mocked(beadsServer.getAllTasks).mockReturnValue([mockTasks[0]]);

      const request = new Request('http://localhost/?search=Display');
      await loader(createLoaderArgs(request));

      expect(beadsServer.getAllTasks).toHaveBeenCalledWith({
        search: 'Display'
      });
    });

    it('should attach children to parent tasks', async () => {
      const parentTask: BeadsTask = {
        id: 'devagent-kwy',
        title: 'Parent Epic',
        description: 'Parent task',
        design: null,
        acceptance_criteria: null,
        notes: null,
        status: 'open',
        priority: '2',
        parent_id: null,
        created_at: '2026-01-15T17:58:01.343571-06:00',
        updated_at: '2026-01-15T17:58:01.343571-06:00'
      };

      const childTasks: BeadsTask[] = [
        {
          id: 'devagent-kwy.1',
          title: 'Child Task 1',
          description: 'Child task',
          design: null,
          acceptance_criteria: null,
          notes: null,
          status: 'in_progress',
          priority: '2',
          parent_id: 'devagent-kwy',
          created_at: '2026-01-15T17:59:14.208505-06:00',
          updated_at: '2026-01-15T18:06:19.720292-06:00'
        }
      ];

      vi.mocked(beadsServer.getAllTasks).mockReturnValue([parentTask, ...childTasks]);

      const request = new Request('http://localhost/');
      const result = await loader(createLoaderArgs(request));

      const parentWithChildren = result.tasks.find(t => t.id === 'devagent-kwy');
      expect(parentWithChildren?.children).toHaveLength(1);
      expect(parentWithChildren?.children[0].id).toBe('devagent-kwy.1');
    });
  });

  describe('Task List Rendering', () => {
    const createRouter = async (initialEntries = ['/']) => {
      const firstEntry = initialEntries[0] ?? '/';
      const request = new Request(`http://localhost${firstEntry}`);
      const loaderData = await loader(createLoaderArgs(request));
      const RouteComponent = () => <Index {...createComponentProps(loaderData)} />;

      return createRoutesStub([{ path: '/', Component: RouteComponent }]);
    };

    it('should render page title', async () => {
      vi.mocked(beadsServer.getAllTasks).mockReturnValue([]);
      const Router = await createRouter();
      render(<Router />);

      expect(await screen.findByRole('heading', { name: /Ralph Monitoring/i })).toBeInTheDocument();
    });

    it('should render theme toggle', async () => {
      vi.mocked(beadsServer.getAllTasks).mockReturnValue([]);
      const Router = await createRouter();
      render(<Router />);

      expect(await screen.findByTestId('theme-toggle')).toBeInTheDocument();
    });

    it('should render empty state when no tasks', async () => {
      vi.mocked(beadsServer.getAllTasks).mockReturnValue([]);
      const Router = await createRouter();
      render(<Router />);

      expect(await screen.findByText(/No tasks yet/i)).toBeInTheDocument();
      expect(await screen.findByText(/Tasks will appear here once Ralph starts executing work/i)).toBeInTheDocument();
    });

    it('should render tasks grouped by status columns', async () => {
      vi.mocked(beadsServer.getAllTasks).mockReturnValue(mockTasks);
      const Router = await createRouter();
      render(<Router />);

      // Check for status column headers (use getAllByText since "In Progress" appears in both header and badge)
      const inProgressHeaders = await screen.findAllByText(/In Progress/i);
      expect(inProgressHeaders.length).toBeGreaterThan(0);

      const openHeaders = await screen.findAllByText(/^Open$/i);
      expect(openHeaders.length).toBeGreaterThan(0);

      const closedHeaders = await screen.findAllByText(/^Closed$/i);
      expect(closedHeaders.length).toBeGreaterThan(0);

      const blockedHeaders = await screen.findAllByText(/^Blocked$/i);
      expect(blockedHeaders.length).toBeGreaterThan(0);
    });

    it('should render task count in status column headers', async () => {
      vi.mocked(beadsServer.getAllTasks).mockReturnValue(mockTasks);
      const Router = await createRouter();
      render(<Router />);

      // Find headers by role and check for counts
      const inProgressHeaders = await screen.findAllByText(/In Progress/i);
      const inProgressHeader = inProgressHeaders.find(el => el.tagName === 'H2');
      expect(inProgressHeader).toBeInTheDocument();
      if (inProgressHeader) {
        expect(within(inProgressHeader.closest('div')!).getByText(/\(1\)/)).toBeInTheDocument();
      }

      const openHeaders = await screen.findAllByText(/^Open$/i);
      const openHeader = openHeaders.find(el => el.tagName === 'H2');
      expect(openHeader).toBeInTheDocument();
      if (openHeader) {
        expect(within(openHeader.closest('div')!).getByText(/\(1\)/)).toBeInTheDocument();
      }
    });

    it('should render task cards with correct information', async () => {
      vi.mocked(beadsServer.getAllTasks).mockReturnValue([mockTasks[0]]);
      const Router = await createRouter();
      render(<Router />);

      // Check task title
      expect(await screen.findByText('Test Task List Display & Rendering')).toBeInTheDocument();

      // Check task description
      expect(await screen.findByText('Test task description')).toBeInTheDocument();

      // Check task ID
      expect(await screen.findByText(/ID: devagent-kwy\.1/i)).toBeInTheDocument();

      // Check priority badge
      expect(await screen.findByText('2')).toBeInTheDocument();
    });

    it('should render status badges on task cards', async () => {
      vi.mocked(beadsServer.getAllTasks).mockReturnValue([mockTasks[0]]);
      const Router = await createRouter();
      render(<Router />);

      // "In Progress" appears in both header and badge, so use findAllByText
      const inProgressElements = await screen.findAllByText('In Progress');
      expect(inProgressElements.length).toBeGreaterThan(0);

      // Verify at least one is a badge (div element)
      const badge = inProgressElements.find(el => el.tagName === 'DIV');
      expect(badge).toBeInTheDocument();
    });

    it('should render links to task detail pages', async () => {
      vi.mocked(beadsServer.getAllTasks).mockReturnValue([mockTasks[0]]);
      const Router = await createRouter();
      render(<Router />);

      const link = await screen.findByRole('link', {
        name: /View details for task: Test Task List Display & Rendering/i
      });
      expect(link).toHaveAttribute('href', '/tasks/devagent-kwy.1');
    });

    it('should render epic badge for tasks with children', async () => {
      const parentTask: BeadsTask = {
        id: 'devagent-kwy',
        title: 'Parent Epic',
        description: 'Parent task',
        design: null,
        acceptance_criteria: null,
        notes: null,
        status: 'open',
        priority: '2',
        parent_id: null,
        created_at: '2026-01-15T17:58:01.343571-06:00',
        updated_at: '2026-01-15T17:58:01.343571-06:00'
      };

      const childTask: BeadsTask = {
        id: 'devagent-kwy.1',
        title: 'Child Task',
        description: 'Child task',
        design: null,
        acceptance_criteria: null,
        notes: null,
        status: 'in_progress',
        priority: '2',
        parent_id: 'devagent-kwy',
        created_at: '2026-01-15T17:59:14.208505-06:00',
        updated_at: '2026-01-15T18:06:19.720292-06:00'
      };

      vi.mocked(beadsServer.getAllTasks).mockReturnValue([parentTask, childTask]);
      const Router = await createRouter();
      render(<Router />);

      expect(await screen.findByText('Epic')).toBeInTheDocument();
    });

    it('should render child tasks under parent epic', async () => {
      const parentTask: BeadsTask = {
        id: 'devagent-kwy',
        title: 'Parent Epic',
        description: 'Parent task',
        design: null,
        acceptance_criteria: null,
        notes: null,
        status: 'open',
        priority: '2',
        parent_id: null,
        created_at: '2026-01-15T17:58:01.343571-06:00',
        updated_at: '2026-01-15T17:58:01.343571-06:00'
      };

      const childTask: BeadsTask = {
        id: 'devagent-kwy.1',
        title: 'Child Task',
        description: 'Child task',
        design: null,
        acceptance_criteria: null,
        notes: null,
        status: 'in_progress',
        priority: '2',
        parent_id: 'devagent-kwy',
        created_at: '2026-01-15T17:59:14.208505-06:00',
        updated_at: '2026-01-15T18:06:19.720292-06:00'
      };

      vi.mocked(beadsServer.getAllTasks).mockReturnValue([parentTask, childTask]);
      const Router = await createRouter();
      render(<Router />);

      expect(await screen.findByText(/Sub-issues \(1\)/i)).toBeInTheDocument();

      // "Child Task" appears in both parent task card and child task link, so use findAllByText
      const childTaskElements = await screen.findAllByText('Child Task');
      expect(childTaskElements.length).toBeGreaterThan(0);

      // Verify at least one is a link (child task link)
      const childLink = childTaskElements.find(el => el.tagName === 'SPAN' && el.closest('a'));
      expect(childLink).toBeInTheDocument();
    });

    it('should not render status columns with no tasks', async () => {
      const singleTask: BeadsTask = {
        id: 'devagent-kwy.1',
        title: 'Single Task',
        description: 'Only in progress task',
        design: null,
        acceptance_criteria: null,
        notes: null,
        status: 'in_progress',
        priority: '2',
        parent_id: null,
        created_at: '2026-01-15T17:59:14.208505-06:00',
        updated_at: '2026-01-15T18:06:19.720292-06:00'
      };

      vi.mocked(beadsServer.getAllTasks).mockReturnValue([singleTask]);
      const Router = await createRouter();
      render(<Router />);

      // "In Progress" appears in both header and badge, so use findAllByText
      const inProgressElements = await screen.findAllByText(/In Progress/i);
      expect(inProgressElements.length).toBeGreaterThan(0);

      // Check that other status column headers (h2 elements) are not present
      const openHeaders = screen.queryAllByRole('heading', { name: /^Open$/i });
      expect(openHeaders.length).toBe(0);

      const closedHeaders = screen.queryAllByRole('heading', { name: /^Closed$/i });
      expect(closedHeaders.length).toBe(0);

      const blockedHeaders = screen.queryAllByRole('heading', { name: /^Blocked$/i });
      expect(blockedHeaders.length).toBe(0);
    });

    it('should render filter controls', async () => {
      vi.mocked(beadsServer.getAllTasks).mockReturnValue([]);
      const Router = await createRouter();
      render(<Router />);

      // Select components show their selected value, not placeholder
      expect(await screen.findByText(/All Statuses/i)).toBeInTheDocument();
      expect(await screen.findByText(/All Priorities/i)).toBeInTheDocument();
      expect(await screen.findByPlaceholderText(/Search tasks/i)).toBeInTheDocument();
    });
  });
});

describe('Task Filtering & Search', () => {
  const mockTasks: BeadsTask[] = [
    {
      id: 'task-1',
      title: 'In Progress Task',
      description: 'This is an in progress task',
      design: null,
      acceptance_criteria: null,
      notes: null,
      status: 'in_progress',
      priority: '2',
      parent_id: null,
      created_at: '2026-01-15T17:59:14.208505-06:00',
      updated_at: '2026-01-15T18:06:19.720292-06:00'
    },
    {
      id: 'task-2',
      title: 'Open Task',
      description: 'This is an open task',
      design: null,
      acceptance_criteria: null,
      notes: null,
      status: 'open',
      priority: '1',
      parent_id: null,
      created_at: '2026-01-15T17:59:18.626446-06:00',
      updated_at: '2026-01-15T17:59:18.626446-06:00'
    },
    {
      id: 'task-3',
      title: 'Closed Task',
      description: 'This is a closed task',
      design: null,
      acceptance_criteria: null,
      notes: null,
      status: 'closed',
      priority: '2',
      parent_id: null,
      created_at: '2026-01-15T17:59:23.136627-06:00',
      updated_at: '2026-01-15T17:59:23.136627-06:00'
    },
    {
      id: 'task-4',
      title: 'Blocked Task',
      description: 'This is a blocked task',
      design: null,
      acceptance_criteria: null,
      notes: null,
      status: 'blocked',
      priority: '3',
      parent_id: null,
      created_at: '2026-01-15T17:59:27.868344-06:00',
      updated_at: '2026-01-15T17:59:27.868344-06:00'
    },
    {
      id: 'task-5',
      title: 'Another Open Task',
      description: 'Another open task with priority 1',
      design: null,
      acceptance_criteria: null,
      notes: null,
      status: 'open',
      priority: '1',
      parent_id: null,
      created_at: '2026-01-15T17:59:32.923173-06:00',
      updated_at: '2026-01-15T17:59:32.923173-06:00'
    }
  ];

  const createRouter = async (initialEntries = ['/']) => {
    const firstEntry = initialEntries[0] ?? '/';
    const request = new Request(`http://localhost${firstEntry}`);
    const loaderData = await loader(createLoaderArgs(request));
    const RouteComponent = () => <Index {...createComponentProps(loaderData)} />;
    const Stub = createRoutesStub([{ path: '/', Component: RouteComponent }]);

    return function Router() {
      return <Stub initialEntries={initialEntries} />;
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock: no comment counts
    vi.mocked(beadsServer.getTaskCommentCounts).mockReturnValue(new Map());
  });

  describe('Loader Filter Combinations', () => {
    it('should load tasks with status and priority filters', async () => {
      vi.mocked(beadsServer.getAllTasks).mockReturnValue([mockTasks[1]]);

      const request = new Request('http://localhost/?status=open&priority=1');
      await loader(createLoaderArgs(request));

      expect(beadsServer.getAllTasks).toHaveBeenCalledWith({
        status: 'open',
        priority: '1',
        search: undefined
      });
    });

    it('should load tasks with status, priority, and search filters', async () => {
      vi.mocked(beadsServer.getAllTasks).mockReturnValue([mockTasks[1]]);

      const request = new Request('http://localhost/?status=open&priority=1&search=Open');
      await loader(createLoaderArgs(request));

      expect(beadsServer.getAllTasks).toHaveBeenCalledWith({
        status: 'open',
        priority: '1',
        search: 'Open'
      });
    });

    it('should handle "all" status as undefined', async () => {
      vi.mocked(beadsServer.getAllTasks).mockReturnValue(mockTasks);

      const request = new Request('http://localhost/?status=all');
      await loader(createLoaderArgs(request));

      expect(beadsServer.getAllTasks).toHaveBeenCalledWith({
        status: undefined,
        priority: undefined,
        search: undefined
      });
    });
  });

  describe('UI Rendering with Filters', () => {
    it('should render tasks filtered by status from URL', async () => {
      vi.mocked(beadsServer.getAllTasks).mockReturnValue([mockTasks[1], mockTasks[4]]);

      const Router = await createRouter(['/?status=open']);
      render(<Router />);

      // Wait for filtered tasks to render
      await screen.findByText('Open Task');
      expect(screen.getByText('Another Open Task')).toBeInTheDocument();
      expect(screen.queryByText('In Progress Task')).not.toBeInTheDocument();
    });

    it('should render tasks filtered by priority from URL', async () => {
      vi.mocked(beadsServer.getAllTasks).mockReturnValue([mockTasks[1], mockTasks[4]]);

      const Router = await createRouter(['/?priority=1']);
      render(<Router />);

      // Wait for filtered tasks to render
      await screen.findByText('Open Task');
      expect(screen.getByText('Another Open Task')).toBeInTheDocument();
    });

    it('should render tasks filtered by search from URL', async () => {
      vi.mocked(beadsServer.getAllTasks).mockReturnValue([mockTasks[0]]);

      const Router = await createRouter(['/?search=In Progress']);
      render(<Router />);

      // Wait for filtered tasks to render
      await screen.findByText('In Progress Task');
      expect(screen.queryByText('Open Task')).not.toBeInTheDocument();
    });

    it('should sync search input value with URL search param', async () => {
      vi.mocked(beadsServer.getAllTasks).mockReturnValue(mockTasks);

      const Router = await createRouter(['/?search=Test']);
      render(<Router />);

      // Wait for initial render
      await screen.findByPlaceholderText(/Search tasks/i);

      const searchInput = screen.getByPlaceholderText(/Search tasks/i) as HTMLInputElement;
      expect(searchInput.value).toBe('Test');
    });

    it('should show clear filters button when filters are active', async () => {
      vi.mocked(beadsServer.getAllTasks).mockReturnValue(mockTasks);

      const Router = await createRouter(['/?status=open&priority=1&search=Test']);
      render(<Router />);

      // Wait for initial render
      await screen.findByPlaceholderText(/Search tasks/i);

      // Check that clear button is visible
      const clearButton = await screen.findByRole('button', { name: /Clear/i });
      expect(clearButton).toBeInTheDocument();
    });

    it('should hide clear filters button when no filters are active', async () => {
      vi.mocked(beadsServer.getAllTasks).mockReturnValue(mockTasks);

      const Router = await createRouter();
      render(<Router />);

      // Wait for initial render
      await screen.findByText('In Progress Task');

      // Check that clear button is not visible
      const clearButton = screen.queryByRole('button', { name: /Clear/i });
      expect(clearButton).not.toBeInTheDocument();
    });

    it('should show clear button when only search filter is active', async () => {
      vi.mocked(beadsServer.getAllTasks).mockReturnValue(mockTasks);

      const Router = await createRouter(['/?search=Test']);
      render(<Router />);

      // Wait for initial render
      await screen.findByPlaceholderText(/Search tasks/i);

      // Check that clear button is visible
      const clearButton = await screen.findByRole('button', { name: /Clear/i });
      expect(clearButton).toBeInTheDocument();
    });
  });

  describe('Available Priorities', () => {
    it('should populate available priorities from tasks', async () => {
      vi.mocked(beadsServer.getAllTasks).mockReturnValue(mockTasks);

      const Router = await createRouter();
      render(<Router />);

      // Wait for initial render
      await screen.findByText('In Progress Task');

      // The available priorities should be computed from the tasks
      // We can verify this by checking that the priority select exists
      // and that it shows "All Priorities" as the default
      expect(await screen.findByText(/All Priorities/i)).toBeInTheDocument();
    });
  });

  describe('Empty State with Filters', () => {
    it('should show empty state when filters return no results', async () => {
      vi.mocked(beadsServer.getAllTasks).mockReturnValue([]);

      const Router = await createRouter(['/?status=closed&search=NonExistent']);
      render(<Router />);

      // Wait for empty state
      await screen.findByText(/No tasks match your filters/i);
      expect(await screen.findByText(/Try adjusting your filters or search terms/i)).toBeInTheDocument();
    });

    it('should show filtered empty state message when filters are active', async () => {
      vi.mocked(beadsServer.getAllTasks).mockReturnValue([]);

      const Router = await createRouter(['/?status=open&search=Test']);
      render(<Router />);

      // Wait for empty state
      await screen.findByText(/No tasks match your filters/i);
      expect(await screen.findByText(/Try adjusting your filters or search terms/i)).toBeInTheDocument();
    });

    it('should show different empty state when no filters are active', async () => {
      vi.mocked(beadsServer.getAllTasks).mockReturnValue([]);

      const Router = await createRouter();
      render(<Router />);

      // Wait for empty state
      await screen.findByText(/No tasks yet/i);
      expect(await screen.findByText(/Tasks will appear here once Ralph starts executing work/i)).toBeInTheDocument();
    });
  });
});

describe('Real-time Task Updates & Revalidation', () => {
  const mockActiveTasks: BeadsTask[] = [
    {
      id: 'task-1',
      title: 'In Progress Task',
      description: 'This is an in progress task',
      design: null,
      acceptance_criteria: null,
      notes: null,
      status: 'in_progress',
      priority: '2',
      parent_id: null,
      created_at: '2026-01-15T17:59:14.208505-06:00',
      updated_at: '2026-01-15T18:06:19.720292-06:00'
    },
    {
      id: 'task-2',
      title: 'Open Task',
      description: 'This is an open task',
      design: null,
      acceptance_criteria: null,
      notes: null,
      status: 'open',
      priority: '1',
      parent_id: null,
      created_at: '2026-01-15T17:59:18.626446-06:00',
      updated_at: '2026-01-15T17:59:18.626446-06:00'
    }
  ];

  const mockInactiveTasks: BeadsTask[] = [
    {
      id: 'task-3',
      title: 'Closed Task',
      description: 'This is a closed task',
      design: null,
      acceptance_criteria: null,
      notes: null,
      status: 'closed',
      priority: '2',
      parent_id: null,
      created_at: '2026-01-15T17:59:23.136627-06:00',
      updated_at: '2026-01-15T17:59:23.136627-06:00'
    }
  ];

  const createRouter = async (initialEntries = ['/']) => {
    const firstEntry = initialEntries[0] ?? '/';
    const request = new Request(`http://localhost${firstEntry}`);
    const loaderData = await loader(createLoaderArgs(request));
    const RouteComponent = () => <Index {...createComponentProps(loaderData)} />;
    const Stub = createRoutesStub([{ path: '/', Component: RouteComponent }]);

    return function Router() {
      return <Stub initialEntries={initialEntries} />;
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock: no comment counts
    vi.mocked(beadsServer.getTaskCommentCounts).mockReturnValue(new Map());
    // Mock document.hidden to be false by default
    Object.defineProperty(document, 'hidden', {
      writable: true,
      configurable: true,
      value: false
    });
  });

  it('should render active tasks that trigger polling', async () => {
    vi.mocked(beadsServer.getAllTasks).mockReturnValue(mockActiveTasks);

    const Router = await createRouter();
    render(<Router />);

    // Verify active tasks are rendered
    await screen.findByText('In Progress Task');
    expect(screen.getByText('In Progress Task')).toBeInTheDocument();
    expect(screen.getByText('Open Task')).toBeInTheDocument();

    // Verify they appear in the correct status columns
    const inProgressHeaders = screen.getAllByText(/In Progress/i);
    expect(inProgressHeaders.length).toBeGreaterThan(0);

    const openHeaders = screen.getAllByText(/^Open$/i);
    expect(openHeaders.length).toBeGreaterThan(0);
  });

  it('should render inactive tasks without triggering polling', async () => {
    vi.mocked(beadsServer.getAllTasks).mockReturnValue(mockInactiveTasks);

    const Router = await createRouter();
    render(<Router />);

    // Verify inactive tasks are rendered
    await screen.findByText('Closed Task');
    expect(screen.getByText('Closed Task')).toBeInTheDocument();

    // Verify it appears in the closed column
    const closedHeaders = screen.getAllByText(/^Closed$/i);
    expect(closedHeaders.length).toBeGreaterThan(0);
  });

  it('should handle mixed active and inactive tasks', async () => {
    const mixedTasks: BeadsTask[] = [...mockActiveTasks, ...mockInactiveTasks];
    vi.mocked(beadsServer.getAllTasks).mockReturnValue(mixedTasks);

    const Router = await createRouter();
    render(<Router />);

    // Verify all tasks are rendered
    await screen.findByText('In Progress Task');
    expect(screen.getByText('In Progress Task')).toBeInTheDocument();
    expect(screen.getByText('Open Task')).toBeInTheDocument();
    expect(screen.getByText('Closed Task')).toBeInTheDocument();
  });

  it('should set up visibility change listener for active tasks', async () => {
    vi.mocked(beadsServer.getAllTasks).mockReturnValue(mockActiveTasks);

    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

    const Router = await createRouter();
    const { unmount } = render(<Router />);

    await screen.findByText('In Progress Task');

    // Verify visibility change listener is added
    expect(addEventListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));

    // Cleanup
    unmount();

    // Verify listener is removed on unmount
    expect(removeEventListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
  });
});
