import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import Index, { loader } from '../_index';
import type { BeadsTask } from '~/db/beads.server';
import * as beadsServer from '~/db/beads.server';

// Mock the database module
vi.mock('~/db/beads.server', () => ({
  getAllTasks: vi.fn()
}));

// Mock ThemeToggle to avoid theme provider dependencies
vi.mock('~/components/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>
}));

describe('Task List Display & Rendering', () => {
  const mockTasks: BeadsTask[] = [
    {
      id: 'devagent-kwy.1',
      title: 'Test Task List Display & Rendering',
      description: 'Test task description',
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
      status: 'blocked',
      priority: '3',
      parent_id: null,
      created_at: '2026-01-15T17:59:27.868344-06:00',
      updated_at: '2026-01-15T17:59:27.868344-06:00'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loader', () => {
    it('should load tasks with no filters', async () => {
      vi.mocked(beadsServer.getAllTasks).mockReturnValue(mockTasks);

      const request = new Request('http://localhost/');
      const result = await loader({ request } as { request: Request });

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
      const result = await loader({ request } as { request: Request });

      expect(beadsServer.getAllTasks).toHaveBeenCalledWith({
        status: 'in_progress'
      });
      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].status).toBe('in_progress');
    });

    it('should load tasks with priority filter', async () => {
      vi.mocked(beadsServer.getAllTasks).mockReturnValue([mockTasks[0], mockTasks[2]]);

      const request = new Request('http://localhost/?priority=2');
      await loader({ request } as { request: Request });

      expect(beadsServer.getAllTasks).toHaveBeenCalledWith({
        priority: '2'
      });
    });

    it('should load tasks with search filter', async () => {
      vi.mocked(beadsServer.getAllTasks).mockReturnValue([mockTasks[0]]);

      const request = new Request('http://localhost/?search=Display');
      await loader({ request } as { request: Request });

      expect(beadsServer.getAllTasks).toHaveBeenCalledWith({
        search: 'Display'
      });
    });

    it('should attach children to parent tasks', async () => {
      const parentTask: BeadsTask = {
        id: 'devagent-kwy',
        title: 'Parent Epic',
        description: 'Parent task',
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
          status: 'in_progress',
          priority: '2',
          parent_id: 'devagent-kwy',
          created_at: '2026-01-15T17:59:14.208505-06:00',
          updated_at: '2026-01-15T18:06:19.720292-06:00'
        }
      ];

      vi.mocked(beadsServer.getAllTasks).mockReturnValue([parentTask, ...childTasks]);

      const request = new Request('http://localhost/');
      const result = await loader({ request } as { request: Request });

      const parentWithChildren = result.tasks.find(t => t.id === 'devagent-kwy');
      expect(parentWithChildren?.children).toHaveLength(1);
      expect(parentWithChildren?.children[0].id).toBe('devagent-kwy.1');
    });
  });

  describe('Task List Rendering', () => {
    const createRouter = (initialEntries = ['/']) => {
      return createMemoryRouter(
        [
        {
          path: '/',
          element: <Index />,
          loader: async ({ request }) => {
            return loader({ request } as { request: Request });
          }
        }
        ],
        { initialEntries }
      );
    };

    it('should render page title', async () => {
      vi.mocked(beadsServer.getAllTasks).mockReturnValue([]);
      const router = createRouter();
      render(<RouterProvider router={router} />);

      expect(await screen.findByRole('heading', { name: /Ralph Monitoring/i })).toBeInTheDocument();
    });

    it('should render theme toggle', async () => {
      vi.mocked(beadsServer.getAllTasks).mockReturnValue([]);
      const router = createRouter();
      render(<RouterProvider router={router} />);

      expect(await screen.findByTestId('theme-toggle')).toBeInTheDocument();
    });

    it('should render empty state when no tasks', async () => {
      vi.mocked(beadsServer.getAllTasks).mockReturnValue([]);
      const router = createRouter();
      render(<RouterProvider router={router} />);

      expect(await screen.findByText(/No tasks yet/i)).toBeInTheDocument();
      expect(await screen.findByText(/Tasks will appear here once Ralph starts executing work/i)).toBeInTheDocument();
    });

    it('should render tasks grouped by status columns', async () => {
      vi.mocked(beadsServer.getAllTasks).mockReturnValue(mockTasks);
      const router = createRouter();
      render(<RouterProvider router={router} />);

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
      const router = createRouter();
      render(<RouterProvider router={router} />);

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
      const router = createRouter();
      render(<RouterProvider router={router} />);

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
      const router = createRouter();
      render(<RouterProvider router={router} />);

      // "In Progress" appears in both header and badge, so use findAllByText
      const inProgressElements = await screen.findAllByText('In Progress');
      expect(inProgressElements.length).toBeGreaterThan(0);
      
      // Verify at least one is a badge (div element)
      const badge = inProgressElements.find(el => el.tagName === 'DIV');
      expect(badge).toBeInTheDocument();
    });

    it('should render links to task detail pages', async () => {
      vi.mocked(beadsServer.getAllTasks).mockReturnValue([mockTasks[0]]);
      const router = createRouter();
      render(<RouterProvider router={router} />);

      const link = await screen.findByRole('link', { name: /View details for task: Test Task List Display & Rendering/i });
      expect(link).toHaveAttribute('href', '/tasks/devagent-kwy.1');
    });

    it('should render epic badge for tasks with children', async () => {
      const parentTask: BeadsTask = {
        id: 'devagent-kwy',
        title: 'Parent Epic',
        description: 'Parent task',
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
        status: 'in_progress',
        priority: '2',
        parent_id: 'devagent-kwy',
        created_at: '2026-01-15T17:59:14.208505-06:00',
        updated_at: '2026-01-15T18:06:19.720292-06:00'
      };

      vi.mocked(beadsServer.getAllTasks).mockReturnValue([parentTask, childTask]);
      const router = createRouter();
      render(<RouterProvider router={router} />);

      expect(await screen.findByText('Epic')).toBeInTheDocument();
    });

    it('should render child tasks under parent epic', async () => {
      const parentTask: BeadsTask = {
        id: 'devagent-kwy',
        title: 'Parent Epic',
        description: 'Parent task',
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
        status: 'in_progress',
        priority: '2',
        parent_id: 'devagent-kwy',
        created_at: '2026-01-15T17:59:14.208505-06:00',
        updated_at: '2026-01-15T18:06:19.720292-06:00'
      };

      vi.mocked(beadsServer.getAllTasks).mockReturnValue([parentTask, childTask]);
      const router = createRouter();
      render(<RouterProvider router={router} />);

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
        status: 'in_progress',
        priority: '2',
        parent_id: null,
        created_at: '2026-01-15T17:59:14.208505-06:00',
        updated_at: '2026-01-15T18:06:19.720292-06:00'
      };

      vi.mocked(beadsServer.getAllTasks).mockReturnValue([singleTask]);
      const router = createRouter();
      render(<RouterProvider router={router} />);

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
      const router = createRouter();
      render(<RouterProvider router={router} />);

      // Select components show their selected value, not placeholder
      expect(await screen.findByText(/All Statuses/i)).toBeInTheDocument();
      expect(await screen.findByText(/All Priorities/i)).toBeInTheDocument();
      expect(await screen.findByPlaceholderText(/Search tasks/i)).toBeInTheDocument();
    });
  });
});
