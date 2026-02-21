/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRoutesStub } from '~/lib/test-utils/router';
import { NowCard } from '../NowCard';
import type { EpicTask } from '~/db/beads.types';
import type { RalphExecutionLog } from '~/db/beads.types';

const mockTask: EpicTask = {
  id: 'epic-1.task-a',
  title: 'Implement feature',
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
} as EpicTask;

const mockLog: RalphExecutionLog = {
  task_id: 'epic-1.task-b',
  agent_type: 'qa',
  started_at: '2026-01-30T09:00:00Z',
  ended_at: '2026-01-30T09:05:00Z',
  status: 'success',
  iteration: 1,
  log_file_path: null,
};

const taskIdToTitle: Record<string, string> = {
  'epic-1.task-a': 'Implement feature',
  'epic-1.task-b': 'QA review',
};

describe('NowCard', () => {

  it('renders running state with task name, agent, elapsed, and Watch Live link', () => {
    const Stub = createRoutesStub([
      {
        path: '/',
        Component: function Test() {
          return (
            <NowCard
              epicId="epic-1"
              currentTask={mockTask}
              lastCompletedLog={null}
              taskIdToTitle={taskIdToTitle}
              runStatus="running"
            />
          );
        },
      },
    ]);
    render(<Stub initialEntries={['/']} />);

    expect(screen.getByTestId('now-card')).toBeInTheDocument();
    expect(screen.getByText('Now')).toBeInTheDocument();
    expect(screen.getByText('Implement feature')).toBeInTheDocument();
    expect(screen.getByText(/engineering/)).toBeInTheDocument();
    const watchLive = screen.getByRole('link', { name: /watch live/i });
    expect(watchLive).toBeInTheDocument();
    expect(watchLive).toHaveAttribute('href', '/epics/epic-1/live');
  });

  it('renders idle state with last completed task and outcome', () => {
    const Stub = createRoutesStub([
      {
        path: '/',
        Component: function Test() {
          return (
            <NowCard
              epicId="epic-1"
              currentTask={null}
              lastCompletedLog={mockLog}
              taskIdToTitle={taskIdToTitle}
              runStatus="idle"
            />
          );
        },
      },
    ]);
    render(<Stub initialEntries={['/']} />);

    expect(screen.getByTestId('now-card')).toBeInTheDocument();
    expect(screen.getByText('Last completed')).toBeInTheDocument();
    expect(screen.getByText('QA review')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('renders idle state with failed outcome', () => {
    const failedLog: RalphExecutionLog = { ...mockLog, status: 'failed' };
    const Stub = createRoutesStub([
      {
        path: '/',
        Component: function Test() {
          return (
            <NowCard
              epicId="epic-1"
              currentTask={null}
              lastCompletedLog={failedLog}
              taskIdToTitle={taskIdToTitle}
              runStatus="idle"
            />
          );
        },
      },
    ]);
    render(<Stub initialEntries={['/']} />);

    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('renders idle state with no activity yet when no last log', () => {
    const Stub = createRoutesStub([{ path: '/', Component: () => <NowCard epicId="epic-1" currentTask={null} lastCompletedLog={null} taskIdToTitle={{}} runStatus="idle" /> }]);
    render(<Stub initialEntries={['/']} />);

    expect(screen.getByText('No activity yet')).toBeInTheDocument();
  });

  it('renders paused state with last completed', () => {
    const Stub = createRoutesStub([
      {
        path: '/',
        Component: function Test() {
          return (
            <NowCard
              epicId="epic-1"
              currentTask={null}
              lastCompletedLog={mockLog}
              taskIdToTitle={taskIdToTitle}
              runStatus="paused"
            />
          );
        },
      },
    ]);
    render(<Stub initialEntries={['/']} />);

    expect(screen.getByText('Paused')).toBeInTheDocument();
  });
});
