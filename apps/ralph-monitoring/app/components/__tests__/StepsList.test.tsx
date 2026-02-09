/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRoutesStub } from '~/lib/test-utils/router';
import { StepsList } from '../StepsList';
import type { EpicTask } from '~/db/beads.types';

const mockTasks: EpicTask[] = [
  {
    id: 'epic-1.task-a',
    title: 'Task A',
    description: null,
    design: null,
    acceptance_criteria: null,
    notes: null,
    status: 'in_progress',
    priority: null,
    parent_id: 'epic-1',
    created_at: '2026-01-30T10:00:00Z',
    updated_at: '2026-01-30T11:00:00Z',
    agent_type: 'engineering',
  } as EpicTask,
  {
    id: 'epic-1.task-b',
    title: 'Task B',
    description: null,
    design: null,
    acceptance_criteria: null,
    notes: null,
    status: 'closed',
    priority: null,
    parent_id: 'epic-1',
    created_at: '2026-01-30T10:00:00Z',
    updated_at: '2026-01-30T11:00:00Z',
    agent_type: null,
  } as EpicTask,
  {
    id: 'epic-1.task-c',
    title: 'Task C',
    description: null,
    design: null,
    acceptance_criteria: null,
    notes: null,
    status: 'open',
    priority: null,
    parent_id: 'epic-1',
    created_at: '2026-01-30T10:00:00Z',
    updated_at: '2026-01-30T11:00:00Z',
    agent_type: null,
  } as EpicTask,
];

describe('StepsList', () => {
  it('is collapsed by default', () => {
    const Stub = createRoutesStub([
      { path: '/', Component: () => <StepsList tasks={mockTasks} defaultCollapsed /> },
    ]);
    render(<Stub initialEntries={['/']} />);

    expect(screen.getByTestId('steps-list')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /all steps/i })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Task A')).not.toBeInTheDocument();
  });

  it('expands on tap and shows tasks with status chips', async () => {
    const user = userEvent.setup();
    const Stub = createRoutesStub([
      { path: '/', Component: () => <StepsList tasks={mockTasks} defaultCollapsed /> },
    ]);
    render(<Stub initialEntries={['/']} />);

    await user.click(screen.getByRole('button', { name: /all steps/i }));

    expect(screen.getByRole('button', { name: /all steps/i })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Task A')).toBeInTheDocument();
    expect(screen.getByText('Task B')).toBeInTheDocument();
    expect(screen.getByText('Task C')).toBeInTheDocument();
    expect(screen.getByText('Running')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('renders failed chip when taskIdToLastStatus has failed for closed task', async () => {
    const Stub = createRoutesStub([
      {
        path: '/',
        Component: () => (
          <StepsList
            tasks={mockTasks}
            taskIdToLastStatus={{ 'epic-1.task-b': 'failed' }}
            defaultCollapsed={false}
          />
        ),
      },
    ]);
    render(<Stub initialEntries={['/']} />);

    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.getByText('Task B')).toBeInTheDocument();
  });

  it('links each step to task detail', async () => {
    const Stub = createRoutesStub([
      { path: '/', Component: () => <StepsList tasks={mockTasks} defaultCollapsed={false} /> },
    ]);
    render(<Stub initialEntries={['/']} />);

    const linkA = screen.getByRole('link', { name: /task a/i });
    expect(linkA).toHaveAttribute('href', '/tasks/epic-1.task-a');
  });
});
