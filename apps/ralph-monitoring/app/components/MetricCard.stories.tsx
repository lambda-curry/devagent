import type { Meta, StoryObj } from '@storybook/react';
import { MetricCard } from '~/components/MetricCard';

const meta = {
  title: 'components/MetricCard',
  component: MetricCard,
  argTypes: {
    title: { control: 'text' },
    value: { control: 'text' },
    subtitle: { control: 'text' }
  }
} satisfies Meta<typeof MetricCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Tasks complete',
    value: '12'
  }
};

export const WithSubtitle: Story = {
  args: {
    title: 'Time elapsed',
    value: '2h 34m',
    subtitle: 'Last run'
  }
};

export const TasksComplete: Story = {
  args: {
    title: 'Tasks complete',
    value: '6',
    subtitle: 'of 25 in epic'
  }
};

export const TimeElapsed: Story = {
  args: {
    title: 'Time elapsed',
    value: '1h 12m',
    subtitle: 'Current session'
  }
};

export const RunStatus: Story = {
  args: {
    title: 'Status',
    value: 'Running',
    subtitle: '3 agents active'
  }
};

export const Grid: Story = {
  args: { title: '', value: '' },
  render: () => (
    <div className="grid max-w-2xl grid-cols-2 gap-4">
      <MetricCard title="Tasks complete" value="6" subtitle="of 25" />
      <MetricCard title="Time elapsed" value="1h 12m" subtitle="This run" />
      <MetricCard title="Closed" value="4" subtitle="Last 24h" />
      <MetricCard title="In progress" value="1" subtitle="Current" />
    </div>
  )
};
