import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';

function SelectDemo() {
  const [value, setValue] = useState('all');
  return (
    <div className="max-w-xs">
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger aria-label="Status">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="open">Open</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
          <SelectItem value="blocked">Blocked</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

const meta = {
  title: 'ui/Select',
  component: SelectDemo
} satisfies Meta<typeof SelectDemo>;

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
    const trigger = canvas.getByRole('combobox', { name: /status/i });

    // Keyboard-only path: tab to focus, open with Enter, arrows to navigate, Enter to select.
    // Note: Select content is portaled, so query against document.body.
    const body = canvasElement.ownerDocument.body;

    await user.tab();
    await expect(trigger).toHaveFocus();

    // Open with Enter and select "Blocked" via ArrowDown + Enter.
    await user.keyboard('{Enter}');
    const allOption = await within(body).findByRole('option', { name: /^all$/i }, { timeout: 3000 });
    await expect(allOption).toHaveFocus();

    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}');
    const blockedOption = within(body).getByRole('option', { name: /^blocked$/i });
    await expect(blockedOption).toHaveFocus();

    await user.keyboard('{Enter}');
    await expect(within(body).queryByRole('option', { name: /^blocked$/i })).not.toBeInTheDocument();

    await expect(trigger).toHaveTextContent(/blocked/i);
    await expect(trigger).toHaveFocus();

    // Re-open with Enter and select "Open" via ArrowUp + Enter.
    await user.keyboard('{Enter}');
    const blockedOption2 = await within(body).findByRole('option', { name: /^blocked$/i }, { timeout: 3000 });
    await expect(blockedOption2).toHaveFocus();

    await user.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}');
    const openOption = within(body).getByRole('option', { name: /^open$/i });
    await expect(openOption).toHaveFocus();

    await user.keyboard('{Enter}');
    await expect(within(body).queryByRole('option', { name: /^open$/i })).not.toBeInTheDocument();

    await expect(trigger).toHaveTextContent(/open/i);
    await expect(trigger).not.toHaveTextContent(/blocked/i);
    await expect(trigger).toHaveFocus();
  }
};
