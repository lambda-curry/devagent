/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { EpicActivityItem } from '~/db/beads.types';
import { EpicCommitList } from '~/components/EpicCommitList';

function commentItemWithCommit(sha: string, message: string): EpicActivityItem {
  return {
    type: 'comment',
    timestamp: '2026-01-30T10:00:00Z',
    task_id: 'epic-1.task-a',
    comment_id: 1,
    author: 'Agent',
    body: `Commit: ${sha} - ${message}`,
    commit: { sha, message },
  };
}

describe('EpicCommitList', () => {
  it('renders empty state when no commits in activity', () => {
    const items: EpicActivityItem[] = [
      {
        type: 'execution',
        timestamp: '2026-01-30T10:00:00Z',
        task_id: 'epic-1.task-a',
        agent_type: 'engineering',
        started_at: '2026-01-30T10:00:00Z',
        ended_at: null,
        status: 'running',
        iteration: 1,
      },
    ];
    render(<EpicCommitList activityItems={items} repoUrl={null} />);
    expect(screen.getByText('Commits')).toBeInTheDocument();
    expect(screen.getByText('No commits recorded for this epic yet.')).toBeInTheDocument();
  });

  it('renders commit list with SHA and message when repoUrl is null', () => {
    const items: EpicActivityItem[] = [
      commentItemWithCommit('deadbeef', 'fix: resolve bug'),
    ];
    render(<EpicCommitList activityItems={items} repoUrl={null} />);
    expect(screen.getByText('Commits')).toBeInTheDocument();
    expect(screen.getByText('deadbee')).toBeInTheDocument();
    expect(screen.getByText('fix: resolve bug')).toBeInTheDocument();
    const link = screen.queryByRole('link', { name: /Commit deadbee on GitHub/i });
    expect(link).not.toBeInTheDocument();
  });

  it('renders commit list with GitHub link when repoUrl is set', () => {
    const items: EpicActivityItem[] = [
      commentItemWithCommit('abc1234', 'feat: add endpoint'),
    ];
    render(
      <EpicCommitList
        activityItems={items}
        repoUrl="https://github.com/org/repo"
      />
    );
    expect(screen.getByText('Commits')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'Commit abc1234 on GitHub' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://github.com/org/repo/commit/abc1234');
    expect(screen.getByText('abc1234')).toBeInTheDocument();
    expect(screen.getByText('feat: add endpoint')).toBeInTheDocument();
  });

  it('strips trailing slash from repoUrl when building commit href', () => {
    const items: EpicActivityItem[] = [
      commentItemWithCommit('abc1234', 'chore: bump'),
    ];
    render(
      <EpicCommitList
        activityItems={items}
        repoUrl="https://github.com/org/repo/"
      />
    );
    const link = screen.getByRole('link', { name: 'Commit abc1234 on GitHub' });
    expect(link).toHaveAttribute('href', 'https://github.com/org/repo/commit/abc1234');
  });
});
