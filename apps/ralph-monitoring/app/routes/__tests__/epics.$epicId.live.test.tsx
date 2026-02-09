/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EpicLive, { loader } from '../epics.$epicId.live';
import type { Route } from '../+types/epics.$epicId.live';
import * as beadsServer from '~/db/beads.server';
import * as loopControl from '~/utils/loop-control.server';
import { createRoutesStub } from '~/lib/test-utils/router';

vi.mock('~/db/beads.server', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof beadsServer;
  return { ...actual, getTaskById: vi.fn(), getEpicById: vi.fn(), getTasksByEpicId: vi.fn() };
});
vi.mock('~/utils/loop-control.server', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof loopControl;
  return { ...actual, getSignalState: vi.fn() };
});

const mockEpic: beadsServer.BeadsTask = {
  id: 'epic-1',
  title: 'Test Epic',
  description: null,
  design: null,
  acceptance_criteria: null,
  notes: null,
  status: 'in_progress',
  priority: null,
  parent_id: null,
  created_at: '2026-01-30T10:00:00Z',
  updated_at: '2026-01-30T12:00:00Z',
};

const mockSummary: beadsServer.EpicSummary = {
  id: 'epic-1',
  title: 'Test Epic',
  status: 'in_progress',
  task_count: 2,
  completed_count: 0,
  progress_pct: 0,
  updated_at: '2026-01-30T12:00:00Z',
};

const mockTasksWithCurrent: beadsServer.EpicTask[] = [
  {
    id: 'epic-1.task-a',
    title: 'Current task title',
    description: null,
    design: null,
    acceptance_criteria: null,
    notes: null,
    status: 'in_progress',
    priority: null,
    parent_id: 'epic-1',
    created_at: '2026-01-30T10:00:00Z',
    updated_at: '2026-01-30T11:00:00Z',
    started_at: '2026-01-30T10:00:00Z',
    ended_at: null,
    duration_ms: null,
    agent_type: 'engineering',
  },
];

const mockTasksIdle: beadsServer.EpicTask[] = [
  {
    ...mockEpic,
    id: 'epic-1.task-a',
    title: 'Task A',
    status: 'closed',
    parent_id: 'epic-1',
    agent_type: null,
  },
];

function createLoaderArgs(epicId: string): Route.LoaderArgs {
  return {
    request: new Request(`http://test/epics/${epicId}/live`),
    params: { epicId },
    context: {},
    unstable_pattern: '',
  };
}

function createComponentProps(loaderData: Awaited<ReturnType<typeof loader>>): Route.ComponentProps {
  return {
    loaderData,
    params: { epicId: loaderData.epicId },
    matches: [] as unknown as Route.ComponentProps['matches'],
  };
}

describe('epics.$epicId.live loader', () => {
  beforeEach(() => {
    vi.mocked(beadsServer.getTaskById).mockReturnValue(mockEpic);
    vi.mocked(beadsServer.getEpicById).mockReturnValue(mockSummary);
    vi.mocked(beadsServer.getTasksByEpicId).mockReturnValue(mockTasksWithCurrent);
    vi.mocked(loopControl.getSignalState).mockReturnValue({ pause: false, resume: false, skipTaskIds: [] });
  });

  it('returns epic and current task when one is in progress', async () => {
    const result = await loader(createLoaderArgs('epic-1'));
    expect(result).toMatchObject({
      epicId: 'epic-1',
      epicTitle: 'Test Epic',
      runStatus: 'running',
    });
    expect(result.currentTask).not.toBeNull();
    expect(result.currentTask?.id).toBe('epic-1.task-a');
    expect(result.currentTask?.title).toBe('Current task title');
  });

  it('returns currentTask null when no task in progress', async () => {
    vi.mocked(beadsServer.getTasksByEpicId).mockReturnValue(mockTasksIdle);
    const result = await loader(createLoaderArgs('epic-1'));
    expect(result.currentTask).toBeNull();
    expect(result.runStatus).toBe('idle');
  });

  it('throws 404 when epic not found', async () => {
    vi.mocked(beadsServer.getTaskById).mockReturnValue(null);
    await expect(loader(createLoaderArgs('epic-1'))).rejects.toMatchObject({
      type: 'DataWithResponseInit',
      init: { status: 404 },
    });
  });
});

