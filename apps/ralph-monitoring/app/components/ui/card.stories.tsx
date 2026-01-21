import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';

const meta = {
  title: 'ui/Card',
  component: Card
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Task details</CardTitle>
        <CardDescription>Example content to validate spacing, typography, and borders.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This is a simple card layout used across the app for task list and detail surfaces.
        </p>
      </CardContent>
      <CardFooter className="justify-end gap-[var(--space-2)]">
        <Button variant="outline">Cancel</Button>
        <Button>Save</Button>
      </CardFooter>
    </Card>
  )
};

export const BasicDark: Story = {
  ...Basic,
  parameters: {
    theme: 'dark'
  }
};

export const Default: Story = {
  render: () => (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Run summary</CardTitle>
        <CardDescription>Latest build + verification results.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-[var(--space-2)] text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium">Passed</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Duration</span>
            <span className="font-medium">1m 42s</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Artifacts</span>
            <span className="font-medium">3</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-end gap-[var(--space-2)]">
        <Button variant="secondary">Details</Button>
        <Button>Open</Button>
      </CardFooter>
    </Card>
  )
};
