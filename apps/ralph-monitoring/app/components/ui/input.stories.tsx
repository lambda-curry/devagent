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

export const Dark: Story = {
  parameters: {
    theme: 'dark'
  }
};

export const Interaction: Story = {
  play: async ({ canvasElement }) => {
    const user = userEvent.setup({ document: canvasElement.ownerDocument });
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: /search/i });

    input.blur();
    await user.tab();
    await expect(input).toHaveFocus();

    await user.clear(input);
    await user.type(input, 'devagent-20e9.4');
    await expect(input).toHaveValue('devagent-20e9.4');
  }
};
