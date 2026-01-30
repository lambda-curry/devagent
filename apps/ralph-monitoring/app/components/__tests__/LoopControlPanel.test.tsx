/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRoutesStub } from '~/lib/test-utils/router';
import { LoopControlPanel } from '../LoopControlPanel';
import type { EpicTask } from '~/db/beads.server';

const mockEpicTask = (overrides: Partial<EpicTask> = {}): EpicTask =>
  ({
    id: 'epic-1.a',
    title: 'Task A',
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
    ...overrides,
  }) as EpicTask;

const startAction = vi.fn().mockResolvedValue({ success: true });
const pauseAction = vi.fn().mockResolvedValue({ success: true });
const resumeAction = vi.fn().mockResolvedValue({ success: true });
const skipAction = vi.fn().mockResolvedValue({ success: true });

function makePanelProps(overrides: {
  runStatus?: 'idle' | 'running' | 'paused' | 'stopped';
  tasks?: EpicTask[];
} = {}) {
  return {
    epicId: 'epic-1',
    runStatus: 'idle' as const,
    tasks: [] as EpicTask[],
    ...overrides,
  };
}

describe('LoopControlPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));
  });

  const routes = [
    {
      path: '/',
      Component: function PanelRoute() {
        return (
          <LoopControlPanel
            epicId={makePanelProps().epicId}
            runStatus={makePanelProps().runStatus}
            tasks={makePanelProps().tasks}
          />
        );
      },
    },
    {
      path: 'api/loop/start',
      action: startAction,
    },
    {
      path: 'api/loop/pause',
      action: pauseAction,
    },
    {
      path: 'api/loop/resume',
      action: resumeAction,
    },
    {
      path: 'api/loop/skip/:taskId',
      action: skipAction,
    },
  ];

  it('shows status Stopped and Start button when idle', () => {
    const Stub = createRoutesStub(routes as never);
    render(<Stub initialEntries={['/']} />);

    expect(screen.getByText(/Status: Stopped/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start run/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start run/i })).not.toBeDisabled();
    expect(screen.queryByRole('button', { name: /pause run/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /resume run/i })).not.toBeInTheDocument();
  });

  it('shows status Running and Pause button when running', () => {
    const Stub = createRoutesStub([
      {
        path: '/',
        Component: () => (
          <LoopControlPanel
            epicId="epic-1"
            runStatus="running"
            tasks={[]}
          />
        ),
      },
      { path: 'api/loop/pause', action: pauseAction },
    ] as never);
    render(<Stub initialEntries={['/']} />);

    expect(screen.getByText(/Status: Running/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pause run/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /start run/i })).not.toBeInTheDocument();
  });

  it('shows status Paused and Resume button when paused', () => {
    const Stub = createRoutesStub([
      {
        path: '/',
        Component: () => (
          <LoopControlPanel epicId="epic-1" runStatus="paused" tasks={[]} />
        ),
      },
      { path: 'api/loop/resume', action: resumeAction },
    ] as never);
    render(<Stub initialEntries={['/']} />);

    expect(screen.getByText(/Status: Paused/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /resume run/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /start run/i })).not.toBeInTheDocument();
  });

  it('shows Skip button for in_progress task', () => {
    const inProgressTask = mockEpicTask({ id: 'epic-1.b', title: 'Current task', status: 'in_progress' });
    const Stub = createRoutesStub([
      {
        path: '/',
        Component: () => (
          <LoopControlPanel
            epicId="epic-1"
            runStatus="running"
            tasks={[inProgressTask]}
          />
        ),
      },
      { path: 'api/loop/skip/:taskId', action: skipAction },
    ] as never);
    render(<Stub initialEntries={['/']} />);

    expect(screen.getByRole('button', { name: /skip task current task/i })).toBeInTheDocument();
  });

  it('disables Start when runStatus is running', () => {
    const Stub = createRoutesStub([
      {
        path: '/',
        Component: () => (
          <LoopControlPanel epicId="epic-1" runStatus="running" tasks={[]} />
        ),
      },
    ] as never);
    render(<Stub initialEntries={['/']} />);

    expect(screen.queryByRole('button', { name: /start run/i })).not.toBeInTheDocument();
  });

  it('disables all controls when disabled prop is true', () => {
    const Stub = createRoutesStub([
      {
        path: '/',
        Component: () => (
          <LoopControlPanel
            epicId="epic-1"
            runStatus="idle"
            tasks={[]}
            disabled
          />
        ),
      },
    ] as never);
    render(<Stub initialEntries={['/']} />);

    expect(screen.getByRole('button', { name: /start run/i })).toBeDisabled();
  });

  it('calls window.confirm before Pause and submits when confirmed', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.mocked(globalThis.confirm).mockReturnValue(true);

    const Stub = createRoutesStub([
      {
        path: '/',
        Component: () => (
          <LoopControlPanel epicId="epic-1" runStatus="running" tasks={[]} />
        ),
      },
      { path: 'api/loop/pause', action: pauseAction },
    ] as never);
    render(<Stub initialEntries={['/']} />);

    await user.click(screen.getByRole('button', { name: /pause run/i }));

    expect(confirmSpy).toHaveBeenCalledWith('Pause the loop after the current task?');
    expect(pauseAction).toHaveBeenCalled();
  });

  it('does not submit Pause when user cancels confirm', async () => {
    const user = userEvent.setup();
    vi.mocked(globalThis.confirm).mockReturnValue(false);

    const Stub = createRoutesStub([
      {
        path: '/',
        Component: () => (
          <LoopControlPanel epicId="epic-1" runStatus="running" tasks={[]} />
        ),
      },
      { path: 'api/loop/pause', action: pauseAction },
    ] as never);
    render(<Stub initialEntries={['/']} />);

    await user.click(screen.getByRole('button', { name: /pause run/i }));

    expect(pauseAction).not.toHaveBeenCalled();
  });
});
