import type { Meta, StoryObj } from '@storybook/react';
import { expect, within, userEvent } from '@storybook/test';
import type { RalphExecutionLog } from '~/db/beads.types';
import { AgentTimeline } from '~/components/AgentTimeline';

const baseTime = new Date('2026-01-30T12:00:00Z').getTime();

function makeLog(
  overrides: Partial<RalphExecutionLog> & { task_id: string; agent_type: string; started_at: string; status: RalphExecutionLog['status'] }
): RalphExecutionLog {
  return {
    task_id: overrides.task_id,
    agent_type: overrides.agent_type,
    started_at: overrides.started_at,
    ended_at: overrides.ended_at ?? null,
    status: overrides.status,
    iteration: overrides.iteration ?? 1,
  };
}

const mockLogs: RalphExecutionLog[] = [
  makeLog({
    task_id: 'devagent-ralph-dashboard-2026-01-30.timeline-component',
    agent_type: 'engineering',
    started_at: new Date(baseTime).toISOString(),
    ended_at: new Date(baseTime + 120_000).toISOString(),
    status: 'success',
  }),
  makeLog({
    task_id: 'devagent-ralph-dashboard-2026-01-30.timeline-design',
    agent_type: 'design',
    started_at: new Date(baseTime + 30_000).toISOString(),
    ended_at: new Date(baseTime + 90_000).toISOString(),
    status: 'success',
  }),
  makeLog({
    task_id: 'devagent-ralph-dashboard-2026-01-30.control-api',
    agent_type: 'engineering',
    started_at: new Date(baseTime + 130_000).toISOString(),
    ended_at: new Date(baseTime + 200_000).toISOString(),
    status: 'failed',
  }),
  makeLog({
    task_id: 'devagent-ralph-dashboard-2026-01-30.control-panel-qa',
    agent_type: 'qa',
    started_at: new Date(baseTime + 150_000).toISOString(),
    ended_at: null,
    status: 'running',
  }),
];

const mockTaskIdToTitle: Record<string, string> = {
  'devagent-ralph-dashboard-2026-01-30.timeline-component': 'Create Timeline Component',
  'devagent-ralph-dashboard-2026-01-30.timeline-design': 'Design Review: Timeline Component',
  'devagent-ralph-dashboard-2026-01-30.control-api': 'Create Control API Routes',
  'devagent-ralph-dashboard-2026-01-30.control-panel-qa': 'QA: Control Panel UI',
};

const meta = {
  title: 'components/AgentTimeline',
  component: AgentTimeline,
  argTypes: {
    logs: { control: false },
    taskIdToTitle: { control: false },
  },
} satisfies Meta<typeof AgentTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    logs: mockLogs,
    taskIdToTitle: mockTaskIdToTitle,
  },
};

export const Empty: Story = {
  args: {
    logs: [],
    taskIdToTitle: {},
  },
};

export const SingleAgent: Story = {
  args: {
    logs: mockLogs.filter((l) => l.agent_type === 'engineering'),
    taskIdToTitle: mockTaskIdToTitle,
  },
};

export const HoverShowsTooltip: Story = {
  args: {
    logs: mockLogs,
    taskIdToTitle: mockTaskIdToTitle,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const row = canvas.getByTestId('timeline-row-engineering');
    const firstBlock = row.querySelector('a');
    if (!firstBlock) throw new Error('No block link found');
    await userEvent.hover(firstBlock);
    await expect(canvasElement.querySelector('[role="tooltip"]')).toBeInTheDocument();
    const tooltip = canvasElement.querySelector('[role="tooltip"]');
    await expect(tooltip).toHaveTextContent(/Create Timeline Component|Success/);
  },
};

export const ClickNavigatesToTask: Story = {
  args: {
    logs: mockLogs,
    taskIdToTitle: mockTaskIdToTitle,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const row = canvas.getByTestId('timeline-row-engineering');
    const firstBlock = row.querySelector('a');
    if (!firstBlock) throw new Error('No block link found');
    await expect(firstBlock).toHaveAttribute(
      'href',
      '/tasks/devagent-ralph-dashboard-2026-01-30.timeline-component'
    );
  },
};

/** All three statuses (success, failed, running) for design review: colors, spacing, tooltips. Review in light and dark theme. */
export const AllStatuses: Story = {
  args: {
    logs: mockLogs,
    taskIdToTitle: mockTaskIdToTitle,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Use this story to verify design consistency: semantic block colors (muted=success, destructive=failed, primary=running), 4px grid spacing, tooltip readability, and focus/hover ring.',
      },
    },
  },
};
