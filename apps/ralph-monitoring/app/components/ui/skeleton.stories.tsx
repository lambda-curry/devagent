import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from '~/components/ui/skeleton';
import { Card, CardContent } from '~/components/ui/card';

const meta = {
  title: 'ui/Skeleton',
  component: Skeleton,
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Shapes: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
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
