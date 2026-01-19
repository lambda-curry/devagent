import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { EmptyState } from '~/components/EmptyState';

const meta = {
  title: 'components/EmptyState',
  component: EmptyState,
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoTasks: Story = {
  args: {
    hasFilters: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/no tasks yet/i)).toBeInTheDocument();
  }
};

export const NoMatches: Story = {
  args: {
    hasFilters: true,
  }
};
