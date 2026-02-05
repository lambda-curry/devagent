/** @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { EpicLogPanel, getDefaultLogPanelTaskId } from '../EpicLogPanel';
import type { EpicTask } from '~/db/beads.types';
import type { TaskLogInfo } from '../EpicLogPanel';
import { createRoutesStub } from '~/lib/test-utils/router';

vi.mock('../LogViewer', () => ({
  LogViewer: ({
    taskId,
    isTaskActive,
    hasLogs,
    hasExecutionHistory,
  }: {
    taskId: string;
    isTaskActive: boolean;
    hasLogs: boolean;
    hasExecutionHistory: boolean;
  }) => (
    <div data-testid="log-viewer" data-task-id={taskId} data-active={String(isTaskActive)} data-has-logs={String(hasLogs)} data-has-history={String(hasExecutionHistory)}>
      LogViewer({taskId})
    </div>
  ),
}));

const baseTask = (
  id: string,
  title: string,
  status: EpicTask['status']
): EpicTask => ({
  id,
  title,
  description: null,
  design: null,
  acceptance_criteria: null,
  notes: null,
  status,
  priority: null,
  parent_id: id.includes('.') ? id.slice(0, id.lastIndexOf('.')) : null,
  created_at: '2026-01-30T10:00:00Z',
  updated_at: '2026-01-30T12:00:00Z',
  agent_type: null,
});

describe('getDefaultLogPanelTaskId', () => {
  it('returns null when tasks array is empty', () => {
    expect(getDefaultLogPanelTaskId([])).toBeNull();
  });

  it('prefers in_progress task when available', () => {
    const tasks: EpicTask[] = [
      baseTask('epic-1.a', 'Task A', 'closed'),
      baseTask('epic-1.b', 'Task B', 'in_progress'),
      baseTask('epic-1.c', 'Task C', 'open'),
    ];
    expect(getDefaultLogPanelTaskId(tasks)).toBe('epic-1.b');
  });

  it('returns first task when no in_progress task', () => {
    const tasks: EpicTask[] = [
      baseTask('epic-1.a', 'Task A', 'closed'),
      baseTask('epic-1.b', 'Task B', 'open'),
    ];
    expect(getDefaultLogPanelTaskId(tasks)).toBe('epic-1.a');
  });

  it('returns only task when single task', () => {
    const tasks: EpicTask[] = [baseTask('epic-1.1', 'Only task', 'open')];
    expect(getDefaultLogPanelTaskId(tasks)).toBe('epic-1.1');
  });
});

const renderEpicLogPanel = (props: { tasks: EpicTask[]; taskLogInfo: Record<string, TaskLogInfo> }) => {
  const RouteComponent = () => <EpicLogPanel {...props} />;
  const Stub = createRoutesStub([{ path: '/', Component: RouteComponent }]);
  return render(<Stub initialEntries={['/']} />);
};

describe('EpicLogPanel', () => {
  it('shows empty state when no tasks', () => {
    renderEpicLogPanel({ tasks: [], taskLogInfo: {} });

    expect(screen.getByRole('heading', { name: 'Task logs' })).toBeInTheDocument();
    expect(screen.getByText('No tasks in this epic')).toBeInTheDocument();
    expect(screen.getByText('Task logs will appear here when the epic has subtasks.')).toBeInTheDocument();
    expect(screen.queryByTestId('log-viewer')).not.toBeInTheDocument();
  });

  it('defaults to in_progress task and shows LogViewer with correct props', () => {
    const tasks: EpicTask[] = [
      baseTask('epic-1.a', 'Task A', 'closed'),
      baseTask('epic-1.b', 'Task B', 'in_progress'),
      baseTask('epic-1.c', 'Task C', 'open'),
    ];
    const taskLogInfo: Record<string, TaskLogInfo> = {
      'epic-1.a': { hasLogs: true, hasExecutionHistory: true },
      'epic-1.b': { hasLogs: false, hasExecutionHistory: true },
      'epic-1.c': { hasLogs: false, hasExecutionHistory: false },
    };

    renderEpicLogPanel({ tasks, taskLogInfo });

    expect(screen.getByRole('heading', { name: 'Task logs' })).toBeInTheDocument();
    const viewer = screen.getByTestId('log-viewer');
    expect(viewer).toHaveAttribute('data-task-id', 'epic-1.b');
    expect(viewer).toHaveAttribute('data-active', 'true');
    expect(viewer).toHaveAttribute('data-has-logs', 'false');
    expect(viewer).toHaveAttribute('data-has-history', 'true');

    const select = screen.getByRole('combobox', { name: /select task to view logs/i });
    expect(select).toBeInTheDocument();
    expect(within(select).getByText(/Task B/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view task/i })).toHaveAttribute('href', '/tasks/epic-1.b');
  });

  it('defaults to first task when no in_progress task', () => {
    const tasks: EpicTask[] = [
      baseTask('epic-1.a', 'Task A', 'closed'),
      baseTask('epic-1.b', 'Task B', 'open'),
    ];
    const taskLogInfo: Record<string, TaskLogInfo> = {
      'epic-1.a': { hasLogs: false, hasExecutionHistory: false },
      'epic-1.b': { hasLogs: false, hasExecutionHistory: false },
    };

    renderEpicLogPanel({ tasks, taskLogInfo });

    const viewer = screen.getByTestId('log-viewer');
    expect(viewer).toHaveAttribute('data-task-id', 'epic-1.a');
  });

  it('renders task selector and View task link for selected task', () => {
    const tasks: EpicTask[] = [
      baseTask('epic-1.a', 'Task A', 'closed'),
      baseTask('epic-1.b', 'Task B', 'in_progress'),
    ];
    const taskLogInfo: Record<string, TaskLogInfo> = {
      'epic-1.a': { hasLogs: true, hasExecutionHistory: true },
      'epic-1.b': { hasLogs: false, hasExecutionHistory: false },
    };

    renderEpicLogPanel({ tasks, taskLogInfo });

    expect(screen.getByTestId('log-viewer')).toHaveAttribute('data-task-id', 'epic-1.b');
    expect(screen.getByRole('combobox', { name: /select task to view logs/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view task/i })).toHaveAttribute('href', '/tasks/epic-1.b');
  });

  it('handles task with no logs (LogViewer shows empty state)', () => {
    const tasks: EpicTask[] = [baseTask('epic-1.x', 'Task X', 'open')];
    const taskLogInfo: Record<string, TaskLogInfo> = {
      'epic-1.x': { hasLogs: false, hasExecutionHistory: false },
    };

    renderEpicLogPanel({ tasks, taskLogInfo });

    expect(screen.getByRole('heading', { name: 'Task logs' })).toBeInTheDocument();
    const viewer = screen.getByTestId('log-viewer');
    expect(viewer).toHaveAttribute('data-task-id', 'epic-1.x');
    expect(viewer).toHaveAttribute('data-has-logs', 'false');
    expect(viewer).toHaveAttribute('data-has-history', 'false');
  });
});
