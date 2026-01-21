import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardContent } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';

const meta = {
  title: 'ui/Skeleton',
  component: Skeleton,
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Shapes: Story = {
  render: () => (
    <div className="grid w-full max-w-md gap-[var(--space-3)]">
      <div className="flex items-center gap-[var(--space-3)]">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="grid flex-1 gap-[var(--space-2)]">
          <Skeleton className="h-4 w-[60%]" />
          <Skeleton className="h-4 w-[40%]" />
        </div>
      </div>
      <Skeleton className="h-24 w-full" />
    </div>
  )
};

export const InCard: Story = {
  render: () => (
    <Card className="max-w-md">
      <CardContent className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
    </Card>
  )
};
