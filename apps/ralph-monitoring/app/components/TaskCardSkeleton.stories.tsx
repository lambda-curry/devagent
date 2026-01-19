import type { Meta, StoryObj } from '@storybook/react';
import { TaskCardSkeleton } from '~/components/TaskCardSkeleton';

const meta = {
  title: 'components/TaskCardSkeleton',
  component: TaskCardSkeleton,
} satisfies Meta<typeof TaskCardSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
