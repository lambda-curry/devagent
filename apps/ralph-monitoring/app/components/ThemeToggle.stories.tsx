import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { ThemeToggle } from '~/components/ThemeToggle';

const meta = {
  title: 'components/ThemeToggle',
  component: ThemeToggle,
  parameters: {
    // Uses next-themes (and a mounted gate) so it's not a great candidate for deterministic play tests.
    docs: { description: { component: 'Toggles app theme via `next-themes`.' } }
  }
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Interaction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: /toggle theme/i });

    // ThemeToggle renders a disabled placeholder until mounted.
    await waitFor(() => expect(toggle).toBeEnabled());

    await userEvent.click(toggle);
    await expect(toggle).toBeEnabled();
  }
};
