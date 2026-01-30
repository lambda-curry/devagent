/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import EpicDetail, { loader } from '../epics.$epicId';
import type { Route } from '../+types/epics.$epicId';
import * as beadsServer from '~/db/beads.server';
import { createRoutesStub } from '~/lib/test-utils/router';

const mockExecutionLogs: beadsServer.RalphExecutionLog[] = [
  {
    task_id: 'epic-1.task-a',
    agent_type: 'engineering',
    started_at: '2026-01-30T10:00:00Z',
    ended_at: '2026-01-30T10:02:00Z',
    status: 'success',
    iteration: 1,
  },
  {
    task_id: 'epic-1.task-b',
    agent_type: 'qa',
    started_at: '2026-01-30T10:05:00Z',
    ended_at: null,
    status: 'running',
    iteration: 1,
  },
];

vi.mock('~/db/beads.server', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof beadsServer;
  return {
    ...actual,
    getTaskById: vi.fn(),
    getEpicById: vi.fn(),
    getTasksByEpicId: vi.fn(),
    getExecutionLogs: vi.fn(),
  };
});

vi.mock('~/components/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}));

const createLoaderArgs = (epicId: string): Route.LoaderArgs => ({
  request: new Request(`http://test/epics/${epicId}`),
  params: { epicId },
  context: {},
  unstable_pattern: '',
});

const createComponentProps = (
  loaderData: Awaited<ReturnType<typeof loader>>
): Route.ComponentProps => ({
  loaderData,
  params: { epicId: loaderData.epic.id },
  matches: [] as unknown as Route.ComponentProps['matches'],
});

const mockEpic: beadsServer.BeadsTask = {
  id: 'epic-1',
  title: 'Dashboard Epic',
  description: 'Epic description',
  design: null,
  acceptance_criteria: null,
  notes: null,
  status: 'in_progress',
  priority: 'P1',
  parent_id: null,
  created_at: '2026-01-30T10:00:00Z',
  updated_at: '2026-01-30T12:00:00Z',
};

const mockSummary: beadsServer.EpicSummary = {
  id: 'epic-1',
  title: 'Dashboard Epic',
  status: 'in_progress',
  task_count: 4,
  completed_count: 2,
  progress_pct: 50,
  updated_at: '2026-01-30T12:00:00Z',
};

const mockTasks: beadsServer.EpicTask[] = [
  {
    ...mockEpic,
    agent_type: 'project-manager',
    duration_ms: 60_000,
  },
  {
    id: 'epic-1.task-a',
    title: 'Task A',
    description: null,
    design: null,
    acceptance_criteria: null,
    notes: null,
    status: 'closed',
    priority: null,
    parent_id: 'epic-1',
    created_at: '2026-01-30T10:00:00Z',
    updated_at: '2026-01-30T11:00:00Z',
    duration_ms: 120_000,
    agent_type: 'engineering',
  },
  {
    id: 'epic-1.task-b',
    title: 'Task B',
    description: null,
    design: null,
    acceptance_criteria: null,
    notes: null,
    status: 'open',
    priority: null,
    parent_id: 'epic-1',
    created_at: '2026-01-30T10:00:00Z',
    updated_at: '2026-01-30T11:00:00Z',
    duration_ms: null,
    agent_type: null,
  },
];

describe('epics.$epicId loader', () => {
  beforeEach(() => {
    vi.mocked(beadsServer.getTaskById).mockReturnValue(mockEpic);
    vi.mocked(beadsServer.getEpicById).mockReturnValue(mockSummary);
    vi.mocked(beadsServer.getTasksByEpicId).mockReturnValue(mockTasks);
    vi.mocked(beadsServer.getExecutionLogs).mockReturnValue(mockExecutionLogs);
  });

  it('returns epic, summary, tasks, executionLogs, and taskIdToTitle when epic exists and is root-level', async () => {
    const result = await loader(createLoaderArgs('epic-1'));

    expect(result.epic).toEqual(mockEpic);
    expect(result.summary).toEqual(mockSummary);
    expect(result.tasks).toEqual(mockTasks);
    expect(result.executionLogs).toEqual(mockExecutionLogs);
    expect(result.taskIdToTitle).toEqual({
      'epic-1': 'Dashboard Epic',
      'epic-1.task-a': 'Task A',
      'epic-1.task-b': 'Task B',
    });
    expect(beadsServer.getTaskById).toHaveBeenCalledWith('epic-1');
    expect(beadsServer.getEpicById).toHaveBeenCalledWith('epic-1');
    expect(beadsServer.getTasksByEpicId).toHaveBeenCalledWith('epic-1');
    expect(beadsServer.getExecutionLogs).toHaveBeenCalledWith('epic-1');
  });

  it('throws 400 when epicId is missing', async () => {
    const args = {
      request: new Request('http://test/epics'),
      params: {},
      context: {},
      unstable_pattern: '',
    } as Route.LoaderArgs;

    const thrown = await loader(args).catch((e) => e);

    expect(thrown).toMatchObject({ init: { status: 400 } });
  });

  it('throws 404 when task not found', async () => {
    vi.mocked(beadsServer.getTaskById).mockReturnValue(null);

    const thrown = await loader(createLoaderArgs('epic-1')).catch((e) => e);

    expect(thrown).toMatchObject({ init: { status: 404 } });
  });

  it('throws 404 when task has parent (not root-level epic)', async () => {
    vi.mocked(beadsServer.getTaskById).mockReturnValue({
      ...mockEpic,
      id: 'parent.child',
      parent_id: 'parent',
    });

    const thrown = await loader(createLoaderArgs('parent.child')).catch((e) => e);

    expect(thrown).toMatchObject({ init: { status: 404 } });
  });

  it('throws 404 when epic summary not found', async () => {
    vi.mocked(beadsServer.getEpicById).mockReturnValue(null);

    const thrown = await loader(createLoaderArgs('epic-1')).catch((e) => e);

    expect(thrown).toMatchObject({ init: { status: 404 } });
  });
});

describe('epics.$epicId component', () => {
  beforeEach(() => {
    vi.mocked(beadsServer.getTaskById).mockReturnValue(mockEpic);
    vi.mocked(beadsServer.getEpicById).mockReturnValue(mockSummary);
    vi.mocked(beadsServer.getTasksByEpicId).mockReturnValue(mockTasks);
    vi.mocked(beadsServer.getExecutionLogs).mockReturnValue(mockExecutionLogs);
  });

  it('renders epic title, progress bar, task count, and task list', async () => {
    const loaderData = await loader(createLoaderArgs('epic-1'));
    const RouteComponent = () => <EpicDetail {...createComponentProps(loaderData)} />;
    const Stub = createRoutesStub([{ path: '/epics/:epicId', Component: RouteComponent }]);
    render(<Stub initialEntries={['/epics/epic-1']} />);

    expect(screen.getByRole('heading', { name: 'Dashboard Epic' })).toBeInTheDocument();
    expect(screen.getByText('2 of 4 tasks completed')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: '50%' })).toBeInTheDocument();
    expect(screen.getByText('Task A')).toBeInTheDocument();
    expect(screen.getByText('Task B')).toBeInTheDocument();
    expect(screen.getAllByText('engineering').length).toBeGreaterThanOrEqual(1);
  });

  it('renders link back to Epics', async () => {
    const loaderData = await loader(createLoaderArgs('epic-1'));
    const RouteComponent = () => <EpicDetail {...createComponentProps(loaderData)} />;
    const Stub = createRoutesStub([{ path: '/epics/:epicId', Component: RouteComponent }]);
    render(<Stub initialEntries={['/epics/epic-1']} />);

    const link = screen.getByRole('link', { name: /epics/i });
    expect(link).toHaveAttribute('href', '/epics');
  });

  it('renders timeline below task list with same data source and filter controls', async () => {
    const loaderData = await loader(createLoaderArgs('epic-1'));
    const RouteComponent = () => <EpicDetail {...createComponentProps(loaderData)} />;
    const Stub = createRoutesStub([{ path: '/epics/:epicId', Component: RouteComponent }]);
    render(<Stub initialEntries={['/epics/epic-1']} />);

    expect(screen.getByRole('heading', { name: 'Timeline' })).toBeInTheDocument();
    expect(screen.getByLabelText('Agent')).toBeInTheDocument();
    expect(screen.getByLabelText('Time range')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Agent activity timeline' })).toBeInTheDocument();
    expect(screen.getByTestId('timeline-row-engineering')).toBeInTheDocument();
    expect(screen.getByTestId('timeline-row-qa')).toBeInTheDocument();
    expect(screen.getByText('Task A')).toBeInTheDocument();
    expect(screen.getByText('Task B')).toBeInTheDocument();
  });
});
