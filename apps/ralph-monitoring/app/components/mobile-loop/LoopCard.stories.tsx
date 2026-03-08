import type { Meta, StoryObj } from '@storybook/react';
import { LoopCard, type LoopRunStatus } from '~/components/mobile-loop/LoopCard';

const meta = {
  title: 'mobile-loop/LoopCard',
  component: LoopCard,
  parameters: {
    viewport: { defaultViewport: 'mobile375' },
    layout: 'padded'
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['idle', 'running', 'paused', 'stopped'] satisfies LoopRunStatus[]
    }
  }
} satisfies Meta<typeof LoopCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Running: Story = {
  args: {
    title: 'Mobile-First Loop Monitor',
    status: 'running',
    completedCount: 3,
    totalCount: 11,
    currentTaskName: 'Design Exploration',
    lastActivityLabel: '2m ago'
  }
};

export const Paused: Story = {
  args: {
    title: 'Another Epic',
    status: 'paused',
    completedCount: 1,
    totalCount: 8,
    currentTaskName: 'Loop Dashboard',
    lastActivityLabel: '5m ago'
  }
};

export const Idle: Story = {
  args: {
    title: 'Past Epic',
    status: 'idle',
    completedCount: 8,
    totalCount: 8,
    lastActivityLabel: '2h ago'
  }
};

export const Stopped: Story = {
  args: {
    title: 'Stopped run',
    status: 'stopped',
    completedCount: 0,
    totalCount: 5,
    lastActivityLabel: '1h ago'
  }
};

export const LongTitle: Story = {
  args: {
    title: 'Mobile-First Loop Monitor — Design Exploration & Prototype Components',
    status: 'running',
    completedCount: 1,
    totalCount: 11,
    currentTaskName: 'Design task',
    lastActivityLabel: '1m ago'
  }
};

export const DashboardList: Story = {
  args: {
    title: '',
    status: 'idle',
    completedCount: 0,
    totalCount: 1
  },
  render: () => (
    <div className="flex w-full max-w-[375px] flex-col gap-3">
      <LoopCard
        title="Mobile-First Loop Monitor"
        status="running"
        completedCount={3}
        totalCount={11}
        currentTaskName="Design Exploration"
        lastActivityLabel="2m ago"
      />
      <LoopCard
        title="Another Epic"
        status="paused"
        completedCount={1}
        totalCount={8}
        lastActivityLabel="5m ago"
      />
      <LoopCard
        title="Past Epic"
        status="idle"
        completedCount={8}
        totalCount={8}
        lastActivityLabel="2h ago"
      />
    </div>
  ),
  parameters: { viewport: { defaultViewport: 'mobile375' } }
};

export const Dark: Story = {
  args: Running.args,
  parameters: { theme: 'dark' }
};
