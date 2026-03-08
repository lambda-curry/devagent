import type { Meta, StoryObj } from '@storybook/react';
import { StepChip, type StepStatus } from '~/components/mobile-loop/StepChip';

const meta = {
  title: 'mobile-loop/StepChip',
  component: StepChip,
  parameters: {
    viewport: { defaultViewport: 'mobile375' },
    layout: 'padded'
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['pending', 'running', 'done', 'failed', 'skipped'] satisfies StepStatus[]
    },
    label: { control: 'text' }
  }
} satisfies Meta<typeof StepChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Pending: Story = {
  args: { status: 'pending', label: 'Design Exploration' }
};

export const Running: Story = {
  args: { status: 'running', label: 'Loop Dashboard' }
};

export const Done: Story = {
  args: { status: 'done', label: 'QA: Loop Dashboard' }
};

export const Failed: Story = {
  args: { status: 'failed', label: 'Setup PR' }
};

export const Skipped: Story = {
  args: { status: 'skipped', label: 'Skipped task' }
};

export const AllStatuses: Story = {
  args: { status: 'pending', label: '' },
  render: () => (
    <div className="flex flex-wrap gap-2">
      <StepChip status="pending" label="Pending" />
      <StepChip status="running" label="Running" />
      <StepChip status="done" label="Done" />
      <StepChip status="failed" label="Failed" />
      <StepChip status="skipped" label="Skipped" />
    </div>
  ),
  parameters: { viewport: { defaultViewport: 'mobile375' } }
};

export const LongLabel: Story = {
  args: { status: 'done', label: 'Design Exploration — Mobile Loop Monitor Layout & Components' }
};
