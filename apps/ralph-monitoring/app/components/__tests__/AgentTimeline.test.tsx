/** @vitest-environment jsdom */
import type React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import type { RalphExecutionLog } from '~/db/beads.types';
import { AgentTimeline } from '~/components/AgentTimeline';

const baseTime = new Date('2026-01-30T12:00:00Z').getTime();

const mockLogs: RalphExecutionLog[] = [
  {
    task_id: 'devagent-a.1',
    agent_type: 'engineering',
    started_at: new Date(baseTime).toISOString(),
    ended_at: new Date(baseTime + 60_000).toISOString(),
    status: 'success',
    iteration: 1,
    log_file_path: null,
  },
  {
    task_id: 'devagent-a.2',
    agent_type: 'qa',
    started_at: new Date(baseTime + 30_000).toISOString(),
    ended_at: new Date(baseTime + 90_000).toISOString(),
    status: 'failed',
    iteration: 1,
    log_file_path: null,
  },
];

const taskIdToTitle: Record<string, string> = {
  'devagent-a.1': 'Task One',
  'devagent-a.2': 'Task Two',
};

function renderWithRouter(ui: React.ReactElement): ReturnType<typeof render> {
  const router = createMemoryRouter(
    [{ path: '/', element: ui }],
    { initialEntries: ['/'], initialIndex: 0 }
  );
  return render(<RouterProvider router={router} />);
}

describe('AgentTimeline', () => {
  it('renders empty state when no logs', () => {
    renderWithRouter(<AgentTimeline logs={[]} taskIdToTitle={{}} />);
    expect(screen.getByLabelText('No agent activity')).toBeInTheDocument();
    expect(screen.getByText('No agent activity to display.')).toBeInTheDocument();
  });

  it('renders one row per agent type with blocks', () => {
    renderWithRouter(<AgentTimeline logs={mockLogs} taskIdToTitle={taskIdToTitle} />);
    expect(screen.getByTestId('timeline-row-engineering')).toBeInTheDocument();
    expect(screen.getByTestId('timeline-row-qa')).toBeInTheDocument();
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', '/tasks/devagent-a.1');
    expect(links[1]).toHaveAttribute('href', '/tasks/devagent-a.2');
  });

  it('labels blocks with task title for accessibility', () => {
    renderWithRouter(<AgentTimeline logs={mockLogs} taskIdToTitle={taskIdToTitle} />);
    const firstLink = screen.getByRole('link', { name: /Task One.*Success.*Go to task/i });
    expect(firstLink).toBeInTheDocument();
  });
});
