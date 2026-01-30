/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EpicProgress, estimateTimeRemainingMs } from '../EpicProgress';
import type { BeadsTask, EpicSummary, EpicTask } from '~/db/beads.types';

describe('estimateTimeRemainingMs', () => {
  it('returns null when no tasks remaining', () => {
    expect(estimateTimeRemainingMs(5, 5, [1000, 2000])).toBeNull();
    expect(estimateTimeRemainingMs(3, 3, [1000])).toBeNull();
  });

  it('returns null when no completed tasks have duration', () => {
    expect(estimateTimeRemainingMs(5, 2, [])).toBeNull();
  });

  it('returns remaining * avg duration when some completed tasks have duration', () => {
    // 5 total, 2 completed, 3 remaining. Avg of [60_000, 120_000] = 90_000. 3 * 90_000 = 270_000
    expect(estimateTimeRemainingMs(5, 2, [60_000, 120_000])).toBe(270_000);
  });

  it('uses only valid positive durations', () => {
    // 4 total, 1 completed, 3 remaining. Valid durations: [100_000]. Avg = 100_000. 3 * 100_000 = 300_000
    expect(estimateTimeRemainingMs(4, 1, [100_000, -1, 0])).toBe(300_000);
  });

  it('rounds to integer', () => {
    // 3 total, 1 completed, 2 remaining. Avg of [100, 201] = 150.5. 2 * 150.5 = 301
    expect(estimateTimeRemainingMs(3, 1, [100, 201])).toBe(301);
  });
});

const mockEpic: BeadsTask = {
  id: 'epic-1',
  title: 'Test Epic',
  description: 'Epic description text',
  design: null,
  acceptance_criteria: null,
  notes: null,
  status: 'in_progress',
  priority: 'P1',
  parent_id: null,
  created_at: '2026-01-30T10:00:00Z',
  updated_at: '2026-01-30T12:00:00Z',
};

const mockSummary: EpicSummary = {
  id: 'epic-1',
  title: 'Test Epic',
  status: 'in_progress',
  task_count: 4,
  completed_count: 2,
  progress_pct: 50,
  updated_at: '2026-01-30T12:00:00Z',
};

const mockTasks: EpicTask[] = [
  {
    ...mockEpic,
    agent_type: 'project-manager',
    duration_ms: 60_000,
  },
  {
    id: 'epic-1.a',
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
    id: 'epic-1.b',
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

describe('EpicProgress component', () => {
  it('renders epic description when present', () => {
    render(<EpicProgress epic={mockEpic} summary={mockSummary} tasks={mockTasks} />);
    expect(screen.getByText('Epic description text')).toBeInTheDocument();
  });

  it('renders task count and progress bar', () => {
    render(<EpicProgress epic={mockEpic} summary={mockSummary} tasks={mockTasks} />);
    expect(screen.getByText('2 of 4 tasks completed')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: '50%' })).toBeInTheDocument();
  });

  it('renders estimated time remaining when computable', () => {
    render(<EpicProgress epic={mockEpic} summary={mockSummary} tasks={mockTasks} />);
    // 2 remaining; only task A is closed with duration 120_000. 2 * 120_000 = 240_000 ms = "4m 0s"
    expect(screen.getByText(/Estimated time remaining:/)).toBeInTheDocument();
    expect(screen.getByText(/4m/)).toBeInTheDocument();
  });

  it('renders task list with status, duration, and agent type', () => {
    render(<EpicProgress epic={mockEpic} summary={mockSummary} tasks={mockTasks} />);
    expect(screen.getByText('Task A')).toBeInTheDocument();
    expect(screen.getByText('Task B')).toBeInTheDocument();
    expect(screen.getByText('Closed')).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('engineering')).toBeInTheDocument();
    // Task A duration 120_000 ms = 2m 0s
    expect(screen.getByText(/2m/)).toBeInTheDocument();
  });

  it('does not render description block when epic has no description', () => {
    const epicNoDesc = { ...mockEpic, description: null };
    render(<EpicProgress epic={epicNoDesc} summary={mockSummary} tasks={mockTasks} />);
    expect(screen.queryByText('Epic description text')).not.toBeInTheDocument();
  });

  it('does not render estimated time when no completed durations', () => {
    const tasksNoDuration = mockTasks.map((t) => ({ ...t, duration_ms: null as number | null }));
    render(<EpicProgress epic={mockEpic} summary={mockSummary} tasks={tasksNoDuration} />);
    expect(screen.queryByText(/Estimated time remaining:/)).not.toBeInTheDocument();
  });
});
