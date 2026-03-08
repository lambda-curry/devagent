import type { Meta, StoryObj } from '@storybook/react';
import { ActivityRow, type ActivityOutcome } from '~/components/mobile-loop/ActivityRow';

const meta = {
  title: 'mobile-loop/ActivityRow',
  component: ActivityRow,
  parameters: {
    viewport: { defaultViewport: 'mobile375' },
    layout: 'padded'
  },
  argTypes: {
    outcome: {
      control: 'select',
      options: ['done', 'failed', 'skipped'] satisfies ActivityOutcome[]
    }
  }
} satisfies Meta<typeof ActivityRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Done: Story = {
  args: {
    timeLabel: '2m ago',
    taskTitle: 'Design Exploration — Mobile Loop Monitor',
    outcome: 'done'
  }
};

export const Failed: Story = {
  args: {
    timeLabel: '5m ago',
    taskTitle: 'QA: Loop Dashboard',
    outcome: 'failed'
  }
};

export const Skipped: Story = {
  args: {
    timeLabel: '12m ago',
    taskTitle: 'Setup PR',
    outcome: 'skipped'
  }
};

export const LongTitle: Story = {
  args: {
    timeLabel: '1m ago',
    taskTitle: 'Design Exploration — Mobile Loop Monitor Layout & Components (truncated on mobile)',
    outcome: 'done'
  }
};

export const Feed: Story = {
  args: { timeLabel: '', taskTitle: '', outcome: 'done' },
  render: () => (
    <div className="w-full max-w-[375px] rounded-lg border border-border bg-card">
      <ActivityRow timeLabel="2m ago" taskTitle="Design task" outcome="done" />
      <ActivityRow timeLabel="5m ago" taskTitle="QA: Loop Dashboard" outcome="done" />
      <ActivityRow timeLabel="12m ago" taskTitle="Setup PR" outcome="skipped" />
      <ActivityRow timeLabel="18m ago" taskTitle="Integration Polish" outcome="failed" />
    </div>
  ),
  parameters: { viewport: { defaultViewport: 'mobile375' } }
};
