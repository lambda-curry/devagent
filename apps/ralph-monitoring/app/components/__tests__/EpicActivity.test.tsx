/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { EpicActivityItem } from '~/db/beads.types';
import { EpicActivity } from '~/components/EpicActivity';

const taskIdToTitle: Record<string, string> = {
  'epic-1.task-a': 'Task A',
  'epic-1.task-b': 'Task B',
};

describe('EpicActivity', () => {
  it('renders empty state when no items', () => {
    render(<EpicActivity items={[]} taskIdToTitle={{}} />);
    expect(screen.getByText('Activity')).toBeInTheDocument();
    expect(screen.getByText('No recent activity for this epic.')).toBeInTheDocument();
  });

  it('renders activity items with timestamps and labels', () => {
    const items: EpicActivityItem[] = [
      {
        type: 'execution',
        timestamp: '2026-01-30T10:00:00Z',
        task_id: 'epic-1.task-a',
        agent_type: 'engineering',
        started_at: '2026-01-30T10:00:00Z',
        ended_at: '2026-01-30T10:02:00Z',
        status: 'success',
        iteration: 1,
      },
      {
        type: 'comment',
        timestamp: '2026-01-30T10:05:00Z',
        task_id: 'epic-1.task-a',
        comment_id: 1,
        author: 'Agent',
        body: 'Commit: abc1234 - fix(api): handle null',
        commit: { sha: 'abc1234', message: 'fix(api): handle null' },
      },
      {
        type: 'status',
        timestamp: '2026-01-30T10:10:00Z',
        task_id: 'epic-1.task-a',
        status: 'closed',
        title: 'Task A',
      },
    ];
    render(<EpicActivity items={items} taskIdToTitle={taskIdToTitle} />);
    expect(screen.getByText('Activity')).toBeInTheDocument();
    expect(screen.getByText('Execution')).toBeInTheDocument();
    expect(screen.getByText('Comment')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText(/engineering: Task A \(success\)/)).toBeInTheDocument();
    expect(screen.getByText('fix(api): handle null')).toBeInTheDocument();
    expect(screen.getByText('Task A → closed')).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Recent activity' })).toBeInTheDocument();
  });
});
