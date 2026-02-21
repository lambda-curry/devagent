/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRoutesStub } from '~/lib/test-utils/router';
import { ActivityFeed, type ActivityFeedEntry } from '../ActivityFeed';

const entries: ActivityFeedEntry[] = [
  {
    taskId: 'epic-1.task-a',
    taskTitle: 'Implement feature',
    startedAt: '2026-01-30T10:00:00Z',
    status: 'success',
  },
  {
    taskId: 'epic-1.task-b',
    taskTitle: 'QA review',
    startedAt: '2026-01-30T09:30:00Z',
    status: 'failed',
  },
  {
    taskId: 'epic-1.task-c',
    taskTitle: 'Design review',
    startedAt: '2026-01-30T09:00:00Z',
    status: 'running',
  },
];

describe('ActivityFeed', () => {
  it('renders empty state when no entries', () => {
    const Stub = createRoutesStub([
      { path: '/', Component: () => <ActivityFeed entries={[]} /> },
    ]);
    render(<Stub initialEntries={['/']} />);

    expect(screen.getByTestId('activity-feed')).toBeInTheDocument();
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText('No activity yet')).toBeInTheDocument();
  });

  it('renders few entries with relative time, title, and outcome', () => {
    const Stub = createRoutesStub([
      { path: '/', Component: () => <ActivityFeed entries={entries} /> },
    ]);
    render(<Stub initialEntries={['/']} />);

    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText('Implement feature')).toBeInTheDocument();
    expect(screen.getByText('QA review')).toBeInTheDocument();
    expect(screen.getByText('Design review')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /implement feature/i })).toHaveAttribute(
      'href',
      '/tasks/epic-1.task-a'
    );
  });

  it('renders many entries', () => {
    const many = Array.from({ length: 10 }, (_, i) => ({
      taskId: `epic-1.task-${i}`,
      taskTitle: `Task ${i}`,
      startedAt: '2026-01-30T10:00:00Z',
      status: 'success' as const,
    }));
    const Stub = createRoutesStub([
      { path: '/', Component: () => <ActivityFeed entries={many} /> },
    ]);
    render(<Stub initialEntries={['/']} />);

    expect(screen.getByText('Task 0')).toBeInTheDocument();
    expect(screen.getByText('Task 9')).toBeInTheDocument();
  });

  it('truncates long titles when maxTitleLength is set', () => {
    const longTitle = 'A'.repeat(50);
    const Stub = createRoutesStub([
      {
        path: '/',
        Component: () => (
          <ActivityFeed entries={[{ taskId: 'x', taskTitle: longTitle, startedAt: '2026-01-30T10:00:00Z', status: 'success' }]} maxTitleLength={20} />
        ),
      },
    ]);
    render(<Stub initialEntries={['/']} />);

    expect(screen.getByTitle(longTitle)).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('…') && content.startsWith('A'))).toBeInTheDocument();
  });
});
