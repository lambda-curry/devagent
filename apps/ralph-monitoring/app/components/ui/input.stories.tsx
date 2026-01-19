import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Input } from '~/components/ui/input';

const meta = {
  title: 'ui/Input',
  component: Input,
  args: {
    placeholder: 'Type here…',
    'aria-label': 'Search'
  }
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Interaction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText(/search/i);

    await userEvent.clear(input);
    await userEvent.type(input, 'devagent-20e9.4');
    await expect(input).toHaveValue('devagent-20e9.4');
  }
};