describe('epics.$epicId.live component', () => {
  let EventSourceMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.mocked(beadsServer.getTaskById).mockReturnValue(mockEpic);
    vi.mocked(beadsServer.getEpicById).mockReturnValue(mockSummary);
    vi.mocked(beadsServer.getTasksByEpicId).mockReturnValue(mockTasksWithCurrent);
    vi.mocked(loopControl.getSignalState).mockReturnValue({ pause: false, resume: false, skipTaskIds: [] });
    EventSourceMock = vi.fn().mockImplementation((_url: string) => {
      const listeners: { open?: () => void; message?: (e: MessageEvent) => void; error?: () => void } = {};
      return {
        addEventListener(event: string, fn: () => void) {
          if (event === 'open') listeners.open = fn;
          if (event === 'message') listeners.message = fn;
          if (event === 'error') listeners.error = fn;
        },
        get onopen() {
          return listeners.open;
        },
        set onopen(fn) {
          listeners.open = fn;
        },
        get onmessage() {
          return listeners.message;
        },
        set onmessage(fn) {
          listeners.message = fn;
        },
        get onerror() {
          return listeners.error;
        },
        set onerror(fn) {
          listeners.error = fn;
        },
        close: vi.fn(),
      };
    });
    (globalThis as unknown as { EventSource: typeof EventSource }).EventSource = EventSourceMock;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders header with back link and task name when currentTask is set', async () => {
    const loaderData = await loader(createLoaderArgs('epic-1'));
    const props = createComponentProps(loaderData);
    const Stub = createRoutesStub([
      { path: '/epics/:epicId/live', Component: () => <EpicLive {...props} /> },
    ]);
    render(<Stub initialEntries={['/epics/epic-1/live']} />);

    expect(screen.getByRole('link', { name: /back to loop detail/i })).toHaveAttribute('href', '/epics/epic-1');
    expect(screen.getByText('Current task title')).toBeInTheDocument();
    expect(screen.getByText('Running')).toBeInTheDocument();
  });

  it('renders no active task message when currentTask is null', async () => {
    vi.mocked(beadsServer.getTasksByEpicId).mockReturnValue(mockTasksIdle);
    const loaderData = await loader(createLoaderArgs('epic-1'));
    const props = createComponentProps(loaderData);
    const Stub = createRoutesStub([
      { path: '/epics/:epicId/live', Component: () => <EpicLive {...props} /> },
    ]);
    render(<Stub initialEntries={['/epics/epic-1/live']} />);

    expect(screen.getByText(/No active task\. Start the loop/)).toBeInTheDocument();
  });

  it('connects to stream URL for current task when currentTask is set', async () => {
    const loaderData = await loader(createLoaderArgs('epic-1'));
    const props = createComponentProps(loaderData);
    const Stub = createRoutesStub([
      { path: '/epics/:epicId/live', Component: () => <EpicLive {...props} /> },
    ]);
    render(<Stub initialEntries={['/epics/epic-1/live']} />);

    await waitFor(() => {
      expect(EventSourceMock).toHaveBeenCalledWith('/api/logs/epic-1.task-a/stream');
    });
  });

  it('tap to pause shows resume button; resume restores', async () => {
    const user = userEvent.setup();
    const loaderData = await loader(createLoaderArgs('epic-1'));
    const props = createComponentProps(loaderData);
    const Stub = createRoutesStub([
      { path: '/epics/:epicId/live', Component: () => <EpicLive {...props} /> },
    ]);
    render(<Stub initialEntries={['/epics/epic-1/live']} />);

    const logArea = screen.getByRole('log');
    expect(screen.queryByRole('button', { name: /resume auto-scroll/i })).not.toBeInTheDocument();

    await user.click(logArea);
    expect(screen.getByRole('button', { name: /resume auto-scroll/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /resume auto-scroll/i }));
    expect(screen.queryByRole('button', { name: /resume auto-scroll/i })).not.toBeInTheDocument();
  });
});
