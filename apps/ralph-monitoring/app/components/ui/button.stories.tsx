import type { Meta, StoryObj } from '@storybook/react';
import { ArrowRight, Trash2 } from 'lucide-react';
import { expect, userEvent, within } from '@storybook/test';
import { Link } from 'react-router';

import { Button } from '~/components/ui/button';

const meta = {
  title: 'ui/Button',
  component: Button,
  args: {
    children: 'Button'
  }
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Dark: Story = {
  parameters: {
    theme: 'dark'
  }
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-[var(--space-3)]">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button variant="destructive">
        <Trash2 />
        Destructive
      </Button>
      <Button disabled>Disabled</Button>
    </div>
  )
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-[var(--space-3)]">
      <Button size="sm">Small</Button>
      <Button>Default</Button>
      <Button size="lg">
        Continue
        <ArrowRight />
      </Button>
      <Button size="icon" aria-label="Icon button">
        <ArrowRight />
      </Button>
    </div>
  )
};

export const AsChildLink: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-[var(--space-3)]">
      <Button asChild variant="link">
        <Link to="/tasks/123" prefetch="intent">
          View task
        </Link>
      </Button>
      <Button asChild variant="outline">
        <Link to="/tasks/123" prefetch="intent">
          Open details
        </Link>
      </Button>
    </div>
  )
};

export const AsChildLinkDark: Story = {
  ...AsChildLink,
  parameters: {
    theme: 'dark'
  }
};

export const Interaction: Story = {
  args: {
    children: 'Focusable button'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /focusable button/i });

    await userEvent.tab();
    await expect(button).toHaveFocus();

    await userEvent.click(button);
    await expect(button).toBeEnabled();
  }
};
