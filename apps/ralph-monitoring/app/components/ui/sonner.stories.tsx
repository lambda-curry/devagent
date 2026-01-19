import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import { Toaster } from '~/components/ui/sonner';

function ToastDemo() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Click the button to trigger a toast. This verifies Sonner + theme styling in Storybook.
      </p>
      <Button
        type="button"
        onClick={() => toast.success('Saved!', { description: 'Task updated successfully.' })}
      >
        Show toast
      </Button>
      <Toaster />
    </div>
  );
}

const meta = {
  title: 'ui/Sonner',
  component: ToastDemo
} satisfies Meta<typeof ToastDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Interaction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /show toast/i }));

    const body = within(document.body);
    await expect(await body.findByText('Saved!')).toBeInTheDocument();
  }
};
